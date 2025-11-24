# Testing Instructions - Database Mode

## Overview
I've added comprehensive console logging to trace the data flow through the system. This will help us identify exactly where the issue is.

## How to Test

### Step 1: Start the Development Server
```bash
npm run dev
```

The setup script will run automatically and copy Race_Data to public folder.

### Step 2: Open Browser Console
1. Open the application in your browser
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Keep it open during testing

### Step 3: Test Database Loading
1. Select "RACE DATABASE" mode (cyan button)
2. Choose "Barber Motorsports Park" from dropdown
3. Select "Race 1"
4. Click "LOAD RACE DATA"

### Step 4: Watch Console Output

You should see logs like this:

```
🏁 [RaceDataContext] Loading race data: barber, Race 1, Vehicle ALL
📍 [RaceDataContext] Loading track geometry...
Parsing track PDF: /Race_Data/Barber_Circuit_Map.pdf
✅ [RaceDataContext] Track geometry loaded
📊 [RaceDataContext] Loading race data from CSV files...
Loading real data for Barber Motorsports Park, Race 1...
Attempting to load: /Race_Data/barber-motorsports-park/barber/R1_barber_telemetry_data.csv
Successfully loaded Race_Data/barber-motorsports-park/barber/R1_barber_telemetry_data.csv (2.5MB)
...
CSV files loaded, parsing...
Parsed 12458 telemetry points, 234 laps
Grouped into 234 laps
Detected 14 corners
Generated 8 insights
✅ [RaceDataContext] Race data loaded: {
  telemetryPoints: 12458,
  laps: 234,
  corners: 14,
  insights: 8,
  vehicles: 15
}
🏆 [RaceDataContext] Best lap: 45 (88.456s)
🎉 [RaceDataContext] Race data loading complete!
🎯 [App] State changed: { trackLoaded: true, dataLoaded: true, hasSessionData: true }
🏠 [App] Showing main interface (trackLoaded: true, dataLoaded: true)
📄 [App] Rendering page: 3d
```

## What to Look For

### ✅ Success Indicators:
- "Race data loading complete!" message
- telemetryPoints > 0
- laps > 0
- corners detected
- insights generated
- App shows main interface
- Pages render

### ❌ Failure Indicators:
- HTTP 404 errors (files not found)
- Parsing errors
- "Failed to load race data" message
- App stays on data selection screen
- No telemetry points loaded

## Common Issues and Solutions

### Issue 1: Files Not Found (404 Errors)
**Symptom:** Console shows "HTTP 404: Not Found"
**Solution:**
```bash
npm run setup
```
Then refresh the browser.

### Issue 2: Parsing Errors
**Symptom:** "Failed to parse CSV" or similar
**Cause:** CSV file format issue
**Solution:** Check the CSV file structure matches expected format

### Issue 3: No Data Displayed
**Symptom:** Data loads but graphs don't show
**Cause:** Components not reading from context
**Next Step:** Check component implementation

### Issue 4: App Doesn't Switch to Main Interface
**Symptom:** Stays on data selection screen
**Cause:** `dataLoaded` or `trackLoaded` not being set to true
**Check:** Console logs for state changes

## Expected Behavior

### After Successful Load:
1. ✅ Loading indicator appears
2. ✅ Console shows progress logs
3. ✅ Data loads successfully
4. ✅ App switches to main interface
5. ✅ 3D Visualization page shows
6. ✅ Telemetry diagram displays data
7. ✅ Racing line shows track
8. ✅ Can switch to Insights page
9. ✅ Graphs render with data
10. ✅ Can switch to Strategy page

### Current Status (What We're Debugging):
- ✅ Setup script works
- ✅ Files are accessible
- ✅ Data loads into context
- ⚠️ Need to verify: Components display data
- ⚠️ Need to verify: Graphs render
- ⚠️ Need to verify: 3D animates

## Next Steps Based on Console Output

### If Data Loads Successfully:
The issue is in component data integration. Components need to:
1. Read `sessionData` from context
2. Pass data to child components
3. Render graphs with real data
4. Animate visualizations

### If Data Doesn't Load:
The issue is in the data loading pipeline. Check:
1. File paths are correct
2. CSV format matches parser expectations
3. No CORS issues
4. Files are actually in public folder

## Debugging Commands

### Check if files exist:
```powershell
Test-Path "public/Race_Data/barber-motorsports-park/barber/R1_barber_telemetry_data.csv"
```

### List available files:
```powershell
Get-ChildItem "public/Race_Data/barber-motorsports-park/barber" -Name
```

### Check file size:
```powershell
(Get-Item "public/Race_Data/barber-motorsports-park/barber/R1_barber_telemetry_data.csv").Length / 1MB
```

## Report Format

When reporting results, please provide:

1. **Console Output:** Copy the entire console log
2. **Network Tab:** Check if files are loading (F12 → Network)
3. **State:** What does the UI show?
4. **Errors:** Any error messages?
5. **Screenshots:** If helpful

---

**Status:** Ready for Testing  
**Priority:** CRITICAL  
**Expected Time:** 5-10 minutes to test and report results
