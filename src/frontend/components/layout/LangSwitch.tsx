'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { isValidLocale } from '@/lib/i18n/routing';

export function LangSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleSwitch = () => {
    const nextLocale = locale === 'de' ? 'en' : 'de';

    // Replace the locale segment in the pathname
    const segments = pathname.split('/');
    if (isValidLocale(segments[1])) {
      segments[1] = nextLocale;
    } else {
      segments.splice(1, 0, nextLocale);
    }
    const newPath = segments.join('/') || '/';
    router.push(newPath);
  };

  return (
    <button
      onClick={handleSwitch}
      className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      aria-label={`Switch to ${locale === 'de' ? 'English' : 'Deutsch'}`}
    >
      <Languages className="h-5 w-5" />
      <span className="hidden sm:inline uppercase">{locale === 'de' ? 'EN' : 'DE'}</span>
    </button>
  );
}
