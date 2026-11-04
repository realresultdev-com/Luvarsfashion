/**
 * Synthesizes a luxury iOS Apple-style notification chime using the Web Audio API.
 * 
 * Features:
 * - Zero external mp3 dependencies or asset network latency (0ms instant trigger)
 * - Authentic 3-note harmonic bell chord (C6 -> E6 -> G6)
 * - Exponential decay curve replicating Apple's glass/chime resonance
 */
export function playIosChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Harmonic bell chord: C6 (1046.5Hz), E6 (1318.51Hz), G6 (1567.98Hz)
    const tones = [
      { freq: 1046.5, delay: 0.0, dur: 0.35, gain: 0.28 },
      { freq: 1318.51, delay: 0.08, dur: 0.45, gain: 0.32 },
      { freq: 1567.98, delay: 0.16, dur: 0.65, gain: 0.38 },
      // Subtle shimmer harmonic
      { freq: 2093.0, delay: 0.2, dur: 0.5, gain: 0.12 },
    ];

    tones.forEach(({ freq, delay, dur, gain: targetGain }) => {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      // Attack: Instant exponential rise
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, startTime + 0.015);

      // Decay: Smooth exponential fade out
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });
  } catch (err) {
    console.debug("Web Audio synthesis not available or blocked by autoplay policy:", err);
  }
}
