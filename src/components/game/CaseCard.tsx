'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { GameCase } from '@/types';

// Segundos por pregunta en el nivel AVANZADO (presión de tiempo).
const HARD_SECONDS = 20;

const CAT_COLOR: Record<string, string> = {
  transparency: '#06b6d4', accountability: '#a855f7', 'open-data': '#22c55e',
  'digital-government': '#3b82f6', 'e-government': '#3b82f6', cybersecurity: '#ef4444',
  'data-protection': '#f97316', corruption: '#eab308', 'public-ethics': '#eab308',
  'ethics-corruption': '#eab308', 'ai-government': '#a855f7', 'citizen-participation': '#22c55e',
  'electronic-signature': '#06b6d4', interoperability: '#3b82f6',
};

const CAT_LABEL: Record<string, string> = {
  transparency: '🔍 Transparencia', accountability: '📊 Rendición de Cuentas',
  'open-data': '📂 Datos Abiertos', 'digital-government': '💻 Gobierno Digital',
  cybersecurity: '🛡️ Ciberseguridad', 'data-protection': '🔒 Protección de Datos',
  'public-ethics': '🏰 Ética Pública', 'ethics-corruption': '⚖️ Anticorrupción',
  'ai-government': '🤖 IA Gubernamental', 'citizen-participation': '👥 Participación',
  'electronic-signature': '✍️ Firma Electrónica', 'e-government': '🖥️ e-Gobierno',
};

const OPTS = [
  { letter: 'A', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { letter: 'B', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  { letter: 'C', color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  { letter: 'D', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
];

interface Props { gameCase: GameCase; npcName: string; npcAvatar: string; npcPersonality?: string; }

export function CaseCard({ gameCase, npcName, npcAvatar, npcPersonality }: Props) {
  const resolveCase = useGameStore((s) => s.resolveCase);
  const difficulty  = useGameStore((s) => s.save?.difficulty);
  const [selected, setSelected] = useState<string | null>(null);
  const color = CAT_COLOR[gameCase.category] ?? '#3b82f6';

  const timed = difficulty === 'hard';
  const [timeLeft, setTimeLeft] = useState(HARD_SECONDS);

  function pick(optId: string) {
    if (selected) return;
    setSelected(optId);
    setTimeout(() => resolveCase(gameCase.id, optId), 350);
  }

  // Temporizador solo en AVANZADO. Si se agota el tiempo, se toma como
  // respuesta incorrecta (penalización) para hacer el nivel muy difícil.
  useEffect(() => {
    if (!timed || selected) return;
    if (timeLeft <= 0) {
      const wrong = gameCase.options.find((o) => !o.isCorrect) ?? gameCase.options[0];
      pick(wrong.id);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timed, timeLeft, selected]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {/* ── PERSONAJE + PREGUNTA ── */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

        {/* Avatar */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 88, height: 88, borderRadius: '50%', fontSize: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `radial-gradient(circle, ${color}44, #1e293b)`,
              border: `3px solid ${color}`,
              boxShadow: `0 0 24px ${color}66`,
              position: 'relative',
            }}
          >
            {npcAvatar}
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#0f172a', fontWeight: 900 }}
            >!</motion.div>
          </motion.div>
          <span style={{ fontSize: 11, fontWeight: 700, color, textAlign: 'center', maxWidth: 88 }}>{npcName.split(' ')[0]}</span>
          <span style={{ fontSize: 10, color: '#64748b', background: `${color}22`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${color}44`, whiteSpace: 'nowrap' }}>
            {CAT_LABEL[gameCase.category] ?? gameCase.category}
          </span>
        </div>

        {/* Burbuja de diálogo */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Cola de la burbuja */}
          <div style={{ position: 'absolute', left: -10, top: 28, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `12px solid ${color}` }} />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ background: '#1e293b', border: `2px solid ${color}88`, borderRadius: 16, padding: 16, boxShadow: `0 4px 24px ${color}22` }}
          >
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 8 }}>{gameCase.title}</div>
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>{gameCase.description}</p>
            {npcPersonality && (
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 10, fontStyle: 'italic', borderTop: '1px solid #334155', paddingTop: 8 }}>
                💭 {npcPersonality}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── OPCIONES ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ background: '#1e293b', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}
      >
        <div style={{ padding: '10px 16px', background: `${color}18`, borderBottom: `1px solid ${color}33`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚖️</span>
          <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: 2 }}>¿QUÉ DECIDES?</span>
          {timed && !selected && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 900, color: timeLeft <= 5 ? '#ef4444' : '#f59e0b' }}>
              <motion.span
                animate={timeLeft <= 5 ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
              >⏱️</motion.span>
              {timeLeft}s
            </span>
          )}
        </div>

        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {gameCase.options.map((opt, i) => {
            const o = OPTS[i] ?? OPTS[0];
            const isSel = selected === opt.id;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                whileHover={!selected ? { x: 6, background: o.bg } : {}}
                whileTap={!selected ? { scale: 0.98 } : {}}
                onClick={() => pick(opt.id)}
                disabled={!!selected}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 10, border: `2px solid ${isSel ? o.color : '#334155'}`,
                  background: isSel ? o.bg : '#0f172a', cursor: selected ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'all 0.15s ease',
                  borderLeft: `4px solid ${o.color}`,
                }}
              >
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: isSel ? o.color : `${o.color}33`, color: isSel ? '#0f172a' : o.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, flexShrink: 0, border: `2px solid ${o.color}`, transition: 'all 0.15s' }}>
                  {o.letter}
                </span>
                <span style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>{opt.text}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
