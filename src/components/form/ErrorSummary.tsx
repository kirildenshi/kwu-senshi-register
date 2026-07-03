'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorSummaryProps {
  errors: { fieldName: string; label: string; message: string }[];
  title: string;
}

export default function ErrorSummary({ errors, title }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0 && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ref.current.focus();
    }
  }, [errors]);

  if (errors.length === 0) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      className="rounded-senshi-sm border border-red-800 bg-red-900/30 px-4 py-3 outline-hidden"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-red-300">
        <AlertCircle size={16} />
        {title}
      </div>
      <ul className="mt-2 space-y-1">
        {errors.map((err) => (
          <li key={err.fieldName}>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(`field-${err.fieldName}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  const input = el.querySelector('input, select, button');
                  if (input instanceof HTMLElement) input.focus();
                }
              }}
              className="text-left text-sm text-red-400 underline underline-offset-2 hover:text-red-300"
            >
              {err.label}: {err.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
