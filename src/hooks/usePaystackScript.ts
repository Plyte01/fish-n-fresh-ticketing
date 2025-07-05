// src/hooks/usePaystackScript.ts
'use client';

import { useState, useEffect } from 'react';

type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

export function usePaystackScript(): ScriptStatus {
  const [status, setStatus] = useState<ScriptStatus>('idle');

  useEffect(() => {
    // Only run this logic in the browser
    if (typeof window === 'undefined') return;

    // Check if the script is already on the page
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      setStatus('ready');
      return;
    }

    setStatus('loading');
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;

    script.onload = () => {
      setStatus('ready');
    };

    script.onerror = () => {
      setStatus('error');
    };

    document.body.appendChild(script);

    // Cleanup function to remove the script if the component unmounts
    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return status;
}