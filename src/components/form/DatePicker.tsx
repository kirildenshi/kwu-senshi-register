'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { bg } from 'date-fns/locale/bg';
import { enGB } from 'date-fns/locale/en-GB';

interface DatePickerProps {
  id?: string;
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  hasError?: boolean;
  compact?: boolean; // reduced height for filter bars
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

function formatDisplay(iso: string, locale: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const INPUT_NORMAL = 'border-senshi-black-20 focus-visible:border-senshi-gold-70 focus-visible:ring-senshi-gold-90/30';
const INPUT_ERROR = 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30';

export default function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  min,
  max,
  hasError,
  compact = false,
  ...aria
}: DatePickerProps) {
  const tc = useTranslations('common');
  const resolvedPlaceholder = placeholder ?? tc('select_date');
  const locale = useLocale();
  const dateFnsLocale = useMemo(() => (locale === 'bg' ? bg : enGB), [locale]);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = value ? (() => {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  })() : undefined;

  const fromDate = min ? (() => {
    const [y, m, d] = min.split('-').map(Number);
    return new Date(y, m - 1, d);
  })() : undefined;

  const toDate = max ? (() => {
    const [y, m, d] = max.split('-').map(Number);
    return new Date(y, m - 1, d);
  })() : undefined;

  // Default month: show selected month or a sensible default (e.g. 30 years ago for DOB)
  const defaultMonth = selected ?? (fromDate ?? (toDate ? new Date(toDate.getFullYear() - 1, toDate.getMonth()) : new Date()));

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const iso = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    onChange(iso);
    setOpen(false);
    onBlur?.();
  }

  // Close on outside click handled by Radix
  useEffect(() => {
    if (!open && onBlur) {
      // Only fire blur when popover closes after interaction
    }
  }, [open, onBlur]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className={`flex w-full items-center justify-between rounded-senshi-sm border bg-senshi-black-10 px-3 text-left font-body focus-visible:outline-hidden focus-visible:ring-[3px] transition-colors ${compact ? 'h-10 text-body-sm' : 'h-12'} ${
            hasError ? INPUT_ERROR : INPUT_NORMAL
          }`}
          aria-haspopup="dialog"
          aria-expanded={open}
          {...aria}
        >
          <span className={`text-(length:--login-text-base) leading-normal ${value ? 'text-senshi-grey-90' : 'text-senshi-grey-60'}`}>
            {value ? formatDisplay(value, locale) : resolvedPlaceholder}
          </span>
          <Calendar size={16} className="shrink-0 text-senshi-grey-60" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[300px] rounded-senshi-sm border border-senshi-black-20 bg-senshi-black-12 shadow-modal animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          onInteractOutside={() => { setOpen(false); onBlur?.(); }}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={defaultMonth}
            locale={dateFnsLocale}
            disabled={[
              ...(fromDate ? [{ before: fromDate }] : []),
              ...(toDate ? [{ after: toDate }] : []),
            ]}
            captionLayout="dropdown"
            startMonth={fromDate ?? new Date(1920, 0)}
            endMonth={toDate}
            classNames={{
              root: 'p-4',
              months: 'flex flex-col gap-4',
              month: 'flex flex-col gap-3',
              month_caption: 'flex items-center justify-between px-1',
              caption_label: 'text-body-sm font-semibold text-senshi-grey-90 hidden',
              dropdowns: 'flex items-center gap-2 flex-1',
              dropdown_root: 'relative',
              dropdown: 'appearance-none bg-senshi-black-15 border border-senshi-black-20 rounded-senshi-sm pl-2 pr-6 py-1 text-body-sm text-senshi-grey-90 cursor-pointer font-body focus:outline-none focus:ring-2 focus:ring-senshi-gold-70 focus:ring-offset-0',
              nav: 'flex items-center gap-1',
              button_previous: 'flex h-8 w-8 items-center justify-center rounded-senshi-sm border border-senshi-black-20 bg-senshi-black-15 text-senshi-grey-60 hover:bg-senshi-black-18 hover:text-senshi-grey-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-body',
              button_next: 'flex h-8 w-8 items-center justify-center rounded-senshi-sm border border-senshi-black-20 bg-senshi-black-15 text-senshi-grey-60 hover:bg-senshi-black-18 hover:text-senshi-grey-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-body',
              month_grid: 'w-full border-collapse',
              weekdays: 'flex',
              weekday: 'flex-1 text-center text-[11px] font-semibold uppercase tracking-wider text-senshi-grey-50 py-1',
              week: 'flex mt-1',
              day: 'flex-1 aspect-square',
              day_button: 'h-full w-full flex items-center justify-center rounded-senshi-sm text-body-sm text-senshi-grey-80 hover:bg-senshi-black-18 hover:text-senshi-grey-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-senshi-gold-70 font-body',
              selected: '[&>button]:bg-senshi-gold-90 [&>button]:text-senshi-black-6 [&>button]:font-semibold [&>button]:hover:bg-senshi-gold-70',
              today: '[&>button]:font-bold [&>button]:text-senshi-gold-90',
              outside: 'opacity-30',
              disabled: 'opacity-25',
              hidden: 'invisible',
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left'
                  ? <ChevronLeft size={14} />
                  : <ChevronRight size={14} />,
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
