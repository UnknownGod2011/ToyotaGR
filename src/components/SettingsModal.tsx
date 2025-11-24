/**
 * Settings Modal Component
 * Author: Tanush Shah
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Zap, Database, Bell } from 'lucide-react';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [theme, setTheme] = useState('dark');
  const [refreshRate, setRefreshRate] = useState('60');
  const [dataQuality, setDataQuality] = useState('high');
  const [notifications, setNotifications] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-xl shadow-2xl shadow-cyan-500/20 z-[101] max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
              <h2 className="text-2xl font-bold font-mono text-cyan-400 tracking-wider">
                SETTINGS
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-red-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Display Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Monitor className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-mono">DISPLAY</h3>
                </div>
                
                <div className="space-y-3 pl-7">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 font-mono focus:outline-none focus:border-cyan-400"
                    >
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">
                      Refresh Rate: {refreshRate} FPS
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      step="30"
                      value={refreshRate}
                      onChange={(e) => setRefreshRate(e.target.value)}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-mono mt-1">
                      <span>30</span>
                      <span>60</span>
                      <span>90</span>
                      <span>120</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-mono">PERFORMANCE</h3>
                </div>
                
                <div className="space-y-3 pl-7">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">
                      Data Quality
                    </label>
                    <select
                      value={dataQuality}
                      onChange={(e) => setDataQuality(e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 font-mono focus:outline-none focus:border-cyan-400"
                    >
                      <option value="high">High (All Data Points)</option>
                      <option value="medium">Medium (Sampled)</option>
                      <option value="low">Low (Performance Mode)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Database className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-mono">DATA</h3>
                </div>
                
                <div className="space-y-3 pl-7">
                  <button className="w-full bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 text-red-400 font-mono hover:bg-red-500/30 transition-colors">
                    Clear Cache
                  </button>
                  <button className="w-full bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 text-yellow-400 font-mono hover:bg-yellow-500/30 transition-colors">
                    Reset to Defaults
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Bell className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-mono">NOTIFICATIONS</h3>
                </div>
                
                <div className="space-y-3 pl-7">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="w-5 h-5 accent-cyan-500"
                    />
                    <span className="text-sm font-mono text-gray-400">
                      Enable performance alerts
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-cyan-500/30">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 border border-cyan-500/50 rounded-lg text-cyan-400 font-mono hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-mono hover:from-cyan-400 hover:to-blue-400 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
