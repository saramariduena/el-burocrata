'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore, CASES_PER_GAME } from '@/store/gameStore';
import { HUD } from '@/components/hud/HUD';
import { CaseCard } from './CaseCard';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { EventModal } from '@/components/modals/EventModal';
import { GameOverScreen } from './GameOverScreen';
import { pickNextCase } from '@/services/caseEngine';
import { shouldTriggerEvent, pickRandomEvent } from '@/services/eventEngine';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SoundToggle } from '@/components/ui/SoundToggle';
import npcProfiles from '@/data/npcs/profiles.json';

export function GameBoard() {
  const save               = useGameStore((s) => s.save);
  const currentCase        = useGameStore((s) => s.currentCase);
  const showFeedback       = useGameStore((s) => s.showFeedback);
  const currentEvent       = useGameStore((s) => s.currentEvent);
  const setCurrentCase     = useGameStore((s) => s.setCurrentCase);
  const triggerRandomEvent = useGameStore((s) => s.triggerRandomEvent);
  const advanceDay         = useGameStore((s) => s.advanceDay);
  const endGame            = useGameStore((s) => s.endGame);

  const isMobile = useIsMobile();

  const lastCategoryRef        = useRef<string | undefined>(undefined);
  const recentEventIdsRef      = useRef<string[]>([]);
  const casesSinceLastEventRef = useRef(0);
  const loadingRef             = useRef(false);

  // Cargar siguiente caso cuando no hay nada en pantalla
  useEffect(() => {
    if (!save || save.isGameOver) return;
    if (currentCase || showFeedback || currentEvent) return;
    if (loadingRef.current) return;

    // Fin de la partida al completar los 10 casos.
    if (save.statistics.totalCasesResolved >= CASES_PER_GAME) {
      endGame(`¡Completaste tus ${CASES_PER_GAME} casos! Mirá tu puntaje y el ranking del día.`, true);
      return;
    }

    loadingRef.current = true;

    const canTriggerEvent =
      save.statistics.totalCasesResolved >= 2 &&
      casesSinceLastEventRef.current >= 2;

    if (canTriggerEvent && shouldTriggerEvent(save.difficulty, save.currentDay)) {
      const event = pickRandomEvent(save.difficulty, recentEventIdsRef.current);
      if (event) {
        triggerRandomEvent(event);
        recentEventIdsRef.current = [...recentEventIdsRef.current.slice(-4), event.id];
        casesSinceLastEventRef.current = 0;
        setTimeout(() => { loadingRef.current = false; }, 500);
        return;
      }
    }

    // No repetir ningún caso ya resuelto dentro de la partida (hay 150 casos disponibles).
    const nextCase = pickNextCase(
      save.currentRank,
      save.resolvedCaseIds,
      save.difficulty,
      lastCategoryRef.current as never
    );

    if (nextCase) {
      setCurrentCase(nextCase);
      lastCategoryRef.current = nextCase.category;
      casesSinceLastEventRef.current += 1;
      advanceDay();
    }

    setTimeout(() => { loadingRef.current = false; }, 500);
  }, [save, currentCase, showFeedback, currentEvent, setCurrentCase, triggerRandomEvent, advanceDay, endGame]);

  if (!save) return null;
  if (save.isGameOver) return <GameOverScreen />;

  const npc = currentCase
    ? npcProfiles.find((n) => n.id === currentCase.npcId)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
      <SoundToggle />
      <HUD />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', padding: isMobile ? '14px 12px 32px' : '16px 32px', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 640, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}
        >
          <div style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}>
            👤 {save.playerName}
          </div>
          <div style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}>
            ✅ Caso {Math.min(save.statistics.totalCasesResolved + 1, CASES_PER_GAME)}/{CASES_PER_GAME}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentCase && !showFeedback && !currentEvent ? (
            <CaseCard
              key={currentCase.id}
              gameCase={currentCase}
              npcName={npc?.name ?? 'Ciudadano'}
              npcAvatar={npc?.avatar ?? '👤'}
              npcPersonality={npc?.personality ?? ''}
            />
          ) : !showFeedback && !currentEvent ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: 48, marginBottom: 16 }}
              >
                📋
              </motion.div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>Cargando expediente...</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <FeedbackModal />
      <EventModal />
    </div>
  );
}
