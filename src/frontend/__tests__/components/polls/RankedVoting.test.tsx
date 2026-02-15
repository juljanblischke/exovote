import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import { RankedVoting } from '@/components/polls/RankedVoting';
import type { PollOption } from '@/lib/types';

const mockOptions: PollOption[] = [
  { id: '1', text: 'Option A', sortOrder: 0, voteCount: 0 },
  { id: '2', text: 'Option B', sortOrder: 1, voteCount: 0 },
  { id: '3', text: 'Option C', sortOrder: 2, voteCount: 0 },
];

describe('RankedVoting', () => {
  it('renders all options with rank numbers', () => {
    render(
      <RankedVoting options={mockOptions} ranking={['1', '2', '3']} onRankingChange={vi.fn()} />,
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onRankingChange when moving an item up', () => {
    const onRankingChange = vi.fn();
    render(
      <RankedVoting options={mockOptions} ranking={['1', '2', '3']} onRankingChange={onRankingChange} />,
    );
    // The second item's "Move up" button
    const moveUpButtons = screen.getAllByRole('button', { name: 'Move up' });
    fireEvent.click(moveUpButtons[1]);
    expect(onRankingChange).toHaveBeenCalledWith(['2', '1', '3']);
  });

  it('calls onRankingChange when moving an item down', () => {
    const onRankingChange = vi.fn();
    render(
      <RankedVoting options={mockOptions} ranking={['1', '2', '3']} onRankingChange={onRankingChange} />,
    );
    const moveDownButtons = screen.getAllByRole('button', { name: 'Move down' });
    fireEvent.click(moveDownButtons[0]);
    expect(onRankingChange).toHaveBeenCalledWith(['2', '1', '3']);
  });

  it('disables move up for the first item', () => {
    render(
      <RankedVoting options={mockOptions} ranking={['1', '2', '3']} onRankingChange={vi.fn()} />,
    );
    const moveUpButtons = screen.getAllByRole('button', { name: 'Move up' });
    expect(moveUpButtons[0]).toBeDisabled();
  });

  it('disables move down for the last item', () => {
    render(
      <RankedVoting options={mockOptions} ranking={['1', '2', '3']} onRankingChange={vi.fn()} />,
    );
    const moveDownButtons = screen.getAllByRole('button', { name: 'Move down' });
    expect(moveDownButtons[2]).toBeDisabled();
  });
});
