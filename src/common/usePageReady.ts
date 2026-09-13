"use client";
import { useState, useEffect } from 'react';

const PRELOADER_KEY = 'landingPrimaryPreloaderSeen';

/**
 * Returns true when the page is ready to start entrance animations.
 * On pages with preloader: waits for the "preloaderDone" event.
 * On other pages: returns true immediately.
 */
export function usePageReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let readyTimer: ReturnType<typeof setTimeout> | undefined;

    const markReady = () => {
      readyTimer = setTimeout(() => setIsReady(true), 0);
    };

    // Pages without preloader → ready immediately
    // Preloader already dismissed in this session → ready immediately
    if (sessionStorage.getItem(PRELOADER_KEY)) {
      markReady();
      return () => clearTimeout(readyTimer);
    }

    // Wait for the preloader to dispatch "preloaderDone"
    const handleDone = () => setIsReady(true);
    window.addEventListener('preloaderDone', handleDone, { once: true });
    return () => window.removeEventListener('preloaderDone', handleDone);
  }, []);

  return isReady;
}
