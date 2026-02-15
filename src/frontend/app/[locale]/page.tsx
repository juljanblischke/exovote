import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

export default function HomePage() {
  const t = useTranslations('home');
  const nav = useTranslations('navigation');

  return (
    <div className="relative overflow-hidden">
      {/* Background mesh */}
      <div className="gradient-mesh absolute inset-0 -z-10" />

      {/* Hero Section */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="animate-fade-in-up mx-auto max-w-4xl">
          <h1 className="text-gradient mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--muted-foreground)] sm:text-xl">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/polls/create"
              className="gradient-primary inline-flex items-center rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href="/polls"
              className="glass inline-flex items-center rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              {nav('polls')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
