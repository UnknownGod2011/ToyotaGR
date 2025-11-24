/**
 * 2D Track Map Component
 * Better representation of the actual track with racing line
 * Author: Tanush Shah
 */

import { useEffect, useRef, useState } from 'react';
import { useRaceData } from '../contexts/RaceDataContext';
import { motion } from 'framer-motion';

export default function TrackMap2D() {
  const { trackGeometry, getSelectedLapTelemetry, selectedTrackId, sessionData } = useRaceData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [carPosition, setCarPosition] = useState(0);
  const [car2Position, setCarPosition2] = useState(0.15);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get track points
    let trackPoints: { x: number; y: number }[] = [];

    console.log('🗺️ [TrackMap2D] Rendering:', {
      hasTrackGeometry: !!trackGeometry,
      trackName: trackGeometry?.trackName,
      selectedTrackId,
      pointsCount: trackGeometry?.points?.length || 0
    });

    if (trackGeometry && trackGeometry.points.length > 0) {
      console.log(`✅ [TrackMap2D] Using real track geometry: ${trackGeometry.trackName} (${trackGeometry.points.length} points)`);
      trackPoints = trackGeometry.points;
    } else {
      console.log('⚠️ [TrackMap2D] Using default track shape');
      // Default track shape
      const segments = 100;
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const x = Math.cos(t) + Math.cos(t * 3) * 0.3;
        const y = Math.sin(t) + Math.sin(t * 2) * 0.4;
        trackPoints.push({ x, y });
      }
    }

    // Calculate bounds
    const minX = Math.min(...trackPoints.map(p => p.x));
    const maxX = Math.max(...trackPoints.map(p => p.x));
    const minY = Math.min(...trackPoints.map(p => p.y));
    const maxY = Math.max(...trackPoints.map(p => p.y));

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const scale = Math.min(width / rangeX, height / rangeY) * 0.8;
    const offsetX = width / 2 - ((minX + maxX) / 2) * scale;
    const offsetY = height / 2 - ((minY + maxY) / 2) * scale;

    // Transform point
    const transform = (p: { x: number; y: number }) => ({
      x: p.x * scale + offsetX,
      y: p.y * scale + offsetY,
    });

    // Draw track background (grass)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw track surface with sector colors
    const transformedPoints = trackPoints.map(transform);
    const sectorsCount = 3;
    const pointsPerSector = Math.floor(transformedPoints.length / sectorsCount);

    // Draw each sector with different color
    const sectorColors = ['#1a1a1a', '#1a1a2a', '#1a2a1a'];
    for (let sector = 0; sector < sectorsCount; sector++) {
      ctx.beginPath();
      const startIdx = sector * pointsPerSector;
      const endIdx = sector === sectorsCount - 1 ? transformedPoints.length : (sector + 1) * pointsPerSector;

      for (let i = startIdx; i < endIdx; i++) {
        const p = transformedPoints[i];
        if (i === startIdx) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }

      ctx.lineWidth = 40;
      ctx.strokeStyle = sectorColors[sector];
      ctx.stroke();
    }

    // Draw track borders (red/white kerbs)
    ctx.beginPath();
    transformedPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.lineWidth = 42;
    ctx.strokeStyle = '#ef4444';
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw racing line
    const telemetry = getSelectedLapTelemetry();
    if (telemetry && telemetry.length > 0) {
      ctx.beginPath();
      const step = Math.max(1, Math.floor(telemetry.length / 200));
      telemetry.filter((_, i) => i % step === 0).forEach((point, i) => {
        const lat = point.latitude || 0;
        const lon = point.longitude || 0;

        // Simple projection (would need proper conversion in production)
        const x = lon * scale + offsetX;
        const y = lat * scale + offsetY;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      // Draw ideal racing line
      ctx.beginPath();
      transformedPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw car positions
    if (transformedPoints.length > 0) {
      // Red Car (P1)
      const carIndex = Math.floor((carPosition % 1) * transformedPoints.length);
      const carPoint = transformedPoints[carIndex];

      ctx.beginPath();
      ctx.arc(carPoint.x, carPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(carPoint.x, carPoint.y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Blue Car (P2)
      const car2Index = Math.floor((car2Position % 1) * transformedPoints.length);
      const car2Point = transformedPoints[car2Index];

      ctx.beginPath();
      ctx.arc(car2Point.x, car2Point.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(car2Point.x, car2Point.y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw corner markers
    if (trackGeometry && trackGeometry.corners) {
      trackGeometry.corners.forEach((corner, i) => {
        const cornerPoint = transform({ x: corner.position.x || 0, y: corner.position.y || 0 });

        // Corner number
        ctx.beginPath();
        ctx.arc(cornerPoint.x, cornerPoint.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, cornerPoint.x, cornerPoint.y);
      });
    }

  }, [trackGeometry, selectedTrackId, getSelectedLapTelemetry, carPosition, car2Position, sessionData]);

  // Animate cars
  useEffect(() => {
    const interval = setInterval(() => {
      setCarPosition(prev => (prev + 0.002) % 1);
      setCarPosition2(prev => (prev + 0.0018) % 1); // Slightly slower
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-cyan-500/30 overflow-hidden relative"
    >
      {/* Track Name Label */}
      <div className="absolute top-4 left-4 bg-slate-950/90 border border-cyan-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
        <div className="text-xs font-mono text-gray-400 mb-1">TRACK</div>
        <div className="text-lg font-bold font-mono text-cyan-400">
          {trackGeometry?.trackName || selectedTrackId || 'Generic Circuit'}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-cyan-500/30 rounded-lg p-3 backdrop-blur-sm">
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-cyan-400 rounded" style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)' }} />
            <span className="text-gray-400">Racing Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            <span className="text-gray-400">P1 (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
            <span className="text-gray-400">P2 (Blue)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-gray-400">Corner Markers</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
