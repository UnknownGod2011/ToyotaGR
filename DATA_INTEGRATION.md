# Data Integration Guide

## 📊 Overview

This guide explains how to integrate real telemetry data into the Toyota GR Racing system. Currently, all data is simulated with realistic values.

## 🔌 Integration Points

### 1. Car Telemetry Data

**File:** `src/components/CarTelemetryDiagram.tsx`

**Data Structure:**
```typescript
interface TyreData {
  temp: number;        // Temperature in °C (60-110)
  brakeTemp: number;   // Brake temperature in °C (250-500)
  pressure: number;    // Pressure in bar (1.8-2.4)
  grip: number;        // Grip percentage (0-100)
}

interface CarTelemetry {
  tyres: {
    FL: TyreData;  // Front Left
    FR: TyreData;  // Front Right
    RL: TyreData;  // Rear Left
    RR: TyreData;  // Rear Right
  };
  engine: {
    temp: number;         // Engine temp in °C (80-110)
    oilTemp: number;      // Oil temp in °C (90-120)
    fuelLevel: number;    // Fuel percentage (0-100)
    gearboxHealth: number; // Health percentage (0-100)
  };
}
```

**Integration:**
```typescript
// Replace the useState initialization with your data source
const [telemetry, setTelemetry] = useState<CarTelemetry>(
  fetchTelemetryData() // Your API call
);

// Update in real-time
useEffect(() => {
  const ws = new WebSocket('ws://your-telemetry-server');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setTelemetry(data);
  };
}, []);
```

### 2. Lap Telemetry Data

**File:** `src/components/TechnicalCharts.tsx`

**Data Structure:**
```typescript
interface LapDataPoint {
  distance: number;      // Distance in meters (0-5000)
  speed: number;         // Speed in km/h (0-250)
  throttle: number;      // Throttle percentage (0-100)
  brake: number;         // Brake percentage (0-100)
  steering: number;      // Steering angle in degrees (-45 to 45)
  lateralG: number;      // Lateral G-force (-3 to 3)
  longitudinalG: number; // Longitudinal G-force (-2 to 2)
  delta: number;         // Delta time in seconds (-1 to 1)
  tyreTempFL: number;    // Front left tyre temp
  tyreTempFR: number;    // Front right tyre temp
  brakeTempFL: number;   // Front left brake temp
  brakeTempFR: number;   // Front right brake temp
}
```

**Integration:**
```typescript
// Replace generateLapData() with your data
const lapData = await fetchLapTelemetry(lapId);
```

### 3. Corner Analysis Data

**File:** `src/components/TechnicalCharts.tsx`

**Data Structure:**
```typescript
interface CornerData {
  corner: string;    // Corner identifier (T1, T2, etc.)
  entry: number;     // Entry speed in km/h
  apex: number;      // Apex speed in km/h
  exit: number;      // Exit speed in km/h
  ideal: number;     // Ideal speed in km/h
  loss: number;      // Time loss in seconds
}
```

### 4. Race Insights Data

**File:** `src/components/AdvancedInsights.tsx`

**Data Structure:**
```typescript
interface Insight {
  id: string;
  category: 'BRAKING' | 'APEX SPEED' | 'THROTTLE' | 'STEERING' | 'UNDERSTEER' | 'TYRE BALANCE' | 'CONSISTENCY' | 'PREDICTION';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  evidence: string;
  suggestion: string;
  timeGain: number;  // Expected time gain in seconds
  corner?: string;   // Optional corner identifier
}
```

**Integration:**
```typescript
// Replace static insights array with API call
const insights = await fetchAIInsights(lapId);
```

### 5. Strategy Data

**File:** `src/components/StrategyCharts.tsx`

**Data Structures:**

**Tyre Degradation:**
```typescript
interface TyreDegradationPoint {
  lap: number;
  soft: number;    // Grip percentage (0-100)
  medium: number;  // Grip percentage (0-100)
  hard: number;    // Grip percentage (0-100)
}
```

**Pit Strategy:**
```typescript
interface PitStrategy {
  strategy: string;
  totalTime: number;     // Total race time in seconds
  pitLoss: number;       // Pit stop time loss in seconds
  tyreDeg: string;       // Degradation level
  fuelSave: string;      // Fuel saving required
  probability: number;   // Success probability (0-100)
}
```

**ML Prediction:**
```typescript
interface MLPrediction {
  lap: number;
  actual: number;      // Actual lap time in seconds
  predicted: number;   // Predicted lap time in seconds
  confidence: number;  // Confidence percentage (0-100)
}
```

### 6. 3D Track Data

**File:** `src/components/RaceTrack3D.tsx`

**Track Path:**
```typescript
// Replace trackPoints generation with actual track coordinates
const trackPoints = trackData.map(point => 
  new THREE.Vector3(point.x, point.y, point.z)
);
```

**Car Position:**
```typescript
interface CarPosition {
  progress: number;  // Progress along track (0-1)
  speed: number;     // Current speed
  position: number;  // Race position
  lapTime: string;   // Current lap time
}
```

## 🔄 Real-Time Updates

### WebSocket Integration

```typescript
// Example WebSocket setup
const useRealTimeTelemetry = () => {
  const [data, setData] = useState<CarTelemetry | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://telemetry.toyota-gr.com/live');
    
    ws.onopen = () => {
      console.log('Connected to telemetry server');
    };

    ws.onmessage = (event) => {
      const telemetry = JSON.parse(event.data);
      setData(telemetry);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from telemetry server');
    };

    return () => ws.close();
  }, []);

  return data;
};
```

### REST API Integration

```typescript
// Example API service
class TelemetryAPI {
  private baseURL = 'https://api.toyota-gr.com';

  async getLapData(lapId: string): Promise<LapDataPoint[]> {
    const response = await fetch(`${this.baseURL}/laps/${lapId}/telemetry`);
    return response.json();
  }

  async getInsights(lapId: string): Promise<Insight[]> {
    const response = await fetch(`${this.baseURL}/laps/${lapId}/insights`);
    return response.json();
  }

  async getStrategy(sessionId: string): Promise<PitStrategy[]> {
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}/strategy`);
    return response.json();
  }

  async getCarTelemetry(): Promise<CarTelemetry> {
    const response = await fetch(`${this.baseURL}/telemetry/live`);
    return response.json();
  }
}

export const telemetryAPI = new TelemetryAPI();
```

## 📡 Data Sources

### Supported Formats

1. **CSV Files**
   - Import lap data from CSV
   - Parse telemetry logs
   - Convert to JSON format

2. **JSON API**
   - RESTful endpoints
   - Real-time WebSocket
   - GraphQL queries

3. **Database**
   - PostgreSQL
   - MongoDB
   - InfluxDB (time-series)

### Example CSV Parser

```typescript
const parseCSV = (csvData: string): LapDataPoint[] => {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      distance: parseFloat(values[0]),
      speed: parseFloat(values[1]),
      throttle: parseFloat(values[2]),
      brake: parseFloat(values[3]),
      steering: parseFloat(values[4]),
      lateralG: parseFloat(values[5]),
      longitudinalG: parseFloat(values[6]),
      delta: parseFloat(values[7]),
      tyreTempFL: parseFloat(values[8]),
      tyreTempFR: parseFloat(values[9]),
      brakeTempFL: parseFloat(values[10]),
      brakeTempFR: parseFloat(values[11]),
    };
  });
};
```

## 🤖 AI Integration

### ML Model Integration

```typescript
// Example TensorFlow.js integration
import * as tf from '@tensorflow/tfjs';

class LapPredictor {
  private model: tf.LayersModel | null = null;

  async loadModel() {
    this.model = await tf.loadLayersModel('/models/lap-predictor/model.json');
  }

  async predictLapTime(telemetry: LapDataPoint[]): Promise<number> {
    if (!this.model) await this.loadModel();
    
    const input = tf.tensor2d([telemetry.map(d => [
      d.speed, d.throttle, d.brake, d.lateralG, d.longitudinalG
    ])]);
    
    const prediction = this.model!.predict(input) as tf.Tensor;
    const lapTime = await prediction.data();
    
    return lapTime[0];
  }
}
```

## 🔐 Authentication

### API Authentication

```typescript
// Add authentication headers
const fetchWithAuth = async (url: string) => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};
```

## 📊 Data Validation

### Validation Schema

```typescript
import { z } from 'zod';

const TelemetrySchema = z.object({
  tyres: z.object({
    FL: z.object({
      temp: z.number().min(0).max(150),
      brakeTemp: z.number().min(0).max(600),
      pressure: z.number().min(0).max(5),
      grip: z.number().min(0).max(100),
    }),
    // ... other tyres
  }),
  engine: z.object({
    temp: z.number().min(0).max(150),
    oilTemp: z.number().min(0).max(150),
    fuelLevel: z.number().min(0).max(100),
    gearboxHealth: z.number().min(0).max(100),
  }),
});

// Validate incoming data
const validateTelemetry = (data: unknown) => {
  return TelemetrySchema.parse(data);
};
```

## 🧪 Testing with Mock Data

### Mock Data Generator

```typescript
// Generate realistic mock data for testing
export const generateMockTelemetry = (): CarTelemetry => ({
  tyres: {
    FL: {
      temp: 85 + Math.random() * 10,
      brakeTemp: 320 + Math.random() * 40,
      pressure: 2.0 + Math.random() * 0.2,
      grip: 90 + Math.random() * 5,
    },
    // ... other tyres
  },
  engine: {
    temp: 92 + Math.random() * 5,
    oilTemp: 105 + Math.random() * 5,
    fuelLevel: 68 + Math.random() * 2,
    gearboxHealth: 97 + Math.random() * 2,
  },
});
```

## 📝 Migration Checklist

- [ ] Set up data source (API/WebSocket/Database)
- [ ] Implement authentication
- [ ] Create data fetching services
- [ ] Add error handling
- [ ] Implement data validation
- [ ] Test with real data
- [ ] Add loading states
- [ ] Handle edge cases
- [ ] Optimize performance
- [ ] Add data caching
- [ ] Implement retry logic
- [ ] Monitor data quality

## 🚀 Next Steps

1. **Connect to your telemetry system**
2. **Replace mock data with real data**
3. **Test thoroughly**
4. **Monitor performance**
5. **Iterate based on feedback**

---

**Ready to integrate real telemetry data!** 🏁
