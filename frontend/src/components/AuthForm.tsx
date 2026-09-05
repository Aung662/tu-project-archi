'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import { Alert } from './ui';

/** Shared login/register form. `adminHint` tweaks copy for the hidden portal. */
export function AuthForm({ adminHint = false }: { adminHint?: boolean }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || (adminHint ? '/admin' : '/');

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
      setError(err instanceof Error ? err.message : t.somethingWrong.my);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card space-y-4 p-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {adminHint ? t.authAdminTitle.my : mode === 'login' ? t.authWelcome.my : t.authCreate.my}
          </h1>
          <p className="text-sm text-slate-400">
            {adminHint ? t.authAdminHint.my : t.authStudentHint.my}
          </p>
        </div>

        {error && <Alert kind="error">{error}</Alert>}

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="label">{t.fullName.my}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="label">{t.email.my}</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">{t.password.my}</label>
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
            {busy ? t.pleaseWait.my : mode === 'login' ? t.logIn.my : t.authCreate.my}
          </button>
        </form>

        {!adminHint && (
          <p className="text-center text-sm text-slate-400">
            {mode === 'login' ? t.noAccount.my : t.haveAccount.my}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-brand-300 hover:underline"
            >
              {mode === 'login' ? t.register.my : t.logIn.my}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
