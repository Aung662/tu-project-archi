'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { Icon, type IconName } from '@/components/Icon';
import { tr, t, type Label } from '@/lib/i18n';

// Keep the primary navigation focused. Secondary destinations remain available
// in the More menu; no page or capability is removed.
const PRIMARY: { href: string; label: Label; icon: IconName }[] = [
  { href: '/', label: t.navSearch, icon: 'search' },
  { href: '/browse', label: t.navBrowse, icon: 'browse' },
  { href: '/titles', label: t.navTitles, icon: 'titles' },
  { href: '/check', label: t.navCheck, icon: 'check' },
  { href: '/wiring', label: t.navWiring, icon: 'circuit' },
  { href: '/toolkit', label: t.navToolkit, icon: 'toolkit' },
];

const MORE: { href: string; label: Label }[] = [
  { href: '/new', label: t.navNew },
  { href: '/topics', label: t.navTopics },
  { href: '/kits', label: t.navKits },
  { href: '/contact', label: t.navContact },
  { href: '/about', label: t.navAbout },
  { href: '/stats', label: t.navStats },
];

const WORKSPACE: { href: string; label: Label }[] = [
  { href: '/notes', label: t.navNotes },
  { href: '/compare', label: t.navCompare },
  { href: '/collections', label: t.navCollections },
  { href: '/history', label: t.navHistory },
];

function isCurrentPath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const moreActive = [...MORE, ...(user ? WORKSPACE : [])].some((item) => isCurrentPath(pathname, item.href));

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const doLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/');
  };

  const closeMoreOnNavigation = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a')) {
      const details = event.currentTarget.closest('details');
      if (details) details.open = false;
    }
  };

  return (
    <header className="site-header sticky top-0 z-40 border-b backdrop-blur-xl">
      <nav aria-label={tr(t.navMainNavigation)} className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label={`${tr(t.brandTitle)} — home`} className="flex shrink-0 items-center gap-2 text-left">
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
        </Link>

        {/* A compact primary bar keeps desktop navigation readable. */}
        <div className="hidden items-center gap-0.5 xl:flex">
          {PRIMARY.map((item) => (
            <NavLink key={item.href} href={item.href} active={isCurrentPath(pathname, item.href)}>
              {tr(item.label)}
            </NavLink>
          ))}
          <details className="group relative">
            <summary
              aria-label={tr(t.navMore)}
              className={`flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition [&::-webkit-details-marker]:hidden ${moreActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              {tr(t.navMore)}
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true">
                <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div
              onClick={closeMoreOnNavigation}
              className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-ink-900/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{tr(t.navExplore)}</p>
              {MORE.map((item) => (
                <DropdownLink key={item.href} href={item.href} active={isCurrentPath(pathname, item.href)}>
                  {tr(item.label)}
                </DropdownLink>
              ))}
              {user && (
                <>
                  <div className="my-2 border-t border-white/10" />
                  <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{tr(t.navWorkspace)}</p>
                  {WORKSPACE.map((item) => (
                    <DropdownLink key={item.href} href={item.href} active={isCurrentPath(pathname, item.href)}>
                      {tr(item.label)}
                    </DropdownLink>
                  ))}
                </>
              )}
            </div>
          </details>
        </div>

        {/* Desktop account and accessibility controls */}
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <>
              {user.role === 'ADMIN' && <Link href="/admin" className="btn-secondary">{tr(t.navAdmin)}</Link>}
              <Link href="/library" className="btn-secondary">{tr(t.navLibrary)}</Link>
              <span className="hidden max-w-32 truncate text-sm text-slate-300 xl:inline">{user.name}</span>
              <button type="button" onClick={doLogout} className="btn-secondary">{tr(t.navLogout)}</button>
            </>
          ) : (
            <Link href="/login" className="btn-primary">{tr(t.navLogin)}</Link>
          )}
        </div>

        {/* Compact controls remain available on phones and tablets. */}
        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? tr(t.navCloseMenu) : tr(t.navOpenMenu)}
            aria-expanded={menuOpen}
            aria-controls="mobile-secondary-menu"
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/[0.03] text-slate-200 transition hover:bg-white/10"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Scrollable primary chips keep the main destinations one tap away. */}
      <div className="site-header-subnav border-t xl:hidden">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRIMARY.map((item) => {
            const active = isCurrentPath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`chip3d shrink-0 !px-3 !py-2 text-xs ${active ? 'chip3d-active' : ''}`}
              >
                <Icon name={item.icon} className="mr-1 h-3.5 w-3.5 shrink-0 text-brand-200" />
                <span className="whitespace-nowrap">{tr(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Secondary destinations are grouped in one accessible mobile menu. */}
      {menuOpen && (
        <div id="mobile-secondary-menu" className="site-header-menu border-t backdrop-blur-xl xl:hidden">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:grid-cols-2">
            <section aria-labelledby="mobile-explore-heading">
              <h2 id="mobile-explore-heading" className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{tr(t.navExplore)}</h2>
              <div className="grid grid-cols-2 gap-1">
                {MORE.map((item) => (
                  <MobileLink key={item.href} href={item.href} active={isCurrentPath(pathname, item.href)} onClick={() => setMenuOpen(false)}>
                    {tr(item.label)}
                  </MobileLink>
                ))}
              </div>
            </section>
            {user && (
              <section aria-labelledby="mobile-workspace-heading">
                <h2 id="mobile-workspace-heading" className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{tr(t.navWorkspace)}</h2>
                <div className="grid grid-cols-2 gap-1">
                  {WORKSPACE.map((item) => (
                    <MobileLink key={item.href} href={item.href} active={isCurrentPath(pathname, item.href)} onClick={() => setMenuOpen(false)}>
                      {tr(item.label)}
                    </MobileLink>
                  ))}
                </div>
              </section>
            )}
            <section className="flex flex-wrap items-center gap-1 sm:col-span-2">
              {user ? (
                <>
                  {user.role === 'ADMIN' && <MobileLink href="/admin" active={isCurrentPath(pathname, '/admin')} onClick={() => setMenuOpen(false)}>{tr(t.navAdminDashboard)}</MobileLink>}
                  <MobileLink href="/library" active={isCurrentPath(pathname, '/library')} onClick={() => setMenuOpen(false)}>{tr(t.navLibrary)}</MobileLink>
                  <button type="button" onClick={doLogout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10">
                    {tr(t.navLogout)} ({user.name})
                  </button>
                </>
              ) : (
                <MobileLink href="/login" active={isCurrentPath(pathname, '/login')} onClick={() => setMenuOpen(false)}>{tr(t.navLogin)}</MobileLink>
              )}
            </section>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-lg px-2.5 py-2 text-sm font-medium transition ${active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
    >
      {children}
    </Link>
  );
}

function DropdownLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`block rounded-xl px-3 py-2 text-sm transition ${active ? 'bg-brand-500/15 font-semibold text-brand-100' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'}`}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
  active = false,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${active ? 'bg-brand-500/15 text-brand-100' : 'text-slate-200 hover:bg-white/10'}`}
    >
      {children}
    </Link>
  );
}
