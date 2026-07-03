import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Oswald, Manrope } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ToastProvider from '@/components/providers/ToastProvider';
import ScrollToTop from '@/components/providers/ScrollToTop';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

const bebasNeue = localFont({
  src: [
    { path: '../fonts/BebasNeue.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/BebasNeue-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-bebas-neue',
  display: 'swap',
  preload: true,
});
const oswald = Oswald({ subsets: ['latin', 'cyrillic'], variable: '--font-oswald', display: 'swap' });
const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-manrope', display: 'swap' });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        bg: `${baseUrl}/bg`,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      locale: locale === 'bg' ? 'bg_BG' : 'en_US',
      alternateLocale: locale === 'bg' ? 'en_US' : 'bg_BG',
      siteName: 'KWU SENSHI',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'bg')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning style={{ colorScheme: 'dark' }} className={`dark ${bebasNeue.variable} ${oswald.variable} ${manrope.variable}`}>
      <body>
        <ScrollToTop />
        <NextIntlClientProvider messages={messages}>
          <LanguageSwitcher />
          {children}
        </NextIntlClientProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
