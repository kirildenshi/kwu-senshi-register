'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'kwu-senshi:draft-consent:v1';
const CONSENT_KEY_LEGACY = 'kwu-senshi:draft-consent';

interface DraftConsentBannerProps {
  message: string;
  dismissLabel: string;
}

export default function DraftConsentBanner({
  message,
  dismissLabel,
}: DraftConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const legacy = localStorage.getItem(CONSENT_KEY_LEGACY);
    if (legacy !== null) {
      localStorage.setItem(CONSENT_KEY, legacy);
      localStorage.removeItem(CONSENT_KEY_LEGACY);
    }
    const dismissed = localStorage.getItem(CONSENT_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="rounded-senshi-sm border border-senshi-black-20 bg-senshi-black-12 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-senshi-grey-70">{message}</p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(CONSENT_KEY, '1');
            setVisible(false);
          }}
          className="shrink-0 text-sm font-medium text-senshi-gold-90 hover:text-senshi-gold-70"
        >
          {dismissLabel}
        </button>
      </div>
    </div>
  );
}
