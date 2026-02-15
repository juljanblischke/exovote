'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';

const COOKIE_CONSENT_KEY = 'exovote-cookie-consent';

export function CookieConsent() {
  const t = useTranslations('cookie');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="animate-fade-in-up fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="glass mx-auto max-w-4xl rounded-2xl border border-[var(--border)] p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm text-[var(--foreground)]">
              {t('message')}{' '}
              <Link
                href="/privacy"
                className="font-medium text-[var(--primary)] underline underline-offset-4 hover:opacity-80"
              >
                {t('learnMore')}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecline}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
            >
              {t('decline')}
            </button>
            <button
              onClick={handleAccept}
              className="gradient-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105"
            >
              {t('accept')}
            </button>
            <button
              onClick={handleDecline}
              className="rounded-lg p-1 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
