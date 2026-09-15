"use client";

import { AlertTriangle, CalendarDays, Check, ChevronDown, Clock3, Plus, Route, Save, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type RouteRecord = { id: string; source: string; destination: string; distanceKm: number; estimatedMins: number; baseFare: number; stops: string[]; active: boolean };
type ScheduleRecord = { id: string; routeId: string; busId: string; driverId: string; departure: string; arrival: string; status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'; conflict: string | null };
type RouteForm = { source: string; destination: string; distanceKm: string; estimatedMins: string; baseFare: string; stops: string };
const buses = ['BUS-101 · AC Express', 'BUS-104 · Volvo AC', 'BUS-201 · AC Sleeper', 'BUS-202 · Volvo AC', 'BUS-209 · AC Express'];
const drivers = ['D-014 · Rajesh Kumar', 'D-088 · Amit Singh', 'D-031 · Gurpreet Kaur', 'D-052 · Vikram Malhotra'];

export default function AdminOperations({ mode }: { mode: 'routes' | 'schedules' }) {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [routeForm, setRouteForm] = useState({ source: '', destination: '', distanceKm: '65', estimatedMins: '120', baseFare: '650', stops: '' });
  const [scheduleForm, setScheduleForm] = useState({ routeId: '', busId: buses[0], driverId: drivers[0], departure: '', arrival: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/operations', { cache: 'no-store' });
    const data = await response.json();
    setRoutes(data.routes ?? []);
    setSchedules(data.schedules ?? []);
    if (!scheduleForm.routeId && data.routes?.[0]) {
      setScheduleForm((current) => ({ ...current, routeId: data.routes[0].id }));
    }
  }, [scheduleForm.routeId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load().catch(() => setError('Unable to load operations data.')); }, [load]);
  const request = async (body: Record<string, unknown>) => {
    setMessage(''); setError('');
    const response = await fetch('/api/admin/operations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? 'Operation failed.'); return null; }
    await load();
    return data;
  };
  const createRoute = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await request({ entity: 'route', ...routeForm, stops: routeForm.stops.split(',') });
    if (result) { setRouteForm({ source: '', destination: '', distanceKm: '65', estimatedMins: '120', baseFare: '650', stops: '' }); setMessage('Route saved and activated.'); }
  };
  const createSchedule = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await request({ entity: 'schedule', ...scheduleForm });
    if (result) setMessage(result.conflict ? `Draft created with conflict: ${result.conflict}` : 'Schedule draft created.');
  };
  const routeName = (routeId: string) => { const route = routes.find((item) => item.id === routeId); return route ? `${route.source} → ${route.destination}` : routeId; };

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-400">Operations control</p><h2 className="mt-1 text-2xl font-extrabold">{mode === 'routes' ? 'Routes & stops' : 'Schedules & dispatch'}</h2><p className="mt-2 max-w-2xl text-sm text-slate-400">{mode === 'routes' ? 'Build active routes with ordered stops, travel time, distance, and pricing rules.' : 'Create dispatch drafts, detect bus or driver overlaps, then publish only conflict-free schedules.'}</p></div>{mode === 'routes' ? <Route size={34} className="text-blue-400" /> : <CalendarDays size={34} className="text-blue-400" />}</div>
    {(message || error) && <p role={error ? 'alert' : 'status'} className={`rounded-xl border p-4 text-sm font-bold ${error ? 'border-red-400/20 bg-red-500/10 text-red-300' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'}`}>{error || message}</p>}
    {mode === 'routes' ? <RouteWorkspace routes={routes} form={routeForm} setForm={setRouteForm} onSubmit={createRoute} onToggle={(route) => void request({ entity: 'route-toggle', routeId: route.id, active: !route.active })} /> : <ScheduleWorkspace routes={routes} schedules={schedules} form={scheduleForm} setForm={setScheduleForm} onSubmit={createSchedule} routeName={routeName} onStatus={(scheduleId, status) => void request({ entity: 'schedule-status', scheduleId, status })} />}
  </div>;
}

function RouteWorkspace({ routes, form, setForm, onSubmit, onToggle }: { routes: RouteRecord[]; form: RouteForm; setForm: (value: RouteForm) => void; onSubmit: (event: React.FormEvent) => void; onToggle: (route: RouteRecord) => void }) {
  return <><section className="rounded-3xl border border-white/10 bg-[#10182d] p-5 shadow-2xl shadow-black/20 sm:p-6"><div className="mb-5 flex items-center gap-2"><Plus className="text-blue-400" size={19} /><h3 className="text-lg font-extrabold">Create route</h3></div><form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2"><Field label="Origin" value={form.source} onChange={(value) => setForm({ ...form, source: value })} placeholder="Delhi" /><Field label="Destination" value={form.destination} onChange={(value) => setForm({ ...form, destination: value })} placeholder="Patiala" /><Field label="Distance (km)" type="number" value={form.distanceKm} onChange={(value) => setForm({ ...form, distanceKm: value })} /><Field label="Duration (minutes)" type="number" value={form.estimatedMins} onChange={(value) => setForm({ ...form, estimatedMins: value })} /><Field label="Base fare (₹)" type="number" value={form.baseFare} onChange={(value) => setForm({ ...form, baseFare: value })} /><Field label="Stops, separated by commas" value={form.stops} onChange={(value) => setForm({ ...form, stops: value })} placeholder="Panipat, Ambala, Rajpura" /><button className="btn-pill btn-primary mt-2 min-h-12 px-5 sm:col-span-2"><Save size={17} /> Save active route</button></form></section><section className="grid gap-4">{routes.map((route) => <article key={route.id} className="rounded-2xl border border-white/10 bg-[#10182d] p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="rounded bg-blue-400/10 px-2 py-1 font-mono text-xs font-bold text-blue-300">{route.id}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${route.active ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{route.active ? 'Active' : 'Paused'}</span></div><h3 className="mt-3 text-xl font-extrabold">{route.source} <span className="text-blue-400">→</span> {route.destination}</h3><p className="mt-1 text-sm text-slate-500">{route.distanceKm} km · {route.estimatedMins} min · ₹{route.baseFare.toLocaleString('en-IN')}</p></div><button type="button" onClick={() => onToggle(route)} className="btn-pill btn-secondary px-3 py-2 text-xs">{route.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} {route.active ? 'Pause route' : 'Activate'}</button></div><div className="mt-5 flex flex-wrap gap-2">{route.stops.map((stop, index) => <span key={stop} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b1225] px-3 py-2 text-xs font-bold text-slate-300"><span className="text-blue-400">{index + 1}</span>{stop}</span>)}</div></article>)}</section></>;
}

function ScheduleWorkspace({ routes, schedules, form, setForm, onSubmit, routeName, onStatus }: { routes: RouteRecord[]; schedules: ScheduleRecord[]; form: { routeId: string; busId: string; driverId: string; departure: string; arrival: string }; setForm: (value: { routeId: string; busId: string; driverId: string; departure: string; arrival: string }) => void; onSubmit: (event: React.FormEvent) => void; routeName: (id: string) => string; onStatus: (id: string, status: string) => void }) {
  const visibleSchedules = schedules.filter((schedule) => schedule.status !== 'CANCELLED');
  return <><section className="rounded-3xl border border-white/10 bg-[#10182d] p-5 shadow-2xl shadow-black/20 sm:p-6"><div className="mb-5 flex items-center gap-2"><Plus className="text-blue-400" size={19} /><h3 className="text-lg font-extrabold">Create dispatch schedule</h3></div><form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2"><Select label="Active route" value={form.routeId} options={routes.filter((route) => route.active).map((route) => route.id)} onChange={(value) => setForm({ ...form, routeId: value })} /><Select label="Bus" value={form.busId} options={buses} onChange={(value) => setForm({ ...form, busId: value })} /><Select label="Driver" value={form.driverId} options={drivers} onChange={(value) => setForm({ ...form, driverId: value })} /><div className="grid gap-4 sm:col-span-2 sm:grid-cols-2"><Field label="Departure" type="datetime-local" value={form.departure} onChange={(value) => setForm({ ...form, departure: value })} /><Field label="Arrival" type="datetime-local" value={form.arrival} onChange={(value) => setForm({ ...form, arrival: value })} /></div><button disabled={!routes.length} className="btn-pill btn-primary mt-2 min-h-12 px-5 sm:col-span-2"><CalendarDays size={17} /> Create schedule draft</button></form></section><section className="space-y-3">{visibleSchedules.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">No active schedules. Cancelled schedules are hidden.</div>}{visibleSchedules.map((schedule) => <article key={schedule.id} className="rounded-2xl border border-white/10 bg-[#10182d] p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-blue-300">{schedule.id}</span><Status status={schedule.status} /></div><h3 className="mt-2 text-lg font-extrabold">{routeName(schedule.routeId)}</h3><p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400"><Clock3 size={14} /> {new Date(schedule.departure).toLocaleString()} <span>→</span> {new Date(schedule.arrival).toLocaleTimeString()}</p><p className="mt-1 text-xs text-slate-500">{schedule.busId} · {schedule.driverId}</p></div><div className="flex flex-wrap gap-2">{schedule.conflict && <span className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300"><AlertTriangle size={14} /> {schedule.conflict}</span>}{schedule.status === 'DRAFT' && <button type="button" disabled={Boolean(schedule.conflict)} onClick={() => onStatus(schedule.id, 'PUBLISHED')} className="btn-pill btn-primary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"><Check size={15} /> Publish</button>}{schedule.status !== 'CANCELLED' && <button type="button" onClick={() => onStatus(schedule.id, 'CANCELLED')} className="btn-pill btn-secondary px-4 py-2 text-xs"><X size={15} /> Cancel</button>}</div></div></article>)}</section></>;
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <label className="block text-sm font-bold text-slate-300">{label}<input required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /></label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="block text-sm font-bold text-slate-300">{label}<span className="relative mt-2 block"><select required value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#0b1225] px-4 pr-9 text-sm text-white outline-none focus:border-blue-400">{options.length === 0 && <option value="">No active options</option>}{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-slate-500" /></span></label>; }
function Status({ status }: { status: string }) { return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${status === 'PUBLISHED' ? 'bg-emerald-400/10 text-emerald-300' : status === 'CANCELLED' ? 'bg-slate-700 text-slate-400' : 'bg-amber-400/10 text-amber-300'}`}>{status}</span>; }
