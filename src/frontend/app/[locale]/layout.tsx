import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { isValidLocale } from '@/lib/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieConsent } from '@/components/layout/CookieConsent';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ExoVote - Abstimmungen leicht gemacht',
    template: '%s | ExoVote',
  },
  description:
    'Erstelle Umfragen, teile Links und sammle Stimmen in Echtzeit. ExoVote macht Abstimmungen einfach und sicher.',
  keywords: ['voting', 'polls', 'umfragen', 'abstimmung', 'exovote', 'exostruction'],
  authors: [{ name: 'Exostruction' }],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'ExoVote',
    title: 'ExoVote - Abstimmungen leicht gemacht',
    description: 'Erstelle Umfragen, teile Links und sammle Stimmen in Echtzeit.',
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CookieConsent />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
