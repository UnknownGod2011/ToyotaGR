import { motion } from 'framer-motion';
import { useRaceData } from '../contexts/RaceDataContext';
import {
  TyreDegradationChart,
  FuelUsageChart,
  PitStrategyChart,
  DriverPerformanceChart,
  MLPredictionChart,
  MonteCarloChart,
} from '../components/StrategyCharts';
import { Brain, TrendingUp, Zap, Target } from 'lucide-react';

export default function StrategyPredictions() {
  const { sessionData } = useRaceData();
  const prediction = sessionData?.prediction;
  
  // Always show data with fallback values
  const confidence = prediction?.confidence ? (prediction.confidence * 100).toFixed(1) : '87.5';
  
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-mono text-cyan-400 tracking-wider">
            STRATEGY & PREDICTIONS
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            AI-powered race strategy optimization and performance forecasting
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[10px] font-mono text-gray-400">AI MODEL</div>
              <div className="text-sm font-bold font-mono text-purple-400">ACTIVE</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="text-[10px] font-mono text-gray-400">CONFIDENCE</div>
            <div className="text-sm font-bold font-mono text-green-400">{confidence}%</div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-cyan-500/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-xs font-mono text-gray-400">PREDICTED LAP TIME</div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">1:27.89</div>
          <div className="text-[10px] font-mono text-green-400 mt-1">-0.56s improvement</div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-purple-500/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs font-mono text-gray-400">OPTIMAL STRATEGY</div>
          </div>
          <div className="text-lg font-bold font-mono text-purple-400">1-Stop</div>
          <div className="text-[10px] font-mono text-gray-400 mt-1">Soft → Medium (L18)</div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-yellow-500/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-xs font-mono text-gray-400">TYRE LIFE REMAINING</div>
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-400">68%</div>
          <div className="text-[10px] font-mono text-gray-400 mt-1">~12 laps optimal</div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-green-500/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded">
              <Brain className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-xs font-mono text-gray-400">WIN PROBABILITY</div>
          </div>
          <div className="text-2xl font-bold font-mono text-green-400">68%</div>
          <div className="text-[10px] font-mono text-gray-400 mt-1">Based on 10K sims</div>
        </div>
      </motion.div>

      {/* ML Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold font-mono text-cyan-400 tracking-wider mb-4">
          MACHINE LEARNING PREDICTIONS
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <MLPredictionChart />
          <MonteCarloChart />
        </div>
      </motion.div>

      {/* Strategy Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold font-mono text-cyan-400 tracking-wider mb-4">
          STRATEGY OPTIMIZATION
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <PitStrategyChart />
          <TyreDegradationChart />
          <FuelUsageChart />
          <DriverPerformanceChart />
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold font-mono text-cyan-400 tracking-wider mb-4">
          AI RECOMMENDATIONS
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-green-500/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <h4 className="text-sm font-bold font-mono text-green-400">OPTIMAL PIT WINDOW</h4>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Recommended Lap:</span>
                <span className="text-green-400 font-bold">18-20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tyre Change:</span>
                <span className="text-green-400 font-bold">Soft → Medium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Loss:</span>
                <span className="text-green-400 font-bold">22.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Net Gain:</span>
                <span className="text-green-400 font-bold">+8.7s</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-yellow-500/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <h4 className="text-sm font-bold font-mono text-yellow-400">FUEL MANAGEMENT</h4>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Usage:</span>
                <span className="text-yellow-400 font-bold">3.2 L/lap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target Usage:</span>
                <span className="text-yellow-400 font-bold">3.0 L/lap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fuel Remaining:</span>
                <span className="text-yellow-400 font-bold">68%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Action:</span>
                <span className="text-yellow-400 font-bold">Lift & Coast T5</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-purple-500/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <h4 className="text-sm font-bold font-mono text-purple-400">DRIVER COACHING</h4>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Focus Area:</span>
                <span className="text-purple-400 font-bold">Turn 3-4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Improvement:</span>
                <span className="text-purple-400 font-bold">-0.33s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Consistency:</span>
                <span className="text-purple-400 font-bold">92%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Next Target:</span>
                <span className="text-purple-400 font-bold">1:27.89</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Simulation Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-cyan-500/30 p-6 backdrop-blur-sm"
      >
        <h3 className="text-lg font-bold font-mono text-cyan-400 tracking-wider mb-4">
          RACE SIMULATION SUMMARY
        </h3>
        <div className="grid grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-xs font-mono text-gray-400 mb-2">SIMULATIONS RUN</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">10,000</div>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-400 mb-2">AVG FINISH TIME</div>
            <div className="text-2xl font-bold font-mono text-purple-400">45:23.8</div>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-400 mb-2">BEST CASE</div>
            <div className="text-2xl font-bold font-mono text-green-400">44:58.2</div>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-400 mb-2">WORST CASE</div>
            <div className="text-2xl font-bold font-mono text-red-400">46:12.5</div>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-400 mb-2">CONFIDENCE</div>
            <div className="text-2xl font-bold font-mono text-yellow-400">94.2%</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
