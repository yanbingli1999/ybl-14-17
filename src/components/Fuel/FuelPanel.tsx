import useGameStore from '@/store/useGameStore';
import { analyzeFuel, getFuelStatusText, getFuelStatusColor, getTotalFuel, getDistanceText } from '@/engine/fuelSystem';
import { BASIC_SYRUP_TYPES } from '@/data/config';
import SyrupTankCard from './SyrupTankCard';
import { SyrupType } from '@/types';
import { Droplets, Gauge, Zap, Leaf, Target, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';

export default function FuelPanel() {
  const {
    syrupTanks,
    fuelMix,
    currentOrder,
    addFuelToMix,
    removeFuelFromMix,
    returnAllFuelToTanks,
    clearAllFuel,
  } = useGameStore();

  const analysis = analyzeFuel(fuelMix);
  const totalFuel = getTotalFuel(fuelMix);
  const statusColor = getFuelStatusColor(analysis.status);
  const statusText = getFuelStatusText(analysis.status);

  const fuelRequired = currentOrder?.fuelRequired || 0;
  const fuelProgress = fuelRequired > 0 ? Math.min((totalFuel / fuelRequired) * 100, 100) : 0;
  const hasEnoughFuel = totalFuel >= fuelRequired;

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 shadow-lg border-2 border-cyan-200">
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="w-5 h-5 text-cyan-700" />
        <h3 className="text-lg font-bold text-cyan-900">糖浆燃料站</h3>
      </div>

      {currentOrder && (
        <div className="mb-3 p-2 bg-white/70 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 flex items-center gap-1">
              <Target className="w-3 h-3" />
              本次行程: <b>{getDistanceText(currentOrder.distance)}</b>
            </span>
            <span className={`font-bold ${hasEnoughFuel ? 'text-green-600' : 'text-red-500'}`}>
              {totalFuel}/{fuelRequired}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${fuelProgress}%`,
                backgroundColor: hasEnoughFuel ? '#6BCB77' : '#FF9F43',
              }}
            />
          </div>
        </div>
      )}

      <div className="mb-3 p-3 bg-white/70 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">燃料状态</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: statusColor }}
          >
            {statusText}
          </span>
        </div>

        {analysis.status !== 'insufficient' ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-pink-500" />
              <span className="text-gray-600">甜度:</span>
              <span className="font-semibold" style={{ color: analysis.sweetness > 7 ? '#FF9F43' : '#6BCB77' }}>
                {analysis.sweetness.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Leaf className="w-3 h-3 text-green-500" />
              <span className="text-gray-600">清爽:</span>
              <span className="font-semibold" style={{ color: analysis.freshness >= 5 && analysis.freshness <= 8 ? '#6BCB77' : '#FFD93D' }}>
                {analysis.freshness.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-gray-600">速度:</span>
              <span className={`font-semibold ${analysis.speedModifier >= 1 ? 'text-green-600' : 'text-orange-500'}`}>
                {Math.round(analysis.speedModifier * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-blue-500" />
              <span className="text-gray-600">效率:</span>
              <span className={`font-semibold ${analysis.efficiencyModifier >= 1 ? 'text-green-600' : 'text-orange-500'}`}>
                {Math.round(analysis.efficiencyModifier * 100)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>加入糖浆调配燃料</span>
          </div>
        )}

        {analysis.status !== 'insufficient' && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">平衡度</span>
              <span className="font-bold" style={{ color: analysis.balanceScore >= 60 ? '#6BCB77' : analysis.balanceScore >= 40 ? '#FFD93D' : '#FF9F43' }}>
                {analysis.balanceScore}分
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${analysis.balanceScore}%`,
                  backgroundColor: analysis.balanceScore >= 60 ? '#6BCB77' : analysis.balanceScore >= 40 ? '#FFD93D' : '#FF9F43',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">糖浆罐</span>
          <div className="flex gap-1">
            <button
              onClick={returnAllFuelToTanks}
              disabled={totalFuel <= 0}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all
                ${totalFuel > 0
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <RotateCcw className="w-3 h-3" />
              退回
            </button>
            <button
              onClick={clearAllFuel}
              disabled={totalFuel <= 0}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all
                ${totalFuel > 0
                  ? 'bg-red-100 hover:bg-red-200 text-red-700 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Trash2 className="w-3 h-3" />
              清空
            </button>
          </div>
        </div>

        <div className="flex justify-between gap-1 overflow-x-auto pb-1">
          {BASIC_SYRUP_TYPES.map((type: SyrupType) => {
            const tank = syrupTanks.find(t => t.type === type);
            if (!tank) return null;
            return (
              <SyrupTankCard
                key={type}
                tank={tank}
                inMix={fuelMix[type]}
                showControls
                onAddFuel={(amt) => addFuelToMix(type, amt)}
                onRemoveFuel={(amt) => removeFuelFromMix(type, amt)}
              />
            );
          })}
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-0.5 bg-white/50 rounded-lg p-2">
        <p>💡 <b>4连消/5连消</b>可额外提炼糖浆</p>
        <p>🍬 甜度过高会降低速度，适中清爽度提升效率</p>
        <p>🚀 完美配比可获得额外奖励与信誉</p>
      </div>
    </div>
  );
}
