'use client';

import { useState } from 'react';
import { sound } from '@/utils/sound';

// Botón flotante para silenciar / activar el sonido.
export function SoundToggle() {
  const [muted, setMuted] = useState<boolean>(() => {
    try { return sound.isMuted(); } catch { return false; }
  });

  return (
    <button
      onClick={() => { sound.init(); setMuted(sound.toggleMute()); }}
      aria-label={muted ? 'Activar sonido' : 'Silenciar'}
      title={muted ? 'Activar sonido' : 'Silenciar'}
      style={{
        position: 'fixed', top: 12, right: 12, zIndex: 60,
        width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
        border: '1px solid #334155', background: 'rgba(15,23,42,0.85)',
        color: '#e2e8f0', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
