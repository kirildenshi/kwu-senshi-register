import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B0B0B',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: {
    default: 'KWU SENSHI — Registration',
    template: '%s | KWU SENSHI',
  },
  description: 'Register as a KWU SENSHI Alliance Member or Dojo Operator.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
