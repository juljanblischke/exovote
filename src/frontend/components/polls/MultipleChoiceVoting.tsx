'use client';

import clsx from 'clsx';
import type { PollOption } from '@/lib/types';

type MultipleChoiceVotingProps = {
  options: PollOption[];
  selected: string[];
  onToggle: (optionId: string) => void;
  disabled?: boolean;
  allowCustomAnswer?: boolean;
  customAnswerSelected?: boolean;
  onCustomAnswerToggle?: () => void;
  customAnswerText?: string;
  onCustomAnswerTextChange?: (text: string) => void;
  customAnswerLabel?: string;
  customAnswerPlaceholder?: string;
};

export function MultipleChoiceVoting({
  options,
  selected,
  onToggle,
  disabled,
  allowCustomAnswer,
  customAnswerSelected,
  onCustomAnswerToggle,
  customAnswerText,
  onCustomAnswerTextChange,
  customAnswerLabel,
  customAnswerPlaceholder,
}: MultipleChoiceVotingProps) {
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
            type="checkbox"
            value="__custom__"
            checked={customAnswerSelected}
            onChange={() => onCustomAnswerToggle?.()}
            disabled={disabled}
            className="h-4 w-4 rounded accent-[var(--primary)]"
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
