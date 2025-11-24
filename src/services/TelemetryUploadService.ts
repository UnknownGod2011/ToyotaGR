/**
 * Telemetry Upload Service
 * Handles user telemetry uploads with validation and missing value handling
 * Author: Tanush Shah
 */

import { TelemetryPoint } from './DataParser';

export interface UploadValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
  recordCount: number;
}

export interface CleanedTelemetryData {
  telemetry: TelemetryPoint[];
  validation: UploadValidationResult;
  metadata: {
    totalPoints: number;
    laps: number;
    duration: number;
    averageSpeed: number;
    missingDataHandled: string[];
  };
}

export class TelemetryUploadService {
  private static instance: TelemetryUploadService;

  private constructor() { }

  static getInstance(): TelemetryUploadService {
    if (!TelemetryUploadService.instance) {
      TelemetryUploadService.instance = new TelemetryUploadService();
    }
    return TelemetryUploadService.instance;
  }

  /**
   * Process uploaded telemetry file with full validation and cleaning
   */
  async processUploadedFile(file: File): Promise<CleanedTelemetryData> {
    const content = await file.text();
    const fileType = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv';

    let rawTelemetry: Partial<TelemetryPoint>[];

    if (fileType === 'json') {
      rawTelemetry = this.parseJSON(content);
    } else {
      rawTelemetry = this.parseCSV(content);
    }

    // Validate data
    const validation = this.validateTelemetry(rawTelemetry);

    // Clean and repair data
    const cleanedTelemetry = this.cleanTelemetry(rawTelemetry);

    // Calculate metadata
    const metadata = this.calculateMetadata(cleanedTelemetry);

    return {
      telemetry: cleanedTelemetry,
      validation,
      metadata,
    };
  }

  /**
   * Parse CSV telemetry data
   */
  private parseCSV(content: string): Partial<TelemetryPoint>[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data: Partial<TelemetryPoint>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const point: Partial<TelemetryPoint> = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        if (!value || value === '' || value === 'null' || value === 'undefined') return;

        const numValue = parseFloat(value);

        // Map common field names
        switch (header) {
          case 'timestamp':
          case 'time':
          case 'datetime':
            point.timestamp = value;
            break;
          case 'lap':
          case 'lap_number':
          case 'lapnumber':
            point.lap = parseInt(value) || 0;
            break;
          case 'distance':
          case 'lap_distance':
          case 'lapdistance':
            point.distance = numValue;
            break;
          case 'speed':
          case 'velocity':
          case 'vcar':
            point.speed = numValue;
            break;
          case 'throttle':
          case 'aps':
          case 'throttle_position':
            point.throttle = numValue;
            break;
          case 'brake':
          case 'brake_front':
          case 'pbrake_f':
            point.brake_front = numValue;
            break;
          case 'brake_rear':
          case 'pbrake_r':
            point.brake_rear = numValue;
            break;
          case 'steering':
          case 'steering_angle':
            point.steering = numValue;
            break;
          case 'gear':
            point.gear = Math.round(numValue);
            break;
          case 'rpm':
          case 'nmot':
          case 'engine_rpm':
            point.rpm = numValue;
            break;
          case 'accx':
          case 'accx_can':
          case 'lateral_g':
          case 'lat_g':
            point.accx = numValue;
            break;
          case 'accy':
          case 'accy_can':
          case 'long_g':
          case 'longitudinal_g':
            point.accy = numValue;
            break;
          case 'latitude':
          case 'lat':
          case 'gps_lat':
            point.latitude = numValue;
            break;
          case 'longitude':
          case 'long':
          case 'lon':
          case 'gps_long':
            point.longitude = numValue;
            break;
        }
      });

      if (Object.keys(point).length > 0) {
        data.push(point);
      }
    }

    return data;
  }

  /**
   * Parse JSON telemetry data
   */
  private parseJSON(content: string): Partial<TelemetryPoint>[] {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('JSON parse error:', error);
      return [];
    }
  }

  /**
   * Validate telemetry data
   */
  private validateTelemetry(data: Partial<TelemetryPoint>[]): UploadValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: Set<string> = new Set();

    if (data.length === 0) {
      errors.push('No telemetry data found');
      return { valid: false, errors, warnings, missingFields: [], recordCount: 0 };
    }

    // Check required fields
    const requiredFields: (keyof TelemetryPoint)[] = ['timestamp', 'lap'];
    const optionalFields: (keyof TelemetryPoint)[] = [
      'speed', 'throttle', 'brake_front', 'brake_rear', 'steering',
      'gear', 'rpm', 'accx', 'accy', 'latitude', 'longitude', 'distance'
    ];

    // Check first 10 records for field presence
    const sampleSize = Math.min(10, data.length);
    for (const field of requiredFields) {
      const present = data.slice(0, sampleSize).some(p => p[field] !== undefined);
      if (!present) {
        errors.push(`Required field missing: ${field}`);
      }
    }

    for (const field of optionalFields) {
      const present = data.slice(0, sampleSize).some(p => p[field] !== undefined);
      if (!present) {
        missingFields.add(field);
        warnings.push(`Optional field missing: ${field} (will be estimated)`);
      }
    }

    // Check data quality
    const validTimestamps = data.filter(p => p.timestamp).length;
    if (validTimestamps < data.length * 0.9) {
      warnings.push(`Only ${validTimestamps}/${data.length} records have valid timestamps`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      missingFields: Array.from(missingFields),
      recordCount: data.length,
    };
  }

  /**
   * Clean and repair telemetry data with missing value handling
   */
  private cleanTelemetry(data: Partial<TelemetryPoint>[]): TelemetryPoint[] {
    const cleaned: TelemetryPoint[] = [];

    // Sort by timestamp
    const sorted = data.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    for (let i = 0; i < sorted.length; i++) {
      const point = sorted[i];
      const prev = i > 0 ? cleaned[i - 1] : null;
      const next = i < sorted.length - 1 ? sorted[i + 1] : null;

      const cleaned_point: TelemetryPoint = {
        timestamp: point.timestamp || this.estimateTimestamp(prev, next),
        lap: point.lap ?? prev?.lap ?? 1,
        distance: point.distance ?? this.estimateDistance(prev, point.speed),
        speed: point.speed ?? this.estimateSpeed(prev, next, point.accy),
        throttle: point.throttle ?? this.estimateThrottle(prev, next),
        brake_front: point.brake_front ?? this.estimateBrake(prev, next, point.speed),
        brake_rear: point.brake_rear ?? (point.brake_front ?? 0) * 0.6,
        steering: point.steering ?? this.interpolate(prev?.steering, next?.steering),
        gear: point.gear ?? this.estimateGear(point.speed ?? prev?.speed ?? 0),
        rpm: point.rpm ?? this.estimateRPM(point.speed ?? prev?.speed ?? 0, point.gear),
        accx: point.accx ?? this.estimateAcceleration(prev?.speed, point.speed),
        accy: point.accy ?? 0,
        latitude: point.latitude ?? this.interpolate(prev?.latitude, next?.latitude),
        longitude: point.longitude ?? this.interpolate(prev?.longitude, next?.longitude),
        vehicleNumber: point.vehicleNumber ?? 0,
      };

      cleaned.push(cleaned_point);
    }

    return cleaned;
  }

  /**
   * Estimate missing timestamp
   */
  private estimateTimestamp(prev: TelemetryPoint | null, next: Partial<TelemetryPoint> | null): string {
    if (prev && next?.timestamp) {
      const prevTime = new Date(prev.timestamp).getTime();
      const nextTime = new Date(next.timestamp).getTime();
      return new Date((prevTime + nextTime) / 2).toISOString();
    }
    if (prev) {
      return new Date(new Date(prev.timestamp).getTime() + 100).toISOString();
    }
    return new Date().toISOString();
  }

  /**
   * Estimate missing distance
   */
  private estimateDistance(prev: TelemetryPoint | null, speed?: number): number {
    if (!prev) return 0;
    const dt = 0.1; // Assume 100ms sampling
    const avgSpeed = ((prev.speed + (speed ?? prev.speed)) / 2) / 3.6; // km/h to m/s
    return prev.distance + avgSpeed * dt;
  }

  /**
   * Estimate missing speed
   */
  private estimateSpeed(
    prev: TelemetryPoint | null,
    next: Partial<TelemetryPoint> | null,
    accy?: number
  ): number {
    // Try to use acceleration
    if (prev && accy !== undefined) {
      const dt = 0.1;
      return Math.max(0, prev.speed + accy * 9.81 * dt * 3.6); // Convert to km/h
    }

    // Interpolate
    if (prev && next?.speed !== undefined) {
      return (prev.speed + next.speed) / 2;
    }

    return prev?.speed ?? 0;
  }

  /**
   * Estimate missing throttle
   */
  private estimateThrottle(prev: TelemetryPoint | null, next: Partial<TelemetryPoint> | null): number {
    return this.interpolate(prev?.throttle, next?.throttle) ?? 0;
  }

  /**
   * Estimate missing brake
   */
  private estimateBrake(prev: TelemetryPoint | null, next: Partial<TelemetryPoint> | null, speed?: number): number {
    // If speed is decreasing rapidly, assume braking
    if (prev && speed !== undefined && prev.speed > speed + 5) {
      return Math.min(100, (prev.speed - speed) * 10);
    }
    return this.interpolate(prev?.brake_front, next?.brake_front) ?? 0;
  }

  /**
   * Estimate gear from speed
   */
  private estimateGear(speed: number): number {
    if (speed < 30) return 1;
    if (speed < 60) return 2;
    if (speed < 90) return 3;
    if (speed < 120) return 4;
    if (speed < 150) return 5;
    return 6;
  }

  /**
   * Estimate RPM from speed and gear
   */
  private estimateRPM(speed: number, gear?: number): number {
    const g = gear ?? this.estimateGear(speed);
    const baseRPM = 2000;
    const rpmPerKmh = 50;
    return baseRPM + (speed / g) * rpmPerKmh;
  }

  /**
   * Estimate acceleration from speed changes
   */
  private estimateAcceleration(prevSpeed?: number, currSpeed?: number): number {
    if (prevSpeed !== undefined && currSpeed !== undefined) {
      const dt = 0.1;
      return ((currSpeed - prevSpeed) / 3.6) / dt / 9.81; // Convert to G
    }
    return 0;
  }

  /**
   * Linear interpolation helper
   */
  private interpolate(prev?: number, next?: number): number {
    if (prev !== undefined && next !== undefined) {
      return (prev + next) / 2;
    }
    return prev ?? next ?? 0;
  }

  /**
   * Calculate metadata from cleaned telemetry
   */
  private calculateMetadata(telemetry: TelemetryPoint[]): CleanedTelemetryData['metadata'] {
    if (telemetry.length === 0) {
      return {
        totalPoints: 0,
        laps: 0,
        duration: 0,
        averageSpeed: 0,
        missingDataHandled: [],
      };
    }

    const laps = new Set(telemetry.map(p => p.lap)).size;
    const startTime = new Date(telemetry[0].timestamp).getTime();
    const endTime = new Date(telemetry[telemetry.length - 1].timestamp).getTime();
    const duration = (endTime - startTime) / 1000;
    const averageSpeed = telemetry.reduce((sum, p) => sum + p.speed, 0) / telemetry.length;

    return {
      totalPoints: telemetry.length,
      laps,
      duration,
      averageSpeed,
      missingDataHandled: [],
    };
  }
}

export const telemetryUploadService = TelemetryUploadService.getInstance();
