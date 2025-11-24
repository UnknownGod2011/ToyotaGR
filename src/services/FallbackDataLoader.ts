/**
 * Fallback Data Loader
 * Loads static sample data when real telemetry is unavailable
 * Author: Tanush Shah
 */

import { TelemetryPoint, LapData } from './DataParser';

export interface FallbackTelemetryData {
  metadata: {
    source: string;
    track: string;
    lapTime: number;
    description: string;
  };
  telemetry: Array<{
    distance: number;
    speed: number;
    throttle: number;
    brake: number;
    steering: number;
    accx: number;
    accy: number;
    gear: number;
    rpm: number;
  }>;
  corners: Array<{
    id: string;
    name: string;
    distance: number;
    entrySpeed: number;
    apexSpeed: number;
    exitSpeed: number;
    type: string;
  }>;
  lapTimes: Array<{
    lap: number;
    lapTime: number;
  }>;
}

export class FallbackDataLoader {
  private static instance: FallbackDataLoader;
  private fallbackData: FallbackTelemetryData | null = null;

  private constructor() {}

  static getInstance(): FallbackDataLoader {
    if (!FallbackDataLoader.instance) {
      FallbackDataLoader.instance = new FallbackDataLoader();
    }
    return FallbackDataLoader.instance;
  }

  async loadFallbackData(): Promise<FallbackTelemetryData> {
    if (this.fallbackData) {
      return this.fallbackData;
    }

    try {
      const response = await fetch('/fallback/telemetry_sample.json');
      if (!response.ok) {
        throw new Error('Failed to load fallback data');
      }
      this.fallbackData = await response.json();
      console.log('📦 [FallbackDataLoader] Loaded static sample data');
      return this.fallbackData;
    } catch (error) {
      console.error('❌ [FallbackDataLoader] Failed to load fallback data:', error);
      // Return minimal fallback if file doesn't exist
      return this.getMinimalFallback();
    }
  }

  convertToTelemetryPoints(fallbackData: FallbackTelemetryData): TelemetryPoint[] {
    return fallbackData.telemetry.map((point, index) => ({
      timestamp: new Date(Date.now() + index * 100).toISOString(),
      lap: 1,
      distance: point.distance,
      speed: point.speed / 3.6, // Convert km/h to m/s
      throttle: point.throttle,
      brake_front: point.brake,
      brake_rear: point.brake * 0.8,
      steering: point.steering,
      gear: point.gear,
      rpm: point.rpm,
      accx: point.accx,
      accy: point.accy,
      latitude: 0,
      longitude: 0,
      vehicleNumber: 0,
    }));
  }

  convertToLapTimes(fallbackData: FallbackTelemetryData): LapData[] {
    return fallbackData.lapTimes.map((lap) => ({
      lap: lap.lap,
      lapTime: lap.lapTime,
      timestamp: new Date().toISOString(),
      vehicleId: 'FALLBACK',
      vehicleNumber: 0,
    }));
  }

  private getMinimalFallback(): FallbackTelemetryData {
    return {
      metadata: {
        source: 'Static Sample (Fallback)',
        track: 'Generic Circuit',
        lapTime: 90.0,
        description: 'Minimal fallback data',
      },
      telemetry: [
        { distance: 0, speed: 120, throttle: 80, brake: 0, steering: 0, accx: 0.5, accy: 0.5, gear: 4, rpm: 6500 },
        { distance: 500, speed: 200, throttle: 100, brake: 0, steering: 10, accx: 1.5, accy: 0.2, gear: 6, rpm: 8000 },
        { distance: 1000, speed: 100, throttle: 0, brake: 100, steering: -20, accx: -1.8, accy: -2.0, gear: 3, rpm: 5500 },
        { distance: 1500, speed: 150, throttle: 90, brake: 0, steering: 5, accx: 0.8, accy: 1.0, gear: 5, rpm: 7200 },
        { distance: 2000, speed: 180, throttle: 100, brake: 0, steering: 0, accx: 0.2, accy: 0.5, gear: 6, rpm: 7800 },
      ],
      corners: [
        { id: 'T1', name: 'Turn 1', distance: 500, entrySpeed: 200, apexSpeed: 100, exitSpeed: 120, type: 'slow' },
      ],
      lapTimes: [
        { lap: 1, lapTime: 90.0 },
      ],
    };
  }

  isFallbackData(data: any): boolean {
    return data?.metadata?.source === 'Static Sample (Fallback)';
  }
}

export const fallbackDataLoader = FallbackDataLoader.getInstance();
