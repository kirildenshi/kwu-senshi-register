import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import RegisterPageClient from './RegisterPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t2 = await getTranslations({ locale, namespace: 'auth.registration2' });
  const title = t2('hero_title');
  const description = t2('hero_subtitle');

  return {
    title: `${title} — KWU SENSHI`,
    description,
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t2 = await getTranslations({ locale, namespace: 'auth.registration2' });

  const hero = {
    eyebrow: t2('hero_eyebrow'),
    title: t2('hero_title'),
    subtitle: t2('hero_subtitle'),
  };

  return <RegisterPageClient hero={hero} />;
}
