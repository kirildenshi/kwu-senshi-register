'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface FieldTooltipProps {
  content: string;
  fieldName: string;
}

export default function FieldTooltip({ content, fieldName }: FieldTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!content) return null;

  return (
    <div ref={ref} className="relative inline-block ml-1.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-senshi-sm text-senshi-grey-60 transition-colors hover:text-senshi-gold-90 focus:outline-hidden focus:ring-2 focus:ring-senshi-gold-90"
        aria-label={`Help for ${fieldName}`}
        aria-expanded={open}
      >
        <HelpCircle size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
            id={`tooltip-${fieldName}`}
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-senshi-sm border border-senshi-black-20 bg-senshi-black-12 p-3 text-body-sm text-senshi-grey-90 shadow-lg"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
