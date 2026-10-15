"use client";

import React, { useEffect, useState } from "react";
import {
  BusFront,
  QrCode,
  Download,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Search,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Booking = {
  pnr: string;
  bookingReference?: string;
  paymentReference?: string;
  status: string;
  paymentStatus?: string;
  utr?: string;
  verifiedAt?: string;
  route: string;
  date: string;
  departure: string;
  arrival: string;
  bus: string;
  seats: string;
  passenger: string;
  amount: number;
  paidWith: string;
};

const FALLBACK_BOOKING: Booking = {
  pnr: "OMNI882910",
  status: "CONFIRMED",
  route: "Patiala -> Chandigarh",
  date: "03 Sep 2026",
  departure: "06:00 AM",
  arrival: "08:15 AM",
  bus: "OmniBus Elite",
  seats: "1C, 1D, 2C, 2D",
  passenger: "Girikshit",
  amount: 2100,
  paidWith: "UPI",
  paymentStatus: "DEMO BOOKING - NO CHARGE",
};

export default function TicketPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking>(FALLBACK_BOOKING);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const savedBooking = localStorage.getItem("latestBooking");
      if (savedBooking) setBooking(JSON.parse(savedBooking));
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const [from, to] = booking.route.split(" -> ");
  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 font-sans text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#d9232e]"
          >
            <BusFront size={29} strokeWidth={2.5} />
            <span className="text-xl font-extrabold">OmniBus</span>
          </button>
          <button
            onClick={() => router.push("/track")}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#d9232e]"
          >
            Booking status <ArrowRight size={16} />
          </button>
        </header>
        <div className="mb-6 flex items-center gap-3">
          <CheckCircle2
            size={28}
            className={
              booking.status === "PAYMENT_PENDING"
                ? "text-amber-600"
                : "text-green-600"
            }
          />
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${booking.status === "PAYMENT_PENDING" ? "text-amber-600" : "text-green-600"}`}
            >
              {booking.paymentStatus || "Payment received"}
            </p>
            <h1 className="text-2xl font-bold">
              {booking.status === "PAYMENT_PENDING"
                ? "Booking payment pending"
                : "Booking confirmed"}
            </h1>
          </div>
        </div>
        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#d9232e] p-6 text-white">
            <div className="flex items-center gap-2">
              <BusFront size={32} />
              <span className="text-2xl font-bold">OmniBus</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-red-100">
                Bus PNR
              </p>
              <p className="font-mono text-2xl font-bold tracking-widest">
                {booking.pnr}
              </p>
            </div>
          </div>
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:p-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Passenger
                </p>
                <p className="text-xl font-bold">{booking.passenger}</p>
              </div>
              <div className="flex items-center justify-between border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    From
                  </p>
                  <p className="flex items-center gap-1 font-bold">
                    <MapPin size={15} className="text-[#d9232e]" />
                    {from}
                  </p>
                </div>
                <ArrowRight className="text-slate-400" size={20} />
                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    To
                  </p>
                  <p className="font-bold">{to}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Departure
                  </p>
                  <p className="mt-1 flex items-center gap-1 font-bold">
                    <Calendar size={15} />
                    {booking.date}
                  </p>
                  <p className="mt-1 flex items-center gap-1 font-bold">
                    <Clock size={15} />
                    {booking.departure}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Seats
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#d9232e]">
                    {booking.seats}
                  </p>
                  <p className="text-sm text-slate-500">{booking.bus}</p>
                </div>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Booking reference
                    </p>
                    <p className="mt-1 font-mono font-extrabold text-green-900">
                      {booking.bookingReference || booking.pnr}
                    </p>
                  </div>
                  <span className="border border-green-200 bg-white px-3 py-1 text-xs font-bold text-green-700">
                    DEMO
                  </span>
                </div>
                <div className="mt-3 border-t border-green-200 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                    Prototype booking
                  </p>
                  <p className="mt-1 text-sm font-semibold text-green-900">
                    No payment was collected.
                  </p>
                </div>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">
                  Demo method: {booking.paidWith}
                </span>
                <span className="font-extrabold">
                  Demo total ₹{booking.amount}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center border-t-2 border-dashed border-slate-200 pt-6 md:border-l-2 md:border-t-0 md:pl-8 md:pt-0">
              <QrCode size={128} className="text-slate-800" />
              <p className="mt-2 text-xs font-semibold text-slate-400">
                Scan for boarding
              </p>
              <span className="mt-3 border border-green-200 bg-green-50 px-4 py-1 text-sm font-bold text-green-700">
                DEMO
              </span>
            </div>
          </div>
        </section>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => window.print()}
            className="btn-pill btn-secondary py-3"
          >
            <Download size={18} /> Print / save receipt
          </button>
          <button
            onClick={() => router.push("/track")}
            className="btn-pill btn-primary py-3"
          >
            <Search size={18} /> Track this booking
          </button>
        </div>
      </div>
    </main>
  );
}
