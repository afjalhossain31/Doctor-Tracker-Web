import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.total === 0) return null;
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const window = [];
  for (let p = Math.max(1, page - 1); p <= Math.min(pages, page + 1); p++) window.push(p);
  if (!window.includes(1)) window.unshift(1);
  if (!window.includes(pages)) window.push(pages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-500">Showing {from}–{to} of {total}</p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button className="btn-ghost !px-2.5 !py-2" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {window.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            {i > 0 && p - window[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
            <button
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold ${p === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {p}
            </button>
          </span>
        ))}
        <button className="btn-ghost !px-2.5 !py-2" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
