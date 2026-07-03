'use client';

import { Controller, useFormContext } from 'react-hook-form';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, ChevronDown } from 'lucide-react';
import type { FormFieldConfig } from '@/lib/types/form-config';
import { resolveDateToken } from '@/lib/validations/registration';
import FormError from './FormError';
import PasswordInput from './PasswordInput';
import FileInput from './FileInput';
import FieldTooltip from './FieldTooltip';
import CountrySelect from '@/components/ui/CountrySelect';
import DatePicker from './DatePicker';
import MultiSelectInput from './MultiSelectField';

interface FormFieldProps {
  field: FormFieldConfig;
  translations: {
    label: string;
    placeholder?: string;
    selectOptions?: Record<string, string>;
    helper?: string;
    tooltip?: string;
    optionalLabel?: string;
    strengthLabels?: Record<string, string>;
    requirementLabels?: Record<string, string>;
    fileLabels?: Record<string, string>;
    toggleLabels?: { show: string; hide: string };
  };
}

// Belt colors for rank selects
const BELT_COLORS: Record<string, string> = {
  '10KYU': '#FFFFFF', '9KYU': '#4169E1', '8KYU': '#4169E1',
  '7KYU': '#FFD700', '6KYU': '#FFD700', '5KYU': '#228B22', '4KYU': '#228B22',
  '3KYU': '#8B4513', '2KYU': '#8B4513', '1KYU': '#8B4513',
  '1DAN': '#000000', '2DAN': '#000000', '3DAN': '#000000', '4DAN': '#000000', '5DAN': '#000000',
  '6DAN': '#000000', '7DAN': '#000000', '8DAN': '#000000', '9DAN': '#000000', '10DAN': '#000000',
  MASCULINE: '', FEMININE: '', OTHER: '',
  SINGLE: '', MARRIED: '',
};
const isRankField = (name: string) => name.toLowerCase().includes('rank') || name.toLowerCase().includes('graduation') || name.toLowerCase().includes('belt');

function FieldLabel({ field, translations }: FormFieldProps) {
  return (
    <label htmlFor={field.name} className="flex items-center text-body-sm font-semibold text-senshi-grey-70">
      {translations.label}
      {field.required ? (
        <span className="ml-1 text-status-error">*</span>
      ) : translations.optionalLabel ? (
        <span className="ml-1.5 text-senshi-grey-60 font-normal">{translations.optionalLabel}</span>
      ) : null}
      {translations.tooltip && <FieldTooltip content={translations.tooltip} fieldName={field.name} />}
    </label>
  );
}

function HelperText({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-1 text-body-xs text-senshi-grey-60">{text}</p>;
}

const INPUT_CLASS =
  'block h-12 w-full rounded-senshi-sm border bg-senshi-black-10 px-3 text-(length:--login-text-base) leading-normal text-senshi-grey-90 placeholder:text-(length:--login-text-sm) placeholder:text-senshi-grey-60 focus:outline-hidden focus:ring-[3px]';
const INPUT_NORMAL = 'border-senshi-black-20 focus:border-senshi-gold-70 focus:ring-senshi-gold-90/30';
const INPUT_ERROR = 'border-red-500 focus:border-red-500 focus:ring-red-500/30';

export default function FormField({ field, translations }: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const errorMessage = errors[field.name]?.message as string | undefined;
  const hasError = !!errorMessage;

  // Special handling for password fields
  if (field.name === 'password' || field.name === 'confirmPassword') {
    return (
      <div id={`field-${field.name}`}>
        <FieldLabel field={field} translations={translations} />
        <div className="mt-1">
          <Controller
            name={field.name}
            control={control}
            render={({ field: rhfField }) => (
              <PasswordInput
                id={field.name}
                value={rhfField.value || ''}
                onChange={rhfField.onChange}
                onBlur={rhfField.onBlur}
                placeholder={translations.placeholder}
                showStrength={field.name === 'password'}
                error={hasError}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
                strengthLabels={translations.strengthLabels}
                requirementLabels={translations.requirementLabels}
                toggleLabels={translations.toggleLabels}
              />
            )}
          />
        </div>
        <FormError fieldName={field.name} message={errorMessage} />
      </div>
    );
  }

  // File input
  if (field.type === 'file') {
    return (
      <div id={`field-${field.name}`}>
        <FieldLabel field={field} translations={translations} />
        <div className="mt-1">
          <Controller
            name={field.name}
            control={control}
            render={({ field: rhfField }) => (
              <FileInput
                id={field.name}
                accept={field.accept}
                onChange={rhfField.onChange}
                error={hasError}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
                labels={translations.fileLabels}
              />
            )}
          />
        </div>
        <FormError fieldName={field.name} message={errorMessage} />
      </div>
    );
  }

  // Checkbox
  if (field.type === 'checkbox') {
    return (
      <div id={`field-${field.name}`} className="flex items-start gap-3">
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhfField }) => (
            <Checkbox.Root
              id={field.name}
              checked={rhfField.value === true}
              onCheckedChange={(checked) => rhfField.onChange(checked === true)}
              className={`group relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-all duration-200 before:absolute before:-inset-[10px] before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCF44]/60 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
                hasError
                  ? 'border-red-500 bg-red-500/10'
                  : rhfField.value
                    ? 'border-[#d4a017] bg-[#d4a017] shadow-[0_0_0_3px_rgba(212,160,23,0.18)]'
                    : 'border-senshi-black-30 bg-senshi-black-10 hover:border-senshi-black-40'
              }`}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? `${field.name}-error` : undefined}
            >
              <Checkbox.Indicator className="flex items-center justify-center">
                <svg
                  viewBox="0 0 10 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[10px] w-[10px] text-senshi-black-6"
                  aria-hidden="true"
                >
                  <path d="M1 4l2.5 2.5L9 1" />
                </svg>
              </Checkbox.Indicator>
            </Checkbox.Root>
          )}
        />
        <div>
          <label htmlFor={field.name} className="text-(length:--login-text-sm) text-senshi-grey-70 cursor-pointer leading-snug">
            {translations.label}
            {field.required && <span className="ml-1 text-status-error">*</span>}
          </label>
          <FormError fieldName={field.name} message={errorMessage} />
        </div>
      </div>
    );
  }

  // Multi-select (static options or dataSource-resolved options)
  if (field.type === 'multiselect') {
    const isDataSource = !!field.dataSource;
    const isLoading = isDataSource && (!field.resolvedOptions || field.resolvedOptions.length === 0);
    const options = isDataSource ? (field.resolvedOptions ?? []) : (field.options ?? []).map((o) => ({ value: o, label: translations.selectOptions?.[o] || o }));

    return (
      <div id={`field-${field.name}`}>
        <FieldLabel field={field} translations={translations} />
        <div className="mt-1">
          {isLoading ? (
            <div
              className={`flex h-12 w-full items-center rounded-senshi-sm border bg-senshi-black-10 px-3 text-(length:--login-text-base) text-senshi-grey-60 ${INPUT_NORMAL} opacity-60`}
              aria-busy="true"
            >
              Loading…
            </div>
          ) : (
            <Controller
              name={field.name}
              control={control}
              render={({ field: rhfField }) => (
                <MultiSelectInput
                  id={field.name}
                  options={options}
                  value={Array.isArray(rhfField.value) ? rhfField.value : []}
                  onChange={rhfField.onChange}
                  placeholder={translations.placeholder}
                  searchPlaceholder={translations.placeholder}
                  error={hasError}
                  ariaDescribedBy={hasError ? `${field.name}-error` : undefined}
                />
              )}
            />
          )}
        </div>
        <HelperText text={translations.helper} />
        <FormError fieldName={field.name} message={errorMessage} />
      </div>
    );
  }

  // Select (static options or dataSource-resolved options)
  if (field.type === 'select' && (field.options || field.dataSource !== undefined)) {
    // When dataSource is set, use resolvedOptions (may be empty while loading)
    const isDataSource = !!field.dataSource;
    const isLoading = isDataSource && (!field.resolvedOptions || field.resolvedOptions.length === 0);

    return (
      <div id={`field-${field.name}`}>
        <FieldLabel field={field} translations={translations} />
        <div className="mt-1">
          {isLoading ? (
            // Show a disabled placeholder while the API data is loading
            <div
              className={`flex h-12 w-full items-center rounded-senshi-sm border bg-senshi-black-10 px-3 text-(length:--login-text-base) text-senshi-grey-60 ${INPUT_NORMAL} opacity-60`}
              aria-busy="true"
            >
              Loading…
            </div>
          ) : (
            <Controller
              name={field.name}
              control={control}
              render={({ field: rhfField }) => (
                <Select.Root value={rhfField.value || ''} onValueChange={(val) => rhfField.onChange(val === '__clear__' ? '' : val)}>
                  <Select.Trigger
                    id={field.name}
                    className={`flex h-12 w-full items-center justify-between rounded-senshi-sm border bg-senshi-black-10 px-3 text-(length:--login-text-base) text-left font-body focus:outline-hidden focus:ring-[3px] ${
                      hasError ? INPUT_ERROR : INPUT_NORMAL
                    } ${!rhfField.value ? 'text-senshi-grey-60' : 'text-senshi-grey-90'}`}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? `${field.name}-error` : undefined}
                  >
                    <Select.Value placeholder={translations.placeholder} />
                    <Select.Icon>
                      <ChevronDown size={16} className="text-senshi-grey-60" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      className="z-50 rounded-senshi-sm border border-senshi-black-20 bg-senshi-black-12 shadow-modal"
                      position="popper"
                      sideOffset={4}
                    >
                      <Select.Viewport className="select-viewport p-1 max-h-56 overflow-y-scroll">
                        {!field.required && rhfField.value && (
                          <Select.Item
                            value="__clear__"
                            className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-body-sm text-senshi-grey-60 outline-hidden data-highlighted:bg-senshi-black-15"
                          >
                            <Select.ItemText>—</Select.ItemText>
                          </Select.Item>
                        )}
                        {isDataSource
                          ? (field.resolvedOptions ?? []).map((opt) => (
                              <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-body-sm text-senshi-grey-90 outline-hidden data-highlighted:bg-senshi-black-15"
                              >
                                <Select.ItemIndicator>
                                  <Check size={14} className="text-senshi-gold-90" />
                                </Select.ItemIndicator>
                                <Select.ItemText>{opt.label}</Select.ItemText>
                              </Select.Item>
                            ))
                          : field.options!.map((option) => (
                              <Select.Item
                                key={option}
                                value={option}
                                className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-body-sm text-senshi-grey-90 outline-hidden data-highlighted:bg-senshi-black-15"
                              >
                                <Select.ItemIndicator>
                                  <Check size={14} className="text-senshi-gold-90" />
                                </Select.ItemIndicator>
                                <Select.ItemText>
                                  <span className="flex items-center gap-2">
                                    {isRankField(field.name) && BELT_COLORS[option] && (
                                      <span className="inline-block h-3 w-3 rounded-senshi-sm border border-senshi-black-20" style={{ backgroundColor: BELT_COLORS[option] }} />
                                    )}
                                    {translations.selectOptions?.[option] || option}
                                  </span>
                                </Select.ItemText>
                              </Select.Item>
                            ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              )}
            />
          )}
        </div>
        <HelperText text={translations.helper} />
        <FormError fieldName={field.name} message={errorMessage} />
      </div>
    );
  }

  // Country select
  if (field.name === 'country' || field.name === 'idCountry' || field.name === 'countryOfOrigin' || field.name === 'territoryCountry' || field.name === 'dojoCountry') {
    return (
      <div id={`field-${field.name}`}>
        <FieldLabel field={field} translations={translations} />
        <div className="mt-1">
          <Controller
            name={field.name}
            control={control}
            render={({ field: rhfField }) => (
              <CountrySelect
                id={field.name}
                value={rhfField.value ?? ''}
                onChange={rhfField.onChange}
                hasError={hasError}
                placeholder={translations.placeholder}
              />
            )}
          />
        </div>
        <HelperText text={translations.helper} />
        <FormError fieldName={field.name} message={errorMessage} />
      </div>
    );
  }

  // Date picker
  if (field.type === 'date') {
    const minDate = resolveDateToken(field.min)?.toISOString().slice(0, 10);
    const maxDate = resolveDateToken(field.max)?.toISOString().slice(0, 10);
    return (
      <div id={`field-${field.name}`}>
        <FieldLabel field={field} translations={translations} />
        <div className="mt-1">
          <Controller
            name={field.name}
            control={control}
            render={({ field: rhfField }) => (
              <DatePicker
                id={field.name}
                value={rhfField.value ?? ''}
                onChange={rhfField.onChange}
                onBlur={rhfField.onBlur}
                placeholder={translations.placeholder}
                min={minDate}
                max={maxDate}
                hasError={hasError}
                aria-required={field.required || undefined}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
              />
            )}
          />
        </div>
        <HelperText text={translations.helper} />
        <FormError fieldName={field.name} message={errorMessage} />
      </div>
    );
  }

  // Default: text, email, tel, number
  return (
    <div id={`field-${field.name}`}>
      <FieldLabel field={field} translations={translations} />
      <div className="mt-1">
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhfField }) => (
            <input
              id={field.name}
              type={field.type}
              inputMode={
                field.type === 'email' ? 'email' :
                field.type === 'tel' ? 'tel' :
                field.type === 'number' ? 'numeric' :
                undefined
              }
              autoComplete={
                field.type === 'email' ? 'email' :
                field.type === 'tel' ? 'tel' :
                field.name === 'fullName' ? 'name' :
                field.name === 'city' ? 'address-level2' :
                field.name === 'country' ? 'country-name' :
                field.name === 'zipCode' ? 'postal-code' :
                field.name === 'addressLine1' ? 'street-address' :
                field.name === 'stateProvince' ? 'address-level1' :
                undefined
              }
              value={rhfField.value ?? ''}
              onChange={rhfField.onChange}
              onBlur={rhfField.onBlur}
              placeholder={translations.placeholder}
              aria-required={field.required || undefined}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? `${field.name}-error` : undefined}
              className={`${INPUT_CLASS} ${hasError ? INPUT_ERROR : INPUT_NORMAL}`}
            />
          )}
        />
      </div>
      <HelperText text={translations.helper} />
      <FormError fieldName={field.name} message={errorMessage} />
    </div>
  );
}
