import { motion } from 'framer-motion';
import { useRaceData } from '../contexts/RaceDataContext';
import AdvancedInsights from '../components/AdvancedInsights';
import {
  SpeedVsDistanceChart,
  ThrottleBrakeSteeringChart,
  GForceChart,
  DeltaTimeChart,
  TyreTemperatureChart,
  BrakeTemperatureChart,
  CornerAnalysisChart,
  TimeLossHeatmap,
  SectorComparisonChart,
} from '../components/TechnicalCharts';
import RacingLineVisualization from '../components/RacingLineVisualization';

export default function RaceInsights() {
  const { sessionData } = useRaceData();

  // Charts will show fallback data if no real data is available
  // No need to block rendering

  const totalPoints = Array.from(sessionData?.telemetry.values() || []).reduce(
    (sum, lap) => sum + lap.length,
    0
  );

  return (
    <div className="p-6 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-mono text-cyan-400 tracking-wider">
            RACE INSIGHTS & ANALYSIS
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            Advanced telemetry analysis and performance insights
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
            <div className="text-[10px] font-mono text-gray-400">ANALYSIS MODE</div>
            <div className="text-sm font-bold font-mono text-purple-400">DEEP SCAN</div>
          </div>
          <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
            <div className="text-[10px] font-mono text-gray-400">DATA POINTS</div>
            <div className="text-sm font-bold font-mono text-cyan-400">{totalPoints.toLocaleString()}</div>
          </div>
        </div>
      </motion.div>

      {/* Advanced Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdvancedInsights />
      </motion.div>

      {/* Technical Charts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        key={`charts-${sessionData?.track.name}-${sessionData?.lapTimes.length || 0}`}
      >
        <h2 className="text-xl font-bold font-mono text-cyan-400 tracking-wider mb-3">
          TELEMETRY ANALYSIS
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <SpeedVsDistanceChart key={`speed-${sessionData?.track.name}-${totalPoints}`} />
          <DeltaTimeChart key={`delta-${sessionData?.track.name}-${totalPoints}`} />
          <ThrottleBrakeSteeringChart key={`tbs-${sessionData?.track.name}-${totalPoints}`} />
          <GForceChart key={`gforce-${sessionData?.track.name}-${totalPoints}`} />
          <TyreTemperatureChart key={`tyre-${sessionData?.track.name}-${totalPoints}`} />
          <BrakeTemperatureChart key={`brake-${sessionData?.track.name}-${totalPoints}`} />
        </div>
      </motion.div>

      {/* Corner Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        key={`corners-${sessionData?.track.name}-${sessionData?.track.corners.length || 0}`}
      >
        <h2 className="text-xl font-bold font-mono text-cyan-400 tracking-wider mb-3">
          CORNER-BY-CORNER ANALYSIS
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <CornerAnalysisChart key={`corner-${sessionData?.track.name}-${sessionData?.track.corners.length}`} />
          <TimeLossHeatmap key={`loss-${sessionData?.track.name}-${sessionData?.track.corners.length}`} />
          <SectorComparisonChart key={`sector-${sessionData?.track.name}-${sessionData?.lapTimes.length}`} />
        </div>
        {/* Racing Line - Full Width */}
        <div className="w-full">
          <RacingLineVisualization key={`racing-${sessionData?.track.name}-${totalPoints}`} />
        </div>
      </motion.div>

      {/* Car Telemetry */}
    </div>
  );
}
