"use client";

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { Bell, BusFront, MapPin, Clock, CheckCircle2, Search, ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LiveMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 rounded-3xl border-2 border-dashed border-slate-200">
      <MapPin size={48} className="animate-bounce mb-4 text-blue-300" />
      <p className="font-semibold">Loading GPS Tracking Data...</p>
    </div>
  ),
});

export default function TrackingPage() {
  const router = useRouter();
  const [pnr, setPnr] = useState('');
  const [searchedPnr, setSearchedPnr] = useState('');
  const [bookingFound, setBookingFound] = useState(false);
  const [vehicleId, setVehicleId] = useState('BUS-101');
  const [tripStatus, setTripStatus] = useState<'SCHEDULED' | 'RUNNING' | 'DELAYED' | 'COMPLETED'>('SCHEDULED');
  const [boardedCount, setBoardedCount] = useState(0);
  const [currentStop, setCurrentStop] = useState('Waiting to start');
  const [tripNotification, setTripNotification] = useState('');
  const [from, setFrom] = useState('Patiala');
  const [to, setTo] = useState('Chandigarh');
  const [stops, setStops] = useState<string[]>([]);
  const [tripEvents, setTripEvents] = useState<{ id: number; type: string; message: string; createdAt: string }[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [lastSeenEventId, setLastSeenEventId] = useState(0);
  const previousTripStatus = useRef('');

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const savedBooking = localStorage.getItem('latestBooking');
      if (savedBooking) {
        const booking = JSON.parse(savedBooking);
        setPnr(booking.pnr || '');
        setVehicleId(booking.vehicleId || 'BUS-101');
      }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    const refreshTrip = () => fetch('/api/trip', { cache: 'no-store' })
      .then((response) => response.json())
      .then((trip) => {
        const nextStatus = trip.status || 'SCHEDULED';
        setTripStatus(nextStatus);
        setFrom(trip.from || 'Patiala');
        setTo(trip.to || 'Chandigarh');
        setStops(trip.stops || []);
        setTripEvents(trip.events || []);
        setBoardedCount((trip.passengers || []).filter((passenger: { boarded: boolean }) => passenger.boarded).length);
        setCurrentStop(nextStatus === 'SCHEDULED' ? 'Waiting to start' : trip.stops?.[trip.currentStopIndex] || 'Waiting to start');

        if (previousTripStatus.current !== 'RUNNING' && nextStatus === 'RUNNING') {
          const message = 'Your bus has started. Live GPS tracking is now active.';
          setTripNotification(message);
          if ('Notification' in window) {
            if (Notification.permission === 'granted') new Notification('OmniBus trip started', { body: message });
            else if (Notification.permission === 'default') void Notification.requestPermission();
          }
        }
        if (previousTripStatus.current !== 'DELAYED' && nextStatus === 'DELAYED') setTripNotification(`Trip delayed: ${trip.delayReason || 'The driver reported a delay.'}`);
        if (previousTripStatus.current !== 'COMPLETED' && nextStatus === 'COMPLETED') setTripNotification('Trip completed. Live GPS tracking is now offline.');

        previousTripStatus.current = nextStatus;
      })
      .catch(() => undefined);

    refreshTrip();
    const refreshTimer = window.setInterval(refreshTrip, 5000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const checkBooking = (event: React.FormEvent) => {
    event.preventDefault();
    const savedBooking = localStorage.getItem('latestBooking');
    const booking = savedBooking ? JSON.parse(savedBooking) : null;
    const savedPnr = booking?.pnr || '';
    const nextPnr = pnr.trim().toUpperCase();
    setSearchedPnr(nextPnr);
    const isMatch = nextPnr === savedPnr || nextPnr === 'PNR88291A';
    setBookingFound(isMatch);
    if (savedPnr && nextPnr === savedPnr) setVehicleId(booking.vehicleId || 'BUS-101');
  };

  const unreadNotifications = tripEvents.filter((event) => event.id > lastSeenEventId).length;
  const openNotifications = () => {
    setIsNotificationsOpen((open) => !open);
    if (!isNotificationsOpen && tripEvents[0]) setLastSeenEventId(tripEvents[0].id);
  };

  const statusText = tripStatus === 'RUNNING'
    ? 'GPS Active'
    : tripStatus === 'COMPLETED'
      ? 'Trip completed'
      : tripStatus === 'DELAYED'
        ? 'Delayed'
        : 'Not started';

  const headlineText = tripStatus === 'RUNNING'
    ? 'Running on time'
    : tripStatus === 'COMPLETED'
      ? 'Trip completed'
      : tripStatus === 'DELAYED'
        ? 'Trip delayed'
        : 'Not started';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BusFront className="text-blue-600" /> Live Tracking
          </h1>
          <p className="text-slate-500 mt-1 font-mono">PNR: {pnr || 'Not available'} • {vehicleId} • {from} → {to}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={openNotifications} aria-label="Open passenger notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-600">
            <Bell size={19} />
            {unreadNotifications > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{Math.min(unreadNotifications, 9)}</span>}
          </button>
          <div className={`${tripStatus === 'RUNNING' ? 'bg-green-100 text-green-700' : tripStatus === 'COMPLETED' ? 'bg-slate-200 text-slate-700' : tripStatus === 'DELAYED' ? 'bg-amber-100 text-amber-700' : 'bg-amber-100 text-amber-700'} px-4 py-2 rounded-full font-bold flex items-center gap-2 text-sm`}>
          <span className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${tripStatus === 'RUNNING' ? 'bg-green-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${tripStatus === 'RUNNING' ? 'bg-green-500' : tripStatus === 'COMPLETED' ? 'bg-slate-500' : 'bg-amber-500'}`}></span>
          </span>
          {statusText}
          </div>
        </div>
      </div>

      {isNotificationsOpen && <section className="max-w-7xl mx-auto mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm" aria-label="Passenger notifications">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Notifications</p><h2 className="mt-1 text-lg font-bold text-slate-900">Trip updates</h2></div><button type="button" onClick={() => setIsNotificationsOpen(false)} aria-label="Close notifications" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div>
        <div className="mt-4 space-y-2">{tripEvents.length ? tripEvents.slice(0, 8).map((event) => <div key={`${event.id}-${event.type}-${event.createdAt}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-sm font-semibold text-slate-800">{event.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(event.createdAt).toLocaleTimeString()}</p></div>) : <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">No trip updates yet. Notifications will appear when the driver starts, moves, delays, or completes the trip.</p>}</div>
      </section>}

      <div className="max-w-7xl mx-auto mb-6 bg-white border border-slate-200 p-5 shadow-sm">
        <form onSubmit={checkBooking} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search size={18} className="absolute left-3 top-3 text-slate-400" /><input value={pnr} onChange={(event) => setPnr(event.target.value)} placeholder="Enter your PNR to check booking status" className="w-full border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 font-mono uppercase outline-none focus:border-[#d9232e]" /></div>
          <button className="btn-pill btn-primary px-6 py-3">Check status</button>
          <button type="button" onClick={() => router.push('/')} className="btn-pill btn-secondary px-5 py-3"><ArrowLeft size={16} /> Home</button>
        </form>
        {searchedPnr && <p className={`mt-3 text-sm font-bold ${bookingFound ? 'text-green-600' : 'text-red-600'}`}>{bookingFound ? `Booking ${searchedPnr} is confirmed and ready to track.` : 'No booking found for that PNR. Check the number on your receipt.'}</p>}
        {tripNotification && <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800"><span>{tripNotification}</span><button type="button" onClick={() => setTripNotification('')} className="text-green-700 underline">Dismiss</button></div>}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-2 h-full relative">
          {tripStatus === 'RUNNING' || tripStatus === 'DELAYED' ? (
            <LiveMap vehicleId={vehicleId} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-center text-slate-500">
              <BusFront size={54} className="mb-4 text-slate-300" />
              <p className="text-2xl font-bold text-slate-700">Trip not started</p>
              <p className="mt-2 max-w-md text-sm text-slate-500">The bus has not begun its journey yet. Live GPS tracking will appear once the driver starts the trip.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col h-full overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-2xl p-5 mb-8">
            <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-1">Status</p>
            <h2 className="text-2xl font-bold text-green-400">{headlineText}</h2>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-slate-400 text-xs uppercase mb-1">ETA Destination</p>
                <p className="font-bold flex items-center gap-1"><Clock size={16}/> {tripStatus === 'RUNNING' || tripStatus === 'DELAYED' ? '7:45 PM' : 'Not started'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase mb-1">Next Stop</p>
                <p className="font-bold flex items-center gap-1"><MapPin size={16}/> {currentStop}</p>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 mb-2 text-lg">Journey Timeline</h3>
          <p className="mb-6 text-sm text-slate-500">{boardedCount} passengers boarded</p>
          
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
            {stops.map((stop, index) => <div className="relative pl-6" key={`${stop}-${index}`}>
              <CheckCircle2 size={24} className="absolute -left-[13px] top-0 text-green-500 bg-white" />
              <h4 className="font-bold text-slate-900">{stop}{index === 0 ? ' (Boarding)' : index === stops.length - 1 ? ' (Drop-off)' : ''}</h4>
              <p className="text-sm text-slate-500">{index <= (tripStatus === 'SCHEDULED' ? -1 : 0) ? 'Departure started' : index === 0 ? 'Waiting to start' : 'Scheduled stop'}</p>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}