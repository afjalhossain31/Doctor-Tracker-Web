'use client';
import { useState } from 'react';
import { Field } from './ui/Misc';

export default function PatientForm({ initial, conditions = [], doctors, errors = {}, loading, submitLabel = 'Save patient', onSubmit, onCancel }) {
  const [v, setV] = useState({
    name: '', age: '', gender: 'Male', phone: '', condition: '', notes: '',
    ...(initial && { ...initial, doctor: initial.doctor?._id || initial.doctor }),
  });
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(v); }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name}>
          <input className="input" required value={v.name} onChange={set('name')} />
        </Field>
        <Field label="Age" error={errors.age}>
          <input className="input" required type="number" min="0" max="120" value={v.age} onChange={set('age')} />
        </Field>
        <Field label="Gender" error={errors.gender}>
          <select className="input" value={v.gender} onChange={set('gender')}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </Field>
        <Field label="Phone (optional)" error={errors.phone}>
          <input className="input" type="tel" value={v.phone} onChange={set('phone')} />
        </Field>
        <Field label="Condition" error={errors.condition}>
          <input className="input" required list="cond-list" value={v.condition} onChange={set('condition')} placeholder="e.g. Diabetes" />
          <datalist id="cond-list">{conditions.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        {doctors && (
          <Field label="Doctor" error={errors.doctor}>
            <select className="input" required value={v.doctor || ''} onChange={set('doctor')}>
              <option value="" disabled>Select a doctor</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} · {d.specialization}</option>)}
            </select>
          </Field>
        )}
      </div>
      <Field label="Notes (optional)" error={errors.notes}>
        <textarea className="input" rows={3} maxLength={500} value={v.notes} onChange={set('notes')} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={loading}>{loading ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
