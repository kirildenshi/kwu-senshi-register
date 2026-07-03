import type { useTranslations } from 'next-intl';
import type { FormFieldConfig } from '@/lib/types/form-config';

type Translator = ReturnType<typeof useTranslations>;

// Memoized field translations getter (factory — pass `t` from useTranslations('auth.registration'))
export function getFieldTranslations(t: Translator, field: FormFieldConfig) {
  return {
    label: t.has(`field.${field.name}`) ? t(`field.${field.name}`) : field.label,
    placeholder: t.has(`placeholder.${field.name}`)
      ? t(`placeholder.${field.name}`)
      : field.type === 'select' || field.type === 'multiselect'
        ? t.has('placeholder.select_default')
          ? t('placeholder.select_default')
          : 'Select...'
        : undefined,
    selectOptions: field.options?.reduce(
      (acc, opt) => {
        acc[opt] = t.has(`select.${opt}`) ? t(`select.${opt}`) : opt;
        return acc;
      },
      {} as Record<string, string>,
    ),
    helper: t.has(`helper.${field.name}`) ? t(`helper.${field.name}`) : undefined,
    tooltip: t.has(`tooltip.${field.name}`) ? t(`tooltip.${field.name}`) : undefined,
    optionalLabel: field.required ? undefined : t('optional'),
    strengthLabels: {
      weak: t('password_strength.weak'),
      fair: t('password_strength.fair'),
      good: t('password_strength.good'),
      strong: t('password_strength.strong'),
      very_strong: t('password_strength.very_strong'),
    },
    requirementLabels: {
      min_length: t('password_req.min_length'),
      uppercase: t('password_req.uppercase'),
      lowercase: t('password_req.lowercase'),
      digit: t('password_req.digit'),
      special: t('password_req.special'),
    },
    fileLabels: {
      upload_image: t('file.upload_image'),
      upload_file: t('file.upload_file'),
      unsupported_type: t('file.unsupported_type'),
      too_large: field.maxSizeMB
        ? t('file.too_large_custom', { size: field.maxSizeMB })
        : t('file.too_large'),
      too_small: field.minSizeMB ? t('file.too_small', { size: field.minSizeMB }) : undefined,
      min_dimensions: t('file.min_dimensions', { dim: 400 }),
    },
    toggleLabels: {
      show: t('password_toggle.show'),
      hide: t('password_toggle.hide'),
    },
  };
}
