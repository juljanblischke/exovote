import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import { QrCodeCard } from '@/components/polls/QrCodeCard';

describe('QrCodeCard', () => {
  const defaultProps = {
    pollId: 'test-poll-123',
    pollTitle: 'Test Umfrage',
  };

  it('renders QR code with accessible label', () => {
    render(<QrCodeCard {...defaultProps} />);
    expect(
      screen.getByRole('img', { name: /QR-Code für Umfrage: Test Umfrage/ }),
    ).toBeInTheDocument();
  });

  it('renders scan to vote text', () => {
    render(<QrCodeCard {...defaultProps} />);
    expect(screen.getByText('Scannen zum Abstimmen')).toBeInTheDocument();
  });

  it('renders download PNG button', () => {
    render(<QrCodeCard {...defaultProps} />);
    expect(screen.getByText('PNG herunterladen')).toBeInTheDocument();
  });

  it('renders download SVG button', () => {
    render(<QrCodeCard {...defaultProps} />);
    expect(screen.getByText('SVG herunterladen')).toBeInTheDocument();
  });

  it('renders an SVG element inside the QR container', () => {
    render(<QrCodeCard {...defaultProps} />);
    const qrContainer = screen.getByRole('img', {
      name: /QR-Code für Umfrage/,
    });
    expect(qrContainer.querySelector('svg')).toBeInTheDocument();
  });

  it('download PNG button is keyboard accessible', () => {
    render(<QrCodeCard {...defaultProps} />);
    const pngButton = screen.getByText('PNG herunterladen').closest('button');
    expect(pngButton).not.toBeDisabled();
    pngButton?.focus();
    expect(pngButton).toHaveFocus();
  });

  it('download SVG button triggers download', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    render(<QrCodeCard {...defaultProps} />);
    const svgButton = screen.getByText('SVG herunterladen').closest('button');
    fireEvent.click(svgButton!);

    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });
});
