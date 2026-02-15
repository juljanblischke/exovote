import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies glass class when glass prop is true', () => {
    render(<Card glass>Glass card</Card>);
    expect(screen.getByText('Glass card').closest('div')).toHaveClass('glass');
  });

  it('does not apply glass class by default', () => {
    render(<Card>Normal card</Card>);
    expect(screen.getByText('Normal card').closest('div')).not.toHaveClass('glass');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Styled card</Card>);
    expect(screen.getByText('Styled card').closest('div')).toHaveClass('custom-class');
  });
});
