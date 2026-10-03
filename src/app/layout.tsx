import { PullToRefresh } from '@/components/PullToRefresh';
import { Suspense } from 'react';
import { NavigationProgress } from '@/components/LoadingFeedback';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BedPulse™ — Smart Inpatient & Ward Care OS',
  description: 'Hospital Inpatient, Bed Management, Admission, Transfers & Discharge System. Developed by WebVission (+91 7000371321)',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#183E33',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased min-h-screen selection:bg-brand-500 selection:text-white">
        <Suspense fallback={null}><NavigationProgress /></Suspense>
        <PullToRefresh />
        {children}
      </body>
    </html>
  );
}
