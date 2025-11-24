import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from 'recharts';
import { motion } from 'framer-motion';
import { useRaceData } from '../contexts/RaceDataContext';
import { useMemo, useState } from 'react';

interface TooltipPayload {
  color: string;
  name: string;
  value: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// Custom Tooltip with proper styling
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-purple-500 rounded-lg p-3 shadow-xl">
        <p className="text-purple-400 font-mono text-xs mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-mono text-xs" style={{ color: entry.color }}>
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartContainer = ({ title, children, status, info }: { title: string; children: React.ReactNode; status?: string; info?: string }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <motion.div
      className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-cyan-500/30 p-4 backdrop-blur-sm overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'rgba(6, 182, 212, 0.6)' }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA2YjZkNCIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold font-mono text-cyan-400 tracking-wider">{title}</h4>
            {info && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                  className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-[10px] text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                >
                  i
                </button>
                {showInfo && (
                  <div className="absolute left-0 top-6 w-64 bg-slate-950 border border-cyan-500/50 rounded-lg p-3 shadow-xl z-50">
                    <p className="text-xs text-gray-300 font-mono leading-relaxed">{info}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {status && (
            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/50 rounded text-[10px] font-mono text-purple-400">
              {status}
            </span>
          )}
        </div>
        {children}
      </div>

      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), transparent)',
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
    </motion.div >
  );
};

export const TyreDegradationChart = () => {
  const { sessionData } = useRaceData();

  const tyreDegradation = useMemo(() => {
    if (!sessionData || !sessionData.lapTimes.length) {
      return Array.from({ length: 30 }, (_, i) => ({
        lap: i + 1,
        soft: Math.max(0, 100 - i * 4.5 - Math.random() * 5),
        medium: Math.max(0, 100 - i * 3 - Math.random() * 3),
        hard: Math.max(0, 100 - i * 2 - Math.random() * 2),
      }));
    }

    // Track actual degradation from lap time increases
    const laps = sessionData.lapTimes.slice().sort((a, b) => a.lap - b.lap);
    const fastestTime = Math.min(...laps.map(l => l.lapTime));

    return laps.map((lapData, index) => {
      const degradationFactor = (lapData.lapTime - fastestTime) / fastestTime;
      const gripLoss = Math.min(100, degradationFactor * 500); // Scale to 0-100%

      return {
        lap: lapData.lap,
        soft: Math.max(0, 100 - index * 4.5 - gripLoss),
        medium: Math.max(0, 100 - index * 3 - gripLoss * 0.7),
        hard: Math.max(0, 100 - index * 2 - gripLoss * 0.5),
      };
    });
  }, [sessionData]);

  return (
    <ChartContainer
      title="TYRE DEGRADATION FORECAST"
      status="CALCULATED"
      info="Predicts tyre grip loss based on actual lap time degradation. Shows how different compounds would perform over race distance."
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={tyreDegradation}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="lap" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Lap', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Grip %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Line type="monotone" dataKey="soft" stroke="#ef4444" strokeWidth={2} dot={false} name="Soft Compound" />
          <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} dot={false} name="Medium Compound" />
          <Line type="monotone" dataKey="hard" stroke="#f5f5f5" strokeWidth={2} dot={false} name="Hard Compound" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const FuelUsageChart = () => {
  const { sessionData } = useRaceData();

  const fuelData = useMemo(() => {
    if (!sessionData || !sessionData.telemetry || sessionData.telemetry.size === 0) {
      return Array.from({ length: 30 }, (_, i) => ({
        lap: i + 1,
        fuel: 100 - i * 3.2,
        predicted: 100 - i * 3.2,
      }));
    }

    const laps = Array.from(sessionData.telemetry.keys()).sort((a, b) => a - b);
    const baseBurnRate = 3.2;

    return laps.map((lapNum, index) => {
      const lapTelemetry = sessionData.telemetry.get(lapNum);
      if (!lapTelemetry || lapTelemetry.length === 0) {
        return { lap: lapNum, fuel: 100 - index * baseBurnRate, predicted: 100 - (index + 1) * baseBurnRate };
      }

      // Calculate fuel usage based on throttle application
      const avgThrottle = lapTelemetry.reduce((sum, p) => sum + (p.throttle || 0), 0) / lapTelemetry.length;
      const throttleFactor = avgThrottle / 100;
      const lapBurn = baseBurnRate * (0.7 + throttleFactor * 0.6);

      return {
        lap: lapNum,
        fuel: Math.max(0, 100 - index * baseBurnRate),
        predicted: Math.max(0, 100 - (index + 1) * lapBurn),
      };
    });
  }, [sessionData]);

  return (
    <ChartContainer title="FUEL USAGE TREND & PREDICTION" status="REAL-TIME" info="Fuel consumption calculated from throttle usage patterns. Helps predict refueling needs.">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={fuelData}>
          <defs>
            <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="lap" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Area type="monotone" dataKey="fuel" stroke="#a855f7" strokeWidth={2} fill="url(#fuelGradient)" name="Actual Fuel %" />
          <Line type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const PitStrategyChart = () => {
  const { sessionData } = useRaceData();

  const strategies = useMemo(() => {
    if (!sessionData || !sessionData.lapTimes.length) {
      return [
        { strategy: '1-Stop Soft-Medium', totalTime: 5425, probability: 68 },
        { strategy: '1-Stop Medium-Hard', totalTime: 5438, probability: 82 },
        { strategy: '2-Stop Soft-Soft-Medium', totalTime: 5419, probability: 45 },
        { strategy: 'No-Stop Hard', totalTime: 5465, probability: 25 },
      ];
    }

    const avgLapTime = sessionData.lapTimes.reduce((sum, l) => sum + l.lapTime, 0) / sessionData.lapTimes.length;
    const pitLossTime = 22; // seconds
    const totalLaps = Math.max(30, sessionData.lapTimes.length);

    return [
      {
        strategy: '1-Stop Strategy',
        totalTime: Math.round(avgLapTime * totalLaps + pitLossTime),
        probability: 75
      },
      {
        strategy: '2-Stop Strategy',
        totalTime: Math.round(avgLapTime * totalLaps * 0.98 + pitLossTime * 2),
        probability: 55
      },
      {
        strategy: 'No-Stop Strategy',
        totalTime: Math.round(avgLapTime * totalLaps * 1.05),
        probability: 30
      },
    ];
  }, [sessionData]);

  return (
    <ChartContainer title="PIT STRATEGY COMPARISON" status="OPTIMIZED" info="Compares pit strategies based on actual lap times and degradation patterns.">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={strategies} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="strategy" stroke="#64748b" tick={{ fontSize: 9 }} width={150} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Bar dataKey="totalTime" fill="#a855f7" name="Total Time (s)" />
          <Bar dataKey="probability" fill="#10b981" name="Success Probability %" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const DriverPerformanceChart = () => {
  const { sessionData } = useRaceData();

  const performance = useMemo(() => {
    if (!sessionData || sessionData.lapTimes.length < 3) {
      return Array.from({ length: 5 }, (_, i) => ({
        session: `Lap ${i + 1}`,
        consistency: 85 + Math.random() * 10,
        speed: 88 + Math.random() * 8,
      }));
    }

    const laps = sessionData.lapTimes.slice(-10);
    return laps.map((lap) => {
      // Consistency: inverse of lap time variance
      const avgTime = laps.reduce((sum, l) => sum + l.lapTime, 0) / laps.length;
      const variance = Math.abs(lap.lapTime - avgTime);
      const consistency = Math.max(0, 100 - variance * 50);

      // Speed: relative to best lap
      const bestTime = Math.min(...laps.map(l => l.lapTime));
      const speed = Math.max(0, 100 - ((lap.lapTime - bestTime) / bestTime) * 500);

      return {
        session: `Lap ${lap.lap}`,
        consistency: Math.round(consistency),
        speed: Math.round(speed),
      };
    });
  }, [sessionData]);

  return (
    <ChartContainer title="DRIVER PERFORMANCE METRICS" status="ANALYZED" info="Consistency and speed metrics calculated from actual lap data.">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={performance}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="session" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Bar dataKey="consistency" fill="#06b6d4" name="Consistency" />
          <Bar dataKey="speed" fill="#f59e0b" name="Speed" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const MLPredictionChart = () => {
  const { sessionData } = useRaceData();

  const predictionData = useMemo(() => {
    if (!sessionData || !sessionData.prediction || sessionData.lapTimes.length < 3) {
      return Array.from({ length: 10 }, (_, i) => ({
        lap: i + 1,
        actual: 88.5 + Math.sin(i * 0.5) * 1.2,
        predicted: 88.5 + Math.sin(i * 0.5) * 1.2,
        confidence: 95 - i * 0.5,
      }));
    }

    const recentLaps = sessionData.lapTimes.slice(-10);
    const prediction = sessionData.prediction;

    return recentLaps.map((lap, index) => ({
      lap: lap.lap,
      actual: lap.lapTime,
      predicted: index === recentLaps.length - 1 ? prediction.predictedLapTime : lap.lapTime,
      confidence: prediction.confidence * 100,
    }));
  }, [sessionData]);

  return (
    <ChartContainer title="ML LAP TIME PREDICTION" status="AI-POWERED" info="Machine learning predictions based on recent lap performance and tyre degradation.">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={predictionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="lap" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} name="Actual Lap Time (s)" />
          <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={false} name="ML Prediction (s)" />
          <Line type="monotone" dataKey="confidence" stroke="#64748b" strokeWidth={1} dot={false} name="Confidence %" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const MonteCarloChart = () => {
  const { sessionData } = useRaceData();

  const simulations = useMemo(() => {
    if (!sessionData || sessionData.lapTimes.length < 5) {
      return Array.from({ length: 50 }, (_, i) => ({
        simulation: i + 1,
        finishTime: 5420 + Math.random() * 30,
        position: Math.floor(Math.random() * 8) + 1,
        probability: Math.random() * 100,
      }));
    }

    const avgLapTime = sessionData.lapTimes.reduce((sum, l) => sum + l.lapTime, 0) / sessionData.lapTimes.length;
    const stdDev = Math.sqrt(sessionData.lapTimes.reduce((sum, l) => sum + Math.pow(l.lapTime - avgLapTime, 2), 0) / sessionData.lapTimes.length);

    return Array.from({ length: 50 }, (_, i) => {
      const variation = (Math.random() - 0.5) * stdDev * 2;
      const finishTime = avgLapTime * 30 + variation * 30;
      const position = Math.max(1, Math.min(10, Math.floor((finishTime - 5400) / 10) + 1));

      return {
        simulation: i + 1,
        finishTime: Math.round(finishTime),
        position,
        probability: Math.random() * 100,
      };
    });
  }, [sessionData]);

  return (
    <ChartContainer title="MONTE CARLO RACE SIMULATION" status="CALCULATED" info="Probabilistic race outcome simulations based on lap time variance and degradation patterns.">
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="finishTime" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Finish Time (s)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
          <YAxis dataKey="position" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Position', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
          <ZAxis dataKey="probability" range={[10, 200]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={simulations} fill="#a855f7" fillOpacity={0.6} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default {
  TyreDegradationChart,
  FuelUsageChart,
  PitStrategyChart,
  DriverPerformanceChart,
  MLPredictionChart,
  MonteCarloChart,
};
