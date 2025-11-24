import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Database, ChevronDown, MapPin } from 'lucide-react';
import TelemetryUpload from './TelemetryUpload';
import { CleanedTelemetryData } from '../services/TelemetryUploadService';
import { useRaceDatabase, DatabaseTrack, DatabaseSession } from '../contexts/RaceDatabaseContext';

interface TrackSelectorProps {
  onLoadData: (trackId: string, raceNumber: number, vehicleNumber?: number) => void;
  onLoadDatabaseSession: (track: DatabaseTrack, session: DatabaseSession, vehicleNumber?: number) => void;
  onLoadTrackOnly: (trackId: string, trackName: string) => void;
  onUploadData: (data: CleanedTelemetryData) => void;
  loading: boolean;
}

const TrackSelector: React.FC<TrackSelectorProps> = ({ onLoadData, onLoadDatabaseSession, onLoadTrackOnly, onUploadData, loading }) => {
  const { database, loading: dbLoading, selectTrack: ctxSelectTrack, selectSession: ctxSelectSession } = useRaceDatabase();
  const [selectedTrack, setSelectedTrack] = useState<DatabaseTrack | null>(null);
  const [selectedSession, setSelectedSession] = useState<DatabaseSession | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [mode, setMode] = useState<'database' | 'track-only' | 'upload'>('track-only');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleTrackChange = (trackId: string) => {
    if (!database) return;
    const track = database.tracks.find(t => t.id === trackId);
    setSelectedTrack(track || null);
    setSelectedSession(null);
    if (track) ctxSelectTrack(track.id);
  };

  const handleSessionChange = (sessionId: string) => {
    if (!selectedTrack) return;
    const session = selectedTrack.sessions.find(s => s.id === sessionId);
    setSelectedSession(session || null);
    if (session) ctxSelectSession(session.id);
  };

  const handleLoadData = () => {
    const vehicle = vehicleNumber ? parseInt(vehicleNumber) : undefined;

    if (mode === 'database' && selectedTrack && selectedSession) {
      onLoadDatabaseSession(selectedTrack, selectedSession, vehicle);
    } else if (selectedTrack) {
      // Legacy or track-only fallback (shouldn't happen for database mode)
      // For track-only, we use handleLoadTrackOnly
      // If we are here, something is wrong or we are reusing this for legacy
      // But we removed legacy AVAILABLE_TRACKS
      // So this path is probably dead code or fallback
      onLoadData(selectedTrack.id, 1, vehicle);
    }
  };

  const handleLoadTrackOnly = () => {
    if (selectedTrack) {
      onLoadTrackOnly(selectedTrack.id, selectedTrack.name);
    }
  };

  const handleUploadComplete = (data: CleanedTelemetryData) => {
    onUploadData(data);
    setShowUploadModal(false);
  };

  if (dbLoading) {
    return <div className="text-cyan-400 font-mono text-center">Loading Database...</div>;
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 rounded-xl border-2 border-cyan-500/40 p-8 backdrop-blur-md shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-mono text-cyan-400 tracking-wider">
          DATA SOURCE
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('track-only')}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${mode === 'track-only'
              ? 'bg-purple-500/30 border-2 border-purple-500 text-purple-400'
              : 'bg-slate-800/50 border border-slate-700 text-gray-400 hover:border-purple-500/50'
              }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            TRACK ONLY
          </button>
          <button
            onClick={() => setMode('database')}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${mode === 'database'
              ? 'bg-cyan-500/30 border-2 border-cyan-500 text-cyan-400'
              : 'bg-slate-800/50 border border-slate-700 text-gray-400 hover:border-cyan-500/50'
              }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            RACE DATABASE
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${mode === 'upload'
              ? 'bg-green-500/30 border-2 border-green-500 text-green-400'
              : 'bg-slate-800/50 border border-slate-700 text-gray-400 hover:border-green-500/50'
              }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            UPLOAD DATA
          </button>
        </div>
      </div>

      {/* Track Selection */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-mono text-gray-400 mb-2">SELECT TRACK</label>
          <div className="relative">
            <select
              value={selectedTrack?.id || ''}
              onChange={(e) => handleTrackChange(e.target.value)}
              className="w-full bg-slate-800/80 border-2 border-cyan-500/50 rounded-lg px-4 py-3 pr-10 font-mono text-cyan-400 appearance-none cursor-pointer hover:border-cyan-500 transition-all focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">Choose a circuit...</option>
              {database?.tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
          </div>
        </div>

        {/* Mode-specific content */}
        {selectedTrack && mode === 'track-only' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm font-mono text-purple-300">
                Load track geometry only. Upload telemetry data later to generate insights.
              </p>
            </div>
            <button
              onClick={handleLoadTrackOnly}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold font-mono py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
            >
              {loading ? 'LOADING TRACK...' : 'LOAD TRACK'}
            </button>
          </motion.div>
        )}

        {selectedTrack && mode === 'database' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">SELECT SESSION</label>
              <div className="grid grid-cols-2 gap-3">
                {selectedTrack.sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionChange(session.id)}
                    className={`px-4 py-3 rounded-lg font-mono font-bold transition-all ${selectedSession?.id === session.id
                      ? 'bg-red-500/30 border-2 border-red-500 text-red-400'
                      : 'bg-slate-800/50 border border-slate-700 text-gray-400 hover:border-red-500/50'
                      }`}
                  >
                    {session.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedSession && (
              <>
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    VEHICLE NUMBER (Optional)
                  </label>
                  <input
                    type="number"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g., 2, 13, 55..."
                    className="w-full bg-slate-800/80 border-2 border-cyan-500/50 rounded-lg px-4 py-3 font-mono text-cyan-400 placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <button
                  onClick={handleLoadData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold font-mono py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
                >
                  {loading ? 'LOADING DATA...' : 'LOAD RACE DATA'}
                </button>
              </>
            )}
          </motion.div>
        )}

        {selectedTrack && mode === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm font-mono text-green-300">
                Upload your own telemetry data (CSV or JSON). Missing values will be automatically handled.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold font-mono py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/50"
            >
              <Upload className="w-5 h-5 inline mr-2" />
              UPLOAD TELEMETRY
            </button>
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <TelemetryUpload
            onUploadComplete={handleUploadComplete}
            onClose={() => setShowUploadModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TrackSelector;
