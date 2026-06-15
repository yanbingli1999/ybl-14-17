import useGameStore from '@/store/useGameStore';
import { CANDY_CONFIG, STATIONS } from '@/data/config';
import { getCandyLoad } from '@/engine/loadingSystem';
import { getDistanceText, getTotalFuel, canAffordFuel } from '@/engine/fuelSystem';
import { MapPin, Flame, Coins, AlertTriangle, Train as TrainIcon, Droplets } from 'lucide-react';

export default function StationOrderPanel() {
  const { currentOrder, train, currentStationId, profile, changeStation, fuelMix } = useGameStore();

  if (!currentOrder) return null;

  const station = STATIONS.find(s => s.id === currentStationId);
  const availableStations = STATIONS.filter(
    s => s.reputationRequired <= profile.reputation
  );

  const totalFuel = getTotalFuel(fuelMix);
  const hasEnoughFuel = canAffordFuel(totalFuel, currentOrder.distance);

  const distanceColor = currentOrder.distance === 'long' ? '#9B59B6' : currentOrder.distance === 'medium' ? '#FF9F43' : '#6BCB77';

  return (
    <div
      className="rounded-2xl p-4 shadow-lg border-2"
      style={{
        background: `linear-gradient(135deg, ${station?.themeColor}15, ${station?.themeColor}05)`,
        borderColor: station?.themeColor + '40',
      }}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <MapPin className="w-5 h-5" style={{ color: station?.themeColor }} />
        <h3 className="text-lg font-bold text-gray-800">{station?.name}</h3>
        <span
          className="flex items-center gap-1 px-2 py-0.5 text-white text-xs font-bold rounded-full"
          style={{ backgroundColor: distanceColor }}
        >
          <TrainIcon className="w-3 h-3" />
          {getDistanceText(currentOrder.distance)}
        </span>
        {currentOrder.isUrgent && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            <Flame className="w-3 h-3" />
            急单
          </span>
        )}
      </div>

      <div className="mb-3 p-2 bg-white/60 rounded-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-600" />
            燃料需求
          </span>
          <span className={`font-bold ${hasEnoughFuel ? 'text-green-600' : 'text-red-500'}`}>
            {totalFuel}/{currentOrder.fuelRequired}
            {!hasEnoughFuel && totalFuel > 0 && currentOrder.distance === 'long' && ' ⚠️'}
          </span>
        </div>
        <div className="h-1.5 mt-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((totalFuel / currentOrder.fuelRequired) * 100, 100)}%`,
              backgroundColor: hasEnoughFuel ? '#6BCB77' : '#FF9F43',
            }}
          />
        </div>
        {currentOrder.distance === 'long' && !hasEnoughFuel && (
          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            长途订单需要更多燃料！
          </p>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">订单需求</h4>
        <div className="space-y-2">
          {currentOrder.items.map((item, index) => {
            const config = CANDY_CONFIG[item.candyType];
            const loaded = getCandyLoad(train, item.candyType);
            const progress = Math.min((loaded / item.quantity) * 100, 100);
            const isComplete = loaded >= item.quantity;

            return (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xl">{config.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{config.name}</span>
                    <span className={isComplete ? 'text-green-600 font-bold' : 'text-gray-500'}>
                      {loaded}/{item.quantity}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: isComplete ? '#6BCB77' : config.color,
                      }}
                    />
                  </div>
                </div>
                {isComplete && <span className="text-green-500">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-yellow-600">
          <Coins className="w-4 h-4" />
          <span className="font-bold">
            +{currentOrder.reward}
            {currentOrder.isUrgent && (
              <span className="text-red-500 ml-1">(+{currentOrder.urgentBonus} 加急)</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 text-red-500">
          <AlertTriangle className="w-4 h-4" />
          <span>罚金 -{currentOrder.penalty}</span>
        </div>
      </div>

      {availableStations.length > 1 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">切换车站</h4>
          <div className="flex gap-2 flex-wrap">
            {availableStations.map(s => (
              <button
                key={s.id}
                onClick={() => changeStation(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${s.id === currentStationId
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                style={
                  s.id === currentStationId
                    ? { backgroundColor: s.themeColor }
                    : {}
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
