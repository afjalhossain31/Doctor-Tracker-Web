'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Activity, Stethoscope, UserPlus, Users } from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import api from '@/lib/api';
import { CHART_COLORS, fmtDate, fmtDay } from '@/lib/format';
import { Avatar, Badge, ErrorBox, PageHeader, Skeleton } from '@/components/ui/Misc';

const tip = { borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 };

const Stat = ({ icon: Icon, label, value, hint, tone }) => (
  <div className="card flex items-start gap-4 p-5">
    <div className={`rounded-xl p-3 ${tone}`}><Icon size={22} /></div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-display text-3xl font-bold leading-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  </div>
);

const Panel = ({ title, subtitle, children, className = '' }) => (
  <section className={`card p-5 ${className}`}>
    <h2 className="text-lg font-bold">{title}</h2>
    {subtitle && <p className="mb-4 text-sm text-slate-500">{subtitle}</p>}
    {children}
  </section>
);

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard', { params: { days: 30 } }).then((r) => r.data),
  });

  if (isError) return <div className="card"><ErrorBox onRetry={refetch} /></div>;

  const t = data?.totals;
  return (
    <>
      <PageHeader title="Dashboard" subtitle="How your doctors and patients are doing over the last 30 days." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : (
          <>
            <Stat icon={Stethoscope} label="Total doctors" value={t.doctors} hint={`${t.newDoctors} joined in 30 days`} tone="bg-brand-50 text-brand-700" />
            <Stat icon={Users} label="Total patients" value={t.patients} hint={`${t.newPatients} added in 30 days`} tone="bg-sky-100 text-sky-700" />
            <Stat icon={Activity} label="Patients per doctor" value={t.avgPatientsPerDoctor} hint="Average across all doctors" tone="bg-amber-400/20 text-amber-800" />
            <Stat icon={UserPlus} label="New patients" value={t.newPatients} hint="Last 30 days" tone="bg-rose-100 text-rose-700" />
          </>
        )}
      </div>

      {isLoading ? <Skeleton className="mt-6 h-80 rounded-xl" /> : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Panel title="Daily activity" subtitle="New patients and doctors added each day" className="lg:col-span-2">
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={data.timeline} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0E7C7B" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#0E7C7B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fontSize: 12 }} interval="preserveStartEnd" minTickGap={32} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tip} labelFormatter={fmtDay} />
                  <Area type="monotone" dataKey="patients" name="Patients" stroke="#0E7C7B" strokeWidth={2.5} fill="url(#gp)" />
                  <Area type="monotone" dataKey="doctors" name="Doctors" stroke="#E8A33D" strokeWidth={2.5} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Common conditions" subtitle="Top conditions across all patients">
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.conditions} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                    {data.conditions.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {data.conditions.map((c, i) => (
                <li key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />{c.name}</span>
                  <b>{c.value}</b>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Patients per doctor" subtitle="Busiest doctors by patient count" className="lg:col-span-2">
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={data.perDoctor} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tip} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="patients" name="Patients" fill="#0E7C7B" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Doctors by specialization">
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={data.specializations} margin={{ left: -24, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tip} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="value" name="Doctors" fill="#E8A33D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Recently added patients" className="lg:col-span-3">
            <ul className="divide-y divide-slate-100">
              {data.recent.map((p) => (
                <li key={p._id} className="flex flex-wrap items-center gap-3 py-3">
                  <Avatar name={p.name} size="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.doctor?.name || 'Unassigned'}</p>
                  </div>
                  <Badge>{p.condition}</Badge>
                  <span className="w-28 text-right text-sm text-slate-500">{fmtDate(p.createdAt)}</span>
                </li>
              ))}
            </ul>
            <Link href="/patients" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">See all patients</Link>
          </Panel>
        </div>
      )}
    </>
  );
}
