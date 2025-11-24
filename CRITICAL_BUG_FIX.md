# 🐛 CRITICAL BUG FOUND AND FIX

## THE PROBLEM:

**All charts are calling `setUsingFallback(true/false)` INSIDE `useMemo`!**

This is a React anti-pattern and causes the fallback data to not render properly.

### Why This is Wrong:
```typescript
const chartData = useMemo(() => {
  if (!sessionData) {
    setUsingFallback(true); // ❌ WRONG! Can't call setState in useMemo
    return fallbackData;
  }
  setUsingFallback(false); // ❌ WRONG!
  return realData;
}, [sessionData]);
```

### The Correct Way:
```typescript
const chartData = useMemo(() => {
  if (!sessionData) {
    return fallbackData; // ✅ Just return the data
  }
  return realData;
}, [sessionData]);

// ✅ Compute usingFallback OUTSIDE useMemo
const usingFallback = !sessionData || !sessionData.telemetry;
```

## THE FIX:

For EVERY chart in `TechnicalCharts.tsx`:

1. Remove ALL `setUsingFallback()` calls from inside `useMemo`
2. Remove `const [usingFallback, setUsingFallback] = useState(false);`
3. Add `const usingFallback = !sessionData || !sessionData.telemetry;` AFTER the `useMemo`

## CHARTS TO FIX:

1. SpeedVsDistanceChart - ✅ FIXED
2. ThrottleBrakeSteeringChart - ❌ NEEDS FIX
3. GForceChart - ❌ NEEDS FIX
4. DeltaTimeChart - ❌ NEEDS FIX
5. TyreTemperatureChart - ❌ NEEDS FIX
6. BrakeTemperatureChart - ❌ NEEDS FIX
7. CornerAnalysisChart - ❌ NEEDS FIX
8. TimeLossHeatmap - ❌ NEEDS FIX
9. SectorComparisonChart - ❌ NEEDS FIX

## VEHICLE TELEMETRY:

The vehicle telemetry is showing 0 because `currentTelemetry` is `null` when there's no `lapData`, but the fallback logic should handle this. The animation IS running, but the values might not be updating properly.

The issue is that when `lapData` is empty, `currentTelemetry` returns `null`, which triggers the fallback. But the `currentPoint` might not be incrementing properly.

## SOLUTION:

I need to systematically fix all charts by:
1. Removing `useState` for `usingFallback`
2. Computing `usingFallback` as a simple boolean after `useMemo`
3. Ensuring fallback data is always returned when conditions are met

This will make the charts actually render the fallback data instead of showing empty axes.
