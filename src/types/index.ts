// ============================================================
// TIPOS CENTRALES DEL SISTEMA "EL BURÓCRATA"
// ============================================================

// --- Indicadores de estado del jugador ---
export interface GameIndicators {
  citizenSatisfaction: number; // 0–100
  budget: number;              // 0–100
  legality: number;            // 0–100
  institutionalReputation: number; // 0–100
}

// --- Modificadores que produce una decisión ---
export interface IndicatorDelta {
  citizenSatisfaction?: number;
  budget?: number;
  legality?: number;
  institutionalReputation?: number;
}

// --- Niveles de dificultad ---
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

// --- Rangos del funcionario ---
export type PlayerRank =
  | 'auxiliary'      // Auxiliar administrativo
  | 'analyst'        // Analista
  | 'coordinator'    // Coordinador
  | 'director'       // Director
  | 'viceminister'   // Viceministro
  | 'minister';      // Ministro

export interface RankInfo {
  id: PlayerRank;
  label: string;
  minXP: number;
  description: string;
  unlockedMechanics: string[];
}

// --- Categorías temáticas educativas ---
export type CaseCategory =
  | 'e-government'
  | 'digital-government'
  | 'public-administration'
  | 'transparency'
  | 'accountability'
  | 'open-data'
  | 'interoperability'
  | 'electronic-signature'
  | 'digital-procedures'
  | 'document-management'
  | 'citizen-participation'
  | 'data-protection'
  | 'cybersecurity'
  | 'public-ethics'
  | 'corruption'
  | 'state-modernization'
  | 'ai-government'
  | 'public-contracting'
  | 'budget-management';

// --- Opción de decisión dentro de un caso ---
export interface CaseOption {
  id: string;
  text: string;
  delta: IndicatorDelta;
  xpReward: number;
  educationalFeedback: string; // Explicación breve post-decisión
  isCorrect: boolean;          // Para exámenes y logros
  legalReference?: string;     // Referencia normativa opcional
}

// --- Tipo de NPC ---
export type NpcType =
  | 'citizen'
  | 'business'
  | 'journalist'
  | 'comptroller'
  | 'assembly'
  | 'minister'
  | 'mayor'
  | 'governor'
  | 'supplier'
  | 'ngo';

export interface NpcProfile {
  id: string;
  name: string;
  type: NpcType;
  avatar: string;        // emoji o path a sprite
  personality: string;
  trustLevel: number;    // 0–100, afecta cómo presenta el caso
}

// --- Caso / Solicitud ---
export interface GameCase {
  id: string;
  title: string;
  description: string;
  category: CaseCategory;
  npcId: string;
  requiredRank: PlayerRank;
  difficulty: Difficulty;
  options: CaseOption[];
  tags: string[];
  yearIntroduced?: number; // año de campaña donde aparece (1–4)
  timeLimit?: number;      // segundos para decidir (null = sin límite)
}

// --- Evento aleatorio ---
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  immediateEffect: IndicatorDelta;
  options?: CaseOption[];   // si el evento permite respuesta activa
  duration?: number;        // días de efecto continuo
  educationalNote: string;
}

// --- Logro ---
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementCondition {
  type:
    | 'casesResolved'
    | 'indicatorMin'
    | 'noCorruption'
    | 'rankReached'
    | 'yearsCompleted'
    | 'categoryMastery'
    | 'streakCorrect';
  value: number | string;
  extra?: Record<string, unknown>;
}

// --- Entrada del diario institucional ---
export interface JournalEntry {
  id: string;
  date: string;          // "Año 1, Día 15"
  headline: string;
  body: string;
  isTrue: boolean;       // noticias falsas vs verdaderas
  category: CaseCategory;
}

// --- Definición de nivel de campaña ---
export interface CampaignLevel {
  year: number;          // 1–4
  title: string;
  description: string;
  challengeDescription: string;
  examQuestions: ExamQuestion[];
  targetIndicators: Partial<GameIndicators>; // metas mínimas para pasar
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: CaseCategory;
}

// --- Estado completo del juego (guardado) ---
export interface GameSave {
  version: string;
  createdAt: string;
  updatedAt: string;
  playerName: string;
  difficulty: Difficulty;
  gameMode: 'campaign' | 'infinite';
  currentYear: number;   // 1–4
  currentDay: number;    // 1–365
  currentRank: PlayerRank;
  xp: number;
  indicators: GameIndicators;
  resolvedCaseIds: string[];
  unlockedAchievementIds: string[];
  journalEntries: JournalEntry[];
  statistics: GameStatistics;
  isGameOver: boolean;
  isVictory?: boolean;
  gameOverReason?: string;
}

export interface GameStatistics {
  totalCasesResolved: number;
  correctDecisions: number;
  corruptDecisions: number;
  transparencyIndex: number;
  efficiencyIndex: number;
  innovationIndex: number;
  citizenSatisfactionAvg: number;
  corruptionIndex: number;
  decisionsByCategory: Partial<Record<CaseCategory, number>>;
}

// --- Estado global del store de Zustand ---
export interface GameStore {
  save: GameSave | null;
  currentCase: GameCase | null;
  currentEvent: RandomEvent | null;
  showFeedback: boolean;
  lastFeedback: string;
  lastChoiceCorrect: boolean;
  isLoading: boolean;
  isPlaying: boolean;

  // Acciones
  initGame: (playerName: string, difficulty: Difficulty, mode: 'campaign' | 'infinite') => void;
  loadGame: () => void;
  saveGame: () => void;
  setCurrentCase: (gameCase: GameCase | null) => void;
  resolveCase: (caseId: string, optionId: string) => void;
  dismissFeedback: () => void;
  triggerRandomEvent: (event: RandomEvent) => void;
  resolveEvent: (eventId: string, optionId?: string) => void;
  advanceDay: () => void;
  endGame: (reason: string, victory?: boolean) => void;
  resetGame: () => void;
}

// --- Glosario ---
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: CaseCategory;
  relatedTerms: string[];
  source: string; // organismo o marco de referencia
}
