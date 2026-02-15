import { useTranslations } from 'next-intl';
import { Calendar, Clock } from 'lucide-react';
import { PollStatusBadge } from './PollStatusBadge';
import type { Poll } from '@/lib/types';

type PollHeaderProps = {
  poll: Poll;
};

export function PollHeader({ poll }: PollHeaderProps) {
  const t = useTranslations('polls');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <PollStatusBadge status={poll.status} />
        <span className="text-xs text-[var(--muted-foreground)]">
          {t('results.totalVotes', { count: poll.options.reduce((sum, o) => sum + o.voteCount, 0) })}
        </span>
      </div>
      <h1 className="text-gradient text-3xl font-bold sm:text-4xl">
        {poll.title}
      </h1>
      {poll.description && (
        <p className="text-[var(--muted-foreground)]">{poll.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {t('view.createdAt', { date: formatDate(poll.createdAt) })}
        </span>
        {poll.expiresAt && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t('view.expiresAt', { date: formatDate(poll.expiresAt) })}
          </span>
        )}
      </div>
    </div>
  );
}
