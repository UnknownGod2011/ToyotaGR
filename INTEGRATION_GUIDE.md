# Toyota GR Race Analysis - Integration Guide

## Overview

This application is a production-ready, 3-page motorsport analytics dashboard designed for the Toyota GR Cup 2025. The UI is fully structured with placeholders ready for telemetry data, ML insights, and 3D track visualization integration.

---

## Architecture

### Pages Structure

#### 1. **3D Visualization** (`/src/pages/TrackVisualization.tsx`)
Main visualization page for track rendering and lap replay.

**Key Components:**
- Track configuration panel with track selector and session info
- 3D track canvas placeholder (ready for Three.js integration)
- Replay controls with playback speed and progress bar
- Quick insights sidebar with ML-driven predictions
- Toggle controls for racing line, braking zones, throttle heatmap, and delta overlay

**Integration Points:**
```typescript
// TODO: Integrate Three.js 3D Track Engine
// TODO: Render racing line (User Lap, Best Lap, Pro Lap)
// TODO: Animate car along track based on telemetry timestamps
```

---

#### 2. **Race Insights** (`/src/pages/RaceInsights.tsx`)
Deep telemetry analytics with comprehensive charts and tables.

**Sections:**

**A. Lap Overview**
- Best lap vs current lap comparison
- Sector times table
- Time lost per sector visualization

**B. Delta Time Analysis**
```typescript
// TODO: Plot Delta vs Distance
// TODO: Overlay user lap with reference lap
```

**C. Speed & Input Analysis**
- Speed vs Distance chart placeholder
- Throttle/Brake/Steering vs Distance chart placeholder

**D. G-Force & Corner Analysis**
- Lateral & Longitudinal G-force chart placeholder
- Corner-by-corner performance table with:
  - Entry/Apex/Exit speeds
  - Time lost per corner
  - AI-driven improvement advice

**E. Consistency & Driver Behavior**
- Lap-by-lap sector consistency
- Steering smoothness meter (circular progress indicator)
- Behavior detection (corrections, understeer, oversteer, lock-ups)

```typescript
// TODO: Add ML-based anomaly detection
// TODO: Add stability and smoothness scoring
```

---

#### 3. **Strategy & Predictions** (`/src/pages/StrategyPredictions.tsx`)
AI-powered strategy planning and what-if simulation.

**Sections:**

**A. Next-Lap Prediction**
- Predicted next lap time
- Confidence level indicator
- Improvement forecast
- Fuel and tire degradation impact

**B. What-If Simulator**
Interactive controls:
- Pace delta slider
- Pit stop lap selector
- Pit loss time input
- Tire compound selector
- Pro-line driving toggle

```typescript
// TODO: Project finishing time (Monte Carlo)
// TODO: Show 3 strategy lines:
// Current Pace / Ideal Pace / AI Improved Pace
```

**C. Pit Stop Advisor**
- Recommended pit lap
- Expected time gain
- Risk level assessment
- Tire life indicator
- AI explanation for recommendation

**D. AI Coaching Recommendations**
Scrollable list with:
- Category (Braking, Corner Entry, Throttle, Racing Line, etc.)
- Priority level (HIGH/MEDIUM/LOW)
- Detailed suggestion text
- Potential time gain

```typescript
// TODO: Inject real-time ML coaching module
// TODO: Use SHAP-driven explanatory insights
// TODO: Prioritize suggestions by impact × confidence
```

---

## Component Architecture

### Navigation
**NavigationSidebar** (`/src/components/NavigationSidebar.tsx`)
- Page navigation with active state highlighting
- System status indicator
- Settings and Help buttons

### Global Components
**Navbar** (`/src/components/Navbar.tsx`)
- Premium header with neon glow effects
- Animated background shimmer
- Live status indicator

**AnimatedBackground** (`/src/components/AnimatedBackground.tsx`)
- Dynamic gradient orbs
- Rotating grid overlay
- Floating particles

**ThemeProvider** (`/src/components/ThemeProvider.tsx`)
- Global theme wrapper

---

## Styling System

### Color Palette
```css
--gr-red: #FF1E26        /* Primary action color */
--gr-cyan: #00D4FF       /* Data visualization and highlights */
--gr-yellow: #FFD700     /* Warnings and coaching */
--gr-black: #0a0a0a      /* Background base */
```

### Key CSS Classes

**`.glass-panel`**
- Semi-transparent background with backdrop blur
- Used for all major containers

**`.racing-button`**
- Interactive button with neon hover effects
- Shimmer animation on hover

**`.custom-scrollbar`**
- Styled scrollbar with cyan accent
- Applied to scrollable sections

**`.neon-red` / `.neon-cyan`**
- Text glow effects for headers

---

## Data Integration Points

### Telemetry Data Structure (Recommended)

```typescript
interface LapTelemetry {
  timestamp: number;
  distance: number;
  speed: number;
  throttle: number;  // 0-100
  brake: number;     // 0-100
  steering: number;  // -100 to 100
  gLat: number;
  gLong: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

interface SectorTime {
  sector: number;
  time: number;
  delta: number;
}

interface LapData {
  lapNumber: number;
  lapTime: number;
  sectors: SectorTime[];
  telemetry: LapTelemetry[];
}
```

### ML Model Integration Points

1. **Lap Time Prediction**
   - Location: `TrackVisualization.tsx` Quick Insights panel
   - Input: Current telemetry + track conditions
   - Output: Predicted lap time + confidence

2. **Time Loss Detection**
   - Location: `TrackVisualization.tsx` Quick Insights panel
   - Input: User telemetry vs reference lap
   - Output: Top 3 corners with time loss + delta

3. **Coaching Suggestions**
   - Location: `StrategyPredictions.tsx` AI Coaching section
   - Input: Driving behavior analysis
   - Output: Prioritized improvement suggestions with potential gains

4. **Strategy Optimization**
   - Location: `StrategyPredictions.tsx` What-If Simulator
   - Input: Pace delta, pit strategy, tire compound
   - Output: Race finish prediction with confidence intervals

---

## Chart Integration

All chart placeholders follow this pattern:

```tsx
<div className="h-64 bg-black/30 rounded border border-cyan-500/20 flex items-center justify-center">
  {/* Replace this div with your chart library */}
  <p className="text-sm text-cyan-400 font-mono">{`// Chart Canvas`}</p>
</div>
```

**Recommended Libraries:**
- **Chart.js** or **Recharts** for 2D telemetry graphs
- **Three.js** for 3D track visualization
- **D3.js** for advanced custom visualizations

---

## 3D Track Visualization Integration

**Location:** `TrackVisualization.tsx` main canvas area

**Suggested Implementation:**
1. Load track geometry from CSV/JSON
2. Parse GPS coordinates into 3D space
3. Render track mesh with texture
4. Animate car model along telemetry path
5. Sync animation with replay controls

**Required Features:**
- Camera controls (orbit, pan, zoom)
- Racing line overlay (user vs pro)
- Braking zone visualization (red zones)
- Throttle heatmap on track surface
- Delta time overlay at corners

---

## State Management

Currently using React `useState` for local state. For production:

**Recommended:**
- **Zustand** or **Redux Toolkit** for global state
- **React Query** for server state and data fetching
- **WebSocket** for live telemetry streaming

---

## Responsive Design

All layouts are responsive with breakpoints:
- Desktop: 1440px+ (primary target)
- Laptop: 1280px
- Tablet: 768px (basic support)

---

## File Organization

```
src/
├── pages/
│   ├── TrackVisualization.tsx   (3D Visualization page)
│   ├── RaceInsights.tsx          (Charts & Analysis page)
│   └── StrategyPredictions.tsx   (Strategy & AI page)
├── components/
│   ├── AnimatedBackground.tsx
│   ├── Navbar.tsx
│   ├── NavigationSidebar.tsx
│   └── ThemeProvider.tsx
├── styles/
│   └── globals.css               (Global styles & animations)
├── App.tsx                       (Main router)
└── main.tsx                      (Entry point)
```

---

## Next Steps for Integration

### Immediate Tasks:
1. ✅ UI structure complete
2. ⏳ Integrate telemetry data loading
3. ⏳ Connect ML prediction models
4. ⏳ Implement chart rendering
5. ⏳ Build 3D track visualization engine
6. ⏳ Add WebSocket for live data streaming

### Phase 2:
- User authentication
- Session storage/retrieval
- Export functionality
- Multi-driver comparison
- Historical data analysis

---

## Performance Optimization

**Already Implemented:**
- CSS animations using GPU acceleration
- Efficient React component structure
- Optimized bundle size

**Future Recommendations:**
- Lazy load 3D engine
- Virtual scrolling for large telemetry datasets
- Web Workers for ML inference
- Canvas-based chart rendering for large datasets

---

## Support & Documentation

For questions about UI structure or integration:
1. Check TODO comments in code
2. Review component props and interfaces
3. Refer to this integration guide

**Key Files to Review:**
- `src/pages/TrackVisualization.tsx` - Main 3D page structure
- `src/pages/RaceInsights.tsx` - Charts and analytics layout
- `src/pages/StrategyPredictions.tsx` - Strategy and AI features
- `src/styles/globals.css` - Theme variables and animations

---

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

**Dashboard Status:** ✅ Production-Ready UI Structure
**Integration Status:** ⏳ Ready for Data & ML Integration
**Last Updated:** 2025-11-15
