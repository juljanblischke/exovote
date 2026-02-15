import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import { SingleChoiceVoting } from '@/components/polls/SingleChoiceVoting';
import type { PollOption } from '@/lib/types';

const mockOptions: PollOption[] = [
  { id: '1', text: 'Option A', sortOrder: 0, voteCount: 0 },
  { id: '2', text: 'Option B', sortOrder: 1, voteCount: 0 },
  { id: '3', text: 'Option C', sortOrder: 2, voteCount: 0 },
];

describe('SingleChoiceVoting', () => {
  it('renders all options', () => {
    render(
      <SingleChoiceVoting options={mockOptions} selected={null} onSelect={vi.fn()} />,
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders radio inputs for each option', () => {
    render(
      <SingleChoiceVoting options={mockOptions} selected={null} onSelect={vi.fn()} />,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('calls onSelect when an option label is clicked', () => {
    const onSelect = vi.fn();
    render(
      <SingleChoiceVoting options={mockOptions} selected={null} onSelect={onSelect} />,
    );
    // Click the label containing "Option B"
    fireEvent.click(screen.getByText('Option B'));
    expect(onSelect).toHaveBeenCalledWith('2');
  });

  it('shows the selected option as checked', () => {
    render(
      <SingleChoiceVoting options={mockOptions} selected="2" onSelect={vi.fn()} />,
    );
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[0].checked).toBe(false);
    expect(radios[1].checked).toBe(true);
    expect(radios[2].checked).toBe(false);
  });
});
