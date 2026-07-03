'use client';

import { useEffect, useState } from 'react';

interface FormProgressProps {
  percent: number;
  label?: string;
}

export default function FormProgress({ percent, label }: FormProgressProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayPercent = mounted ? Math.min(100, Math.max(0, percent)) : 0;

  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-senshi-sm bg-senshi-black-20">
        <div
          className="h-1.5 rounded-senshi-sm bg-action-primary transition-all duration-500 ease-out"
          style={{ width: `${displayPercent}%` }}
          role="progressbar"
          aria-valuenow={Math.round(displayPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}
