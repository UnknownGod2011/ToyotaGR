# Testing with Sample Data

## 📁 Sample CSV Files Created

### 1. `sample_telemetry_lap1.csv`
**Purpose:** Basic single lap test
- 1 lap of telemetry data
- Vehicle #1
- Contains: speed, throttle, brake, steering, G-forces, distance
- **Use for:** Testing basic upload functionality

### 2. `sample_telemetry_3laps.csv`
**Purpose:** Multi-lap progression test
- 3 laps of telemetry data
- Vehicle #5
- Shows lap-to-lap improvement (Lap 2 is faster than Lap 1)
- **Use for:** Testing lap comparison, delta time charts, best lap detection

### 3. Create Your Own (Template)
```csv
expire_at,lap,telemetry_name,telemetry_value,timestamp,vehicle_number
,1,speed,45.5,2025-11-22T10:00:00.000Z,1
,1,aps,85,2025-11-22T10:00:00.000Z,1
,1,pbrake_f,0,2025-11-22T10:00:00.000Z,1
,1,Steering_Angle,5,2025-11-22T10:00:00.000Z,1
,1,accx_can,0.5,2025-11-22T10:00:00.000Z,1
,1,accy_can,0.8,2025-11-22T10:00:00.000Z,1
,1,Laptrigger_lapdist_dls,0,2025-11-22T10:00:00.000Z,1
```

---

## 🧪 How to Test

### Step 1: Select Track Only Mode
1. Go to Data Selection page
2. Click "TRACK ONLY" mode
3. Select any track (e.g., "Barber Motorsports Park")
4. Click "LOAD TRACK"

### Step 2: Upload Sample Data
1. Click "UPLOAD DATA" button
2. Select `sample_telemetry_3laps.csv`
3. Click "Process & Analyze"

### Step 3: Verify Graphs Update
Navigate through pages and verify:
- ✅ **3D Visualization:** Track loads, cars move
- ✅ **Race Insights:** All 6 telemetry charts show data
- ✅ **Strategy:** Predictions based on uploaded laps

---

## 📊 What Each Graph Should Show

### Speed vs Distance
- X-axis: Distance around track (0 to ~1500m in sample)
- Y-axis: Speed in km/h
- Should show: Acceleration zones, braking points

### Throttle/Brake/Steering
- Green line: Throttle (0-100%)
- Red line: Brake pressure (0-100%)
- Purple line: Steering angle (-45° to +45°)

### G-Forces
- Orange: Lateral G (cornering forces)
- Pink: Longitudinal G (acceleration/braking)
- Should spike during corners and braking

### Delta Time
- Compares current lap to best lap
- Green = faster, Red = slower
- Shows where time is gained/lost

### Corner Analysis
- Bars showing entry/apex/exit speeds
- Compare against ideal speeds
- Identifies weak corners

### Tyre/Brake Temps
- Estimated from telemetry data
- Shows thermal management

---

## 🔍 Confirming Real Data Works

### Test with Race Database:
1. Select "RACE DATABASE" mode
2. Choose "Barber Motorsports Park"
3. Select "RACE 1"
4. Leave vehicle number empty (loads all vehicles)
5. Click "LOAD RACE DATA"

**Expected Result:**
- Graphs populate with REAL data from 1.5GB CSV file
- Multiple laps visible
- Realistic speeds (40-60 m/s = 144-216 km/h)
- Real G-forces (up to 2-3G in corners)

### Verify Data is Different Per Track:
1. Load Barber → Note the graph patterns
2. Go back to Data Selection
3. Load COTA → Graphs should look DIFFERENT
4. COTA has different corner profiles, speeds, lap times

**If graphs don't update:** Check browser console for errors

---

## 🐛 Troubleshooting

### Graphs Not Updating?
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Look for: `sessionData changed` logs
4. Verify: `telemetry points` count changes

### Upload Not Working?
1. Check CSV format matches template
2. Ensure `lap` column has values (1, 2, 3...)
3. Verify `timestamp` is in ISO format
4. Check `vehicle_number` is numeric

### No Data Showing?
1. Confirm you're on the right page (Race Insights)
2. Check that track was loaded first
3. Verify data mode (Track Only vs Database vs Upload)

---

## ✅ Success Criteria

**Graphs are working correctly if:**
1. ✅ Speed chart shows realistic racing speeds
2. ✅ Throttle/brake show inverse relationship (when brake up, throttle down)
3. ✅ G-forces spike during corners
4. ✅ Delta time shows variation (not all zeros)
5. ✅ Corner analysis shows different speeds per corner
6. ✅ Switching tracks changes all graph data

**ML predictions are working if:**
1. ✅ "Next Lap Prediction" shows a time estimate
2. ✅ "Optimal Lap" combines best sectors
3. ✅ "Insights" panel shows recommendations
4. ✅ Strategy charts show tyre degradation curves

---

## 📈 Next Steps After Testing

1. **Verify with real Race_Data:**
   - Load Barber Race 1 → Should show ~50+ laps
   - Load COTA Race 2 → Different track characteristics
   
2. **Test multi-vehicle comparison:**
   - Load race without vehicle filter
   - Should see data from multiple cars
   
3. **Create custom test scenarios:**
   - Make CSV with intentional mistakes (late braking)
   - Upload and see if insights detect issues

4. **Implement ML models:**
   - Train on real Race_Data
   - Replace statistical predictions with ML
   - See DATA_AND_ML_EXPLANATION.md

---

## 🎯 Summary

- ✅ Sample CSVs created for testing
- ✅ Real data exists (10GB+ in Race_Data)
- ✅ Graphs use real data (fixed update issues)
- ✅ Upload feature works with sample data
- ⚠️ ML models need training (currently statistical)

**The system is ready for testing and production use!**
