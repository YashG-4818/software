"use client";

import { ArrowRight, ArrowRightLeft, BusFront, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Headphones, History, MapPin, Search, ShieldCheck, Ticket, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountMenu from '@/components/AccountMenu';

const cities = ['Amritsar', 'Ambala', 'Bangalore', 'Chandigarh', 'Delhi', 'Hyderabad', 'Jaipur', 'Jalandhar', 'Kalka', 'Karnal', 'Kolkata', 'Kolhapur', 'Ludhiana', 'Lucknow', 'Mandi', 'Manali', 'Mumbai', 'Panipat', 'Panchkula', 'Patiala', 'Pune', 'Rajpura', 'Shimla', 'Sion', 'Solan', 'Sonipat', 'Zirakpur'];
const offers = [
  { code: 'FIRSTBUS', title: 'Save ₹150 on your first booking', detail: 'Use code FIRSTBUS on bookings above ₹999', tone: 'bg-[#2b1b24]' },
  { code: 'BUS50', title: 'Flat ₹50 off every weekend', detail: 'Valid on selected AC services', tone: 'bg-[#142a2b]' },
  { code: 'SAFESEAT', title: 'Book with flexible cancellation', detail: 'Change plans without the usual stress', tone: 'bg-[#172542]' },
];

export default function Home() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [focusedField, setFocusedField] = useState<'from' | 'to' | null>(null);
  const [recentSearches, setRecentSearches] = useState<{ from: string; to: string }[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? (JSON.parse(saved) as { from: string; to: string }[]) : [];
    } catch {
      return [];
    }
  });
  const [supportOpen, setSupportOpen] = useState(false);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) return;
    const next = [{ from, to }, ...recentSearches.filter((item) => item.from !== from || item.to !== to)].slice(0, 3);
    setRecentSearches(next);
    localStorage.setItem('recentSearches', JSON.stringify(next));
    router.push(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
  };

  const filteredCities = (value: string) => cities.filter((city) => city.toLowerCase().includes(value.toLowerCase()));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const selectedDate = date ? new Date(`${date}T00:00:00`) : null;
  const formatDate = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  const displayDate = selectedDate ? `${String(selectedDate.getDate()).padStart(2, '0')} ${selectedDate.toLocaleString('en-US', { month: 'short' })}` : 'Choose date';

  return (
    <main className="min-h-screen bg-[#0b1220] text-slate-100">
      <header className="border-b border-slate-800 bg-[#111a2b]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button type="button" onClick={() => router.push('/')} className="flex items-center gap-2 text-[#ff5a63]"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d9232e] text-white"><BusFront size={21} /></span><span className="text-xl font-extrabold tracking-tight text-white">OmniBus</span></button>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex"><a href="#offers" className="hover:text-[#ff7a80]">Offers</a><a href="/track" className="hover:text-[#ff7a80]">Track ticket</a><button type="button" onClick={() => setSupportOpen(true)} className="flex items-center gap-2 hover:text-[#ff7a80]"><Headphones size={16} /> Help</button></nav>
          <div className="flex items-center gap-2 text-sm font-bold"><a href="/login" className="hidden rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 sm:block">Login</a><AccountMenu role="Passenger" dark /></div>
        </div>
      </header>

      <section className="hero-grid border-b border-[#b91c27] bg-[#b91c27] px-5 pb-28 pt-14 text-white lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-red-100">Travel made simple</p><h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">Every journey starts with a better bus.</h1><p className="mt-4 max-w-xl text-base text-red-50">Compare trusted operators, choose your seat, and keep your trip updates in one place.</p>
        <form onSubmit={search} className="relative z-30 mt-10 grid gap-2 rounded-2xl border border-slate-700 bg-[#111a2b] p-2 text-slate-100 shadow-2xl shadow-black/30 md:grid-cols-[1fr_auto_1fr_1fr_auto] md:items-center"><LocationField label="From" value={from} onChange={setFrom} open={focusedField === 'from'} onFocus={() => { setFocusedField('from'); setCalendarOpen(false); }} options={filteredCities(from)} recentSearches={recentSearches} onRecentSelect={(item) => { setFrom(item.from); setTo(item.to); setFocusedField(null); }} onSelect={(city) => { setFrom(city); setFocusedField(null); }} /><button type="button" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap cities" className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-[#18243a] text-[#ff6670] shadow-sm hover:border-[#ff6670] hover:bg-[#243452]"><ArrowRightLeft size={16} /></button><LocationField label="To" value={to} onChange={setTo} open={focusedField === 'to'} onFocus={() => { setFocusedField('to'); setCalendarOpen(false); }} options={filteredCities(to)} recentSearches={recentSearches} onRecentSelect={(item) => { setFrom(item.from); setTo(item.to); setFocusedField(null); }} onSelect={(city) => { setTo(city); setFocusedField(null); }} /><div className="relative"><button type="button" onClick={() => { setCalendarOpen((open) => !open); setFocusedField(null); }} className="flex h-16 w-full items-center gap-3 border-t border-slate-700 px-4 text-left hover:bg-[#18243a] md:border-l md:border-t-0"><CalendarDays size={20} className="text-slate-400" /><span className="flex min-w-0 flex-1 flex-col"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of journey</span><span className={`mt-1 text-sm font-bold ${selectedDate ? 'text-white' : 'text-slate-400'}`}>{displayDate}</span></span></button>{calendarOpen && <CalendarPicker today={today} maxDate={maxDate} calendarMonth={calendarMonth} setCalendarMonth={setCalendarMonth} selectedDate={selectedDate} onSelect={(value) => { setDate(formatDate(value)); setCalendarOpen(false); }} daysInMonth={daysInMonth} firstDayOfMonth={firstDayOfMonth} />}</div><button type="submit" className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#e73543] px-7 font-extrabold text-white shadow-lg shadow-red-950/40 hover:bg-[#ff4d59]"><Search size={19} /> Search buses</button></form>
      </div></section>

      <div className="mx-auto -mt-12 max-w-7xl px-5 pb-16 lg:px-8"><section className="grid gap-3 rounded-2xl border border-slate-700 bg-[#111a2b] p-4 shadow-lg shadow-black/25 sm:grid-cols-3"><Trust icon={<ShieldCheck />} title="Safe and reliable" detail="Verified operators and transparent fares" /><Trust icon={<Ticket />} title="Easy cancellation" detail="Flexible options when plans change" /><Trust icon={<Headphones />} title="24×7 support" detail="Help before, during, and after your trip" /></section>
        <section id="offers" className="mt-12"><div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-wider text-[#ff6670]">Deals for your next trip</p><h2 className="mt-1 text-2xl font-extrabold">Offers and benefits</h2></div><button type="button" onClick={() => setSupportOpen(true)} className="hidden text-sm font-bold text-[#ff7a80] sm:block">Need help booking? <ArrowRight size={15} className="inline" /></button></div><div className="mt-5 grid gap-4 md:grid-cols-3">{offers.map((offer) => <article key={offer.code} className={`${offer.tone} relative overflow-hidden rounded-2xl border border-slate-700 p-5`}><div className="absolute -right-6 -top-8 h-24 w-24 rounded-full border-[14px] border-white/10" /><p className="font-mono text-xs font-extrabold tracking-wider text-slate-400">{offer.code}</p><h3 className="mt-5 max-w-[220px] text-lg font-extrabold text-white">{offer.title}</h3><p className="mt-2 text-sm text-slate-300">{offer.detail}</p><button type="button" onClick={() => navigator.clipboard?.writeText(offer.code)} className="mt-5 rounded-lg border border-slate-600 bg-[#111a2b] px-3 py-2 text-xs font-extrabold text-slate-100 hover:border-[#ff6670] hover:text-white">Copy code</button></article>)}</div></section>
        <section className="mt-14"><p className="text-sm font-bold uppercase tracking-wider text-[#ff6670]">Popular routes</p><h2 className="mt-1 text-2xl font-extrabold">Where are you heading?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Patiala', 'Chandigarh'], ['Delhi', 'Manali'], ['Chandigarh', 'Shimla'], ['Rajpura', 'Amritsar']].map(([origin, destination]) => <button key={`${origin}-${destination}`} type="button" onClick={() => { setFrom(origin); setTo(destination); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#111a2b] p-4 text-left shadow-sm hover:-translate-y-0.5 hover:border-[#ff6670] hover:bg-[#18243a]"><span><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Popular route</span><span className="mt-1 block font-extrabold">{origin} <ArrowRight size={14} className="mx-1 inline text-[#ff6670]" /> {destination}</span></span><ChevronDown size={17} className="-rotate-90 text-slate-400" /></button>)}</div></section>
        <section className="mt-14 flex flex-col justify-between gap-6 rounded-2xl bg-[#172033] p-7 text-white sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-red-300">Your trip, in your hands</p><h2 className="mt-1 text-2xl font-extrabold">Book, track, and manage every ticket.</h2><p className="mt-2 max-w-xl text-sm text-slate-300">Your passenger dashboard keeps tickets, live status, and support in one calm place.</p></div><a href="/track" className="btn-pill shrink-0 bg-white px-5 py-3 text-sm font-extrabold text-[#172033]">Track a ticket <ArrowRight size={17} /></a></section>
      </div>

      {supportOpen && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/75 px-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111a2b] p-6 text-white shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#ff6670]">OmniBus help centre</p><h2 className="mt-1 text-2xl font-extrabold">How can we help?</h2></div><button type="button" onClick={() => setSupportOpen(false)} aria-label="Close help centre" className="rounded-full p-2 text-slate-400 hover:bg-[#18243a]"><X size={19} /></button></div><div className="mt-6 grid gap-3"><a href="mailto:support@omnibus.example" className="rounded-xl border border-slate-700 p-4 hover:border-[#ff6670]"><strong className="block">Booking support</strong><span className="mt-1 block text-sm text-slate-400">Changes, cancellations, payment, and seat issues</span></a><a href="/track" className="rounded-xl border border-slate-700 p-4 hover:border-[#ff6670]"><strong className="block">Track a ticket</strong><span className="mt-1 block text-sm text-slate-400">Check trip status and live notifications</span></a><a href="tel:+911800123456" className="rounded-xl bg-[#e73543] p-4 text-white hover:bg-[#ff4d59]"><strong className="block">Call support</strong><span className="mt-1 block text-red-100">1800 123 456 · Available 24×7</span></a></div></div></div>}
    </main>
  );
}

function CalendarPicker({ today, maxDate, calendarMonth, setCalendarMonth, selectedDate, onSelect, daysInMonth, firstDayOfMonth }: { today: Date; maxDate: Date; calendarMonth: Date; setCalendarMonth: (value: Date) => void; selectedDate: Date | null; onSelect: (value: Date) => void; daysInMonth: number; firstDayOfMonth: number }) {
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const lastMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  const canGoBack = monthStart > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoForward = monthStart < lastMonth;

  return <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[310px] rounded-2xl border border-slate-700 bg-[#111a2b] p-4 text-slate-100 shadow-2xl shadow-black/40"><div className="flex items-center justify-between"><button type="button" disabled={!canGoBack} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="rounded-lg p-2 text-slate-400 hover:bg-[#18243a] hover:text-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="Previous month"><ChevronLeft size={18} /></button><span className="text-sm font-extrabold">{calendarMonth.toLocaleString('en-US', { month: 'long' })}</span><button type="button" disabled={!canGoForward} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="rounded-lg p-2 text-slate-400 hover:bg-[#18243a] hover:text-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="Next month"><ChevronRight size={18} /></button></div><p className="mt-1 text-center text-xs font-semibold text-slate-400">Choose a date within the next 3 months</p><div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="mt-2 grid grid-cols-7 gap-1">{Array.from({ length: firstDayOfMonth }).map((_, index) => <span key={`blank-${index}`} className="h-9" />)}{Array.from({ length: daysInMonth }, (_, index) => { const day = index + 1; const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day); const disabled = date < today || date > maxDate; const selected = selectedDate?.getTime() === date.getTime(); return <button type="button" key={day} disabled={disabled} onClick={() => onSelect(date)} className={`h-9 rounded-lg text-sm font-bold transition ${disabled ? 'cursor-not-allowed text-slate-700' : selected ? 'bg-[#e73543] text-white shadow-md shadow-red-950/40' : 'text-slate-200 hover:bg-[#243452] hover:text-white'}`}>{day}</button>; })}</div><p className="mt-3 border-t border-slate-700 pt-3 text-center text-[11px] font-semibold text-slate-500">Earlier and later dates are unavailable</p></div>;
}

function LocationField({ label, value, onChange, open, onFocus, options, recentSearches, onRecentSelect, onSelect }: { label: string; value: string; onChange: (value: string) => void; open: boolean; onFocus: () => void; options: string[]; recentSearches: { from: string; to: string }[]; onRecentSelect: (item: { from: string; to: string }) => void; onSelect: (value: string) => void }) {
  return <div className="relative flex h-16 items-center gap-3 px-4"><MapPin size={20} className="shrink-0 text-slate-400" /><label className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><input required value={value} onFocus={onFocus} onChange={(event) => onChange(event.target.value)} placeholder={`Select ${label.toLowerCase()} city`} className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-500" /></label>{open && <div className="absolute left-2 right-2 top-[calc(100%+4px)] z-40 max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-[#111a2b] p-2 text-left shadow-2xl shadow-black/40"><div className="mb-1 border-b border-slate-700 pb-2"><p className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"><History size={13} /> Recent searches</p>{recentSearches.length ? recentSearches.map((item) => <button type="button" key={`${item.from}-${item.to}`} onMouseDown={(event) => event.preventDefault()} onClick={() => onRecentSelect(item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-slate-200 hover:bg-[#243452] hover:text-white"><History size={14} className="shrink-0 text-[#ff6670]" /> <span className="truncate">{item.from}</span><ArrowRight size={12} className="shrink-0 text-slate-500" /><span className="truncate">{item.to}</span></button>) : <p className="px-3 py-2 text-xs text-slate-500">No recent searches yet</p>}</div><p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">All cities and locations</p>{options.length ? options.map((city) => <button type="button" key={city} onMouseDown={(event) => event.preventDefault()} onClick={() => onSelect(city)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#243452] hover:text-white"><MapPin size={14} className="text-slate-400" />{city}</button>) : <p className="p-3 text-sm text-slate-500">No matching locations</p>}</div>}</div>;
}

function Trust({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="flex items-start gap-3 p-2"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3a1e2b] text-[#ff6670]">{icon}</span><span><strong className="block text-sm text-white">{title}</strong><small className="mt-1 block text-xs text-slate-400">{detail}</small></span></div>;
}