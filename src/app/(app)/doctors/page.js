'use client';
import { useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Building2, Mail, Phone, Plus, Stethoscope, Trash2, X } from 'lucide-react';
import api, { errMsg, fieldErrors } from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';
import { fmtDate } from '@/lib/format';
import { Avatar, Badge, EmptyState, ErrorBox, PageHeader, SearchBox, Skeleton } from '@/components/ui/Misc';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DoctorForm from '@/components/DoctorForm';

const INITIAL = { search: '', specialization: '', hospital: '', from: '', to: '', sort: 'newest', page: 1 };

export default function DoctorsPage() {
  const qc = useQueryClient();
  const [f, setF] = useState(INITIAL);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  const search = useDebounce(f.search);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v, page: 1 }));
  const params = { ...f, search, limit: 9 };
  const filtered = f.search || f.specialization || f.hospital || f.from || f.to;

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['doctors', params],
    queryFn: () => api.get('/doctors', { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
  const { data: meta } = useQuery({
    queryKey: ['doctor-meta'],
    queryFn: () => api.get('/doctors/meta').then((r) => r.data),
  });

  const refresh = () => ['doctors', 'doctor-meta', 'doctor-options', 'dashboard', 'patients'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  const create = useMutation({
    mutationFn: (body) => api.post('/doctors', body),
    onSuccess: () => { toast.success('Doctor created'); setCreating(false); setErrors({}); refresh(); },
    onError: (e) => { setErrors(fieldErrors(e)); toast.error(errMsg(e)); },
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/doctors/${id}`),
    onSuccess: () => { toast.success('Doctor deleted'); setToDelete(null); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Browse, search and manage the doctors in your network."
        actions={<button className="btn-primary" onClick={() => { setErrors({}); setCreating(true); }}><Plus size={16} /> Add doctor</button>}
      />

      <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2"><SearchBox value={f.search} onChange={set('search')} placeholder="Search name, hospital, email…" /></div>
        <select className="input" aria-label="Specialization" value={f.specialization} onChange={(e) => set('specialization')(e.target.value)}>
          <option value="">All specializations</option>
          {meta?.specializations.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" aria-label="Hospital" value={f.hospital} onChange={(e) => set('hospital')(e.target.value)}>
          <option value="">All hospitals</option>
          {meta?.hospitals.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" className="input" aria-label="Added from" value={f.from} onChange={(e) => set('from')(e.target.value)} />
        <input type="date" className="input" aria-label="Added to" value={f.to} onChange={(e) => set('to')(e.target.value)} />
        <select className="input lg:col-span-2" aria-label="Sort" value={f.sort} onChange={(e) => set('sort')(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
        </select>
        {filtered && (
          <button className="btn-ghost lg:col-span-2" onClick={() => setF(INITIAL)}><X size={16} /> Clear filters</button>
        )}
      </div>

      <div className={`card transition-opacity ${isFetching && !isLoading ? 'opacity-70' : ''}`}>
        {isError ? <ErrorBox onRetry={refetch} /> : isLoading ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
        ) : data.items.length === 0 ? (
          <EmptyState icon={Stethoscope} title={filtered ? 'No doctors match your filters' : 'No doctors yet'}
            text={filtered ? 'Try a different search term or clear the filters.' : 'Add your first doctor to start tracking patients.'}
            action={filtered ? <button className="btn-ghost" onClick={() => setF(INITIAL)}>Clear filters</button> : <button className="btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Add doctor</button>} />
        ) : (
          <>
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((d) => (
                <article key={d._id} className="flex flex-col rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <Avatar name={d.name} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold">{d.name}</h3>
                      <Badge>{d.specialization}</Badge>
                    </div>
                    <button onClick={() => setToDelete(d)} aria-label={`Delete ${d.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                    <li className="flex items-center gap-2"><Building2 size={15} className="shrink-0 text-slate-400" /><span className="truncate">{d.hospital}</span></li>
                    <li className="flex items-center gap-2"><Phone size={15} className="shrink-0 text-slate-400" />{d.phone}</li>
                    <li className="flex items-center gap-2"><Mail size={15} className="shrink-0 text-slate-400" /><span className="truncate">{d.email}</span></li>
                  </ul>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <span className="text-slate-500">{d.patientCount} patients · since {fmtDate(d.createdAt)}</span>
                    <Link href={`/doctors/${d._id}`} className="font-semibold text-brand-700 hover:underline">View patients</Link>
                  </div>
                </article>
              ))}
            </div>
            <Pagination pagination={data.pagination} onChange={(page) => setF((p) => ({ ...p, page }))} />
          </>
        )}
      </div>

      <Modal open={creating} title="Add a doctor" onClose={() => setCreating(false)}>
        <DoctorForm specializations={meta?.specializations} errors={errors} loading={create.isPending} onSubmit={(v) => create.mutate(v)} onCancel={() => setCreating(false)} />
      </Modal>
      <ConfirmDialog open={!!toDelete} title="Delete doctor?" loading={remove.isPending} onClose={() => setToDelete(null)} onConfirm={() => remove.mutate(toDelete._id)}
        message={`${toDelete?.name} and all ${toDelete?.patientCount ?? ''} of their patients will be permanently deleted.`} />
    </>
  );
}
