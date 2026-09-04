// Música y efectos de sonido generados por el navegador (Web Audio API).
// No requiere archivos externos: se sintetiza todo en tiempo real.

const MUTE_KEY = 'el-burocrata-muted';

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let muted = false;
let musicTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;

// Progresión de acordes suave (La menor – Fa – Do – Sol), en Hz.
const CHORDS: number[][] = [
  [220.0, 261.63, 329.63], // Am
  [174.61, 220.0, 261.63], // F
  [261.63, 329.63, 392.0], // C
  [196.0, 246.94, 293.66], // G
];
let chordIdx = 0;

function readMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}

function ensureCtx(): Ctx | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : 1;
      masterGain.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.22; // volumen de la música de fondo
      musicGain.connect(masterGain);
    } catch {
      return null;
    }
  }
  return ctx;
}

// Toca un acorde + una melodía y programa el siguiente (loop de música de fondo).
function scheduleChord(): void {
  const c = ctx;
  const mg = musicGain;
  if (!c || !mg) return;
  const now = c.currentTime;
  const chord = CHORDS[chordIdx % CHORDS.length];
  const dur = 2.0;

  // Pad de acorde (suave, sostenido)
  chord.forEach((freq) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.42, now + 0.3);
    g.gain.linearRampToValueAtTime(0.0001, now + dur);
    osc.connect(g);
    g.connect(mg);
    osc.start(now);
    osc.stop(now + dur + 0.1);
  });

  // Melodía: arpegio del acorde (una octava arriba) para que suene a "cancioncita"
  const melody = [chord[0] * 2, chord[2] * 2, chord[1] * 2, chord[2] * 2];
  melody.forEach((freq, i) => {
    const start = now + i * (dur / melody.length);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.55, start + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
    osc.connect(g);
    g.connect(mg);
    osc.start(start);
    osc.stop(start + 0.5);
  });

  chordIdx += 1;
  musicTimer = setTimeout(scheduleChord, dur * 1000);
}

// Efecto de sonido corto (secuencia de notas).
function beep(freqs: number[], type: OscillatorType = 'triangle', noteDur = 0.12, gain = 0.18): void {
  const c = ensureCtx();
  const out = masterGain;
  if (!c || !out) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  let t = c.currentTime;
  freqs.forEach((f) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + noteDur);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + noteDur + 0.02);
    t += noteDur;
  });
}

export const sound = {
  // Debe llamarse dentro de un gesto del usuario (clic) para desbloquear el audio.
  init(): void {
    muted = readMuted();
    const c = ensureCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  },

  startMusic(): void {
    const c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(() => {});
    if (started) return;
    started = true;
    chordIdx = 0;
    scheduleChord();
  },

  stopMusic(): void {
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
    started = false;
  },

  correct(): void { beep([523.25, 659.25, 783.99], 'triangle', 0.11, 0.16); }, // Do-Mi-Sol ascendente
  wrong():   void { beep([311.13, 220.0], 'sawtooth', 0.18, 0.14); },           // descendente grave
  click():   void { beep([440], 'sine', 0.06, 0.08); },

  isMuted(): boolean { return muted; },

  toggleMute(): boolean {
    muted = !muted;
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* sin localStorage */ }
    if (masterGain && ctx) {
      masterGain.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05);
    }
    return muted;
  },
};
