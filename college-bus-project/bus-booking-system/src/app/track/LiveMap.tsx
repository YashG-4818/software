"use client";

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RealBus } from '@/data/buses';

interface LiveMapProps {
  bus: RealBus;
  currentCoord: [number, number];
  progressIndex: number;
}

export default function LiveMap({ bus, currentCoord, progressIndex }: LiveMapProps) {
  const [icon] = useState<L.Icon | null>(() => {
    if (typeof window === 'undefined') return null;
    return new L.Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  });

  if (!icon) return <div className="w-full h-full flex items-center justify-center text-slate-500">Initializing Route Map...</div>;

  const polylineCoords = bus.gpsRoute.map(r => [r.lat, r.lng] as [number, number]);

  return (
    <MapContainer
      key={bus.id} // Forces re-render if bus changes
      center={currentCoord}
      zoom={11}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {/* Draws the path the bus will take */}
      <Polyline positions={polylineCoords} color="#3b82f6" weight={4} opacity={0.6} dashArray="8, 8" />

      {/* Markers for all stops on the route */}
      {bus.gpsRoute.map((point, idx) => (
        <Marker key={idx} position={[point.lat, point.lng]} icon={icon}>
          <Popup className="text-slate-900">
            <p className="font-bold text-xs">{point.stopName}</p>
            <span className="text-[10px] text-slate-500">Scheduled Stop</span>
          </Popup>
        </Marker>
      ))}

      {/* The Active Live Bus Marker */}
      <Marker position={currentCoord} icon={icon}>
        <Popup className="text-slate-900">
          <strong className="text-blue-600">{bus.id}</strong><br />
          <span className="font-bold">Operator: {bus.operator}</span><br />
          <span className="text-xs text-slate-600">Heading to: {bus.gpsRoute[progressIndex]?.stopName}</span>
        </Popup>
      </Marker>
    </MapContainer>
  );
}