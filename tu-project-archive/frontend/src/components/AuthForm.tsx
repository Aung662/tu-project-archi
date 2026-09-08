'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tr, t } from '@/lib/i18n';
import { Alert } from './ui';

/** Shared login/register form. `adminHint` tweaks copy for the hidden portal. */
export function AuthForm({ adminHint = false }: { adminHint?: boolean }) {
  const { user, loading, login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || (adminHint ? '/admin' : '/');

  // Already signed in? Don't show a login form — send them where they were going.
  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === 'ADMIN' && adminHint ? '/admin' : next);
    }
  }, [loading, user, adminHint, next, router]);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user =
        mode === 'login'
          ? await login(email, password)
          : await register(email, password, name);
      // Admins landing via the hidden portal go to the dashboard.
      if (adminHint && user.role === 'ADMIN') router.push('/admin');
      else router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr(t.somethingWrong));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card space-y-4 p-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {adminHint ? tr(t.authAdminTitle) : mode === 'login' ? tr(t.authWelcome) : tr(t.authCreate)}
          </h1>
          <p className="text-sm text-slate-400">
            {adminHint ? tr(t.authAdminHint) : tr(t.authStudentHint)}
          </p>
        </div>

        {error && <Alert kind="error">{error}</Alert>}

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="label">{tr(t.fullName)}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="label">{tr(t.email)}</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">{tr(t.password)}</label>
              {mode === 'login' && !adminHint && (
                <a href="/forgot-password" className="text-xs text-brand-300 hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 8 : 1}
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? tr(t.pleaseWait) : mode === 'login' ? tr(t.logIn) : tr(t.authCreate)}
          </button>
        </form>

        {!adminHint && (
          <p className="text-center text-sm text-slate-400">
            {mode === 'login' ? tr(t.noAccount) : tr(t.haveAccount)}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-brand-300 hover:underline"
            >
              {mode === 'login' ? tr(t.register) : tr(t.logIn)}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
