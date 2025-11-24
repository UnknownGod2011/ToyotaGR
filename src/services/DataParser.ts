/**
 * Data Parser Service
 * Parses telemetry data from CSV files
 * Author: Tanush Shah
 */

export interface TelemetryPoint {
  timestamp: string;
  lap: number;
  distance: number;
  speed: number;
  throttle: number; // aps (0-100)
  brake_front: number; // pbrake_f
  brake_rear: number; // pbrake_r
  steering: number; // Steering_Angle
  gear: number;
  rpm: number; // nmot
  accx: number; // accx_can (lateral G)
  accy: number; // accy_can (longitudinal G)
  latitude: number; // VBOX_Lat_Min
  longitude: number; // VBOX_Long_Minutes
  vehicleNumber: number;
  time?: number; // computed time for processed data
}

export interface LapData {
  lap: number;
  lapTime: number; // in seconds
  sector1?: number;
  sector2?: number;
  sector3?: number;
  valid?: boolean;
  vehicleNumber: number;
  timestamp: string;
  vehicleId: string;
}

export interface WeatherData {
  timestamp: string;
  airTemp: number;
  trackTemp: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  rain: number;
}

export interface DriverBestLaps {
  number: number;
  vehicle: string;
  class: string;
  totalLaps: number;
  bestLap: number;
  bestLapNum: number;
  top10Laps: Array<{ time: number; lapNum: number }>;
  average: number;
}

export interface RaceResults {
  position: number;
  number: number;
  vehicle: string;
  class: string;
  laps: number;
  totalTime: string;
  bestLap: number;
  gap: string;
}

export class DataParser {
  private static instance: DataParser;

  private constructor() { }

  static getInstance(): DataParser {
    if (!DataParser.instance) {
      DataParser.instance = new DataParser();
    }
    return DataParser.instance;
  }

  /** Parse telemetry CSV data - supports multiple formats */
  parseTelemetryCSV(csvText: string): TelemetryPoint[] {
    const lines = csvText.trim().split('\n');
    console.log(`📄 [DataParser] Parsing CSV: ${lines.length} lines`);
    if (lines.length < 2) {
      console.warn('⚠️ [DataParser] CSV has less than 2 lines');
      return [];
    }

    const header = lines[0].toLowerCase().split(',');
    console.log(`📋 [DataParser] Columns detected:`, header);

    const hasLongFormat = header.includes('telemetry_name') && header.includes('telemetry_value');
    console.log(`📊 [DataParser] Format: ${hasLongFormat ? 'Long (name/value pairs)' : 'Wide (one row per point)'}`);

    if (hasLongFormat) {
      return this.parseLongFormatCSV(lines);
    } else {
      return this.parseWideFormatCSV(lines, header);
    }
  }

  /** Parse long format CSV (telemetry_name, telemetry_value columns) */
  private parseLongFormatCSV(lines: string[]): TelemetryPoint[] {
    const telemetryMap = new Map<string, Partial<TelemetryPoint>>();
    let skippedLines = 0;
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 13) {
        skippedLines++;
        continue;
      }
      const lap = parseInt(values[1]) || 0;
      const telemetryName = values[8];
      const telemetryValue = parseFloat(values[9]) || 0;
      const timestamp = values[10];
      const vehicleNumber = parseInt(values[12]) || 0;
      const key = `${timestamp}_${lap}_${vehicleNumber}`;
      if (!telemetryMap.has(key)) {
        telemetryMap.set(key, {
          timestamp,
          lap,
          distance: 0,
          speed: 0,
          throttle: 0,
          brake_front: 0,
          brake_rear: 0,
          steering: 0,
          gear: 0,
          rpm: 0,
          accx: 0,
          accy: 0,
          latitude: 0,
          longitude: 0,
          vehicleNumber,
        });
      }
      const point = telemetryMap.get(key)!;
      switch (telemetryName) {
        case 'speed':
          point.speed = telemetryValue;
          break;
        case 'aps':
          point.throttle = telemetryValue;
          break;
        case 'pbrake_f':
          point.brake_front = telemetryValue;
          break;
        case 'pbrake_r':
          point.brake_rear = telemetryValue;
          break;
        case 'Steering_Angle':
          point.steering = telemetryValue;
          break;
        case 'gear':
          point.gear = Math.round(telemetryValue);
          break;
        case 'nmot':
          point.rpm = telemetryValue;
          break;
        case 'accx_can':
          point.accx = telemetryValue;
          break;
        case 'accy_can':
          point.accy = telemetryValue;
          break;
        case 'VBOX_Lat_Min':
          point.latitude = telemetryValue;
          break;
        case 'VBOX_Long_Minutes':
          point.longitude = telemetryValue;
          break;
        case 'Laptrigger_lapdist_dls':
          point.distance = telemetryValue;
          break;
      }
    }
    console.log(`📊 [DataParser] Processed ${telemetryMap.size} unique telemetry points, skipped ${skippedLines} lines`);
    const result = Array.from(telemetryMap.values())
      .filter(p => p.timestamp && p.lap !== undefined)
      .map(p => p as TelemetryPoint)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    console.log(`✅ [DataParser] Returning ${result.length} telemetry points`);
    return result;
  }

  /** Parse wide format CSV (one row = one telemetry point) */
  private parseWideFormatCSV(lines: string[], header: string[]): TelemetryPoint[] {
    console.log(`📊 [DataParser] Parsing wide format CSV`);
    const result: TelemetryPoint[] = [];
    const getIndex = (names: string[]) => {
      for (const name of names) {
        const idx = header.findIndex(h => h.includes(name));
        if (idx >= 0) return idx;
      }
      return -1;
    };
    const indices = {
      lap: getIndex(['lap']),
      timestamp: getIndex(['timestamp', 'time', 'expire_at']),
      speed: getIndex(['speed', 'velocity']),
      throttle: getIndex(['throttle', 'aps', 'ath']),
      brake_f: getIndex(['brake_f', 'pbrake_f', 'brake_front']),
      brake_r: getIndex(['brake_r', 'pbrake_r', 'brake_rear']),
      steering: getIndex(['steering', 'steering_angle']),
      gear: getIndex(['gear']),
      rpm: getIndex(['rpm', 'nmot']),
      accx: getIndex(['accx', 'accx_can', 'lateral_g']),
      accy: getIndex(['accy', 'accy_can', 'longitudinal_g']),
      latitude: getIndex(['lat', 'latitude', 'vbox_lat']),
      longitude: getIndex(['lon', 'longitude', 'vbox_long']),
      distance: getIndex(['distance', 'lapdist', 'laptrigger_lapdist']),
      vehicleNumber: getIndex(['vehicle_number', 'vehicle', 'car']),
    };
    
    console.log(`📋 [DataParser] Column indices:`, indices);
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 3) continue;
      
      const point: TelemetryPoint = {
        timestamp: indices.timestamp >= 0 ? values[indices.timestamp] : new Date().toISOString(),
        lap: indices.lap >= 0 ? parseInt(values[indices.lap]) || 1 : 1,
        distance: indices.distance >= 0 ? parseFloat(values[indices.distance]) || 0 : i * 10,
        speed: indices.speed >= 0 ? parseFloat(values[indices.speed]) || 0 : 0,
        throttle: indices.throttle >= 0 ? parseFloat(values[indices.throttle]) || 0 : 0,
        brake_front: indices.brake_f >= 0 ? parseFloat(values[indices.brake_f]) || 0 : 0,
        brake_rear: indices.brake_r >= 0 ? parseFloat(values[indices.brake_r]) || 0 : 0,
        steering: indices.steering >= 0 ? parseFloat(values[indices.steering]) || 0 : 0,
        gear: indices.gear >= 0 ? parseInt(values[indices.gear]) || 0 : 0,
        rpm: indices.rpm >= 0 ? parseFloat(values[indices.rpm]) || 0 : 0,
        accx: indices.accx >= 0 ? parseFloat(values[indices.accx]) || 0 : 0,
        accy: indices.accy >= 0 ? parseFloat(values[indices.accy]) || 0 : 0,
        latitude: indices.latitude >= 0 ? parseFloat(values[indices.latitude]) || 0 : 0,
        longitude: indices.longitude >= 0 ? parseFloat(values[indices.longitude]) || 0 : 0,
        vehicleNumber: indices.vehicleNumber >= 0 ? parseInt(values[indices.vehicleNumber]) || 0 : 0,
      };
      
      if (isNaN(point.speed) || point.speed < 0) continue;
      result.push(point);
    }
    
    console.log(`✅ [DataParser] Parsed ${result.length} telemetry points (wide format)`);
    
    // Interpolate missing values
    return this.interpolateMissingValues(result);
  }
  
  /** Interpolate missing telemetry values */
  private interpolateMissingValues(telemetry: TelemetryPoint[]): TelemetryPoint[] {
    if (telemetry.length < 2) return telemetry;
    
    for (let i = 1; i < telemetry.length - 1; i++) {
      const prev = telemetry[i - 1];
      const curr = telemetry[i];
      const next = telemetry[i + 1];
      
      // Interpolate speed if missing
      if (curr.speed === 0 && prev.speed > 0 && next.speed > 0) {
        curr.speed = (prev.speed + next.speed) / 2;
      }
      
      // Interpolate throttle if missing
      if (curr.throttle === 0 && prev.throttle > 0 && next.throttle > 0) {
        curr.throttle = (prev.throttle + next.throttle) / 2;
      }
      
      // Interpolate brake if missing
      if (curr.brake_front === 0 && prev.brake_front > 0 && next.brake_front > 0) {
        curr.brake_front = (prev.brake_front + next.brake_front) / 2;
      }
      
      // Interpolate G-forces if missing
      if (curr.accx === 0 && prev.accx !== 0 && next.accx !== 0) {
        curr.accx = (prev.accx + next.accx) / 2;
      }
      if (curr.accy === 0 && prev.accy !== 0 && next.accy !== 0) {
        curr.accy = (prev.accy + next.accy) / 2;
      }
    }
    
    return telemetry;
  }

  /** Parse lap time CSV data */
  parseLapTimeCSV(csvText: string): LapData[] {
    const lines = csvText.trim().split('\n');
    const laps: LapData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 10) continue;
      const lap = parseInt(values[1]) || 0;
      const timestamp = values[9];
      const vehicleId = values[10];
      const vehicleNumber = parseInt(values[11]) || 0;
      laps.push({ lap, lapTime: 0, timestamp, vehicleId, vehicleNumber });
    }
    for (let i = 1; i < laps.length; i++) {
      const prev = new Date(laps[i - 1].timestamp).getTime();
      const curr = new Date(laps[i].timestamp).getTime();
      laps[i].lapTime = (curr - prev) / 1000;
    }
    return laps.filter(l => l.lapTime > 0 && l.lapTime < 300);
  }

  /** Parse weather CSV data */
  parseWeatherCSV(csvText: string): WeatherData[] {
    const lines = csvText.trim().split('\n');
    const weather: WeatherData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';');
      if (values.length < 9) continue;
      weather.push({
        timestamp: values[1],
        airTemp: parseFloat(values[2]) || 0,
        trackTemp: parseFloat(values[3]) || 0,
        humidity: parseFloat(values[4]) || 0,
        pressure: parseFloat(values[5]) || 0,
        windSpeed: parseFloat(values[6]) || 0,
        windDirection: parseFloat(values[7]) || 0,
        rain: parseFloat(values[8]) || 0,
      });
    }
    return weather;
  }

  /** Parse best laps CSV data */
  parseBestLapsCSV(csvText: string): DriverBestLaps[] {
    const lines = csvText.trim().split('\n');
    const drivers: DriverBestLaps[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';');
      if (values.length < 24) continue;
      const top10Laps: Array<{ time: number; lapNum: number }> = [];
      for (let j = 0; j < 10; j++) {
        const timeStr = values[4 + j * 2];
        const lapNum = parseInt(values[5 + j * 2]) || 0;
        if (timeStr) {
          const time = this.parseTimeString(timeStr);
          if (time > 0) top10Laps.push({ time, lapNum });
        }
      }
      drivers.push({
        number: parseInt(values[0]) || 0,
        vehicle: values[1],
        class: values[2],
        totalLaps: parseInt(values[3]) || 0,
        bestLap: top10Laps[0]?.time || 0,
        bestLapNum: top10Laps[0]?.lapNum || 0,
        top10Laps,
        average: this.parseTimeString(values[24]) || 0,
      });
    }
    return drivers;
  }

  /** Calculate distance based telemetry if missing or ensure sorting */
  calculateDistanceBasedTelemetry(telemetry: TelemetryPoint[]): TelemetryPoint[] {
    // Ensure sorted by timestamp
    const sorted = [...telemetry].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // If distance is missing or 0 for all points, calculate it
    const hasDistance = sorted.some(p => p.distance > 0);
    if (!hasDistance) {
      let dist = 0;
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
        if (timeDiff > 0) {
          const speed = (prev.speed + curr.speed) / 2 / 3.6; // m/s
          dist += speed * timeDiff;
        }
        curr.distance = dist;
      }
    }
    return sorted;
  }

  /** Group telemetry by lap */
  groupTelemetryByLap(telemetry: TelemetryPoint[]): Map<number, TelemetryPoint[]> {
    const map = new Map<number, TelemetryPoint[]>();
    for (const point of telemetry) {
      if (!map.has(point.lap)) {
        map.set(point.lap, []);
      }
      map.get(point.lap)!.push(point);
    }
    return map;
  }

  /** Parse time string (MM:SS.mmm) to seconds */
  private parseTimeString(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
}

export const dataParser = DataParser.getInstance();
