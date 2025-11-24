/**
 * Real Data Loader
 * Loads and processes CSV files from Race_Data folder
 * Author: Tanush Shah
 */

import { dataParser, TelemetryPoint, LapData, WeatherData, DriverBestLaps } from './DataParser';
import { analyticsEngine, CornerData, Insight, LapPrediction, OptimalLap } from './AnalyticsEngine';
import { DatabaseTrack, DatabaseSession } from '../contexts/RaceDatabaseContext';

export interface TrackInfo {
  id: string;
  name: string;
  folder: string;
  races: number[];
}

export const AVAILABLE_TRACKS: TrackInfo[] = [
  { id: 'barber', name: 'Barber Motorsports Park', folder: 'barber-motorsports-park/barber', races: [1, 2] },
  { id: 'cota', name: 'Circuit of the Americas', folder: 'circuit-of-the-americas/COTA', races: [1, 2] },
  { id: 'indianapolis', name: 'Indianapolis Motor Speedway', folder: 'indianapolis/indianapolis', races: [1, 2] },
  { id: 'road-america', name: 'Road America', folder: 'road-america/Road America', races: [1, 2] },
  { id: 'sebring', name: 'Sebring International Raceway', folder: 'sebring/sebring/Sebring', races: [1, 2] },
  { id: 'sonoma', name: 'Sonoma Raceway', folder: 'sonoma/Sonoma', races: [1, 2] },
  { id: 'vir', name: 'Virginia International Raceway', folder: 'virginia-international-raceway/VIR', races: [1, 2] },
];

export interface RealSessionData {
  track: {
    name: string;
    length: number;
    corners: CornerData[];
    sectors: number;
  };
  telemetry: Map<number, TelemetryPoint[]>;
  lapTimes: LapData[];
  weather: WeatherData[];
  bestLaps: DriverBestLaps[];
  insights: Insight[];
  prediction: LapPrediction | null;
  optimalLap: OptimalLap | null;
  vehicleNumbers: number[];
}

export class RealDataLoader {
  private static instance: RealDataLoader;
  private constructor() { }
  static getInstance(): RealDataLoader {
    if (!RealDataLoader.instance) {
      RealDataLoader.instance = new RealDataLoader();
    }
    return RealDataLoader.instance;
  }

  /** Load data for a selected session from the database */
  async loadSessionData(track: DatabaseTrack, session: DatabaseSession, vehicleNumber?: number): Promise<RealSessionData> {
    console.log(`Loading session data for ${track.name}, Session ${session.name}...`);
    const processedPath = `tracks/${track.id}/mapped_telemetry.csv`;
    try {
      const head = await fetch(`/${processedPath}`, { method: 'HEAD' });
      if (head.ok) {
        const csvText = await (await fetch(`/${processedPath}`)).text();
        return this.parseProcessedData(csvText, track, vehicleNumber);
      }
    } catch (error) { console.debug('No processed data found', error); }
    // Fallback to raw CSVs
    const telemetryFile = session.files.find((f: string) => f.includes('telemetry'));
    const lapTimeFile = session.files.find((f: string) => f.includes('lap_time'));
    const weatherFile = session.files.find((f: string) => f.includes('Weather'));
    const bestLapsFile = session.files.find((f: string) => f.includes('Best 10 Laps'));
    if (!telemetryFile || !lapTimeFile) {
      throw new Error(`Missing required files for session ${session.name}`);
    }
    const sessionPath = `${track.path}/${session.path}`;
    const [telemetryCSV, lapTimeCSV, weatherCSV, bestLapsCSV] = await Promise.all([
      this.loadCSVFile(`${sessionPath}/${telemetryFile}`),
      this.loadCSVFile(`${sessionPath}/${lapTimeFile}`),
      weatherFile ? this.loadCSVFile(`${sessionPath}/${weatherFile}`) : Promise.resolve(''),
      bestLapsFile ? this.loadCSVFile(`${sessionPath}/${bestLapsFile}`) : Promise.resolve(''),
    ]);
    const allTelemetry = dataParser.parseTelemetryCSV(telemetryCSV);
    const allLapTimes = dataParser.parseLapTimeCSV(lapTimeCSV);
    const weather = weatherFile ? dataParser.parseWeatherCSV(weatherCSV) : [];
    const bestLaps = bestLapsFile ? dataParser.parseBestLapsCSV(bestLapsCSV) : [];
    return this.processParsedData(allTelemetry, allLapTimes, weather, bestLaps, track, vehicleNumber);
  }

  /** Parse pre‑processed CSV produced by map_telemetry_to_track */
  private async parseProcessedData(csvText: string, track: { id: string; name: string }, vehicleNumber?: number): Promise<RealSessionData> {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',');
    const idx = (col: string) => header.indexOf(col);
    const telemetryByLap = new Map<number, TelemetryPoint[]>();
    const lapTimes: LapData[] = [];
    const vehicleNumbers = new Set<number>();
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const vNum = parseInt(values[idx('VehicleNumber')]);
      if (vehicleNumber !== undefined && vNum !== vehicleNumber) continue;
      vehicleNumbers.add(vNum);
      const lap = parseInt(values[idx('Lap')]);
      const dist = parseFloat(values[idx('Distance')]);
      const point: TelemetryPoint = {
        lap,
        distance: dist,
        vehicleNumber: vNum,
        timestamp: new Date().toISOString(),
        speed: parseFloat(values[idx('speed')]) || 0,
        throttle: parseFloat(values[idx('aps')]) || 0,
        brake_front: parseFloat(values[idx('pbrake_f')]) || 0,
        brake_rear: parseFloat(values[idx('pbrake_r')]) || 0,
        steering: parseFloat(values[idx('Steering_Angle')]) || 0,
        gear: parseInt(values[idx('gear')]) || 0,
        rpm: parseFloat(values[idx('nmot')]) || 0,
        accx: parseFloat(values[idx('accx_can')]) || 0,
        accy: parseFloat(values[idx('accy_can')]) || 0,
        latitude: parseFloat(values[idx('VBOX_Lat_Min')]) || 0,
        longitude: parseFloat(values[idx('VBOX_Long_Minutes')]) || 0,
      };
      if (!telemetryByLap.has(lap)) {
        telemetryByLap.set(lap, []);
        lapTimes.push({ lap, lapTime: 0, sector1: 0, sector2: 0, sector3: 0, valid: true, vehicleNumber: vNum, timestamp: point.timestamp, vehicleId: vNum.toString() });
      }
      telemetryByLap.get(lap)!.push(point);
    }
    // Compute lap times
    telemetryByLap.forEach((pts, lap) => {
      let time = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = pts[i].distance - pts[i - 1].distance;
        const v = (pts[i].speed + pts[i - 1].speed) / 2 / 3.6;
        if (v > 1) time += d / v;
        pts[i].time = time;
      }
      const lt = lapTimes.find(l => l.lap === lap);
      if (lt) lt.lapTime = time;
    });
    const corners = analyticsEngine.detectCorners(Array.from(telemetryByLap.values())[0] || []);
    // Load ML optimal lap if present
    let mlOptimalLap: OptimalLap | null = null;
    try {
      const modelPath = `tracks/${track.id}/models/ideal_lap.csv`;
      const resp = await fetch(`/${modelPath}`);
      if (resp.ok) mlOptimalLap = this.parseIdealLap(await resp.text());
    } catch (error) { console.debug('No ML model found', error); }
    return {
      track: { name: track.name, length: 0, corners, sectors: 3 },
      telemetry: telemetryByLap,
      lapTimes,
      weather: [],
      bestLaps: [],
      insights: [],
      prediction: null,
      optimalLap: mlOptimalLap,
      vehicleNumbers: Array.from(vehicleNumbers).sort((a, b) => a - b),
    };
  }

  /** Parse the CSV generated by the ML training script */
  private parseIdealLap(csvText: string): OptimalLap {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',');
    const distIdx = header.indexOf('Distance');
    const speedIdx = header.indexOf('predicted_speed');
    const segments: Array<{ distance: number; speed: number; throttle: number; brake: number; steering: number; source: 'optimized' }> = [];
    let time = 0;
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',');
      const dist = parseFloat(vals[distIdx]);
      const speed = parseFloat(vals[speedIdx]);
      if (i > 1) {
        const prevDist = parseFloat(lines[i - 1].split(',')[distIdx]);
        const prevSpeed = parseFloat(lines[i - 1].split(',')[speedIdx]);
        const d = dist - prevDist;
        const v = (speed + prevSpeed) / 2 / 3.6;
        if (v > 1) time += d / v;
      }
      segments.push({ distance: dist, speed, throttle: 0, brake: 0, steering: 0, source: 'optimized' as const });
    }
    return { theoreticalBestTime: time, segments, improvementAreas: ['ML Optimized Speed Profile'], potentialTimeGain: 0 };
  }

  /** Process raw parsed telemetry */
  private processParsedData(
    allTelemetry: TelemetryPoint[],
    allLapTimes: LapData[],
    weather: WeatherData[],
    bestLaps: DriverBestLaps[],
    track: { id: string; name: string },
    vehicleNumber?: number
  ): RealSessionData {
    let telemetry = allTelemetry;
    let lapTimes = allLapTimes;
    if (vehicleNumber !== undefined) {
      telemetry = allTelemetry.filter(t => t.vehicleNumber === vehicleNumber);
      lapTimes = allLapTimes.filter(l => l.vehicleNumber === vehicleNumber);
    }
    const vehicleNumbers = Array.from(new Set(allLapTimes.map(l => l.vehicleNumber))).sort((a, b) => a - b);
    const telemetryWithDistance = dataParser.calculateDistanceBasedTelemetry(telemetry);
    const telemetryByLap = dataParser.groupTelemetryByLap(telemetryWithDistance);
    console.log(`Grouped into ${telemetryByLap.size} laps`);
    const bestLapData = this.findBestLap(lapTimes);
    const bestLapTelemetry = bestLapData ? telemetryByLap.get(bestLapData.lap) : null;
    const corners = bestLapTelemetry ? analyticsEngine.detectCorners(bestLapTelemetry) : [];
    const trackLength = bestLapTelemetry && bestLapTelemetry.length > 0 ? bestLapTelemetry[bestLapTelemetry.length - 1].distance : 0;
    const currentLapTelemetry = Array.from(telemetryByLap.values())[telemetryByLap.size - 1] || [];
    const insights = bestLapTelemetry && currentLapTelemetry.length > 0 ? analyticsEngine.generateInsights(currentLapTelemetry, bestLapTelemetry, corners) : [];
    const recentLaps = Array.from(telemetryByLap.values()).slice(-5);
    const prediction = recentLaps.length > 0 ? analyticsEngine.predictNextLap(recentLaps, lapTimes, telemetryByLap.size) : null;
    const allLaps = Array.from(telemetryByLap.values());
    const optimalLap = allLaps.length > 0 ? analyticsEngine.constructOptimalLap(allLaps) : null;
    console.log('Data loading complete!');
    return {
      track: { name: track.name, length: trackLength, corners, sectors: 3 },
      telemetry: telemetryByLap,
      lapTimes,
      weather,
      bestLaps,
      insights,
      prediction,
      optimalLap,
      vehicleNumbers,
    };
  }

  /** Load legacy CSV data */
  async loadRaceData(
    trackId: string,
    raceNumber: number,
    vehicleNumber?: number
  ): Promise<RealSessionData> {
    const track = AVAILABLE_TRACKS.find(t => t.id === trackId);
    if (!track) throw new Error(`Track ${trackId} not found`);
    console.log(`Loading real data for ${track.name}, Race ${raceNumber}...`);
    const folderPath = trackId === 'cota' ? `${track.folder} ${raceNumber}` : track.folder;
    const telemetryFile = `R${raceNumber}_${this.getTrackFileName(trackId)}_telemetry_data.csv`;
    const lapTimeFile = trackId === 'cota' ? `COTA_lap_time_R${raceNumber}.csv` : `R${raceNumber}_${this.getTrackFileName(trackId)}_lap_time.csv`;
    const [telemetryCSV, lapTimeCSV, weatherCSV, bestLapsCSV] = await Promise.all([
      this.loadCSVFile(`Race_Data/${folderPath}/${telemetryFile}`),
      this.loadCSVFile(`Race_Data/${folderPath}/${lapTimeFile}`),
      this.loadCSVFile(`Race_Data/${folderPath}/26_Weather_Race ${raceNumber}_Anonymized.CSV`),
      this.loadCSVFile(`Race_Data/${folderPath}/99_Best 10 Laps By Driver_Race ${raceNumber}_Anonymized.CSV`),
    ]);
    const allTelemetry = dataParser.parseTelemetryCSV(telemetryCSV);
    const allLapTimes = dataParser.parseLapTimeCSV(lapTimeCSV);
    const weather = dataParser.parseWeatherCSV(weatherCSV);
    const bestLaps = dataParser.parseBestLapsCSV(bestLapsCSV);
    return this.processParsedData(allTelemetry, allLapTimes, weather, bestLaps, track, vehicleNumber);
  }

  private async loadCSVFile(path: string): Promise<string> {
    console.log(`Attempting to load: /${path}`);
    const response = await fetch(`/${path}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} - File not found: /${path}\n\nPlease ensure the Race_Data folder is in the public directory.`);
    }
    const text = await response.text();
    console.log(`Successfully loaded ${path} (${text.length} bytes)`);
    return text;
  }

  private getTrackFileName(trackId: string): string {
    const map: Record<string, string> = {
      barber: 'barber',
      cota: 'cota',
      indianapolis: 'indianapolis_motor_speedway',
      'road-america': 'road_america',
      sebring: 'sebring',
      sonoma: 'sonoma',
      vir: 'vir',
    };
    return map[trackId] || trackId;
  }

  private findBestLap(lapTimes: LapData[]): LapData | null {
    if (lapTimes.length === 0) return null;
    let best = lapTimes[0];
    for (const lap of lapTimes) {
      if (lap.lapTime > 0 && lap.lapTime < best.lapTime) best = lap;
    }
    return best.lapTime > 0 ? best : null;
  }

  async parseUploadedData(csvContent: string): Promise<{ telemetry: TelemetryPoint[]; lapTimes: LapData[] }> {
    const telemetry = dataParser.parseTelemetryCSV(csvContent);
    const telemetryWithDistance = dataParser.calculateDistanceBasedTelemetry(telemetry);
    const telemetryByLap = dataParser.groupTelemetryByLap(telemetryWithDistance);
    const lapTimes: LapData[] = [];
    for (const [lapNum, lapTelemetry] of telemetryByLap.entries()) {
      if (lapTelemetry.length > 1) {
        const start = new Date(lapTelemetry[0].timestamp).getTime();
        const end = new Date(lapTelemetry[lapTelemetry.length - 1].timestamp).getTime();
        const lapTime = (end - start) / 1000;
        if (lapTime > 0 && lapTime < 300) {
          lapTimes.push({ lap: lapNum, lapTime, timestamp: lapTelemetry[0].timestamp, vehicleId: 'USER-UPLOAD', vehicleNumber: 0 });
        }
      }
    }
    return { telemetry: telemetryWithDistance, lapTimes };
  }
}

export const realDataLoader = RealDataLoader.getInstance();
