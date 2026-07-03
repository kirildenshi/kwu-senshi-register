'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Role = 'ALLIANCE_MEMBER' | 'DOJO_OPERATOR';

function useRole(): Role {
  const params = useSearchParams();
  const raw = params.get('role') || '';
  if (raw === 'DOJO_OPERATOR') return raw;
  return 'ALLIANCE_MEMBER';
}

export default function SubmittedClient() {
  const t = useTranslations('register_submitted');
  const role = useRole();

  const isAM = role === 'ALLIANCE_MEMBER';
  const ns = isAM ? 'am' : 'do';

  const steps = [
    { number: 1, text: t(`${ns}_step_1`), active: true },
    { number: 2, text: t(`${ns}_step_2`), active: false },
    { number: 3, text: t(`${ns}_step_3`), active: false },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="mb-6 flex justify-center">
          <Image src="/register-page-logo.png" alt="KWU SENSHI" width={80} height={80} className="h-16 w-16 sm:h-20 sm:w-20" priority />
        </div>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-senshi-sm border border-action-primary/30 bg-bg-card">
          <svg className="h-8 w-8 text-action-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="mt-8 font-display text-display-xs sm:text-display-sm uppercase text-text-primary">
          {t(`${ns}_title`)}
        </h1>

        <div className="mx-auto mt-4 h-px w-16 bg-linear-to-r from-transparent via-action-primary to-transparent" aria-hidden="true" />

        <p className="mt-4 text-body-md text-action-primary">
          {t(`${ns}_subtitle`)}
        </p>

        {isAM ? (
          <>
            <p className="mt-3 text-body-sm text-text-muted">
              {t(`${ns}_message`)}
            </p>

            <div className="mx-auto mt-8 max-w-xs text-left">
              <p className="mb-4 text-label-lg uppercase text-text-secondary">
                {t('steps_heading')}
              </p>
              <ol className="space-y-3">
                {steps.map((step) => (
                  <li key={step.number} className="flex items-start gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-senshi-sm text-label-md font-bold ${
                        step.active
                          ? 'bg-action-primary text-senshi-black-6'
                          : 'bg-senshi-black-20 text-text-muted'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="text-body-sm text-text-muted">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <p className="mt-2 text-body-xs text-senshi-gold-90">
            {t('do_coming_soon_message')}
          </p>
        )}
      </div>
    </div>
  );
}
