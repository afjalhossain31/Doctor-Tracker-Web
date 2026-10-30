'use client';
import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, X } from 'lucide-react';
import api, { errMsg, fieldErrors } from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';
import { EmptyState, ErrorBox, PageHeader, SearchBox, Skeleton } from '@/components/ui/Misc';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PatientForm from '@/components/PatientForm';
import PatientTable from '@/components/PatientTable';

const INITIAL = { search: '', condition: '', doctor: '', gender: '', from: '', to: '', sort: 'newest', page: 1 };

export default function PatientsPage() {
  const qc = useQueryClient();
  const [f, setF] = useState(INITIAL);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  const search = useDebounce(f.search);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v, page: 1 }));
  const params = { ...f, search, limit: 10 };
  const filtered = f.search || f.condition || f.doctor || f.gender || f.from || f.to;

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['patients', params],
    queryFn: () => api.get('/patients', { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
  const { data: conditions } = useQuery({ queryKey: ['conditions'], queryFn: () => api.get('/patients/conditions').then((r) => r.data) });
  const { data: doctors } = useQuery({ queryKey: ['doctor-options'], queryFn: () => api.get('/doctors/options').then((r) => r.data) });

  const refresh = () => ['patients', 'conditions', 'doctors', 'doctor', 'doctor-patients', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  const update = useMutation({
    mutationFn: ({ _id, ...body }) => api.put(`/patients/${_id}`, body),
    onSuccess: () => { toast.success('Patient updated'); setEditing(null); setErrors({}); refresh(); },
    onError: (e) => { setErrors(fieldErrors(e)); toast.error(errMsg(e)); },
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/patients/${id}`),
    onSuccess: () => { toast.success('Patient deleted'); setToDelete(null); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <>
      <PageHeader title="Patients" subtitle="Every patient across all doctors. Edit details or remove records here." />

      <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2"><SearchBox value={f.search} onChange={set('search')} placeholder="Search patient name…" /></div>
        <select className="input" aria-label="Condition" value={f.condition} onChange={(e) => set('condition')(e.target.value)}>
          <option value="">All conditions</option>
          {conditions?.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input" aria-label="Doctor" value={f.doctor} onChange={(e) => set('doctor')(e.target.value)}>
          <option value="">All doctors</option>
          {doctors?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select className="input" aria-label="Gender" value={f.gender} onChange={(e) => set('gender')(e.target.value)}>
          <option value="">Any gender</option><option>Male</option><option>Female</option><option>Other</option>
        </select>
        <select className="input" aria-label="Sort" value={f.sort} onChange={(e) => set('sort')(e.target.value)}>
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option>
        </select>
        <label className="text-xs text-slate-500 sm:col-span-1 lg:col-span-2">Added from
          <input type="date" className="input mt-1" value={f.from} onChange={(e) => set('from')(e.target.value)} />
        </label>
        <label className="text-xs text-slate-500 sm:col-span-1 lg:col-span-2">Added to
          <input type="date" className="input mt-1" value={f.to} onChange={(e) => set('to')(e.target.value)} />
        </label>
        {filtered && <button className="btn-ghost self-end lg:col-span-2" onClick={() => setF(INITIAL)}><X size={16} /> Clear filters</button>}
      </div>

      <div className={`card transition-opacity ${isFetching && !isLoading ? 'opacity-70' : ''}`}>
        {isError ? <ErrorBox onRetry={refetch} /> : isLoading ? (
          <div className="space-y-3 p-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : data.items.length === 0 ? (
          <EmptyState icon={Users} title={filtered ? 'No patients match your filters' : 'No patients yet'}
            text={filtered ? 'Try a different search term or clear the filters.' : 'Open a doctor and add their first patient.'}
            action={filtered && <button className="btn-ghost" onClick={() => setF(INITIAL)}>Clear filters</button>} />
        ) : (
          <>
            <PatientTable items={data.items} showDoctor onEdit={(p) => { setErrors({}); setEditing(p); }} onDelete={setToDelete} />
            <Pagination pagination={data.pagination} onChange={(page) => setF((p) => ({ ...p, page }))} />
          </>
        )}
      </div>

      <Modal open={!!editing} title="Edit patient" onClose={() => setEditing(null)} wide>
        {editing && (
          <PatientForm initial={editing} conditions={conditions} doctors={doctors} errors={errors} loading={update.isPending}
            submitLabel="Save changes" onSubmit={(v) => update.mutate({ ...v, _id: editing._id })} onCancel={() => setEditing(null)} />
        )}
      </Modal>
      <ConfirmDialog open={!!toDelete} title="Delete patient?" loading={remove.isPending}
        message={`${toDelete?.name}'s record will be permanently deleted.`} onClose={() => setToDelete(null)} onConfirm={() => remove.mutate(toDelete._id)} />
    </>
  );
}
