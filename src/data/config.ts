import { CandyType, Station, Train, BOARD_SIZE, SyrupTank, FuelMix, SyrupType } from '@/types';

export const CANDY_CONFIG: Record<CandyType, { name: string; color: string; points: number; emoji: string }> = {
  strawberry: { name: '草莓糖', color: '#FF6B9D', points: 10, emoji: '🍓' },
  lemon: { name: '柠檬糖', color: '#FFD93D', points: 10, emoji: '🍋' },
  mint: { name: '薄荷糖', color: '#6BCB77', points: 10, emoji: '🍀' },
  blueberry: { name: '蓝莓糖', color: '#4D96FF', points: 10, emoji: '🫐' },
  grape: { name: '葡萄糖', color: '#9B59B6', points: 10, emoji: '🍇' },
  rainbow: { name: '彩虹糖', color: 'linear-gradient(135deg, #FF6B9D, #FFD93D, #6BCB77, #4D96FF, #9B59B6)', points: 50, emoji: '🌈' },
  bomb: { name: '炸弹糖', color: '#FF4757', points: 30, emoji: '💣' },
};

export const SYRUP_CONFIG: Record<SyrupType, {
  name: string;
  color: string;
  emoji: string;
  sweetness: number;
  freshness: number;
  richness: number;
}> = {
  strawberry: { name: '草莓糖浆', color: '#FF6B9D', emoji: '🍓', sweetness: 10, freshness: 3, richness: 7 },
  lemon: { name: '柠檬糖浆', color: '#FFD93D', emoji: '🍋', sweetness: 6, freshness: 9, richness: 3 },
  mint: { name: '薄荷糖浆', color: '#6BCB77', emoji: '🍀', sweetness: 3, freshness: 10, richness: 4 },
  blueberry: { name: '蓝莓糖浆', color: '#4D96FF', emoji: '🫐', sweetness: 8, freshness: 5, richness: 9 },
  grape: { name: '葡萄糖浆', color: '#9B59B6', emoji: '🍇', sweetness: 9, freshness: 4, richness: 8 },
};

export const CANDY_TO_SYRUP: Record<CandyType, SyrupType | null> = {
  strawberry: 'strawberry',
  lemon: 'lemon',
  mint: 'mint',
  blueberry: 'blueberry',
  grape: 'grape',
  rainbow: null,
  bomb: null,
};

export const SYRUP_TANK_CAPACITY = 100;

export const FUEL_CONFIG = {
  MIN_FUEL_PER_DISPATCH: 5,
  SHORT_DISTANCE_FUEL: 10,
  MEDIUM_DISTANCE_FUEL: 25,
  LONG_DISTANCE_FUEL: 50,
  SYRUP_PER_CANDY: 1,
  EXTRACT_BONUS_4MATCH: 2,
  EXTRACT_BONUS_5MATCH: 4,
  MAX_SWEETNESS_SPEED_PENALTY: 0.4,
  SWEETNESS_THRESHOLD: 7,
  PERFECT_FRESHNESS_MIN: 5,
  PERFECT_FRESHNESS_MAX: 8,
  PERFECT_BALANCE_BONUS: 0.25,
  TOO_SWEET_PENALTY: 0.15,
  UNBALANCED_PENALTY: 0.1,
};

export const STATIONS: Station[] = [
  {
    id: 'candy-town',
    name: '糖果小镇',
    reputationRequired: 0,
    themeColor: '#FF6B9D',
    description: '甜蜜的起点，适合新手列车长',
  },
  {
    id: 'lemon-estate',
    name: '柠檬庄园',
    reputationRequired: 100,
    themeColor: '#FFD93D',
    description: '酸爽的柠檬订单，需要更多技巧',
  },
  {
    id: 'mint-forest',
    name: '薄荷森林',
    reputationRequired: 300,
    themeColor: '#6BCB77',
    description: '急单频发的森林车站',
  },
  {
    id: 'blueberry-port',
    name: '蓝莓港口',
    reputationRequired: 600,
    themeColor: '#4D96FF',
    description: '大额订单的港口贸易站',
  },
  {
    id: 'grape-castle',
    name: '葡萄城堡',
    reputationRequired: 1000,
    themeColor: '#9B59B6',
    description: '皇家级别的复杂订单',
  },
];

export const INITIAL_TRAIN: Train = {
  id: 'candy-express',
  name: '糖果快车',
  carriages: [
    { id: 'car-1', candyType: 'strawberry', capacity: 20, currentLoad: 0 },
    { id: 'car-2', candyType: 'lemon', capacity: 20, currentLoad: 0 },
    { id: 'car-3', candyType: 'mint', capacity: 20, currentLoad: 0 },
    { id: 'car-4', candyType: 'blueberry', capacity: 20, currentLoad: 0 },
    { id: 'car-5', candyType: 'grape', capacity: 20, currentLoad: 0 },
  ],
};

export const GAME_CONFIG = {
  BOARD_SIZE,
  INITIAL_MOVES: 30,
  COMBO_BONUS_MULTIPLIER: 0.5,
  MATCH_MIN: 3,
  FOUR_MATCH_SPECIAL: 'bomb' as const,
  FIVE_MATCH_SPECIAL: 'rainbow' as const,
  DISPATCH_BASE_REWARD: 50,
  MISMATCH_PENALTY_RATE: 0.3,
  URGENT_BONUS_RATE: 0.5,
  REPUTATION_PER_SUCCESS: 10,
  REPUTATION_PER_FAIL: -5,
  LOAD_PER_MATCH: 1,
};

export const BASIC_SYRUP_TYPES: SyrupType[] = ['strawberry', 'lemon', 'mint', 'blueberry', 'grape'];

export function createInitialSyrupTanks(): SyrupTank[] {
  return BASIC_SYRUP_TYPES.map(type => ({
    type,
    amount: 0,
    capacity: SYRUP_TANK_CAPACITY,
  }));
}

export function createEmptyFuelMix(): FuelMix {
  return {
    strawberry: 0,
    lemon: 0,
    mint: 0,
    blueberry: 0,
    grape: 0,
  };
}
