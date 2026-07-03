'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          color: '#FCFCFD',
          fontFamily: 'var(--font-manrope), system-ui, sans-serif',
          fontSize: '14px',
        },
        className: 'sonner-toast',
      }}
      theme="dark"
    />
  );
}
