import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import type { PollStatus } from '@/lib/types';

type PollStatusBadgeProps = {
  status: PollStatus;
};

const statusStyles: Record<PollStatus, string> = {
  Draft: 'bg-neutral-500/10 text-neutral-500',
  Active: 'bg-green-500/10 text-green-500',
  Closed: 'bg-yellow-500/10 text-yellow-500',
  Archived: 'bg-neutral-500/10 text-neutral-400',
};

export function PollStatusBadge({ status }: PollStatusBadgeProps) {
  const t = useTranslations('polls.status');

  const label = {
    Draft: 'active',
    Active: 'active',
    Closed: 'closed',
    Archived: 'archived',
  } as const;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      )}
    >
      <span
        className={clsx(
          'h-1.5 w-1.5 rounded-full',
          status === 'Active' ? 'animate-pulse-slow bg-green-500' : 'bg-current',
        )}
      />
      {t(label[status])}
    </span>
  );
}
