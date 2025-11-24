/**
 * Help Modal Component
 * Author: Tanush Shah
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Keyboard, Zap, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-xl shadow-2xl shadow-cyan-500/20 z-[101] max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
              <h2 className="text-2xl font-bold font-mono text-cyan-400 tracking-wider">
                HELP & DOCUMENTATION
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
              {/* Getting Started */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-mono">GETTING STARTED</h3>
                </div>
                
                <div className="space-y-3 pl-7 text-sm text-gray-400 font-mono">
                  <div>
                    <p className="text-cyan-300 font-bold mb-1">1. Select Data Source</p>
                    <p>Choose between Track Only, Race Database, or Upload Data modes.</p>
                  </div>
                  <div>
                    <p className="text-cyan-300 font-bold mb-1">2. Load Track</p>
                    <p>Select a circuit from the dropdown menu to load track geometry.</p>
                  </div>
                  <div>
                    <p className="text-cyan-300 font-bold mb-1">3. Analyze Data</p>
                    <p>Navigate through 3D Visualization, Race Insights, and Strategy pages.</p>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Keyboard className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-mono">KEYBOARD SHORTCUTS</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pl-7">
                  <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm font-mono">Space</span>
                      <span className="text-cyan-400 text-xs">Play/Pause</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm font-mono">←/→</span>
                      <span className="text-cyan-400 text-xs">Navigate Laps</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm font-mono">R</span>
                      <span className="text-cyan-400 text-xs">Reset View</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm font-mono">H</span>
                      <span className="text-cyan-400 text-xs">Toggle Help</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-mono">KEY FEATURES</h3>
                </div>
                
                <div className="space-y-3 pl-7 text-sm text-gray-400 font-mono">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Real-time telemetry analysis with AI-powered insights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>3D track visualization with racing line comparison</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Corner-by-corner performance breakdown</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Lap time predictions and strategy recommendations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Multi-vehicle comparison and analysis</span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Info className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-mono">ABOUT</h3>
                </div>
                
                <div className="pl-7 text-sm text-gray-400 font-mono space-y-2">
                  <p>
                    <span className="text-cyan-400 font-bold">Toyota GR Race Analysis</span> is a professional
                    motorsport telemetry analysis platform designed for driver training and performance optimization.
                  </p>
                  <p className="text-xs text-gray-500">
                    Version 1.0.0 • Built by Tanush Shah • © 2025
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-cyan-500/30">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-mono hover:from-cyan-400 hover:to-blue-400 transition-colors"
              >
                Got It!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
