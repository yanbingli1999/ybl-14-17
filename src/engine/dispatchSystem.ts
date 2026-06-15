import { Train, StationOrder, DispatchResult, OrderItem, CandyType, FuelMix, FuelAnalysis } from '@/types';
import { GAME_CONFIG } from '@/data/config';
import { getCandyLoad } from './loadingSystem';
import { analyzeFuel, canAffordFuel, getTotalFuel, getFuelStatusText } from './fuelSystem';

export function calculateDispatchResult(
  train: Train,
  order: StationOrder,
  fuelMix: FuelMix | null
): DispatchResult {
  const correctItems: OrderItem[] = [];
  const mismatches: OrderItem[] = [];
  let matchPoints = 0;
  let totalRequired = 0;

  for (const item of order.items) {
    const loaded = getCandyLoad(train, item.candyType);
    totalRequired += item.quantity;

    if (loaded >= item.quantity) {
      correctItems.push({ ...item });
      matchPoints += item.quantity;
    } else if (loaded > 0) {
      correctItems.push({ candyType: item.candyType, quantity: loaded });
      mismatches.push({ candyType: item.candyType, quantity: item.quantity - loaded });
      matchPoints += loaded;
    } else {
      mismatches.push({ ...item });
    }
  }

  for (const carriage of train.carriages) {
    const inOrder = order.items.find(i => i.candyType === carriage.candyType);
    if (!inOrder && carriage.currentLoad > 0) {
      mismatches.push({ candyType: carriage.candyType, quantity: carriage.currentLoad });
    }
  }

  const matchRate = totalRequired > 0 ? matchPoints / totalRequired : 0;

  let fuelAnalysis: FuelAnalysis | null = null;
  let fuelBonus = 0;
  let fuelPenalty = 0;
  let speedModifier = 1;
  let efficiencyModifier = 1;
  let successThreshold = 0.8;

  if (fuelMix) {
    fuelAnalysis = analyzeFuel(fuelMix);
    speedModifier = fuelAnalysis.speedModifier;
    efficiencyModifier = fuelAnalysis.efficiencyModifier;

    const hasEnoughFuel = canAffordFuel(fuelAnalysis.totalFuel, order.distance);

    if (!hasEnoughFuel) {
      fuelPenalty = Math.floor(order.reward * 0.3);
    }

    if (fuelAnalysis.status === 'perfect') {
      fuelBonus = Math.floor(order.reward * 0.2);
    } else if (fuelAnalysis.status === 'too_sweet') {
      fuelPenalty += Math.floor(order.reward * 0.1);
      const excessRatio = (fuelAnalysis.sweetness - 7) / 3;
      successThreshold = 0.8 + excessRatio * 0.15;
    } else if (fuelAnalysis.status === 'unbalanced') {
      fuelPenalty += Math.floor(order.reward * 0.05);
    }
  }

  const baseSuccess = matchRate >= successThreshold;
  const success = baseSuccess && (fuelMix === null || (fuelAnalysis && canAffordFuel(fuelAnalysis.totalFuel, order.distance)));

  let reward = 0;
  if (success) {
    reward = order.reward;
    if (order.isUrgent) {
      reward += Math.floor(order.reward * GAME_CONFIG.URGENT_BONUS_RATE);
    }
    reward += fuelBonus;
    reward = Math.floor(reward * efficiencyModifier);
  }

  let penalty = 0;
  if (mismatches.length > 0) {
    penalty = Math.floor(order.reward * GAME_CONFIG.MISMATCH_PENALTY_RATE) * mismatches.length;
    penalty = Math.min(penalty, order.penalty);
  }
  penalty += fuelPenalty;

  let reputationChange = success
    ? GAME_CONFIG.REPUTATION_PER_SUCCESS
    : GAME_CONFIG.REPUTATION_PER_FAIL;

  if (fuelMix && fuelAnalysis) {
    if (fuelAnalysis.status === 'perfect' && success) {
      reputationChange += 3;
    } else if (fuelAnalysis.status === 'insufficient' && !success) {
      reputationChange -= 2;
    }
  }

  return {
    success,
    matchRate,
    successThreshold: Math.round(successThreshold * 100),
    reward,
    penalty,
    mismatches,
    correctItems,
    reputationChange,
    fuelUsed: fuelMix,
    fuelAnalysis,
    fuelBonus,
    fuelPenalty,
    speedModifier,
    efficiencyModifier,
  };
}

export function canDispatch(
  train: Train,
  fuelMix: FuelMix | null,
  order: StationOrder
): { canDispatch: boolean; reason?: string } {
  const totalLoad = train.carriages.reduce((sum, c) => sum + c.currentLoad, 0);

  if (totalLoad <= 0) {
    return { canDispatch: false, reason: '列车尚未装载货物' };
  }

  if (fuelMix) {
    const totalFuel = getTotalFuel(fuelMix);
    if (!canAffordFuel(totalFuel, order.distance)) {
      return {
        canDispatch: false,
        reason: `燃料不足（需${order.fuelRequired}，当前${totalFuel}）`,
      };
    }
  }

  return { canDispatch: true };
}

export function getMatchColor(matchRate: number): string {
  if (matchRate >= 0.9) return '#6BCB77';
  if (matchRate >= 0.7) return '#FFD93D';
  if (matchRate >= 0.5) return '#FF9F43';
  return '#FF4757';
}
