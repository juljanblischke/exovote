import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum',
};

export default function ImprintPage() {
  const t = useTranslations('navigation');

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">{t('imprint')}</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
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
  );
}
