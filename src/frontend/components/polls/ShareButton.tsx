'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ShareButtonProps = {
  pollId: string;
};

export function ShareButton({ pollId }: ShareButtonProps) {
  const t = useTranslations('polls.share');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/polls/${pollId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {t('copied')}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {t('copyLink')}
        </>
      )}
    </Button>
  );
}
