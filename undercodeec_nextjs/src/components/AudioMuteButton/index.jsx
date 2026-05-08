"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AudioMuteButton = () => {
  const pathname = usePathname();
  const isHiddenPath = pathname?.startsWith('/admin') || pathname?.startsWith('/contratos');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const isMuted = localStorage.getItem('isGlobalMuted') === 'true';
      if (isMuted) setSoundEnabled(false);
      
      // Listen to a custom event in case other components change the mute state
      const handleStorageChange = () => {
        setSoundEnabled(localStorage.getItem('isGlobalMuted') !== 'true');
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('isGlobalMuted', newState ? 'false' : 'true');
    // Dispatch storage event manually for same-tab updates
    window.dispatchEvent(new Event('storage'));
    
    // Stop currently playing audio instantly
    if (!newState && typeof window !== 'undefined') {
      if (window.currentAudio) window.currentAudio.pause();
      if (window.preloaderAudio) window.preloaderAudio.pause();
    }
  };

  if (!mounted || isHiddenPath) return null;

  return (
    <>
      <style>{`
        @keyframes globalAudioWave {
          0% { height: 4px; }
          50% { height: 18px; }
          100% { height: 4px; }
        }
        .global-audio-bar {
          animation: globalAudioWave 1s ease-in-out infinite;
          will-change: height;
        }
        .global-audio-bar:nth-child(1) { animation-delay: 0.1s; animation-duration: 0.8s; }
        .global-audio-bar:nth-child(2) { animation-delay: 0.3s; animation-duration: 1.2s; }
        .global-audio-bar:nth-child(3) { animation-delay: 0.0s; animation-duration: 0.9s; }
        .global-audio-bar:nth-child(4) { animation-delay: 0.4s; animation-duration: 1.1s; }
        .global-audio-bar:nth-child(5) { animation-delay: 0.2s; animation-duration: 0.7s; }
        .global-audio-bar:nth-child(6) { animation-delay: 0.5s; animation-duration: 1.0s; }

        .mute-btn-global {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          z-index: 999999;
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 9999px;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .mute-btn-global:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .mute-bars-container {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 24px;
          margin-right: 12px;
        }
        .mute-bar {
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.8);
          width: 3px;
        }
        .mute-bar-muted {
          height: 4px;
        }
        .mute-text {
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        @media (max-width: 1024px) {
          .mute-btn-global {
            bottom: 1rem;
            left: 1rem;
          }
        }
      `}</style>

      <button onClick={toggleSound} className="mute-btn-global">
        <div className="mute-bars-container">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`mute-bar ${!soundEnabled ? 'mute-bar-muted' : 'global-audio-bar'}`}
            ></div>
          ))}
        </div>
        <span className="mute-text">
          {soundEnabled ? 'Sound On' : 'Muted'}
        </span>
      </button>
    </>
  );
};

export default AudioMuteButton;
