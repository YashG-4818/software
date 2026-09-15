import { NextResponse } from 'next/server';

type RouteRecord = {
  id: string;
  source: string;
  destination: string;
  distanceKm: number;
  estimatedMins: number;
  baseFare: number;
  stops: string[];
  active: boolean;
  updatedAt: string;
};

type ScheduleRecord = {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  departure: string;
  arrival: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  conflict: string | null;
};

type OperationStore = { routes: RouteRecord[]; schedules: ScheduleRecord[]; sequence: number };

const initialRoutes: RouteRecord[] = [
  { id: 'R-08', source: 'Patiala', destination: 'Chandigarh', distanceKm: 65, estimatedMins: 135, baseFare: 650, stops: ['Rajpura Bypass', 'Zirakpur'], active: true, updatedAt: new Date().toISOString() },
  { id: 'R-14', source: 'Delhi', destination: 'Manali', distanceKm: 540, estimatedMins: 630, baseFare: 1450, stops: ['Chandigarh', 'Mandi'], active: true, updatedAt: new Date().toISOString() },
  { id: 'R-21', source: 'Chandigarh', destination: 'Shimla', distanceKm: 115, estimatedMins: 225, baseFare: 850, stops: ['Panchkula', 'Kalka'], active: true, updatedAt: new Date().toISOString() },
  { id: 'R-22', source: 'Delhi', destination: 'Patiala', distanceKm: 235, estimatedMins: 270, baseFare: 760, stops: ['Panipat', 'Ambala', 'Rajpura'], active: true, updatedAt: new Date().toISOString() },
];

const store = globalThis as typeof globalThis & { omniAdminOperations?: OperationStore };
function getStore() {
  store.omniAdminOperations ??= { routes: structuredClone(initialRoutes), schedules: [], sequence: 100 };
  return store.omniAdminOperations;
}
function id(prefix: string) { const state = getStore(); state.sequence += 1; return `${prefix}-${state.sequence}`; }
function overlaps(startA: number, endA: number, startB: number, endB: number) { return startA < endB && startB < endA; }

export function GET() {
  return NextResponse.json(getStore());
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const state = getStore();

  if (body.entity === 'route') {
    const source = String(body.source ?? '').trim();
    const destination = String(body.destination ?? '').trim();
    const stops = Array.isArray(body.stops) ? body.stops.map(String).map((stop) => stop.trim()).filter(Boolean) : [];
    const distanceKm = Number(body.distanceKm);
    const estimatedMins = Number(body.estimatedMins);
    const baseFare = Number(body.baseFare);
    if (!source || !destination || source.toLowerCase() === destination.toLowerCase()) return NextResponse.json({ error: 'Origin and destination must be different.' }, { status: 400 });
    if (!stops.length || !Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(estimatedMins) || estimatedMins <= 0 || !Number.isFinite(baseFare) || baseFare < 0) return NextResponse.json({ error: 'Add at least one stop and valid distance, duration, and fare values.' }, { status: 400 });
    const duplicate = state.routes.find((route) => route.active && route.source.toLowerCase() === source.toLowerCase() && route.destination.toLowerCase() === destination.toLowerCase());
    if (duplicate) return NextResponse.json({ error: 'An active route already exists for this origin and destination.' }, { status: 409 });
    const route: RouteRecord = { id: id('R'), source, destination, stops, distanceKm, estimatedMins, baseFare, active: true, updatedAt: new Date().toISOString() };
    state.routes.unshift(route);
    return NextResponse.json(route, { status: 201 });
  }

  if (body.entity === 'route-toggle') {
    const route = state.routes.find((item) => item.id === body.routeId);
    if (!route) return NextResponse.json({ error: 'Route not found.' }, { status: 404 });
    route.active = Boolean(body.active);
    route.updatedAt = new Date().toISOString();
    return NextResponse.json(route);
  }

  if (body.entity === 'schedule') {
    const routeId = String(body.routeId ?? '');
    const busId = String(body.busId ?? '').trim();
    const driverId = String(body.driverId ?? '').trim();
    const departure = String(body.departure ?? '');
    const arrival = String(body.arrival ?? '');
    const route = state.routes.find((item) => item.id === routeId && item.active);
    const start = Date.parse(departure);
    const end = Date.parse(arrival);
    if (!route || !busId || !driverId || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) return NextResponse.json({ error: 'Choose an active route, bus, driver, and valid departure and arrival times.' }, { status: 400 });
    const conflict = state.schedules.find((item) => item.status !== 'CANCELLED' && (item.busId === busId || item.driverId === driverId) && overlaps(start, end, Date.parse(item.departure), Date.parse(item.arrival)));
    const schedule: ScheduleRecord = { id: id('SCH'), routeId, busId, driverId, departure, arrival, status: 'DRAFT', conflict: conflict ? `Overlaps ${conflict.id} on ${conflict.busId === busId ? 'the selected bus' : 'the selected driver'}.` : null };
    state.schedules.unshift(schedule);
    return NextResponse.json(schedule, { status: 201 });
  }

  if (body.entity === 'schedule-status') {
    const schedule = state.schedules.find((item) => item.id === body.scheduleId);
    if (!schedule) return NextResponse.json({ error: 'Schedule not found.' }, { status: 404 });
    if (body.status === 'PUBLISHED' && schedule.conflict) return NextResponse.json({ error: schedule.conflict }, { status: 409 });
    schedule.status = body.status === 'CANCELLED' ? 'CANCELLED' : 'PUBLISHED';
    return NextResponse.json(schedule);
  }

  return NextResponse.json({ error: 'Unsupported operations request.' }, { status: 400 });
}
