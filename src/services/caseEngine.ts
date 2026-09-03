import type { GameCase, PlayerRank, Difficulty, CaseCategory } from '@/types';
import { randomItem, weightedRandom } from '@/utils/math';

// Importación estática de todos los bloques de casos
import transparencyCases from '@/data/cases/transparency.json';
import digitalGovCases from '@/data/cases/digital-government.json';
import cybersecCases from '@/data/cases/cybersecurity.json';
import ethicsCases from '@/data/cases/ethics-corruption.json';
import aiGovCases from '@/data/cases/ai-government.json';
import citizenPartCases from '@/data/cases/citizen-participation.json';
import dataProtCases from '@/data/cases/data-protection.json';
import publicAdminCases from '@/data/cases/public-administration.json';
import syllabusCases from '@/data/cases/syllabus-cases.json';
import extraCases from '@/data/cases/extra-cases.json';
import newCases from '@/data/cases/new-cases.json';
import lotdaCases from '@/data/cases/lotda-cases.json';

const ALL_CASES: GameCase[] = [
  ...(transparencyCases as GameCase[]),
  ...(digitalGovCases as GameCase[]),
  ...(cybersecCases as GameCase[]),
  ...(ethicsCases as GameCase[]),
  ...(aiGovCases as GameCase[]),
  ...(citizenPartCases as GameCase[]),
  ...(dataProtCases as GameCase[]),
  ...(publicAdminCases as GameCase[]),
  ...(syllabusCases as GameCase[]),
  ...(extraCases as GameCase[]),
  ...(newCases as GameCase[]),
  ...(lotdaCases as GameCase[]),
];

const RANK_ORDER: PlayerRank[] = [
  'auxiliary',
  'analyst',
  'coordinator',
  'director',
  'viceminister',
  'minister',
];

function rankIndex(rank: PlayerRank): number {
  return RANK_ORDER.indexOf(rank);
}

export function getAvailableCases(
  currentRank: PlayerRank,
  resolvedIds: string[],
  difficulty: Difficulty
): GameCase[] {
  const ri = rankIndex(currentRank);
  return ALL_CASES.filter((c) => {
    if (resolvedIds.includes(c.id)) return false;
    if (rankIndex(c.requiredRank) > ri) return false;
    if (difficulty === 'easy' && c.difficulty === 'expert') return false;
    if (difficulty === 'normal' && c.difficulty === 'expert') return false;
    return true;
  });
}

export function pickNextCase(
  currentRank: PlayerRank,
  resolvedIds: string[],
  difficulty: Difficulty,
  lastCategory?: CaseCategory
): GameCase | null {
  const pool = getAvailableCases(currentRank, resolvedIds, difficulty);
  if (pool.length === 0) return null;

  // Evitar repetir la misma categoría consecutivamente
  const diversePool = lastCategory
    ? pool.filter((c) => c.category !== lastCategory)
    : pool;

  const finalPool = diversePool.length > 0 ? diversePool : pool;

  // En modo experto, priorizar casos difíciles
  if (difficulty === 'expert') {
    const hard = finalPool.filter((c) => c.difficulty === 'hard' || c.difficulty === 'expert');
    if (hard.length > 0) return randomItem(hard);
  }

  // Pesos por dificultad del caso según dificultad del juego
  const weights = finalPool.map((c) => {
    const base = { easy: 1, normal: 2, hard: 3, expert: 4 }[c.difficulty];
    const diffMultiplier = difficulty === 'easy' ? (c.difficulty === 'easy' ? 3 : 1) : 1;
    return base * diffMultiplier;
  });

  return weightedRandom(finalPool, weights);
}

export function getAllCases(): GameCase[] {
  return ALL_CASES;
}

export function getCaseById(id: string): GameCase | undefined {
  return ALL_CASES.find((c) => c.id === id);
}

export function getCasesByCategory(category: CaseCategory): GameCase[] {
  return ALL_CASES.filter((c) => c.category === category);
}
