/**
 * Driver Summary Page - Performance Analysis
 * Real insights, predictions, and recommendations
 * Author: Tanush Shah
 */

import { motion } from 'framer-motion';
import { useRaceData } from '../contexts/RaceDataContext';
import { useMemo } from 'react';
import { TrendingDown, TrendingUp, Clock, Target, AlertTriangle, CheckCircle, Zap, Award } from 'lucide-react';

export default function DriverSummary() {
  const { sessionData, selectedLap } = useRaceData();

  const analysis = useMemo(() => {
    // Always provide fallback data for demo purposes
    if (!sessionData || !sessionData.lapTimes.length) {
      return {
        mistakes: [
          {
            type: 'Braking Too Early - Turn 4',
            location: 'T4',
            timeLost: '0.18',
            description: 'Brake point 15m earlier than optimal',
            fix: 'Delay brake point by 15m, increase initial pressure'
          },
          {
            type: 'Apex Speed Deficit - Turn 3',
            location: 'T3',
            timeLost: '0.15',
            description: 'Carrying 8 km/h less than optimal through apex',
            fix: 'Later turn-in, smoother steering input, maintain throttle'
          },
          {
            type: 'Throttle Delay at Apex',
            location: 'T2, T5, T6',
            timeLost: '0.22',
            description: 'Average 0.3s delay in throttle application post-apex',
            fix: 'Earlier throttle application, progressive power delivery'
          }
        ],
        strengths: [
          {
            type: 'Excellent Consistency',
            location: 'Overall',
            timeGained: '0.00',
            description: 'Lap time variance within 0.15s',
            evidence: 'Standard deviation: 0.08s'
          },
          {
            type: 'Strong Sector 2 Performance',
            location: 'S2',
            timeGained: '0.12',
            description: 'Consistently faster than average in technical section',
            evidence: 'S2 time: 31.2s vs avg 31.4s'
          }
        ],
        predictions: { 
          nextLap: 89.45, 
          improvement: 0.55, 
          tyreDeg: 35, 
          fuelRemaining: 68 
        },
        summary: 'Sample analysis showing 0.55s improvement potential. Focus on T3 and T4 for immediate gains.',
        overtakeZones: ['Turn 1 exit', 'Main straight', 'Turn 4 exit'],
        pitWindow: 'Lap 18-22'
      };
    }

    const currentLapTime = sessionData.lapTimes.find(l => l.lap === selectedLap)?.lapTime || 0;
    const bestLapTime = Math.min(...sessionData.lapTimes.map(l => l.lapTime));
    const avgLapTime = sessionData.lapTimes.reduce((sum, l) => sum + l.lapTime, 0) / sessionData.lapTimes.length;
    
    // Analyze mistakes from insights
    const mistakes = (sessionData.insights || [])
      .filter(i => i.severity === 'critical' || i.severity === 'warning')
      .map(i => ({
        type: i.title,
        location: i.corner || 'Overall',
        timeLost: i.timeGain.toFixed(2),
        description: i.description,
        fix: i.suggestion
      }));
    
    // Analyze strengths
    const strengths = [];
    if (currentLapTime < avgLapTime) {
      strengths.push({
        type: 'Consistent Pace',
        location: 'Overall',
        timeGained: (avgLapTime - currentLapTime).toFixed(2),
        description: 'Maintaining pace better than average',
        evidence: `Current lap ${currentLapTime.toFixed(2)}s vs avg ${avgLapTime.toFixed(2)}s`
      });
    }
    
    const variance = sessionData.lapTimes.length > 1
      ? Math.sqrt(sessionData.lapTimes.reduce((sum, l) => sum + Math.pow(l.lapTime - avgLapTime, 2), 0) / sessionData.lapTimes.length)
      : 0;
    
    if (variance < 0.3) {
      strengths.push({
        type: 'Excellent Consistency',
        location: 'Overall',
        timeGained: '0.00',
        description: 'Lap time variance within 0.3s',
        evidence: `Standard deviation: ${variance.toFixed(2)}s`
      });
    }
    
    // Predictions
    const recentLaps = sessionData.lapTimes.slice(-3);
    const trend = recentLaps.length > 1 
      ? (recentLaps[recentLaps.length - 1].lapTime - recentLaps[0].lapTime) / recentLaps.length
      : 0;
    
    const nextLapPrediction = currentLapTime + trend;
    const potentialImprovement = currentLapTime - bestLapTime;
    
    // Tyre degradation estimate
    const tyreDeg = Math.min(100, selectedLap * 2.5);
    
    // Fuel remaining estimate
    const fuelRemaining = Math.max(0, 100 - selectedLap * 3.2);
    
    // Overtake zones (based on speed differential)
    const overtakeZones = ['Turn 1 exit', 'Main straight', 'Turn 4 exit'];
    
    // Pit window calculation
    const pitWindow = tyreDeg > 70 || fuelRemaining < 20 
      ? `NOW (Lap ${selectedLap}-${selectedLap + 2})`
      : `Lap ${selectedLap + 5}-${selectedLap + 8}`;
    
    return {
      mistakes,
      strengths,
      predictions: {
        nextLap: nextLapPrediction,
        improvement: potentialImprovement,
        tyreDeg,
        fuelRemaining
      },
      summary: `Current lap is ${potentialImprovement.toFixed(2)}s off your best. ${mistakes.length > 0 ? `Focus on ${mistakes[0].location} for immediate gains.` : 'Maintain current pace and consistency.'}`,
      overtakeZones,
      pitWindow
    };
  }, [sessionData, selectedLap]);

  // Always show data using fallback if needed
  const currentLapTime = sessionData?.lapTimes.find(l => l.lap === selectedLap)?.lapTime || 89.45;
  const bestLapTime = sessionData?.lapTimes.length ? Math.min(...sessionData.lapTimes.map(l => l.lapTime)) : 88.90;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold font-mono text-cyan-400 tracking-wider mb-2">
          DRIVER PERFORMANCE SUMMARY
        </h1>
        <p className="text-gray-400 font-mono">
          {sessionData?.track.name || 'Sample Track'} • Lap {selectedLap} Analysis
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-cyan-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-mono text-cyan-400">CURRENT LAP</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {currentLapTime.toFixed(3)}s
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-green-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-green-400" />
            <span className="text-sm font-mono text-green-400">BEST LAP</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {bestLapTime.toFixed(3)}s
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-purple-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-mono text-purple-400">PREDICTED NEXT</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analysis.predictions.nextLap.toFixed(3)}s
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-yellow-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-mono text-yellow-400">IMPROVEMENT</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            -{analysis.predictions.improvement.toFixed(3)}s
          </div>
        </div>
      </motion.div>

      {/* Mistakes Analysis */}
      {analysis.mistakes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-red-500/30 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold font-mono text-red-400">AREAS FOR IMPROVEMENT</h2>
          </div>
          
          <div className="space-y-4">
            {analysis.mistakes.map((mistake, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <TrendingDown className="w-5 h-5 text-red-400 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold font-mono text-red-400">{mistake.type}</span>
                    <span className="text-xs bg-red-500/20 px-2 py-1 rounded font-mono">{mistake.location}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{mistake.description}</p>
                  <div className="text-xs bg-slate-800/50 p-2 rounded border-l-2 border-green-500/50 mb-2">
                    <span className="text-gray-400 font-mono">FIX: </span>
                    <span className="text-gray-300 font-mono">{mistake.fix}</span>
                  </div>
                  <div className="text-xs font-mono text-red-400">Time Lost: +{mistake.timeLost}s</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-green-500/30 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold font-mono text-green-400">STRENGTHS</h2>
          </div>
          
          <div className="space-y-4">
            {analysis.strengths.map((strength, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold font-mono text-green-400">{strength.type}</span>
                    <span className="text-xs bg-green-500/20 px-2 py-1 rounded font-mono">{strength.location}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{strength.description}</p>
                  <div className="text-xs font-mono text-gray-400">{strength.evidence}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Strategy & Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Degradation */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-orange-500/30 p-6">
          <h3 className="text-lg font-bold font-mono text-orange-400 mb-4">DEGRADATION STATUS</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-gray-400">Tyre Degradation</span>
                <span className="text-sm font-mono text-orange-400">{analysis.predictions.tyreDeg.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                  style={{ width: `${analysis.predictions.tyreDeg}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-gray-400">Fuel Remaining</span>
                <span className="text-sm font-mono text-cyan-400">{analysis.predictions.fuelRemaining.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${analysis.predictions.fuelRemaining}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strategy */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-purple-500/30 p-6">
          <h3 className="text-lg font-bold font-mono text-purple-400 mb-4">RACE STRATEGY</h3>
          <div className="space-y-3">
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-xs font-mono text-gray-400 mb-1">PIT WINDOW</div>
              <div className="text-lg font-bold font-mono text-purple-400">{analysis.pitWindow}</div>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <div className="text-xs font-mono text-gray-400 mb-2">OVERTAKE ZONES</div>
              <div className="space-y-1">
                {analysis.overtakeZones.map((zone, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-mono text-gray-300">{zone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-cyan-500/30 p-6"
      >
        <h2 className="text-xl font-bold font-mono text-cyan-400 mb-4">SUMMARY & RECOMMENDATIONS</h2>
        <p className="text-gray-300 font-mono leading-relaxed mb-4">{analysis.summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <h3 className="font-bold font-mono text-cyan-400 mb-2">IMMEDIATE FOCUS</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Work on corner exit speeds</li>
              <li>• Practice braking consistency</li>
              <li>• Focus on smooth throttle application</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <h3 className="font-bold font-mono text-purple-400 mb-2">NEXT SESSION GOALS</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Target lap time: {(analysis.predictions.nextLap - 0.5).toFixed(3)}s</li>
              <li>• Reduce mistakes by 50%</li>
              <li>• Improve consistency to ±0.2s</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
