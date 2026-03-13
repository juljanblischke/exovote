import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '../../test-utils';
import { CountdownTimer } from '@/components/polls/CountdownTimer';

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders countdown when expiration is in the future', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours
    render(<CountdownTimer expiresAt={futureDate} />);
    expect(screen.getByText('Verbleibende Zeit')).toBeInTheDocument();
  });

  it('renders expired message when expiration is in the past', () => {
    const pastDate = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minute ago
    render(<CountdownTimer expiresAt={pastDate} />);
    expect(screen.getByText('Diese Umfrage ist abgelaufen')).toBeInTheDocument();
  });

  it('calls onExpired callback when poll expires', () => {
    vi.useFakeTimers();
    const onExpired = vi.fn();
    const almostExpired = new Date(Date.now() + 1500).toISOString(); // 1.5 seconds

    render(<CountdownTimer expiresAt={almostExpired} onExpired={onExpired} />);

    // Advance past expiration
    vi.advanceTimersByTime(2000);

    expect(onExpired).toHaveBeenCalledOnce();
  });

  it('displays days when more than 24 hours remaining', () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days
    render(<CountdownTimer expiresAt={futureDate} />);
    expect(screen.getByText('Tage')).toBeInTheDocument();
  });

  it('does not display days when less than 24 hours remaining', () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(); // 5 hours
    render(<CountdownTimer expiresAt={futureDate} />);
    expect(screen.queryByText('Tage')).not.toBeInTheDocument();
  });
});
