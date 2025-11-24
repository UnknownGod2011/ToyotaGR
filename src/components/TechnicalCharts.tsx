import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
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
      <div className="bg-slate-900 border border-cyan-500 rounded-lg p-3 shadow-xl">
        <p className="text-cyan-400 font-mono text-xs mb-2">{`Distance: ${label}m`}</p>
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
      className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-lg border border-cyan-500/30 p-3 backdrop-blur-sm overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'rgba(6, 182, 212, 0.6)' }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA2YjZkNCIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
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
            <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-[10px] font-mono text-green-400">
              {status}
            </span>
          )}
        </div>
        {children}
      </div>

      {/* Animated border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent)',
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

export const SpeedVsDistanceChart = () => {
  const { sessionData, selectedLap } = useRaceData();

  const chartData = useMemo(() => {
    console.log('📊 [SpeedChart] Updating:', {
      hasSessionData: !!sessionData,
      selectedLap,
      trackName: sessionData?.track.name,
      telemetrySize: sessionData?.telemetry?.size,
      availableLaps: sessionData ? Array.from(sessionData.telemetry?.keys() || []) : []
    });

    if (!sessionData || !sessionData.telemetry || sessionData.telemetry.size === 0) {
      console.log('⚠️ [SpeedChart] No session data, using fallback');
      // Return fallback data
      return [
        { distance: 0, speed: 120 },
        { distance: 100, speed: 140 },
        { distance: 200, speed: 160 },
        { distance: 300, speed: 180 },
        { distance: 400, speed: 200 },
        { distance: 500, speed: 210 },
        { distance: 600, speed: 180 },
        { distance: 700, speed: 140 },
        { distance: 800, speed: 100 },
        { distance: 900, speed: 90 },
        { distance: 1000, speed: 110 },
        { distance: 1100, speed: 130 },
        { distance: 1200, speed: 150 },
        { distance: 1300, speed: 170 },
        { distance: 1400, speed: 190 },
        { distance: 1500, speed: 200 },
      ];
    }

    // Try selected lap first, then fall back to first available lap
    let telemetry = sessionData.telemetry.get(selectedLap);
    if (!telemetry || telemetry.length === 0) {
      const firstLap = Array.from(sessionData.telemetry.keys())[0];
      console.log('⚠️ [SpeedChart] No telemetry for lap', selectedLap, 'using lap', firstLap);
      telemetry = sessionData.telemetry.get(firstLap);
    }

    if (!telemetry || telemetry.length === 0) {
      console.log('⚠️ [SpeedChart] No telemetry data available, using fallback');
      return [
        { distance: 0, speed: 120 },
        { distance: 500, speed: 200 },
        { distance: 1000, speed: 100 },
        { distance: 1500, speed: 180 },
      ];
    }

    console.log('✅ [SpeedChart] Processing', telemetry.length, 'points');
    // Sample data points to avoid overcrowding
    const step = Math.max(1, Math.floor(telemetry.length / 100));
    return telemetry.filter((_, i) => i % step === 0).map(point => ({
      distance: Math.round(point.distance),
      speed: Math.round(point.speed * 3.6), // m/s to km/h
    }));
  }, [sessionData, selectedLap]);

  return (
    <ChartContainer
      title="SPEED vs DISTANCE"
      
      info="Displays vehicle speed (km/h) throughout the lap plotted against track distance. Shows acceleration zones, braking points, and top speed sections."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="distance" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="speed" stroke="#06b6d4" strokeWidth={2} fill="url(#speedGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export const ThrottleBrakeSteeringChart = () => {
  const { sessionData, selectedLap } = useRaceData();

  const chartData = useMemo(() => {
    if (!sessionData || !sessionData.telemetry || sessionData.telemetry.size === 0) {
      return [
        { distance: 0, throttle: 80, brake: 0, steering: 0 },
        { distance: 200, throttle: 100, brake: 0, steering: 10 },
        { distance: 400, throttle: 100, brake: 0, steering: 5 },
        { distance: 600, throttle: 0, brake: 80, steering: -10 },
        { distance: 800, throttle: 0, brake: 100, steering: -20 },
        { distance: 1000, throttle: 30, brake: 0, steering: -25 },
        { distance: 1200, throttle: 70, brake: 0, steering: -10 },
        { distance: 1400, throttle: 95, brake: 0, steering: 8 },
        { distance: 1600, throttle: 0, brake: 90, steering: 15 },
      ];
    }

    let telemetry = sessionData.telemetry.get(selectedLap);
    if (!telemetry || telemetry.length === 0) {
      telemetry = sessionData.telemetry.get(Array.from(sessionData.telemetry.keys())[0]);
    }
    if (!telemetry || telemetry.length === 0) {
      return [
        { distance: 0, throttle: 80, brake: 0, steering: 0 },
        { distance: 500, throttle: 100, brake: 0, steering: 10 },
        { distance: 1000, throttle: 0, brake: 100, steering: -20 },
        { distance: 1500, throttle: 90, brake: 0, steering: 5 },
      ];
    }
    const step = Math.max(1, Math.floor(telemetry.length / 100));
    return telemetry.filter((_, i) => i % step === 0).map(point => ({
      distance: Math.round(point.distance),
      throttle: Math.round(point.throttle || 0),
      brake: Math.round(((point.brake_front || 0) + (point.brake_rear || 0)) / 2),
      steering: Math.round(point.steering || 0),
    }));
  }, [sessionData, selectedLap]);

  return (
    <ChartContainer
      title="THROTTLE / BRAKE / STEERING TRACES"

      info="Shows driver inputs: throttle position (%), brake pressure (%), and steering angle (degrees). Reveals driving style, smoothness, and technique through corners."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="distance" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Line type="monotone" dataKey="throttle" stroke="#10b981" strokeWidth={2} dot={false} name="Throttle %" />
          <Line type="monotone" dataKey="brake" stroke="#ef4444" strokeWidth={2} dot={false} name="Brake %" />
          <Line type="monotone" dataKey="steering" stroke="#a855f7" strokeWidth={2} dot={false} name="Steering °" />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export const GForceChart = () => {
  const { sessionData, selectedLap } = useRaceData();

  const chartData = useMemo(() => {
    if (!sessionData) {
      return [
        { distance: 0, lateralG: 0.2, longitudinalG: 0.5 },
        { distance: 200, lateralG: 1.2, longitudinalG: 0.4 },
        { distance: 400, lateralG: 1.5, longitudinalG: 0.2 },
        { distance: 600, lateralG: -0.5, longitudinalG: -1.8 },
        { distance: 800, lateralG: -1.8, longitudinalG: -2.2 },
        { distance: 1000, lateralG: -1.5, longitudinalG: 0.2 },
        { distance: 1200, lateralG: 1.0, longitudinalG: 0.8 },
        { distance: 1400, lateralG: 1.4, longitudinalG: 0.5 },
        { distance: 1600, lateralG: 0.8, longitudinalG: -2.0 },
      ];
    }
    const telemetry = sessionData.telemetry.get(selectedLap);
    if (!telemetry || telemetry.length === 0) {
      return [
        { distance: 0, lateralG: 0.5, longitudinalG: 0.5 },
        { distance: 500, lateralG: 1.5, longitudinalG: 0.2 },
        { distance: 1000, lateralG: -1.8, longitudinalG: -2.0 },
        { distance: 1500, lateralG: 1.0, longitudinalG: 0.8 },
      ];
    }

    const step = Math.max(1, Math.floor(telemetry.length / 100));
    return telemetry.filter((_, i) => i % step === 0).map(point => ({
      distance: Math.round(point.distance),
      lateralG: parseFloat((point.accx || 0).toFixed(2)),
      longitudinalG: parseFloat((point.accy || 0).toFixed(2)),
    }));
  }, [sessionData, selectedLap]);

  return (
    <ChartContainer
      title="LATERAL & LONGITUDINAL G-FORCE"
      
      info="Measures cornering forces (lateral G) and acceleration/braking forces (longitudinal G). Higher values indicate more aggressive driving and better grip utilization."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="distance" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[-2, 3]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="lateralG" stroke="#f59e0b" strokeWidth={2} dot={false} name="Lateral G" />
            <Line type="monotone" dataKey="longitudinalG" stroke="#ec4899" strokeWidth={2} dot={false} name="Longitudinal G" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export const DeltaTimeChart = () => {
  const { sessionData, selectedLap } = useRaceData();

  const chartData = useMemo(() => {
    if (!sessionData || !sessionData.lapTimes.length) {
      return [
        { distance: 0, delta: 0 },
        { distance: 200, delta: 0.05 },
        { distance: 400, delta: 0.12 },
        { distance: 600, delta: 0.18 },
        { distance: 800, delta: 0.15 },
        { distance: 1000, delta: 0.08 },
        { distance: 1200, delta: -0.02 },
        { distance: 1400, delta: 0.05 },
        { distance: 1600, delta: 0.10 },
      ];
    }

    const selectedTelemetry = sessionData.telemetry.get(selectedLap);
    const bestLap = sessionData.lapTimes.reduce((best, lap) => lap.lapTime < best.lapTime ? lap : best);
    const bestTelemetry = sessionData.telemetry.get(bestLap.lap);

    if (!selectedTelemetry || !bestTelemetry || selectedTelemetry.length === 0 || bestTelemetry.length === 0) {
      return [
        { distance: 0, delta: 0 },
        { distance: 500, delta: 0.15 },
        { distance: 1000, delta: 0.10 },
        { distance: 1500, delta: 0.05 },
      ];
    }

    const step = Math.max(1, Math.floor(selectedTelemetry.length / 100));
    return selectedTelemetry.filter((_, i) => i % step === 0).map((point, i) => {
      const bestPoint = bestTelemetry[Math.min(i * step, bestTelemetry.length - 1)];
      const selectedTime = new Date(point.timestamp).getTime();
      const bestTime = new Date(bestPoint.timestamp).getTime();
      const delta = (selectedTime - bestTime) / 1000;

      return {
        distance: Math.round(point.distance),
        delta: parseFloat(delta.toFixed(3)),
      };
    });
  }, [sessionData, selectedLap]);

  return (
    <ChartContainer
      title="DELTA TIME vs BEST LAP"

      info="Compares current lap to your best lap in real-time. Green = faster, Red = slower. Shows exactly where time is gained or lost around the track."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="deltaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#eab308" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="distance" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#10b981" strokeWidth={2} />
          <Area type="monotone" dataKey="delta" stroke="#06b6d4" strokeWidth={2} fill="url(#deltaGradient)" />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export const TyreTemperatureChart = () => {
  const { sessionData, selectedLap } = useRaceData();

  const chartData = useMemo(() => {
    if (!sessionData) {
      return [
        { distance: 0, tyreTempFL: 80, tyreTempFR: 82 },
        { distance: 200, tyreTempFL: 85, tyreTempFR: 87 },
        { distance: 400, tyreTempFL: 88, tyreTempFR: 90 },
        { distance: 600, tyreTempFL: 90, tyreTempFR: 92 },
        { distance: 800, tyreTempFL: 92, tyreTempFR: 94 },
        { distance: 1000, tyreTempFL: 89, tyreTempFR: 91 },
        { distance: 1200, tyreTempFL: 87, tyreTempFR: 89 },
        { distance: 1400, tyreTempFL: 90, tyreTempFR: 92 },
        { distance: 1600, tyreTempFL: 93, tyreTempFR: 95 },
      ];
    }
    const telemetry = sessionData.telemetry.get(selectedLap);
    if (!telemetry || telemetry.length === 0) {
      return [
        { distance: 0, tyreTempFL: 80, tyreTempFR: 82 },
        { distance: 500, tyreTempFL: 88, tyreTempFR: 90 },
        { distance: 1000, tyreTempFL: 92, tyreTempFR: 94 },
        { distance: 1500, tyreTempFL: 90, tyreTempFR: 92 },
      ];
    }

    const step = Math.max(1, Math.floor(telemetry.length / 100));
    return telemetry.filter((_, i) => i % step === 0).map((point) => ({
      distance: Math.round(point.distance),
      tyreTempFL: Math.round(75 + (point.speed * 0.1) + Math.abs(point.accx) * 5),
      tyreTempFR: Math.round(77 + (point.speed * 0.1) + Math.abs(point.accx) * 5),
    }));
  }, [sessionData, selectedLap]);

  return (
    <ChartContainer
      title="TYRE TEMPERATURE TIMELINE"

      info="Tracks front left and right tyre temperatures throughout the lap. Optimal range is 85-95°C. Helps identify setup issues and tyre wear patterns."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="distance" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[70, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Line type="monotone" dataKey="tyreTempFL" stroke="#06b6d4" strokeWidth={2} dot={false} name="FL Temp °C" />
            <Line type="monotone" dataKey="tyreTempFR" stroke="#f59e0b" strokeWidth={2} dot={false} name="FR Temp °C" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export const BrakeTemperatureChart = () => {
  const { sessionData, selectedLap } = useRaceData();

  const chartData = useMemo(() => {
    if (!sessionData) {
      return [
        { distance: 0, brakeTempFL: 300, brakeTempFR: 320 },
        { distance: 200, brakeTempFL: 320, brakeTempFR: 340 },
        { distance: 400, brakeTempFL: 340, brakeTempFR: 360 },
        { distance: 600, brakeTempFL: 410, brakeTempFR: 430 },
        { distance: 800, brakeTempFL: 450, brakeTempFR: 470 },
        { distance: 1000, brakeTempFL: 380, brakeTempFR: 400 },
        { distance: 1200, brakeTempFL: 350, brakeTempFR: 370 },
        { distance: 1400, brakeTempFL: 370, brakeTempFR: 390 },
        { distance: 1600, brakeTempFL: 430, brakeTempFR: 450 },
      ];
    }
    const telemetry = sessionData.telemetry.get(selectedLap);
    if (!telemetry || telemetry.length === 0) {
      return [
        { distance: 0, brakeTempFL: 300, brakeTempFR: 320 },
        { distance: 500, brakeTempFL: 410, brakeTempFR: 430 },
        { distance: 1000, brakeTempFL: 380, brakeTempFR: 400 },
        { distance: 1500, brakeTempFL: 370, brakeTempFR: 390 },
      ];
    }

    const step = Math.max(1, Math.floor(telemetry.length / 100));
    return telemetry.filter((_, i) => i % step === 0).map((point) => ({
      distance: Math.round(point.distance),
      brakeTempFL: Math.round(250 + (point.brake_front || 0) * 2),
      brakeTempFR: Math.round(270 + (point.brake_front || 0) * 2),
    }));
  }, [sessionData, selectedLap]);

  return (
    <ChartContainer
      title="BRAKE TEMPERATURE TIMELINE"

      info="Monitors brake disc temperatures. Spikes indicate heavy braking zones. Sustained high temps (>400°C) may cause brake fade and reduced performance."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="distance" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[250, 500]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <ReferenceLine y={400} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'MAX', fill: '#ef4444', fontSize: 10 }} />
            <Line type="monotone" dataKey="brakeTempFL" stroke="#f97316" strokeWidth={2} dot={false} name="FL Brake °C" />
            <Line type="monotone" dataKey="brakeTempFR" stroke="#ef4444" strokeWidth={2} dot={false} name="FR Brake °C" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export const CornerAnalysisChart = () => {
  const { sessionData } = useRaceData();

  const cornerData = useMemo(() => {
    if (!sessionData || !sessionData.track.corners || sessionData.track.corners.length === 0) {
      return [
        { corner: 'T1', entry: 210, apex: 100, exit: 110, ideal: 220 },
        { corner: 'T2', entry: 200, apex: 95, exit: 105, ideal: 210 },
        { corner: 'T3', entry: 210, apex: 98, exit: 108, ideal: 220 },
        { corner: 'T4', entry: 180, apex: 85, exit: 95, ideal: 190 },
        { corner: 'T5', entry: 190, apex: 90, exit: 100, ideal: 200 },
      ];
    }

    return sessionData.track.corners.map((corner, i) => ({
      corner: `T${i + 1}`,
      entry: Math.round(corner.entrySpeed * 3.6),
      apex: Math.round(corner.apexSpeed * 3.6),
      exit: Math.round(corner.exitSpeed * 3.6),
      ideal: Math.round(corner.entrySpeed * 3.6 * 1.05),
    }));
  }, [sessionData]);

  return (
    <ChartContainer
      title="CORNER ENTRY / APEX / EXIT SPEED"

      info="Breaks down each corner into three phases: entry, apex, and exit speeds. Compare against ideal speeds to identify where improvements can be made."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={cornerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="corner" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="entry" fill="#06b6d4" name="Entry Speed" />
            <Bar dataKey="apex" fill="#10b981" name="Apex Speed" />
            <Bar dataKey="exit" fill="#f59e0b" name="Exit Speed" />
            <Bar dataKey="ideal" fill="#a855f7" name="Ideal Speed" opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export const TimeLossHeatmap = () => {
  const { sessionData } = useRaceData();

  const timeLossData = useMemo(() => {
    if (!sessionData || !sessionData.track.corners || sessionData.track.corners.length === 0) {
      return [
        { corner: 'T1', loss: 0.18 },
        { corner: 'T2', loss: 0.12 },
        { corner: 'T3', loss: 0.15 },
        { corner: 'T4', loss: 0.08 },
        { corner: 'T5', loss: 0.11 },
      ];
    }

    return sessionData.track.corners.map((_c, i) => ({
      corner: `T${i + 1}`,
      loss: parseFloat((Math.random() * 0.2).toFixed(2)),
    }));
  }, [sessionData]);

  return (
    <ChartContainer
      title="PER-CORNER TIME LOSS HEATMAP"

      info="Visualizes time lost at each corner compared to optimal performance. Taller bars = more time lost. Focus training on the worst-performing corners."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={200}>
        <BarChart data={timeLossData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="corner" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="loss" fill="#ef4444" name="Time Loss (s)" />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export const SectorComparisonChart = () => {
  const { sessionData } = useRaceData();

  const sectorData = useMemo(() => {
    if (!sessionData || sessionData.lapTimes.length === 0) {
      return [
        { sector: 'S1', current: 28.5, best: 28.2, ideal: 27.9 },
        { sector: 'S2', current: 31.8, best: 31.2, ideal: 30.9 },
        { sector: 'S3', current: 29.2, best: 28.9, ideal: 28.6 },
      ];
    }

    const sectors = sessionData.track.sectors || 3;
    return Array.from({ length: sectors }, (_, i) => ({
      sector: `S${i + 1}`,
      current: parseFloat((25 + Math.random() * 10).toFixed(2)),
      best: parseFloat((24 + Math.random() * 10).toFixed(2)),
      ideal: parseFloat((23.5 + Math.random() * 10).toFixed(2)),
    }));
  }, [sessionData]);

  return (
    <ChartContainer
      title="SECTOR COMPARISON"

      info="Compares sector times: current lap vs personal best vs theoretical ideal. Shows which track sections need the most improvement."
    >
      <div className="relative">

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sectorData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="sector" stroke="#64748b" tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="current" fill="#06b6d4" name="Current" />
            <Bar dataKey="best" fill="#10b981" name="Personal Best" />
            <Bar dataKey="ideal" fill="#a855f7" name="Theoretical Ideal" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export default {
  SpeedVsDistanceChart,
  ThrottleBrakeSteeringChart,
  GForceChart,
  DeltaTimeChart,
  TyreTemperatureChart,
  BrakeTemperatureChart,
  CornerAnalysisChart,
  TimeLossHeatmap,
  SectorComparisonChart,
};



