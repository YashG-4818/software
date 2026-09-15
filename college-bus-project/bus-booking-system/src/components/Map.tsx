"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const busIcon = L.divIcon({
  className: 'live-bus-marker',
  html: '<span class="live-bus-marker__pulse"></span><span class="live-bus-marker__body">BUS</span>',
  iconSize: [54, 54],
  iconAnchor: [27, 27],
});

function KeepRouteInView({ route }: { route: [number, number][] }) {
  const map = useMap();
  const fittedRoute = useRef('');

  useEffect(() => {
    const routeKey = route.map(([latitude, longitude]) => `${latitude},${longitude}`).join('|');
    if (route.length > 1 && routeKey !== fittedRoute.current) {
      map.fitBounds(route, { padding: [42, 42], maxZoom: 11 });
      fittedRoute.current = routeKey;
    }
  }, [map, route]);

  useEffect(() => {
    const resize = () => map.invalidateSize();
    const timer = window.setTimeout(resize, 100);
    window.addEventListener('resize', resize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', resize);
    };
  }, [map]);

  return null;
}

export default function LiveMap({ vehicleId = 'BUS-101' }: { vehicleId?: string }) {
  const [currentBusLocation, setCurrentBusLocation] = useState<[number, number]>([30.3398, 76.3869]);
  const [targetBusLocation, setTargetBusLocation] = useState<[number, number]>([30.3398, 76.3869]);
  const [trackingData, setTrackingData] = useState<{ registrationNumber: string; currentStop: string; updatedAt: string; route: { name: string; latitude: number; longitude: number }[] } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const updateLocation = async () => {
      try {
        const response = await fetch(`/api/tracking?vehicleId=${encodeURIComponent(vehicleId)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Tracking feed unavailable');
        const data = await response.json();
        if (isMounted) {
          setTargetBusLocation([data.latitude, data.longitude]);
          setTrackingData(data);
        }
      } catch {
        // Keep the last known coordinate visible during a temporary feed failure.
      }
    };
    updateLocation();
    const intervalId = window.setInterval(updateLocation, 5000);
    return () => { isMounted = false; window.clearInterval(intervalId); };
  }, [vehicleId]);

  useEffect(() => {
    let animationFrame = 0;
    const startedAt = performance.now();
    const start = currentBusLocation;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 4500, 1);
      const eased = progress * (2 - progress);
      setCurrentBusLocation([
        start[0] + (targetBusLocation[0] - start[0]) * eased,
        start[1] + (targetBusLocation[1] - start[1]) * eased,
      ]);
      if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [targetBusLocation]);

  const routePositions = useMemo(
    () => trackingData?.route.map((stop) => [stop.latitude, stop.longitude] as [number, number]) ?? [],
    [trackingData],
  );

  return (
    <MapContainer 
      center={currentBusLocation}
      zoom={11} 
      className="live-tracking-map"
      style={{ height: '100%', minHeight: '420px', width: '100%', borderRadius: '1.5rem', zIndex: 10 }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; Esri, HERE, Garmin, FAO, NOAA, USGS'
      />
      
      <KeepRouteInView route={routePositions} />

      <Polyline positions={routePositions} color="#2563eb" weight={8} opacity={0.18} />
      <Polyline positions={routePositions} color="#2563eb" weight={4} opacity={0.9} />
      
      {trackingData?.route.map((stop, index) => <Marker key={stop.name} position={[stop.latitude, stop.longitude]} icon={customIcon}><Popup>{stop.name} ({index === 0 ? 'Source' : index === trackingData.route.length - 1 ? 'Destination' : 'Stop'})</Popup></Marker>)}
      
      <Marker position={currentBusLocation} icon={busIcon}>
        <Popup>
          <div className="font-sans">
            <strong>Bus {trackingData?.registrationNumber || 'PB-10-AB-1234'}</strong><br/>
            Status: <span className="text-green-600 font-bold">Running</span><br/>
            Next stop: {trackingData?.currentStop || 'Rajpura'}<br/>
            Updated: {trackingData ? new Date(trackingData.updatedAt).toLocaleTimeString() : 'connecting'}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}