'use client';

import { Link } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Vote, Github } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('navigation');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Top gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent" />

      <div className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left: Brand */}
            <div className="lg:col-span-5">
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                  <Vote className="w-5 h-5 text-[var(--primary-foreground)]" />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-[var(--primary)]">Exo</span>
                  <span className="text-[var(--foreground)]">Vote</span>
                </span>
              </Link>

              <p className="text-[var(--muted-foreground)] max-w-sm mb-8">
                {t('tagline')}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/juljanblischke/exovote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right: Link columns */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {/* Navigate */}
                <div>
                  <h4 className="font-semibold mb-4">{t('navigate')}</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/"
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                      >
                        {nav('home')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/polls"
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                      >
                        {nav('polls')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/polls/create"
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                      >
                        {t('createPoll')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Product */}
                <div>
                  <h4 className="font-semibold mb-4">{t('product')}</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/"
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                      >
                        ExoVote
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="font-semibold mb-4">{t('legal')}</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/imprint"
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                      >
                        {nav('imprint')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                      >
                        {nav('privacy')}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-[var(--border)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                &copy; {currentYear} Exostruction. {t('rights')}
              </p>

              {/* Easter Egg */}
              <p className="text-sm text-[var(--muted-foreground)]/50 font-mono">
                {'<'}made with passion in DE{' />'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background gradient blob */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[150px] pointer-events-none" />
    </footer>
  );
}
