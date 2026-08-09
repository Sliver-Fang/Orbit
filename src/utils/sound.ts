/**
 * Audio feedback utility using Web Audio API for zero-latency tap sounds
 */

let audioCtx: AudioContext | null = null;

export function playTapSound() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Subtle soft mechanical click/tap frequencies
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.025);

    // Soft volume (3.5%)
    gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.025);
  } catch (e) {
    // Audio restrictions on initial load
  }
}
