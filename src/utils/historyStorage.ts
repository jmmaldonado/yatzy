import { Category, GameMode, MatchPlayerSummary, MatchRecord, Player, SavedPlayersProfile } from '../types';
import { calculatePlayerTotals } from './yatzyLogic';

export const STORAGE_KEYS = {
  CURRENT_GAME: 'yatzy_game_state_v3',
  MATCH_HISTORY: 'yatzy_match_history_v1',
  SAVED_PLAYERS: 'yatzy_saved_players_profile_v1',
};

// Fallback default player profile
export const DEFAULT_SAVED_PLAYERS: SavedPlayersProfile = {
  playerCount: 2,
  preferredMode: 'digital',
  players: [
    { id: '1', name: 'Player 1', avatar: '🎲', color: 'emerald' },
    { id: '2', name: 'Player 2', avatar: '👑', color: 'blue' },
    { id: '3', name: 'Player 3', avatar: '🦊', color: 'amber' },
    { id: '4', name: 'Player 4', avatar: '🦁', color: 'rose' },
  ],
};

/**
 * Load saved match history from localStorage
 */
export function loadMatchHistory(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load match history:', err);
    return [];
  }
}

/**
 * Save a new match or update an existing match record in history
 */
export function saveMatchRecord(record: MatchRecord): MatchRecord[] {
  try {
    const history = loadMatchHistory();
    // Check if record with same ID already exists
    const existingIndex = history.findIndex((m) => m.id === record.id);
    let updated: MatchRecord[];
    if (existingIndex >= 0) {
      updated = [...history];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...history];
    }
    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save match record:', err);
    return loadMatchHistory();
  }
}

/**
 * Delete a specific match record by ID
 */
export function deleteMatchRecord(id: string): MatchRecord[] {
  try {
    const history = loadMatchHistory();
    const updated = history.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete match record:', err);
    return loadMatchHistory();
  }
}

/**
 * Clear all match records
 */
export function clearAllMatchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
  } catch (err) {
    console.error('Failed to clear match history:', err);
  }
}

/**
 * Load saved player configuration (names, avatars, colors, playerCount)
 */
export function loadSavedPlayersProfile(): SavedPlayersProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PLAYERS);
    if (!raw) return DEFAULT_SAVED_PLAYERS;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
      return {
        playerCount: parsed.playerCount || 2,
        preferredMode: parsed.preferredMode || 'digital',
        players: parsed.players,
      };
    }
    return DEFAULT_SAVED_PLAYERS;
  } catch (err) {
    console.error('Failed to load saved players profile:', err);
    return DEFAULT_SAVED_PLAYERS;
  }
}

/**
 * Save player profile to localStorage
 */
export function savePlayersProfile(profile: SavedPlayersProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_PLAYERS, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save players profile:', err);
  }
}

/**
 * Creates a formatted MatchRecord object from current players and game mode
 */
export function createMatchRecordFromPlayers(
  players: Player[],
  mode: GameMode,
  round: number,
  customId?: string
): MatchRecord {
  const playerSummaries: MatchPlayerSummary[] = players.map((p) => {
    const totals = calculatePlayerTotals(p.scores);
    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      scores: { ...p.scores },
      upperSum: totals.upperSum,
      upperBonus: totals.upperBonus,
      lowerSum: totals.lowerSum,
      grandTotal: totals.grandTotal,
    };
  });

  // Rank players by grand total
  const sorted = [...playerSummaries].sort((a, b) => b.grandTotal - a.grandTotal);
  const isTie = sorted.length > 1 && sorted[0].grandTotal === sorted[1].grandTotal;
  const winnerSummary = sorted[0] || null;

  const allFinished = players.every((p) => {
    const totals = calculatePlayerTotals(p.scores);
    return totals.isComplete;
  });

  return {
    id: customId || `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toISOString(),
    mode,
    round,
    isCompleted: allFinished,
    players: playerSummaries,
    winner: winnerSummary
      ? {
          id: winnerSummary.id,
          name: winnerSummary.name,
          avatar: winnerSummary.avatar,
          color: winnerSummary.color,
          grandTotal: winnerSummary.grandTotal,
        }
      : null,
    isTie,
  };
}

/**
 * Compute global statistics from the match history
 */
export interface HistoryStats {
  totalMatches: number;
  completedMatches: number;
  highestScore: {
    score: number;
    playerName: string;
    avatar: string;
    date: string;
  } | null;
  leaderboard: Array<{
    name: string;
    avatar: string;
    color: string;
    wins: number;
    matchesPlayed: number;
    avgScore: number;
    highestScore: number;
  }>;
}

export function getHistoryStats(history: MatchRecord[]): HistoryStats {
  let totalMatches = history.length;
  let completedMatches = 0;
  let highestScore: HistoryStats['highestScore'] = null;

  const playerStatsMap: Record<
    string,
    {
      name: string;
      avatar: string;
      color: string;
      wins: number;
      matchesPlayed: number;
      totalScore: number;
      highestScore: number;
    }
  > = {};

  for (const match of history) {
    if (match.isCompleted) {
      completedMatches++;
    }

    // Process winner
    if (match.winner && !match.isTie) {
      const wKey = match.winner.name.toLowerCase().trim();
      if (!playerStatsMap[wKey]) {
        playerStatsMap[wKey] = {
          name: match.winner.name,
          avatar: match.winner.avatar,
          color: match.winner.color || 'emerald',
          wins: 0,
          matchesPlayed: 0,
          totalScore: 0,
          highestScore: 0,
        };
      }
      playerStatsMap[wKey].wins++;
    }

    // Process all players in the match
    for (const p of match.players) {
      const pKey = p.name.toLowerCase().trim();
      if (!playerStatsMap[pKey]) {
        playerStatsMap[pKey] = {
          name: p.name,
          avatar: p.avatar,
          color: p.color || 'emerald',
          wins: 0,
          matchesPlayed: 0,
          totalScore: 0,
          highestScore: 0,
        };
      }

      playerStatsMap[pKey].matchesPlayed++;
      playerStatsMap[pKey].totalScore += p.grandTotal;
      if (p.grandTotal > playerStatsMap[pKey].highestScore) {
        playerStatsMap[pKey].highestScore = p.grandTotal;
      }

      if (!highestScore || p.grandTotal > highestScore.score) {
        highestScore = {
          score: p.grandTotal,
          playerName: p.name,
          avatar: p.avatar,
          date: match.date,
        };
      }
    }
  }

  const leaderboard = Object.values(playerStatsMap)
    .map((item) => ({
      name: item.name,
      avatar: item.avatar,
      color: item.color,
      wins: item.wins,
      matchesPlayed: item.matchesPlayed,
      avgScore: item.matchesPlayed > 0 ? Math.round(item.totalScore / item.matchesPlayed) : 0,
      highestScore: item.highestScore,
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.highestScore - a.highestScore;
    });

  return {
    totalMatches,
    completedMatches,
    highestScore,
    leaderboard,
  };
}
