"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  BusFront,
  Check,
  CreditCard,
  Smartphone,
  Tag,
  Timer,
} from "lucide-react";

type PaymentMethod = "UPI" | "CARD" | "NET_BANKING";
type BookingDraft = {
  vehicleId: string;
  registrationNumber: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  arrival: string;
  bus: string;
  busType?: string;
  selectedSeats: string[];
  totalFare: number;
  passenger?: string;
  phone?: string;
  email?: string;
  addOnTotal?: number;
  tripStops?: string[];
  scheduledDeparture?: string;
  scheduledArrival?: string;
};

const BANKS = [
  "SBI",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Bank",
  "PNB",
];
const SESSION_SECONDS = 7 * 60;

export default function PaymentPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [selectedBank, setSelectedBank] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSeatCount = draft?.selectedSeats.length ?? 0;
  const baseFare = (draft?.totalFare ?? 0) + (draft?.addOnTotal ?? 0);
  const gst = Math.round(baseFare * 0.05);
  const platformFee = selectedSeatCount * 15;
  const subtotal = baseFare + gst + platformFee;
  const totalAmount = Math.max(0, subtotal - discount);
  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const passengerName = draft?.passenger?.trim() || "Passenger";

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        setDraft(
          JSON.parse(
            localStorage.getItem("bookingDraft") || "null",
          ) as BookingDraft | null,
        );
      } catch {
        setDraft(null);
      }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(
      () => setSecondsLeft((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "SAVE10") {
      setDiscount(200);
      setCouponMessage("SAVE10 applied: ₹200 off");
    } else if (code === "BUS50") {
      setDiscount(50);
      setCouponMessage("BUS50 applied: ₹50 off");
    } else {
      setDiscount(0);
      setCouponMessage("Invalid code. Try SAVE10.");
    }
  };

  const submitCheckout = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft?.selectedSeats.length) {
      setError("Your seat selection is missing. Return to seat selection.");
      return;
    }
    if (secondsLeft === 0) {
      setError("Your checkout session expired. Return to seat selection to start again.");
      return;
    }
    if (method === "NET_BANKING" && !selectedBank) {
      setError("Choose a bank to continue.");
      return;
    }
    setError("");
    void completeDemoBooking();
  };

  const completeDemoBooking = async () => {
    if (!draft?.selectedSeats.length) {
      setError("Your seat selection is missing.");
      return;
    }
    if (secondsLeft === 0) {
      setError(
        "Your checkout session expired. Return to seat selection to start again.",
      );
      return;
    }
    setError("");
    setIsSubmitting(true);
    const pnr = `OMNI${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const response = await fetch("/api/trip", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BOOK",
          vehicleId: draft.vehicleId,
          registrationNumber: draft.registrationNumber,
          from: draft.from,
          to: draft.to,
          operator: draft.bus,
          busType: draft.busType,
          scheduledDeparture: draft.scheduledDeparture,
          scheduledArrival: draft.scheduledArrival,
          stops: draft.tripStops,
          passengers: draft.selectedSeats.map((seatNumber, index) => ({
            name:
              index === 0
                ? passengerName
                : `${passengerName} - Guest ${index + 1}`,
            seatNumber,
            pnr: index === 0 ? pnr : `${pnr}-${index + 1}`,
          })),
        }),
      });
      if (!response.ok) throw new Error("Unable to create this demo booking.");
      const bookingReference = `DEMO-${Date.now().toString(36).toUpperCase()}`;
      localStorage.setItem(
        "latestBooking",
        JSON.stringify({
          pnr,
          bookingReference,
          status: "CONFIRMED",
          paymentStatus: "DEMO BOOKING - NO CHARGE",
          vehicleId: draft.vehicleId,
          registrationNumber: draft.registrationNumber,
          route: `${draft.from} -> ${draft.to}`,
          date: draft.date,
          departure: draft.departure,
          arrival: draft.arrival,
          bus: draft.bus,
          seats: draft.selectedSeats.join(", "),
          passenger: passengerName,
          amount: totalAmount,
          paidWith:
            method === "NET_BANKING"
              ? `Demo - Net banking (${selectedBank})`
              : `Demo - ${method === "CARD" ? "Card" : "UPI"}`,
        }),
      );
      router.push("/ticket");
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "Unable to create this demo booking.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080d1c] font-sans text-slate-100">
      <header className="border-b border-white/10 bg-[#0b1225]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <button
            onClick={() => router.push("/book")}
            className="flex items-center gap-2 text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e32938]">
              <BusFront size={23} />
            </span>
            <span className="text-xl font-extrabold">
              Omni<span className="text-red-400">Bus</span>
            </span>
          </button>
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Check size={16} className="text-emerald-400" /> Prototype
            checkout
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        <button
          onClick={() => router.push("/book")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-400"
        >
          <ArrowLeft size={16} /> Back to seat selection
        </button>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">
              Checkout
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">
              Complete your payment
            </h1>
            <p className="mt-2 text-slate-400">
              Passenger: <strong className="text-white">{passengerName}</strong>
              . No need to enter it again.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-bold text-amber-200">
            <Timer size={17} /> Session {formattedTime}
          </div>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#10182d] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-6 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step 1 of 1
              </p>
              <h2 className="mt-1 text-xl font-bold">
                Choose a payment method
              </h2>
            </div>
            <div className="grid md:grid-cols-[190px_1fr]">
              <nav className="border-b border-white/10 p-3 md:border-b-0 md:border-r">
                <PaymentTab
                  active={method === "UPI"}
                  icon={<Smartphone size={19} />}
                  label="UPI"
                  detail="GPay, PhonePe, Paytm"
                  onClick={() => setMethod("UPI")}
                />
                <PaymentTab
                  active={method === "CARD"}
                  icon={<CreditCard size={19} />}
                  label="Cards"
                  detail="Credit or debit card"
                  onClick={() => setMethod("CARD")}
                />
                <PaymentTab
                  active={method === "NET_BANKING"}
                  icon={<Building2 size={19} />}
                  label="Net banking"
                  detail="Select your bank"
                  onClick={() => setMethod("NET_BANKING")}
                />
              </nav>
              <form onSubmit={submitCheckout} className="space-y-6 p-6 sm:p-8">
                <div className="rounded-xl border border-white/10 bg-[#0b1225] px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Passenger details
                  </p>
                  <p className="mt-1 font-bold text-white">{passengerName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Collected once during seat selection.
                  </p>
                </div>
                {method === "UPI" && (
                  <div>
                    <p className="text-lg font-bold">Pay with UPI</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Simulated UPI checkout. No payment or personal details are collected.
                    </p>
                  </div>
                )}
                {method === "CARD" && (
                  <div>
                    <p className="text-lg font-bold">Card details</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Simulated card checkout. No card number or security code is needed.
                    </p>
                  </div>
                )}
                {method === "NET_BANKING" && (
                  <div className="space-y-4">
                    <p className="text-lg font-bold">Choose your bank</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {BANKS.map((bank) => (
                        <button
                          type="button"
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`rounded-xl border p-3 text-left text-sm font-bold ${selectedBank === bank ? "border-red-400 bg-red-500/15 text-red-300" : "border-white/10 bg-[#0b1225] text-slate-300"}`}
                        >
                          {selectedBank === bank && (
                            <Check size={15} className="mb-1" />
                          )}
                          {bank}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400">
                      Bank selection is simulated. No sign-in or OTP is required.
                    </p>
                  </div>
                )}
                {error && (
                  <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300">
                    {error}
                  </p>
                )}
                <button
                  disabled={isSubmitting || secondsLeft === 0}
                  className="btn-pill btn-primary w-full py-4 text-base disabled:opacity-60"
                >
                  {isSubmitting ? "Creating demo booking..." : "Complete demo booking"}{" "}
                  <ArrowRight size={19} />
                </button>
              </form>
            </div>
          </section>
          <aside className="rounded-3xl border border-white/10 bg-[#10182d] p-6 shadow-2xl lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Order summary
            </p>
            <h2 className="mt-1 text-xl font-bold">
              {draft?.from || "Patiala"} → {draft?.to || "Chandigarh"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {draft?.bus || "OmniBus Elite"} · {selectedSeatCount} seat
              {selectedSeatCount === 1 ? "" : "s"}
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1225] p-4">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Coupon code"
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-white outline-none"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="btn-pill btn-secondary px-3 py-2 text-xs"
                >
                  <Tag size={14} /> Apply
                </button>
              </div>
              {couponMessage && (
                <p
                  className={`mt-2 text-xs font-semibold ${discount ? "text-emerald-400" : "text-amber-300"}`}
                >
                  {couponMessage}
                </p>
              )}
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <Fare label="Base fare" amount={baseFare} />
              <Fare label="GST" amount={gst} />
              <Fare label="Platform fee" amount={platformFee} />
              <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-extrabold">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PaymentTab({
  active,
  icon,
  label,
  detail,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-3 text-left ${active ? "bg-red-500/15 text-red-300 ring-1 ring-red-400/50" : "text-slate-400 hover:bg-white/5"}`}
    >
      <span className="rounded-xl bg-white/10 p-2">{icon}</span>
      <span>
        <strong className="block text-sm">{label}</strong>
        <small className="block text-[11px] text-slate-500">{detail}</small>
        <small className="block text-[10px] font-semibold text-amber-300">
          Demo only - no charge
        </small>
      </span>
    </button>
  );
}
function Fare({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-slate-400">
      <span>{label}</span>
      <span>₹{amount.toLocaleString("en-IN")}</span>
    </div>
  );
}
