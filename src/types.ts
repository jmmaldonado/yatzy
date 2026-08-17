export type GameMode = 'digital' | 'tracker';

export type Category =
  // Upper Section
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  // Lower Section
  | 'one_pair'
  | 'two_pairs'
  | 'three_of_a_kind'
  | 'four_of_a_kind'
  | 'small_straight'
  | 'large_straight'
  | 'full_house'
  | 'chance'
  | 'yatzy';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string; // Tailwind color theme identifier (e.g. 'emerald', 'blue', 'amber', 'rose', 'purple')
  scores: Partial<Record<Category, number>>;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  shortName: string;
  description: string;
  section: 'upper' | 'lower';
  example: string;
  maxScore: number;
}

export type AppTheme = 'felt' | 'dark' | 'light' | 'wood';

export interface SavedPlayerConfig {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface SavedPlayersProfile {
  playerCount: number;
  players: SavedPlayerConfig[];
  preferredMode?: GameMode;
}

export interface MatchPlayerSummary {
  id: string;
  name: string;
  avatar: string;
  color: string;
  scores: Partial<Record<Category, number>>;
  upperSum: number;
  upperBonus: number;
  lowerSum: number;
  grandTotal: number;
}

export interface MatchRecord {
  id: string;
  date: string; // ISO string
  mode: GameMode;
  round: number; // 1 to 15
  isCompleted: boolean;
  players: MatchPlayerSummary[];
  winner: {
    id: string;
    name: string;
    avatar: string;
    color: string;
    grandTotal: number;
  } | null;
  isTie?: boolean;
}

export interface GameState {
  mode: GameMode;
  players: Player[];
  currentPlayerIndex: number;
  round: number; // 1 to 15
  dice: number[]; // 5 numbers (1-6)
  held: boolean[]; // 5 booleans
  rollsLeft: number; // 3, 2, 1, 0
  isRolling: boolean;
  selectedCategory: Category | null;
  isGameOver: boolean;
  soundEnabled: boolean;
  smartRecommendations: boolean;
  theme: AppTheme;
}
