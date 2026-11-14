"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockRoute, initialMockUsers } from '@/data/mockData';

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

const demoIcon = L.divIcon({
  className: 'live-demo-marker',
  html: '<span class="live-demo-marker__pulse"></span><span class="live-demo-marker__body">LIVE</span>',
  iconSize: [54, 54],
  iconAnchor: [27, 27],
});

function KeepRouteInView({ route }: { route: [number, number][] }) {
  const map = useMap();
  const fittedRoute = useRef('');

  useEffect(() => {
    const routeKey = route.map(([latitude, longitude]) => `${latitude},${longitude}`).join('|');
    if (route.length > 1 && routeKey !== fittedRoute.current) {
      map.fitBounds(route, { padding: [42, 42], maxZoom: 14 });
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

type LiveMapProps = {
  vehicleId?: string;
  demoMode?: boolean;
  demoUserId?: string;
  demoUserName?: string;
  demoRouteIndex?: number;
};

export default function LiveMap({
  vehicleId = 'BUS-101',
  demoMode = false,
  demoUserId = initialMockUsers[0].id,
  demoUserName,
  demoRouteIndex = 0,
}: LiveMapProps) {
  const selectedUser = initialMockUsers.find((user) => user.id === demoUserId) ?? {
    ...initialMockUsers[0],
    id: demoUserId,
    name: demoUserName || initialMockUsers[0].name,
    routeIndex: Math.max(0, Math.min(demoRouteIndex, mockRoute.length - 1)),
  };
  const [currentBusLocation, setCurrentBusLocation] = useState<[number, number]>([30.3398, 76.3869]);
  const currentBusLocationRef = useRef(currentBusLocation);
  const [targetBusLocation, setTargetBusLocation] = useState<[number, number]>([30.3398, 76.3869]);
  const [trackingData, setTrackingData] = useState<{ registrationNumber: string; currentStop: string; updatedAt: string; route: { name: string; latitude: number; longitude: number }[] } | null>(null);
  const [demoIndex, setDemoIndex] = useState(selectedUser.routeIndex);
  const [demoLocation, setDemoLocation] = useState<[number, number]>([mockRoute[selectedUser.routeIndex].lat, mockRoute[selectedUser.routeIndex].lng]);
  const demoLocationRef = useRef(demoLocation);

  useEffect(() => {
    if (!demoMode) return;
    const intervalId = window.setInterval(() => {
      setDemoIndex((index) => Math.min(index + 1, mockRoute.length - 1));
    }, 7000);
    return () => window.clearInterval(intervalId);
  }, [demoMode]);

  useEffect(() => {
    if (!demoMode) return;
    let animationFrame = 0;
    const start = demoLocationRef.current;
    const target: [number, number] = [mockRoute[demoIndex].lat, mockRoute[demoIndex].lng];
    const startedAt = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 6800, 1);
      const eased = progress * (2 - progress);
      const nextLocation: [number, number] = [
        start[0] + (target[0] - start[0]) * eased,
        start[1] + (target[1] - start[1]) * eased,
      ];
      demoLocationRef.current = nextLocation;
      setDemoLocation(nextLocation);
      if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [demoIndex, demoMode]);

  useEffect(() => {
    if (demoMode) return;
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
  }, [demoMode, vehicleId]);

  useEffect(() => {
    if (demoMode) return;
    let animationFrame = 0;
    const startedAt = performance.now();
    const start = currentBusLocationRef.current;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 4500, 1);
      const eased = progress * (2 - progress);
      const nextLocation: [number, number] = [
        start[0] + (targetBusLocation[0] - start[0]) * eased,
        start[1] + (targetBusLocation[1] - start[1]) * eased,
      ];
      currentBusLocationRef.current = nextLocation;
      setCurrentBusLocation(nextLocation);
      if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [demoMode, targetBusLocation]);

  const routePositions = useMemo(
    () => demoMode
      ? mockRoute.map((point) => [point.lat, point.lng] as [number, number])
      : trackingData?.route.map((stop) => [stop.latitude, stop.longitude] as [number, number]) ?? [],
    [demoMode, trackingData],
  );
  const demoPoint = mockRoute[demoIndex];
  const markerPosition: [number, number] = demoMode
    ? demoLocation
    : currentBusLocation;
  const traveledPositions = demoMode
    ? mockRoute.slice(selectedUser.routeIndex, demoIndex + 1).map((point) => [point.lat, point.lng] as [number, number])
    : routePositions;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={markerPosition}
        zoom={12}
        className="live-tracking-map"
        style={{ height: '100%', minHeight: '420px', width: '100%', borderRadius: '1.5rem', zIndex: 10 }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri, HERE, Garmin, FAO, NOAA, USGS'
        />
        <KeepRouteInView route={routePositions} />
        <Polyline positions={routePositions} color={demoMode ? '#64748b' : '#2563eb'} weight={7} opacity={0.3} />
        {demoMode && <Polyline positions={traveledPositions} color="#16a34a" weight={5} opacity={0.95} />}
        {!demoMode && <Polyline positions={traveledPositions} color="#2563eb" weight={4} opacity={0.9} />}

        {demoMode ? (
          <>
            <Marker position={[mockRoute[0].lat, mockRoute[0].lng]} icon={customIcon}>
              <Popup>Connaught Place · Start</Popup>
            </Marker>
            <Marker position={[mockRoute[mockRoute.length - 1].lat, mockRoute[mockRoute.length - 1].lng]} icon={customIcon}>
              <Popup>North Campus · Destination</Popup>
            </Marker>
            <Marker position={markerPosition} icon={demoIcon}>
              <Popup><strong>{selectedUser.name}</strong><br />{demoPoint.locationName}</Popup>
            </Marker>
          </>
        ) : (
          <>
            {trackingData?.route.map((stop, index) => (
              <Marker key={stop.name} position={[stop.latitude, stop.longitude]} icon={customIcon}>
                <Popup>{stop.name} ({index === 0 ? 'Source' : index === trackingData.route.length - 1 ? 'Destination' : 'Stop'})</Popup>
              </Marker>
            ))}
            <Marker position={currentBusLocation} icon={busIcon}>
              <Popup>
                <div className="font-sans">
                  <strong>Bus {trackingData?.registrationNumber || 'PB-10-AB-1234'}</strong><br />
                  Status: <span className="font-bold text-green-600">Running</span><br />
                  Next stop: {trackingData?.currentStop || 'Rajpura'}<br />
                  Updated: {trackingData ? new Date(trackingData.updatedAt).toLocaleTimeString() : 'connecting'}
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {demoMode && (
        <section className="absolute left-4 top-4 z-[500] w-[min(340px,calc(100%-2rem))] rounded-2xl border border-white/15 bg-[#080d1c]/95 p-4 text-white shadow-2xl backdrop-blur" aria-label="Live trip telemetry">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Live trip</p>
              <h2 className="mt-1 truncate text-lg font-extrabold">{selectedUser.name}</h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
              <span className="animate-pulse">●</span> Live Tracking
            </span>
          </div>
          <p className="mt-3 flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-0.5 text-red-300">●</span>
            <span>{demoPoint.locationName}</span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live speed</p><p className="mt-1 font-extrabold">{demoPoint.speed} km/h</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ETA · North Campus</p><p className="mt-1 font-extrabold">{demoPoint.eta}</p></div>
          </div>
        </section>
      )}
    </div>
  );
}
