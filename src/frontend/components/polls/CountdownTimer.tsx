'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Timer, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

type CountdownTimerProps = {
  expiresAt: string;
  onExpired?: () => void;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

function calculateTimeLeft(expiresAt: string): TimeLeft | null {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const t = useTranslations('polls.countdown');

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(expiresAt));
  const [expired, setExpired] = useState(() => !calculateTimeLeft(expiresAt));

  useEffect(() => {
    if (expired) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(expiresAt);
      if (!remaining) {
        setExpired(true);
        setTimeLeft(null);
        onExpired?.();
        clearInterval(timer);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expired, expiresAt, onExpired]);

  if (expired) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-[var(--destructive)]" />
        <span className="text-sm font-medium text-[var(--destructive)]">
          {t('expired')}
        </span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const isUrgent = timeLeft.total < 60 * 60 * 1000;

  return (
    <div className={clsx(
      'rounded-xl border px-4 py-3',
      isUrgent
        ? 'border-[var(--destructive)]/30 bg-[var(--destructive)]/5'
        : 'border-[var(--border)] bg-[var(--muted)]/30',
    )}>
      <div className="mb-2 flex items-center gap-2">
        <Timer className={clsx(
          'h-4 w-4',
          isUrgent ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]',
        )} />
        <span className={clsx(
          'text-xs font-medium',
          isUrgent ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]',
        )}>
          {t('timeRemaining')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <>
            <TimeUnit value={timeLeft.days} label={t('days')} urgent={isUrgent} />
            <Separator urgent={isUrgent} />
          </>
        )}
        <TimeUnit value={timeLeft.hours} label={t('hours')} urgent={isUrgent} />
        <Separator urgent={isUrgent} />
        <TimeUnit value={timeLeft.minutes} label={t('minutes')} urgent={isUrgent} />
        <Separator urgent={isUrgent} />
        <TimeUnit value={timeLeft.seconds} label={t('seconds')} urgent={isUrgent} />
      </div>
    </div>
  );
}

function TimeUnit({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={clsx(
        'min-w-[2.5rem] rounded-lg px-2 py-1 text-center text-xl font-bold tabular-nums',
        urgent
          ? 'bg-[var(--destructive)]/10 text-[var(--destructive)] animate-pulse'
          : 'bg-[var(--muted)]/50 text-[var(--foreground)]',
      )}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-0.5 text-[0.65rem] text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}

function Separator({ urgent }: { urgent: boolean }) {
  return (
    <span className={clsx(
      'mb-4 text-lg font-bold',
      urgent ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]',
    )}>:</span>
  );
}
