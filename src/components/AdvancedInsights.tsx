import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { useRaceData } from '../contexts/RaceDataContext';
import { Insight } from '../services/AnalyticsEngine';

const AdvancedInsights = () => {
  const { sessionData } = useRaceData();

  const fallbackInsights: Insight[] = [
    {
      id: '1',
      category: 'BRAKING',
      severity: 'warning',
      title: 'Braking Too Early - Turn 4',
      description: 'Brake point 15m earlier than optimal',
      evidence: 'Brake applied at 142m vs ideal 127m',
      suggestion: 'Delay brake point by 15m, increase initial pressure',
      timeGain: 0.18,
      corner: 'T4',
    },
    {
      id: '2',
      category: 'APEX SPEED',
      severity: 'critical',
      title: 'Apex Speed Deficit - Turn 3',
      description: 'Carrying 8 km/h less than optimal through apex',
      evidence: '165 km/h vs ideal 173 km/h',
      suggestion: 'Later turn-in, smoother steering input, maintain throttle',
      timeGain: 0.15,
      corner: 'T3',
    },
    {
      id: '3',
      category: 'THROTTLE',
      severity: 'warning',
      title: 'Throttle Delay at Apex',
      description: 'Average 0.3s delay in throttle application post-apex',
      evidence: 'Measured across T2, T5, T6',
      suggestion: 'Earlier throttle application, progressive power delivery',
      timeGain: 0.22,
    },
    {
      id: '4',
      category: 'STEERING',
      severity: 'info',
      title: 'Excessive Steering Correction',
      description: '12 micro-corrections detected in Turn 1',
      evidence: 'Steering angle variance: ±4.2°',
      suggestion: 'Smoother initial turn-in, trust the grip',
      timeGain: 0.08,
      corner: 'T1',
    },
    {
      id: '5',
      category: 'UNDERSTEER',
      severity: 'warning',
      title: 'Understeer Event Detected',
      description: 'Front tyre slip angle exceeded optimal range',
      evidence: 'T2 entry: 8.5° slip vs 6° optimal',
      suggestion: 'Reduce entry speed by 3 km/h, earlier turn-in',
      timeGain: 0.11,
      corner: 'T2',
    },
    {
      id: '6',
      category: 'TYRE BALANCE',
      severity: 'info',
      title: 'Tyre Temperature Imbalance',
      description: 'Front-left running 6°C hotter than front-right',
      evidence: 'FL: 91°C, FR: 85°C',
      suggestion: 'Adjust brake bias -2%, review suspension setup',
      timeGain: 0.05,
    },
    {
      id: '7',
      category: 'CONSISTENCY',
      severity: 'success',
      title: 'Excellent Lap Consistency',
      description: 'Lap time variance within 0.15s over last 5 laps',
      evidence: 'Std deviation: 0.08s',
      suggestion: 'Maintain current rhythm and focus',
      timeGain: 0,
    },
    {
      id: '8',
      category: 'PREDICTION',
      severity: 'info',
      title: 'Next Lap Prediction',
      description: 'ML model predicts 0.3s improvement potential',
      evidence: 'Based on current trajectory and tyre condition',
      suggestion: 'Focus on T3 and T4 improvements',
      timeGain: 0.30,
    },
  ];

  const displayInsights = sessionData?.insights?.length ? sessionData.insights : fallbackInsights;

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', icon: XCircle };
    case 'warning':
      return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle };
    case 'success':
      return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', icon: CheckCircle };
    default:
      return { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', icon: TrendingUp };
  }
};

const InsightCard = ({ insight }: { insight: Insight }) => {
  const colors = getSeverityColor(insight.severity);
  const Icon = colors.icon;

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-lg border ${colors.border} p-4 backdrop-blur-sm overflow-hidden group`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, borderColor: colors.border.replace('/50', '/80') }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA2YjZkNCIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 ${colors.bg} rounded`}>
              <Icon className={`w-4 h-4 ${colors.text}`} />
            </div>
            <div>
              <div className="text-[10px] font-mono text-gray-500">{insight.category}</div>
              <div className={`text-sm font-bold font-mono ${colors.text}`}>{insight.title}</div>
            </div>
          </div>
          {insight.corner && (
            <div className="px-2 py-0.5 bg-slate-800/80 border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-400">
              {insight.corner}
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <div className="text-gray-400 font-mono">{insight.description}</div>
          </div>

          <div className="bg-slate-800/50 rounded p-2 border-l-2 border-cyan-500/50">
            <div className="text-[10px] font-mono text-gray-500 mb-1">EVIDENCE</div>
            <div className="text-[11px] font-mono text-gray-300">{insight.evidence}</div>
          </div>

          <div className="bg-slate-800/50 rounded p-2 border-l-2 border-green-500/50">
            <div className="text-[10px] font-mono text-gray-500 mb-1">SUGGESTED FIX</div>
            <div className="text-[11px] font-mono text-gray-300">{insight.suggestion}</div>
          </div>

          {insight.timeGain > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
              <div className="text-[10px] font-mono text-gray-500">EXPECTED TIME GAIN</div>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-green-400" />
                <span className="text-sm font-bold font-mono text-green-400">
                  -{insight.timeGain.toFixed(2)}s
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animated glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.border.includes('red') ? 'rgba(239, 68, 68, 0.2)' : colors.border.includes('yellow') ? 'rgba(234, 179, 8, 0.2)' : 'rgba(6, 182, 212, 0.2)'}, transparent)`,
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
};

  const totalTimeGain = displayInsights.reduce((sum, insight) => sum + insight.timeGain, 0);
  const criticalCount = displayInsights.filter((i) => i.severity === 'critical').length;
  const warningCount = displayInsights.filter((i) => i.severity === 'warning').length;

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-lg border border-cyan-500/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-mono text-gray-400 mb-1">TOTAL INSIGHTS</div>
          <div className="text-3xl font-bold font-mono text-cyan-400">{displayInsights.length}</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-lg border border-red-500/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-xs font-mono text-gray-400 mb-1">CRITICAL ISSUES</div>
          <div className="text-3xl font-bold font-mono text-red-400">{criticalCount}</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-lg border border-yellow-500/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-xs font-mono text-gray-400 mb-1">WARNINGS</div>
          <div className="text-3xl font-bold font-mono text-yellow-400">{warningCount}</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-lg border border-green-500/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-xs font-mono text-gray-400 mb-1">POTENTIAL GAIN</div>
          <div className="text-3xl font-bold font-mono text-green-400">-{totalTimeGain.toFixed(2)}s</div>
        </motion.div>
      </div>

      {/* Insights grid */}
      <div className="grid grid-cols-2 gap-4">
        {displayInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <InsightCard insight={insight} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedInsights;
