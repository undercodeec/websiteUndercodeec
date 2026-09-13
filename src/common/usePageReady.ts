"use client";
import { useState, useEffect } from 'react';

/**
 * Returns true when the page is ready to start entrance animations.
 * On pages with preloader: waits for the "preloaderDone" event.
 * On other pages: returns true immediately.
 */
export function usePageReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => setIsReady(true), 1400);

    // Pages without preloader → ready immediately
    // Preloader already dismissed in this session → ready immediately
    // Wait for the preloader to dispatch "preloaderDone"
    const handleDone = () => setIsReady(true);
    window.addEventListener('preloaderDone', handleDone, { once: true });
    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('preloaderDone', handleDone);
    };
  }, []);

  return isReady;
}
