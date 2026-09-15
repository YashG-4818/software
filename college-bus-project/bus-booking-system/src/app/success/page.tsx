"use client";

import { CheckCircle2, ArrowRight, BusFront } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const [pnr] = useState(() => typeof window === 'undefined' ? 'OMNI882910' : new URLSearchParams(window.location.search).get('pnr') || 'OMNI882910');

  return <main className="flex min-h-screen items-center justify-center bg-[#080d1c] px-4 py-12 font-sans text-white"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#10182d] p-8 text-center shadow-2xl"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400"><CheckCircle2 size={48} /></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Payment successful</p><h1 className="mt-2 text-3xl font-extrabold">Booking confirmed</h1><p className="mt-3 text-slate-400">Your seats are secured. Keep this PNR handy for tracking.</p><div className="mt-7 rounded-2xl border border-white/10 bg-[#0b1225] p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Your PNR</p><p className="mt-2 font-mono text-3xl font-bold tracking-[0.18em] text-red-300">{pnr}</p></div><button onClick={() => router.push('/ticket')} className="btn-pill btn-primary mt-7 w-full py-3.5">View your ticket <ArrowRight size={18} /></button><button onClick={() => router.push('/track')} className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold text-slate-400 hover:text-white"><BusFront size={17} /> Track this booking</button></div></main>;
}
