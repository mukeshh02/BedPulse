import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BedPulse™ — Smart Inpatient & Ward Care OS',
  description: 'Hospital Inpatient, Bed Management, Admission, Transfers & Discharge System. Developed by WebVission (+91 7000371321)',
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
      </head>
      <body className="antialiased min-h-screen selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
