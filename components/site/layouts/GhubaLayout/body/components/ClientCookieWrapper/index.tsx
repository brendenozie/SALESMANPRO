// components/site/ClientCookieWrapper.tsx
'use client';

import React from 'react';
import CookieConsentBar from '../CookieConsentBar';


export default function ClientCookieWrapper() {
  const handleConsentChange = (prefs: any) => {
    console.log('User cookie preference:', prefs);
    // Optionally trigger analytics/init here
  };

  return <CookieConsentBar onConsentChange={handleConsentChange} />;
}
