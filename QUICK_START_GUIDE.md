# Toyota GR Racing - Quick Start Guide

## 🚀 Getting Started

### Option 1: Load Track Only (3D Visualization)
Perfect for exploring track layouts before uploading telemetry.

1. Launch the application
2. Select **"TRACK ONLY"** mode (purple button)
3. Choose a circuit from the dropdown
4. Click **"LOAD TRACK"**
5. View the 3D track visualization
6. Upload telemetry later when ready

### Option 2: Load From Race Database
Use existing race data from the database.

1. Launch the application
2. Select **"RACE DATABASE"** mode (cyan button)
3. Choose a circuit from the dropdown
4. Select Race 1 or Race 2
5. (Optional) Enter a vehicle number to filter
6. Click **"LOAD RACE DATA"**
7. All components populate with real data

### Option 3: Upload Your Own Telemetry
Upload custom lap data with automatic validation and cleaning.

1. Launch the application
2. Select **"UPLOAD DATA"** mode (green button)
3. Choose a circuit (for track geometry)
4. Click **"UPLOAD TELEMETRY"**
5. Drag & drop or select your CSV/JSON file
6. Review validation results and warnings
7. Click **"CONFIRM & LOAD DATA"**
8. System processes and displays your data

## 📁 File Format Requirements

### CSV Format Example
```csv
timestamp,lap,speed,throttle,brake_front,steering,gear,rpm,accx,accy,latitude,longitude
2024-01-01T10:00:00.000Z,1,120.5,85,0,15,4,6500,0.8,1.2,33.4567,-84.1234
2024-01-01T10:00:00.100Z,1,122.3,90,0,12,4,6600,0.9,1.3,33.4568,-84.1235
```

### JSON Format Example
```json
[
  {
    "timestamp": "2024-01-01T10:00:00.000Z",
    "lap": 1,
    "speed": 120.5,
    "throttle": 85,
    "brake_front": 0,
    "steering": 15,
    "gear": 4,
    "rpm": 6500,
    "accx": 0.8,
    "accy": 1.2,
    "latitude": 33.4567,
    "longitude": -84.1234
  }
]
```

## 📊 Supported Fields

### Required Fields
- **timestamp** - Date/time of measurement (ISO format recommended)
- **lap** - Lap number (integer)

### Optional Fields (Auto-Estimated if Missing)
- **speed** - Vehicle speed in km/h
- **throttle** - Throttle position (0-100%)
- **brake_front** - Front brake pressure (0-100%)
- **brake_rear** - Rear brake pressure (0-100%)
- **steering** - Steering angle in degrees
- **gear** - Current gear (1-6)
- **rpm** - Engine RPM
- **accx** - Lateral G-force
- **accy** - Longitudinal G-force
- **latitude** - GPS latitude
- **longitude** - GPS longitude
- **distance** - Lap distance in meters

### Field Name Variations (All Supported)
The system automatically recognizes these variations:

**Speed:** `speed`, `velocity`, `vcar`  
**Throttle:** `throttle`, `aps`, `throttle_position`  
**Brake:** `brake`, `brake_front`, `pbrake_f`  
**Steering:** `steering`, `steering_angle`  
**Gear:** `gear`  
**RPM:** `rpm`, `nmot`, `engine_rpm`  
**Lateral G:** `accx`, `accx_can`, `lateral_g`, `lat_g`  
**Longitudinal G:** `accy`, `accy_can`, `long_g`, `longitudinal_g`  
**GPS:** `latitude`/`lat`, `longitude`/`long`/`lon`

## 🎯 Available Tracks

1. **Barber Motorsports Park** - Technical road course
2. **Circuit of the Americas (COTA)** - F1-grade facility
3. **Indianapolis Motor Speedway** - Legendary oval + road course
4. **Road America** - Fast, flowing layout
5. **Sebring International Raceway** - Historic endurance circuit
6. **Sonoma Raceway** - Hillside with elevation changes
7. **Virginia International Raceway (VIR)** - Technical multi-sector

## 🔍 What You'll See

### 3D Track Visualization Tab
- Real-time 3D track rendering from PDF geometry
- Animated car replay (blue = your lap, red = reference)
- Corner labels and sector divisions
- Telemetry overlay
- Playback controls (play/pause/speed)
- Sector time breakdown

### Race Insights Tab
- Speed vs Distance charts
- Throttle/Brake/Steering traces
- G-Force analysis
- Delta time comparison
- Corner-by-corner analysis
- Time loss heatmap
- Racing line visualization
- AI-generated insights

### Strategy & Predictions Tab
- ML-powered lap time predictions
- Tyre degradation forecast
- Fuel usage analysis
- Pit strategy optimization
- Monte Carlo race simulations
- Driver performance scoring
- Strategy recommendations

## ⚠️ Important Notes

### Missing Data Handling
The system automatically handles missing data:
- **Speed** - Estimated from acceleration or interpolated
- **Distance** - Calculated from speed integration
- **Throttle/Brake** - Interpolated from nearby values
- **Gear** - Estimated from speed
- **RPM** - Calculated from speed and gear
- **GPS** - Interpolated between known points

You'll see warnings for missing fields, but the system won't crash.

### Data Quality Tips
For best results:
- Include timestamp and lap number (required)
- Provide speed data (most important)
- Include GPS coordinates for accurate track mapping
- Use consistent sampling rate (10-100 Hz recommended)
- Ensure lap numbers are sequential

### Performance
- Large files (>100MB) may take 10-30 seconds to process
- Processing includes validation, cleaning, and analysis
- Progress indicators show current status

## 🐛 Troubleshooting

### "No valid laps found"
- Check that lap numbers are present
- Ensure timestamps are valid
- Verify lap times are reasonable (30s - 5min)

### "Required field missing: timestamp"
- Add a timestamp column to your data
- Use ISO format: `2024-01-01T10:00:00.000Z`

### "Upload failed"
- Check file format (CSV or JSON only)
- Verify file isn't corrupted
- Ensure file size is reasonable (<500MB)

### Graphs not showing
- Ensure telemetry data is uploaded
- Check that required fields are present
- Look for validation warnings

## 💡 Pro Tips

1. **Start with Track Only** - Load the track first to see the 3D layout
2. **Check Validation** - Review warnings before confirming upload
3. **Use Database First** - Try existing race data to understand the system
4. **Export Templates** - Use database data as a template for your uploads
5. **Incremental Upload** - Start with one lap to test, then upload full session

## 🎨 UI Color Guide

- **Purple** - Track-only mode
- **Cyan** - Database mode  
- **Green** - Upload mode / Success
- **Yellow** - Warnings / Blank states
- **Red** - Errors / Braking zones
- **Blue** - Your lap / Primary data
- **Red (in 3D)** - Reference lap / Comparison

## 📞 Support

For issues or questions:
- Check validation warnings in upload modal
- Review console logs for detailed errors
- Ensure data format matches examples above
- Verify track is selected before uploading

---

**Ready to race? Select a track and start analyzing!** 🏁
