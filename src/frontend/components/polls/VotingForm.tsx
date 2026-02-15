'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { SingleChoiceVoting } from './SingleChoiceVoting';
import { MultipleChoiceVoting } from './MultipleChoiceVoting';
import { RankedVoting } from './RankedVoting';
import type { Poll } from '@/lib/types';

type VotingFormProps = {
  poll: Poll;
  onVoteSubmitted: () => void;
};

export function VotingForm({ poll, onVoteSubmitted }: VotingFormProps) {
  const t = useTranslations('polls');

  const [voterName, setVoterName] = useState('');
  const [singleChoice, setSingleChoice] = useState<string | null>(null);
  const [multipleChoices, setMultipleChoices] = useState<string[]>([]);
  const [ranking, setRanking] = useState<string[]>(
    poll.options.map((o) => o.id),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const toggleMultipleChoice = useCallback((optionId: string) => {
    setMultipleChoices((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  }, []);

  const validate = (): boolean => {
    let valid = true;
    setNameError(null);
    setSelectionError(null);

    if (!voterName.trim()) {
      setNameError(t('vote.validation.nameRequired'));
      valid = false;
    }

    if (poll.type === 'SingleChoice' && !singleChoice) {
      setSelectionError(t('vote.validation.selectionRequired'));
      valid = false;
    }

    if (poll.type === 'MultipleChoice' && multipleChoices.length === 0) {
      setSelectionError(t('vote.validation.selectionRequired'));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      let selections: Array<{ optionId: string; rank?: number }>;

      if (poll.type === 'SingleChoice') {
        selections = [{ optionId: singleChoice! }];
      } else if (poll.type === 'MultipleChoice') {
        selections = multipleChoices.map((id) => ({ optionId: id }));
      } else {
        selections = ranking.map((id, index) => ({
          optionId: id,
          rank: index + 1,
        }));
      }

      await apiFetch(`/api/polls/${poll.id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName: voterName.trim(),
          selections,
        }),
      });

      onVoteSubmitted();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t('errors.duplicateVote'));
      } else {
        setError(err instanceof Error ? err.message : t('errors.serverError'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = {
    SingleChoice: t('vote.selectOption'),
    MultipleChoice: t('vote.selectOptions'),
    Ranked: t('vote.rankOptions'),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card glass>
        <FormField
          label={t('vote.voterNameLabel')}
          htmlFor="voterName"
          required
          error={nameError ?? undefined}
          help={t('vote.voterNameHelp')}
        >
          <Input
            id="voterName"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder={t('vote.voterNamePlaceholder')}
            error={nameError ?? undefined}
          />
        </FormField>
      </Card>

      <Card glass>
        <FormField
          label={typeLabel[poll.type]}
          error={selectionError ?? undefined}
        >
          {poll.type === 'SingleChoice' && (
            <SingleChoiceVoting
              options={poll.options}
              selected={singleChoice}
              onSelect={setSingleChoice}
            />
          )}

          {poll.type === 'MultipleChoice' && (
            <MultipleChoiceVoting
              options={poll.options}
              selected={multipleChoices}
              onToggle={toggleMultipleChoice}
            />
          )}

          {poll.type === 'Ranked' && (
            <>
              <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                {t('vote.rankHelp')}
              </p>
              <RankedVoting
                options={poll.options}
                ranking={ranking}
                onRankingChange={setRanking}
              />
            </>
          )}
        </FormField>
      </Card>

      {error && (
        <p className="text-center text-sm text-[var(--destructive)]">{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        className="w-full"
      >
        {submitting ? t('vote.submitting') : t('vote.submitVote')}
      </Button>
    </form>
  );
}
