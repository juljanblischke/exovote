'use client';

import clsx from 'clsx';
import type { PollOption } from '@/lib/types';

type MultipleChoiceVotingProps = {
  options: PollOption[];
  selected: string[];
  onToggle: (optionId: string) => void;
  disabled?: boolean;
};

export function MultipleChoiceVoting({ options, selected, onToggle, disabled }: MultipleChoiceVotingProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <label
            key={option.id}
            className={clsx(
              'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-200',
              isSelected
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-[var(--border)] hover:border-[var(--primary)]/50',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            <input
              type="checkbox"
              value={option.id}
              checked={isSelected}
              onChange={() => onToggle(option.id)}
              disabled={disabled}
              className="h-4 w-4 rounded accent-[var(--primary)]"
            />
            <span className="text-sm font-medium">{option.text}</span>
          </label>
        );
      })}
    </div>
  );
}
