import { Pencil, Trash2 } from 'lucide-react';
import { Avatar, Badge } from './ui/Misc';
import { fmtDate } from '@/lib/format';

const Actions = ({ p, onEdit, onDelete }) => (
  <div className="flex justify-end gap-1">
    {onEdit && (
      <button onClick={() => onEdit(p)} aria-label={`Edit ${p.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700">
        <Pencil size={16} />
      </button>
    )}
    <button onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
      <Trash2 size={16} />
    </button>
  </div>
);

export default function PatientTable({ items, showDoctor, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Condition</th>
              {showDoctor && <th className="px-4 py-3 font-medium">Doctor</th>}
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} size="h-9 w-9" />
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.age} yrs · {p.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge>{p.condition}</Badge></td>
                {showDoctor && <td className="px-4 py-3">{p.doctor?.name || <span className="text-slate-400">Unassigned</span>}</td>}
                <td className="px-4 py-3 text-slate-600">{p.phone || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(p.createdAt)}</td>
                <td className="px-4 py-3"><Actions p={p} onEdit={onEdit} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((p) => (
          <li key={p._id} className="flex items-start gap-3 p-4">
            <Avatar name={p.name} size="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-slate-500">{p.age} yrs · {p.gender}{showDoctor && p.doctor ? ` · ${p.doctor.name}` : ''}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge>{p.condition}</Badge>
                <span className="text-xs text-slate-500">{fmtDate(p.createdAt)}</span>
              </div>
            </div>
            <Actions p={p} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  );
}
