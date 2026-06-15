export type CandyType =
  | 'strawberry'
  | 'lemon'
  | 'mint'
  | 'blueberry'
  | 'grape'
  | 'rainbow'
  | 'bomb';

export type SyrupType =
  | 'strawberry'
  | 'lemon'
  | 'mint'
  | 'blueberry'
  | 'grape';

export type SpecialCandyType = 'rainbow' | 'bomb' | null;

export interface SyrupTank {
  type: SyrupType;
  amount: number;
  capacity: number;
}

export interface FuelMix {
  strawberry: number;
  lemon: number;
  mint: number;
  blueberry: number;
  grape: number;
}

export interface FuelAnalysis {
  totalFuel: number;
  sweetness: number;
  freshness: number;
  richness: number;
  balanceScore: number;
  speedModifier: number;
  efficiencyModifier: number;
  status: 'insufficient' | 'too_sweet' | 'perfect' | 'unbalanced';
}

export interface Candy {
  id: string;
  type: CandyType;
  row: number;
  col: number;
  isSpecial: boolean;
  specialType: SpecialCandyType;
  isMatched: boolean;
  isFalling: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface MatchResult {
  candies: Candy[];
  positions: Position[];
  matchType: 'horizontal' | 'vertical' | 'both' | 'special';
  specialGenerated: SpecialCandyType;
  specialPosition: Position | null;
}

export interface Carriage {
  id: string;
  candyType: CandyType;
  capacity: number;
  currentLoad: number;
}

export interface Train {
  id: string;
  name: string;
  carriages: Carriage[];
}

export interface OrderItem {
  candyType: CandyType;
  quantity: number;
}

export interface StationOrder {
  id: string;
  stationId: string;
  stationName: string;
  items: OrderItem[];
  reward: number;
  penalty: number;
  isUrgent: boolean;
  urgentBonus: number;
  fuelRequired: number;
  distance: 'short' | 'medium' | 'long';
}

export interface Station {
  id: string;
  name: string;
  reputationRequired: number;
  themeColor: string;
  description: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  coins: number;
  reputation: number;
  level: number;
  unlockedStations: string[];
}

export interface GameState {
  board: (Candy | null)[][];
  selectedCandy: Position | null;
  score: number;
  moves: number;
  combo: number;
  maxCombo: number;
  train: Train;
  currentOrder: StationOrder | null;
  currentStationId: string;
  isAnimating: boolean;
  gamePhase: 'playing' | 'dispatching' | 'result' | 'gameover';
  dispatchResult: DispatchResult | null;
  syrupTanks: SyrupTank[];
  fuelMix: FuelMix;
}

export interface DispatchResult {
  success: boolean;
  matchRate: number;
  successThreshold: number;
  reward: number;
  penalty: number;
  mismatches: OrderItem[];
  correctItems: OrderItem[];
  reputationChange: number;
  fuelUsed: FuelMix | null;
  fuelAnalysis: FuelAnalysis | null;
  fuelBonus: number;
  fuelPenalty: number;
  speedModifier: number;
  efficiencyModifier: number;
}

export interface StatsStep {
  id: string;
  date: string;
  totalMoves: number;
  bestMoves: number;
  gamesPlayed: number;
}

export interface StatsCombo {
  id: string;
  date: string;
  totalCombos: number;
  maxCombo: number;
  avgCombo: number;
}

export interface StatsMismatch {
  id: string;
  date: string;
  mismatchCount: number;
  totalPenalty: number;
  dispatches: number;
}

export interface StatsUrgent {
  id: string;
  date: string;
  urgentCount: number;
  successCount: number;
  successRate: number;
}

export interface StatsReputation {
  id: string;
  date: string;
  reputation: number;
  changeAmount: number;
}

export interface AllStats {
  steps: StatsStep[];
  combos: StatsCombo[];
  mismatches: StatsMismatch[];
  urgents: StatsUrgent[];
  reputations: StatsReputation[];
}

export const BOARD_SIZE = 8;
export const BASIC_CANDY_TYPES: CandyType[] = ['strawberry', 'lemon', 'mint', 'blueberry', 'grape'];
