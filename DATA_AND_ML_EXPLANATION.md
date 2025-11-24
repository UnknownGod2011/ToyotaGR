# Data & ML Model Explanation

## 📊 REAL DATA IN Race_Data FOLDER

### ✅ YES - The data is REAL and substantial!

**What's in the folder:**
- **1.5GB+ of actual telemetry data** from Toyota GR Cup races
- Real lap times, speeds, G-forces, brake pressure, throttle, steering angles
- Data from 7 different tracks (Barber, COTA, Indianapolis, Road America, Sebring, Sonoma, VIR)
- Multiple races per track (Race 1 and Race 2)
- Multiple vehicles per race

**Example from Barber Race 1:**
```
File: R1_barber_telemetry_data.csv
Size: 1,557,275,602 bytes (1.5 GB!)
Contains: accx_can, accy_can, aps (throttle), pbrake_f, pbrake_r, Steering_Angle, speed, etc.
```

### 🎯 Why Graphs Show Data

The graphs ARE using real data when you load from the Race Database:
1. Speed vs Distance - Real speed measurements
2. Throttle/Brake/Steering - Real driver inputs
3. G-Forces - Real acceleration data
4. Corner Analysis - Detected from real telemetry

**The issue:** Graphs weren't re-rendering when switching tracks due to React dependency issues (NOW FIXED!)

---

## 🤖 ML MODELS - Current Status

### ❌ NO - There are NO trained ML models yet

**What's currently happening:**
1. **Lap Predictions** - Using simple statistical methods (average of last 5 laps)
2. **Optimal Lap** - Combining best sectors from multiple laps
3. **Tyre Degradation** - Mathematical simulation (not ML-based)
4. **Strategy Predictions** - Rule-based algorithms

### ✅ What SHOULD Be Done (Recommendations)

#### 1. **Lap Time Prediction Model**
```python
# Train on historical lap data
Features: [previous_lap_times, tyre_age, fuel_load, track_temp, driver_consistency]
Target: next_lap_time
Model: LSTM or Gradient Boosting (XGBoost)
```

#### 2. **Corner Performance Model**
```python
# Predict optimal corner entry/apex/exit speeds
Features: [entry_speed, brake_point, steering_angle, throttle_application, tyre_temp]
Target: corner_exit_speed
Model: Random Forest or Neural Network
```

#### 3. **Tyre Degradation Model**
```python
# Predict grip loss over laps
Features: [lap_number, compound_type, track_temp, driving_style_aggression, lateral_g_avg]
Target: grip_percentage
Model: Polynomial Regression or LSTM
```

#### 4. **Strategy Optimization Model**
```python
# Recommend pit stop strategy
Features: [current_position, tyre_age, fuel_remaining, gap_to_leader, weather_forecast]
Target: optimal_pit_lap
Model: Reinforcement Learning (Q-Learning) or Monte Carlo Tree Search
```

---

## 📁 SAMPLE CSV DATASETS FOR TESTING

### Sample 1: Basic Lap (Created)
**File:** `sample_telemetry_lap1.csv`
- Single lap with basic telemetry
- Speed, throttle, brake, steering, G-forces
- Use this to test the upload feature

### Sample 2: Multi-Lap Session (Create this)
```csv
expire_at,lap,telemetry_name,telemetry_value,timestamp,vehicle_number
,1,speed,45.5,2025-11-22T10:00:00.000Z,1
,1,aps,85,2025-11-22T10:00:00.000Z,1
... (more lap 1 data)
,2,speed,46.2,2025-11-22T10:01:30.000Z,1
,2,aps,88,2025-11-22T10:01:30.000Z,1
... (lap 2 data - slightly faster)
,3,speed,45.8,2025-11-22T10:03:00.000Z,1
... (lap 3 data)
```

### Sample 3: Comparison Data (Two Drivers)
```csv
expire_at,lap,telemetry_name,telemetry_value,timestamp,vehicle_number
,1,speed,45.5,2025-11-22T10:00:00.000Z,1
,1,speed,44.8,2025-11-22T10:00:00.000Z,2
... (both drivers' data)
```

---

## 🔧 HOW TO IMPLEMENT ML MODELS

### Step 1: Data Preparation
```python
import pandas as pd
import numpy as np

# Load all race data
df = pd.read_csv('Race_Data/barber/R1_barber_telemetry_data.csv')

# Feature engineering
df['speed_change'] = df['speed'].diff()
df['brake_intensity'] = df['pbrake_f'] + df['pbrake_r']
df['corner_g'] = np.sqrt(df['accx_can']**2 + df['accy_can']**2)
```

### Step 2: Train Models
```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Prepare features
X = df[['speed', 'aps', 'brake_intensity', 'Steering_Angle', 'corner_g']]
y = df['next_lap_time']  # Target variable

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

# Save model
import joblib
joblib.dump(model, 'models/lap_time_predictor.pkl')
```

### Step 3: Integrate into App
```typescript
// In AnalyticsEngine.ts
async predictNextLap(telemetry: TelemetryPoint[]): Promise<number> {
  // Call Python ML service
  const response = await fetch('http://localhost:5000/predict', {
    method: 'POST',
    body: JSON.stringify({ telemetry }),
  });
  return response.json();
}
```

---

## 📈 RECOMMENDED TRAINING DATASETS

### Use the existing Race_Data:
1. **Barber** - 1.5GB telemetry (excellent for training)
2. **COTA** - Similar size, different track characteristics
3. **All 7 tracks** - Combined ~10GB+ of real racing data

### Training Strategy:
```python
# 1. Combine all tracks for general model
all_tracks_df = pd.concat([
    pd.read_csv('Race_Data/barber/R1_barber_telemetry_data.csv'),
    pd.read_csv('Race_Data/cota/Race 1/R1_cota_telemetry_data.csv'),
    # ... all other tracks
])

# 2. Train track-specific models for better accuracy
barber_model = train_model(barber_df)
cota_model = train_model(cota_df)

# 3. Use ensemble for predictions
prediction = 0.7 * general_model.predict(X) + 0.3 * track_specific_model.predict(X)
```

---

## 🎯 NEXT STEPS TO IMPLEMENT ML

1. **Set up Python ML service** (Flask/FastAPI)
2. **Train models on existing Race_Data**
3. **Create REST API endpoints** for predictions
4. **Update AnalyticsEngine.ts** to call ML service
5. **Deploy models** alongside the React app

### Quick Start ML Service:
```python
# ml_service.py
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load('models/lap_time_predictor.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    prediction = model.predict([data['features']])
    return jsonify({'predicted_lap_time': float(prediction[0])})

if __name__ == '__main__':
    app.run(port=5000)
```

---

## ✅ SUMMARY

**Current State:**
- ✅ Real data exists (10GB+ across all tracks)
- ✅ Graphs use real data (now properly updating)
- ❌ No ML models trained yet (using statistical methods)
- ✅ Sample CSV provided for testing uploads

**To Make It Production-Ready:**
1. Train ML models on existing data
2. Deploy Python ML service
3. Integrate predictions into React app
4. Add model retraining pipeline
5. Monitor model performance

The foundation is solid - you have excellent real data. Now it's time to add the ML layer!
