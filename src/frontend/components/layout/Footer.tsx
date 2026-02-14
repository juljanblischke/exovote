'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Vote, Heart } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('navigation');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Vote className="h-6 w-6 text-[var(--primary)]" />
              <span className="text-gradient text-lg font-bold">ExoVote</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t('madeWith')}{' '}
              <Heart className="inline-block h-4 w-4 text-[var(--primary)]" />{' '}
              by Exostruction
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              {nav('home')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/polls"
                  className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                >
                  {nav('polls')}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                >
                  {nav('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/imprint"
                  className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                >
                  {nav('imprint')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                >
                  {nav('privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-[var(--border)] pt-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            &copy; {currentYear} Exostruction. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
