'use client';

import clsx from 'clsx';
import type { PollOption } from '@/lib/types';

type SingleChoiceVotingProps = {
  options: PollOption[];
  selected: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
};

export function SingleChoiceVoting({ options, selected, onSelect, disabled }: SingleChoiceVotingProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.id}
          className={clsx(
            'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-200',
            selected === option.id
              ? 'border-[var(--primary)] bg-[var(--primary)]/5'
              : 'border-[var(--border)] hover:border-[var(--primary)]/50',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <input
            type="radio"
            name="poll-option"
            value={option.id}
            checked={selected === option.id}
            onChange={() => onSelect(option.id)}
            disabled={disabled}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <span className="text-sm font-medium">{option.text}</span>
        </label>
      ))}
    </div>
  );
}
