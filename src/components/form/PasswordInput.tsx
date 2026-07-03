'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getPasswordStrength } from '@/lib/validations/registration';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  showStrength?: boolean;
  error?: boolean;
  'aria-describedby'?: string;
  strengthLabels?: Record<string, string>;
  requirementLabels?: Record<string, string>;
  toggleLabels?: { show: string; hide: string };
}

export default function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  showStrength = false,
  error,
  strengthLabels,
  requirementLabels,
  toggleLabels,
  ...ariaProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value || '') : 0;

  const sLabels = [
    '',
    strengthLabels?.weak ?? 'Weak',
    strengthLabels?.fair ?? 'Fair',
    strengthLabels?.good ?? 'Good',
    strengthLabels?.strong ?? 'Strong',
    strengthLabels?.very_strong ?? 'Very strong',
  ];

  const STRENGTH_COLORS = [
    'bg-senshi-black-25',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-400',
  ];

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="new-password"
          aria-invalid={error || undefined}
          className={`block h-12 w-full rounded-senshi-sm border bg-senshi-black-10 px-3 pr-10 text-(length:--login-text-base) leading-normal text-senshi-grey-90 placeholder:text-(length:--login-text-sm) placeholder:text-senshi-grey-60 focus:outline-hidden focus:ring-[3px] ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : 'border-senshi-black-20 focus:border-senshi-gold-70 focus:ring-senshi-gold-90/30'
          }`}
          {...ariaProps}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-senshi-grey-60 hover:text-senshi-grey-90 focus-visible:outline-hidden focus-visible:text-senshi-grey-90"
          tabIndex={-1}
          aria-label={visible
            ? (toggleLabels?.hide ?? 'Hide password')
            : (toggleLabels?.show ?? 'Show password')
          }
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-2" aria-live="polite">
          <div className="flex gap-1" role="meter" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={5} aria-label={sLabels[strength]}>
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-senshi-sm transition-colors ${
                  level <= strength ? STRENGTH_COLORS[strength] : 'bg-senshi-black-25'
                }`}
              />
            ))}
          </div>
          {strength > 0 && (
            <p className="mt-1 text-body-xs text-senshi-grey-60">
              {sLabels[strength]}
            </p>
          )}

          {/* Requirements checklist */}
          <ul className="mt-2 space-y-1" aria-label={requirementLabels?.min_length ? 'Password requirements' : undefined}>
            {[
              { test: value.length >= 8, label: requirementLabels?.min_length ?? 'At least 8 characters' },
              { test: /[A-Z]/.test(value), label: requirementLabels?.uppercase ?? 'One uppercase letter' },
              { test: /[a-z]/.test(value), label: requirementLabels?.lowercase ?? 'One lowercase letter' },
              { test: /\d/.test(value), label: requirementLabels?.digit ?? 'One digit' },
            ].map(({ test, label }) => (
              <li key={label} className={`flex items-center gap-1.5 text-body-xs ${test ? 'text-[#22C55E]' : 'text-senshi-grey-60'}`}>
                {test ? (
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><circle cx="6" cy="6" r="4" /></svg>
                )}
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
