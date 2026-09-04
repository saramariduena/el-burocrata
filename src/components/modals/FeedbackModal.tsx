'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { sound } from '@/utils/sound';

export function FeedbackModal() {
  const showFeedback      = useGameStore((s) => s.showFeedback);
  const lastFeedback      = useGameStore((s) => s.lastFeedback);
  const lastChoiceCorrect = useGameStore((s) => s.lastChoiceCorrect);
  const dismissFeedback   = useGameStore((s) => s.dismissFeedback);

  const ok    = lastChoiceCorrect;
  const color = ok ? '#22c55e' : '#ef4444';

  // Efecto de sonido al mostrar el resultado.
  useEffect(() => {
    if (!showFeedback) return;
    if (ok) sound.correct();
    else sound.wrong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback]);

  return (
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissFeedback}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 500, width: '100%', borderRadius: 20, overflow: 'hidden', border: `2px solid ${color}`, boxShadow: `0 0 40px ${color}44` }}
          >
            <div style={{ padding: '20px 24px', background: ok ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))' : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))', borderBottom: `1px solid ${color}44`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1, stiffness: 400 }} style={{ fontSize: 52 }}>
                {ok ? '✅' : '❌'}
              </motion.div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 20, color }}>{ok ? '¡Decisión Correcta!' : 'Decisión Incorrecta'}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{ok ? 'Bien aplicado el marco normativo ecuatoriano' : 'Revisa la normativa aplicable'}</div>
              </div>
            </div>
            <div style={{ padding: 24, background: '#1e293b' }}>
              <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8, marginBottom: 20 }}>{lastFeedback}</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={dismissFeedback}
                style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, background: ok ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}>
                CONTINUAR →
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
