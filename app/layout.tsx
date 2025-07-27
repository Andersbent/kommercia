import './globals.css';
import Providers from '@/components/Providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kommercia – Your Commercial Department in the Cloud',
  description:
    'Et moderne CRM‑system med AI‑baseret leadgenerering, Gmail‑overvågning og et intuitivt dashboard for små virksomheder og solo‑sælgere.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
