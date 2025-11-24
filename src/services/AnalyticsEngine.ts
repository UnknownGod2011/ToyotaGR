// src/services/AnalyticsEngine.ts
/**
 * Analytics Engine
 * Generates insights, predictions, and optimal lap analysis
 */
import { TelemetryPoint, LapData } from './DataParser';

export interface CornerData {
  id: string;
  name: string;
  entryDistance: number;
  apexDistance: number;
  exitDistance: number;
  entrySpeed: number;
  apexSpeed: number;
  exitSpeed: number;
  brakePoint: number;
  brakeDistance: number;
  maxLateralG: number;
  type: 'slow' | 'medium' | 'fast';
}

export interface Insight {
  id: string;
  category: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  evidence: string;
  suggestion: string;
  timeGain: number;
  corner?: string;
  lapNumber?: number;
}

export interface LapPrediction {
  predictedLapTime: number;
  confidence: number;
  tyreDegradation: number;
  fuelRemaining: number;
  brakeTempForecast: { FL: number; FR: number; RL: number; RR: number };
  tyreTempForecast: { FL: number; FR: number; RL: number; RR: number };
  recommendedAdjustments: string[];
}

export interface OptimalLap {
  theoreticalBestTime: number;
  segments: Array<{
    distance: number;
    speed: number;
    throttle: number;
    brake: number;
    steering: number;
    source: 'actual' | 'optimized';
  }>;
  improvementAreas: string[];
  potentialTimeGain: number;
}

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  private mlPredictions: LapPrediction[] = [];
  private constructor() { }

  static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  /** Detect corners from telemetry data */
  detectCorners(telemetry: TelemetryPoint[]): CornerData[] {
    const corners: CornerData[] = [];
    let cornerId = 1;
    for (let i = 10; i < telemetry.length - 10; i++) {
      const point = telemetry[i];
      const lateralG = Math.abs(point.accx);
      if (lateralG > 0.8) {
        let entryIdx = i;
        for (let j = i - 10; j < i; j++) {
          if (telemetry[j].brake_front > 20 || telemetry[j].brake_rear > 20) {
            entryIdx = j;
            break;
          }
        }
        let apexIdx = i;
        let minSpeed = point.speed;
        for (let j = i - 5; j < i + 5 && j < telemetry.length; j++) {
          if (telemetry[j].speed < minSpeed) {
            minSpeed = telemetry[j].speed;
            apexIdx = j;
          }
        }
        let exitIdx = i;
        for (let j = i; j < i + 10 && j < telemetry.length; j++) {
          if (telemetry[j].throttle > 80) {
            exitIdx = j;
            break;
          }
        }
        let brakeDistance = 0;
        for (let j = entryIdx; j < apexIdx; j++) {
          if (telemetry[j].brake_front > 20 || telemetry[j].brake_rear > 20) {
            brakeDistance += telemetry[j + 1].distance - telemetry[j].distance;
          }
        }
        let type: 'slow' | 'medium' | 'fast' = 'medium';
        if (minSpeed < 80) type = 'slow';
        else if (minSpeed > 140) type = 'fast';
        corners.push({
          id: `T${cornerId}`,
          name: `Turn ${cornerId}`,
          entryDistance: telemetry[entryIdx].distance,
          apexDistance: telemetry[apexIdx].distance,
          exitDistance: telemetry[exitIdx].distance,
          entrySpeed: telemetry[entryIdx].speed,
          apexSpeed: minSpeed,
          exitSpeed: telemetry[exitIdx].speed,
          brakePoint: telemetry[entryIdx].distance,
          brakeDistance,
          maxLateralG: lateralG,
          type,
        });
        cornerId++;
        i = exitIdx + 5;
      }
    }
    return corners;
  }

  /** Generate insights from telemetry analysis */
  generateInsights(currentLap: TelemetryPoint[], bestLap: TelemetryPoint[], corners: CornerData[]): Insight[] {
    const insights: Insight[] = [];
    let insightId = 1;
    
    // Analyze braking points
    for (const corner of corners) {
      const currentBrake = this.findBrakePoint(currentLap, corner.entryDistance);
      const bestBrake = this.findBrakePoint(bestLap, corner.entryDistance);
      if (currentBrake && bestBrake) {
        const diff = currentBrake.distance - bestBrake.distance;
        if (diff > 10) {
          insights.push({
            id: `insight-${insightId++}`,
            category: 'BRAKING',
            severity: 'warning',
            title: `Early Braking - ${corner.name}`,
            description: `Brake point ${Math.abs(diff).toFixed(0)}m earlier than optimal`,
            evidence: `Brake at ${currentBrake.distance.toFixed(0)}m vs optimal ${bestBrake.distance.toFixed(0)}m`,
            suggestion: `Delay brake by ${Math.abs(diff).toFixed(0)}m, increase initial pressure`,
            timeGain: Math.abs(diff) * 0.015,
            corner: corner.id,
          });
        } else if (diff < -10) {
          insights.push({
            id: `insight-${insightId++}`,
            category: 'BRAKING',
            severity: 'critical',
            title: `Late Braking - ${corner.name}`,
            description: `Brake point ${Math.abs(diff).toFixed(0)}m later than optimal`,
            evidence: `Brake at ${currentBrake.distance.toFixed(0)}m vs optimal ${bestBrake.distance.toFixed(0)}m`,
            suggestion: `Brake earlier by ${Math.abs(diff).toFixed(0)}m to avoid lock-up`,
            timeGain: Math.abs(diff) * 0.02,
            corner: corner.id,
          });
        }
      }
    }
    
    // Analyze apex speeds
    for (const corner of corners) {
      const currentApex = this.findApexPoint(currentLap, corner.apexDistance);
      const bestApex = this.findApexPoint(bestLap, corner.apexDistance);
      if (currentApex && bestApex) {
        const speedDiff = bestApex.speed - currentApex.speed;
        if (speedDiff > 5) {
          insights.push({
            id: `insight-${insightId++}`,
            category: 'APEX SPEED',
            severity: speedDiff > 10 ? 'critical' : 'warning',
            title: `Apex Speed Deficit - ${corner.name}`,
            description: `Carrying ${speedDiff.toFixed(1)} km/h less than optimal through apex`,
            evidence: `${(currentApex.speed * 3.6).toFixed(0)} km/h vs ideal ${(bestApex.speed * 3.6).toFixed(0)} km/h`,
            suggestion: `Later turn-in, smoother steering input, maintain throttle`,
            timeGain: speedDiff * 0.02,
            corner: corner.id,
          });
        }
      }
    }
    
    // Analyze throttle application
    const throttleDelays = this.analyzeThrottleDelay(currentLap, bestLap, corners);
    if (throttleDelays.avgDelay > 0.2) {
      insights.push({
        id: `insight-${insightId++}`,
        category: 'THROTTLE',
        severity: 'warning',
        title: `Throttle Delay at Apex`,
        description: `Average ${throttleDelays.avgDelay.toFixed(1)}s delay in throttle application post-apex`,
        evidence: `Measured across ${throttleDelays.corners.join(', ')}`,
        suggestion: `Earlier throttle application, progressive power delivery`,
        timeGain: throttleDelays.avgDelay * 0.15,
      });
    }
    
    // Analyze steering smoothness
    const steeringAnalysis = this.analyzeSteeringSmoothness(currentLap, corners);
    if (steeringAnalysis.corrections > 8) {
      insights.push({
        id: `insight-${insightId++}`,
        category: 'STEERING',
        severity: 'info',
        title: `Excessive Steering Correction`,
        description: `${steeringAnalysis.corrections} micro-corrections detected`,
        evidence: `Steering angle variance: ±${steeringAnalysis.variance.toFixed(1)}°`,
        suggestion: `Smoother initial turn-in, trust the grip`,
        timeGain: 0.08,
        corner: steeringAnalysis.worstCorner,
      });
    }
    
    // Analyze understeer
    const understeerEvents = this.detectUndersteer(currentLap, corners);
    for (const event of understeerEvents) {
      insights.push({
        id: `insight-${insightId++}`,
        category: 'UNDERSTEER',
        severity: 'warning',
        title: `Understeer Event Detected`,
        description: `Front tyre slip angle exceeded optimal range`,
        evidence: `${event.corner} entry: ${event.slipAngle.toFixed(1)}° slip vs ${event.optimal.toFixed(1)}° optimal`,
        suggestion: `Reduce entry speed by ${event.speedReduction.toFixed(0)} km/h, earlier turn-in`,
        timeGain: 0.11,
        corner: event.corner,
      });
    }
    
    // Analyze tyre temperature balance
    const tyreBalance = this.analyzeTyreBalance(currentLap);
    if (tyreBalance.imbalance > 5) {
      insights.push({
        id: `insight-${insightId++}`,
        category: 'TYRE BALANCE',
        severity: 'info',
        title: `Tyre Temperature Imbalance`,
        description: `${tyreBalance.side} running ${tyreBalance.imbalance.toFixed(0)}°C hotter`,
        evidence: `FL: ${tyreBalance.FL.toFixed(0)}°C, FR: ${tyreBalance.FR.toFixed(0)}°C`,
        suggestion: `Adjust brake bias ${tyreBalance.brakeBiasAdjust}, review suspension setup`,
        timeGain: 0.05,
      });
    }
    
    return insights;
  }
  
  private findApexPoint(telemetry: TelemetryPoint[], targetDistance: number): TelemetryPoint | null {
    let minSpeed = Infinity;
    let apexPoint: TelemetryPoint | null = null;
    for (const point of telemetry) {
      if (Math.abs(point.distance - targetDistance) < 20 && point.speed < minSpeed) {
        minSpeed = point.speed;
        apexPoint = point;
      }
    }
    return apexPoint;
  }
  
  private analyzeThrottleDelay(currentLap: TelemetryPoint[], bestLap: TelemetryPoint[], corners: CornerData[]): { avgDelay: number; corners: string[] } {
    let totalDelay = 0;
    const affectedCorners: string[] = [];
    
    for (const corner of corners) {
      const currentApexIdx = currentLap.findIndex(p => Math.abs(p.distance - corner.apexDistance) < 10);
      const bestApexIdx = bestLap.findIndex(p => Math.abs(p.distance - corner.apexDistance) < 10);
      
      if (currentApexIdx >= 0 && bestApexIdx >= 0) {
        let currentThrottleIdx = currentApexIdx;
        let bestThrottleIdx = bestApexIdx;
        
        while (currentThrottleIdx < currentLap.length && currentLap[currentThrottleIdx].throttle < 50) currentThrottleIdx++;
        while (bestThrottleIdx < bestLap.length && bestLap[bestThrottleIdx].throttle < 50) bestThrottleIdx++;
        
        const delay = (currentThrottleIdx - currentApexIdx) - (bestThrottleIdx - bestApexIdx);
        if (delay > 2) {
          totalDelay += delay * 0.1;
          affectedCorners.push(corner.id);
        }
      }
    }
    
    return { avgDelay: totalDelay / Math.max(1, affectedCorners.length), corners: affectedCorners };
  }
  
  private analyzeSteeringSmoothness(telemetry: TelemetryPoint[], corners: CornerData[]): { corrections: number; variance: number; worstCorner: string } {
    let maxCorrections = 0;
    let worstCorner = 'T1';
    
    for (const corner of corners) {
      const cornerPoints = telemetry.filter(p => 
        p.distance >= corner.entryDistance && p.distance <= corner.exitDistance
      );
      
      let corrections = 0;
      let prevDirection = 0;
      for (let i = 1; i < cornerPoints.length; i++) {
        const direction = Math.sign(cornerPoints[i].steering - cornerPoints[i - 1].steering);
        if (direction !== 0 && direction !== prevDirection && prevDirection !== 0) {
          corrections++;
        }
        prevDirection = direction;
      }
      
      if (corrections > maxCorrections) {
        maxCorrections = corrections;
        worstCorner = corner.id;
      }
    }
    
    const steeringAngles = telemetry.map(p => p.steering);
    const variance = Math.sqrt(steeringAngles.reduce((sum, angle) => sum + angle * angle, 0) / steeringAngles.length);
    
    return { corrections: maxCorrections, variance, worstCorner };
  }
  
  private detectUndersteer(telemetry: TelemetryPoint[], corners: CornerData[]): Array<{ corner: string; slipAngle: number; optimal: number; speedReduction: number }> {
    const events: Array<{ corner: string; slipAngle: number; optimal: number; speedReduction: number }> = [];
    
    for (const corner of corners) {
      const entryPoint = telemetry.find(p => Math.abs(p.distance - corner.entryDistance) < 10);
      if (entryPoint && Math.abs(entryPoint.steering) > 30 && Math.abs(entryPoint.accx) < 0.5) {
        const slipAngle = Math.abs(entryPoint.steering) / 3;
        const optimal = 6;
        if (slipAngle > optimal + 2) {
          events.push({
            corner: corner.id,
            slipAngle,
            optimal,
            speedReduction: 3,
          });
        }
      }
    }
    
    return events;
  }
  
  private analyzeTyreBalance(telemetry: TelemetryPoint[]): { imbalance: number; side: string; FL: number; FR: number; brakeBiasAdjust: string } {
    const avgSpeed = telemetry.reduce((sum, p) => sum + p.speed, 0) / telemetry.length;
    const avgLateralG = telemetry.reduce((sum, p) => sum + Math.abs(p.accx), 0) / telemetry.length;
    
    const FL = 85 + avgSpeed * 0.05 + avgLateralG * 3;
    const FR = 88 + avgSpeed * 0.05 + avgLateralG * 3;
    const imbalance = Math.abs(FL - FR);
    
    return {
      imbalance,
      side: FL > FR ? 'Front-left' : 'Front-right',
      FL,
      FR,
      brakeBiasAdjust: FL > FR ? '-2%' : '+2%',
    };
  }

  /** Predict next lap performance */
  predictNextLap(recentLaps: TelemetryPoint[][], lapTimes: LapData[], currentLapNumber: number): LapPrediction {
    // Check for ML prediction
    const mlPrediction = this.mlPredictions[currentLapNumber] || (this.mlPredictions.length > 0 ? this.mlPredictions[this.mlPredictions.length - 1] : null);

    // Calculate trend from recent laps
    const recentTimes = lapTimes.slice(-5).map(l => l.lapTime);
    let trend = 0;
    if (recentTimes.length >= 2) {
      const diffs = [];
      for (let i = 1; i < recentTimes.length; i++) {
        diffs.push(recentTimes[i] - recentTimes[i - 1]);
      }
      trend = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
    }
    
    // Predict next lap time based on trend
    const lastLapTime = lapTimes[lapTimes.length - 1]?.lapTime || 90;
    const predictedTime = lastLapTime + trend;
    
    // Calculate degradation factors
    const tyreDegradation = this.calculateTyreDegradation(recentLaps, currentLapNumber);
    const fuelRemaining = this.calculateFuelRemaining(recentLaps, currentLapNumber);
    const brakeTemp = this.forecastBrakeTemperatures(recentLaps[recentLaps.length - 1] || []);
    const tyreTemp = this.forecastTyreTemperatures(tyreDegradation);
    
    // Adjust prediction based on degradation
    const degradationFactor = tyreDegradation / 100 * 0.5;
    const adjustedPrediction = predictedTime + degradationFactor;
    
    // Calculate confidence based on consistency
    const variance = recentTimes.length > 1 
      ? Math.sqrt(recentTimes.reduce((sum, t) => sum + Math.pow(t - lastLapTime, 2), 0) / recentTimes.length)
      : 0;
    const confidence = Math.max(0.5, Math.min(0.95, 1 - variance / 5));
    
    const adjustments = this.generateRecommendations(recentLaps, trend);

    if (mlPrediction && mlPrediction.confidence > 0.7) {
      return {
        predictedLapTime: mlPrediction.predictedLapTime + degradationFactor,
        confidence: Math.min(mlPrediction.confidence, confidence),
        tyreDegradation,
        fuelRemaining,
        brakeTempForecast: brakeTemp,
        tyreTempForecast: tyreTemp,
        recommendedAdjustments: [...mlPrediction.recommendedAdjustments, ...adjustments],
      };
    }

    return {
      predictedLapTime: adjustedPrediction,
      confidence,
      tyreDegradation,
      fuelRemaining,
      brakeTempForecast: brakeTemp,
      tyreTempForecast: tyreTemp,
      recommendedAdjustments: adjustments,
    };
  }

  /** Helper calculations */
  private calculateTyreDegradation(laps: TelemetryPoint[][], currentLapNumber: number): number {
    if (laps.length < 2) return Math.min(100, currentLapNumber * 2.5);
    const first = laps[0];
    const last = laps[laps.length - 1];
    const avgFirst = first.reduce((s, p) => s + p.speed, 0) / first.length;
    const avgLast = last.reduce((s, p) => s + p.speed, 0) / last.length;
    const loss = Math.max(0, avgFirst - avgLast);
    const perc = (loss / avgFirst) * 100 * 3;
    return Math.min(100, perc + currentLapNumber * 1.5);
  }

  private calculateFuelRemaining(laps: TelemetryPoint[][], currentLapNumber: number): number {
    if (laps.length === 0) return Math.max(0, 100 - currentLapNumber * 3.2);
    let totalThrottle = 0;
    let count = 0;
    for (const lap of laps) {
      for (const p of lap) {
        totalThrottle += p.throttle || 0;
        count++;
      }
    }
    const avgThrottle = count > 0 ? totalThrottle / count : 70;
    const factor = avgThrottle / 100;
    const burn = 3.2 * (0.7 + factor * 0.6);
    return Math.max(0, 100 - currentLapNumber * burn);
  }

  private forecastBrakeTemperatures(lastLap: TelemetryPoint[]): { FL: number; FR: number; RL: number; RR: number } {
    if (!lastLap || lastLap.length === 0) return { FL: 350, FR: 370, RL: 320, RR: 330 };
    const avgBrake = lastLap.reduce((s, p) => s + (p.brake_front || 0), 0) / lastLap.length;
    const base = 300 + avgBrake * 1.8;
    return { FL: base + 10, FR: base + 30, RL: base - 20, RR: base - 10 };
  }

  private forecastTyreTemperatures(tyreDegradation: number): { FL: number; FR: number; RL: number; RR: number } {
    const baseFL = 85;
    const baseFR = 88;
    const baseRL = 82;
    const baseRR = 86;
    const inc = tyreDegradation * 0.15;
    return {
      FL: baseFL + inc,
      FR: baseFR + inc,
      RL: baseRL + inc * 0.8,
      RR: baseRR + inc * 0.8,
    };
  }

  private generateRecommendations(recentLaps: TelemetryPoint[][], trend: number): string[] {
    const rec: string[] = [];
    if (trend > 0.1) {
      rec.push('Lap times degrading - check tyre pressures');
      rec.push('Consider pit stop within 3-5 laps');
    }
    if (recentLaps.length) {
      const last = recentLaps[recentLaps.length - 1];
      const avgThrottle = last.reduce((s, p) => s + p.throttle, 0) / last.length;
      if (avgThrottle < 60) rec.push('Increase throttle confidence in fast corners');
    }
    rec.push('Focus on Turn 3 and Turn 7 improvements');
    rec.push('Maintain smooth steering inputs');
    return rec;
  }

  private findBrakePoint(telemetry: TelemetryPoint[], targetDistance: number): TelemetryPoint | null {
    for (let i = 0; i < telemetry.length; i++) {
      if (telemetry[i].distance >= targetDistance - 50 && (telemetry[i].brake_front > 20 || telemetry[i].brake_rear > 20)) {
        return telemetry[i];
      }
    }
    return null;
  }





  /** Construct optimal lap (simplified) */
  constructOptimalLap(laps: TelemetryPoint[][]): OptimalLap {
    if (!laps.length) return { theoreticalBestTime: 0, segments: [], improvementAreas: [], potentialTimeGain: 0 };
    const distanceMap = new Map<number, TelemetryPoint>();
    for (const lap of laps) {
      for (const p of lap) {
        const key = Math.round(p.distance / 10) * 10;
        const existing = distanceMap.get(key);
        if (!existing || p.speed > existing.speed) distanceMap.set(key, p);
      }
    }
    const segments = Array.from(distanceMap.values())
      .sort((a, b) => a.distance - b.distance)
      .map(p => ({ distance: p.distance, speed: p.speed, throttle: p.throttle, brake: p.brake_front, steering: p.steering, source: 'optimized' as const }));
    let time = 0;
    for (let i = 1; i < segments.length; i++) {
      const d = segments[i].distance - segments[i - 1].distance;
      const avgSp = (segments[i].speed + segments[i - 1].speed) / 2;
      time += d / (avgSp / 3.6);
    }
    return { theoreticalBestTime: time, segments, improvementAreas: ['Turn 3 entry', 'Turn 7 apex'], potentialTimeGain: 0.5 };
  }

  /** Load ML predictions from JSON */
  async loadMLPredictions(): Promise<LapPrediction[]> {
    try {
      const resp = await fetch('/ml_models/predictions.json');
      if (!resp.ok) return [];
      const data = await resp.json();
      if (Array.isArray(data.predictions)) {
        this.mlPredictions = data.predictions.map((p: any) => ({
          predictedLapTime: p.predictedLapTime,
          confidence: p.confidence ?? 0.9,
          tyreDegradation: 0,
          fuelRemaining: 0,
          brakeTempForecast: { FL: 0, FR: 0, RL: 0, RR: 0 },
          tyreTempForecast: { FL: 0, FR: 0, RL: 0, RR: 0 },
          recommendedAdjustments: [],
        }));
        return this.mlPredictions;
      }
      return [];
    } catch (e) {
      console.error('Failed to load ML predictions', e);
      return [];
    }
  }
}

export const analyticsEngine = AnalyticsEngine.getInstance();
