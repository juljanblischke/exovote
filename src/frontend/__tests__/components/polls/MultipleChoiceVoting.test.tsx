import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import { MultipleChoiceVoting } from '@/components/polls/MultipleChoiceVoting';
import type { PollOption } from '@/lib/types';

const mockOptions: PollOption[] = [
  { id: '1', text: 'Option A', sortOrder: 0, voteCount: 0 },
  { id: '2', text: 'Option B', sortOrder: 1, voteCount: 0 },
  { id: '3', text: 'Option C', sortOrder: 2, voteCount: 0 },
];

describe('MultipleChoiceVoting', () => {
  it('renders all options as checkboxes', () => {
    render(
      <MultipleChoiceVoting options={mockOptions} selected={[]} onToggle={vi.fn()} />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('calls onToggle when a label is clicked', () => {
    const onToggle = vi.fn();
    render(
      <MultipleChoiceVoting options={mockOptions} selected={[]} onToggle={onToggle} />,
    );
    fireEvent.click(screen.getByText('Option A'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('shows selected options as checked', () => {
    render(
      <MultipleChoiceVoting options={mockOptions} selected={['1', '3']} onToggle={vi.fn()} />,
    );
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(false);
    expect(checkboxes[2].checked).toBe(true);
  });

  it('renders "Other" option when allowCustomAnswer is true', () => {
    render(
      <MultipleChoiceVoting
        options={mockOptions}
        selected={[]}
        onToggle={vi.fn()}
        allowCustomAnswer={true}
        customAnswerLabel="Other"
        onCustomAnswerToggle={vi.fn()}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('shows text input when custom answer is selected', () => {
    render(
      <MultipleChoiceVoting
        options={mockOptions}
        selected={[]}
        onToggle={vi.fn()}
        allowCustomAnswer={true}
        customAnswerSelected={true}
        customAnswerLabel="Other"
        customAnswerText=""
        customAnswerPlaceholder="Enter your answer"
        onCustomAnswerToggle={vi.fn()}
        onCustomAnswerTextChange={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText('Enter your answer')).toBeInTheDocument();
  });

  it('does not render "Other" option when allowCustomAnswer is false', () => {
    render(
      <MultipleChoiceVoting
        options={mockOptions}
        selected={[]}
        onToggle={vi.fn()}
        allowCustomAnswer={false}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  it('does not render "Other" option when allowCustomAnswer is undefined', () => {
    render(
      <MultipleChoiceVoting options={mockOptions} selected={[]} onToggle={vi.fn()} />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });
});
