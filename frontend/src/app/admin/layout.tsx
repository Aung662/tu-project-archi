'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Spinner, Alert } from '@/components/ui';
import { t } from '@/lib/i18n';

const TABS = [
  { href: '/admin', label: t.tabOverview.my },
  { href: '/admin/projects', label: t.tabProjects.my },
  { href: '/admin/schools', label: t.tabSchools.my },
  { href: '/admin/payments', label: t.tabPayments.my },
  { href: '/admin/users', label: t.tabUsers.my },
  { href: '/admin/analytics', label: t.tabAnalytics.my },
  { href: '/admin/audit', label: t.tabAudit.my },
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

  if (loading) return <Spinner label={t.adminCheckingAccess.my} />;
  if (!user || user.role !== 'ADMIN') {
    return <Alert kind="error">{t.adminOnly.my}</Alert>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-100">{t.adminDashboard.my}</h1>
        <span className="text-sm text-slate-400">
          {t.adminSignedInAs.my} <span className="font-medium text-slate-200">{user.name}</span>
        </span>
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-white/10">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                active
                  ? 'border-brand-400 text-brand-300'
                  : 'border-transparent text-slate-400 hover:text-slate-100'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div>{children}</div>
    </div>
  );
}
