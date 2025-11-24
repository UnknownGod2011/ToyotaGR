# 🔧 FINAL FIX INSTRUCTIONS - CRITICAL BUG

## ROOT CAUSE IDENTIFIED:

**All charts are calling `setState` inside `useMemo` which violates React rules and prevents fallback data from rendering!**

## THE BUG:

Every chart has this pattern:
```typescript
const [usingFallback, setUsingFallback] = useState(false);

const chartData = useMemo(() => {
  if (!sessionData) {
    setUsingFallback(true); // ❌ BUG! Can't call setState in useMemo
    return fallbackData;
  }
  setUsingFallback(false); // ❌ BUG!
  return realData;
}, [sessionData]);
```

## THE FIX:

For EACH chart, replace with:
```typescript
// Remove useState completely
// const [usingFallback, setUsingFallback] = useState(false); // DELETE THIS

const chartData = useMemo(() => {
  if (!sessionData) {
    // Remove setUsingFallback(true); // DELETE THIS
    return fallbackData;
  }
  // Remove setUsingFallback(false); // DELETE THIS
  return realData;
}, [sessionData]);

// Add this AFTER useMemo
const usingFallback = !sessionData || !sessionData.telemetry || sessionData.telemetry.size === 0;
```

## CHARTS THAT NEED FIXING:

1. ✅ SpeedVsDistanceChart - ALREADY FIXED
2. ❌ ThrottleBrakeSteeringChart - Line 195
3. ❌ GForceChart - Line 268
4. ❌ DeltaTimeChart - Line 336
5. ❌ TyreTemperatureChart - Line 420
6. ❌ BrakeTemperatureChart - Line 487
7. ❌ CornerAnalysisChart - Line 555
8. ❌ TimeLossHeatmap - Line 611 (already fixed, no useState)
9. ❌ SectorComparisonChart - Line 660

## VEHICLE TELEMETRY:

The vehicle telemetry shows 0 because the animation is working but the fallback data calculation might have an issue. The `currentPoint` is incrementing, but the phase calculation might be wrong.

Current code:
```typescript
const phase = (currentPoint % 10) / 10;
```

This should work, but let me verify the animation is actually running by checking if `currentPoint` is incrementing.

## IMMEDIATE ACTION NEEDED:

1. Remove ALL `const [usingFallback, setUsingFallback] = useState(false);` lines
2. Remove ALL `setUsingFallback(true)` and `setUsingFallback(false)` calls from inside `useMemo`
3. Add `const usingFallback = !sessionData || !sessionData.telemetry || sessionData.telemetry.size === 0;` AFTER each `useMemo`

This will fix the graphs immediately!
