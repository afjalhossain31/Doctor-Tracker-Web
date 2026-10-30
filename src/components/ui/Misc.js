import { Search } from 'lucide-react';
import { initials, toneFor } from '@/lib/format';

const TONES = [
  'bg-brand-50 text-brand-700',
  'bg-amber-400/20 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
];

export const Avatar = ({ name, size = 'h-11 w-11' }) => (
  <div className={`flex shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${size} ${TONES[toneFor(name)]}`}>
    {initials(name)}
  </div>
);

export const Badge = ({ children }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[toneFor(children)]}`}>{children}</span>
);

export const Skeleton = ({ className = 'h-4 w-full' }) => <div className={`animate-pulse rounded bg-slate-200/70 ${className}`} />;

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="flex flex-col items-center px-6 py-14 text-center">
    <div className="mb-4 rounded-full bg-brand-50 p-4 text-brand-600"><Icon size={26} /></div>
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Field = ({ label, error, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
  </div>
);

export const SearchBox = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input className="input pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

export const ErrorBox = ({ message = 'Could not load data. Please try again.', onRetry }) => (
  <div className="p-10 text-center text-sm text-slate-600">
    <p>{message}</p>
    {onRetry && <button className="btn-ghost mt-3" onClick={onRetry}>Retry</button>}
  </div>
);
