"use client";

import React, { useEffect, useState } from 'react';
import { Bus, MapPin, Navigation, AlertTriangle, CheckCircle2, Users, Clock, Search, QrCode, UserCheck, X } from 'lucide-react';

type Passenger = { id: number; name: string; seatNumber: string; pnr: string; boarded: boolean };

const INITIAL_PASSENGERS: Passenger[] = [
  { id: 1, name: 'Aarav Sharma', seatNumber: '12A', pnr: 'OMNI482901', boarded: false },
  { id: 2, name: 'Meera Kapoor', seatNumber: '12B', pnr: 'OMNI482914', boarded: false },
  { id: 3, name: 'Kabir Singh', seatNumber: '14A', pnr: 'OMNI482928', boarded: false },
  { id: 4, name: 'Ananya Gupta', seatNumber: '14B', pnr: 'OMNI482933', boarded: false },
  { id: 5, name: 'Rohan Verma', seatNumber: '16A', pnr: 'OMNI482947', boarded: false },
  { id: 6, name: 'Simran Kaur', seatNumber: '16B', pnr: 'OMNI482956', boarded: false },
  { id: 7, name: 'Vikram Malhotra', seatNumber: '18A', pnr: 'OMNI482972', boarded: false },
  { id: 8, name: 'Ishita Bansal', seatNumber: '18B', pnr: 'OMNI482988', boarded: false },
];

export default function DriverDashboard() {
  const [tripStatus, setTripStatus] = useState<'SCHEDULED' | 'RUNNING' | 'COMPLETED'>('SCHEDULED');
  const [currentStop, setCurrentStop] = useState('Patiala (Source)');
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [passengers, setPassengers] = useState(INITIAL_PASSENGERS);
  const [pnrSearch, setPnrSearch] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [vehicleId, setVehicleId] = useState('BUS-101');
  const [registrationNumber, setRegistrationNumber] = useState('PB-10-AB-1234');
  const [from, setFrom] = useState('Patiala');
  const [to, setTo] = useState('Chandigarh');

  useEffect(() => {
    fetch('/api/trip', { cache: 'no-store' })
      .then((response) => response.json())
      .then((trip) => {
        setTripStatus(trip.status);
        setCurrentStop(trip.stops[trip.currentStopIndex]);
        setPassengers(trip.passengers);
        setVehicleId(trip.vehicleId);
        setRegistrationNumber(trip.registrationNumber);
        setFrom(trip.from);
        setTo(trip.to);
      })
      .catch(() => undefined);
  }, []);

  const boardedCount = passengers.filter((passenger) => passenger.boarded).length;

  const verifyPnr = (value: string) => {
    const normalizedPnr = value.trim().toUpperCase();
    setPnrSearch(value);
    const passenger = passengers.find((item) => item.pnr === normalizedPnr);
    if (!passenger || passenger.boarded) return;
    setPassengers((current) => current.map((item) => item.pnr === normalizedPnr ? { ...item, boarded: true } : item));
    setPnrSearch('');
    setVerificationMessage(`Ticket verified: Seat ${passenger.seatNumber}`);
    window.setTimeout(() => setVerificationMessage(''), 2500);
  };

  const startScan = () => {
    setIsScannerOpen(true);
    setIsScanning(true);
    window.setTimeout(() => {
      setPassengers((current) => {
        const passenger = current.find((item) => !item.boarded);
        if (!passenger) return current;
        setVerificationMessage(`Ticket verified: Seat ${passenger.seatNumber}`);
        return current.map((item) => item.id === passenger.id ? { ...item, boarded: true } : item);
      });
      setIsScanning(false);
      window.setTimeout(() => {
        setIsScannerOpen(false);
        setVerificationMessage('');
      }, 650);
    }, 2500);
  };

  const updateTrip = (action: string) => {
    void fetch('/api/trip', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      .then((response) => response.json())
      .then((trip) => {
        setTripStatus(trip.status);
        setCurrentStop(trip.stops[trip.currentStopIndex]);
        setPassengers(trip.passengers);
        setVehicleId(trip.vehicleId);
        setRegistrationNumber(trip.registrationNumber);
        setFrom(trip.from);
        setTo(trip.to);
      });
  };

  const handleStartTrip = () => updateTrip('START');

  const handleUpdateLocation = () => {
    updateTrip('NEXT_STOP');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Driver Portal</h1>
            <p className="text-slate-400 text-sm">Welcome back, Rajesh</p>
          </div>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
            <Bus className="text-blue-400" />
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Status</p>
            {tripStatus === 'SCHEDULED' && <p className="font-bold text-blue-400 flex items-center gap-2"><Clock size={16}/> Scheduled</p>}
            {tripStatus === 'RUNNING' && <p className="font-bold text-green-400 flex items-center gap-2"><Navigation size={16} className="animate-pulse"/> En Route</p>}
            {tripStatus === 'COMPLETED' && <p className="font-bold text-slate-400 flex items-center gap-2"><CheckCircle2 size={16}/> Completed</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Bus</p>
            <p className="font-bold text-white font-mono">{registrationNumber}</p>
            <p className="mt-1 text-xs text-slate-400">{currentStop}</p>
          </div>
        </div>
      </header>

      <main className="p-6 pb-24 space-y-6">
        
        {/* Today's Trip Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-900 text-lg">Today&apos;s Assignment</h2>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
              5:30 PM
            </span>
          </div>

          <div className="relative border-l-2 border-dashed border-slate-200 ml-3 space-y-6 my-6">
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
              <h4 className="font-bold text-slate-900 text-sm">{from}</h4>
              <p className="text-xs text-slate-500">Boarding Point</p>
            </div>
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></div>
              <h4 className="font-bold text-slate-900 text-sm">{to}</h4>
              <p className="text-xs text-slate-500">Drop-off Point</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={20} /></div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Passengers</p>
                <p className="font-bold text-slate-900">{boardedCount}/{passengers.length} Boarded</p>
              </div>
            </div>
            <button onClick={() => setIsManifestOpen(true)} className="flex items-center gap-1 text-blue-600 text-sm font-bold hover:underline"><Users size={15} /> View List</button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider pl-2">Trip Controls</h3>
          
          {tripStatus === 'SCHEDULED' && (
            <button onClick={handleStartTrip} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all">
              <Navigation size={20} /> Start Trip
            </button>
          )}

          {tripStatus === 'RUNNING' && (
            <>
              <button onClick={handleUpdateLocation} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                <MapPin size={20} /> Arrived at Next Stop
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="py-4 bg-orange-100 text-orange-700 font-bold rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all border border-orange-200">
                  <AlertTriangle size={24} />
                  <span className="text-xs">Report Delay</span>
                </button>
                <button onClick={() => updateTrip('COMPLETE')} className="py-4 bg-green-100 text-green-700 font-bold rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all border border-green-200">
                  <CheckCircle2 size={24} />
                  <span className="text-xs">Complete Trip</span>
                </button>
              </div>
            </>
          )}
        </div>

      </main>

      {isManifestOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <section className="h-full w-full max-w-xl overflow-y-auto bg-slate-900 p-5 text-slate-200 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="manifest-title">
            <div className="sticky top-0 z-10 -mx-5 border-b border-slate-800 bg-slate-900 px-5 pb-5 sm:-mx-7 sm:px-7">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-400">{vehicleId} · {registrationNumber}</p><h2 id="manifest-title" className="mt-1 text-2xl font-extrabold text-white">Passenger verification</h2><p className="mt-1 text-sm text-slate-400">{from} to {to}</p></div><button type="button" onClick={() => setIsManifestOpen(false)} aria-label="Close passenger manifest" className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={20} /></button></div>
              <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Boarding progress</p><p className="mt-1 text-xl font-extrabold text-white">{boardedCount} <span className="text-slate-500">/ {passengers.length}</span></p></div><div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(boardedCount / passengers.length) * 100}%` }} /></div></div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={18} className="absolute left-3 top-3 text-slate-500" /><input value={pnrSearch} onChange={(event) => verifyPnr(event.target.value)} placeholder="Enter PNR to verify" aria-label="Enter PNR to verify" className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 font-mono uppercase text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /></label><button type="button" onClick={startScan} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white hover:bg-blue-500"><QrCode size={18} /> Scan Ticket QR</button></div>
              {verificationMessage && <p className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-400"><UserCheck size={17} /> {verificationMessage}</p>}
            </div>
            <div className="mt-5 space-y-3">{passengers.map((passenger) => <div key={passenger.id} className={`flex items-center gap-3 rounded-2xl border p-4 transition ${passenger.boarded ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${passenger.boarded ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>{passenger.boarded ? <CheckCircle2 size={19} /> : <Users size={18} />}</div><div className="min-w-0 flex-1"><p className={`truncate font-bold ${passenger.boarded ? 'text-emerald-300' : 'text-white'}`}>{passenger.name}</p><p className="mt-1 text-xs text-slate-500">Seat {passenger.seatNumber} <span className="mx-1">•</span> {passenger.pnr}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${passenger.boarded ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>{passenger.boarded ? 'Boarded' : 'Pending'}</span></div>)}</div>
          </section>
        </div>
      )}

      {isScannerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-5 text-center shadow-2xl"><div className="flex items-center justify-between text-sm font-bold text-white"><span className="flex items-center gap-2"><QrCode size={18} className="text-blue-400" /> Scan ticket</span><button type="button" onClick={() => { setIsScannerOpen(false); setIsScanning(false); }} aria-label="Close QR scanner" className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={18} /></button></div><div className="relative mt-5 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-950"><div className="absolute inset-10 rounded-xl border-2 border-blue-400/80"><span className="absolute -left-1 -top-1 h-7 w-7 border-l-4 border-t-4 border-blue-400" /><span className="absolute -right-1 -top-1 h-7 w-7 border-r-4 border-t-4 border-blue-400" /><span className="absolute -bottom-1 -left-1 h-7 w-7 border-b-4 border-l-4 border-blue-400" /><span className="absolute -bottom-1 -right-1 h-7 w-7 border-b-4 border-r-4 border-blue-400" /></div>{isScanning ? <><QrCode size={92} className="text-slate-600" /><span className="absolute left-10 right-10 top-1/2 h-0.5 animate-pulse bg-blue-400 shadow-[0_0_16px_#60a5fa]" /></> : <CheckCircle2 size={68} className="text-emerald-400" />}</div><p className="mt-4 font-bold text-white">{isScanning ? 'Scanning ticket...' : 'Ticket verified'}</p><p className="mt-1 text-sm text-slate-500">{isScanning ? 'Hold the QR code inside the frame' : 'Passenger marked as boarded'}</p></div></div>
      )}
    </div>
  );
}