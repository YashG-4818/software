import { NextResponse } from 'next/server';
import { getBus } from '@/lib/bus-data';
import { getTripState } from '@/lib/trip-state';

export function GET(request: Request) {
  const vehicleId = new URL(request.url).searchParams.get('vehicleId') || 'BUS-101';
  const bus = getBus(vehicleId);
  const tripState = getTripState();
  const route = bus.route;
  const departure = new Date(tripState.scheduledDeparture).getTime();
  const arrival = new Date(tripState.scheduledArrival).getTime() + tripState.delayMinutes * 60_000;
  const now = Date.now();
  const isActiveTrip = tripState.vehicleId === vehicleId && ['RUNNING', 'DELAYED'].includes(tripState.status);
  const simulationStartedAt = tripState.startedAt ? new Date(tripState.startedAt).getTime() : tripState.updatedAt ? new Date(tripState.updatedAt).getTime() : now;
  const simulationDuration = Math.max(arrival - departure, 15 * 60_000);
  const progress = isActiveTrip
    ? Math.max(0, Math.min((now - simulationStartedAt) / simulationDuration, 0.99))
    : tripState.vehicleId === vehicleId && tripState.status === 'COMPLETED' ? 1 : 0;
  const segment = Math.min(Math.floor(progress * (route.length - 1)), route.length - 2);
  const segmentProgress = (progress * (route.length - 1)) % 1;
  const start = route[segment];
  const end = route[segment + 1];
  const currentRouteStopIndex = Math.min(Math.floor(progress * route.length), route.length - 1);
  const distanceRemaining = Math.max(0, Math.round((1 - progress) * (bus.routeDistanceKm ?? 100)));
  const remainingMinutes = Math.max(0, Math.round((arrival - now) / 60_000));

  return NextResponse.json({
    vehicleId: bus.vehicleId,
    registrationNumber: bus.registrationNumber,
    tripId: `TRIP-${bus.vehicleId}`,
    status: tripState.vehicleId === vehicleId ? tripState.status : 'SCHEDULED',
    liveTrackingAvailable: tripState.vehicleId === vehicleId && tripState.liveTrackingAvailable,
    currentStop: tripState.vehicleId === vehicleId ? tripState.stops[Math.min(currentRouteStopIndex, tripState.stops.length - 1)] : start.name,
    boardedCount: tripState.vehicleId === vehicleId ? tripState.passengers.filter((passenger) => passenger.boarded).length : 0,
    latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
    longitude: start.longitude + (end.longitude - start.longitude) * segmentProgress,
    route,
    progress: Math.round(progress * 100),
    activeSpeedKph: Math.round(48 + progress * 14),
    distanceRemainingKm: distanceRemaining,
    nextStopEtaMinutes: remainingMinutes,
    scheduledArrival: new Date(arrival).toISOString(),
    delayMinutes: tripState.delayMinutes,
    delayReason: tripState.delayReason,
    updatedAt: new Date().toISOString(),
    source: 'Local GTFS simulation',
  });
}
