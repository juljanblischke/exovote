'use client';

import { useCallback } from 'react';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import clsx from 'clsx';
import type { PollOption } from '@/lib/types';

type RankedVotingProps = {
  options: PollOption[];
  ranking: string[];
  onRankingChange: (ranking: string[]) => void;
  disabled?: boolean;
};

export function RankedVoting({ options, ranking, onRankingChange, disabled }: RankedVotingProps) {
  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newRanking = [...ranking];
      [newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]];
      onRankingChange(newRanking);
    },
    [ranking, onRankingChange],
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index === ranking.length - 1) return;
      const newRanking = [...ranking];
      [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
      onRankingChange(newRanking);
    },
    [ranking, onRankingChange],
  );

  const getOptionText = (optionId: string) => {
    return options.find((o) => o.id === optionId)?.text ?? '';
  };

  return (
    <div className="space-y-2">
      {ranking.map((optionId, index) => (
        <div
          key={optionId}
          className={clsx(
            'flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 transition-all duration-200',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <GripVertical className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
            {index + 1}
          </span>
          <span className="flex-1 text-sm font-medium">{getOptionText(optionId)}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0 || disabled}
              className="rounded-lg p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === ranking.length - 1 || disabled}
              className="rounded-lg p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-30"
              aria-label="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
