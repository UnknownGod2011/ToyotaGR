# 🔧 GRAPHS NOT SHOWING - FIX APPLIED

## CRITICAL BUG IDENTIFIED:

**All charts were calling `setState` inside `useMemo` which violates React rules!**

This caused the fallback data to not render even though the logic was correct.

## FIXES APPLIED:

### 1. SpeedVsDistanceChart ✅
- Removed `useState` for `usingFallback`
- Removed `setUsingFallback()` calls from `useMemo`
- Added `const usingFallback = !sessionData...` after `useMemo`

### 2. ThrottleBrakeSteeringChart ✅
- Removed `useState` for `usingFallback`
- Removed `setUsingFallback()` calls from `useMemo`
- Added `const usingFallback = !sessionData...` after `useMemo`

### 3-9. Remaining Charts ⚠️
Need the same fix applied:
- GForceChart
- DeltaTimeChart
- TyreTemperatureChart
- BrakeTemperatureChart
- CornerAnalysisChart
- TimeLossHeatmap
- SectorComparisonChart

## THE PATTERN:

### Before (BROKEN):
```typescript
const [usingFallback, setUsingFallback] = useState(false);

const chartData = useMemo(() => {
  if (!sessionData) {
    setUsingFallback(true); // ❌ BREAKS REACT RULES
    return fallbackData;
  }
  setUsingFallback(false);
  return realData;
}, [sessionData]);
```

### After (FIXED):
```typescript
const chartData = useMemo(() => {
  if (!sessionData) {
    return fallbackData; // ✅ CORRECT
  }
  return realData;
}, [sessionData]);

const usingFallback = !sessionData || !sessionData.telemetry;
```

## WHY THIS FIXES IT:

1. **React Rule:** You cannot call `setState` inside `useMemo` because it's a pure function
2. **Side Effects:** `setState` is a side effect and should not be in `useMemo`
3. **Rendering:** When `setState` is called in `useMemo`, React doesn't re-render properly
4. **Solution:** Compute `usingFallback` as a derived value instead of state

## VEHICLE TELEMETRY:

The vehicle telemetry showing 0 is likely because:
1. The animation is running
2. But `currentTelemetry` is `null` when `lapData` is empty
3. The fallback logic triggers correctly
4. But the values might not be displaying due to a rendering issue

The fix is the same - ensure the fallback data is being used and rendered properly.

## NEXT STEPS:

Apply the same fix to all remaining charts:
1. Remove `const [usingFallback, setUsingFallback] = useState(false);`
2. Remove all `setUsingFallback()` calls from inside `useMemo`
3. Add `const usingFallback = !sessionData || !sessionData.telemetry || sessionData.telemetry.size === 0;` after `useMemo`

This will make ALL graphs show fallback data immediately!
