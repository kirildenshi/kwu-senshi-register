import type { Metadata } from 'next';
import SubmittedClient from './SubmittedClient';

export const metadata: Metadata = {
  title: 'Registration Received — KWU SENSHI',
  description: 'Your KWU SENSHI registration has been received.',
  robots: { index: false },
};

export default function SubmittedPage() {
  return <SubmittedClient />;
}
