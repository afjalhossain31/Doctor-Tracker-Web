'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Menu, Stethoscope, Users, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
];

export const Logo = ({ light }) => (
  <div className="flex items-center gap-2.5">
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#14958F" />
      <path d="M4 17h6l3-7 5 13 3-6h7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className={`font-display text-lg font-bold ${light ? 'text-white' : 'text-ink'}`}>Doctor Tracker</span>
  </div>
);

function Nav({ onNavigate }) {
  const path = usePathname();
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6"><Logo light /></div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-white/12 text-white' : 'text-brand-100/80 hover:bg-white/8 hover:text-white'}`}
            >
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
        <p className="truncate text-xs text-brand-100/70">{user?.email}</p>
        <button onClick={logout} className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-100/80 hover:bg-white/8 hover:text-white">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function Shell({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-brand-900 lg:block"><Nav /></aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-slate-100"><Menu size={22} /></button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-900">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded-lg p-2 text-white hover:bg-white/10"><X size={20} /></button>
            <Nav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
