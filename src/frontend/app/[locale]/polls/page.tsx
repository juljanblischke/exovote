import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Plus, BarChart3, Users, Clock } from 'lucide-react';

export default function PollsPage() {
  const t = useTranslations('polls');

  return (
    <div className="relative">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(225,29,72,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(225,29,72,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]" />
        <div className="absolute top-20 left-[15%] w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-40 right-[10%] w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-[120px] animate-float [animation-delay:-3s]" />
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="animate-fade-in-up [animation-delay:0.1s] opacity-0 [animation-fill-mode:forwards] text-gradient mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('list.title')}
          </h1>
          <p className="animate-fade-in-up [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards] mx-auto mb-8 max-w-xl text-lg text-[var(--muted-foreground)]">
            {t('list.description')}
          </p>
          <div className="animate-fade-in-up [animation-delay:0.3s] opacity-0 [animation-fill-mode:forwards]">
            <Link
              href="/polls/create"
              className="gradient-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              {t('list.createCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="animate-fade-in-up [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards] glass rounded-2xl border border-[var(--border)] p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <BarChart3 className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <h3 className="mb-2 font-semibold text-[var(--foreground)]">
              {t('results.liveUpdates')}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t('results.connected')}
            </p>
          </div>

          <div className="animate-fade-in-up [animation-delay:0.5s] opacity-0 [animation-fill-mode:forwards] glass rounded-2xl border border-[var(--border)] p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <Users className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <h3 className="mb-2 font-semibold text-[var(--foreground)]">
              {t('types.multipleChoice')}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t('types.multipleChoiceDescription')}
            </p>
          </div>

          <div className="animate-fade-in-up [animation-delay:0.6s] opacity-0 [animation-fill-mode:forwards] glass rounded-2xl border border-[var(--border)] p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <Clock className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <h3 className="mb-2 font-semibold text-[var(--foreground)]">
              {t('types.ranked')}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t('types.rankedDescription')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
