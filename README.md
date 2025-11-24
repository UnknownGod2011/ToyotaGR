# Toyota GR Racing - Advanced Telemetry & Driver Insights System

**Created and Developed by Tanush Shah (The Unknown God)**

A professional-grade motorsport telemetry analysis platform designed for the Toyota GR Cup 2025 season. This system processes real race data, generates AI-powered insights, and provides comprehensive driver training recommendations.

---

## 🏎️ Project Overview

This is a state-of-the-art racing telemetry system built from the ground up to analyze real Toyota GR Cup race data. The system processes actual telemetry from 7 professional racing circuits, detects corners automatically, generates performance insights, and provides ML-based predictions to help drivers improve their lap times.

**Developer:** Tanush Shah  
**Project Type:** Motorsport Telemetry & Analysis  
**Technology Stack:** React, TypeScript, Three.js, Recharts, Framer Motion  
**Data Source:** Real Toyota GR Cup 2025 race telemetry

---

## ✨ Key Features

### Real Data Processing
- **7 Professional Circuits**: Barber, COTA, Indianapolis, Road America, Sebring, Sonoma, VIR
- **12 Telemetry Signals**: Speed, throttle, brake, steering, G-forces, GPS, RPM, gear
- **50MB+ CSV Files**: Handles large-scale professional racing data
- **100,000+ Data Points**: Per race session analysis

### Advanced Analytics
- **Automatic Corner Detection**: Identifies corners from lateral G-forces and speed patterns
- **Braking Analysis**: Detects early/late braking with meter-level precision
- **Apex Speed Optimization**: Calculates speed deficits at corner apex
- **Throttle Timing**: Identifies throttle application delays
- **Handling Issues**: Detects understeer/oversteer events
- **Steering Smoothness**: Counts micro-corrections and measures consistency

### AI & Machine Learning
- **Lap Time Prediction**: ML-based next lap forecasting
- **Tyre Degradation Model**: Predicts tyre wear over race distance
- **Optimal Lap Construction**: Builds theoretical best lap from all segments
- **Performance Scoring**: Consistency and racecraft metrics
- **Strategy Optimization**: Pit stop timing and compound selection

### Professional Visualization
- **3D Track Replay**: Real-time animated track with dual car comparison
- **15+ Technical Charts**: Speed traces, G-force maps, brake/tyre temps
- **2D Car Telemetry**: F1-style live vehicle diagnostics
- **Racing Line Analysis**: Ideal vs actual line comparison
- **Corner-by-Corner Breakdown**: Detailed performance per turn

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern web browser with WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/tanushshah/toyota-gr-racing

# Navigate to project directory
cd toyota-gr-racing

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Select Data Source**
   - Choose from 7 professional racing circuits
   - Select Race 1 or Race 2
   - Optional: Filter by vehicle number

2. **Load Race Data**
   - System fetches real CSV telemetry files
   - Processes 12 telemetry signals
   - Detects corners automatically
   - Generates AI insights

3. **View Analysis**
   - **3D Visualization**: Track replay with animated cars
   - **Race Insights**: AI-powered performance analysis
   - **Strategy & Predictions**: ML-based forecasting

---

## 📊 System Architecture

### Data Processing Pipeline
```
Real CSV Files (Race_Data/)
    ↓
Data Parser (12 telemetry signals)
    ↓
Analytics Engine (Corner detection, insights)
    ↓
ML Prediction Models
    ↓
React UI Components
    ↓
Professional Visualization
```

### Technology Stack
- **Frontend**: React 18, TypeScript
- **3D Graphics**: Three.js, React Three Fiber
- **Charts**: Recharts (professional telemetry charts)
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Key Components
- `RealDataLoader` - Loads actual CSV files from race data
- `DataParser` - Parses telemetry into structured format
- `AnalyticsEngine` - Generates insights and predictions
- `TrackSelector` - Professional data source UI
- `RaceTrack3D` - 3D track visualization
- `TechnicalCharts` - 15+ professional telemetry charts

---

## 📈 Features in Detail

### Telemetry Signals Processed
| Signal | Description | Unit |
|--------|-------------|------|
| speed | Vehicle speed | km/h |
| aps | Throttle position | 0-100% |
| pbrake_f | Front brake pressure | 0-100 |
| pbrake_r | Rear brake pressure | 0-100 |
| Steering_Angle | Steering input | degrees |
| gear | Current gear | 1-6 |
| nmot | Engine RPM | RPM |
| accx_can | Lateral acceleration | G |
| accy_can | Longitudinal acceleration | G |
| VBOX_Lat_Min | GPS latitude | degrees |
| VBOX_Long_Minutes | GPS longitude | degrees |
| Laptrigger_lapdist_dls | Lap distance | meters |

### Insights Generated
1. **Braking Analysis**
   - Early/late braking detection (±10m threshold)
   - Brake point optimization
   - Brake distance calculation
   - Time gain estimation

2. **Corner Performance**
   - Apex speed deficits
   - Entry/exit speed analysis
   - Turn-in timing
   - Corner classification (slow/medium/fast)

3. **Throttle Management**
   - Throttle delay detection (>0.2s)
   - Application timing analysis
   - Progressive power delivery metrics

4. **Steering Analysis**
   - Micro-correction counting
   - Smoothness metrics
   - Steering angle variance

5. **Handling Issues**
   - Understeer event detection
   - Oversteer identification
   - Slip angle analysis

6. **Consistency Metrics**
   - Lap-to-lap variance
   - Speed consistency
   - Sector consistency

### ML Predictions
- **Next Lap Time**: Linear regression with trend analysis
- **Tyre Degradation**: Lap-based degradation model
- **Fuel Consumption**: Usage rate tracking
- **Brake Temperature**: Usage-based forecasting
- **Tyre Temperature**: Degradation-linked prediction

---

## 🎨 UI Design

### Professional Motorsport Aesthetic
- Carbon fiber textures
- Neon cyan & red racing glows
- Animated panel borders
- Holographic grid backgrounds
- Racing particles and light streaks
- Professional data density

### Pages
1. **Data Selection** - Track and race selection interface
2. **3D Visualization** - Real-time track replay with telemetry
3. **Race Insights** - Comprehensive performance analysis
4. **Strategy & Predictions** - AI-powered race strategy

---

## 📁 Project Structure

```
toyota-gr-racing/
├── src/
│   ├── components/
│   │   ├── RaceTrack3D.tsx           # 3D track visualization
│   │   ├── CarTelemetryDiagram.tsx   # 2D car diagnostics
│   │   ├── TechnicalCharts.tsx       # Telemetry charts
│   │   ├── AdvancedInsights.tsx      # AI insights panel
│   │   ├── StrategyCharts.tsx        # Strategy charts
│   │   ├── TrackSelector.tsx         # Data selection UI
│   │   └── ...
│   ├── pages/
│   │   ├── DataSelection.tsx         # Landing page
│   │   ├── TrackVisualization.tsx    # 3D page
│   │   ├── RaceInsights.tsx          # Analysis page
│   │   └── StrategyPredictions.tsx   # Strategy page
│   ├── services/
│   │   ├── RealDataLoader.ts         # CSV data loader
│   │   ├── DataParser.ts             # Telemetry parser
│   │   └── AnalyticsEngine.ts        # Insights & ML
│   ├── contexts/
│   │   └── RaceDataContext.tsx       # React state
│   └── App.tsx
├── Race_Data/                         # Real telemetry CSV files
├── public/
└── package.json
```

---

## 🔧 Development

### Build Commands
```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Production build
npm run build

# Preview production build
npm run preview
```

### Adding New Tracks
1. Place CSV files in `Race_Data/[track-name]/`
2. Run `python tools/scan_database.py` to update the index.
3. Run `python tools/process_track.py Race_Data/[track-name] Race_Data/[map.pdf]` to generate geometry.

### Data Processing Pipeline (New)
The system now includes a robust backend pipeline for processing track data:

1. **Database Scanning**: `tools/scan_database.py` indexes the `Race_Data` directory and builds `public/database.json`.
2. **Track Processing**: `tools/process_track.py` extracts track geometry from PDF maps, vectorizes the path, and generates 3D assets (`track.obj`, `centerline.json`).
3. **Telemetry Mapping**: `tools/map_telemetry_to_track.py` maps raw CSV telemetry to the track centerline for accurate analysis.
4. **ML Training**: `tools/train_models.py` (coming soon) trains prediction models on the processed data.

---

## 📊 Performance

- **CSV Loading**: 2-5 seconds for 50MB files
- **Parsing**: 1-2 seconds for 100K points
- **Corner Detection**: <1 second
- **Insight Generation**: <1 second
- **3D Rendering**: 60 FPS
- **Total Load Time**: 5-10 seconds

---

## 🎯 Use Cases

### For Drivers
- Identify braking mistakes
- Optimize racing line
- Improve corner speed
- Reduce lap times
- Understand car behavior

### For Engineers
- Analyze telemetry data
- Compare driver performance
- Optimize car setup
- Strategy planning
- Performance tracking

### For Teams
- Driver training
- Performance benchmarking
- Race strategy
- Data-driven decisions
- Competitive analysis

---

## 🏁 Supported Tracks

1. **Barber Motorsports Park** - 2.38 miles, 17 turns
2. **Circuit of the Americas** - 3.41 miles, 20 turns
3. **Indianapolis Motor Speedway** - 2.439 miles, 14 turns
4. **Road America** - 4.048 miles, 14 turns
5. **Sebring International Raceway** - 3.74 miles, 17 turns
6. **Sonoma Raceway** - 2.385 miles, 12 turns
7. **Virginia International Raceway** - 3.27 miles, 18 turns

---

## 🤝 Contributing

This is a personal project by Tanush Shah. For inquiries or collaboration opportunities, please reach out directly.

---

## 📄 License

Copyright © 2025 Tanush Shah (The Unknown God)

All rights reserved. This project is proprietary software developed for the Toyota GR Cup 2025 season.

---

## 👨‍💻 About the Developer

**Tanush Shah** (The Unknown God) is a software engineer and motorsport enthusiast specializing in data analysis and performance optimization. This project represents a comprehensive telemetry analysis system built from scratch for professional racing applications.

**Skills Demonstrated:**
- Full-stack development (React, TypeScript, Node.js)
- 3D graphics programming (Three.js)
- Data processing & analytics
- Machine learning & predictions
- Professional UI/UX design
- Motorsport domain expertise

---

## 📞 Contact

**Developer:** Tanush Shah  
**Project:** Toyota GR Racing Telemetry System  
**Year:** 2025

---

**Built with passion for motorsport and data-driven performance optimization.**

**© 2025 Tanush Shah - The Unknown God**
