export type TripStatus = 'SCHEDULED' | 'RUNNING' | 'DELAYED' | 'COMPLETED';

export type TripPassenger = {
  id: number;
  name: string;
  seatNumber: string;
  pnr: string;
  boarded: boolean;
};

export type TripEvent = {
  id: number;
  type: 'BOOKING' | 'TRIP_STARTED' | 'TRIP_DELAYED' | 'STOP_UPDATED' | 'PASSENGER_BOARDED' | 'PASSENGER_UNBOARDED' | 'TRIP_COMPLETED';
  message: string;
  createdAt: string;
};

export type TripState = {
  vehicleId: string;
  registrationNumber: string;
  tripId: string;
  status: TripStatus;
  currentStopIndex: number;
  stops: string[];
  passengers: TripPassenger[];
  scheduledDeparture: string;
  scheduledArrival: string;
  startedAt: string | null;
  delayMinutes: number;
  delayReason: string | null;
  liveTrackingAvailable: boolean;
  events: TripEvent[];
  updatedAt: string;
  from: string;
  to: string;
  operator: string;
  busType: string;
};

const initialState: TripState = {
  vehicleId: 'BUS-101',
  registrationNumber: 'PB-10-AB-1234',
  tripId: 'TRIP-BUS-101',
  status: 'SCHEDULED',
  currentStopIndex: 0,
  stops: ['Patiala bus stand', 'Rajpura checkpoint', 'Zirakpur', 'Chandigarh ISBT'],
  passengers: [
    { id: 1, name: 'Aarav Sharma', seatNumber: '12A', pnr: 'OMNI482901', boarded: false },
    { id: 2, name: 'Meera Kapoor', seatNumber: '12B', pnr: 'OMNI482914', boarded: false },
    { id: 3, name: 'Kabir Singh', seatNumber: '14A', pnr: 'OMNI482928', boarded: false },
    { id: 4, name: 'Ananya Gupta', seatNumber: '14B', pnr: 'OMNI482933', boarded: false },
    { id: 5, name: 'Rohan Verma', seatNumber: '16A', pnr: 'OMNI482947', boarded: false },
    { id: 6, name: 'Simran Kaur', seatNumber: '16B', pnr: 'OMNI482956', boarded: false },
    { id: 7, name: 'Vikram Malhotra', seatNumber: '18A', pnr: 'OMNI482972', boarded: false },
    { id: 8, name: 'Ishita Bansal', seatNumber: '18B', pnr: 'OMNI482988', boarded: false },
  ],
  scheduledDeparture: '2026-09-03T18:00:00+05:30',
  scheduledArrival: '2026-09-03T20:15:00+05:30',
  startedAt: null,
  delayMinutes: 0,
  delayReason: null,
  liveTrackingAvailable: false,
  events: [],
  updatedAt: new Date().toISOString(),
  from: 'Patiala',
  to: 'Chandigarh',
  operator: 'OmniBus Elite',
  busType: 'AC Express',
};

const globalStore = globalThis as typeof globalThis & { omniBusTripState?: TripState; omniBusEventSequence?: number };

export function getTripState() {
  if (!globalStore.omniBusTripState) globalStore.omniBusTripState = structuredClone(initialState);
  const trip = globalStore.omniBusTripState;
  trip.events ??= [];
  trip.delayMinutes ??= 0;
  trip.startedAt ??= null;
  trip.delayReason ??= null;
  trip.liveTrackingAvailable ??= false;
  trip.from ??= initialState.from;
  trip.to ??= initialState.to;
  trip.operator ??= initialState.operator;
  trip.busType ??= initialState.busType;
  return trip;
}

export function updateTripState(update: (state: TripState) => void) {
  const state = getTripState();
  update(state);
  state.updatedAt = new Date().toISOString();
  return state;
}

export function addTripEvent(state: TripState, type: TripEvent['type'], message: string) {
  const nextEventId = Math.max(Date.now(), (globalStore.omniBusEventSequence ?? 0) + 1);
  globalStore.omniBusEventSequence = nextEventId;
  state.events.unshift({ id: nextEventId, type, message, createdAt: new Date().toISOString() });
  state.events = state.events.slice(0, 30);
}

export function registerTripPassenger(input: {
  name: string;
  seatNumber: string;
  pnr: string;
  vehicleId?: string;
  registrationNumber?: string;
  from?: string;
  to?: string;
  operator?: string;
  busType?: string;
  stops?: string[];
  scheduledDeparture?: string;
  scheduledArrival?: string;
}) {
  const vehicleId = input.vehicleId;
  return updateTripState((trip) => {
    const assignmentChanged = vehicleId && (vehicleId !== trip.vehicleId || trip.status === 'COMPLETED');
    if (assignmentChanged) {
      trip.vehicleId = vehicleId;
      trip.registrationNumber = input.registrationNumber || trip.registrationNumber;
      trip.tripId = `TRIP-${vehicleId}`;
      trip.from = input.from || trip.from;
      trip.to = input.to || trip.to;
      trip.operator = input.operator || trip.operator;
      trip.busType = input.busType || trip.busType;
      trip.stops = input.stops?.length ? input.stops : [trip.from, trip.to];
      trip.currentStopIndex = 0;
      trip.status = 'SCHEDULED';
      trip.liveTrackingAvailable = false;
      trip.startedAt = null;
      trip.delayMinutes = 0;
      trip.delayReason = null;
      trip.passengers = [];
      trip.events = [];
    }
    if (input.scheduledDeparture) trip.scheduledDeparture = input.scheduledDeparture;
    if (input.scheduledArrival) trip.scheduledArrival = input.scheduledArrival;
    if (trip.passengers.some((passenger) => passenger.pnr === input.pnr)) return;
    trip.passengers.push({ id: Math.max(0, ...trip.passengers.map((passenger) => passenger.id)) + 1, name: input.name, seatNumber: input.seatNumber, pnr: input.pnr, boarded: false });
    addTripEvent(trip, 'BOOKING', `${input.name} booked seat ${input.seatNumber}`);
  });
}
