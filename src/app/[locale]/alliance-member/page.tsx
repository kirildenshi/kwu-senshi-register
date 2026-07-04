import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import FormRenderer from '@/components/form/FormRenderer';
import { GDPR_FIELDS_V2 } from '@/components/form/_lib/field-configs';
import { ALLIANCE_MEMBER_FIELDS, DOJO_OPTIONS, NOT_A_MEMBER_DOJO_ID } from '@/data/form-configs';
import type { FormConfigResponse } from '@/lib/types/form-config';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100';

const CONFIG: FormConfigResponse = {
  id: 'alliance-member',
  role: 'alliance_member',
  region: 'global',
  version: 1,
  active: true,
  fields: ALLIANCE_MEMBER_FIELDS,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = 'Member Registration — KWU SENSHI';
  const description = 'Join the global KWU Kyokushin community. Verified ranks, digital credentials, and championship access.';
  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/${locale}/alliance-member` },
    robots: { index: false },
  };
}

export default async function AllianceMemberRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t2 = await getTranslations({ locale, namespace: 'auth.registration2' });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in sm:px-6 sm:py-16">
      <div className="mb-6 flex justify-center">
        <Image src="/register-page-logo.png" alt="KWU SENSHI" width={80} height={80} className="h-16 w-16 sm:h-20 sm:w-20" priority />
      </div>
      <div className="mb-6 h-0.5 w-12 rounded-full bg-senshi-gold-90" aria-hidden="true" />

      <FormRenderer
        config={CONFIG}
        locale={locale}
        submittedPath="/submitted"
        titleOverride={t2('title')}
        fieldLabelOverrides={{
          fullName: t2('field.fullName'),
          countryOfOrigin: t2('field.countryOfOrigin'),
          country: t2('field.country'),
          insuranceDoc: t2('field.insuranceDoc'),
        }}
        minAge={0}
        gdprFieldsOverride={GDPR_FIELDS_V2}
        dataSourceOverrides={{ dojos: DOJO_OPTIONS }}
        dataSourceExtraOptions={{
          dojos: [{ value: NOT_A_MEMBER_DOJO_ID, label: t2('field.notDojoMember') }],
        }}
      />
    </div>
  );
}
