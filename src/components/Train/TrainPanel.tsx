import useGameStore from '@/store/useGameStore';
import CarriageCard from './CarriageCard';
import { getTrainLoadPercentage, getTotalLoad, getTotalCapacity } from '@/engine/loadingSystem';
import { canDispatch as checkCanDispatch } from '@/engine/dispatchSystem';
import { Train as TrainIcon, AlertCircle } from 'lucide-react';

export default function TrainPanel() {
  const { train, dispatchTrain, gamePhase, isAnimating, moves, currentOrder, fuelMix, dispatchBlockReason } = useGameStore();

  const loadPercent = getTrainLoadPercentage(train);
  const totalLoad = getTotalLoad(train);
  const totalCapacity = getTotalCapacity(train);

  const { canDispatch: ready, reason } = currentOrder
    ? checkCanDispatch(train, fuelMix, currentOrder)
    : { canDispatch: false, reason: '等待订单' };
  const canDispatch = ready && gamePhase === 'playing' && !isAnimating;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 shadow-lg border-2 border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <TrainIcon className="w-6 h-6 text-amber-700" />
        <h3 className="text-lg font-bold text-amber-900">{train.name}</h3>
        <span className="text-sm text-amber-600 ml-auto">
          {totalLoad}/{totalCapacity} ({Math.round(loadPercent)}%)
        </span>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {train.carriages.map((carriage) => (
            <CarriageCard key={carriage.id} carriage={carriage} />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 rounded-full" />
      </div>

      {dispatchBlockReason && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm font-medium">{dispatchBlockReason}</p>
        </div>
      )}

      {!ready && !dispatchBlockReason && totalLoad > 0 && gamePhase === 'playing' && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-orange-600 text-sm font-medium">{reason}</p>
        </div>
      )}

      <button
        onClick={dispatchTrain}
        disabled={!canDispatch}
        className={`w-full mt-4 py-3 px-6 rounded-xl font-bold text-white text-lg
          transition-all duration-200 transform
          ${canDispatch
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 cursor-not-allowed'
          }`}
      >
        🚂 发车！
      </button>

      {moves <= 0 && gamePhase === 'playing' && (
        <p className="text-center text-red-500 text-sm mt-2 font-medium">
          步数已用完，请发车结束本局
        </p>
      )}
    </div>
  );
}
