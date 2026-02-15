import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { PollStatusBadge } from '@/components/polls/PollStatusBadge';

describe('PollStatusBadge', () => {
  it('renders Active status label', () => {
    render(<PollStatusBadge status="Active" />);
    expect(screen.getByText('Aktiv')).toBeInTheDocument();
  });

  it('renders Closed status label', () => {
    render(<PollStatusBadge status="Closed" />);
    expect(screen.getByText('Geschlossen')).toBeInTheDocument();
  });

  it('renders Archived status label', () => {
    render(<PollStatusBadge status="Archived" />);
    expect(screen.getByText('Archiviert')).toBeInTheDocument();
  });
});
