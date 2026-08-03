"use client";
import { useState, useEffect } from 'react';

const PRELOADER_PATHS = ['/', '/ec', '/es'];

function getPreloaderKey(path: string): string {
  if (path === '/ec') return 'preloaderShown_ec';
  if (path === '/es') return 'preloaderShown_es';
  return 'preloaderShown_home';
}

/**
 * Returns true when the page is ready to start entrance animations.
 * On pages with preloader: waits for the "preloaderDone" event.
 * On other pages: returns true immediately.
 */
export function usePageReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;

    // Pages without preloader → ready immediately
    if (!PRELOADER_PATHS.includes(path)) {
      setIsReady(true);
      return;
    }

    // Preloader already dismissed in this session → ready immediately
    if (sessionStorage.getItem(getPreloaderKey(path))) {
      setIsReady(true);
      return;
    }

    // Wait for the preloader to dispatch "preloaderDone"
    const handleDone = () => setIsReady(true);
    window.addEventListener('preloaderDone', handleDone, { once: true });
    return () => window.removeEventListener('preloaderDone', handleDone);
  }, []);

  return isReady;
}
