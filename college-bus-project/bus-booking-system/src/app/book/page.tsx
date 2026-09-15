"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { Armchair, Info, Lock, ArrowRight, MapPin, BusFront, CalendarDays } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BUS_FLEET } from '@/lib/bus-data';

type SeatType = {
  id: string;
  row: number;
  col: string;
  type: 'STANDARD' | 'WOMEN_PRIORITY' | 'ELDERLY_PRIORITY';
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
  price: number;
};
type PassengerDetail = { name: string; age: string; gender: 'Male' | 'Female' | '' };

const TOTAL_ROWS = 10;
const TOTAL_COLS = ['A', 'B', 'C', 'D'];

function buildSeatLayout(availableSeatCount: number, seatPrice: number): SeatType[] {
  const normalizedAvailable = Math.max(0, Math.min(40, Math.floor(availableSeatCount)));
  const seats: SeatType[] = [];

  for (let row = 1; row <= TOTAL_ROWS; row += 1) {
    TOTAL_COLS.forEach((col) => {
      const seatIndex = seats.length;
      const baseSeat: SeatType = {
        id: `${row}${col}`,
        row,
        col,
        type: seatIndex < 2 ? 'WOMEN_PRIORITY' : seatIndex < 4 ? 'ELDERLY_PRIORITY' : 'STANDARD',
        status: seatIndex < normalizedAvailable ? 'AVAILABLE' : 'BOOKED',
        price: seatPrice,
      };
      seats.push(baseSeat);
    });
  }

  return seats;
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingPageFallback />}>
      <BookingPageContent />
    </Suspense>
  );
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicle') ?? 'BUS-101';
  const selectedBus = useMemo(
    () => BUS_FLEET.find((bus) => bus.vehicleId === vehicleId) ?? BUS_FLEET[0],
    [vehicleId],
  );
  const availableSeatCount = selectedBus.seatsLeft;
  const travelDate = searchParams.get('date') ?? '';
  const seatLayout = useMemo(() => buildSeatLayout(availableSeatCount, selectedBus.price), [availableSeatCount, selectedBus.price]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passengers, setPassengers] = useState<Record<string, PassengerDetail>>({});
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [tripGuarantee, setTripGuarantee] = useState(false);
  const [travelInsurance, setTravelInsurance] = useState(false);

  const getPassenger = (seatId: string): PassengerDetail => passengers[seatId] ?? { name: '', age: '', gender: '' };

  const toggleSeat = (seatId: string, status: 'AVAILABLE' | 'BOOKED' | 'LOCKED') => {
    if (status === 'BOOKED' || status === 'LOCKED') return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((current) => current.filter((id) => id !== seatId));
      return;
    }

    if (selectedSeats.length >= Math.min(6, seatLayout.filter((seat) => seat.status === 'AVAILABLE').length)) {
      alert('You can select up to 6 seats maximum.');
      return;
    }

    setSelectedSeats((current) => [...current, seatId]);
  };

  const totalFare = selectedSeats.reduce((sum, seatId) => {
    const seat = seatLayout.find((item) => item.id === seatId);
    return sum + (seat?.price || 500);
  }, 0);
  const addOnTotal = (freeCancellation ? 110 : 0) + (tripGuarantee ? 24 : 0) + (travelInsurance ? 15 : 0);

  const handleProceedToPayment = () => {
    if (!selectedBus || selectedSeats.length === 0) {
      alert('Please select at least one seat before proceeding.');
      return;
    }
    if (!phone.trim() || !email.trim() || selectedSeats.some((seat) => !passengers[seat]?.name.trim() || !passengers[seat]?.age || !passengers[seat]?.gender)) {
      alert('Complete contact details and every passenger detail before continuing.');
      return;
    }

    const draft = {
      vehicleId: selectedBus.vehicleId,
      registrationNumber: selectedBus.registrationNumber,
      route: `${selectedBus.from} -> ${selectedBus.to}`,
      from: selectedBus.from,
      to: selectedBus.to,
      date: travelDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      departure: `${selectedBus.departure} AM`,
      arrival: `${selectedBus.arrival} AM`,
      bus: selectedBus.operator,
      busType: selectedBus.type,
      seatCount: selectedSeats.length,
      selectedSeats,
      farePerSeat: selectedBus.price,
      totalFare,
      addOnTotal,
      passenger: passengers[selectedSeats[0]]?.name.trim() ?? '',
      phone: phone.trim(),
      email: email.trim(),
      passengers: selectedSeats.map((seat) => ({ seatNumber: seat, ...passengers[seat] })),
      addOns: { freeCancellation, tripGuarantee, travelInsurance },
      tripStops: selectedBus.route.map((stop) => stop.name),
      scheduledDeparture: `2026-09-03T${selectedBus.departure}:00+05:30`,
      scheduledArrival: `2026-09-03T${selectedBus.arrival}:00+05:30`,
    };

    localStorage.setItem('bookingDraft', JSON.stringify(draft));
    setIsLocking(true);
    setTimeout(() => {
      router.push('/payment');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-[#d9232e]">
            <BusFront size={29} strokeWidth={2.5} />
            <span className="text-xl font-extrabold tracking-tight">OmniBus</span>
          </button>
          <button onClick={() => router.push('/search')} className="btn-pill btn-secondary px-4 py-2 text-sm">Back to buses</button>
        </div>
      </header>
      
      <div className="mx-auto mb-6 max-w-6xl border-b border-slate-200 bg-white px-4 py-5 md:px-8">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#d9232e]">Choose your seats</p>
          <h1 className="text-2xl font-bold text-slate-900">{selectedBus?.operator ?? 'OmniBus Elite'} <span className="font-normal text-slate-400">• {selectedBus?.type ?? 'AC Express'}</span></h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <MapPin size={16} className="text-[#d9232e]" /> <span>{selectedBus?.from ?? 'Patiala'} <ArrowRight size={14} className="inline" /> {selectedBus?.to ?? 'Chandigarh'}</span>
            <span className="mx-1 text-slate-300">|</span>
            <CalendarDays size={15} /> <span>{travelDate || 'Selected travel date'}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-10 md:px-8 lg:grid-cols-3">
        <div className="border border-slate-200 bg-white p-5 shadow-sm md:p-8 lg:col-span-2">
          <div className="mb-8 flex w-full items-center justify-between border-b border-slate-100 px-4 pb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rear Exit</span>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <div className="w-3 h-1 bg-slate-300 rounded-full"></div>
              </div>
              <span className="text-xs font-semibold uppercase">Driver Cabin</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-max mx-auto">
            {Array.from({ length: TOTAL_ROWS }, (_, index) => index + 1).map((row) => (
              <div key={row} className="flex gap-6 items-center">
                <div className="flex gap-2">
                  {seatLayout.filter((seat) => seat.row === row && ['A', 'B'].includes(seat.col)).map((seat) => (
                    <SeatButton key={seat.id} seat={seat} isSelected={selectedSeats.includes(seat.id)} onClick={() => toggleSeat(seat.id, seat.status)} />
                  ))}
                </div>
                <div className="w-8 text-center text-slate-300 font-mono text-xs">{row}</div>
                <div className="flex gap-2">
                  {seatLayout.filter((seat) => seat.row === row && ['C', 'D'].includes(seat.col)).map((seat) => (
                    <SeatButton key={seat.id} seat={seat} isSelected={selectedSeats.includes(seat.id)} onClick={() => toggleSeat(seat.id, seat.status)} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4 border-t border-slate-100 pt-6 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-white border border-slate-300"></div> Available</div>
            <div className="flex items-center gap-1.5"><div className="h-3.5 w-3.5 rounded bg-[#d9232e]"></div> Selected</div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-pink-100 border border-pink-300"></div> Women Priority</div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-orange-100 border border-orange-300"></div> Elderly Priority</div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-slate-200"></div> Booked</div>
          </div>

          {selectedSeats.length > 0 && <div className="mt-8 space-y-5 border-t border-slate-100 pt-6">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#d9232e]">Passenger info</p><h2 className="mt-1 text-2xl font-extrabold text-slate-900">Contact and passenger details</h2><p className="mt-1 text-sm text-slate-500">Ticket details and trip updates will be sent to these details.</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Phone number<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#d9232e] focus:ring-2 focus:ring-red-100" /></label><label className="text-sm font-bold text-slate-700">Email ID<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#d9232e] focus:ring-2 focus:ring-red-100" /></label></div>
            <div className="space-y-3"><h3 className="text-lg font-extrabold text-slate-900">Passenger details</h3>{selectedSeats.map((seat, index) => { const passenger = getPassenger(seat); return <div key={seat} className="rounded-2xl border border-slate-200 p-4"><div className="mb-4 flex items-center justify-between"><div><p className="font-bold text-slate-900">Passenger {index + 1}</p><p className="text-sm text-slate-500">Seat {seat}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Required</span></div><div className="grid gap-3 sm:grid-cols-3"><input required value={passenger.name} onChange={(event) => setPassengers((current) => ({ ...current, [seat]: { ...getPassenger(seat), name: event.target.value } }))} placeholder="Full name" className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#d9232e]" /><input required type="number" min="1" max="100" value={passenger.age} onChange={(event) => setPassengers((current) => ({ ...current, [seat]: { ...getPassenger(seat), age: event.target.value } }))} placeholder="Age" className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#d9232e]" /><select required value={passenger.gender} onChange={(event) => setPassengers((current) => ({ ...current, [seat]: { ...getPassenger(seat), gender: event.target.value as PassengerDetail['gender'] } }))} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#d9232e]"><option value="">Gender</option><option>Male</option><option>Female</option></select></div></div> })}</div>
            <div className="space-y-3"><h3 className="text-lg font-extrabold text-slate-900">Protect your booking</h3><AddOn title="Free cancellation" detail="100% refund up to 6 hours before departure" price="₹110 per passenger" checked={freeCancellation} onChange={setFreeCancellation} /><AddOn title="Trip guarantee" detail="Full refund plus ₹500 extra if the operator cancels" price="₹24 per passenger" checked={tripGuarantee} onChange={setTripGuarantee} /><AddOn title="Travel insurance" detail="Cover for common travel disruptions" price="₹15 per passenger" checked={travelInsurance} onChange={setTravelInsurance} /></div>
          </div>}
        </div>

        <div className="sticky top-6 h-fit border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Your trip</p>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Booking Summary</h2>
          
          {selectedSeats.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Armchair size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No seats selected yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-600 text-sm">Selected:</span>
                <span className="text-sm font-bold text-[#d9232e]">{selectedSeats.join(', ')}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-600 text-sm">Total Fare:</span>
                <span className="font-bold text-slate-900 text-lg">₹{totalFare + addOnTotal}</span>
              </div>

              <div className="flex items-start gap-2 bg-red-50 p-3 text-xs text-red-800">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p>Seats will be <strong>temporarily locked for 5 minutes</strong> upon proceeding.</p>
              </div>

              <p className="text-xs text-slate-500">{addOnTotal ? `Protection add-ons: ₹${addOnTotal}` : 'Taxes and platform charges are shown in the next step.'}</p><button 
                onClick={handleProceedToPayment}
                disabled={isLocking}
                className="btn-pill btn-primary mt-2 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLocking ? <><Lock size={18} className="animate-pulse" /> Locking...</> : <>Proceed to Payment <ArrowRight size={18} /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeatButton({ seat, isSelected, onClick }: { seat: SeatType; isSelected: boolean; onClick: () => void }) {
  let style = 'bg-white border-slate-300 text-slate-400 hover:border-[#d9232e] hover:text-[#d9232e] cursor-pointer';

  if (seat.status === 'BOOKED') {
    style = 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed opacity-50';
  } else if (isSelected) {
    style = 'bg-[#d9232e] border-[#d9232e] text-white shadow-md transform scale-105';
  } else if (seat.type === 'WOMEN_PRIORITY') {
    style = 'bg-pink-50 border-pink-300 text-pink-500 hover:bg-pink-100 cursor-pointer';
  } else if (seat.type === 'ELDERLY_PRIORITY') {
    style = 'bg-orange-50 border-orange-300 text-orange-500 hover:bg-orange-100 cursor-pointer';
  }

  return (
    <button onClick={onClick} className={`w-11 h-12 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${style}`}>
      <Armchair size={16} strokeWidth={1.5} />
      <span className="text-[9px] font-bold mt-0.5">{seat.id}</span>
    </button>
  );
}

function AddOn({ title, detail, price, checked, onChange }: { title: string; detail: string; price: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${checked ? 'border-[#d9232e] bg-red-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}><span><strong className="block text-sm text-slate-900">{title}</strong><span className="mt-1 block text-xs text-slate-500">{detail}</span><span className="mt-2 block text-xs font-bold text-emerald-700">{price}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-[#d9232e]" /></label>;
}

function BookingPageFallback() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl animate-pulse rounded-2xl bg-white p-6 shadow-sm">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-8 w-72 rounded bg-slate-200" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}