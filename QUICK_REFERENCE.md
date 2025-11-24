# Toyota GR Racing - Quick Reference Card

## 🚀 Getting Started

### First Time Setup
```bash
npm install
npm run dev
```
The setup script runs automatically and copies race data to the public folder.

### Daily Development
```bash
npm run dev
```

## 📊 Using the Application

### Three Modes Available:

#### 1. 🟣 TRACK ONLY Mode
- Load track geometry for 3D visualization
- No telemetry required
- Perfect for exploring circuits

**Steps:**
1. Click "TRACK ONLY" (purple button)
2. Select a track
3. Click "LOAD TRACK"
4. View 3D track layout

#### 2. 🔵 RACE DATABASE Mode
- Load existing race data from CSV files
- Full telemetry, insights, and predictions
- 7 tracks × 2 races = 14 datasets available

**Steps:**
1. Click "RACE DATABASE" (cyan button)
2. Select a track
3. Choose Race 1 or 2
4. (Optional) Enter vehicle number
5. Click "LOAD RACE DATA"
6. Wait 5-15 seconds for loading

#### 3. 🟢 UPLOAD DATA Mode
- Upload your own telemetry
- Automatic validation and cleaning
- Missing value handling

**Steps:**
1. Click "UPLOAD DATA" (green button)
2. Select a track (for geometry)
3. Click "UPLOAD TELEMETRY"
4. Drag & drop or select CSV/JSON file
5. Review validation results
6. Click "CONFIRM & LOAD DATA"

## 🎯 Available Tracks

| Track | ID | Races |
|-------|-----|-------|
| Barber Motorsports Park | `barber` | 1, 2 |
| Circuit of the Americas | `cota` | 1, 2 |
| Indianapolis Motor Speedway | `indianapolis` | 1, 2 |
| Road America | `road-america` | 1, 2 |
| Sebring International Raceway | `sebring` | 1, 2 |
| Sonoma Raceway | `sonoma` | 1, 2 |
| Virginia International Raceway | `vir` | 1, 2 |

## 📁 File Format for Uploads

### CSV Format:
```csv
timestamp,lap,speed,throttle,brake_front,steering,gear,rpm
2024-01-01T10:00:00.000Z,1,120.5,85,0,15,4,6500
```

### JSON Format:
```json
[
  {
    "timestamp": "2024-01-01T10:00:00.000Z",
    "lap": 1,
    "speed": 120.5,
    "throttle": 85
  }
]
```

### Required Fields:
- `timestamp` - Date/time
- `lap` - Lap number

### Optional Fields (auto-estimated if missing):
- `speed`, `throttle`, `brake_front`, `brake_rear`
- `steering`, `gear`, `rpm`
- `accx`, `accy` (G-forces)
- `latitude`, `longitude` (GPS)

## 🎨 UI Pages

### 1. 3D Track Visualization
- Real-time 3D track rendering
- Animated car replay
- Telemetry overlay
- Playback controls

### 2. Race Insights
- Speed vs Distance charts
- Throttle/Brake/Steering traces
- G-Force analysis
- Corner-by-corner breakdown
- Racing line comparison
- Time loss heatmap

### 3. Strategy & Predictions
- ML lap time predictions
- Tyre degradation forecast
- Fuel usage analysis
- Pit strategy optimization
- Monte Carlo simulations

## ⚡ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause replay |
| ← → | Rewind/Fast forward |
| R | Reset replay |
| 1-3 | Switch to page 1-3 |

## 🐛 Troubleshooting

### Database Won't Load
```bash
npm run setup
```

### Build Fails
```bash
npm run typecheck
npm run build
```

### Data Not Showing
1. Check console for errors
2. Verify track is selected
3. Ensure data is uploaded/loaded
4. Refresh browser

### Performance Issues
1. Filter by vehicle number
2. Close other tabs
3. Use Chrome/Edge
4. Clear browser cache

## 📊 Performance Tips

### Loading Times:
- Track only: < 1 second
- Database (1 vehicle): 2-5 seconds
- Database (all vehicles): 10-15 seconds
- Upload processing: 3-8 seconds

### Optimization:
- Use vehicle number filter
- Select specific race
- Upload smaller datasets
- Use modern browser

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start dev server (with auto-setup)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Type checking
npm run typecheck

# Linting
npm run lint

# Setup data manually
npm run setup
```

## 📝 File Structure

```
toyota-gr-racing/
├── Race_Data/           # Original race data
├── public/
│   └── Race_Data/       # Copied by setup script
├── src/
│   ├── components/      # UI components
│   ├── pages/          # Main pages
│   ├── services/       # Data services
│   └── contexts/       # React contexts
├── setup-data.ps1      # Windows setup
├── setup-data.sh       # Unix setup
└── package.json
```

## 🎯 Quick Tips

1. **Always run setup first** - `npm run dev` does this automatically
2. **Use database mode** to see example data
3. **Start with track-only** to explore circuits
4. **Upload your data** for custom analysis
5. **Check console logs** for detailed info
6. **Filter by vehicle** for faster loading
7. **Use Chrome DevTools** for debugging

## 🆘 Getting Help

### Check These First:
1. Console logs (F12 → Console)
2. Network tab (F12 → Network)
3. Error messages in UI
4. Documentation files

### Common Issues:
- **404 errors** → Run `npm run setup`
- **Parsing errors** → Check CSV format
- **Slow loading** → Filter by vehicle
- **No graphs** → Ensure data is loaded

## 📚 Documentation Files

- `README.md` - Project overview
- `QUICK_START_GUIDE.md` - Detailed user guide
- `DATABASE_SETUP.md` - Database configuration
- `SYSTEM_OVERHAUL_COMPLETE.md` - Technical details
- `UI_REDESIGN_COMPLETE.md` - UI documentation
- `DATABASE_FIX_COMPLETE.md` - Database fix details

## 🎨 Color Guide

- **Purple** - Track-only mode
- **Cyan** - Database mode / Primary UI
- **Green** - Upload mode / Success
- **Yellow** - Warnings
- **Red** - Errors / Braking zones
- **Orange** - Cautions / Heat

## 🏁 Ready to Race!

1. Run `npm run dev`
2. Select a mode
3. Choose a track
4. Load or upload data
5. Analyze and improve!

---

**Need more help?** Check the full documentation or console logs for detailed information.
