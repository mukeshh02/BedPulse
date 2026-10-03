'use client';

import React, { Suspense } from 'react';
import { LandingPage } from '@/components/LandingPage';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAF9]" />}>
      <LandingPage />
    </Suspense>
  );
}
