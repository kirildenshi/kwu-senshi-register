'use client';

import { Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LABELS: Record<(typeof routing.locales)[number], string> = {
  en: 'EN',
  bg: 'BG',
};

function LanguageSwitcherInner() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.toString();

  return (
    <>
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => {
              if (!active) router.replace(`${pathname}${query ? `?${query}` : ''}`, { locale: loc });
            }}
            aria-current={active ? 'true' : undefined}
            className={`rounded-full px-3 py-1.5 text-label-sm font-bold tracking-wide transition-colors ${
              active
                ? 'bg-action-primary text-senshi-black-6'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {LABELS[loc]}
          </button>
        );
      })}
    </>
  );
}

export default function LanguageSwitcher() {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-0.5 rounded-full border border-senshi-black-20 bg-senshi-black-8/90 p-1 shadow-modal backdrop-blur-sm sm:top-6 sm:right-6"
      role="group"
      aria-label="Language"
    >
      <Suspense fallback={null}>
        <LanguageSwitcherInner />
      </Suspense>
    </div>
  );
}
