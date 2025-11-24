import TrackMap2D from '../components/TrackMap2D';
import CarTelemetryDiagram from '../components/CarTelemetryDiagram';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, Rewind } from 'lucide-react';
import { useState } from 'react';
import { useRaceData } from '../contexts/RaceDataContext';

export default function TrackVisualization() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const { sessionData } = useRaceData();

  console.log('🎬 [TrackVisualization] Rendering:', { hasSessionData: !!sessionData });

  // Always show visualization with fallback data

  // Get lap info
  const currentLapNum = sessionData?.lapTimes.length || 0;
  const bestLap = sessionData?.lapTimes && sessionData.lapTimes.length > 0
    ? sessionData.lapTimes.reduce((best, lap) => lap.lapTime < best.lapTime ? lap : best)
    : null;
  const bestLapTime = bestLap ? bestLap.lapTime : 0;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-mono text-cyan-400 tracking-wider">
            TRACK VISUALIZATION
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            Real-time track replay with telemetry overlay
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="text-[10px] font-mono text-gray-400">STATUS</div>
            <div className="text-sm font-bold font-mono text-green-400">LIVE</div>
          </div>
          <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
            <div className="text-[10px] font-mono text-gray-400">LAP</div>
            <div className="text-sm font-bold font-mono text-cyan-400">{currentLapNum}</div>
          </div>
          <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
            <div className="text-[10px] font-mono text-gray-400">BEST LAP</div>
            <div className="text-sm font-bold font-mono text-purple-400">
              {bestLapTime > 0 ? `${Math.floor(bestLapTime / 60)}:${(bestLapTime % 60).toFixed(3).padStart(6, '0')}` : '--'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Track View - 2D Only */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="h-[500px] relative"
      >
        <TrackMap2D />
      </motion.div>

      {/* Car Telemetry Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CarTelemetryDiagram />
      </motion.div>

      {/* Replay Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-xl border border-cyan-500/30 p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2 bg-green-500/20 border border-green-500/50 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="text-sm font-mono text-green-400">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors">
              <Rewind className="w-4 h-4 text-cyan-400" />
            </button>
            <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors">
              <FastForward className="w-4 h-4 text-cyan-400" />
            </button>
            <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-400">SPEED:</span>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="w-32 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-sm font-mono text-cyan-400 w-12">{playbackSpeed}x</span>
            </div>
            <div className="text-xs font-mono text-gray-400">
              CAMERA: <span className="text-cyan-400">FOLLOW</span>
            </div>
            <button className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors">
              <span className="text-sm font-mono text-red-400">■ STOP</span>
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              style={{ width: '40%' }}
              animate={isPlaying ? { width: ['40%', '45%', '40%'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-500">
            <span>0:00.000</span>
            <span>SECTOR 1</span>
            <span>SECTOR 2</span>
            <span>SECTOR 3</span>
            <span>1:28.456</span>
          </div>
        </div>

        {/* Sector times */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-2">
            <div className="text-[9px] font-mono text-gray-400">SECTOR 1</div>
            <div className="text-sm font-mono text-cyan-400">28.456s</div>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-2">
            <div className="text-[9px] font-mono text-gray-400">SECTOR 2</div>
            <div className="text-sm font-mono text-green-400">31.234s</div>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-2">
            <div className="text-[9px] font-mono text-gray-400">SECTOR 3</div>
            <div className="text-sm font-mono text-purple-400">28.766s</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
