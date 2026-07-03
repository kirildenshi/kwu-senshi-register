'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectInputProps {
  id?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  error?: boolean;
  ariaDescribedBy?: string;
}

export default function MultiSelectInput({
  id,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  noResultsLabel,
  error,
  ariaDescribedBy,
}: MultiSelectInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selected = options.filter((o) => value.includes(o.value));
  const filtered = options.filter(
    (o) => !value.includes(o.value) && o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (optValue: string) => {
    onChange(value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue]);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-invalid={error || undefined}
        aria-describedby={ariaDescribedBy}
        className={`flex h-12 w-full items-center justify-between rounded-senshi-sm border bg-senshi-black-10 px-3 text-left text-(length:--login-text-base) focus:outline-hidden focus:ring-[3px] ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : 'border-senshi-black-20 focus:border-senshi-gold-70 focus:ring-senshi-gold-90/30'
        } ${selected.length === 0 ? 'text-senshi-grey-60' : 'text-senshi-grey-90'}`}
      >
        <span>{selected.length === 0 ? placeholder : `${selected.length} selected`}</span>
        <ChevronDown size={16} className="text-senshi-grey-60" />
      </button>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 rounded-full border border-senshi-gold-90/30 bg-senshi-gold-90/10 px-2.5 py-1 text-body-xs text-senshi-gold-90"
            >
              {o.label}
              <button type="button" onClick={() => toggle(o.value)} aria-label={`Remove ${o.label}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-senshi-sm border border-senshi-black-20 bg-senshi-black-12 shadow-modal">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
            className="w-full border-b border-senshi-black-20 bg-transparent px-3 py-2 text-body-sm text-senshi-grey-90 placeholder:text-senshi-grey-60 focus:outline-hidden"
          />
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-body-sm text-senshi-grey-60">{noResultsLabel}</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-body-sm text-senshi-grey-90 outline-hidden hover:bg-senshi-black-15"
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
