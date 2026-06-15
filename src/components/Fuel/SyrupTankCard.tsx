import { SyrupTank } from '@/types';
import { SYRUP_CONFIG } from '@/data/config';

interface SyrupTankCardProps {
  tank: SyrupTank;
  onAddFuel?: (amount: number) => void;
  onRemoveFuel?: (amount: number) => void;
  inMix?: number;
  showControls?: boolean;
}

export default function SyrupTankCard({
  tank,
  onAddFuel,
  onRemoveFuel,
  inMix = 0,
  showControls = false,
}: SyrupTankCardProps) {
  const config = SYRUP_CONFIG[tank.type];
  const percent = (tank.amount / tank.capacity) * 100;
  const inMixPercent = inMix > 0 ? (inMix / tank.capacity) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-1 p-2 bg-white/70 rounded-xl border border-white shadow-sm">
      <div className="text-lg">{config.emoji}</div>
      <div className="text-xs font-semibold text-gray-700 text-center">{config.name}</div>

      <div className="relative w-8 h-20 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-300"
          style={{
            height: `${percent}%`,
            backgroundColor: config.color,
            opacity: 0.85,
          }}
        />
        {inMixPercent > 0 && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-white/80"
            style={{ bottom: `${percent}%` }}
          >
            <div
              className="w-full transition-all duration-300"
              style={{
                height: `${inMixPercent}%`,
                backgroundColor: config.color,
                opacity: 0.4,
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 4px, transparent 4px, transparent 8px)',
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 shadow-inner pointer-events-none rounded-lg" />
      </div>

      <div className="text-xs font-bold" style={{ color: config.color }}>
        {tank.amount}
        {inMix > 0 && <span className="text-gray-400"> (+{inMix})</span>}
      </div>

      {showControls && (
        <div className="flex gap-1 mt-1">
          <button
            onClick={() => onAddFuel?.(1)}
            disabled={tank.amount <= 0}
            className={`w-7 h-7 rounded-lg text-sm font-bold transition-all
              ${tank.amount > 0
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            +
          </button>
          <button
            onClick={() => onAddFuel?.(5)}
            disabled={tank.amount < 5}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all
              ${tank.amount >= 5
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            +5
          </button>
          <button
            onClick={() => onRemoveFuel?.(1)}
            disabled={inMix <= 0}
            className={`w-7 h-7 rounded-lg text-sm font-bold transition-all
              ${inMix > 0
                ? 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            -
          </button>
        </div>
      )}
    </div>
  );
}
