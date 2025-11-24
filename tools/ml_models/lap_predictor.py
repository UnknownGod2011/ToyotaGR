# tools/ml_models/lap_predictor.py
"""Lap Time Predictor using Random Forest

This script generates dummy training data, trains a RandomForestRegressor model,
and saves a JSON file `predictions.json` with predicted lap times for a range of
lap numbers. In a real scenario, you would replace the dummy data generation
with actual telemetry features extracted from the dataset.
"""

import json
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

# Generate dummy training data
# Features: [lap_number, avg_speed, avg_throttle, tyre_degradation]
X = []
y = []  # lap time in seconds
for lap in range(1, 51):
    avg_speed = np.random.uniform(150, 200)  # km/h
    avg_throttle = np.random.uniform(50, 100)  # %
    tyre_deg = lap * 2.5  # simple linear degradation
    lap_time = 90 - (avg_speed - 150) * 0.05 + tyre_deg * 0.1 + (100 - avg_throttle) * 0.02
    X.append([lap, avg_speed, avg_throttle, tyre_deg])
    y.append(lap_time)

X = np.array(X)
y = np.array(y)

# Train-test split (not really used but kept for completeness)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save the model for future use (optional)
model_path = os.path.join(os.path.dirname(__file__), "lap_predictor_model.joblib")
joblib.dump(model, model_path)

# Generate predictions for next 20 laps
predictions = []
for lap in range(1, 21):
    # In practice, you would compute these features from real telemetry
    avg_speed = 180  # placeholder constant
    avg_throttle = 80
    tyre_deg = lap * 2.5
    features = np.array([[lap, avg_speed, avg_throttle, tyre_deg]])
    pred_time = model.predict(features)[0]
    predictions.append({
        "lap": lap,
        "predictedLapTime": round(float(pred_time), 2),
        "confidence": 0.9  # placeholder confidence
    })

# Write predictions to JSON file that the frontend can consume
output_path = os.path.join(os.path.dirname(__file__), "predictions.json")
with open(output_path, "w") as f:
    json.dump({"predictions": predictions}, f, indent=2)

print(f"Model trained and predictions saved to {output_path}")
