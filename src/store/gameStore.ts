import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  GameStore,
  GameSave,
  GameCase,
  RandomEvent,
  Difficulty,
  PlayerRank,
  GameIndicators,
  GameStatistics,
  CaseOption,
} from '@/types';
import { RANKS } from '@/data/levels/ranks';
import { clamp } from '@/utils/math';
import { computeIndexes } from '@/utils/statistics';

const SAVE_KEY = 'el-burocrata-save-v2';
const GAME_VERSION = '1.0.0';

// Cada partida dura 10 casos (para competir parejo en el ranking).
export const CASES_PER_GAME = 10;

function createInitialIndicators(): GameIndicators {
  return {
    citizenSatisfaction: 70,
    budget: 75,
    legality: 80,
    institutionalReputation: 65,
  };
}

function createInitialStats(): GameStatistics {
  return {
    totalCasesResolved: 0,
    correctDecisions: 0,
    corruptDecisions: 0,
    transparencyIndex: 50,
    efficiencyIndex: 50,
    innovationIndex: 50,
    citizenSatisfactionAvg: 70,
    corruptionIndex: 0,
    decisionsByCategory: {},
  };
}

function buildInitialSave(
  playerName: string,
  difficulty: Difficulty,
  mode: 'campaign' | 'infinite'
): GameSave {
  const now = new Date().toISOString();
  return {
    version: GAME_VERSION,
    createdAt: now,
    updatedAt: now,
    playerName,
    difficulty,
    gameMode: mode,
    currentYear: 1,
    currentDay: 1,
    currentRank: 'auxiliary',
    xp: 0,
    indicators: createInitialIndicators(),
    resolvedCaseIds: [],
    unlockedAchievementIds: [],
    journalEntries: [],
    statistics: createInitialStats(),
    isGameOver: false,
  };
}

function applyDelta(indicators: GameIndicators, option: CaseOption): GameIndicators {
  const d = option.delta;
  return {
    citizenSatisfaction: clamp((indicators.citizenSatisfaction) + (d.citizenSatisfaction ?? 0), 0, 100),
    budget: clamp(indicators.budget + (d.budget ?? 0), 0, 100),
    legality: clamp(indicators.legality + (d.legality ?? 0), 0, 100),
    institutionalReputation: clamp(indicators.institutionalReputation + (d.institutionalReputation ?? 0), 0, 100),
  };
}

function getRankForXP(xp: number): PlayerRank {
  const eligible = RANKS.filter((r) => xp >= r.minXP);
  return eligible[eligible.length - 1]?.id ?? 'auxiliary';
}

function isGameOver(indicators: GameIndicators): { over: boolean; reason?: string } {
  if (indicators.citizenSatisfaction <= 0)
    return { over: true, reason: 'La ciudadanía ha perdido toda la confianza en tu gestión.' };
  if (indicators.budget <= 0)
    return { over: true, reason: 'El presupuesto institucional se ha agotado completamente.' };
  if (indicators.legality <= 0)
    return { over: true, reason: 'Has incurrido en graves violaciones legales. Debes renunciar.' };
  if (indicators.institutionalReputation <= 0)
    return { over: true, reason: 'La reputación institucional ha colapsado.' };
  return { over: false };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      save: null,
      currentCase: null,
      currentEvent: null,
      showFeedback: false,
      lastFeedback: '',
      lastChoiceCorrect: false,
      isLoading: false,
      isPlaying: false,

      initGame(playerName, difficulty, mode) {
        const save = buildInitialSave(playerName, difficulty, mode);
        set({ save, currentCase: null, currentEvent: null, showFeedback: false, isPlaying: true });
      },

      setCurrentCase(gameCase) {
        set({ currentCase: gameCase });
      },

      loadGame() {
        // El middleware `persist` ya restaura el estado automáticamente.
        // Este método es para uso explícito si se necesita forzar la recarga.
        const stored = localStorage.getItem(SAVE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.state?.save) {
              set({ save: parsed.state.save, isPlaying: true });
            }
          } catch {
            // partida corrupta — no hacer nada
          }
        }
      },

      saveGame() {
        set((state) => {
          if (!state.save) return {};
          return {
            save: { ...state.save, updatedAt: new Date().toISOString() },
          };
        });
        // zustand/persist guarda automáticamente en cada set()
      },

      resolveCase(caseId, optionId) {
        set((state) => {
          const { save, currentCase } = state;
          if (!save || !currentCase || currentCase.id !== caseId) return {};

          const option = currentCase.options.find((o) => o.id === optionId);
          if (!option) return {};

          const newIndicators = applyDelta(save.indicators, option);
          const gameOverCheck = isGameOver(newIndicators);

          const newXP = save.xp + option.xpReward;
          const newRank = getRankForXP(newXP);

          const oldStats = save.statistics;
          const newStats: GameStatistics = {
            ...oldStats,
            totalCasesResolved: oldStats.totalCasesResolved + 1,
            correctDecisions: oldStats.correctDecisions + (option.isCorrect ? 1 : 0),
            corruptDecisions: oldStats.corruptDecisions + (!option.isCorrect && option.delta.legality && option.delta.legality < -5 ? 1 : 0),
            decisionsByCategory: {
              ...oldStats.decisionsByCategory,
              [currentCase.category]: (oldStats.decisionsByCategory[currentCase.category] ?? 0) + 1,
            },
          };

          const indexes = computeIndexes(newStats, newIndicators);

          const updatedSave: GameSave = {
            ...save,
            indicators: newIndicators,
            xp: newXP,
            currentRank: newRank,
            resolvedCaseIds: [...save.resolvedCaseIds, caseId],
            statistics: { ...newStats, ...indexes },
            isGameOver: gameOverCheck.over,
            gameOverReason: gameOverCheck.reason,
            updatedAt: new Date().toISOString(),
          };

          return {
            save: updatedSave,
            currentCase: null,
            showFeedback: true,
            lastFeedback: option.educationalFeedback,
            lastChoiceCorrect: option.isCorrect,
          };
        });
      },

      dismissFeedback() {
        set({ showFeedback: false, lastFeedback: '', lastChoiceCorrect: false });
      },

      triggerRandomEvent(event: RandomEvent) {
        set((state) => {
          if (!state.save) return {};
          // Aplica efecto inmediato
          const newIndicators: GameIndicators = {
            citizenSatisfaction: clamp(state.save.indicators.citizenSatisfaction + (event.immediateEffect.citizenSatisfaction ?? 0), 0, 100),
            budget: clamp(state.save.indicators.budget + (event.immediateEffect.budget ?? 0), 0, 100),
            legality: clamp(state.save.indicators.legality + (event.immediateEffect.legality ?? 0), 0, 100),
            institutionalReputation: clamp(state.save.indicators.institutionalReputation + (event.immediateEffect.institutionalReputation ?? 0), 0, 100),
          };
          const gameOverCheck = isGameOver(newIndicators);
          return {
            currentEvent: event,
            save: {
              ...state.save,
              indicators: newIndicators,
              isGameOver: gameOverCheck.over,
              gameOverReason: gameOverCheck.reason,
            },
          };
        });
      },

      resolveEvent(eventId, optionId) {
        set((state) => {
          const { save, currentEvent } = state;
          if (!save || !currentEvent || currentEvent.id !== eventId) return {};

          let newIndicators = { ...save.indicators };
          let feedback = currentEvent.educationalNote;

          if (optionId && currentEvent.options) {
            const option = currentEvent.options.find((o) => o.id === optionId);
            if (option) {
              newIndicators = applyDelta(newIndicators, option);
              feedback = option.educationalFeedback;
            }
          }

          const gameOverCheck = isGameOver(newIndicators);
          return {
            currentEvent: null,
            save: { ...save, indicators: newIndicators, isGameOver: gameOverCheck.over, gameOverReason: gameOverCheck.reason },
            showFeedback: true,
            lastFeedback: feedback,
            lastChoiceCorrect: true,
          };
        });
      },

      advanceDay() {
        set((state) => {
          if (!state.save) return {};
          const newDay = state.save.currentDay + 120; // 120 días por caso → ~12 casos por campaña
          const newYear = newDay > 365 ? state.save.currentYear + 1 : state.save.currentYear;
          const dayReset = newDay > 365 ? (newDay - 365) : newDay;

          // Victoria en modo campaña al completar 4 años
          if (state.save.gameMode === 'campaign' && newYear > 4) {
            return {
              save: {
                ...state.save,
                currentDay: dayReset,
                currentYear: newYear,
                isGameOver: true,
                isVictory: true,
                gameOverReason: '¡Has completado exitosamente tu mandato de 4 años como funcionario público!',
                updatedAt: new Date().toISOString(),
              },
            };
          }

          return {
            save: {
              ...state.save,
              currentDay: dayReset,
              currentYear: newYear,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      endGame(reason: string, victory = true) {
        set((state) => {
          if (!state.save || state.save.isGameOver) return {};
          return {
            save: {
              ...state.save,
              isGameOver: true,
              isVictory: victory,
              gameOverReason: reason,
              updatedAt: new Date().toISOString(),
            },
            currentCase: null,
            currentEvent: null,
            showFeedback: false,
          };
        });
      },

      resetGame() {
        set({
          save: null,
          currentCase: null,
          currentEvent: null,
          showFeedback: false,
          lastFeedback: '',
          lastChoiceCorrect: false,
          isPlaying: false,
        });
      },
    }),
    {
      name: SAVE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ save: state.save }),
    }
  )
);
