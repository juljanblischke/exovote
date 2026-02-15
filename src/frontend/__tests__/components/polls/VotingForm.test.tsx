import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import { VotingForm } from '@/components/polls/VotingForm';
import type { Poll } from '@/lib/types';

const basePoll: Poll = {
  id: 'test-poll-id',
  title: 'Test Poll',
  description: 'A test poll',
  status: 'Active',
  type: 'SingleChoice',
  isActive: true,
  expiresAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  options: [
    { id: '1', text: 'Option A', sortOrder: 0, voteCount: 0 },
    { id: '2', text: 'Option B', sortOrder: 1, voteCount: 0 },
  ],
  totalVotes: 0,
};

describe('VotingForm', () => {
  it('renders voter name input', () => {
    render(<VotingForm poll={basePoll} onVoteSubmitted={vi.fn()} />);
    expect(screen.getByPlaceholderText('Gib deinen Namen ein')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<VotingForm poll={basePoll} onVoteSubmitted={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Abstimmen' })).toBeInTheDocument();
  });

  it('renders radio buttons for SingleChoice polls', () => {
    render(<VotingForm poll={basePoll} onVoteSubmitted={vi.fn()} />);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('renders checkboxes for MultipleChoice polls', () => {
    const multiPoll: Poll = { ...basePoll, type: 'MultipleChoice' };
    render(<VotingForm poll={multiPoll} onVoteSubmitted={vi.fn()} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('shows validation error when submitting without a name', () => {
    render(<VotingForm poll={basePoll} onVoteSubmitted={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abstimmen' }));
    expect(screen.getByText('Dein Name ist erforderlich')).toBeInTheDocument();
  });

  it('shows validation error when submitting without selecting an option', () => {
    render(<VotingForm poll={basePoll} onVoteSubmitted={vi.fn()} />);
    // Fill in name but don't select an option
    fireEvent.change(screen.getByPlaceholderText('Gib deinen Namen ein'), {
      target: { value: 'Test User' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Abstimmen' }));
    expect(screen.getByText('Bitte wahle mindestens eine Option')).toBeInTheDocument();
  });
});
