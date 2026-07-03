import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import FormRenderer from '@/components/form/FormRenderer';
import { GDPR_FIELDS_V2 } from '@/components/form/_lib/field-configs';
import { DOJO_OPERATOR_FIELDS } from '@/data/form-configs';
import type { FormConfigResponse } from '@/lib/types/form-config';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100';

const CONFIG: FormConfigResponse = {
  id: 'dojo-operator',
  role: 'dojo_operator',
  region: 'global',
  version: 1,
  active: true,
  fields: DOJO_OPERATOR_FIELDS,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = 'Dojo Operator Application — KWU SENSHI';
  const description = 'Register your dojo under the KWU SENSHI banner. Manage members, submit rank promotions, access the Dojo CRM.';
  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/${locale}/dojo-operator` },
    robots: { index: false },
  };
}

export default async function DojoOperatorRegisterPage({
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
      <div className="mb-6 h-0.5 w-12 rounded-full bg-senshi-purple-50" aria-hidden="true" />

      <FormRenderer
        config={CONFIG}
        locale={locale}
        role="DOJO_OPERATOR"
        submittedPath="/submitted"
        fieldLabelOverrides={{
          fullName: t2('field.fullName'),
          countryOfOrigin: t2('field.countryOfOrigin'),
          country: t2('field.country'),
          dojoName: t2('field.dojoName'),
          dojoAddress: t2('field.dojoAddress'),
          dojoCity: t2('field.dojoCity'),
          dojoCountry: t2('field.dojoCountry'),
          governmentIdDoc: t2('field.governmentIdDoc'),
          dojoProof: t2('field.dojoProof'),
          insuranceDoc: t2('field.insuranceDoc'),
        }}
        minAge={16}
        gdprFieldsOverride={GDPR_FIELDS_V2}
      />
    </div>
  );
}
