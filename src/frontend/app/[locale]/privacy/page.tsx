import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutz',
};

export default function PrivacyPage() {
  const t = useTranslations('navigation');

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(225,29,72,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(225,29,72,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]" />
        <div className="absolute top-20 right-[15%] w-64 h-64 bg-[var(--primary)]/8 rounded-full blur-[100px]" />
      </div>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-gradient mb-8 text-4xl font-bold animate-fade-in-up [animation-delay:0.1s] opacity-0 [animation-fill-mode:forwards]">{t('privacy')}</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none animate-fade-in-up [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
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
    </div>
  );
}
