'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Spinner, Alert } from '@/components/ui';
import { tr, t } from '@/lib/i18n';

// `super` tabs are cross-department management surfaces the backend restricts
// to super-admins; department-scoped admins never see them.
const TABS = [
  { href: '/admin', label: t.tabOverview, super: false },
  { href: '/admin/projects', label: t.tabProjects, super: false },
  { href: '/admin/schools', label: t.tabSchools, super: true },
  { href: '/admin/payments', label: t.tabPayments, super: false },
  { href: '/admin/kits', label: t.tabKits, super: true },
  { href: '/admin/users', label: t.tabUsers, super: true },
  { href: '/admin/analytics', label: t.tabAnalytics, super: true },
  { href: '/admin/audit', label: t.tabAudit, super: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Client-side convenience guard. The REAL protection is server-side: every
  // /api/admin/* route rejects non-admins regardless of what the UI shows.
  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/portal-hidden-access');
    }
  }, [loading, user, router]);

  if (loading) return <Spinner label={tr(t.adminCheckingAccess)} />;
  if (!user || user.role !== 'ADMIN') {
    return <Alert kind="error">{tr(t.adminOnly)}</Alert>;
  }

  const onDashboardHome = pathname === '/admin';
  // Super-admin = ADMIN with no department binding. Department admins only see
  // the non-super tabs (the backend enforces this regardless of the UI).
  const isSuperAdmin = !user.adminDepartmentId;
  const visibleTabs = TABS.filter((tab) => !tab.super || isSuperAdmin);

  return (
    <div className="space-y-6">
      {!onDashboardHome && (
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-sm font-semibold text-brand-100 shadow-glow transition hover:-translate-x-0.5 hover:border-brand-300 hover:bg-brand-500/30 hover:text-white"
        >
          <span aria-hidden>←</span>
          {tr(t.backToDashboard)}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-100">{tr(t.adminDashboard)}</h1>
        <span className="text-sm text-slate-400">
          {tr(t.adminSignedInAs)} <span className="font-medium text-slate-200">{user.name}</span>
        </span>
      </div>
      <nav className="flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 shadow-inner">
        {visibleTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-glow'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tr(tab.label)}
            </Link>
          );
        })}
      </nav>
      <div>{children}</div>
    </div>
  );
}
