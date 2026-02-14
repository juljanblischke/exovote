import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutz',
};

export default function PrivacyPage() {
  const t = useTranslations('navigation');

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">{t('privacy')}</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>1. Datenschutz auf einen Blick</h2>
        <h3>Allgemeine Hinweise</h3>
        <p>
          Die folgenden Hinweise geben einen einfachen Ueberblick darueber, was mit Ihren
          personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
        </p>

        <h2>2. Datenerfassung auf dieser Website</h2>
        <h3>Cookies</h3>
        <p>
          Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem
          Rechner keinen Schaden an und enthalten keine Viren.
        </p>

        <h2>3. Hosting</h2>
        <p>
          Wir hosten die Inhalte unserer Website bei folgendem Anbieter.
        </p>

        <h2>4. Ihre Rechte</h2>
        <p>
          Sie haben jederzeit das Recht, unentgeltlich Auskunft ueber Herkunft, Empfaenger und
          Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten.
        </p>
      </div>
    </div>
  );
}
