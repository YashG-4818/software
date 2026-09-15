import { NextResponse } from 'next/server';
import { addTripEvent, getTripState, registerTripPassenger, updateTripState, type TripStatus } from '@/lib/trip-state';

export function GET() {
  return NextResponse.json(getTripState());
}

export async function PATCH(request: Request) {
  const body = await request.json() as { action?: string; pnr?: string; status?: TripStatus; delayMinutes?: number; delayReason?: string; vehicleId?: string; registrationNumber?: string; from?: string; to?: string; operator?: string; busType?: string; stops?: string[]; scheduledDeparture?: string; scheduledArrival?: string; passenger?: { name?: string; seatNumber?: string; pnr?: string }; passengers?: { name?: string; seatNumber?: string; pnr?: string }[] };
  if (body.action === 'BOOK') {
    const passengers = body.passengers ?? (body.passenger ? [body.passenger] : []);
    if (passengers.length && passengers.every((passenger) => passenger.name && passenger.seatNumber && passenger.pnr)) {
      passengers.forEach((passenger) => registerTripPassenger({ name: passenger.name!, seatNumber: passenger.seatNumber!, pnr: passenger.pnr!, vehicleId: body.vehicleId, registrationNumber: body.registrationNumber, from: body.from, to: body.to, operator: body.operator, busType: body.busType, stops: body.stops, scheduledDeparture: body.scheduledDeparture, scheduledArrival: body.scheduledArrival }));
      return NextResponse.json(getTripState());
    }
  }

  const currentTrip = getTripState();
  if (body.action === 'START' && currentTrip.status === 'COMPLETED') return NextResponse.json({ error: 'This trip has already completed.' }, { status: 409 });
  if (body.action === 'COMPLETE' && !['RUNNING', 'DELAYED'].includes(currentTrip.status)) return NextResponse.json({ error: 'Start the trip before ending it.' }, { status: 409 });
  if (body.action === 'DELAY' && !['RUNNING', 'DELAYED'].includes(currentTrip.status)) return NextResponse.json({ error: 'A delay can only be reported after the trip starts.' }, { status: 409 });

  const state = updateTripState((trip) => {
    if (body.action === 'START') { trip.status = 'RUNNING'; trip.startedAt = new Date().toISOString(); trip.liveTrackingAvailable = true; addTripEvent(trip, 'TRIP_STARTED', 'Driver started the trip and live GPS is active'); }
    if (body.action === 'COMPLETE') { trip.status = 'COMPLETED'; trip.liveTrackingAvailable = false; addTripEvent(trip, 'TRIP_COMPLETED', 'Driver completed the trip; live GPS is now offline'); }
    if (body.action === 'DELAY') { trip.status = 'DELAYED'; trip.liveTrackingAvailable = true; trip.delayMinutes += Math.max(5, Math.min(body.delayMinutes || 15, 180)); trip.delayReason = body.delayReason?.trim() || 'Delay reported by driver'; addTripEvent(trip, 'TRIP_DELAYED', `${trip.delayReason} (+${body.delayMinutes || 15} minutes)`); }
    if (body.action === 'NEXT_STOP') { trip.currentStopIndex = Math.min(trip.currentStopIndex + 1, trip.stops.length - 1); addTripEvent(trip, 'STOP_UPDATED', `Bus reached ${trip.stops[trip.currentStopIndex]}`); }
    if (body.action === 'BOARD' && body.pnr) {
      const passenger = trip.passengers.find((item) => item.pnr === body.pnr);
      if (passenger) { passenger.boarded = true; addTripEvent(trip, 'PASSENGER_BOARDED', `${passenger.name} boarded at ${trip.stops[trip.currentStopIndex]}`); }
    }
    if (body.action === 'UNBOARD' && body.pnr) {
      const passenger = trip.passengers.find((item) => item.pnr === body.pnr);
      if (passenger) { passenger.boarded = false; addTripEvent(trip, 'PASSENGER_UNBOARDED', `${passenger.name} marked as not boarded`); }
    }
    if (body.status) trip.status = body.status;
  });
  return NextResponse.json(state);
}
