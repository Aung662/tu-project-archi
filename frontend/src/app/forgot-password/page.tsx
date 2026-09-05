'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Alert } from '@/components/ui';

/**
 * Forgot-password flow. Step 1 requests a reset token by email; in development
 * the API returns the token directly (no SMTP), so we auto-advance to step 2
 * where the user sets a new password.
 */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ message: string; devToken?: string }>('/auth/forgot-password', {
        email,
      });
      setInfo(res.message);
      if (res.devToken) {
        // Dev convenience: prefill the token and move to the reset step.
        setToken(res.devToken);
        setStep('reset');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card space-y-4 p-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Reset your password</h1>
          <p className="text-sm text-slate-400">
            {step === 'request'
              ? 'Enter your account email to get a reset link.'
              : 'Enter the reset token and choose a new password.'}
          </p>
        </div>

        {error && <Alert kind="error">{error}</Alert>}
        {info && !done && <Alert kind="info">{info}</Alert>}

        {done ? (
          <Alert kind="success">
            Your password has been reset.{' '}
            <Link href="/login" className="font-semibold underline">
              Sign in
            </Link>
            .
          </Alert>
        ) : step === 'request' ? (
          <form onSubmit={requestReset} className="space-y-3">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitReset} className="space-y-3">
            <div>
              <label className="label">Reset token</label>
              <input
                className="input font-mono text-xs"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">New password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars, 1 letter + 1 number"
                required
              />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Resetting…' : 'Set new password'}
            </button>
          </form>
        )}

        <div className="text-center text-sm text-slate-400">
          <Link href="/login" className="hover:text-slate-100">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
