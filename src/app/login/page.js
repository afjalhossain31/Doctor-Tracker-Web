'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { errMsg } from '@/lib/api';
import { Logo } from '@/components/Shell';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      toast.success('Welcome back');
      router.replace('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex">
        <Logo light />
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold leading-[1.05]">Every doctor. Every patient. One clear view.</h1>
          <p className="mt-5 text-brand-100/80">Keep your clinic network organised, spot busy doctors at a glance and track new patients as they come in.</p>
        </div>
        <svg className="absolute inset-x-0 bottom-24 w-full opacity-30" viewBox="0 0 800 120" fill="none" preserveAspectRatio="none" aria-hidden>
          <path d="M0 60h180l24-44 36 92 30-60 24 12h140l24-52 40 104 30-64h272" stroke="#7FD6CF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="relative z-10 text-sm text-brand-100/60">Secure admin portal</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-bold">Sign in</h2>
          <p className="mt-1 mb-7 text-sm text-slate-500">Use your administrator account to continue.</p>

          {error && <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</div>}

          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="username" className="input" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@doctortracker.com" />

          <label className="label mt-4" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} autoComplete="current-password" className="input" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <button className="btn-primary mt-6 w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}
