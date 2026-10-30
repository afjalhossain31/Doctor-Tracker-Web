'use client';
import { useState } from 'react';
import { Field } from './ui/Misc';

export default function DoctorForm({ specializations = [], errors = {}, loading, onSubmit, onCancel }) {
  const [v, setV] = useState({ name: '', specialization: '', hospital: '', phone: '', email: '' });
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(v); }} className="space-y-4">
      <Field label="Full name" error={errors.name}>
        <input className="input" required value={v.name} onChange={set('name')} placeholder="Dr. Nusrat Jahan" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Specialization" error={errors.specialization}>
          <input className="input" required list="spec-list" value={v.specialization} onChange={set('specialization')} placeholder="Cardiology" />
          <datalist id="spec-list">{specializations.map((s) => <option key={s} value={s} />)}</datalist>
        </Field>
        <Field label="Hospital" error={errors.hospital}>
          <input className="input" required value={v.hospital} onChange={set('hospital')} placeholder="Evercare Hospital" />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input className="input" required type="tel" value={v.phone} onChange={set('phone')} placeholder="+8801712345678" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" required type="email" value={v.email} onChange={set('email')} placeholder="doctor@clinic.com" />
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Create doctor'}</button>
      </div>
    </form>
  );
}
