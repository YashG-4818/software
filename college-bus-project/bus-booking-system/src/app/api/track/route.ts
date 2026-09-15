import { NextResponse } from 'next/server';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Delhi Open Transit Data real-time endpoint
    // If you have your API key, append: ?key=YOUR_API_KEY
    const endpoint = 'https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb';
    
    const response = await fetch(endpoint, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/x-protobuf',
      },
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    // Filter valid entities containing GPS points and parse
    const liveVehicles = feed.entity
      .filter(entity => entity.vehicle?.position?.latitude && entity.vehicle?.position?.longitude)
      .slice(0, 60)
      .map(entity => ({
        id: entity.id || entity.vehicle?.vehicle?.id || 'BUS-LIVE',
        label: entity.vehicle?.vehicle?.label || entity.vehicle?.vehicle?.id || 'DTC Express',
        lat: entity.vehicle?.position?.latitude as number,
        lng: entity.vehicle?.position?.longitude as number,
        speed: Math.round((entity.vehicle?.position?.speed || 0) * 3.6), // Convert m/s to km/h
        bearing: entity.vehicle?.position?.bearing || 0,
        timestamp: entity.vehicle?.timestamp ? Number(entity.vehicle.timestamp) * 1000 : Date.now(),
      }));

    return NextResponse.json({
      success: true,
      source: 'Delhi OTD GTFS-RT',
      count: liveVehicles.length,
      buses: liveVehicles,
    });
  } catch {
    // Fallback interpolator to keep UI active if upstream rate-limits or blocks unauthenticated calls
    const baseTime = Date.now() / 3000;
    const fallbackFleet = [
      { id: 'DL-1PB-5412', label: 'Route 502 (Mehrauli)', lat: 28.5245 + Math.sin(baseTime) * 0.005, lng: 77.1855 + Math.cos(baseTime) * 0.005, speed: 38, bearing: 45, timestamp: Date.now() },
      { id: 'DL-1PC-9921', label: 'Route 427 (Kashmere Gate)', lat: 28.6675 + Math.cos(baseTime) * 0.004, lng: 77.2285 + Math.sin(baseTime) * 0.004, speed: 42, bearing: 180, timestamp: Date.now() },
      { id: 'DL-1PD-3304', label: 'Route 761 (ISBT Anand Vihar)', lat: 28.6469 + Math.sin(baseTime * 0.8) * 0.006, lng: 77.3160 + Math.cos(baseTime * 0.8) * 0.006, speed: 51, bearing: 90, timestamp: Date.now() },
      { id: 'DL-5CQ-8819', label: 'Airport Express 4', lat: 28.5562 + Math.cos(baseTime * 1.2) * 0.007, lng: 77.0999 + Math.sin(baseTime * 1.2) * 0.007, speed: 58, bearing: 270, timestamp: Date.now() }
    ];

    return NextResponse.json({
      success: true,
      source: 'Simulation (Active Feed Fallback)',
      count: fallbackFleet.length,
      buses: fallbackFleet,
    });
  }
}
