"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
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

export default function TicketPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const savedBooking = localStorage.getItem("latestBooking");
      if (!savedBooking) {
        router.replace("/search");
        return;
      }
      try {
        setBooking(JSON.parse(savedBooking) as Booking);
      } catch {
        router.replace("/search");
      }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, [router]);

  if (!booking) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 font-sans text-slate-600"><p>Loading your booking…</p></main>;
  }

  const isPaymentPending = booking.status === "PAYMENT_PENDING";
  const isLocalPayment = booking.paymentReference?.startsWith("LOCAL-") === true;
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
          {isPaymentPending ? <AlertCircle
            size={28}
            className="text-amber-600"
          /> : <CheckCircle2
            size={28}
            className="text-green-600"
          />}
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${isPaymentPending ? "text-amber-600" : "text-green-600"}`}
            >
              {booking.paymentStatus || "Payment received"}
            </p>
            <h1 className="text-2xl font-bold">
              {isPaymentPending ? "Booking payment pending" : "Ticket booked successfully"}
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
              <div className={`rounded-xl border p-4 ${isPaymentPending ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isPaymentPending ? "text-amber-700" : "text-green-700"}`}>
                      Booking reference
                    </p>
                    <p className={`mt-1 font-mono font-extrabold ${isPaymentPending ? "text-amber-900" : "text-green-900"}`}>
                      {booking.bookingReference || booking.pnr}
                    </p>
                  </div>
                  {isLocalPayment && <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold text-blue-800">This booking was confirmed locally. No money was charged.</p>}
                </div>
                <div className={`mt-3 border-t pt-3 ${isPaymentPending ? "border-amber-200" : "border-green-200"}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isPaymentPending ? "text-amber-700" : "text-green-700"}`}>
                    {booking.paymentStatus || "Payment received"}
                  </p>
                  {booking.paymentReference && <p className="mt-1 text-xs text-slate-500">Payment reference: {booking.paymentReference}</p>}
                </div>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">
                  {isPaymentPending ? "Selected method" : "Paid with"}: {booking.paidWith}
                </span>
                <span className="font-extrabold">
                  {isPaymentPending ? "Amount due" : "Total"} ₹{booking.amount}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center border-t-2 border-dashed border-slate-200 pt-6 md:border-l-2 md:border-t-0 md:pl-8 md:pt-0">
              {isPaymentPending ? <AlertCircle size={96} className="text-amber-300" /> : <QrCode size={128} className="text-slate-800" />}
              <p className="mt-2 text-center text-xs font-semibold text-slate-400">
                {isPaymentPending ? "Boarding pass is issued after payment" : "Scan for boarding"}
              </p>
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
