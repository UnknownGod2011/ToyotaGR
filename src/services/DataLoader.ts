/**
 * Toyota GR Racing - Data Loader Service
 * Loads and processes real race data from Race_Data folder
 */

import { dataParser, TelemetryPoint, LapData, WeatherData, DriverBestLaps } from './DataParser';
import { analyticsEngine, CornerData, Insight, LapPrediction, OptimalLap } from './AnalyticsEngine';

export interface TrackData {
  name: string;
  length: number; // in meters
  corners: CornerData[];
  sectors: number; // number of sectors
}

export interface SessionData {
  track: TrackData;
  telemetry: Map<number, TelemetryPoint[]>; // lap number -> telemetry points
  lapTimes: LapData[];
  weather: WeatherData[];
  bestLaps: DriverBestLaps[];
  insights: Insight[];
  prediction: LapPrediction | null;
  optimalLap: OptimalLap | null;
}

export class DataLoader {
  private static instance: DataLoader;
  private sessionData: SessionData | null = null;
  private loading: boolean = false;

  private constructor() { }

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  /**
   * Load race data for a specific track and race
   */
  async loadRaceData(track: string, race: number): Promise<SessionData> {
    this.loading = true;
    console.log(`Loading race data for ${track} race ${race}`);
    try {
      // For demo purposes, we'll use Barber data
      // In production, this would dynamically load based on track parameter
      const telemetryData = await this.loadTelemetryData();
      const lapTimeData = await this.loadLapTimeData();
      const weatherData = await this.loadWeatherData();
      const bestLapsData = await this.loadBestLapsData();

      // Parse telemetry
      const telemetryPoints = dataParser.parseTelemetryCSV(telemetryData);
      const telemetryWithDistance = dataParser.calculateDistanceBasedTelemetry(telemetryPoints);
      const telemetryByLap = dataParser.groupTelemetryByLap(telemetryWithDistance);

      // Parse lap times
      const lapTimes = dataParser.parseLapTimeCSV(lapTimeData);

      // Parse weather
      const weather = dataParser.parseWeatherCSV(weatherData);

      // Parse best laps
      const bestLaps = dataParser.parseBestLapsCSV(bestLapsData);

      // Detect corners from best lap
      const bestLapTelemetry = this.findBestLapTelemetry(telemetryByLap, lapTimes);
      const corners = bestLapTelemetry ? analyticsEngine.detectCorners(bestLapTelemetry) : [];

      // Calculate track length
      const trackLength = bestLapTelemetry && bestLapTelemetry.length > 0
        ? bestLapTelemetry[bestLapTelemetry.length - 1].distance
        : 0;

      // Generate insights
      const currentLapTelemetry = Array.from(telemetryByLap.values())[telemetryByLap.size - 1] || [];
      const insights = bestLapTelemetry
        ? analyticsEngine.generateInsights(currentLapTelemetry, bestLapTelemetry, corners)
        : [];

      // Generate prediction
      const recentLaps = Array.from(telemetryByLap.values()).slice(-5);
      const prediction = recentLaps.length > 0
        ? analyticsEngine.predictNextLap(recentLaps, lapTimes, telemetryByLap.size)
        : null;

      // Construct optimal lap
      const allLaps = Array.from(telemetryByLap.values());
      const optimalLap = allLaps.length > 0
        ? analyticsEngine.constructOptimalLap(allLaps)
        : null;

      this.sessionData = {
        track: {
          name: this.getTrackName(track),
          length: trackLength,
          corners,
          sectors: 3,
        },
        telemetry: telemetryByLap,
        lapTimes,
        weather,
        bestLaps,
        insights,
        prediction,
        optimalLap,
      };

      this.loading = false;
      return this.sessionData;
    } catch (error) {
      console.error('Error loading race data:', error);
      this.loading = false;
      throw error;
    }
  }

  /**
   * Get current session data
   */
  getSessionData(): SessionData | null {
    return this.sessionData;
  }

  /**
   * Check if data is loading
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Get telemetry for a specific lap
   */
  getLapTelemetry(lapNumber: number): TelemetryPoint[] | null {
    if (!this.sessionData) return null;
    return this.sessionData.telemetry.get(lapNumber) || null;
  }

  /**
   * Get best lap telemetry
   */
  getBestLapTelemetry(): TelemetryPoint[] | null {
    if (!this.sessionData) return null;
    return this.findBestLapTelemetry(
      this.sessionData.telemetry,
      this.sessionData.lapTimes
    );
  }

  /**
   * Get comparison data for two laps
   */
  getComparisonData(lap1: number, lap2: number): {
    lap1: TelemetryPoint[];
    lap2: TelemetryPoint[];
    deltaTime: number[];
  } | null {
    if (!this.sessionData) return null;

    const telemetry1 = this.sessionData.telemetry.get(lap1);
    const telemetry2 = this.sessionData.telemetry.get(lap2);

    if (!telemetry1 || !telemetry2) return null;

    // Calculate delta time at each distance point
    const deltaTime: number[] = [];
    for (let i = 0; i < Math.min(telemetry1.length, telemetry2.length); i++) {
      const time1 = new Date(telemetry1[i].timestamp).getTime();
      const time2 = new Date(telemetry2[i].timestamp).getTime();
      deltaTime.push((time1 - time2) / 1000);
    }

    return {
      lap1: telemetry1,
      lap2: telemetry2,
      deltaTime,
    };
  }

  // Private helper methods

  private async loadTelemetryData(): Promise<string> {
    // In a real implementation, this would fetch from the file system
    // For now, return empty string as placeholder
    return '';
  }

  private async loadLapTimeData(): Promise<string> {
    return '';
  }

  private async loadWeatherData(): Promise<string> {
    return '';
  }

  private async loadBestLapsData(): Promise<string> {
    return '';
  }

  private findBestLapTelemetry(
    telemetryByLap: Map<number, TelemetryPoint[]>,
    lapTimes: LapData[]
  ): TelemetryPoint[] | null {
    if (lapTimes.length === 0) return null;

    // Find lap with best time
    let bestLap = lapTimes[0];
    for (const lap of lapTimes) {
      if (lap.lapTime > 0 && lap.lapTime < bestLap.lapTime) {
        bestLap = lap;
      }
    }

    return telemetryByLap.get(bestLap.lap) || null;
  }

  private getTrackName(track: string): string {
    const trackNames: Record<string, string> = {
      'barber': 'Barber Motorsports Park',
      'cota': 'Circuit of the Americas',
      'indianapolis': 'Indianapolis Motor Speedway',
      'road-america': 'Road America',
      'sebring': 'Sebring International Raceway',
      'sonoma': 'Sonoma Raceway',
      'vir': 'Virginia International Raceway',
    };

    return trackNames[track] || track;
  }
}

export const dataLoader = DataLoader.getInstance();
