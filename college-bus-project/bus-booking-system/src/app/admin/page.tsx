"use client";

import { Activity, AlertTriangle, Ban, BarChart3, Bus, CalendarDays, Check, CheckCircle2, Download, Edit3, LayoutDashboard, Map, MapPin, Plus, Search, Settings, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';
import AdminOperations from '@/components/AdminOperations';
import AccountMenu from '@/components/AccountMenu';
import { initialMockUsers, mockRoute, type MockStatus, type MockUser } from '@/data/mockData';

type Tab = 'Dashboard' | 'Live Users' | 'Fleet Management' | 'Routes & Stops' | 'Drivers' | 'Schedules' | 'Reports' | 'System Settings';
type Vehicle = { id: string; plate: string; type: string; seats: number; status: 'Active' | 'En Route' | 'Maintenance' };
const tabs: { label: Tab; icon: React.ReactNode }[] = [{ label: 'Dashboard', icon: <LayoutDashboard size={18} /> }, { label: 'Live Users', icon: <Users size={18} /> }, { label: 'Fleet Management', icon: <Bus size={18} /> }, { label: 'Routes & Stops', icon: <Map size={18} /> }, { label: 'Drivers', icon: <Users size={18} /> }, { label: 'Schedules', icon: <CalendarDays size={18} /> }, { label: 'Reports', icon: <BarChart3 size={18} /> }, { label: 'System Settings', icon: <Settings size={18} /> }];
const initialVehicles: Vehicle[] = [{ id: 'BUS-101', plate: 'PB-10-AB-1234', type: 'AC Express', seats: 42, status: 'En Route' }, { id: 'BUS-104', plate: 'PB-13-GH-8821', type: 'Volvo AC', seats: 44, status: 'Active' }, { id: 'BUS-201', plate: 'DL-01-AB-2011', type: 'AC Sleeper', seats: 36, status: 'Active' }, { id: 'BUS-315', plate: 'PB-31-MN-4412', type: 'Sleeper', seats: 30, status: 'Maintenance' }];
const driverRows = [{ name: 'Rajesh Kumar', id: 'D-014', phone: '+91 98765 43210', route: 'Patiala → Chandigarh', duty: 'On Shift', rating: '4.9' }, { name: 'Amit Singh', id: 'D-088', phone: '+91 98111 20045', route: 'Delhi → Manali', duty: 'On Shift', rating: '4.7' }, { name: 'Gurpreet Kaur', id: 'D-031', phone: '+91 99887 12003', route: 'Delhi → Patiala', duty: 'Off Duty', rating: '4.8' }];
type DriverRecord = (typeof driverRows)[number];

type Trip = { status: string; vehicleId: string; from: string; to: string; currentStopIndex: number; stops: string[]; passengers: { boarded: boolean }[] };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [users, setUsers] = useState<MockUser[]>(() => initialMockUsers.map((user) => ({ ...user })));
  const [addUserOpen, setAddUserOpen] = useState(false);
  const trip: Trip = {
    status: 'RUNNING',
    vehicleId: 'DL-1PC-4821',
    from: 'Connaught Place',
    to: 'North Campus',
    currentStopIndex: 0,
    stops: mockRoute.map((point) => point.locationName),
    passengers: [{ boarded: true }, { boarded: true }, { boarded: false }],
  };
  const updateUserStatus = (id: string, action: 'approve' | 'suspend' | 'resolve' | 'unblock') => {
    setUsers((current) => current.map((user) => {
      if (user.id !== id) return user;
      if (action === 'approve') {
        const point = mockRoute[user.routeIndex] ?? mockRoute[0];
        return { ...user, status: 'Live', isBlocked: false, speed: point.speed, eta: point.eta };
      }
      if (action === 'suspend') return { ...user, status: 'Idle', isBlocked: true, speed: 0, eta: 'Suspended' };
      if (action === 'unblock') return { ...user, status: 'Idle', isBlocked: false, eta: 'Off duty' };
      return { ...user, status: 'Idle', speed: 0, eta: 'Alert resolved' };
    }));
  };
  const addUser = (newUser: Omit<MockUser, 'id'>) => {
    setUsers((current) => {
      const nextId = current.reduce((next, user) => {
        const match = user.id.match(/^USR-(\d+)$/);
        return match ? Math.max(next, Number(match[1]) + 1) : next;
      }, 1001);
      return [...current, { ...newUser, id: `USR-${nextId}` }];
    });
    setAddUserOpen(false);
  };
  const tableProps = { users, onAddUser: () => setAddUserOpen(true), onStatusChange: updateUserStatus };
  const content = activeTab === 'Routes & Stops'
    ? <AdminOperations mode="routes" />
    : activeTab === 'Schedules'
      ? <AdminOperations mode="schedules" />
      : activeTab === 'Fleet Management'
        ? <Fleet vehicles={vehicles} setVehicles={setVehicles} />
        : activeTab === 'Live Users'
          ? <LiveUsersTable {...tableProps} />
          : activeTab === 'Drivers'
            ? <Drivers />
            : activeTab === 'Reports'
              ? <Reports />
              : activeTab === 'Dashboard'
                ? <Dashboard trip={trip} {...tableProps} />
                : <Panel title="System Settings" text="Platform configuration, taxes, access policy, and notification preferences." />;
  return <>
    <div className="flex min-h-screen bg-[#080d1c] font-sans text-slate-100"><aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0b1225] md:flex md:flex-col"><div className="flex items-center gap-3 border-b border-white/10 px-6 py-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-slate-950"><Bus size={23} /></span><div><p className="text-lg font-extrabold">Omni<span className="text-blue-400">Admin</span></p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Operations centre</p></div></div><nav className="flex-1 space-y-1 p-4">{tabs.map((tab) => <button type="button" key={tab.label} onClick={() => setActiveTab(tab.label)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${activeTab === tab.label ? 'bg-blue-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{tab.icon}{tab.label}</button>)}</nav><div className="m-4 rounded-2xl border border-white/10 bg-[#10182d] p-4 text-sm text-emerald-400">● Systems online<p className="mt-2 text-xs text-slate-500">Operations ready</p></div></aside><main className="min-w-0 flex-1 overflow-y-auto"><header className="sticky top-0 z-20 border-b border-white/10 bg-[#080d1c]/90 px-5 py-4 backdrop-blur sm:px-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-400">OmniAdmin / {activeTab}</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{activeTab}</h1></div><AccountMenu role="Admin" dark /></div><div className="mt-4 flex gap-2 overflow-x-auto md:hidden">{tabs.map((tab) => <button type="button" key={tab.label} onClick={() => setActiveTab(tab.label)} className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${activeTab === tab.label ? 'bg-blue-500 text-slate-950' : 'bg-[#10182d] text-slate-400'}`}>{tab.icon}{tab.label}</button>)}</div></header><div className="p-5 sm:p-8">{content}</div></main></div>
    {addUserOpen && <AddUserModal onClose={() => setAddUserOpen(false)} onAdd={addUser} />}
  </>;
}

function Dashboard({
  trip,
  users,
  onAddUser,
  onStatusChange,
}: {
  trip: Trip | null;
  users: MockUser[];
  onAddUser: () => void;
  onStatusChange: (id: string, action: 'approve' | 'suspend' | 'resolve' | 'unblock') => void;
}) {
  const boarded = trip?.passengers.filter((passenger) => passenger.boarded).length ?? 0;
  const activeTrips = users.filter((user) => user.status === 'Live').length;
  const completedTrips = users.reduce((total, user) => total + user.completedTrips, 0);
  const activeAlerts = users.filter((user) => user.status === 'Alert').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Users />} label="Total Users" value={String(users.length)} detail="Demo users and drivers" />
        <Metric icon={<Activity />} label="Active Live Trips" value={String(activeTrips)} detail="Currently on the road" />
        <Metric icon={<CheckCircle2 />} label="Completed Trips" value={String(completedTrips)} detail="Across the fleet" />
        <Metric icon={<AlertTriangle />} label="Active Alerts" value={String(activeAlerts)} detail="Needs administrator review" />
      </div>
      <LiveUsersTable users={users} onAddUser={onAddUser} onStatusChange={onStatusChange} />
      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Live operations</p>
        <h2 className="mt-2 text-xl font-extrabold">{trip ? `${trip.vehicleId} · ${trip.from} → ${trip.to}` : 'Trip feed unavailable'}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Info label="Status" value={trip?.status ?? 'Not connected'} />
          <Info label="Current stop" value={trip?.stops[trip.currentStopIndex] ?? '—'} />
          <Info label="Boarded" value={`${boarded}/${trip?.passengers.length ?? 0}`} />
        </div>
      </section>
    </div>
  );
}

function LiveUsersTable({
  users,
  onAddUser,
  onStatusChange,
}: {
  users: MockUser[];
  onAddUser: () => void;
  onStatusChange: (id: string, action: 'approve' | 'suspend' | 'resolve' | 'unblock') => void;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MockStatus>('All');
  const filteredUsers = users.filter((user) => {
    const matchesQuery = `${user.id} ${user.name} ${user.role} ${user.vehicleNumber} ${user.currentLocation}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (statusFilter === 'All' || user.status === statusFilter);
  });
  const statusStyles: Record<MockStatus, string> = {
    Live: 'bg-emerald-400/15 text-emerald-300',
    Idle: 'bg-slate-400/15 text-slate-300',
    Pending: 'bg-amber-400/15 text-amber-300',
    Alert: 'bg-red-400/15 text-red-300',
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#10182d] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Live users and fleet management</p>
          <h2 className="mt-1 text-2xl font-extrabold">People on the road</h2>
        </div>
        <button type="button" onClick={onAddUser} className="btn-pill btn-primary px-4 py-3"><Plus size={17} /> Add New</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search size={17} className="absolute left-3 top-3 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, ID, vehicle, or location" className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] pl-10 pr-4 text-sm text-white outline-none focus:border-blue-400" />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | MockStatus)} className="h-11 rounded-xl border border-white/10 bg-[#0b1225] px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-blue-400">
            {['All', 'Live', 'Idle', 'Pending', 'Alert'].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead><tr className="text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">ID</th><th className="pb-3">Name</th><th className="pb-3">Role / Vehicle</th><th className="pb-3">Current location</th><th className="pb-3">Speed / ETA</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-white/10 align-top">
                <td className="py-4 font-mono text-xs font-bold text-slate-400">{user.id}</td>
                <td className="py-4 font-bold text-white">{user.name}</td>
                <td className="py-4"><span className="block text-slate-300">{user.role}</span><span className="mt-1 block font-mono text-xs text-slate-500">{user.vehicleNumber}</span></td>
                <td className="max-w-56 py-4 text-slate-300">{user.currentLocation}</td>
                <td className="py-4"><span className="block text-slate-300">{user.speed} km/h</span><span className="mt-1 block text-xs text-slate-500">{user.eta}</span></td>
                <td className="py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[user.status]}`}>{user.status}</span>{user.isBlocked && <span className="mt-1 block text-[10px] font-bold uppercase text-red-300">Blocked</span>}</td>
                <td className="py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {user.status === 'Pending' && <button type="button" onClick={() => onStatusChange(user.id, 'approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-400/10 px-2.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/20"><Check size={14} /> Approve</button>}
                    {user.status === 'Alert' && <button type="button" onClick={() => onStatusChange(user.id, 'resolve')} className="inline-flex items-center gap-1 rounded-lg bg-blue-400/10 px-2.5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-400/20"><CheckCircle2 size={14} /> Resolve</button>}
                    {user.isBlocked
                      ? <button type="button" onClick={() => onStatusChange(user.id, 'unblock')} className="rounded-lg bg-emerald-400/10 px-2.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/20">Unblock</button>
                      : user.status !== 'Pending' && user.status !== 'Alert' && <button type="button" onClick={() => onStatusChange(user.id, 'suspend')} className="inline-flex items-center gap-1 rounded-lg bg-red-400/10 px-2.5 py-2 text-xs font-bold text-red-300 hover:bg-red-400/20"><Ban size={14} /> Suspend</button>}
                    <a href={`/track?demoUser=${encodeURIComponent(user.id)}&demoName=${encodeURIComponent(user.name)}&demoRouteIndex=${user.routeIndex}`} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white"><MapPin size={14} /> View on Map</a>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredUsers.length && <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-500">No users match the current search or status filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (user: Omit<MockUser, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Driver' | 'Passenger'>('Driver');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const firstPoint = mockRoute[0];

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd({
      name: name.trim(),
      role,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      status: 'Pending',
      currentLocation: firstPoint.locationName,
      speed: 0,
      eta: 'Awaiting approval',
      coords: [firstPoint.lat, firstPoint.lng],
      routeIndex: 0,
      completedTrips: 0,
      isBlocked: false,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="add-user-title">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#10182d] p-6 text-white shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-blue-300">Fleet management</p><h2 id="add-user-title" className="mt-1 text-2xl font-extrabold">Add a user or driver</h2></div>
          <button type="button" onClick={onClose} aria-label="Close form" className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={19} /></button>
        </div>
      <p className="mt-2 text-sm text-slate-400">New users appear immediately with pending status.</p>
        <label className="mt-6 block text-sm font-bold text-slate-300">Full name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Maya Kapoor" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-3 text-sm text-white outline-none focus:border-blue-400" /></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-300">Role<select value={role} onChange={(event) => setRole(event.target.value as 'Driver' | 'Passenger')} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-3 text-sm text-white outline-none focus:border-blue-400"><option>Driver</option><option>Passenger</option></select></label>
          <label className="block text-sm font-bold text-slate-300">Vehicle number<input required value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)} placeholder="DL-1PC-1234" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-3 text-sm uppercase text-white outline-none focus:border-blue-400" /></label>
        </div>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-pill border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5">Cancel</button><button type="submit" className="btn-pill btn-primary px-5 py-3 text-sm"><Plus size={16} /> Add user</button></div>
      </form>
    </div>
  );
}

function Fleet({ vehicles, setVehicles }: { vehicles: Vehicle[]; setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>> }) { const [query, setQuery] = useState(''); const filtered = vehicles.filter((vehicle) => `${vehicle.id} ${vehicle.plate} ${vehicle.type}`.toLowerCase().includes(query.toLowerCase())); return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-400">Fleet inventory</p><h2 className="mt-1 text-2xl font-extrabold">Manage buses and availability</h2></div><button type="button" onClick={() => setVehicles((current) => { const nextNumber = current.reduce((max, vehicle) => Math.max(max, Number(vehicle.id.replace('BUS-', '')) || 0), 299) + 1; return [...current, { id: `BUS-${nextNumber}`, plate: `PB-00-AB-${String(nextNumber).padStart(4, '0')}`, type: 'AC Seater', seats: 42, status: 'Active' }]; })} className="btn-pill btn-primary px-4 py-3"><Plus size={17} /> Add bus</button></div><section className="rounded-3xl border border-white/10 bg-[#10182d] p-5"><label className="relative block"><Search size={17} className="absolute left-3 top-3 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search bus ID, plate, or type" className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] pl-10 pr-4 text-sm text-white outline-none focus:border-blue-400" /></label><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Bus</th><th className="pb-3">Plate</th><th className="pb-3">Type</th><th className="pb-3">Seats</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead><tbody>{filtered.map((vehicle) => <tr key={vehicle.id} className="border-t border-white/10"><td className="py-4 font-bold text-white">{vehicle.id}</td><td className="py-4 font-mono text-xs text-slate-400">{vehicle.plate}</td><td className="py-4 text-slate-300">{vehicle.type}</td><td className="py-4 text-slate-300">{vehicle.seats}</td><td className="py-4"><span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-xs font-bold text-blue-300">{vehicle.status}</span></td><td className="py-4"><button type="button" aria-label={`Remove ${vehicle.id}`} onClick={() => setVehicles((current) => current.filter((item) => item.id !== vehicle.id))} className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={17} /></button></td></tr>)}</tbody></table></div></section></div>; }

function Drivers() {
  const [drivers, setDrivers] = useState<DriverRecord[]>(driverRows);
  const [editingDriver, setEditingDriver] = useState<DriverRecord | null>(null);

  const saveDriver = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingDriver) return;
    setDrivers((current) => current.map((driver) => driver.id === editingDriver.id ? editingDriver : driver));
    setEditingDriver(null);
  };

  return (
    <div className="space-y-6">
      <div><p className="text-sm text-slate-400">Workforce operations</p><h2 className="mt-1 text-2xl font-extrabold">Driver roster</h2></div>
      <section className="rounded-3xl border border-white/10 bg-[#10182d] p-5">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Driver</th><th className="pb-3">Contact</th><th className="pb-3">Assigned route</th><th className="pb-3">Duty</th><th className="pb-3">Rating</th><th className="pb-3">Action</th></tr></thead>
          <tbody>{drivers.map((driver) => <tr key={driver.id} className="border-t border-white/10"><td className="py-4"><strong className="block text-white">{driver.name}</strong><span className="text-xs text-slate-500">{driver.id}</span></td><td className="py-4 text-slate-400">{driver.phone}</td><td className="py-4 text-slate-300">{driver.route}</td><td className="py-4"><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">{driver.duty}</span></td><td className="py-4 font-bold text-amber-300">★ {driver.rating}</td><td className="py-4"><button type="button" aria-label={`Edit ${driver.name}`} onClick={() => setEditingDriver({ ...driver })} className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-blue-300"><Edit3 size={17} /></button></td></tr>)}</tbody>
        </table></div>
      </section>
      {editingDriver && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="edit-driver-title">
        <form onSubmit={saveDriver} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#10182d] p-6 text-white shadow-2xl">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-300">Driver roster</p><h2 id="edit-driver-title" className="mt-1 text-2xl font-extrabold">Edit driver</h2></div><button type="button" onClick={() => setEditingDriver(null)} aria-label="Close driver form" className="rounded-full p-2 text-slate-400 hover:bg-white/10"><X size={19} /></button></div>
          <label className="mt-5 block text-sm font-bold text-slate-300">Name<input required value={editingDriver.name} onChange={(event) => setEditingDriver({ ...editingDriver, name: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-3 text-white" /></label>
          <label className="mt-4 block text-sm font-bold text-slate-300">Phone<input required value={editingDriver.phone} onChange={(event) => setEditingDriver({ ...editingDriver, phone: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-3 text-white" /></label>
          <label className="mt-4 block text-sm font-bold text-slate-300">Assigned route<input required value={editingDriver.route} onChange={(event) => setEditingDriver({ ...editingDriver, route: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-3 text-white" /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-slate-300">Duty<select value={editingDriver.duty} onChange={(event) => setEditingDriver({ ...editingDriver, duty: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-3 text-white"><option>On Shift</option><option>Off Duty</option></select></label><label className="block text-sm font-bold text-slate-300">Rating<input required type="number" min="0" max="5" step="0.1" value={editingDriver.rating} onChange={(event) => setEditingDriver({ ...editingDriver, rating: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1225] px-3 text-white" /></label></div>
          <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setEditingDriver(null)} className="btn-pill border border-white/10 px-4 py-3 text-sm text-slate-300">Cancel</button><button type="submit" className="btn-pill btn-primary px-5 py-3 text-sm"><Check size={16} /> Save changes</button></div>
        </form>
      </div>}
    </div>
  );
}

function Reports() {
  const exportReport = () => {
    const rows = [
      ['Metric', 'Value', 'Period'],
      ['Gross ticket sales', '₹12.8L', 'Last 7 days'],
      ['Published trips', '248', '96% on time'],
      ['Seat occupancy', '84%', 'Across active routes'],
      ['Delhi → Patiala occupancy', '92%', '₹4.2L revenue'],
      ['Patiala → Chandigarh occupancy', '87%', '₹2.8L revenue'],
      ['Chandigarh → Shimla occupancy', '79%', '₹1.9L revenue'],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'omnibus-report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-400">Financial and operations summary</p><h2 className="mt-1 text-2xl font-extrabold">Reports</h2></div><button type="button" onClick={exportReport} className="btn-pill btn-secondary px-4 py-3"><Download size={17} /> Export report</button></div><div className="grid gap-4 sm:grid-cols-3"><Metric icon={<BarChart3 />} label="Gross ticket sales" value="₹12.8L" detail="Last 7 days" /><Metric icon={<Activity />} label="Published trips" value="248" detail="96% on time" /><Metric icon={<CheckCircle2 />} label="Seat occupancy" value="84%" detail="Across active routes" /></div><section className="rounded-3xl border border-white/10 bg-[#10182d] p-5"><h3 className="text-lg font-extrabold">Route performance</h3><div className="mt-5 space-y-3">{[['Delhi → Patiala', '92%', '₹4.2L'], ['Patiala → Chandigarh', '87%', '₹2.8L'], ['Chandigarh → Shimla', '79%', '₹1.9L']].map(([route, occupancy, revenue]) => <div key={route} className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-[#0b1225] p-4"><span className="flex-1 font-bold text-white">{route}</span><span className="text-sm text-emerald-300">{occupancy} occupancy</span><span className="font-bold text-blue-300">{revenue}</span></div>)}</div></section></div>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) { return <section className="rounded-2xl border border-white/10 bg-[#10182d] p-5"><div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-400">{label}</p><span className="rounded-xl bg-blue-400/10 p-2 text-blue-300">{icon}</span></div><p className="mt-5 text-3xl font-extrabold">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p></section>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-[#0b1225] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 font-extrabold text-white">{value}</p></div>; }
function Panel({ title, text }: { title: string; text: string }) { return <section className="rounded-3xl border border-white/10 bg-[#10182d] p-8"><h2 className="text-2xl font-extrabold">{title}</h2><p className="mt-3 max-w-2xl leading-7 text-slate-400">{text}</p></section>; }
