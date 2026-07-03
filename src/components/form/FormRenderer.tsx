'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import type { FormConfigResponse, FormFieldConfig, FormSection } from '@/lib/types/form-config';
import { SECTION_ORDER, groupFieldsBySection } from '@/lib/types/form-config';
import { buildRegistrationSchema } from '@/lib/validations/registration';
import { useDraftAutosave, loadDraft, clearDraft } from '@/lib/hooks/useDraftAutosave';
import FormField from './FormField';
import SectionStepper from './SectionStepper';
import FormProgress from './FormProgress';
import ErrorSummary from './ErrorSummary';
import DraftConsentBanner from './DraftConsentBanner';
import {
  PASSWORD_FIELD,
  CONFIRM_PASSWORD_FIELD,
  GDPR_FIELDS,
  HIDDEN_FIELDS,
  DATA_SOURCE_URL,
  DATA_SOURCE_KEY,
} from './_lib/field-configs';
import { getFieldTranslations as buildFieldTranslations } from './_lib/get-field-translations';
import { useFormNavigation } from './_hooks/useFormNavigation';

interface FormRendererProps {
  config: FormConfigResponse;
  locale: string;
  role?: string;
  submittedPath?: string;
  titleOverride?: string;
  fieldLabelOverrides?: Record<string, string>;
  fieldHelperOverrides?: Record<string, string>;
  minAge?: number;
  gdprFieldsOverride?: FormFieldConfig[];
  dataSourceExtraOptions?: Record<string, Array<{ value: string; label: string }>>;
  dataSourceOverrides?: Record<string, Array<{ value: string; label: string }>>;
  fieldOrderPins?: Partial<Record<FormSection, string[]>>;
}

function isFieldVisible(
  field: FormFieldConfig,
  watchedValues: Record<string, unknown>,
): boolean {
  if (HIDDEN_FIELDS.has(field.name)) return false;
  if (!field.visibleWhen) return true;
  return Object.entries(field.visibleWhen).every(
    ([depField, depValue]) => watchedValues[depField] === depValue,
  );
}

export default function FormRenderer({
  config,
  locale,
  role,
  submittedPath = '/register/submitted',
  titleOverride,
  fieldLabelOverrides,
  fieldHelperOverrides,
  minAge = 16,
  gdprFieldsOverride,
  dataSourceExtraOptions,
  dataSourceOverrides,
  fieldOrderPins,
}: FormRendererProps) {
  const gdprFields = gdprFieldsOverride ?? GDPR_FIELDS;
  const prefersReduced = useReducedMotion();
  const t = useTranslations('auth.registration');
  const tRoot = useTranslations();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [dataSources, setDataSources] = useState<Record<string, Array<{ value: string; label: string }>>>({})

  const tValidation = useTranslations('auth.registration.validation');
  const schema = useMemo(() => {
    const forcedRequired = (!role || role === 'ALLIANCE_MEMBER') ? new Set(['dojoId']) : undefined;
    return buildRegistrationSchema(config.fields, (key) => tValidation(key), forcedRequired, { minAge, gdprFields });
  }, [config.fields, tValidation, role, minAge, gdprFields]);

  const sectionFields = useMemo(
    () => groupFieldsBySection(config.fields, fieldOrderPins),
    [config.fields, fieldOrderPins],
  );

  // Only include sections that have fields in this config
  const activeSections = useMemo(
    () => SECTION_ORDER.filter((s) => (sectionFields[s] || []).length > 0 || s === 'credentials'),
    [sectionFields],
  );

  // Build default values from field config to prevent uncontrolled->controlled warnings
  const fieldDefaults = useMemo(() => {
    const defaults: Record<string, unknown> = {};
    for (const field of config.fields) {
      if (field.type === 'file') continue;
      if (field.type === 'checkbox') {
        defaults[field.name] = false;
      } else if (field.type === 'multiselect') {
        defaults[field.name] = [];
      } else {
        defaults[field.name] = '';
      }
    }
    defaults.password = '';
    defaults.confirmPassword = '';
    defaults.acceptTerms = false;
    defaults.acceptPrivacy = false;
    defaults.ageConfirmation = false;
    defaults.marketingConsent = false;
    return defaults;
  }, [config.fields]);

  // Load draft on mount (client only), merged over field defaults
  const [defaultValues] = useState(() => {
    if (typeof window === 'undefined') return fieldDefaults;
    const draft = loadDraft(config.version);
    if (draft) return { ...fieldDefaults, ...draft };
    return fieldDefaults;
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  });

  // Use useWatch for reactive values without causing full re-renders from form.watch()
  const watchedValues = useWatch({ control: form.control }) as Record<string, unknown>;

  useEffect(() => {
    if (typeof window !== 'undefined' && loadDraft(config.version)) {
      setHasDraft(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch runtime options for fields that have a dataSource (skipped for any
  // source with a static dataSourceOverrides list — no need to hit the API).
  useEffect(() => {
    const sources = new Set<string>();
    for (const f of config.fields ?? []) {
      if ((f as FormFieldConfig).dataSource) sources.add((f as FormFieldConfig).dataSource as string);
    }
    for (const src of sources) {
      if (dataSourceOverrides?.[src]) continue;
      const url = DATA_SOURCE_URL[src];
      const key = DATA_SOURCE_KEY[src];
      if (!url || !key) continue;
      fetch(url)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((body) => {
          const rows = body[key] as Array<{ id: string; name: string }>;
          const opts = rows.map((d) => ({ value: String(d.id), label: d.name }));
          setDataSources((prev) => ({ ...prev, [src]: opts }));
        })
        .catch((err) => {
          console.error(`[FormRenderer] failed to load dataSource="${src}"`, err);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.fields]);

  const formSectionRef = useRef<HTMLFieldSetElement>(null);

  // Auto-focus first field when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!formSectionRef.current) return;
      const firstInput = formSectionRef.current.querySelector('input, select, button[role="combobox"]');
      if (firstInput instanceof HTMLElement) firstInput.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Autosave draft with save indicator
  useDraftAutosave(watchedValues, config.version);

  // Show save indicator on value changes (debounced to match autosave).
  // Subscribe via form.watch() instead of depending on the whole watchedValues object
  // so the effect doesn't re-run on every keystroke's object identity change.
  const saveIndicatorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const sub = form.watch(() => {
      if (saveIndicatorRef.current) clearTimeout(saveIndicatorRef.current);
      saveIndicatorRef.current = setTimeout(() => {
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 1500);
      }, 2200); // slightly after the 2s autosave debounce
    });
    return () => {
      sub.unsubscribe();
      if (saveIndicatorRef.current) clearTimeout(saveIndicatorRef.current);
    };
  }, [form]);

  // Calculate progress
  const progress = useMemo(() => {
    const allFields = config.fields.filter(
      (f) => f.type !== 'file' && isFieldVisible(f, watchedValues),
    );
    const filledCount = allFields.filter((f) => {
      const val = watchedValues[f.name];
      if (Array.isArray(val)) return val.length > 0;
      return val !== undefined && val !== '' && val !== false;
    }).length;
    // Account for password + confirmPassword + required GDPR fields (exclude optional ones)
    const requiredGdprFields = gdprFields.filter((f) => f.required);
    const totalFields = allFields.length + 2 + requiredGdprFields.length;
    const passwordFilled = watchedValues.password ? 1 : 0;
    const confirmFilled = watchedValues.confirmPassword ? 1 : 0;
    const gdprFilled = requiredGdprFields.filter((f) => watchedValues[f.name]).length;
    return ((filledCount + passwordFilled + confirmFilled + gdprFilled) / totalFields) * 100;
  }, [config.fields, watchedValues, gdprFields]);

  // Section labels (memoized with locale key)
  const sectionLabels = useMemo(() => {
    const labels = {} as Record<FormSection, string>;
    for (const section of activeSections) {
      labels[section] = t(`section.${section}`);
    }
    return labels;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  // Get fields for current step
  const currentSection = activeSections[currentStep];
  const currentFields = sectionFields[currentSection] || [];

  // Get field names for current section (for validation)
  const getCurrentFieldNames = useCallback(() => {
    const names = currentFields
      .filter((f) => f.type !== 'file' && isFieldVisible(f, watchedValues))
      .map((f) => f.name);

    // Add account fields for credentials section
    if (currentSection === 'credentials') {
      names.push('password', 'confirmPassword', ...gdprFields.map((f) => f.name));
    }
    return names;
  }, [currentFields, currentSection, watchedValues, gdprFields]);

  // File fields are excluded from the zod schema (validated by FileInput
  // itself, not react-hook-form's resolver), so a required file can't be
  // caught by form.trigger(). Check it manually and surface the same way
  // resolver errors do, via form.setError, so FormField's existing
  // errors[field.name] wiring picks it up without any extra plumbing.
  const validateRequiredFiles = useCallback(() => {
    const requiredFileFields = currentFields.filter(
      (f) => f.type === 'file' && f.required && isFieldVisible(f, watchedValues),
    );
    const invalidFieldNames: string[] = [];
    for (const field of requiredFileFields) {
      if (form.getValues(field.name)) {
        form.clearErrors(field.name);
      } else {
        form.setError(field.name, { type: 'required', message: tValidation('required') });
        invalidFieldNames.push(field.name);
      }
    }
    return invalidFieldNames;
  }, [currentFields, watchedValues, form, tValidation]);

  // Email uniqueness check
  const checkEmailUniqueness = useCallback(async () => {
    const email = form.getValues('email') as string | undefined;
    if (!email || form.formState.errors.email) return;

    try {
      const res = await fetch(
        `/api/v1/auth/check-email?email=${encodeURIComponent(email)}`,
      );
      const data = await res.json();
      if (!data.available) {
        form.setError('email', {
          type: 'manual',
          message: t('validation.email_taken'),
        });
      }
    } catch {
      // Silently fail — server-side will catch duplicates
    }
  }, [form, t]);

  // Memoized field translations getter
  const getFieldTranslations = useCallback(
    (field: FormFieldConfig) => {
      const base = buildFieldTranslations(t, field);
      const labelOverride = fieldLabelOverrides?.[field.name];
      const helperOverride = fieldHelperOverrides?.[field.name];
      if (!labelOverride && !helperOverride) return base;
      return {
        ...base,
        label: labelOverride ?? base.label,
        helper: helperOverride ?? base.helper,
      };
    },
    [t, fieldLabelOverrides, fieldHelperOverrides],
  );

  // Step navigation
  const { handleNext, handlePrevious, handleStepClick } = useFormNavigation({
    form,
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    activeSections,
    currentSection,
    prefersReduced,
    setSlideDirection,
    setAnimating,
    setAdvancing,
    getCurrentFieldNames,
    validateRequiredFiles,
    checkEmailUniqueness,
  });

  // Handle Enter key to advance
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLastStep && e.target instanceof HTMLInputElement && e.target.type !== 'submit') {
      e.preventDefault();
      handleNext();
    }
  };

  // Confirm before clearing draft
  const handleClearDraft = useCallback(() => {
    if (!window.confirm(t('draft_clear_confirm'))) return;
    clearDraft();
    form.reset(fieldDefaults);
    setHasDraft(false);
  }, [form, fieldDefaults, t]);

  // Submit
  const onSubmit = async (data: Record<string, unknown>) => {
    // form.handleSubmit() only runs the zod resolver, which skips file fields
    // entirely — so a required upload on the final step must be checked here too,
    // not just on intermediate "Continue" clicks (see handleNext in useFormNavigation).
    const invalidFileFields = validateRequiredFiles();
    if (invalidFileFields.length > 0) {
      const el = document.getElementById(`field-${invalidFileFields[0]}`);
      el?.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth', block: 'center' });
      return;
    }

    setSubmitError('');
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        ...data,
        role: role || 'ALLIANCE_MEMBER',
        lang: locale,
      };

      // The zod resolver's schema has no entries for file-type fields, so it
      // silently strips them from `data` (zod drops keys outside the declared
      // shape). Restore them straight from form state before checking hasFiles.
      for (const field of config.fields) {
        if (field.type === 'file') {
          payload[field.name] = form.getValues(field.name);
        }
      }

      // Add consent data
      payload.acceptTerms = data.acceptTerms;
      payload.acceptPrivacy = data.acceptPrivacy;
      payload.ageConfirmation = data.ageConfirmation;
      payload.marketingConsent = data.marketingConsent;
      payload.consentTimestamp = new Date().toISOString();

      // Uploaded files can't travel as JSON — switch to multipart/form-data
      // whenever at least one file field has a real File attached.
      const hasFiles = config.fields.some(
        (field) => field.type === 'file' && payload[field.name] instanceof File,
      );

      let res: Response;
      if (hasFiles) {
        const formData = new FormData();
        for (const [key, value] of Object.entries(payload)) {
          if (value === undefined || value === null) continue;
          if (Array.isArray(value)) {
            for (const item of value) formData.append(key, String(item));
          } else if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
        res = await fetch('/api/v1/auth/register', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();

      if (!result.success) {
        // Prefer i18n code from the API; fall back to English message, then generic.
        const msg = result.code
          ? tRoot(result.code as Parameters<typeof tRoot>[0])
          : result.error?.message || t('error.submit_failed');
        setSubmitError(msg);
        toast.error(msg);
      } else {
        clearDraft();
        toast.success(t('success_toast'));
        setSubmitted(true);
      }
    } catch {
      setSubmitError(t('error.submit_failed'));
      toast.error(t('error.submit_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // Build error summary for display
  const errorSummaryItems = useMemo(() => {
    const items: { fieldName: string; label: string; message: string }[] = [];
    for (const [fieldName, error] of Object.entries(form.formState.errors)) {
      if (!error?.message) continue;
      const fieldConfig = config.fields.find((f) => f.name === fieldName);
      const label = t.has(`field.${fieldName}`)
        ? t(`field.${fieldName}`)
        : fieldConfig?.label || fieldName;
      items.push({
        fieldName,
        label,
        message: error.message as string,
      });
    }
    return items;
  }, [form.formState.errors, config.fields, t]);

  // Navigate to the success page once submission completes. Runs in an effect
  // (after render) rather than during render — calling router.push() while
  // rendering triggers a Router state update mid-render, which React warns
  // about ("Cannot update a component while rendering a different component").
  useEffect(() => {
    if (!submitted) return;
    const target = `${submittedPath}?role=${encodeURIComponent(role || 'ALLIANCE_MEMBER')}`;
    router.push(target);
  }, [submitted, role, router, submittedPath]);

  // Success screen — show a spinner while the redirect (above) takes effect
  if (submitted) {
    return (
      <div className="flex items-center justify-center py-16 text-center animate-fade-in">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-senshi-sm bg-card">
          <div className="animate-spin">
            <svg className="h-6 w-6 text-action-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const isLastStep = currentStep === activeSections.length - 1;

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-display-sm uppercase text-text-primary">
            {titleOverride || (role === 'DOJO_OPERATOR' ? t('title_do') : role === 'BRANCH_CHIEF' ? t('title_bc') : t('title'))}
          </h1>
          {/* Auto-save indicator */}
          <div
            className={`flex items-center gap-1.5 text-body-xs text-senshi-grey-60 transition-opacity duration-300 ${showSaveIndicator ? 'opacity-100' : 'opacity-0'}`}
            aria-live="polite"
          >
            <Save size={12} aria-hidden={true} />
            <span>{t('draft_saved')}</span>
          </div>
        </div>

        <SectionStepper
          sections={activeSections}
          currentStep={currentStep}
          completedSteps={completedSteps}
          sectionLabels={sectionLabels}
          onStepClick={handleStepClick}
        />

        <DraftConsentBanner
          message={t('draft_consent')}
          dismissLabel={t('draft_consent_ok')}
        />

        {hasDraft && (
          <div className="flex items-center justify-between rounded-senshi-sm border border-senshi-purple-60/30 bg-senshi-purple-60/10 px-4 py-3">
            <p className="text-body-sm text-senshi-grey-70">{t('draft_restored')}</p>
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-body-sm text-senshi-grey-60 underline hover:text-senshi-grey-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-senshi-gold-90/30 focus-visible:ring-offset-2 focus-visible:ring-offset-senshi-black-6"
            >
              {t('draft_clear')}
            </button>
          </div>
        )}

        {form.formState.isSubmitted && errorSummaryItems.length > 0 && (
          <ErrorSummary
            errors={errorSummaryItems}
            title={t('error.error_summary_title')}
          />
        )}

        {submitError && (
          <div role="alert" className="rounded-senshi-sm border border-status-error/40 bg-status-error/10 px-4 py-3 text-body-sm text-status-error">
            {submitError}
          </div>
        )}

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          onKeyDown={handleKeyDown}
          aria-label={t('form_aria_label')}
        >
          <fieldset
            ref={formSectionRef}
            className={`space-y-6 rounded-senshi-sm border border-senshi-black-15 bg-card p-6 transition-[transform,opacity] duration-200 ${
              !prefersReduced && animating
                ? slideDirection === 'left'
                  ? 'translate-x-2 opacity-0'
                  : '-translate-x-2 opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
          >
            <legend className="sr-only">{sectionLabels[currentSection]}</legend>

            {currentFields.map((field) => {
              if (!isFieldVisible(field, watchedValues)) return null;
              const resolvedField: FormFieldConfig =
                field.dataSource
                  ? {
                      ...field,
                      resolvedOptions: [
                        ...(dataSourceOverrides?.[field.dataSource] ?? dataSources[field.dataSource] ?? []),
                        ...(dataSourceExtraOptions?.[field.dataSource] ?? []),
                      ],
                    }
                  : field;
              return (
                <FormField
                  key={field.name}
                  field={resolvedField}
                  translations={getFieldTranslations(field)}
                />
              );
            })}

            {/* Account fields in credentials section */}
            {currentSection === 'credentials' && (
              <>
                <FormField
                  field={PASSWORD_FIELD}
                  translations={getFieldTranslations(PASSWORD_FIELD)}
                />
                <FormField
                  field={CONFIRM_PASSWORD_FIELD}
                  translations={getFieldTranslations(CONFIRM_PASSWORD_FIELD)}
                />

                {/* GDPR Consent */}
                <div className="mt-6 space-y-4 border-t border-senshi-black-20 pt-6">
                  <p className="text-label-md font-semibold uppercase text-text-secondary">{t('gdpr.title')}</p>

                  {gdprFields.map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      translations={getFieldTranslations(field)}
                    />
                  ))}
                </div>
              </>
            )}
          </fieldset>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="h-12 rounded-senshi-sm border border-senshi-black-20 px-6 text-(length:--login-text-base) font-medium text-text-muted transition-colors hover:border-text-muted hover:text-text-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-senshi-black-6"
              >
                {t('previous')}
              </button>
            ) : (
              <div />
            )}

            {isLastStep ? (
              <button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-senshi-sm bg-action-primary px-8 text-(length:--login-text-base) font-semibold uppercase tracking-[0.02em] text-senshi-black-6 transition-colors hover:bg-action-primary-hover disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-senshi-black-6"
              >
                {submitting ? t('submitting') : t('submit')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={advancing}
                className="flex h-12 items-center gap-2 rounded-senshi-sm bg-action-primary px-8 text-(length:--login-text-base) font-semibold uppercase tracking-[0.02em] text-senshi-black-6 transition-colors hover:bg-action-primary-hover disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-senshi-black-6"
              >
                {advancing && (
                  <div className="animate-spin inline-block">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  </div>
                )}
                {t('next')}
              </button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
