# Race Database Setup Guide

## Overview
The Toyota GR Racing telemetry system can load race data from the existing database of CSV files. This guide explains how to set up and use the database.

## Quick Setup

### Automatic Setup (Recommended)
The setup script runs automatically when you start the dev server or build:

```bash
npm run dev
```

This will:
1. Copy the `Race_Data` folder to `public/Race_Data`
2. Start the development server
3. Make all race data accessible to the application

### Manual Setup
If you need to run the setup separately:

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File ./setup-data.ps1
```

**Mac/Linux (Bash):**
```bash
bash ./setup-data.sh
```

## Database Structure

The race database is organized as follows:

```
Race_Data/
├── barber-motorsports-park/
│   └── barber/
│       ├── R1_barber_telemetry_data.csv
│       ├── R1_barber_lap_time.csv
│       ├── R2_barber_telemetry_data.csv
│       ├── R2_barber_lap_time.csv
│       ├── 26_Weather_Race 1_Anonymized.CSV
│       ├── 26_Weather_Race 2_Anonymized.CSV
│       ├── 99_Best 10 Laps By Driver_Race 1_Anonymized.CSV
│       └── 99_Best 10 Laps By Driver_Race 2_Anonymized.CSV
├── circuit-of-the-americas/
├── indianapolis/
├── road-america/
├── sebring/
├── sonoma/
└── virginia-international-raceway/
```

## Available Tracks

1. **Barber Motorsports Park** (`barber`)
   - Race 1 & Race 2 data available
   
2. **Circuit of the Americas** (`cota`)
   - Race 1 & Race 2 data available
   
3. **Indianapolis Motor Speedway** (`indianapolis`)
   - Race 1 & Race 2 data available
   
4. **Road America** (`road-america`)
   - Race 1 & Race 2 data available
   
5. **Sebring International Raceway** (`sebring`)
   - Race 1 & Race 2 data available
   
6. **Sonoma Raceway** (`sonoma`)
   - Race 1 & Race 2 data available
   
7. **Virginia International Raceway** (`vir`)
   - Race 1 & Race 2 data available

## Using the Database

### In the Application

1. **Launch the application**
   ```bash
   npm run dev
   ```

2. **Select "RACE DATABASE" mode** (cyan button)

3. **Choose a track** from the dropdown

4. **Select Race 1 or Race 2**

5. **(Optional) Filter by vehicle number**

6. **Click "LOAD RACE DATA"**

The system will:
- Load telemetry data from CSV files
- Parse lap times and weather data
- Calculate distance-based telemetry
- Detect corners automatically
- Generate insights and predictions
- Display everything in the UI

## Data Files

### Required Files per Track/Race:
- `R{N}_{track}_telemetry_data.csv` - Main telemetry data
- `R{N}_{track}_lap_time.csv` - Lap timing data
- `26_Weather_Race {N}_Anonymized.CSV` - Weather conditions
- `99_Best 10 Laps By Driver_Race {N}_Anonymized.CSV` - Best lap data

### Telemetry Data Format:
The telemetry CSV contains columns for:
- `lap` - Lap number
- `telemetry_name` - Signal name (speed, aps, pbrake_f, etc.)
- `telemetry_value` - Signal value
- `timestamp` - ISO timestamp
- `vehicleNumber` - Vehicle identifier

### Supported Telemetry Signals:
- `speed` - Vehicle speed (km/h)
- `aps` - Throttle position (0-100%)
- `pbrake_f` - Front brake pressure
- `pbrake_r` - Rear brake pressure
- `Steering_Angle` - Steering angle (degrees)
- `gear` - Current gear
- `nmot` - Engine RPM
- `accx_can` - Lateral acceleration (G)
- `accy_can` - Longitudinal acceleration (G)
- `VBOX_Lat_Min` - GPS latitude
- `VBOX_Long_Minutes` - GPS longitude
- `Laptrigger_lapdist_dls` - Lap distance

## Troubleshooting

### "Failed to load race data"
**Cause:** CSV files not accessible
**Solution:** Run the setup script:
```bash
npm run setup
```

### "Track not found"
**Cause:** Invalid track ID
**Solution:** Use one of the valid track IDs: `barber`, `cota`, `indianapolis`, `road-america`, `sebring`, `sonoma`, `vir`

### "No valid laps found"
**Cause:** Telemetry data is corrupted or empty
**Solution:** Check that the CSV files exist and contain data

### Files not loading in production
**Cause:** Race_Data folder not included in build
**Solution:** The build script automatically copies Race_Data to the dist folder

## Development Notes

### Why Copy to Public?
Vite serves static files from the `public` folder. The `Race_Data` folder must be in `public` for the browser to fetch CSV files via HTTP.

### Updating Race Data
If you add new race data:
1. Place CSV files in the appropriate `Race_Data/{track}/{folder}/` directory
2. Run `npm run setup` to copy to public
3. Restart the dev server

### File Size Considerations
The Race_Data folder is large (~500MB+). The setup script copies it to public, which means:
- Development: Files are served by Vite dev server
- Production: Files are included in the build output
- Git: Race_Data should be in `.gitignore` if too large

## Performance

### Loading Times
- **Small datasets** (1 vehicle): 1-3 seconds
- **Medium datasets** (5 vehicles): 3-8 seconds
- **Large datasets** (all vehicles): 8-15 seconds

### Optimization Tips
1. Filter by vehicle number to reduce data size
2. Use specific race selection (don't load all races)
3. Close other browser tabs to free memory
4. Use Chrome/Edge for best performance

## Data Privacy

All race data has been anonymized:
- Driver names removed
- Team information redacted
- Vehicle numbers preserved for analysis
- Telemetry data unchanged

---

**Need Help?** Check the console logs for detailed error messages and loading progress.
