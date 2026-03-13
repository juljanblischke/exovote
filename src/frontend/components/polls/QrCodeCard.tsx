'use client';

import { useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type QrCodeCardProps = {
  pollId: string;
  pollTitle: string;
};

export function QrCodeCard({ pollId, pollTitle }: QrCodeCardProps) {
  const t = useTranslations('polls.share');
  const qrRef = useRef<HTMLDivElement>(null);

  const getVoteUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/polls/${pollId}`;
  }, [pollId]);

  const downloadPng = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const link = document.createElement('a');
      link.download = `exovote-qr-${pollId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  }, [pollId]);

  const downloadSvg = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `exovote-qr-${pollId}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, [pollId]);

  return (
    <Card glass className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
        <QrCode className="h-4 w-4" />
        {t('scanToVote')}
      </div>

      <div
        ref={qrRef}
        className="rounded-xl bg-white p-3"
        role="img"
        aria-label={t('qrCodeAlt', { title: pollTitle })}
      >
        <QRCodeSVG
          value={getVoteUrl()}
          size={180}
          level="M"
          fgColor="#1a1a2e"
          bgColor="#ffffff"
          marginSize={0}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={downloadPng}>
          <Download className="h-3.5 w-3.5" />
          {t('downloadPng')}
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadSvg}>
          <Download className="h-3.5 w-3.5" />
          {t('downloadSvg')}
        </Button>
      </div>
    </Card>
  );
}
