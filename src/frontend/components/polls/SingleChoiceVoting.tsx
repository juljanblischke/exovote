'use client';

import clsx from 'clsx';
import type { PollOption } from '@/lib/types';

type SingleChoiceVotingProps = {
  options: PollOption[];
  selected: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  allowCustomAnswer?: boolean;
  customAnswerSelected?: boolean;
  onCustomAnswerSelect?: () => void;
  customAnswerText?: string;
  onCustomAnswerTextChange?: (text: string) => void;
  customAnswerLabel?: string;
  customAnswerPlaceholder?: string;
};

export function SingleChoiceVoting({
  options,
  selected,
  onSelect,
  disabled,
  allowCustomAnswer,
  customAnswerSelected,
  onCustomAnswerSelect,
  customAnswerText,
  onCustomAnswerTextChange,
  customAnswerLabel,
  customAnswerPlaceholder,
}: SingleChoiceVotingProps) {
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
      {allowCustomAnswer && (
        <label
          className={clsx(
            'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-200',
            customAnswerSelected
              ? 'border-[var(--primary)] bg-[var(--primary)]/5'
              : 'border-[var(--border)] hover:border-[var(--primary)]/50',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <input
            type="radio"
            name="poll-option"
            value="__custom__"
            checked={customAnswerSelected}
            onChange={() => onCustomAnswerSelect?.()}
            disabled={disabled}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <div className="flex-1">
            <span className="text-sm font-medium">{customAnswerLabel ?? 'Other'}</span>
            {customAnswerSelected && (
              <input
                type="text"
                value={customAnswerText ?? ''}
                onChange={(e) => onCustomAnswerTextChange?.(e.target.value)}
                placeholder={customAnswerPlaceholder}
                maxLength={200}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                autoFocus
              />
            )}
          </div>
        </label>
      )}
    </div>
  );
}
