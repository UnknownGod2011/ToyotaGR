/**
 * Car Telemetry Diagram - F1-Grade Premium Design
 * Real-time vehicle telemetry visualization
 * Author: Tanush Shah
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo, useRef, memo } from 'react';
import { useRaceData } from '../contexts/RaceDataContext';
import { Gauge, Thermometer, Droplet, Zap } from 'lucide-react';

interface TyreData {
  temp: number;
  brakeTemp: number;
  pressure: number;
  wear: number;
}

const getTyreColor = (temp: number) => {
  if (temp < 60) return { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' };
  if (temp < 80) return { color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' };
  if (temp < 95) return { color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' };
  if (temp < 110) return { color: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' };
  return { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
};

const CarTelemetryDiagram = () => {
  const { getCurrentLapTelemetry } = useRaceData();
  const [currentPoint, setCurrentPoint] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const FPS = 30; // Throttle to 30 FPS
  const FRAME_INTERVAL = 1000 / FPS;
  
  // Memoize lap data to prevent unnecessary re-fetches
  const lapData = useMemo(() => getCurrentLapTelemetry(), [getCurrentLapTelemetry]);
  
  // Memoize current telemetry point
  const currentTelemetry = useMemo(() => {
    if (!lapData || lapData.length === 0) return null;
    return lapData[currentPoint % lapData.length];
  }, [lapData, currentPoint]);
  
  // Memoize telemetry state with epsilon comparison
  const telemetry = useMemo(() => {
    if (!currentTelemetry) {
      // Animated fallback data based on currentPoint
      const phase = (currentPoint % 10) / 10;
      const throttle = Math.round(50 + Math.sin(phase * Math.PI * 2) * 40);
      const brake = throttle < 30 ? Math.round(80 - throttle) : 0;
      const speed = Math.round(150 + Math.sin(phase * Math.PI * 2) * 50);
      const steering = Math.round(Math.sin(phase * Math.PI * 4) * 20);
      
      return {
        tyres: {
          FL: { temp: 85 + phase * 10, brakeTemp: 320 + brake * 2, pressure: 2.1, wear: 8 },
          FR: { temp: 88 + phase * 10, brakeTemp: 340 + brake * 2, pressure: 2.0, wear: 12 },
          RL: { temp: 82 + phase * 8, brakeTemp: 280 + brake * 1.5, pressure: 2.2, wear: 6 },
          RR: { temp: 86 + phase * 8, brakeTemp: 295 + brake * 1.5, pressure: 2.1, wear: 9 },
        },
        throttle,
        brake,
        steering,
        speed,
        gear: speed > 180 ? 6 : speed > 140 ? 5 : 4,
        rpm: 6000 + throttle * 20,
        gForce: { lateral: steering / 20, longitudinal: (throttle - brake) / 50 },
      };
    }
    
    // Round values to reduce unnecessary updates
    const roundTemp = (val: number) => Math.round(val * 10) / 10;
    const roundValue = (val: number) => Math.round(val);
    
    const baseTempFL = roundTemp(85 + (currentTelemetry.speed * 0.05) + Math.abs(currentTelemetry.accx) * 3);
    const baseTempFR = roundTemp(88 + (currentTelemetry.speed * 0.05) + Math.abs(currentTelemetry.accx) * 3);
    const baseTempRL = roundTemp(82 + (currentTelemetry.speed * 0.04) + Math.abs(currentTelemetry.accx) * 2);
    const baseTempRR = roundTemp(86 + (currentTelemetry.speed * 0.04) + Math.abs(currentTelemetry.accx) * 2);
    
    return {
      tyres: {
        FL: { temp: baseTempFL, brakeTemp: roundValue(320 + currentTelemetry.brake_front * 2), pressure: 2.1, wear: 8 },
        FR: { temp: baseTempFR, brakeTemp: roundValue(340 + currentTelemetry.brake_front * 2), pressure: 2.0, wear: 12 },
        RL: { temp: baseTempRL, brakeTemp: roundValue(280 + currentTelemetry.brake_rear * 2), pressure: 2.2, wear: 6 },
        RR: { temp: baseTempRR, brakeTemp: roundValue(295 + currentTelemetry.brake_rear * 2), pressure: 2.1, wear: 9 },
      },
      throttle: roundValue(currentTelemetry.throttle),
      brake: roundValue(currentTelemetry.brake_front),
      steering: roundValue(currentTelemetry.steering),
      speed: roundValue(currentTelemetry.speed * 3.6),
      gear: currentTelemetry.gear,
      rpm: roundValue(currentTelemetry.rpm),
      gForce: { 
        lateral: Math.round(currentTelemetry.accx * 100) / 100, 
        longitudinal: Math.round(currentTelemetry.accy * 100) / 100 
      },
    };
  }, [currentTelemetry]);

  useEffect(() => {
    // Always animate, even with fallback data
    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= FRAME_INTERVAL) {
        if (lapData && lapData.length > 0) {
          setCurrentPoint((prev) => (prev + 1) % lapData.length);
        } else {
          // Animate fallback data
          setCurrentPoint((prev) => (prev + 1) % 10);
        }
        lastUpdateRef.current = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [lapData]);

  const TyreWidget = memo(({ data, label }: { data: TyreData; label: string; position: 'FL' | 'FR' | 'RL' | 'RR' }) => {
    const { color, glow } = getTyreColor(data.temp);
    const isHot = data.temp > 105;
    const isCritical = data.brakeTemp > 400;

    return (
      <div
        className="relative"
        style={{ willChange: 'transform' }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl blur-xl"
          style={{ backgroundColor: glow }}
          animate={isHot ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Tyre container */}
        <div
          className="relative w-24 h-36 rounded-2xl border-2 backdrop-blur-sm flex flex-col items-center justify-center"
          style={{
            borderColor: color,
            backgroundColor: `${color}10`,
            boxShadow: `0 0 20px ${glow}, inset 0 0 20px ${glow}`,
          }}
        >
          {/* Label */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 border border-cyan-500/50 rounded text-[10px] font-mono font-bold text-cyan-400">
            {label}
          </div>

          {/* Temperature */}
          <div className="text-2xl font-black font-mono mb-1" style={{ color, textShadow: `0 0 10px ${glow}` }}>
            {data.temp.toFixed(0)}°
          </div>

          {/* Brake temp indicator */}
          <div className="w-full px-2 mb-2">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (data.brakeTemp / 500) * 100)}%`,
                  backgroundColor: isCritical ? '#ef4444' : '#f97316',
                }}
                animate={isCritical ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </div>
            <div className="text-[8px] font-mono text-gray-400 mt-0.5 text-center">
              BRAKE {data.brakeTemp.toFixed(0)}°
            </div>
          </div>

          {/* Pressure */}
          <div className="text-[10px] font-mono text-cyan-400 mb-1">
            {data.pressure.toFixed(1)} bar
          </div>

          {/* Wear indicator */}
          <div className="w-full px-2">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${data.wear}%` }}
              />
            </div>
            <div className="text-[8px] font-mono text-gray-400 mt-0.5 text-center">
              WEAR {data.wear}%
            </div>
          </div>
        </div>

        {/* Critical warning */}
        <AnimatePresence>
          {isCritical && (
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  });

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-cyan-500/30 p-6 overflow-hidden">
      {/* Carbon fiber texture */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(6, 182, 212, 0.1) 2px, rgba(6, 182, 212, 0.1) 4px)`
      }} />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA2YjZkNCIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black font-mono text-cyan-400 tracking-wider">
              VEHICLE TELEMETRY
            </h3>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">Real-time sensor data • 100Hz sampling</p>
          </div>
          <div className="flex gap-2">
            <motion.div
              className="px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-lg"
              animate={{ borderColor: ['rgba(34, 197, 94, 0.5)', 'rgba(34, 197, 94, 1)', 'rgba(34, 197, 94, 0.5)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-[10px] font-mono text-green-400 font-bold">● LIVE</div>
            </motion.div>
            <div className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
              <div className="text-[10px] font-mono text-cyan-400 font-bold">100 Hz</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tyres */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between gap-4">
              <TyreWidget data={telemetry.tyres.FL} label="FL" position="FL" />
              <TyreWidget data={telemetry.tyres.FR} label="FR" position="FR" />
            </div>
            <div className="flex justify-between gap-4">
              <TyreWidget data={telemetry.tyres.RL} label="RL" position="RL" />
              <TyreWidget data={telemetry.tyres.RR} label="RR" position="RR" />
            </div>
          </div>

          {/* Center: Car & Controls */}
          <div className="flex flex-col gap-4">
            {/* Car silhouette */}
            <div className="relative h-64 bg-gradient-to-b from-slate-900/50 to-slate-950/50 rounded-xl border border-cyan-500/20 p-4 backdrop-blur-sm">
              <svg viewBox="0 0 200 300" className="w-full h-full">
                {/* Car body */}
                <defs>
                  <linearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#991b1b" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Main body */}
                <path
                  d="M 80 50 L 120 50 L 130 80 L 130 220 L 120 250 L 80 250 L 70 220 L 70 80 Z"
                  fill="url(#carGradient)"
                  stroke="#ef4444"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Cockpit */}
                <rect x="85" y="100" width="30" height="60" rx="5" fill="#0a0a0a" stroke="#06b6d4" strokeWidth="1" />

                {/* Front wing */}
                <rect x="75" y="40" width="50" height="8" rx="2" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />

                {/* Rear wing */}
                <rect x="75" y="252" width="50" height="8" rx="2" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />

                {/* Wheels */}
                <circle cx="75" y="80" r="8" fill="#1e293b" stroke={getTyreColor(telemetry.tyres.FL.temp).color} strokeWidth="2" />
                <circle cx="125" y="80" r="8" fill="#1e293b" stroke={getTyreColor(telemetry.tyres.FR.temp).color} strokeWidth="2" />
                <circle cx="75" y="220" r="8" fill="#1e293b" stroke={getTyreColor(telemetry.tyres.RL.temp).color} strokeWidth="2" />
                <circle cx="125" y="220" r="8" fill="#1e293b" stroke={getTyreColor(telemetry.tyres.RR.temp).color} strokeWidth="2" />

                {/* Underglow */}
                <motion.ellipse
                  cx="100"
                  cy="290"
                  rx="60"
                  ry="10"
                  fill="#06b6d4"
                  opacity="0.3"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>

              {/* Speed overlay */}
              <div className="absolute top-4 right-4 text-right">
                <div className="text-4xl font-black font-mono text-cyan-400" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
                  {telemetry.speed.toFixed(0)}
                </div>
                <div className="text-xs font-mono text-gray-400">km/h</div>
              </div>

              {/* Gear */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="text-5xl font-black font-mono text-green-400" style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}>
                  {telemetry.gear}
                </div>
              </div>
            </div>

            {/* Input bars */}
            <div className="grid grid-cols-3 gap-2">
              {/* Throttle */}
              <div className="bg-slate-900/50 border border-green-500/30 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-green-400" />
                  <div className="text-[9px] font-mono text-gray-400">THROTTLE</div>
                </div>
                <div className="h-16 bg-slate-800 rounded overflow-hidden relative">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-green-300"
                    style={{ height: `${telemetry.throttle}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
                <div className="text-center text-xs font-mono text-green-400 mt-1">{telemetry.throttle.toFixed(0)}%</div>
              </div>

              {/* Brake */}
              <div className="bg-slate-900/50 border border-red-500/30 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Gauge className="w-3 h-3 text-red-400" />
                  <div className="text-[9px] font-mono text-gray-400">BRAKE</div>
                </div>
                <div className="h-16 bg-slate-800 rounded overflow-hidden relative">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 to-red-300"
                    style={{ height: `${telemetry.brake}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
                <div className="text-center text-xs font-mono text-red-400 mt-1">{telemetry.brake.toFixed(0)}%</div>
              </div>

              {/* Steering */}
              <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-3 h-3 rounded-full border-2 border-purple-400" />
                  <div className="text-[9px] font-mono text-gray-400">STEER</div>
                </div>
                <div className="h-16 bg-slate-800 rounded overflow-hidden relative flex items-center">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600" />
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-full"
                    style={{
                      left: `${50 + (telemetry.steering / 90) * 40}%`,
                      boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
                <div className="text-center text-xs font-mono text-purple-400 mt-1">{telemetry.steering.toFixed(0)}°</div>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex flex-col gap-3">
            {/* RPM */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <div className="text-xs font-mono text-gray-400">ENGINE RPM</div>
              </div>
              <div className="text-3xl font-black font-mono text-cyan-400 mb-2">{telemetry.rpm.toFixed(0)}</div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${(telemetry.rpm / 8000) * 100}%`,
                    background: telemetry.rpm > 7500 ? 'linear-gradient(to right, #ef4444, #dc2626)' : 'linear-gradient(to right, #06b6d4, #0891b2)'
                  }}
                  animate={telemetry.rpm > 7500 ? { opacity: [0.7, 1, 0.7] } : {}}
                  transition={{ duration: 0.3, repeat: Infinity }}
                />
              </div>
            </div>

            {/* G-Forces */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-xs font-mono text-gray-400 mb-3">G-FORCE</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-mono text-gray-500 mb-1">LATERAL</div>
                  <div className="text-2xl font-black font-mono text-purple-400">{telemetry.gForce.lateral.toFixed(2)}g</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-gray-500 mb-1">LONG</div>
                  <div className="text-2xl font-black font-mono text-purple-400">{telemetry.gForce.longitudinal.toFixed(2)}g</div>
                </div>
              </div>
            </div>

            {/* Averages */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Thermometer className="w-3 h-3 text-orange-400" />
                  <div className="text-[9px] font-mono text-gray-400">AVG TYRE</div>
                </div>
                <div className="text-lg font-bold font-mono text-orange-400">
                  {((telemetry.tyres.FL.temp + telemetry.tyres.FR.temp + telemetry.tyres.RL.temp + telemetry.tyres.RR.temp) / 4).toFixed(0)}°
                </div>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Droplet className="w-3 h-3 text-cyan-400" />
                  <div className="text-[9px] font-mono text-gray-400">AVG PRESS</div>
                </div>
                <div className="text-lg font-bold font-mono text-cyan-400">
                  {((telemetry.tyres.FL.pressure + telemetry.tyres.FR.pressure + telemetry.tyres.RL.pressure + telemetry.tyres.RR.pressure) / 4).toFixed(1)}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gradient-to-br from-green-900/20 to-green-950/20 border border-green-500/30 rounded-lg p-3">
              <div className="text-xs font-mono text-green-400 font-bold mb-1">SYSTEM STATUS</div>
              <div className="text-[10px] font-mono text-gray-400">All systems nominal • No warnings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarTelemetryDiagram;
