import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import loadingPace from '@/common/loadingPace';
import { playSoundWithFade } from '@/utils/audio';

const getPreloaderKey = (path) => {
  const norm = path.replace(/\/$/, '') || '/';
  if (norm === '/ec') return 'preloaderShown_ec';
  if (norm === '/es') return 'preloaderShown_es';
  return 'preloaderShown_home';
};

const PreLoader = () => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [buttonRevealed, setButtonRevealed] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);
  const pathname = usePathname();
  const hideTimeoutRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const timer1Ref = useRef(null);
  const timer2Ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMuted = localStorage.getItem('isGlobalMuted') === 'true';
    if (isMuted) setSoundEnabled(false);

    const handleStorageChange = () => {
      setSoundEnabled(localStorage.getItem('isGlobalMuted') !== 'true');
    };
    window.addEventListener('storage', handleStorageChange);

    const startPreloaderSequence = () => {
      setTimeout(() => loadingPace(), 0);
      timer1Ref.current = setTimeout(() => {
        setHasLoaded(true);
      }, 100);

      timer2Ref.current = setTimeout(() => {
        setButtonRevealed(true);
      }, 1200);
    };

    const preloaderPaths = ['/', '/ec', '/es'];

    const clearAllTimers = () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };

    const handleReset = () => {
      const normPathname = pathname.replace(/\/$/, '') || '/';
      if (!preloaderPaths.includes(normPathname)) {
        setShouldShow(false);
        clearAllTimers();
        document.documentElement.classList.remove('preloader-pending');
        return;
      }

      const alreadySeen = sessionStorage.getItem(getPreloaderKey(normPathname));
      if (alreadySeen) {
        setShouldShow(false);
        clearAllTimers();
        document.documentElement.classList.remove('preloader-pending');
        return;
      }

      clearAllTimers();

      setShouldShow(true);
      setHasLoaded(false);
      setButtonRevealed(false);
      setIsEntered(false);
      setIsHidden(false);

      resetTimeoutRef.current = setTimeout(() => {
        startPreloaderSequence();
      }, 100);
    };

    handleReset();

    window.addEventListener('resetPreloader', handleReset);

    return () => {
      window.removeEventListener('resetPreloader', handleReset);
      window.removeEventListener('storage', handleStorageChange);
      clearAllTimers();
    };
  }, [pathname]);

  // Bloquear scroll del body mientras el preloader está activo
  useEffect(() => {
    if (shouldShow && !isHidden) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [shouldShow, isHidden]);

  const handleStart = () => {
    if (isEntered) return; // Evitar clics múltiples cuando el botón es gigante
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(getPreloaderKey(pathname), 'true');
    }
    // Remove immediately so the ::before backdrop doesn't show through the expanding hole
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('preloader-pending');
    }
    const isMuted = typeof window !== 'undefined' && localStorage.getItem('isGlobalMuted') === 'true';
    if (!isMuted) {
      playSoundWithFade();
      if (typeof window !== 'undefined') {
        if (window.preloaderAudio) window.preloaderAudio.pause();
        window.preloaderAudio = new Audio('/assets/sonic/ComputInterfa GFX045201.wav');
        window.preloaderAudio.play().catch(e => console.log("Audio play failed:", e));
      }
    }

    setIsEntered(true);
    // Fire preloaderDone early so the hero animations begin while the preloader fades out
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('preloaderDone'));
    }, 450);
    hideTimeoutRef.current = setTimeout(() => {
      setIsHidden(true);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('preloader-pending');
      }
    }, 1300);
  };

  if (!shouldShow || isHidden) return null;

  return (
    <>
      <div id="preloader-pace" style={{ display: 'none' }}></div>
      <div 
        id="immersive-preloader" 
        className="tw-fixed tw-inset-0 tw-w-full tw-h-screen tw-overflow-hidden tw-z-[9999999]"
        style={{ pointerEvents: isEntered ? 'none' : 'auto' }}
      >
        
        {/* Fullscreen Native SVG Background & Mask - Eliminates any HTML isolation & mix-blend-mode bugs */}
        <svg className="tw-fixed tw-inset-0 tw-w-full tw-h-screen tw-pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="solid-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#600b56" />
              <stop offset="100%" stopColor="#150E23" />
            </linearGradient>
            
            <mask id="native-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <rect width="100%" height="100%" fill="white" />
              {/* This circle perfectly matches the START button and scales with it */}
              <circle 
                cx="50%" 
                cy="50%" 
                r="64" 
                fill="black" 
                style={{ 
                  transformOrigin: '50% 50%',
                  transform: isEntered ? 'scale(80) translateZ(0)' : 'scale(0) translateZ(0)', 
                  transition: 'transform 1.2s cubic-bezier(0.5, 0, 0.2, 1)' 
                }} 
              />
            </mask>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#solid-grad)" mask="url(#native-hole)" />
        </svg>

        <div className="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-items-center tw-justify-between tw-py-12 lg:tw-py-20 tw-z-10 tw-text-white tw-font-sans tw-overflow-hidden">
          
          <div className="tw-flex-grow tw-flex tw-items-center tw-justify-center tw-w-full tw-px-4">
            {/* Main content */}
            <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-justify-center tw-space-y-6 lg:tw-space-y-0 lg:tw-space-x-8 tw-text-4xl sm:tw-text-6xl md:tw-text-7xl lg:tw-text-[5rem] xl:tw-text-[7rem] tw-font-black tw-tracking-tighter tw-uppercase tw-leading-none tw-text-center">
              
              {/* Left Text: IMMERSE */}
              <span 
                className="tw-inline-block"
                style={{
                  transform: isEntered 
                    ? 'scale(1.5) translateZ(0)' 
                    : buttonRevealed 
                      ? 'translateX(0) scale(1) translateZ(0)' 
                      : hasLoaded 
                        ? 'translateX(12vw) scale(1) translateZ(0)' 
                        : 'translateX(12vw) scale(0.9) translateZ(0)',
                  opacity: isEntered ? 0 : hasLoaded ? 1 : 0,
                  filter: hasLoaded ? 'blur(0px)' : 'blur(10px)',
                  transition: isEntered 
                    ? 'all 0.2s ease-out' 
                    : 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <span className="tw-inline-block tw-transform tw-scale-y-110">UNDERCODE</span>
              </span>
              
              <div 
                className="tw-flex tw-items-center tw-space-x-3 lg:tw-space-x-6 tw-z-20"
                style={{
                  transform: isEntered 
                    ? 'translateZ(0)' 
                    : buttonRevealed 
                      ? 'scale(1) translateZ(0)' 
                      : 'scale(0) translateZ(0)',
                  opacity: buttonRevealed ? 1 : 0,
                  transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-out'
                }}
              >
                <span 
                  className="tw-text-4xl lg:tw-text-7xl tw-font-light tw-text-white/40 tw-inline-block tw-transform tw-scale-y-[1.8] lg:tw-scale-y-[2.5] tw-mt-1"
                  style={{
                    transform: isEntered 
                        ? 'translateX(-50vw) scale(1.5)' 
                        : isHovered 
                            ? 'translateX(-20px) scale(1.3)' 
                            : 'translateX(0) scale(1)',
                    opacity: isEntered ? 0 : 1,
                    transition: isEntered ? 'all 0.2s ease-out' : 'all 1.2s ease-in'
                  }}
                >
                  [
                </span>
                
                <button 
                  onClick={handleStart}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  // We remove hover:tw-bg-white the moment isEntered is true so it doesn't create a giant solid white circle.
                  className={`tw-w-28 tw-h-28 sm:tw-w-36 sm:tw-h-36 lg:tw-w-48 lg:tw-h-48 tw-rounded-full tw-border tw-border-white/30 tw-flex tw-items-center tw-justify-center tw-text-xs sm:tw-text-sm tw-font-medium tw-tracking-[0.3em] tw-transition-colors tw-duration-500 tw-group tw-origin-center ${isEntered ? 'tw-bg-transparent tw-text-white' : 'hover:tw-bg-white hover:tw-text-black'}`}
                  aria-label="Start Experience"
                  style={{
                    // Zoom effect aligns exactly with the hole puncher behind it!
                    transform: isEntered ? 'scale(80) translateZ(0)' : 'scale(1) translateZ(0)',
                    transition: 'transform 1.2s cubic-bezier(0.5, 0, 0.2, 1)'
                  }}
                >
                  <span 
                    className={`${isEntered ? '' : 'tw-group-hover:tw-scale-110'} tw-transition-transform tw-duration-300`}
                    style={{
                      opacity: isEntered ? 0 : 1,
                      transition: 'opacity 0.1s ease-out' // Text disappears instantly
                    }}
                  >
                    INICIAR
                  </span>
                </button>

                <span 
                  className="tw-text-4xl lg:tw-text-7xl tw-font-light tw-text-white/40 tw-inline-block tw-transform tw-scale-y-[1.8] lg:tw-scale-y-[2.5] tw-mt-1"
                  style={{
                    transform: isEntered 
                        ? 'translateX(50vw) scale(1.5)' 
                        : isHovered 
                            ? 'translateX(20px) scale(1.3)' 
                            : 'translateX(0) scale(1)',
                    opacity: isEntered ? 0 : 1,
                    transition: isEntered ? 'all 0.2s ease-out' : 'all 1.2s ease-in'
                  }}
                >
                  ]
                </span>
              </div>
              
              {/* Right Text: ME IN */}
              <div 
                className="tw-flex tw-items-center tw-space-x-4 lg:tw-space-x-8"
                style={{
                  transform: isEntered 
                    ? 'scale(1.5) translateZ(0)' 
                    : buttonRevealed 
                      ? 'translateX(0) scale(1) translateZ(0)' 
                      : hasLoaded 
                        ? 'translateX(-12vw) scale(1) translateZ(0)' 
                        : 'translateX(-12vw) scale(0.9) translateZ(0)',
                  opacity: isEntered ? 0 : hasLoaded ? 1 : 0,
                  filter: hasLoaded ? 'blur(0px)' : 'blur(10px)',
                  transition: isEntered 
                    ? 'all 0.2s ease-out' 
                    : 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <span className="tw-inline-block tw-transform tw-scale-y-110">EC</span>
                <span className="tw-font-light tw-text-[3rem] sm:tw-text-[5rem] lg:tw-text-[6rem] xl:tw-text-[7.5rem] -tw-mt-2 lg:-tw-mt-6">→</span>
                <div className="tw-w-4 tw-h-4 lg:tw-w-8 lg:tw-h-8 tw-rounded-full tw-bg-white/20 tw-hidden lg:tw-block"></div>
              </div>
            </div>
          </div>
          
          {/* Bottom section */}
          <div 
            className="tw-flex tw-flex-col tw-items-center tw-space-y-6 lg:tw-space-y-8 tw-pb-4 lg:tw-pb-0"
            style={{
              transform: isEntered ? 'translateY(100px)' : hasLoaded ? 'translateY(0)' : 'translateY(30px)',
              opacity: isEntered ? 0 : hasLoaded ? 1 : 0,
              transition: isEntered 
                  ? 'all 0.2s ease-out' 
                  : 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s'
            }}
          >
            <style>{`
              @keyframes audioWave {
                0% { height: 4px; }
                50% { height: 24px; }
                100% { height: 4px; }
              }
              @keyframes audioWaveIntense {
                0% { height: 2px; }
                50% { height: 32px; }
                100% { height: 2px; }
              }
              .audio-bar-preloader {
                animation: audioWave 1s ease-in-out infinite;
                will-change: height;
              }
              .audio-bar-intense {
                animation: audioWaveIntense 0.4s ease-in-out infinite;
                will-change: height;
              }
              .audio-bar-preloader:nth-child(1) { animation-delay: 0.1s; animation-duration: 0.8s; }
              .audio-bar-preloader:nth-child(2) { animation-delay: 0.3s; animation-duration: 1.2s; }
              .audio-bar-preloader:nth-child(3) { animation-delay: 0.0s; animation-duration: 0.9s; }
              .audio-bar-preloader:nth-child(4) { animation-delay: 0.4s; animation-duration: 1.1s; }
              .audio-bar-preloader:nth-child(5) { animation-delay: 0.2s; animation-duration: 0.7s; }
              .audio-bar-preloader:nth-child(6) { animation-delay: 0.5s; animation-duration: 1.0s; }
            `}</style>
            
            <button 
              onClick={() => {
                const newState = !soundEnabled;
                setSoundEnabled(newState);
                localStorage.setItem('isGlobalMuted', newState ? 'false' : 'true');
                window.dispatchEvent(new Event('storage'));

                if (typeof window !== 'undefined') {
                  if (!newState) {
                    // Mute: pausar audios
                    if (window.currentAudio) window.currentAudio.pause();
                    if (window.preloaderAudio) window.preloaderAudio.pause();
                  } else {
                    // Unmute: reanudar audios desde donde quedaron
                    if (window.currentAudio && window.currentAudio.paused && !window.currentAudio.ended) {
                      window.currentAudio.play().catch(() => {});
                    }
                    if (window.preloaderAudio && window.preloaderAudio.paused && !window.preloaderAudio.ended) {
                      window.preloaderAudio.play().catch(() => {});
                    }
                  }
                }
              }}
              className="tw-flex tw-items-center tw-bg-black/20 tw-backdrop-blur-md tw-rounded-full tw-py-2 tw-px-5 tw-border tw-border-white/5 hover:tw-bg-white/10 tw-transition-colors"
            >
              <div className="tw-flex tw-items-center tw-space-x-[3px] lg:tw-space-x-1.5 tw-h-8 tw-mr-4">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`tw-rounded-full tw-bg-white/80 tw-w-1 lg:tw-w-1.5 ${!soundEnabled ? 'tw-h-1' : (isEntered ? 'audio-bar-intense' : 'audio-bar-preloader')}`}
                  ></div>
                ))}
              </div>
              <span className="tw-text-[10px] tw-text-white/60 tw-font-bold tw-tracking-[0.2em] tw-uppercase">
                {soundEnabled ? 'Audio Ready' : 'Muted'}
              </span>
            </button>
          </div>
          
        </div>
      </div>
    </>
  )
}

export default PreLoader;
