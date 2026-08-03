/**
 * Utilidad global para reproducir sonidos con un fade-in suave.
 * Esto evita el "susto" auditivo si los altavoces están altos, 
 * pero asegura que el sonido alcance un nivel audible de forma gentil.
 *
 * @param {string} src - Ruta del archivo de audio.
 * @param {number} targetVolume - Volumen final (0.0 a 1.0), por defecto 0.35.
 * @param {number} fadeDuration - Duración del fade-in en ms, por defecto 200.
 */
export const playSoundWithFade = (src = '/assets/sonic/Soft.wav', targetVolume = 0.25, fadeDuration = 200) => {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('isGlobalMuted') === 'true') return;

  try {
    if (window.currentAudio) {
      window.currentAudio.pause();
      window.currentAudio.currentTime = 0;
    }

    const audio = new Audio(src);
    audio.volume = 0; // Iniciar en silencio para el fade-in
    window.currentAudio = audio;

    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Implementar el fade-in
        const steps = 10;
        const stepDuration = fadeDuration / steps;
        const volumeStep = targetVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
          currentStep++;
          if (currentStep >= steps) {
            audio.volume = targetVolume;
            clearInterval(fadeInterval);
          } else {
            // Asegurarse de no exceder el límite
            audio.volume = Math.min(targetVolume, currentStep * volumeStep);
          }
        }, stepDuration);
      }).catch(err => {
        console.log('Audio playback blocked or failed', err);
      });
    }
  } catch (error) {
    console.log('Error initializing audio', error);
  }
};
