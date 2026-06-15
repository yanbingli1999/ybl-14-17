import {
  SyrupTank,
  FuelMix,
  FuelAnalysis,
  SyrupType,
  CandyType,
  MatchResult,
  BASIC_CANDY_TYPES,
} from '@/types';
import {
  SYRUP_CONFIG,
  CANDY_TO_SYRUP,
  FUEL_CONFIG,
  BASIC_SYRUP_TYPES,
  SYRUP_TANK_CAPACITY,
  createEmptyFuelMix,
} from '@/data/config';

export function extractSyrupFromMatches(
  matches: MatchResult[],
  currentTanks: SyrupTank[]
): { tanks: SyrupTank[]; extracted: Record<SyrupType, number> } {
  const tanks = currentTanks.map(t => ({ ...t }));
  const extracted: Record<string, number> = {};

  for (const syrupType of BASIC_SYRUP_TYPES) {
    extracted[syrupType] = 0;
  }

  for (const match of matches) {
    const matchLength = match.candies.length;
    let bonus = FUEL_CONFIG.SYRUP_PER_CANDY;

    if (matchLength >= 5) {
      bonus += FUEL_CONFIG.EXTRACT_BONUS_5MATCH;
    } else if (matchLength >= 4) {
      bonus += FUEL_CONFIG.EXTRACT_BONUS_4MATCH;
    }

    for (const candy of match.candies) {
      if (candy.isSpecial) continue;

      const syrupType = CANDY_TO_SYRUP[candy.type];
      if (!syrupType) continue;

      const tank = tanks.find(t => t.type === syrupType);
      if (!tank) continue;

      const availableSpace = tank.capacity - tank.amount;
      const toAdd = Math.min(bonus, availableSpace);
      tank.amount += toAdd;
      extracted[syrupType] += toAdd;
    }
  }

  return {
    tanks,
    extracted: extracted as Record<SyrupType, number>,
  };
}

export function addSyrupToTank(
  tanks: SyrupTank[],
  syrupType: SyrupType,
  amount: number
): SyrupTank[] {
  return tanks.map(tank => {
    if (tank.type !== syrupType) return tank;
    const newAmount = Math.min(tank.amount + amount, tank.capacity);
    return { ...tank, amount: newAmount };
  });
}

export function getTankAmount(tanks: SyrupTank[], syrupType: SyrupType): number {
  return tanks.find(t => t.type === syrupType)?.amount || 0;
}

export function getTotalSyrupInTanks(tanks: SyrupTank[]): number {
  return tanks.reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalFuel(fuelMix: FuelMix): number {
  return BASIC_SYRUP_TYPES.reduce((sum, type) => sum + fuelMix[type], 0);
}

export function getFuelTypeAmount(fuelMix: FuelMix, syrupType: SyrupType): number {
  return fuelMix[syrupType];
}

export function analyzeFuel(fuelMix: FuelMix): FuelAnalysis {
  const totalFuel = getTotalFuel(fuelMix);

  if (totalFuel < FUEL_CONFIG.MIN_FUEL_PER_DISPATCH) {
    return {
      totalFuel: 0,
      sweetness: 0,
      freshness: 0,
      richness: 0,
      balanceScore: 0,
      speedModifier: 0,
      efficiencyModifier: 0,
      status: 'insufficient',
    };
  }

  let weightedSweetness = 0;
  let weightedFreshness = 0;
  let weightedRichness = 0;

  for (const syrupType of BASIC_SYRUP_TYPES) {
    const amount = fuelMix[syrupType];
    if (amount === 0) continue;

    const config = SYRUP_CONFIG[syrupType];
    const weight = amount / totalFuel;
    weightedSweetness += config.sweetness * weight;
    weightedFreshness += config.freshness * weight;
    weightedRichness += config.richness * weight;
  }

  const usedTypes = BASIC_SYRUP_TYPES.filter(t => fuelMix[t] > 0).length;
  const typeBalance = usedTypes / BASIC_SYRUP_TYPES.length;

  const distribution: number[] = BASIC_SYRUP_TYPES.map(t => fuelMix[t] / totalFuel);
  const maxShare = Math.max(...distribution);
  const evenness = 1 - (maxShare - 1 / BASIC_SYRUP_TYPES.length) * (BASIC_SYRUP_TYPES.length / (BASIC_SYRUP_TYPES.length - 1));
  const evennessScore = Math.max(0, evenness);

  const balanceScore = (typeBalance * 0.4 + evennessScore * 0.6) * 100;

  let speedModifier = 1;
  let efficiencyModifier = 1;
  let status: FuelAnalysis['status'] = 'unbalanced';

  const freshnessIdeal = (FUEL_CONFIG.PERFECT_FRESHNESS_MIN + FUEL_CONFIG.PERFECT_FRESHNESS_MAX) / 2;
  const freshnessDeviation = Math.abs(weightedFreshness - freshnessIdeal);
  const freshnessScore = Math.max(0, 1 - freshnessDeviation / (freshnessIdeal - 1));

  const freshnessBonus = (freshnessScore - 0.5) * 0.2;
  efficiencyModifier += freshnessBonus;

  if (weightedSweetness > FUEL_CONFIG.SWEETNESS_THRESHOLD) {
    const excessRatio = (weightedSweetness - FUEL_CONFIG.SWEETNESS_THRESHOLD) / (10 - FUEL_CONFIG.SWEETNESS_THRESHOLD);
    speedModifier -= FUEL_CONFIG.MAX_SWEETNESS_SPEED_PENALTY * excessRatio;
    efficiencyModifier -= FUEL_CONFIG.TOO_SWEET_PENALTY * excessRatio;
    status = 'too_sweet';
  }

  if (
    weightedSweetness <= FUEL_CONFIG.SWEETNESS_THRESHOLD &&
    weightedFreshness >= FUEL_CONFIG.PERFECT_FRESHNESS_MIN &&
    weightedFreshness <= FUEL_CONFIG.PERFECT_FRESHNESS_MAX &&
    balanceScore >= 60
  ) {
    efficiencyModifier += FUEL_CONFIG.PERFECT_BALANCE_BONUS * freshnessScore;
    status = 'perfect';
  }

  if (status === 'unbalanced' && balanceScore < 40) {
    efficiencyModifier -= FUEL_CONFIG.UNBALANCED_PENALTY;
  }

  speedModifier = Math.max(0.5, Math.min(1, speedModifier));
  efficiencyModifier = Math.max(0.7, Math.min(1.3, efficiencyModifier));

  return {
    totalFuel,
    sweetness: Math.round(weightedSweetness * 10) / 10,
    freshness: Math.round(weightedFreshness * 10) / 10,
    richness: Math.round(weightedRichness * 10) / 10,
    balanceScore: Math.round(balanceScore),
    speedModifier: Math.round(speedModifier * 100) / 100,
    efficiencyModifier: Math.round(efficiencyModifier * 100) / 100,
    status,
  };
}

export function prepareFuelFromTanks(
  tanks: SyrupTank[],
  fuelMix: FuelMix,
  syrupType: SyrupType,
  amount: number
): { tanks: SyrupTank[]; fuelMix: FuelMix } {
  const tank = tanks.find(t => t.type === syrupType);
  if (!tank || amount <= 0) {
    return { tanks, fuelMix };
  }

  const actualAmount = Math.min(amount, tank.amount);
  if (actualAmount <= 0) {
    return { tanks, fuelMix };
  }

  const newTanks = tanks.map(t => {
    if (t.type !== syrupType) return t;
    return { ...t, amount: t.amount - actualAmount };
  });

  const newFuelMix = {
    ...fuelMix,
    [syrupType]: fuelMix[syrupType] + actualAmount,
  };

  return { tanks: newTanks, fuelMix: newFuelMix };
}

export function returnFuelToTanks(
  tanks: SyrupTank[],
  fuelMix: FuelMix
): { tanks: SyrupTank[]; fuelMix: FuelMix } {
  const newTanks = tanks.map(t => {
    const inMix = fuelMix[t.type];
    const space = t.capacity - t.amount;
    const returned = Math.min(inMix, space);
    return { ...t, amount: t.amount + returned };
  });

  return {
    tanks: newTanks,
    fuelMix: createEmptyFuelMix(),
  };
}

export function clearFuelMix(fuelMix: FuelMix): FuelMix {
  return createEmptyFuelMix();
}

export function canAffordFuel(
  totalFuel: number,
  distance: 'short' | 'medium' | 'long'
): boolean {
  switch (distance) {
    case 'short':
      return totalFuel >= FUEL_CONFIG.SHORT_DISTANCE_FUEL;
    case 'medium':
      return totalFuel >= FUEL_CONFIG.MEDIUM_DISTANCE_FUEL;
    case 'long':
      return totalFuel >= FUEL_CONFIG.LONG_DISTANCE_FUEL;
  }
}

export function getFuelRequired(distance: 'short' | 'medium' | 'long'): number {
  switch (distance) {
    case 'short':
      return FUEL_CONFIG.SHORT_DISTANCE_FUEL;
    case 'medium':
      return FUEL_CONFIG.MEDIUM_DISTANCE_FUEL;
    case 'long':
      return FUEL_CONFIG.LONG_DISTANCE_FUEL;
  }
}

export function getFuelStatusText(status: FuelAnalysis['status']): string {
  switch (status) {
    case 'insufficient':
      return '燃料不足';
    case 'too_sweet':
      return '甜度过高';
    case 'perfect':
      return '完美配比';
    case 'unbalanced':
      return '配比失衡';
  }
}

export function getFuelStatusColor(status: FuelAnalysis['status']): string {
  switch (status) {
    case 'insufficient':
      return '#FF4757';
    case 'too_sweet':
      return '#FF9F43';
    case 'perfect':
      return '#6BCB77';
    case 'unbalanced':
      return '#FFD93D';
  }
}

export function getDistanceText(distance: 'short' | 'medium' | 'long'): string {
  switch (distance) {
    case 'short':
      return '短途';
    case 'medium':
      return '中途';
    case 'long':
      return '长途';
  }
}
