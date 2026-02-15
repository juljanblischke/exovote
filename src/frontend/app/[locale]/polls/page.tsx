import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Plus, BarChart3, Users, Clock } from 'lucide-react';

export default function PollsPage() {
  const t = useTranslations('polls');

  return (
    <div className="relative overflow-hidden">
      {/* Background mesh */}
      <div className="gradient-mesh absolute inset-0 -z-10" />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center sm:pt-28 sm:pb-16">
        <div className="animate-fade-in-up mx-auto max-w-3xl">
          <h1 className="text-gradient mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('list.title')}
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-[var(--muted-foreground)]">
            {t('list.description')}
          </p>
          <Link
            href="/polls/create"
            className="gradient-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            {t('list.createCta')}
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="glass rounded-2xl border border-[var(--border)] p-6 text-center">
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

          <div className="glass rounded-2xl border border-[var(--border)] p-6 text-center">
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

          <div className="glass rounded-2xl border border-[var(--border)] p-6 text-center">
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
