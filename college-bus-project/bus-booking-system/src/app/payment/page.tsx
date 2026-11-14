"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  BusFront,
  Check,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Tag,
  WalletCards,
} from "lucide-react";

type PaymentMethod = "UPI" | "CARD" | "NET_BANKING" | "WALLET";

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
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra",
  "Punjab National Bank",
  "IDFC FIRST Bank",
  "Bank of Baroda",
];
export default function PaymentPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [selectedUpiApp, setSelectedUpiApp] = useState("Google Pay");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedCardType, setSelectedCardType] = useState<"Credit card" | "Debit card">("Credit card");
  const [selectedWallet, setSelectedWallet] = useState("Paytm");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSeatCount = draft?.selectedSeats.length ?? 0;
  const baseFare = (draft?.totalFare ?? 0) + (draft?.addOnTotal ?? 0);
  const gst = Math.round(baseFare * 0.05);
  const platformFee = selectedSeatCount * 15;
  const subtotal = baseFare + gst + platformFee;
  const totalAmount = Math.max(0, subtotal - discount);
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
    if (method === "NET_BANKING" && !selectedBank) {
      setError("Choose a bank to continue.");
      return;
    }
    if (method === "WALLET" && !selectedWallet) {
      setError("Choose a wallet to continue.");
      return;
    }
    setError("");
    void completeSandboxBooking();
  };

  const makePnr = () => `OMNI${Math.floor(100000 + Math.random() * 900000)}`;

  const createBooking = async ({
    pnr,
    bookingReference,
    paymentStatus,
    paidWith,
    paymentReference,
  }: {
    pnr: string;
    bookingReference: string;
    paymentStatus: string;
    paidWith: string;
    paymentReference?: string;
  }) => {
    if (!draft?.selectedSeats.length) {
      setError("Your seat selection is missing.");
      throw new Error("Your seat selection is missing.");
    }
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
          name: index === 0 ? passengerName : `${passengerName} - Guest ${index + 1}`,
          seatNumber,
          pnr: index === 0 ? pnr : `${pnr}-${index + 1}`,
        })),
      }),
    });
    if (!response.ok) throw new Error("Unable to complete the booking.");
    localStorage.setItem("latestBooking", JSON.stringify({
      pnr,
      bookingReference,
      status: paymentStatus === "Payment successful" ? "CONFIRMED" : "PAYMENT_PENDING",
      paymentStatus,
      paymentReference,
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
      paidWith,
    }));
    router.push("/ticket");
  };

  const completeSandboxBooking = async () => {
    setIsSubmitting(true);
    try {
      const pnr = makePnr();
      await createBooking({
        pnr,
        bookingReference: `ORD-${Date.now().toString(36).toUpperCase()}`,
        paymentStatus: "Payment successful",
        paidWith: method === "NET_BANKING" ? `Net banking (${selectedBank})` : method === "WALLET" ? selectedWallet : method === "CARD" ? selectedCardType : `UPI (${selectedUpiApp})`,
        paymentReference: `LOCAL-${Date.now().toString(36).toUpperCase()}`,
      });
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Unable to complete the booking.");
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
            <LockKeyhole size={16} className="text-emerald-400" /> Booking checkout
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
              Complete your booking
            </h1>
            <p className="mt-2 text-slate-400">
              Passenger: <strong className="text-white">{passengerName}</strong>
              . No need to enter it again.
            </p>
          </div>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#10182d] shadow-xl shadow-black/10">
            <div className="border-b border-white/10 px-6 py-6 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment</p>
              <h2 className="mt-1 text-xl font-bold">Choose how you’d like to pay</h2>
            </div>
            <form onSubmit={submitCheckout} className="space-y-6 p-5 sm:p-8">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <PaymentTab active={method === "UPI"} icon={<Smartphone size={19} />} label="UPI" detail="Apps & UPI" onClick={() => setMethod("UPI")} />
                <PaymentTab active={method === "CARD"} icon={<CreditCard size={19} />} label="Cards" detail="Credit & debit" onClick={() => setMethod("CARD")} />
                <PaymentTab active={method === "NET_BANKING"} icon={<Building2 size={19} />} label="Net banking" detail="All major banks" onClick={() => setMethod("NET_BANKING")} />
                <PaymentTab active={method === "WALLET"} icon={<WalletCards size={19} />} label="Wallets" detail="Popular wallets" onClick={() => setMethod("WALLET")} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b1225] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300"><BadgeCheck size={19} /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Passenger</p>
                    <p className="mt-1 font-bold text-white">{passengerName}</p>
                  </div>
                  <p className="ml-auto hidden text-xs text-slate-500 sm:block">Contact details added at booking</p>
                </div>
              </div>
              {method === "UPI" && (
                <div>
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div><h3 className="text-lg font-bold">Pay using UPI</h3><p className="mt-1 text-sm text-slate-400">Choose an app for this booking.</p></div>
                    <div className="flex gap-1.5 text-[10px] font-extrabold text-slate-400"><span className="rounded border border-white/10 px-2 py-1">UPI</span><span className="rounded border border-white/10 px-2 py-1">BHIM</span></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {["Google Pay", "PhonePe", "Paytm", "BHIM"].map((app) => <ChoiceCard key={app} selected={selectedUpiApp === app} onClick={() => setSelectedUpiApp(app)} title={app} detail="UPI app" />)}
                  </div>
                  <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1225] p-5 text-center sm:flex-row sm:text-left">
                    <DummyUpiQr />
                    <div><p className="font-bold text-white">Sample UPI QR</p><p className="mt-1 text-sm text-slate-400">This code is decorative and cannot collect money. Continue to confirm your booking locally.</p></div>
                  </div>
                </div>
              )}
              {method === "CARD" && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h3 className="text-lg font-bold">Credit or debit card</h3><p className="mt-1 text-sm text-slate-400">Card information is entered in secure checkout.</p></div>
                    <div className="flex gap-1.5 text-[10px] font-extrabold text-slate-400"><span className="rounded border border-white/10 px-2 py-1">VISA</span><span className="rounded border border-white/10 px-2 py-1">mastercard</span><span className="rounded border border-white/10 px-2 py-1">RuPay</span></div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(["Credit card", "Debit card"] as const).map((type) => <ChoiceCard key={type} selected={selectedCardType === type} onClick={() => setSelectedCardType(type)} title={type} detail="Visa · Mastercard · RuPay" />)}
                  </div>
                </div>
              )}
              {method === "NET_BANKING" && (
                <div className="space-y-4">
                  <div><h3 className="text-lg font-bold">Choose your bank</h3><p className="mt-1 text-sm text-slate-400">You’ll be redirected to your bank to authorize payment.</p></div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {BANKS.map((bank) => <ChoiceCard key={bank} selected={selectedBank === bank} onClick={() => setSelectedBank(bank)} title={bank} detail="Net banking" />)}
                  </div>
                </div>
              )}
              {method === "WALLET" && (
                <div className="space-y-4">
                  <div><h3 className="text-lg font-bold">Choose a wallet</h3><p className="mt-1 text-sm text-slate-400">Continue to authorize with your selected wallet.</p></div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {["Paytm", "Amazon Pay", "PhonePe", "Mobikwik", "Freecharge", "Airtel Payments Bank"].map((wallet) => <ChoiceCard key={wallet} selected={selectedWallet === wallet} onClick={() => setSelectedWallet(wallet)} title={wallet} detail="Digital wallet" />)}
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-white/10 bg-[#0b1225]/70 px-4 py-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-2 font-semibold text-slate-300"><ShieldCheck size={15} className="text-emerald-400" /> No real payment is processed</span>
                <span className="mt-1 block">Confirming records a local booking only. No money will be charged.</span>
              </div>
              {error && (
                <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300">{error}</p>
              )}
              <button
                disabled={isSubmitting || !draft?.selectedSeats.length}
                className="btn-pill btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={17} />
                {isSubmitting ? "Confirming booking..." : "Confirm booking"}
                <ArrowRight size={19} />
              </button>
            </form>
          </section>
          <aside className="rounded-3xl border border-white/10 bg-[#10182d] p-6 shadow-xl shadow-black/10 lg:sticky lg:top-6">
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
              <Fare label={`Base fare · ${selectedSeatCount} seat${selectedSeatCount === 1 ? "" : "s"}`} amount={baseFare} />
              <Fare label="GST" amount={gst} />
              <Fare label="Convenience fee" amount={platformFee} />
              {discount > 0 && <Fare label="Discount" amount={-discount} />}
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
      aria-pressed={active}
      className={`flex min-h-[92px] flex-col items-start justify-between gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-red-400/70 bg-red-500/10 text-red-300 shadow-sm shadow-red-950/20" : "border-white/10 bg-[#0b1225] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]"}`}
    >
      <span className="flex w-full items-center justify-between"><span className={`rounded-xl p-2 ${active ? "bg-red-400/10" : "bg-white/5"}`}>{icon}</span>{active && <Check size={16} className="text-red-300" />}</span>
      <span className="block">
        <strong className="block text-sm">{label}</strong>
        <small className="mt-0.5 block text-[11px] text-slate-500">{detail}</small>
      </span>
    </button>
  );
}

function ChoiceCard({ selected, title, detail, onClick }: { selected: boolean; title: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-16 items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${selected ? "border-red-400/70 bg-red-500/10 ring-1 ring-red-400/30" : "border-white/10 bg-[#0b1225] hover:border-white/25"}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-red-400/10 text-red-300" : "bg-white/5 text-slate-400"}`}>{selected ? <Check size={16} /> : <span className="h-2 w-2 rounded-full bg-slate-500" />}</span>
      <span className="min-w-0"><strong className="block truncate text-sm font-bold text-slate-100">{title}</strong><small className="mt-0.5 block truncate text-[11px] text-slate-500">{detail}</small></span>
    </button>
  );
}

function Fare({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-slate-400">
      <span>{label}</span>
      <span className={amount < 0 ? "text-emerald-400" : ""}>{amount < 0 ? "-₹" : "₹"}{Math.abs(amount).toLocaleString("en-IN")}</span>
    </div>
  );
}

function DummyUpiQr() {
  const finders: [number, number][] = [[0, 0], [14, 0], [0, 14]];
  const modules = Array.from({ length: 21 * 21 }, (_, index) => {
    const x = index % 21;
    const y = Math.floor(index / 21);
    const finder = finders.find(([left, top]) => x >= left && x < left + 7 && y >= top && y < top + 7);
    if (finder) {
      const dx = x - finder[0];
      const dy = y - finder[1];
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    }
    return (x * 17 + y * 23 + x * y * 3) % 7 < 3;
  });

  return (
    <svg
      role="img"
      aria-label="Decorative UPI QR sample. Not scannable."
      viewBox="0 0 25 25"
      className="h-36 w-36 shrink-0 rounded-xl bg-white p-2"
      shapeRendering="crispEdges"
    >
      <rect width="25" height="25" fill="white" />
      {modules.map((isDark, index) => isDark ? (
        <rect key={index} x={index % 21 + 2} y={Math.floor(index / 21) + 2} width="1" height="1" fill="#111827" />
      ) : null)}
    </svg>
  );
}
