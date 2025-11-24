/**
 * Telemetry Upload Component
 * Allows users to upload lap telemetry data
 * Author: Tanush Shah
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { telemetryUploadService, CleanedTelemetryData } from '../services/TelemetryUploadService';

interface TelemetryUploadProps {
  onUploadComplete: (data: CleanedTelemetryData) => void;
  onClose: () => void;
}

export default function TelemetryUpload({ onUploadComplete, onClose }: TelemetryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState<CleanedTelemetryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await telemetryUploadService.processUploadedFile(file);
      
      if (!result.validation.valid) {
        setError(result.validation.errors.join(', '));
        setUploadResult(null);
      } else {
        setUploadResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setUploadResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (uploadResult) {
      onUploadComplete(uploadResult);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-xl p-8 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-mono text-cyan-400">UPLOAD TELEMETRY</h2>
            <p className="text-sm font-mono text-gray-400 mt-1">
              CSV or JSON format • Automatic validation & cleaning
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-red-400" />
          </button>
        </div>

        {/* Upload Area */}
        {!uploadResult && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-cyan-500/30 hover:border-cyan-500/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleChange}
              className="hidden"
            />

            {uploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-cyan-400 font-mono">Processing telemetry...</p>
              </div>
            ) : (
              <>
                <Upload className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
                <p className="text-lg font-mono text-cyan-400 mb-2">
                  Drop telemetry file here
                </p>
                <p className="text-sm font-mono text-gray-400 mb-4">
                  or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono text-cyan-400"
                >
                  SELECT FILE
                </button>
              </>
            )}
          </div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-red-400 font-bold mb-1">UPLOAD ERROR</p>
                <p className="font-mono text-red-300 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Display */}
        <AnimatePresence>
          {uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-mono text-green-400 font-bold mb-1">UPLOAD SUCCESSFUL</p>
                  <p className="font-mono text-green-300 text-sm">
                    Telemetry data validated and cleaned
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-3">
                  <div className="text-xs font-mono text-gray-400">TOTAL POINTS</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {uploadResult.metadata.totalPoints.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-3">
                  <div className="text-xs font-mono text-gray-400">LAPS</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {uploadResult.metadata.laps}
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-3">
                  <div className="text-xs font-mono text-gray-400">DURATION</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {Math.floor(uploadResult.metadata.duration / 60)}:
                    {String(Math.floor(uploadResult.metadata.duration % 60)).padStart(2, '0')}
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-3">
                  <div className="text-xs font-mono text-gray-400">AVG SPEED</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {uploadResult.metadata.averageSpeed.toFixed(1)} km/h
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {uploadResult.validation.warnings.length > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                  <p className="font-mono text-yellow-400 font-bold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    WARNINGS
                  </p>
                  <ul className="space-y-1">
                    {uploadResult.validation.warnings.map((warning, i) => (
                      <li key={i} className="font-mono text-yellow-300 text-xs">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className="w-full px-6 py-4 bg-green-500/20 border-2 border-green-500/50 rounded-lg hover:bg-green-500/30 transition-colors font-mono text-green-400 font-bold"
              >
                CONFIRM & LOAD DATA
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supported Fields Info */}
        <div className="mt-6 bg-slate-800/30 border border-cyan-500/20 rounded-lg p-4">
          <p className="font-mono text-cyan-400 text-xs font-bold mb-2">SUPPORTED FIELDS:</p>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-gray-400">
            <div>• timestamp</div>
            <div>• lap</div>
            <div>• distance</div>
            <div>• speed</div>
            <div>• throttle</div>
            <div>• brake</div>
            <div>• steering</div>
            <div>• gear</div>
            <div>• rpm</div>
            <div>• accx (lateral G)</div>
            <div>• accy (long G)</div>
            <div>• GPS coords</div>
          </div>
          <p className="font-mono text-gray-500 text-[10px] mt-2">
            Missing fields will be automatically estimated using advanced algorithms
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
