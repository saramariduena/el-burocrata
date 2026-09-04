'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { computeFinalScore, getLetterGrade } from '@/utils/statistics';
import { addScore, getTodayScores, type ScoreEntry } from '@/utils/leaderboard';
import type { Difficulty } from '@/types';

const LAST_KEY = 'el-burocrata-ranking-last';

// Progresión de niveles: Fácil → Intermedio → Avanzado.
const NEXT_LEVEL: Partial<Record<Difficulty, { id: Difficulty; label: string; emoji: string }>> = {
  easy:   { id: 'normal', label: 'INTERMEDIO', emoji: '🎯' },
  normal: { id: 'hard',   label: 'AVANZADO',   emoji: '🔥' },
};

export function GameOverScreen() {
  const save      = useGameStore((s) => s.save);
  const resetGame = useGameStore((s) => s.resetGame);
  const initGame  = useGameStore((s) => s.initGame);

  const [ranking, setRanking] = useState<ScoreEntry[]>([]);

  const victory = save?.isVictory === true;
  const score   = save ? computeFinalScore(save.statistics) : 0;
  const grade   = getLetterGrade(score);
  const color   = victory ? '#22c55e' : '#ef4444';

  // Guarda el puntaje en el ranking diario (una sola vez por partida).
  useEffect(() => {
    if (!save || !save.isGameOver) return;
    const gameId = save.createdAt;
    let already = '';
    try { already = localStorage.getItem(LAST_KEY) ?? ''; } catch { /* sin localStorage */ }
    if (already === gameId) {
      setRanking(getTodayScores());
      return;
    }
    const list = addScore({
      name: save.playerName,
      score,
      grade,
      cases: save.statistics.totalCasesResolved,
      correct: save.statistics.correctDecisions,
      difficulty: save.difficulty,
    });
    try { localStorage.setItem(LAST_KEY, gameId); } catch { /* sin localStorage */ }
    setRanking(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!save || !save.isGameOver) return null;

  const gradeColor = grade.startsWith('A') ? '#22c55e' : grade === 'B' ? '#3b82f6' : grade === 'C' ? '#eab308' : grade === 'D' ? '#f97316' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16, overflowY: 'auto' }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        style={{ maxWidth: 500, width: '100%', borderRadius: 24, overflow: 'hidden', border: `2px solid ${color}`, boxShadow: `0 0 60px ${color}44` }}
      >
        {/* Header */}
        <div style={{ padding: '32px 24px 24px', background: `linear-gradient(160deg, ${color}22, #1e293b)`, textAlign: 'center', borderBottom: `1px solid ${color}33` }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            {(victory ? ['🏆','🎉','⭐','🥇'] : ['😔','📋','🏛️']).map((e, i) => (
              <motion.span key={i} style={{ fontSize: 36 }} animate={{ y: [0, -10, 0] }} transition={{ delay: i * 0.15, repeat: Infinity, duration: 1.4 }}>
                {e}
              </motion.span>
            ))}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color, marginBottom: 8 }}>
            {victory ? '¡MANDATO COMPLETADO!' : 'FIN DE LA GESTIÓN'}
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>{save.gameOverReason}</p>
        </div>

        <div style={{ padding: 24, background: '#1e293b' }}>
          {/* Calificación */}
          <div style={{ textAlign: 'center', padding: '20px', background: '#0f172a', borderRadius: 16, border: '1px solid #334155', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>EVALUACIÓN FINAL</div>
            <div style={{ fontSize: 80, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>Puntaje: {score}/100</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Casos Resueltos',      value: save.statistics.totalCasesResolved,        color: '#fff' },
              { label: 'Decisiones Correctas', value: save.statistics.correctDecisions,           color: '#22c55e' },
              { label: 'Transparencia',        value: `${save.statistics.transparencyIndex}%`,    color: '#06b6d4' },
              { label: 'Corrupción',           value: `${save.statistics.corruptionIndex}%`,      color: save.statistics.corruptionIndex > 10 ? '#ef4444' : '#22c55e' },
              { label: 'Años Completados',     value: `${Math.min(save.currentYear - 1, 4)}/4`,   color: '#a855f7' },
              { label: 'Satisfacción Prom.',   value: `${save.statistics.citizenSatisfactionAvg}%`, color: '#f97316' },
            ].map(s => (
              <div key={s.label} style={{ padding: 12, background: '#0f172a', borderRadius: 10, border: '1px solid #334155' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {victory && (
            <div style={{ padding: 16, background: 'rgba(34,197,94,0.1)', borderRadius: 12, border: '1px solid #22c55e44', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👨‍💼👩‍💼👮👩‍🏫👨‍⚕️</div>
              <div style={{ fontSize: 13, color: '#22c55e' }}>Los ciudadanos ecuatorianos agradecen tu gestión honesta y transparente</div>
            </div>
          )}

          {/* Ranking del día */}
          <div style={{ padding: 16, background: '#0f172a', borderRadius: 16, border: '1px solid #334155', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#facc15', letterSpacing: 1 }}>🏆 RANKING DE HOY</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>se reinicia cada día</div>
            </div>
            {ranking.length === 0 ? (
              <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: '8px 0' }}>Sé el primero en el ranking de hoy</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ranking.slice(0, 8).map((e, i) => {
                  const isMe = e.name.trim().toLowerCase() === save.playerName.trim().toLowerCase();
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                  return (
                    <div key={e.ts} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: isMe ? 'rgba(99,102,241,0.18)' : '#1e293b', border: isMe ? '1px solid #6366f1' : '1px solid #33415555' }}>
                      <span style={{ width: 24, textAlign: 'center', fontSize: 14 }}>{medal}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: isMe ? 800 : 600, color: isMe ? '#c7d2fe' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.name}{isMe ? ' (tú)' : ''}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{e.grade}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#facc15', minWidth: 34, textAlign: 'right' }}>{e.score}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {(() => {
            const next = victory ? NEXT_LEVEL[save.difficulty] : undefined;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {next && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => initGame(save.playerName, next.id, 'campaign')}
                    style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 15, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff' }}
                  >
                    {next.emoji} SIGUIENTE NIVEL: {next.label}
                  </motion.button>
                )}

                {victory && !next && (
                  <div style={{ padding: 12, background: 'rgba(245,158,11,0.12)', borderRadius: 12, border: '1px solid #f59e0b44', textAlign: 'center', fontSize: 13, color: '#fbbf24', fontWeight: 700 }}>
                    🏅 ¡Completaste el nivel más difícil!
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={resetGame}
                  style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 15, background: next ? '#334155' : (victory ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #6366f1, #3b82f6)'), color: '#fff' }}
                >
                  {next ? 'MENÚ PRINCIPAL' : 'NUEVA PARTIDA'}
                </motion.button>
              </div>
            );
          })()}
        </div>
      </motion.div>
    </motion.div>
  );
}
