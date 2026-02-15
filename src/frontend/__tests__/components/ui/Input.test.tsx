import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const onChange = vi.fn();
    render(<Input placeholder="enter" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('enter'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('applies error styles when error prop is set', () => {
    render(<Input placeholder="err" error="Required" />);
    const input = screen.getByPlaceholderText('err');
    expect(input.className).toContain('destructive');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Input placeholder="dis" disabled />);
    expect(screen.getByPlaceholderText('dis')).toBeDisabled();
  });
});
