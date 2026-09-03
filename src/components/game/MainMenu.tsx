'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getTodayScores, clearToday, type ScoreEntry } from '@/utils/leaderboard';
import type { Difficulty } from '@/types';

const CHARS = [
  { e: '👨‍💼', label: 'Funcionario', color: '#3b82f6', delay: 0 },
  { e: '👩‍⚕️', label: 'Médica', color: '#22c55e', delay: 0.2 },
  { e: '🕵️', label: 'Auditor', color: '#eab308', delay: 0.4 },
  { e: '👩‍💼', label: 'Ministra', color: '#a855f7', delay: 0.6 },
  { e: '📰', label: 'Periodista', color: '#ef4444', delay: 0.8 },
  { e: '👵', label: 'Ciudadana', color: '#f97316', delay: 1.0 },
];

const DIFFS: { id: Difficulty; emoji: string; label: string; desc: string; color: string }[] = [
  { id: 'easy',   emoji: '😊', label: 'FÁCIL',    desc: 'Para aprender tranquilo', color: '#22c55e' },
  { id: 'normal', emoji: '🎯', label: 'INTERMEDIO', desc: 'Equilibrado',           color: '#3b82f6' },
  { id: 'hard',   emoji: '🔥', label: 'AVANZADO', desc: 'Más presión y eventos',  color: '#f97316' },
];

export function MainMenu() {
  const initGame = useGameStore((s) => s.initGame);
  const save     = useGameStore((s) => s.save);
  const isMobile = useIsMobile();

  const [step,       setStep]       = useState<'home' | 'new' | 'ranking'>('home');
  const [name,       setName]       = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [ranking,    setRanking]    = useState<ScoreEntry[]>([]);

  function start() {
    if (!name.trim()) return;
    initGame(name.trim(), difficulty, 'campaign');
  }

  function openRanking() {
    setRanking(getTodayScores());
    setStep('ranking');
  }

  if (step === 'ranking') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 480, background: '#1e293b', borderRadius: 20, overflow: 'hidden', border: '1px solid #334155' }}>
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(250,204,21,0.15), transparent)', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setStep('home')} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>🏆 Ranking de hoy</span>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16, textAlign: 'center' }}>
            Los puntajes se guardan durante el día y se reinician automáticamente cada jornada.
          </p>

          {ranking.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 13 }}>Todavía nadie jugó hoy. ¡Sé el primero!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ranking.map((e, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                const top = i === 0;
                return (
                  <div key={e.ts} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: top ? 'rgba(250,204,21,0.12)' : '#0f172a', border: top ? '1px solid #facc1566' : '1px solid #334155' }}>
                    <span style={{ width: 26, textAlign: 'center', fontSize: 15 }}>{medal}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{e.cases} casos · {e.correct} correctas</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 22, textAlign: 'center' }}>{e.grade}</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#facc15', minWidth: 40, textAlign: 'right' }}>{e.score}</span>
                  </div>
                );
              })}
            </div>
          )}

          {ranking.length > 0 && (
            <button
              onClick={() => { if (confirm('¿Borrar el ranking de hoy? Esta acción no se puede deshacer.')) { clearToday(); setRanking([]); } }}
              style={{ marginTop: 20, width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ef444455', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
            >
              🗑️ Borrar ranking de hoy
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  if (step === 'home') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' }}>

      {/* Título */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 32 }}>
        <div style={{ fontSize: isMobile ? 52 : 72, marginBottom: 8 }}>🏛️</div>
        <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, color: '#fff', letterSpacing: isMobile ? 2 : 4, textShadow: '0 0 40px rgba(99,102,241,0.8)' }}>
          EL BURÓCRATA
        </h1>
        <p style={{ color: '#94a3b8', fontSize: isMobile ? 11 : 13, letterSpacing: isMobile ? 1.5 : 3, marginTop: 6 }}>
          VIDEOJUEGO EDUCATIVO · NORMATIVA ECUATORIANA
        </p>
      </motion.div>

      {/* Personajes animados */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 28 : 40, maxWidth: 420 }}>
        {CHARS.map((c, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: c.delay, ease: 'easeInOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            <div style={{
              width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, borderRadius: '50%', fontSize: isMobile ? 26 : 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `radial-gradient(circle, ${c.color}44, #1e293b)`,
              border: `2px solid ${c.color}`,
              boxShadow: `0 0 16px ${c.color}66`,
            }}>{c.e}</div>
            <span style={{ fontSize: 10, color: c.color, fontWeight: 700 }}>{c.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Botones */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(99,102,241,0.6)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep('new')}
          style={{ padding: '18px 24px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', letterSpacing: 1 }}
        >
          ▶ NUEVA PARTIDA
        </motion.button>

        {save && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => useGameStore.getState().loadGame()}
            style={{ padding: '14px 24px', borderRadius: 14, border: '2px solid #22c55e', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
          >
            📂 CONTINUAR — {save.playerName}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openRanking}
          style={{ padding: '14px 24px', borderRadius: 14, border: '2px solid #facc15', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: 'rgba(250,204,21,0.1)', color: '#facc15' }}
        >
          🏆 RANKING DE HOY
        </motion.button>
      </motion.div>

      {/* Leyes */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ marginTop: 40, textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: 11, marginBottom: 8 }}>Basado en normativa ecuatoriana vigente</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {['LOTAIP', 'LOPDP', 'COIP', 'LOSEP', 'COA', 'Constitución 2008', 'LOSNCP'].map(l => (
            <span key={l} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: '#1e293b', border: '1px solid #334155', color: '#64748b' }}>{l}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 480, background: '#1e293b', borderRadius: 20, overflow: 'hidden', border: '1px solid #334155' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), transparent)', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setStep('home')} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>🎮 Configurar Partida</span>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Nombre */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: 1 }}>👤 TU NOMBRE</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && start()}
              placeholder="Ej: Gabriela Moreno"
              maxLength={40}
              autoFocus
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `2px solid ${name ? '#6366f1' : '#334155'}`, background: '#0f172a', color: '#fff', fontSize: 15, outline: 'none' }}
            />
          </div>

          {/* Info de partida */}
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f133', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎯</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#818cf8' }}>Partida de 10 casos</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Al terminar, tu puntaje entra al ranking del día</div>
            </div>
          </div>

          {/* Dificultad */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: 1 }}>⚡ DIFICULTAD</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {DIFFS.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)} style={{ padding: 12, borderRadius: 10, border: `2px solid ${difficulty === d.id ? d.color : '#334155'}`, background: difficulty === d.id ? `${d.color}18` : '#0f172a', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span>{d.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: 12, color: difficulty === d.id ? d.color : '#e2e8f0' }}>{d.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Botón iniciar */}
          <motion.button
            whileHover={name.trim() ? { scale: 1.02 } : {}}
            whileTap={name.trim() ? { scale: 0.97 } : {}}
            onClick={start}
            disabled={!name.trim()}
            style={{ padding: '16px 24px', borderRadius: 12, border: 'none', cursor: name.trim() ? 'pointer' : 'not-allowed', fontWeight: 800, fontSize: 15, background: name.trim() ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#1e293b', color: name.trim() ? '#fff' : '#475569', transition: 'all 0.2s' }}
          >
            {name.trim() ? `🚀 INICIAR — ${name}` : 'Escribe tu nombre para empezar'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
