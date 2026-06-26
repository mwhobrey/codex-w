'use client';

import { AuthNav } from '@/components/auth-nav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const appLinks = [
  { href: '/play', label: 'Tables' },
  { href: '/characters', label: 'Characters' },
  { href: '/library', label: 'Library' },
  { href: '/dice', label: 'Dice' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-secondary font-mono text-sm text-primary"
            aria-hidden
          >
            W
          </span>
          <span className="hidden font-display text-lg font-medium tracking-tight text-foreground sm:inline">
            Codex<span className="text-primary">-W</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Main">
          {appLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  active
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {isHome && (
            <>
              <Link
                href="/#features"
                className="text-sm text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              >
                Features
              </Link>
              <Link
                href="/#solo"
                className="text-sm text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              >
                Solo systems
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <AuthNav />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-border/50 bg-background px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {appLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-2.5 text-sm ${
                      active
                        ? 'bg-secondary font-medium text-primary'
                        : 'text-muted-foreground hover:bg-secondary/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {isHome && (
              <>
                <li>
                  <Link
                    href="/#features"
                    className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground/70 hover:bg-secondary/60"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#solo"
                    className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground/70 hover:bg-secondary/60"
                  >
                    Solo systems
                  </Link>
                </li>
              </>
            )}
            <li className="border-t border-border/50 pt-2 mt-2">
              <AuthNav variant="mobile" />
            </li>
            <li className="pt-2 md:hidden">
              <Link
                href="/dice"
                className="block rounded-full bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground"
              >
                Roll dice
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
