import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum',
};

export default function ImprintPage() {
  const t = useTranslations('navigation');

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(225,29,72,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(225,29,72,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]" />
        <div className="absolute top-20 right-[15%] w-64 h-64 bg-[var(--primary)]/8 rounded-full blur-[100px]" />
      </div>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-gradient mb-8 text-4xl font-bold animate-fade-in-up [animation-delay:0.1s] opacity-0 [animation-fill-mode:forwards]">{t('imprint')}</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none animate-fade-in-up [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
          <h2>Angaben gemaess 5 TMG</h2>
          <p>
            Exostruction GmbH
            <br />
            Musterstrasse 1
            <br />
            12345 Musterstadt
          </p>

          <h2>Kontakt</h2>
          <p>
            E-Mail: info@exostruction.com
          </p>

          <h2>Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Seite wurden mit groesster Sorgfalt erstellt. Fuer die Richtigkeit,
            Vollstaendigkeit und Aktualitaet der Inhalte koennen wir jedoch keine Gewaehr
            uebernehmen.
          </p>
        </div>
      </div>
    </div>
  );
}
