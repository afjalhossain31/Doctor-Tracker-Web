'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, Mail, Phone, Plus, Users } from 'lucide-react';
import api, { errMsg, fieldErrors } from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';
import { Avatar, Badge, EmptyState, ErrorBox, SearchBox, Skeleton } from '@/components/ui/Misc';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PatientForm from '@/components/PatientForm';
import PatientTable from '@/components/PatientTable';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const q = useDebounce(search);

  const doctor = useQuery({ queryKey: ['doctor', id], queryFn: () => api.get(`/doctors/${id}`).then((r) => r.data) });
  const patients = useQuery({
    queryKey: ['doctor-patients', id, q, page],
    queryFn: () => api.get(`/doctors/${id}/patients`, { params: { search: q, page, limit: 8 } }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
  const { data: conditions } = useQuery({ queryKey: ['conditions'], queryFn: () => api.get('/patients/conditions').then((r) => r.data) });

  const refresh = () => ['doctor', 'doctor-patients', 'doctors', 'patients', 'conditions', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  const add = useMutation({
    mutationFn: (body) => api.post(`/doctors/${id}/patients`, body),
    onSuccess: () => { toast.success('Patient added'); setAdding(false); setErrors({}); refresh(); },
    onError: (e) => { setErrors(fieldErrors(e)); toast.error(errMsg(e)); },
  });
  const remove = useMutation({
    mutationFn: (pid) => api.delete(`/doctors/${id}/patients/${pid}`),
    onSuccess: () => { toast.success('Patient removed'); setToDelete(null); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (doctor.isError) return <div className="card"><ErrorBox message="Doctor not found." /></div>;
  const d = doctor.data;

  return (
    <>
      <Link href="/doctors" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-700">
        <ArrowLeft size={16} /> All doctors
      </Link>

      <div className="card mb-6 flex flex-wrap items-center gap-5 p-5">
        {!d ? <Skeleton className="h-16 w-full" /> : (
          <>
            <Avatar name={d.name} size="h-16 w-16 text-lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold">{d.name}</h1>
              <div className="mt-1"><Badge>{d.specialization}</Badge></div>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-1.5"><Building2 size={15} className="text-slate-400" />{d.hospital}</li>
                <li className="flex items-center gap-1.5"><Phone size={15} className="text-slate-400" />{d.phone}</li>
                <li className="flex items-center gap-1.5"><Mail size={15} className="text-slate-400" />{d.email}</li>
              </ul>
            </div>
            <div className="rounded-xl bg-brand-50 px-5 py-3 text-center">
              <p className="font-display text-3xl font-bold text-brand-700">{d.patientCount}</p>
              <p className="text-xs font-medium text-brand-700">Patients</p>
            </div>
          </>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Patients</h2>
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="w-full max-w-xs"><SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients…" /></div>
          <button className="btn-primary shrink-0" onClick={() => { setErrors({}); setAdding(true); }}><Plus size={16} /> Add patient</button>
        </div>
      </div>

      <div className="card">
        {patients.isError ? <ErrorBox onRetry={patients.refetch} /> : patients.isLoading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : patients.data.items.length === 0 ? (
          <EmptyState icon={Users} title={q ? 'No patients match your search' : 'No patients yet'}
            text={q ? 'Try a different name.' : 'Add the first patient under this doctor.'}
            action={!q && <button className="btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add patient</button>} />
        ) : (
          <>
            <PatientTable items={patients.data.items} onDelete={setToDelete} />
            <Pagination pagination={patients.data.pagination} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={adding} title={`Add patient to ${d?.name || 'doctor'}`} onClose={() => setAdding(false)} wide>
        <PatientForm conditions={conditions} errors={errors} loading={add.isPending} submitLabel="Add patient" onSubmit={(v) => add.mutate(v)} onCancel={() => setAdding(false)} />
      </Modal>
      <ConfirmDialog open={!!toDelete} title="Remove patient?" confirmLabel="Remove" loading={remove.isPending}
        message={`${toDelete?.name} will be removed from this doctor's list and deleted.`} onClose={() => setToDelete(null)} onConfirm={() => remove.mutate(toDelete._id)} />
    </>
  );
}
