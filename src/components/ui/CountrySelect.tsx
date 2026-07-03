'use client';

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { COUNTRIES } from '@/lib/constants/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
  disabled?: boolean;
  id?: string;
}

const TRIGGER_BASE =
  'flex h-12 w-full items-center justify-between rounded-senshi-sm border bg-senshi-black-10 px-3 text-(length:--login-text-base) text-left font-body focus:outline-hidden focus:ring-[3px]';
const NORMAL = 'border-senshi-black-20 focus:border-senshi-gold-70 focus:ring-senshi-gold-90/30';
const ERROR = 'border-red-500 focus:border-red-500 focus:ring-red-500/30';

export default function CountrySelect({
  value,
  onChange,
  placeholder,
  className,
  hasError,
  disabled,
  id,
}: CountrySelectProps) {
  const locale = useLocale();
  const isBg = locale === 'bg';

  const defaultPlaceholder = isBg ? 'Изберете държава' : 'Select country';

  return (
    <Select.Root value={value || ''} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        id={id}
        className={`${TRIGGER_BASE} ${hasError ? ERROR : NORMAL} ${!value ? 'text-senshi-grey-60' : 'text-senshi-grey-90'} ${className ?? ''}`}
        aria-invalid={hasError || undefined}
      >
        <Select.Value placeholder={placeholder ?? defaultPlaceholder} />
        <Select.Icon>
          <ChevronDown size={16} className="shrink-0 text-senshi-grey-60" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-[200] max-h-72 overflow-auto rounded-senshi-sm border border-senshi-black-20 bg-senshi-black-12 shadow-modal"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {COUNTRIES.map((country) => (
              <Select.Item
                key={country.en}
                value={country.en}
                className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-body-sm text-senshi-grey-90 outline-hidden data-highlighted:bg-senshi-black-15"
              >
                <Select.ItemIndicator>
                  <Check size={14} className="text-senshi-gold-90" />
                </Select.ItemIndicator>
                <Select.ItemText>
                  {isBg ? country.bg : country.en}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
