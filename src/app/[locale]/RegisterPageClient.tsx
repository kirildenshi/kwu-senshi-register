'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Users, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ROLES = [
  { key: 'am', icon: Users, href: '/alliance-member' as const },
  { key: 'do', icon: Building2, href: '/dojo-operator' as const },
];

const ROLE_ACCENT = {
  border: 'hover:border-senshi-gold-90',
  glow: 'hover:shadow-[0_0_60px_rgba(255,207,68,0.15)]',
  badge: 'bg-senshi-gold-90/15 text-senshi-gold-90',
};

function RoleChoices({ prefersReduced }: { prefersReduced: boolean | null }) {
  const t = useTranslations('auth.register');
  const roleCopy: Record<string, { title: string; description: string; note?: string; cta: string }> = {
    am: { title: t('am_title'), description: t('am_description'), cta: t('cta_am') },
    do: { title: t('do_title'), description: t('do_description'), note: t('do_note'), cta: t('cta_do') },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {ROLES.map((role, i) => {
        const Icon = role.icon;
        const copy = roleCopy[role.key];

        return (
          <motion.div
            key={role.key}
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.4, delay: i * 0.1 }}
          >
            <Link
              href={role.href}
              className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-senshi-sm border border-senshi-black-20 bg-bg-elevated p-5 transition-all duration-300 [&_*]:cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-senshi-gold-90/30 ${ROLE_ACCENT.border} ${ROLE_ACCENT.glow} sm:p-6 md:p-8`}
              style={{
                background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.02), transparent 60%)',
              }}
            >
              <div
                className="absolute right-0 top-0 h-20 w-20 bg-linear-to-bl from-white/3 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-senshi-sm border border-senshi-gold-90/20 bg-senshi-gold-90/8 transition-colors duration-300 group-hover:border-senshi-gold-90/40 group-hover:bg-senshi-gold-90/12">
                <Icon size={24} className="text-senshi-gold-90" />
              </div>

              <h2 className="mt-5 font-display text-display-xs uppercase text-white md:text-display-sm-tight">
                {copy.title}
              </h2>

              <p className="mt-3 flex-1 font-body text-body-md leading-[1.8] text-text-muted">
                {copy.description}
              </p>

              {copy.note && (
                <div className={`mt-5 inline-flex self-start rounded-senshi-sm px-3 py-1.5 text-label-sm font-medium uppercase tracking-[0.08em] ${ROLE_ACCENT.badge}`}>
                  {copy.note}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 font-display text-body-lg font-bold uppercase tracking-[0.04em] text-senshi-gold-90 transition-colors duration-200 group-hover:text-senshi-gold-70">
                {copy.cta}
                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function RegisterPageClient({
  hero,
}: {
  hero: { eyebrow: string; title: string; subtitle: string };
}) {
  const prefersReduced = useReducedMotion();
  const noMotion = prefersReduced ? { duration: 0 } : undefined;

  return (
    <div>
      <section className="bg-bg-page pb-6 pt-16 sm:pt-20">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center px-4 text-center sm:px-6 md:px-10">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={noMotion || { duration: 0.5 }}
          >
            <Image
              src="/register-page-logo.png"
              alt="KWU SENSHI"
              width={160}
              height={160}
              className="h-32 w-32 drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] sm:h-40 sm:w-40 md:h-48 md:w-48"
              priority
            />
          </motion.div>

          {hero.eyebrow && (
            <motion.p
              className="mt-8 mb-3 font-body text-body-xs font-medium uppercase tracking-[0.15em] text-senshi-gold-90/80 md:text-body-sm"
              initial={prefersReduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={noMotion || { duration: 0.4 }}
            >
              {hero.eyebrow}
            </motion.p>
          )}
          <motion.div
            className="mb-4 h-px w-16 bg-linear-to-r from-transparent via-senshi-gold-90 to-transparent md:w-24"
            aria-hidden="true"
            initial={prefersReduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={noMotion || { duration: 0.6, ease: 'easeOut' }}
          />
          <motion.h1
            className="max-w-[700px] text-gold-gradient font-display text-display-sm uppercase leading-tight text-balance md:text-display-md lg:text-display-lg"
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={noMotion || { duration: 0.5, delay: 0.1 }}
          >
            {hero.title}
          </motion.h1>
          {hero.subtitle && (
            <motion.div
              className="mt-4 max-w-[560px] space-y-3"
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={noMotion || { duration: 0.5, delay: 0.2 }}
            >
              {hero.subtitle
                .split('\n')
                .filter((line) => line.trim().length > 0)
                .map((line, i) => (
                  <p key={i} className="font-body text-body-md leading-[1.8] text-text-muted md:text-body-lg">
                    {line}
                  </p>
                ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="bg-bg-page py-12 lg:py-16 pb-28 lg:pb-36">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-10">
          <RoleChoices prefersReduced={prefersReduced} />
        </div>
      </section>
    </div>
  );
}
