/**
 * 2D Track Map - PRODUCTION VERSION
 * Renders actual track geometry with proper scaling
 * Author: Tanush Shah
 */

import { useEffect, useRef, useState } from 'react';
import { useRaceData } from '../contexts/RaceDataContext';

export default function TrackMap2D() {
  const { trackGeometry, sessionData, selectedTrackId } = useRaceData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [carPosition, setCarPosition] = useState(0);
  const [car2Position, setCarPosition2] = useState(0.15);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    // Get track points
    if (!trackGeometry || !trackGeometry.points || trackGeometry.points.length === 0) {
      console.warn('⚠️ [TrackMap2D] No track geometry available');
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#666';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No track geometry loaded', width / 2, height / 2);
      return;
    }

    console.log(`🗺️ [TrackMap2D] Rendering ${selectedTrackId}: ${trackGeometry.points.length} points, ${trackGeometry.corners?.length || 0} corners`);

    const trackPoints = trackGeometry.points;

    // Calculate bounds
    const xs = trackPoints.map(p => p.x);
    const ys = trackPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const padding = 40;
    const scale = Math.min((width - padding * 2) / rangeX, (height - padding * 2) / rangeY);
    const offsetX = (width - rangeX * scale) / 2 - minX * scale;
    const offsetY = (height - rangeY * scale) / 2 - minY * scale;

    const transform = (p: { x: number; y: number }) => ({
      x: p.x * scale + offsetX,
      y: p.y * scale + offsetY,
    });

    const transformedPoints = trackPoints.map(transform);

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw track surface with sectors
    const sectorsCount = 3;
    const pointsPerSector = Math.floor(transformedPoints.length / sectorsCount);
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

    // Track borders
    ctx.beginPath();
    transformedPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.lineWidth = 44;
    ctx.strokeStyle = '#ef4444';
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Racing line
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

    // Draw cars
    const drawCar = (position: number, color: string) => {
      const carIndex = Math.floor((position % 1) * transformedPoints.length);
      const carPoint = transformedPoints[carIndex];
      
      ctx.beginPath();
      ctx.arc(carPoint.x, carPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(carPoint.x, carPoint.y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    drawCar(carPosition, '#ef4444');
    drawCar(car2Position, '#3b82f6');

    // Draw corner markers
    if (trackGeometry.corners && trackGeometry.corners.length > 0) {
      trackGeometry.corners.forEach((corner) => {
        const cornerPoint = transform(corner.position);
        
        // Corner circle
        ctx.beginPath();
        ctx.arc(cornerPoint.x, cornerPoint.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.fill();
        
        // Corner number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${corner.number}`, cornerPoint.x, cornerPoint.y);
      });
    }

  }, [trackGeometry, selectedTrackId, carPosition, car2Position, sessionData]);

  // Animate cars
  useEffect(() => {
    const interval = setInterval(() => {
      setCarPosition(prev => (prev + 0.002) % 1);
      setCarPosition2(prev => (prev + 0.0018) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-cyan-500/30 overflow-hidden relative">
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
            <span className="text-gray-400">Corners</span>
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="absolute top-4 right-4 bg-slate-950/90 border border-cyan-500/30 rounded-lg p-3 backdrop-blur-sm">
        <div className="text-xs font-mono">
          <div className="text-cyan-400 font-bold mb-1">{trackGeometry?.trackName || 'Loading...'}</div>
          <div className="text-gray-400">Length: {trackGeometry?.length || 0}m</div>
          <div className="text-gray-400">Corners: {trackGeometry?.corners?.length || 0}</div>
        </div>
      </div>
    </div>
  );
}
