"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building2, BusFront, Check, CheckCircle2, Clock3, CreditCard, LockKeyhole, Smartphone, Tag, Timer, Upload, X } from 'lucide-react';

declare global {
  interface Window { Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: () => void) => void }; }
}

type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING';
type BookingDraft = {
  vehicleId: string; registrationNumber: string; from: string; to: string; date: string;
  departure: string; arrival: string; bus: string; busType?: string; selectedSeats: string[];
  totalFare: number; passenger?: string; phone?: string; email?: string; addOnTotal?: number;
  tripStops?: string[]; scheduledDeparture?: string; scheduledArrival?: string;
};

const UPI_ID = 'girikshitgpt999@oksbi';
const ACCOUNT_HOLDER = 'Girikshit Gupta';
const BANKS = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB'];
const SESSION_SECONDS = 7 * 60;

export default function PaymentPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  const selectedSeatCount = draft?.selectedSeats.length ?? 0;
  const baseFare = (draft?.totalFare ?? 0) + (draft?.addOnTotal ?? 0);
  const gst = Math.round(baseFare * 0.05);
  const platformFee = selectedSeatCount * 15;
  const subtotal = baseFare + gst + platformFee;
  const totalAmount = Math.max(0, subtotal - discount);
  const cardDigits = cardNumber.replace(/\D/g, '');
  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const paymentIntent = useMemo(() => `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(ACCOUNT_HOLDER)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=BusBooking`, [totalAmount]);
  const passengerName = draft?.passenger?.trim() || 'Passenger';

  useEffect(() => {
    try { setDraft(JSON.parse(localStorage.getItem('bookingDraft') || 'null') as BookingDraft | null); } catch { setDraft(null); }
  }, []);

  useEffect(() => {
    if (!isCheckoutOpen || secondsLeft === 0) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [isCheckoutOpen, secondsLeft]);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAVE10') { setDiscount(200); setCouponMessage('SAVE10 applied: ₹200 off'); }
    else if (code === 'BUS50') { setDiscount(50); setCouponMessage('BUS50 applied: ₹50 off'); }
    else { setDiscount(0); setCouponMessage('Invalid code. Try SAVE10.'); }
  };

  const submitCheckout = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft?.selectedSeats.length) { setError('Your seat selection is missing. Return to seat selection.'); return; }
    if (method === 'CARD' && (cardDigits.length !== 16 || expiry.length < 4 || cvv.length < 3 || cardName.trim().length < 2)) { setError('Complete all card details to continue.'); return; }
    if (method === 'NET_BANKING' && !selectedBank) { setError('Choose your bank to continue.'); return; }
    if (method === 'NET_BANKING' && !isOtpStep) { setIsOtpStep(true); setError(''); return; }
    if (method === 'NET_BANKING' && otp !== '123456') { setError('Enter the demo OTP 123456 to verify your bank payment.'); return; }
    if (method !== 'UPI') { setError('For this checkout, complete payment through the UPI QR or UPI app link.'); setMethod('UPI'); return; }
    setError('');
    setIsCheckoutOpen(true);
  };

  const verifyPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft?.selectedSeats.length) { setError('Your seat selection is missing.'); return; }
    setError(''); setPaymentMessage('');
    setIsVerifying(true);
    const pnr = `OMNI${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pnr,
          passengerName,
          phone: draft.phone,
          email: draft.email,
          vehicleId: draft.vehicleId || 'BUS-101',
          route: `${draft.from || 'Patiala'} -> ${draft.to || 'Chandigarh'}`,
          seats: draft.selectedSeats.join(', '),
          amount: totalAmount,
          paymentReference: `UPI-${Date.now().toString(36).toUpperCase()}`,
        }),
      });
      const result = await response.json() as { error?: string; bookingReference?: string; status?: string };
      if (response.status !== 202 || !result.bookingReference) throw new Error(result.error || 'Unable to submit payment for review.');
      localStorage.setItem('latestBooking', JSON.stringify({
        pnr,
        bookingReference: result.bookingReference,
        paymentReference: `UPI-${Date.now().toString(36).toUpperCase()}`,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'PAYMENT PENDING MANUAL REVIEW',
        vehicleId: draft.vehicleId,
        registrationNumber: draft.registrationNumber,
        route: `${draft.from} -> ${draft.to}`,
        date: draft.date,
        departure: draft.departure,
        arrival: draft.arrival,
        bus: draft.bus,
        seats: draft.selectedSeats.join(', '),
        passenger: passengerName,
        amount: totalAmount,
        paidWith: 'Personal UPI QR',
      }));
      await fetch('/api/trip', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        action: 'BOOK', vehicleId: draft.vehicleId, registrationNumber: draft.registrationNumber, from: draft.from, to: draft.to,
        operator: draft.bus, busType: draft.busType, scheduledDeparture: draft.scheduledDeparture, scheduledArrival: draft.scheduledArrival,
        stops: draft.tripStops, passengers: draft.selectedSeats.map((seatNumber, index) => ({
          name: index === 0 ? passengerName : `${passengerName} - Guest ${index + 1}`, seatNumber, pnr: index === 0 ? pnr : `${pnr}-${index + 1}`,
        })),
      }) });
      router.push('/ticket');
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Unable to submit payment request.');
      setIsVerifying(false);
    }
  };

  return <main className="min-h-screen bg-[#080d1c] font-sans text-slate-100">
    <header className="border-b border-white/10 bg-[#0b1225]/90"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><button onClick={() => router.push('/book')} className="flex items-center gap-2 text-white"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e32938]"><BusFront size={23} /></span><span className="text-xl font-extrabold">Omni<span className="text-red-400">Bus</span></span></button><span className="flex items-center gap-2 text-sm font-semibold text-slate-400"><LockKeyhole size={16} className="text-emerald-400" /> Secure checkout</span></div></header>
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12"><button onClick={() => router.push('/book')} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-400"><ArrowLeft size={16} /> Back to seat selection</button><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">Checkout</p><h1 className="mt-2 text-3xl font-extrabold">Complete your payment</h1><p className="mt-2 text-slate-400">Passenger: <strong className="text-white">{passengerName}</strong>. No need to enter it again.</p></div><div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-bold text-amber-200"><Timer size={17} /> Session {formattedTime}</div></div>
      <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]"><section className="overflow-hidden rounded-3xl border border-white/10 bg-[#10182d] shadow-2xl"><div className="border-b border-white/10 px-6 py-6 sm:px-8"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 1 of 1</p><h2 className="mt-1 text-xl font-bold">Choose a payment method</h2></div><div className="grid md:grid-cols-[190px_1fr]"><nav className="border-b border-white/10 p-3 md:border-b-0 md:border-r"><PaymentTab active={method === 'UPI'} icon={<Smartphone size={19} />} label="UPI" detail="GPay, PhonePe, Paytm" onClick={() => { setMethod('UPI'); setIsOtpStep(false); }} /><PaymentTab active={method === 'CARD'} icon={<CreditCard size={19} />} label="Cards" detail="Credit or debit card" onClick={() => { setMethod('CARD'); setIsOtpStep(false); }} /><PaymentTab active={method === 'NET_BANKING'} icon={<Building2 size={19} />} label="Net banking" detail="Select your bank" onClick={() => setMethod('NET_BANKING')} /></nav><form onSubmit={submitCheckout} className="space-y-6 p-6 sm:p-8"><div className="rounded-xl border border-white/10 bg-[#0b1225] px-4 py-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Passenger details</p><p className="mt-1 font-bold text-white">{passengerName}</p><p className="mt-1 text-xs text-slate-500">Collected once during seat selection.</p></div>{method === 'UPI' && <div><p className="text-lg font-bold">Pay with UPI</p><p className="mt-1 text-sm text-slate-400">Your personal UPI QR and mobile intent link are available after you continue.</p></div>}{method === 'CARD' && <div className="space-y-4"><p className="text-lg font-bold">Card details</p><input value={cardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="Card number" inputMode="numeric" className="w-full rounded-xl border border-white/10 bg-[#0b1225] px-4 py-3.5 text-white" /><div className="grid grid-cols-2 gap-3"><input value={expiry} onChange={(event) => setExpiry(event.target.value.slice(0, 5))} placeholder="MM / YY" className="rounded-xl border border-white/10 bg-[#0b1225] px-4 py-3.5 text-white" /><input value={cvv} onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="CVV" inputMode="numeric" className="rounded-xl border border-white/10 bg-[#0b1225] px-4 py-3.5 text-white" /></div><input value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Name on card" className="w-full rounded-xl border border-white/10 bg-[#0b1225] px-4 py-3.5 text-white" /></div>}{method === 'NET_BANKING' && <div className="space-y-4"><p className="text-lg font-bold">{isOtpStep ? 'Verify your bank payment' : 'Choose your bank'}</p>{!isOtpStep ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{BANKS.map((bank) => <button type="button" key={bank} onClick={() => setSelectedBank(bank)} className={`rounded-xl border p-3 text-left text-sm font-bold ${selectedBank === bank ? 'border-red-400 bg-red-500/15 text-red-300' : 'border-white/10 bg-[#0b1225] text-slate-300'}`}>{selectedBank === bank && <Check size={15} className="mb-1" />}{bank}</button>)}</div> : <><p className="text-sm text-slate-400">Enter the demo OTP <strong className="text-white">123456</strong> for {selectedBank}.</p><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit OTP" inputMode="numeric" className="w-full rounded-xl border border-white/10 bg-[#0b1225] px-4 py-3.5 text-white" /></>}</div>}{error && !isCheckoutOpen && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300">{error}</p>}<button className="btn-pill btn-primary w-full py-4 text-base">{method === 'UPI' ? <><Smartphone size={19} /> Continue to UPI payment</> : isOtpStep ? 'Verify and pay' : 'Continue'} <ArrowRight size={19} /></button></form></div></section><aside className="rounded-3xl border border-white/10 bg-[#10182d] p-6 shadow-2xl lg:sticky lg:top-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Order summary</p><h2 className="mt-1 text-xl font-bold">{draft?.from || 'Patiala'} → {draft?.to || 'Chandigarh'}</h2><p className="mt-2 text-sm text-slate-400">{draft?.bus || 'OmniBus Elite'} · {selectedSeatCount} seat{selectedSeatCount === 1 ? '' : 's'}</p><div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1225] p-4"><div className="flex gap-2"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code" className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-white outline-none" /><button type="button" onClick={applyCoupon} className="btn-pill btn-secondary px-3 py-2 text-xs"><Tag size={14} /> Apply</button></div>{couponMessage && <p className={`mt-2 text-xs font-semibold ${discount ? 'text-emerald-400' : 'text-amber-300'}`}>{couponMessage}</p>}</div><div className="mt-6 space-y-3 text-sm"><Fare label="Base fare" amount={baseFare} /><Fare label="GST" amount={gst} /><Fare label="Platform fee" amount={platformFee} /><div className="flex justify-between border-t border-white/10 pt-3 text-lg font-extrabold"><span>Total</span><span>₹{totalAmount.toLocaleString('en-IN')}</span></div></div></aside></div></div>
    {isCheckoutOpen && <UpiModal totalAmount={totalAmount} paymentIntent={paymentIntent} secondsLeft={secondsLeft} error={error} isVerifying={isVerifying} onClose={() => !isVerifying && setIsCheckoutOpen(false)} onSubmit={verifyPayment} />}
  </main>;
}

function PaymentTab({ active, icon, label, detail, onClick }: { active: boolean; icon: React.ReactNode; label: string; detail: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-3 text-left ${active ? 'bg-red-500/15 text-red-300 ring-1 ring-red-400/50' : 'text-slate-400 hover:bg-white/5'}`}><span className="rounded-xl bg-white/10 p-2">{icon}</span><span><strong className="block text-sm">{label}</strong><small className="text-[11px] text-slate-500">{detail}</small></span></button>; }
function Fare({ label, amount }: { label: string; amount: number }) { return <div className="flex justify-between text-slate-400"><span>{label}</span><span>₹{amount.toLocaleString('en-IN')}</span></div>; }
function loadRazorpayScript() { return new Promise<void>((resolve, reject) => { if (window.Razorpay) { resolve(); return; } const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Unable to load Razorpay Checkout.')); document.body.appendChild(script); }); }
function UpiModal({ totalAmount, paymentIntent, secondsLeft, error, isVerifying, onClose, onSubmit }: { totalAmount: number; paymentIntent: string; secondsLeft: number; error: string; isVerifying: boolean; onClose: () => void; onSubmit: (event: React.FormEvent) => void }) { const [qrSrc, setQrSrc] = useState('/upi-qr.png'); const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`; return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" className="my-6 max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#10182d] shadow-2xl"><div className="flex items-start justify-between border-b border-white/10 p-6"><div><p className="text-xs font-bold uppercase tracking-wider text-red-400">Secure UPI payment</p><h2 className="mt-1 text-2xl font-extrabold">Pay ₹{totalAmount.toLocaleString('en-IN')}</h2></div><button onClick={onClose} aria-label="Close payment modal" className="rounded-full p-2 text-slate-400 hover:bg-white/10"><X size={20} /></button></div><form onSubmit={onSubmit} className="space-y-6 p-6"><div className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200"><span><Timer size={17} className="mr-2 inline" /> Payment expires in</span><span className="font-mono text-lg">{formattedTime}</span></div><div className="grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center"><div className="mx-auto flex h-52 w-52 items-center justify-center rounded-2xl bg-white p-3"><Image src={qrSrc} onError={() => setQrSrc(`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(paymentIntent)}`)} alt="Girikshit Gupta UPI QR code" width={320} height={320} unoptimized className="h-full w-full object-contain" /></div><div className="space-y-3 text-sm"><p className="font-bold text-white">Scan using GPay, PhonePe, or Paytm.</p><p className="leading-6 text-slate-400">Payment is confirmed automatically only when a connected merchant gateway reports success. Your personal QR cannot send a result to this website.</p><div className="rounded-xl border border-white/10 bg-[#0b1225] p-3"><p className="text-xs uppercase tracking-wider text-slate-500">UPI ID</p><p className="mt-1 font-bold text-emerald-400">{UPI_ID}</p><p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Account holder</p><p className="mt-1 font-bold text-white">{ACCOUNT_HOLDER}</p><p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Exact amount</p><p className="mt-1 font-bold text-white">₹{totalAmount.toLocaleString('en-IN')}</p></div><a href={paymentIntent} className="btn-pill btn-secondary w-full px-4 py-3"><Smartphone size={17} /> Open installed UPI app</a></div></div>{error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300">{error}</p>}<button type="button" disabled={isVerifying || secondsLeft === 0} onClick={() => onSubmit({ preventDefault: () => undefined } as React.FormEvent)} className="btn-pill btn-primary w-full py-4 text-base disabled:opacity-60"><CheckCircle2 size={19} /> Payment verification required</button></form></section></div>; }
