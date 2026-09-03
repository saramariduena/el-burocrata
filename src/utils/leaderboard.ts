// Ranking diario local (se guarda en el navegador y se reinicia cada día).
// No requiere servidor ni configuración: usa localStorage del dispositivo.

export interface ScoreEntry {
  name: string;
  score: number;      // 0–100 (evaluación final)
  grade: string;      // A+, A, B, ...
  cases: number;      // casos resueltos
  correct: number;    // decisiones correctas
  difficulty: string; // easy | normal | hard
  day: string;        // YYYY-MM-DD (día local)
  ts: number;         // marca de tiempo
}

const KEY = 'el-burocrata-ranking-v1';

// Clave del día local (año-mes-día). Sirve para reiniciar el ranking cada día.
export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function readAll(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: ScoreEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Si no hay acceso a localStorage, simplemente no se guarda.
  }
}

function sortScores(list: ScoreEntry[]): ScoreEntry[] {
  return [...list].sort(
    (a, b) => b.score - a.score || b.correct - a.correct || b.cases - a.cases || a.ts - b.ts
  );
}

// Devuelve solo los puntajes de HOY (ordenados). De paso purga los días
// anteriores, logrando el "reinicio diario" del ranking.
export function getTodayScores(): ScoreEntry[] {
  const today = todayKey();
  const all = readAll();
  const todays = all.filter((e) => e && e.day === today);
  if (todays.length !== all.length) writeAll(todays);
  return sortScores(todays);
}

// Agrega (o mejora) el puntaje de un jugador para el día de hoy.
// Si el mismo nombre ya jugó hoy, conserva su mejor puntaje.
export function addScore(entry: Omit<ScoreEntry, 'day' | 'ts'>): ScoreEntry[] {
  const today = todayKey();
  const all = readAll().filter((e) => e && e.day === today); // purga días pasados
  const full: ScoreEntry = { ...entry, name: entry.name.trim() || 'Anónimo', day: today, ts: Date.now() };
  const nameKey = full.name.toLowerCase();
  const idx = all.findIndex((e) => e.name.trim().toLowerCase() === nameKey);
  if (idx >= 0) {
    if (full.score > all[idx].score) all[idx] = full; // guarda el mejor de hoy
  } else {
    all.push(full);
  }
  writeAll(all);
  return sortScores(all);
}

// Borra manualmente el ranking del día.
export function clearToday(): void {
  writeAll([]);
}
