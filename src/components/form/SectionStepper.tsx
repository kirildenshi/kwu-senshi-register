'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FormSection } from '@/lib/types/form-config';

interface SectionStepperProps {
  sections: FormSection[];
  currentStep: number;
  completedSteps: Set<number>;
  sectionLabels: Record<FormSection, string>;
  onStepClick: (step: number) => void;
}

export default function SectionStepper({
  sections,
  currentStep,
  completedSteps,
  sectionLabels,
  onStepClick,
}: SectionStepperProps) {
  const tc = useTranslations('common');
  const t = useTranslations('auth.registration');
  return (
    <>
      {/* Desktop stepper — full width, each step takes equal space */}
      <nav className="hidden md:block w-full" aria-label={t('stepper_aria_label')}>
        <ol className="flex w-full items-start">
          {sections.map((section, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isClickable = isCompleted || index <= currentStep;

            return (
              <li key={section} className="flex flex-1 items-start">
                {/* Circle + label, fills the cell */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`flex flex-1 flex-col items-center gap-2 transition-colors ${
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-senshi-sm text-label-md font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-action-primary text-senshi-black-6'
                        : isCurrent
                          ? 'border-2 border-action-primary text-action-primary'
                          : 'border border-senshi-black-25 text-text-muted'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : index + 1}
                  </span>
                  <span
                    className={`font-display text-[15px] uppercase leading-tight text-center ${
                      isCurrent
                        ? 'text-senshi-grey-90'
                        : isCompleted
                          ? 'text-senshi-grey-70'
                          : 'text-senshi-grey-50'
                    }`}
                  >
                    {sectionLabels[section]}
                  </span>
                </button>

                {/* Connector line — vertically centred on the circles (h-8 / 2 = mt-4) */}
                {index < sections.length - 1 && (
                  <div
                    className={`mt-4 h-0.5 w-6 shrink-0 rounded-senshi-sm transition-colors ${
                      isCompleted ? 'bg-action-primary' : 'bg-senshi-black-25'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-senshi-grey-60">
            {tc('step_of', { current: currentStep + 1, total: sections.length })}
          </span>
          <span className="text-body-sm font-medium text-senshi-grey-90">
            {sectionLabels[sections[currentStep]]}
          </span>
        </div>
        {/* Progress dots */}
        <div className="mt-2 flex gap-1.5" role="tablist" aria-label={t('stepper_aria_label')}>
          {sections.map((section, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isClickable = isCompleted || index <= currentStep;
            const statusKey = isCompleted ? 'step_completed' : isCurrent ? 'step_current' : 'step_upcoming';
            return (
              <button
                key={section}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className="flex min-h-[44px] flex-1 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCF44] focus-visible:ring-offset-2"
                aria-label={`${sectionLabels[section]} — ${t(statusKey)}`}
              >
                <span
                  className={`h-1.5 w-full rounded-senshi-sm transition-colors ${
                    isCompleted
                      ? 'bg-action-primary'
                      : isCurrent
                        ? 'bg-action-primary/60'
                        : 'bg-senshi-black-25'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
