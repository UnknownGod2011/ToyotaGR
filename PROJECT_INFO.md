# Toyota GR Racing - Telemetry & Driver Insights System

**Project Information**

---

## Developer

**Name:** Tanush Shah  
**Alias:** The Unknown God  
**Year:** 2025  
**Project Type:** Professional Motorsport Telemetry Analysis

---

## Project Description

A comprehensive, professional-grade telemetry analysis system built from scratch for the Toyota GR Cup 2025 season. This system processes real race data from 7 professional circuits, generates AI-powered insights, and provides ML-based predictions to help drivers optimize their performance.

---

## Technical Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)

### 3D Graphics
- Three.js
- React Three Fiber
- React Three Drei

### Data Visualization
- Recharts (professional telemetry charts)
- Custom SVG visualizations
- Real-time data rendering

### Data Processing
- Custom CSV parser
- Analytics engine
- ML prediction models
- Corner detection algorithms

---

## Key Features

### Real Data Processing
- Loads actual CSV files from 7 professional circuits
- Processes 12 telemetry signals per lap
- Handles 50MB+ files efficiently
- Supports vehicle number filtering

### Advanced Analytics
- Automatic corner detection from G-forces
- Braking point analysis
- Apex speed optimization
- Throttle timing analysis
- Steering smoothness metrics
- Handling issue detection

### Machine Learning
- Lap time prediction (linear regression)
- Tyre degradation modeling
- Fuel consumption forecasting
- Temperature predictions
- Optimal lap construction

### Professional Visualization
- 3D track replay with animated cars
- 15+ technical telemetry charts
- 2D car diagnostics (F1-style)
- Racing line analysis
- Corner-by-corner breakdown

---

## Supported Circuits

1. **Barber Motorsports Park** - Alabama
2. **Circuit of the Americas** - Texas
3. **Indianapolis Motor Speedway** - Indiana
4. **Road America** - Wisconsin
5. **Sebring International Raceway** - Florida
6. **Sonoma Raceway** - California
7. **Virginia International Raceway** - Virginia

---

## Architecture

### Data Flow
```
CSV Files (Race_Data/)
    ↓
RealDataLoader (file loading)
    ↓
DataParser (CSV parsing)
    ↓
AnalyticsEngine (insights & ML)
    ↓
RaceDataContext (React state)
    ↓
UI Components (visualization)
```

### Key Services
- **RealDataLoader** - Loads CSV files from Race_Data folder
- **DataParser** - Parses telemetry into structured format
- **AnalyticsEngine** - Generates insights and predictions

### UI Components
- **DataSelection** - Track and race selection
- **TrackVisualization** - 3D track replay
- **RaceInsights** - Performance analysis
- **StrategyPredictions** - ML forecasting

---

## Performance Metrics

- **CSV Loading:** 2-5 seconds (50MB files)
- **Data Parsing:** 1-2 seconds (100K points)
- **Corner Detection:** <1 second
- **Insight Generation:** <1 second
- **3D Rendering:** 60 FPS
- **Total Load Time:** 5-10 seconds

---

## Development Timeline

**Phase 1:** Data Infrastructure
- CSV parser implementation
- Data loader service
- Analytics engine foundation

**Phase 2:** UI Development
- Track selection interface
- 3D visualization
- Technical charts
- Car telemetry diagram

**Phase 3:** Analytics & ML
- Corner detection algorithm
- Insight generation
- Prediction models
- Optimal lap construction

**Phase 4:** Polish & Optimization
- Performance optimization
- Error handling
- UI refinements
- Documentation

---

## Code Quality

- **Type Safety:** 100% TypeScript
- **Error Handling:** Comprehensive
- **Performance:** Optimized
- **Architecture:** Scalable
- **Documentation:** Complete

---

## Use Cases

### For Drivers
- Identify performance issues
- Optimize racing line
- Improve lap times
- Understand car behavior

### For Engineers
- Analyze telemetry data
- Compare driver performance
- Optimize car setup
- Strategy planning

### For Teams
- Driver training
- Performance benchmarking
- Race strategy
- Data-driven decisions

---

## Future Enhancements

- PDF track map parsing
- GPS-based 3D track rendering
- Advanced ML models (XGBoost, LSTM)
- Real-time telemetry streaming
- Driver training recommendations
- Simple English summary page
- Multi-lap comparison tools

---

## Technical Achievements

1. **Real Data Processing** - No mock data, all from actual CSV files
2. **Automatic Corner Detection** - Physics-based algorithm
3. **ML Predictions** - Trained on real lap data
4. **Professional UI** - Motorsport-grade design
5. **3D Visualization** - Real-time track replay
6. **15+ Charts** - Comprehensive telemetry analysis
7. **Type Safety** - Full TypeScript implementation
8. **Performance** - Optimized for large datasets

---

## Project Statistics

- **Lines of Code:** 10,000+
- **Components:** 20+
- **Services:** 5
- **Charts:** 15+
- **Tracks Supported:** 7
- **Telemetry Signals:** 12
- **Development Time:** Extensive

---

## Contact

**Developer:** Tanush Shah (The Unknown God)  
**Project:** Toyota GR Racing Telemetry System  
**Year:** 2025

---

**© 2025 Tanush Shah - The Unknown God**

**Built with passion for motorsport and data-driven performance optimization.**
