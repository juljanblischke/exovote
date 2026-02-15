'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PollHeader } from '@/components/polls/PollHeader';
import { VotingForm } from '@/components/polls/VotingForm';
import { ShareButton } from '@/components/polls/ShareButton';
import { PollResults } from '@/components/polls/PollResults';
import type { Poll } from '@/lib/types';

export default function PollPage() {
  const t = useTranslations('polls');
  const ct = useTranslations('common');
  const params = useParams<{ id: string }>();
  const pollId = params.id;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const fetchPoll = useCallback(async () => {
    try {
      const data = await apiFetch<Poll>(`/api/polls/${pollId}`);
      setPoll(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError('notFound');
      } else {
        setError('serverError');
      }
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  const handleVoteSubmitted = () => {
    setHasVoted(true);
    fetchPoll();
  };

  const canVote = poll?.isActive && poll?.status === 'Active' && !hasVoted;

  // Loading state
  if (loading) {
    return (
      <div className="relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0 -z-10" />
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            <p className="text-[var(--muted-foreground)]">{ct('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (error || !poll) {
    return (
      <div className="relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0 -z-10" />
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4">
          <Card glass className="w-full text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[var(--destructive)]" />
            <h2 className="mb-2 text-xl font-bold">
              {error === 'notFound' ? t('errors.notFound') : ct('error')}
            </h2>
            <p className="mb-6 text-sm text-[var(--muted-foreground)]">
              {error === 'notFound'
                ? t('errors.notFoundDescription')
                : t('errors.serverError')}
            </p>
            <Link
              href="/"
              className="text-sm text-[var(--primary)] transition-colors hover:underline"
            >
              {ct('back')}
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="gradient-mesh absolute inset-0 -z-10" />
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {ct('back')}
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <PollHeader poll={poll} />
          <ShareButton pollId={poll.id} />
        </div>

        {/* Voting disabled message */}
        {!canVote && !hasVoted && poll.status !== 'Active' && (
          <Card glass className="mb-6">
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              {t('view.votingDisabled')}
            </p>
          </Card>
        )}

        {/* Vote success message */}
        {hasVoted && (
          <Card glass className="mb-6">
            <p className="text-center text-sm text-green-500 font-medium">
              {t('vote.success')}
            </p>
          </Card>
        )}

        {/* Voting Form */}
        {canVote && (
          <div className="mb-8">
            <VotingForm poll={poll} onVoteSubmitted={handleVoteSubmitted} />
          </div>
        )}

        {/* Results — always visible */}
        <PollResults pollId={poll.id} pollType={poll.type} />
      </div>
    </div>
  );
}
