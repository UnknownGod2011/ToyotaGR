/**
 * Data Selection Page
 * Landing page for track and race selection
 * Author: Tanush Shah
 */

import { motion } from 'framer-motion';
import TrackSelector from '../components/TrackSelector';
import { useRaceData } from '../contexts/RaceDataContext';

const DataSelection = () => {
  const { loadRaceData, loadDatabaseSession, loadTrackOnly, uploadTelemetryData, loading, error } = useRaceData();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Title - Single Line - Guaranteed */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-wider whitespace-nowrap">
            TOYOTA GR RACE ANALYSIS • Professional Motorsport Telemetry
          </h1>
        </motion.div>

        {/* Track Selector */}
        <TrackSelector
          onLoadData={loadRaceData}
          onLoadDatabaseSession={loadDatabaseSession}
          onLoadTrackOnly={loadTrackOnly}
          onUploadData={uploadTelemetryData}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <motion.div
            className="mt-6 bg-red-500/20 border-2 border-red-500 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="text-red-400 text-2xl">⚠</div>
              <div>
                <h3 className="text-red-400 font-mono font-bold mb-1">ERROR</h3>
                <p className="text-red-300 font-mono text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          className="mt-8 bg-slate-900/50 border border-cyan-500/30 rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-cyan-400 font-mono font-bold mb-3">SYSTEM CAPABILITIES:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-mono text-gray-400">
            <div>
              <div className="text-cyan-400 mb-1">✓ Real Telemetry Analysis</div>
              <div className="text-cyan-400 mb-1">✓ AI-Powered Insights</div>
              <div className="text-cyan-400 mb-1">✓ Corner Detection</div>
              <div className="text-cyan-400 mb-1">✓ Lap Predictions</div>
            </div>
            <div>
              <div className="text-cyan-400 mb-1">✓ 3D Track Visualization</div>
              <div className="text-cyan-400 mb-1">✓ Performance Optimization</div>
              <div className="text-cyan-400 mb-1">✓ Driver Training</div>
              <div className="text-cyan-400 mb-1">✓ Strategy Analysis</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DataSelection;
