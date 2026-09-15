"use client";

import { ChevronDown, HelpCircle, LogOut, Ticket, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AccountMenuProps = { role: 'Passenger' | 'Driver' | 'Admin'; dark?: boolean };

export default function AccountMenu({ role, dark = false }: AccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const signOut = () => {
    document.cookie.split(';').forEach((cookie) => { document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`); });
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    router.push('/login');
  };
  return <div className="relative"><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${dark ? 'border-slate-700 text-slate-200 hover:border-blue-400 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:border-[#d9232e] hover:text-[#d9232e]'}`}><UserRound size={17} /><span className="hidden sm:inline">Account</span><ChevronDown size={15} className={open ? 'rotate-180 transition' : 'transition'} /></button>{open && <div className={`absolute right-0 top-[calc(100%+8px)] z-[80] w-60 rounded-2xl border p-2 shadow-2xl ${dark ? 'border-slate-700 bg-[#111a2b] text-white' : 'border-slate-200 bg-white text-slate-900'}`}><div className="border-b border-current/10 px-3 py-3"><p className="text-xs font-bold uppercase tracking-wider opacity-60">Signed in as</p><p className="mt-1 font-extrabold">{role} account</p></div><button type="button" onClick={() => router.push('/ticket')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-current/10"><Ticket size={17} /> My bookings</button><button type="button" onClick={() => router.push('/support')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-current/10"><HelpCircle size={17} /> Help centre</button><button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-500/10"><LogOut size={17} /> Sign out</button></div>}</div>;
}
