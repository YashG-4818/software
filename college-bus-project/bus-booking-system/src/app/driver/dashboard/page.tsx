"use client";

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BarChart3, Bell, BusFront, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3, FileText, History, MapPin, QrCode, ScanLine, ShieldCheck, Signal, UserRound, Users, Wallet, X } from 'lucide-react';
import AccountMenu from '@/components/AccountMenu';

type Passenger = { name: string; seatNumber: string; pnr: string; boarded: boolean };

type TripStatus = 'SCHEDULED' | 'RUNNING' | 'DELAYED' | 'COMPLETED';

const initialPassengers: Passenger[] = [
  { name: 'Aarav Sharma', seatNumber: '1A', pnr: 'OMNI482901', boarded: false },
  { name: 'Meera Kapoor', seatNumber: '1B', pnr: 'OMNI482914', boarded: false },
  { name: 'Kabir Singh', seatNumber: '2A', pnr: 'OMNI482928', boarded: false },
  { name: 'Ananya Gupta', seatNumber: '2B', pnr: 'OMNI482933', boarded: false },
  { name: 'Rohan Verma', seatNumber: '3A', pnr: 'OMNI482947', boarded: false },
  { name: 'Simran Kaur', seatNumber: '3B', pnr: 'OMNI482956', boarded: false },
  { name: 'Vikram Malhotra', seatNumber: '4A', pnr: 'OMNI482972', boarded: false },
  { name: 'Ishita Bansal', seatNumber: '4B', pnr: 'OMNI482988', boarded: false },
];

export default function DriverDashboardPage() {
  const [dutyOnline, setDutyOnline] = useState(true);
  const [tripStatus, setTripStatus] = useState<TripStatus>('SCHEDULED');
  const [passengers, setPassengers] = useState(initialPassengers);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueSent, setIssueSent] = useState(false);
  const [tripError, setTripError] = useState('');
  const [delayReason, setDelayReason] = useState('Traffic congestion');
  const [assignmentNotice, setAssignmentNotice] = useState('');
  const previousBookingEventId = useRef(0);
  const [currentStop, setCurrentStop] = useState('Patiala bus stand');
  const [vehicleId, setVehicleId] = useState('BUS-101');
  const [registrationNumber, setRegistrationNumber] = useState('PB-10-AB-1234');
  const [from, setFrom] = useState('Patiala');
  const [to, setTo] = useState('Chandigarh');
  const [operator, setOperator] = useState('OmniBus Elite');
  const [busType, setBusType] = useState('AC Express');
  const [scheduledDeparture, setScheduledDeparture] = useState('2026-09-03T18:00:00+05:30');
  const [scheduledArrival, setScheduledArrival] = useState('2026-09-03T20:15:00+05:30');

  useEffect(() => {
    const loadTrip = () => fetch('/api/trip', { cache: 'no-store' })
      .then((response) => response.json())
      .then((trip) => {
        const latestBooking = trip.events?.find((event: { type: string }) => event.type === 'BOOKING');
        if (latestBooking && previousBookingEventId.current && previousBookingEventId.current !== latestBooking.id) setAssignmentNotice(`New assignment received: ${trip.vehicleId} · ${trip.from} to ${trip.to}`);
        if (latestBooking) previousBookingEventId.current = latestBooking.id;
        setTripStatus(trip.status);
        setPassengers(trip.passengers);
        setCurrentStop(trip.stops[trip.currentStopIndex]);
        setVehicleId(trip.vehicleId);
        setRegistrationNumber(trip.registrationNumber);
        setFrom(trip.from);
        setTo(trip.to);
        setOperator(trip.operator);
        setBusType(trip.busType);
        setScheduledDeparture(trip.scheduledDeparture);
        setScheduledArrival(trip.scheduledArrival);
      })
      .catch(() => undefined);
    loadTrip();
    const refreshTimer = window.setInterval(loadTrip, 5000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const boardedCount = passengers.filter((passenger) => passenger.boarded).length;
  const updateBoarding = async (pnr: string, boarded: boolean) => {
    const response = await fetch('/api/trip', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: boarded ? 'BOARD' : 'UNBOARD', pnr }) });
    if (!response.ok) return;
    const trip = await response.json();
    setPassengers(trip.passengers);
    setVehicleId(trip.vehicleId);
    setRegistrationNumber(trip.registrationNumber);
    setFrom(trip.from);
    setTo(trip.to);
    setOperator(trip.operator);
    setBusType(trip.busType);
    setScheduledDeparture(trip.scheduledDeparture);
    setScheduledArrival(trip.scheduledArrival);
    setSelectedPassenger(null);
  };

  const startScan = () => {
    setIsScannerOpen(true);
    setIsScanning(true);
    setScanResult('');
    window.setTimeout(() => {
      const nextPassenger = passengers.find((passenger) => !passenger.boarded);
      if (nextPassenger) {
        void fetch('/api/trip', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'BOARD', pnr: nextPassenger.pnr }) })
          .then((response) => response.json())
          .then((trip) => {
            setPassengers(trip.passengers);
            setScanResult(`${nextPassenger.name}'s ticket verified`);
          });
      } else {
        setScanResult('All booked passengers are already boarded');
      }
      setIsScanning(false);
    }, 2000);
  };

  const updateTrip = async (action: string, details: { delayMinutes?: number; delayReason?: string } = {}) => {
    setTripError('');
    const response = await fetch('/api/trip', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...details }) });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setTripError(payload?.error || 'The trip update could not be saved. Try again.');
      return false;
    }
    const trip = await response.json();
    setTripStatus(trip.status);
    setCurrentStop(trip.stops[trip.currentStopIndex]);
    setPassengers(trip.passengers);
    setVehicleId(trip.vehicleId);
    setRegistrationNumber(trip.registrationNumber);
    setFrom(trip.from);
    setTo(trip.to);
    setOperator(trip.operator);
    setBusType(trip.busType);
    setScheduledDeparture(trip.scheduledDeparture);
    setScheduledArrival(trip.scheduledArrival);
    return true;
  };

  const startOrEndTrip = () => void updateTrip(tripStatus === 'RUNNING' ? 'COMPLETE' : 'START');
  const updateStop = () => void updateTrip('NEXT_STOP');

  return (
    <main className="min-h-screen bg-[#080d1c] pb-28 font-sans text-slate-100">
      <header className="border-b border-white/10 bg-[#0b1225] px-5 pb-6 pt-6 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div><div className="flex items-center gap-2 text-red-300"><BusFront size={21} /><span className="text-sm font-extrabold tracking-wide">OmniBus Driver</span></div><h1 className="mt-5 text-3xl font-extrabold tracking-tight">Welcome, Driver Rajesh</h1><p className="mt-1 text-sm text-slate-400">Thursday, 03 September 2026 <span className="mx-1 text-slate-600">•</span> Shift starts 5:00 PM</p></div>
            <AccountMenu role="Driver" dark />
          </div>
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-[#10182d] p-4">
            <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Duty status</p><p className={`mt-1 flex items-center gap-2 text-sm font-bold ${dutyOnline ? 'text-emerald-400' : 'text-slate-400'}`}><span className={`h-2.5 w-2.5 rounded-full ${dutyOnline ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-slate-500'}`} />{dutyOnline ? 'Online and available' : 'Offline'}</p></div>
            <button type="button" onClick={() => setDutyOnline((online) => !online)} aria-pressed={dutyOnline} className={`relative h-8 w-14 rounded-full p-1 transition ${dutyOnline ? 'bg-emerald-500' : 'bg-slate-700'}`}><span className={`block h-6 w-6 rounded-full bg-white shadow-md transition ${dutyOnline ? 'translate-x-6' : ''}`} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-8">
        <section className="grid grid-cols-3 gap-3" aria-label="Today's driver summary">
          <SummaryStat icon={<Clock3 size={17} />} value="8h 20m" label="On duty" />
          <SummaryStat icon={<Users size={17} />} value={`${boardedCount}`} label="Boarded" />
          <SummaryStat icon={<Wallet size={17} />} value="₹1,850" label="Today" />
        </section>

        {assignmentNotice && <section className="flex items-start gap-3 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4 text-blue-100"><BellIcon /><div className="min-w-0 flex-1"><p className="text-sm font-bold">New booking assigned</p><p className="mt-1 text-xs text-blue-100/75">{assignmentNotice}</p></div><button type="button" onClick={() => setAssignmentNotice('')} className="text-xs font-bold text-blue-200 underline">Dismiss</button></section>}
        {tripError && <p role="alert" className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm font-semibold text-red-200">{tripError}</p>}

        <section className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-100">
          <div className="flex items-start gap-3"><AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-300" /><div className="min-w-0"><p className="text-sm font-bold">Pre-trip checklist pending</p><p className="mt-1 text-xs leading-5 text-amber-200/70">Complete the vehicle inspection before starting GPS broadcast.</p></div><button type="button" className="ml-auto shrink-0 text-xs font-bold underline underline-offset-4" onClick={() => setCurrentStop('Vehicle inspection complete')}>Mark done</button></div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#10182d] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-red-300">Active assignment</p><h2 className="mt-1 text-xl font-extrabold">{vehicleId}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${tripStatus === 'RUNNING' ? 'bg-emerald-400/15 text-emerald-300' : tripStatus === 'COMPLETED' ? 'bg-slate-700 text-slate-300' : 'bg-amber-400/15 text-amber-300'}`}>{tripStatus === 'RUNNING' ? 'Live trip' : tripStatus === 'COMPLETED' ? 'Completed' : 'Scheduled'}</span></div><div className="mt-6 flex items-center gap-3 text-2xl font-extrabold"><span>{from}</span><div className="flex flex-1 items-center gap-2"><div className="h-px flex-1 bg-slate-700" /><BusFront size={18} className="text-red-400" /><div className="h-px flex-1 bg-slate-700" /></div><span>{to}</span></div><p className="mt-2 text-sm text-slate-500">{registrationNumber} <span className="mx-1">•</span> {operator} <span className="mx-1">•</span> {busType} <span className="mx-1">•</span> {currentStop}</p></div>
          <div className="grid grid-cols-2 border-b border-white/10"><div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Departure</p><p className="mt-1 text-lg font-bold">{formatTripTime(scheduledDeparture)}</p><p className="mt-1 text-xs text-slate-500">{from}</p></div><div className="border-l border-white/10 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Arrival</p><p className="mt-1 text-lg font-bold">{formatTripTime(scheduledArrival)}</p><p className="mt-1 text-xs text-slate-500">{to}</p></div></div>
          <div className="p-5 sm:p-6"><button type="button" disabled={tripStatus === 'COMPLETED' || !dutyOnline} onClick={startOrEndTrip} className={`flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-lg font-extrabold shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${tripStatus === 'RUNNING' ? 'bg-red-500 shadow-red-950/30 hover:bg-red-600' : 'bg-emerald-500 text-[#06130d] shadow-emerald-950/30 hover:bg-emerald-400'}`}><Signal size={22} className={tripStatus === 'RUNNING' ? 'animate-pulse' : ''} />{tripStatus === 'RUNNING' ? 'End Trip' : tripStatus === 'COMPLETED' ? 'Trip completed' : 'Start Trip / Start GPS Broadcast'}</button><p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500"><ShieldCheck size={14} className="text-emerald-400" /> GPS is shared with passengers only while your trip is live.</p></div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#10182d] shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Boarding list</p><h2 className="mt-1 text-xl font-extrabold">Passenger manifest</h2></div><div className="text-right"><p className="text-2xl font-extrabold text-emerald-400">{boardedCount}/{passengers.length}</p><p className="text-xs font-semibold text-slate-500">Boarded</p></div></div>
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0b1225] px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500"><span className="flex items-center gap-2"><Users size={15} /> {passengers.length} booked passengers</span><span>{passengers.length - boardedCount} pending</span></div>
          <div className="divide-y divide-white/10">{passengers.map((passenger) => <button type="button" key={passenger.pnr} onClick={() => setSelectedPassenger(passenger)} className="flex min-h-20 w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${passenger.boarded ? 'bg-emerald-400/15 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{passenger.boarded ? <Check size={19} /> : <UserRound size={18} />}</span><span className="min-w-0 flex-1"><strong className={`block truncate text-sm ${passenger.boarded ? 'text-slate-400 line-through' : 'text-white'}`}>{passenger.name}</strong><span className="mt-1 block text-xs text-slate-500">Seat {passenger.seatNumber} <span className="mx-1 text-slate-700">•</span> {passenger.pnr}</span></span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${passenger.boarded ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>{passenger.boarded ? 'Boarded' : 'Pending'}</span><ChevronRight size={17} className="text-slate-600" /></button>)}</div>
        </section>

        <div className="grid grid-cols-2 gap-3"><button type="button" onClick={startScan} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-extrabold text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-600"><ScanLine size={21} /> Scan Ticket</button><button type="button" onClick={() => { setIssueSent(false); setIsIssueOpen(true); }} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#10182d] px-4 py-3 font-bold text-slate-300 transition hover:-translate-y-0.5 hover:border-slate-500"><AlertTriangle size={19} className="text-amber-400" /> Report delay</button></div>

        {tripStatus === 'RUNNING' && <button type="button" onClick={updateStop} className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-[#10182d] px-5 text-left transition hover:border-slate-500"><span className="flex items-center gap-3"><MapPin size={20} className="text-red-300" /><span><strong className="block text-sm">Update current stop</strong><small className="text-xs text-slate-500">Broadcast: {currentStop}</small></span></span><ChevronRight size={18} className="text-slate-500" /></button>}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Driver tools"><ToolCard icon={<History size={19} />} label="Trip history" onClick={() => setActiveTool('Trip history')} /><ToolCard icon={<BarChart3 size={19} />} label="Performance" onClick={() => setActiveTool('Performance')} /><ToolCard icon={<FileText size={19} />} label="Documents" onClick={() => setActiveTool('Documents')} /><ToolCard icon={<CircleHelp size={19} />} label="Help centre" onClick={() => { setIssueSent(false); setIsIssueOpen(true); }} /></section>

        <section className="rounded-3xl border border-white/10 bg-[#10182d] p-5 shadow-2xl shadow-black/20"><div className="flex items-center justify-between"><h2 className="font-extrabold">Recent trips</h2><button type="button" className="text-xs font-bold text-red-300">View all</button></div><div className="mt-4 space-y-3"><TripRow route="Patiala → Chandigarh" time="Yesterday · 5:30 PM" status="Completed" /><TripRow route="Chandigarh → Shimla" time="31 Aug · 7:15 AM" status="Completed" /></div></section>
      </div>

      {activeTool && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#10182d] p-6 text-center shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">{activeTool}</h2><button type="button" onClick={() => setActiveTool(null)} aria-label={`Close ${activeTool}`} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={19} /></button></div><p className="mt-6 text-sm leading-6 text-slate-400">{activeTool === 'Trip history' ? 'Your completed routes and recent assignments will appear here.' : 'This driver tool is connected and ready for operational data.'}</p><button type="button" onClick={() => setActiveTool(null)} className="btn-pill btn-primary mt-6 w-full py-3">Close</button></div></div>}
      {selectedPassenger && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#10182d] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-red-300">Passenger status</p><h2 className="mt-1 text-xl font-extrabold">{selectedPassenger.name}</h2><p className="mt-1 text-sm text-slate-500">Seat {selectedPassenger.seatNumber} • {selectedPassenger.pnr}</p></div><button type="button" onClick={() => setSelectedPassenger(null)} aria-label="Close passenger status" className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={19} /></button></div><p className="mt-6 text-sm text-slate-300">Current status: <strong>{selectedPassenger.boarded ? 'Boarded' : 'Pending'}</strong></p><div className="mt-5 grid gap-3"><button type="button" onClick={() => updateBoarding(selectedPassenger.pnr, true)} className="btn-pill btn-primary w-full py-3"><Check size={18} /> Mark boarded</button><button type="button" onClick={() => updateBoarding(selectedPassenger.pnr, false)} className="btn-pill w-full border border-white/10 bg-[#0b1225] py-3 text-slate-200 hover:border-slate-500">Mark not boarded</button></div></div></div>}
      {isScannerOpen && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#10182d] p-5 text-center shadow-2xl"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-bold"><QrCode size={18} className="text-red-400" /> Scan passenger ticket</div><button type="button" onClick={() => { setIsScannerOpen(false); setIsScanning(false); }} aria-label="Close scanner" className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={19} /></button></div><div className="relative mt-5 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#050914]"><div className="absolute inset-8 rounded-xl border-2 border-red-400/70"><span className="absolute -left-1 -top-1 h-7 w-7 border-l-4 border-t-4 border-red-400" /><span className="absolute -right-1 -top-1 h-7 w-7 border-r-4 border-t-4 border-red-400" /><span className="absolute -bottom-1 -left-1 h-7 w-7 border-b-4 border-l-4 border-red-400" /><span className="absolute -bottom-1 -right-1 h-7 w-7 border-b-4 border-r-4 border-red-400" /></div>{isScanning ? <><QrCode size={104} className="text-slate-500" /><span className="absolute left-10 right-10 top-1/2 h-0.5 animate-pulse bg-red-400 shadow-[0_0_14px_#f87171]" /></> : <CheckCircle2 size={74} className="text-emerald-400" />}</div><p className="mt-4 font-bold">{isScanning ? 'Scanning ticket...' : scanResult ? 'Ticket verified' : 'Scanner ready'}</p><p className="mt-1 text-sm text-slate-500">{isScanning ? 'Hold the passenger QR inside the frame' : scanResult || 'The simulated scanner verifies the next pending passenger.'}</p>{!isScanning && <button type="button" onClick={startScan} className="btn-pill btn-primary mt-5 w-full py-3"><ScanLine size={18} /> Scan again</button>}</div></div>}
      {isIssueOpen && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#10182d] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-300">Driver support</p><h2 className="mt-1 text-xl font-extrabold">Report a delay</h2></div><button type="button" onClick={() => setIsIssueOpen(false)} aria-label="Close delay dialog" className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={19} /></button></div>{issueSent ? <div className="py-8 text-center"><CheckCircle2 size={42} className="mx-auto text-emerald-400" /><p className="mt-3 font-bold">Delay shared with passengers and admin</p><p className="mt-1 text-sm text-slate-500">The trip remains active while operations monitors it.</p></div> : <><label className="mt-6 block text-sm font-bold text-slate-300">Reason<select value={delayReason} onChange={(event) => setDelayReason(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1225] px-4 py-3 text-white outline-none"><option>Traffic congestion</option><option>Road block</option><option>Vehicle inspection</option><option>Passenger assistance</option></select></label><button type="button" disabled={tripStatus !== 'RUNNING' && tripStatus !== 'DELAYED'} onClick={async () => { const success = await updateTrip('DELAY', { delayMinutes: 15, delayReason }); if (success) setIssueSent(true); }} className="btn-pill btn-primary mt-5 w-full py-3 disabled:cursor-not-allowed disabled:opacity-50">Submit delay</button></>}</div></div>}
    </main>
  );
}

function SummaryStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="rounded-2xl border border-white/10 bg-[#10182d] p-3"><div className="flex items-center gap-1.5 text-slate-500">{icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div><p className="mt-2 text-lg font-extrabold text-white">{value}</p></div>;
}

function BellIcon() {
  return <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-400/15 text-blue-300"><Bell size={17} /></span>;
}

function ToolCard({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#10182d] text-xs font-bold text-slate-300 transition hover:-translate-y-0.5 hover:border-slate-500"><span className="text-red-300">{icon}</span>{label}</button>;
}

function TripRow({ route, time, status }: { route: string; time: string; status: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1225] p-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400"><CheckCircle2 size={17} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{route}</strong><small className="text-xs text-slate-500">{time}</small></span><span className="text-xs font-bold text-emerald-300">{status}</span></div>;
}

function formatTripTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' });
}
