/**
 * Toyota GR Racing - Mock Data Provider
 * Provides realistic simulated data based on actual race data patterns
 * This will be replaced with real data loader in production
 */

import { TelemetryPoint, LapData, WeatherData, DriverBestLaps } from './DataParser';
import { CornerData, Insight, LapPrediction, OptimalLap } from './AnalyticsEngine';
import { SessionData, TrackData } from './DataLoader';

export class MockDataProvider {
  private static instance: MockDataProvider;
  
  private constructor() {}
  
  static getInstance(): MockDataProvider {
    if (!MockDataProvider.instance) {
      MockDataProvider.instance = new MockDataProvider();
    }
    return MockDataProvider.instance;
  }

  /**
   * Generate mock session data based on Barber Motorsports Park
   */
  generateMockSessionData(): SessionData {
    const trackLength = 3800; // Barber is approximately 3.8km
    const corners = this.generateMockCorners();
    
    const track: TrackData = {
      name: 'Barber Motorsports Park',
      length: trackLength,
      corners,
      sectors: 3,
    };
    
    // Generate telemetry for multiple laps
    const telemetryByLap = new Map<number, TelemetryPoint[]>();
    const lapTimes: LapData[] = [];
    
    for (let lap = 1; lap <= 15; lap++) {
      const lapTelemetry = this.generateLapTelemetry(lap, trackLength, corners);
      telemetryByLap.set(lap, lapTelemetry);
      
      // Calculate lap time from telemetry
      const lapTime = this.calculateLapTime(lapTelemetry);
      lapTimes.push({
        lap,
        lapTime,
        timestamp: new Date(Date.now() - (15 - lap) * 100000).toISOString(),
        vehicleId: 'GR86-002-000',
        vehicleNumber: 2,
      });
    }
    
    const weather = this.generateMockWeather();
    const bestLaps = this.generateMockBestLaps();
    const insights = this.generateMockInsights(corners);
    const prediction = this.generateMockPrediction(15);
    const optimalLap = this.generateMockOptimalLap(trackLength);
    
    return {
      track,
      telemetry: telemetryByLap,
      lapTimes,
      weather,
      bestLaps,
      insights,
      prediction,
      optimalLap,
    };
  }

  private generateMockCorners(): CornerData[] {
    // Barber has 17 turns
    return [
      { id: 'T1', name: 'Turn 1', entryDistance: 450, apexDistance: 480, exitDistance: 520, entrySpeed: 185, apexSpeed: 142, exitSpeed: 178, brakePoint: 420, brakeDistance: 60, maxLateralG: 1.8, type: 'medium' },
      { id: 'T2', name: 'Turn 2', entryDistance: 680, apexDistance: 710, exitDistance: 750, entrySpeed: 156, apexSpeed: 98, exitSpeed: 145, brakePoint: 650, brakeDistance: 60, maxLateralG: 2.1, type: 'slow' },
      { id: 'T3', name: 'Turn 3', entryDistance: 920, apexDistance: 950, exitDistance: 990, entrySpeed: 198, apexSpeed: 165, exitSpeed: 192, brakePoint: 890, brakeDistance: 60, maxLateralG: 1.6, type: 'fast' },
      { id: 'T4', name: 'Turn 4', entryDistance: 1180, apexDistance: 1210, exitDistance: 1250, entrySpeed: 142, apexSpeed: 88, exitSpeed: 135, brakePoint: 1150, brakeDistance: 60, maxLateralG: 2.3, type: 'slow' },
      { id: 'T5', name: 'Turn 5', entryDistance: 1520, apexDistance: 1550, exitDistance: 1590, entrySpeed: 176, apexSpeed: 125, exitSpeed: 168, brakePoint: 1490, brakeDistance: 60, maxLateralG: 1.9, type: 'medium' },
      { id: 'T6', name: 'Turn 6', entryDistance: 1850, apexDistance: 1880, exitDistance: 1920, entrySpeed: 165, apexSpeed: 112, exitSpeed: 158, brakePoint: 1820, brakeDistance: 60, maxLateralG: 2.0, type: 'medium' },
      { id: 'T7', name: 'Turn 7', entryDistance: 2180, apexDistance: 2210, exitDistance: 2250, entrySpeed: 188, apexSpeed: 148, exitSpeed: 182, brakePoint: 2150, brakeDistance: 60, maxLateralG: 1.7, type: 'fast' },
      { id: 'T8', name: 'Turn 8', entryDistance: 2520, apexDistance: 2550, exitDistance: 2590, entrySpeed: 152, apexSpeed: 95, exitSpeed: 145, brakePoint: 2490, brakeDistance: 60, maxLateralG: 2.2, type: 'slow' },
      { id: 'T9', name: 'Turn 9', entryDistance: 2850, apexDistance: 2880, exitDistance: 2920, entrySpeed: 172, apexSpeed: 118, exitSpeed: 165, brakePoint: 2820, brakeDistance: 60, maxLateralG: 1.9, type: 'medium' },
      { id: 'T10', name: 'Turn 10', entryDistance: 3180, apexDistance: 3210, exitDistance: 3250, entrySpeed: 195, apexSpeed: 158, exitSpeed: 188, brakePoint: 3150, brakeDistance: 60, maxLateralG: 1.6, type: 'fast' },
    ];
  }

  private generateLapTelemetry(lapNumber: number, trackLength: number, corners: CornerData[]): TelemetryPoint[] {
    const points: TelemetryPoint[] = [];
    const baseTime = Date.now() - (20 - lapNumber) * 100000;
    const lapVariation = (Math.random() - 0.5) * 0.5; // ±0.5s variation
    
    for (let distance = 0; distance < trackLength; distance += 10) {
      const timestamp = new Date(baseTime + (distance / trackLength) * 98000 + lapVariation * 1000).toISOString();
      
      // Find if we're in a corner
      const corner = corners.find(c => 
        distance >= c.entryDistance - 50 && distance <= c.exitDistance + 50
      );
      
      let speed = 200;
      let throttle = 100;
      let brake_front = 0;
      let brake_rear = 0;
      let steering = 0;
      let accx = 0;
      let accy = 0;
      
      if (corner) {
        // In corner
        const cornerProgress = (distance - corner.entryDistance) / (corner.exitDistance - corner.entryDistance);
        
        if (cornerProgress < 0.3) {
          // Braking phase
          speed = corner.entrySpeed - (corner.entrySpeed - corner.apexSpeed) * (cornerProgress / 0.3);
          throttle = 0;
          brake_front = 80 - cornerProgress * 200;
          brake_rear = 60 - cornerProgress * 150;
          steering = corner.type === 'slow' ? 35 : corner.type === 'medium' ? 25 : 15;
          accx = -corner.maxLateralG * Math.sin(cornerProgress * Math.PI);
          accy = -1.5 + cornerProgress * 3;
        } else if (cornerProgress < 0.6) {
          // Apex phase
          speed = corner.apexSpeed;
          throttle = 30 + (cornerProgress - 0.3) * 100;
          brake_front = 0;
          brake_rear = 0;
          steering = corner.type === 'slow' ? 40 : corner.type === 'medium' ? 28 : 18;
          accx = corner.maxLateralG;
          accy = 0;
        } else {
          // Exit phase
          speed = corner.apexSpeed + (corner.exitSpeed - corner.apexSpeed) * ((cornerProgress - 0.6) / 0.4);
          throttle = 60 + (cornerProgress - 0.6) * 100;
          brake_front = 0;
          brake_rear = 0;
          steering = (corner.type === 'slow' ? 40 : corner.type === 'medium' ? 28 : 18) * (1 - (cornerProgress - 0.6) / 0.4);
          accx = corner.maxLateralG * (1 - (cornerProgress - 0.6) / 0.4);
          accy = 0.8;
        }
      } else {
        // Straight
        speed = 200 + Math.sin(distance / 200) * 20;
        throttle = 100;
        brake_front = 0;
        brake_rear = 0;
        steering = Math.sin(distance / 100) * 2;
        accx = Math.sin(distance / 100) * 0.2;
        accy = 0.5;
      }
      
      points.push({
        timestamp,
        lap: lapNumber,
        distance,
        speed: speed + Math.random() * 3,
        throttle: Math.max(0, Math.min(100, throttle + Math.random() * 5)),
        brake_front: Math.max(0, Math.min(100, brake_front + Math.random() * 5)),
        brake_rear: Math.max(0, Math.min(100, brake_rear + Math.random() * 5)),
        steering: steering + Math.random() * 2,
        gear: Math.floor(speed / 35) + 1,
        rpm: 3000 + speed * 25,
        accx: accx + Math.random() * 0.1,
        accy: accy + Math.random() * 0.1,
        latitude: 33.5 + distance * 0.0001,
        longitude: -86.4 + distance * 0.0001,
        vehicleNumber: 0,
      });
    }
    
    return points;
  }

  private calculateLapTime(telemetry: TelemetryPoint[]): number {
    if (telemetry.length < 2) return 0;
    
    const startTime = new Date(telemetry[0].timestamp).getTime();
    const endTime = new Date(telemetry[telemetry.length - 1].timestamp).getTime();
    
    return (endTime - startTime) / 1000;
  }

  private generateMockWeather(): WeatherData[] {
    const weather: WeatherData[] = [];
    const baseTime = Date.now() - 3600000; // 1 hour ago
    
    for (let i = 0; i < 60; i++) {
      weather.push({
        timestamp: new Date(baseTime + i * 60000).toISOString(),
        airTemp: 29 + Math.random() * 2,
        trackTemp: 35 + Math.random() * 3,
        humidity: 56 + Math.random() * 3,
        pressure: 992 + Math.random() * 2,
        windSpeed: 3 + Math.random() * 5,
        windDirection: Math.random() * 360,
        rain: 0,
      });
    }
    
    return weather;
  }

  private generateMockBestLaps(): DriverBestLaps[] {
    return [
      {
        number: 2,
        vehicle: 'Toyota GR86',
        class: 'Am',
        totalLaps: 27,
        bestLap: 98.326,
        bestLapNum: 5,
        top10Laps: [
          { time: 98.326, lapNum: 5 },
          { time: 98.366, lapNum: 20 },
          { time: 98.367, lapNum: 14 },
          { time: 98.368, lapNum: 21 },
          { time: 98.371, lapNum: 17 },
          { time: 98.376, lapNum: 6 },
          { time: 98.490, lapNum: 19 },
          { time: 98.496, lapNum: 18 },
          { time: 98.525, lapNum: 12 },
          { time: 98.531, lapNum: 7 },
        ],
        average: 98.421,
      },
    ];
  }

  private generateMockInsights(corners: CornerData[]): Insight[] {
    return [
      {
        id: '1',
        category: 'BRAKING',
        severity: 'warning',
        title: `Braking Too Early - ${corners[3].name}`,
        description: 'Brake point 15m earlier than optimal',
        evidence: `Brake applied at ${corners[3].brakePoint + 15}m vs ideal ${corners[3].brakePoint}m`,
        suggestion: 'Delay brake point by 15m, increase initial pressure',
        timeGain: 0.18,
        corner: corners[3].id,
      },
      {
        id: '2',
        category: 'APEX SPEED',
        severity: 'critical',
        title: `Apex Speed Deficit - ${corners[2].name}`,
        description: 'Carrying 8 km/h less than optimal through apex',
        evidence: `${corners[2].apexSpeed - 8} km/h vs ideal ${corners[2].apexSpeed} km/h`,
        suggestion: 'Later turn-in, smoother steering input, maintain throttle',
        timeGain: 0.15,
        corner: corners[2].id,
      },
      {
        id: '3',
        category: 'THROTTLE',
        severity: 'warning',
        title: 'Throttle Delay at Apex',
        description: 'Average 0.3s delay in throttle application post-apex',
        evidence: 'Measured across T2, T5, T6',
        suggestion: 'Earlier throttle application, progressive power delivery',
        timeGain: 0.22,
      },
      {
        id: '4',
        category: 'STEERING',
        severity: 'info',
        title: 'Excessive Steering Corrections',
        description: '12 micro-corrections detected in Turn 1',
        evidence: 'Steering angle variance: ±4.2°',
        suggestion: 'Smoother initial turn-in, trust the grip',
        timeGain: 0.08,
        corner: 'T1',
      },
      {
        id: '5',
        category: 'UNDERSTEER',
        severity: 'warning',
        title: 'Understeer Event Detected',
        description: 'Front tyre slip angle exceeded optimal range',
        evidence: 'T2 entry: 8.5° slip vs 6° optimal',
        suggestion: 'Reduce entry speed by 3 km/h, earlier turn-in',
        timeGain: 0.11,
        corner: 'T2',
      },
    ];
  }

  private generateMockPrediction(currentLap: number): LapPrediction {
    return {
      predictedLapTime: 98.45,
      confidence: 0.92,
      tyreDegradation: currentLap * 2.5,
      fuelRemaining: Math.max(0, 100 - currentLap * 3.2),
      brakeTempForecast: {
        FL: 340 + Math.random() * 20,
        FR: 360 + Math.random() * 20,
        RL: 300 + Math.random() * 20,
        RR: 310 + Math.random() * 20,
      },
      tyreTempForecast: {
        FL: 85 + currentLap * 0.3,
        FR: 88 + currentLap * 0.3,
        RL: 82 + currentLap * 0.25,
        RR: 86 + currentLap * 0.25,
      },
      recommendedAdjustments: [
        'Focus on Turn 3 and Turn 7 improvements',
        'Maintain smooth steering inputs',
        'Earlier throttle application at corner exits',
      ],
    };
  }

  private generateMockOptimalLap(trackLength: number): OptimalLap {
    const segments = [];
    
    for (let distance = 0; distance < trackLength; distance += 50) {
      segments.push({
        distance,
        speed: 180 + Math.sin(distance / 200) * 40,
        throttle: 80 + Math.sin(distance / 300) * 20,
        brake: Math.max(0, -Math.sin(distance / 200) * 50),
        steering: Math.sin(distance / 150) * 20,
        source: 'optimized' as const,
      });
    }
    
    return {
      theoreticalBestTime: 97.89,
      segments,
      improvementAreas: ['Turn 3 entry', 'Turn 7 apex', 'Turn 10 exit'],
      potentialTimeGain: 0.44,
    };
  }
}

export const mockDataProvider = MockDataProvider.getInstance();
