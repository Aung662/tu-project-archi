'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { tr, t, type Label } from '@/lib/i18n';

// The five primary destinations. Shown as desktop nav links AND as a row of
// raised 3D chips directly under the header on mobile — so phone users no longer
// have to open the hamburger to reach them. Icons mirror the rest of the UI.
const PRIMARY: { href: string; label: Label; icon: string }[] = [
  { href: '/', label: t.navSearch, icon: '🔎' },
  { href: '/browse', label: t.navBrowse, icon: '🗂️' },
  { href: '/titles', label: t.navTitles, icon: '📋' },
  { href: '/check', label: t.navCheck, icon: '✨' },
  { href: '/contact', label: t.navContact, icon: '✉️' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Bug fix: mobile users previously had NO way to reach Browse / Title Check /
  // Library / Admin (all were hidden on small screens with no menu). Add a
  // hamburger-toggled mobile menu so the primary (mobile) persona can navigate.
  const [menuOpen, setMenuOpen] = useState(false);

  // 3-click logo trigger: pure UX convenience to reveal the admin login.
  // NOT a security control — every admin API route is protected server-side by
  // role checks. This only navigates to the (also public) hidden login route.
  const clicks = useRef<number[]>([]);
  const onLogoClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current, now].filter((t) => now - t < 1500);
    if (clicks.current.length >= 3) {
      clicks.current = [];
      router.push('/portal-hidden-access');
    }
  };

  const doLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button onClick={onLogoClick} title="TU Project Archive" className="flex items-center gap-2 text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Technological University Taunggyi"
              className="h-10 w-auto drop-shadow-[0_0_12px_rgba(99,102,241,0.35)]"
            />
            <span className="hidden sm:block">
              <span className="block text-sm font-bold leading-tight text-slate-100">{tr(t.brandTitle)}</span>
              <span className="block text-[11px] leading-tight text-slate-400">{tr(t.brandSubtitle)}</span>
            </span>
          </button>
          <div className="hidden items-center gap-1 sm:flex">
            {PRIMARY.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {tr(item.label)}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 sm:flex">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="btn-secondary">
                  {tr(t.navAdmin)}
                </Link>
              )}
              <Link href="/library" className="btn-secondary">
                {tr(t.navLibrary)}
              </Link>
              <span className="hidden text-sm text-slate-300 lg:inline">{user.name}</span>
              <button onClick={doLogout} className="btn-secondary">
                {tr(t.navLogout)}
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary">
              {tr(t.navLogin)}
            </Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-slate-200"
          >
            <span className="text-xl leading-none">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile primary nav — raised 3D chips shown directly under the header so
          phone users reach the five main pages without opening the hamburger. */}
      <div className="border-t border-white/10 bg-ink-900/60 sm:hidden">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRIMARY.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`chip3d shrink-0 !px-3 !py-2 text-xs ${active ? 'chip3d-active' : ''}`}
              >
                <span aria-hidden>{item.icon}</span>
                <span className="whitespace-nowrap">{tr(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile menu panel — secondary items only (primary five are chips above) */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-ink-900/95 backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <MobileLink href="/admin" onClick={() => setMenuOpen(false)}>{tr(t.navAdminDashboard)}</MobileLink>
                )}
                <MobileLink href="/library" onClick={() => setMenuOpen(false)}>{tr(t.navLibrary)}</MobileLink>
                <button
                  onClick={doLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-300 hover:bg-red-500/10"
                >
                  {tr(t.navLogout)} ({user.name})
                </button>
              </>
            ) : (
              <MobileLink href="/login" onClick={() => setMenuOpen(false)}>{tr(t.navLogin)}</MobileLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
    >
      {children}
    </Link>
  );
}
