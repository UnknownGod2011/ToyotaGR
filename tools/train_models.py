import pandas as pd
import numpy as np
import json
import sys
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib

def load_data(telemetry_path, centerline_path):
    print(f"Loading telemetry from {telemetry_path}...")
    df = pd.read_csv(telemetry_path)
    
    print(f"Loading centerline from {centerline_path}...")
    with open(centerline_path, 'r') as f:
        centerline = json.load(f)
    
    return df, centerline

def calculate_curvature(points):
    # Calculate curvature from x, z points
    # k = (x'z'' - z'x'') / (x'^2 + z'^2)^(3/2)
    coords = np.array([[p['x'], p['z']] for p in points])
    
    # First derivatives
    dx = np.gradient(coords[:, 0])
    dz = np.gradient(coords[:, 1])
    
    # Second derivatives
    ddx = np.gradient(dx)
    ddz = np.gradient(dz)
    
    # Curvature
    curvature = (dx * ddz - dz * ddx) / np.power(dx**2 + dz**2, 1.5)
    
    # Handle NaNs (e.g. straight line)
    curvature = np.nan_to_num(curvature)
    
    return curvature

def train_speed_model(df, centerline):
    print("Training speed model...")
    
    # Prepare features
    # We want to predict speed based on track characteristics (distance, curvature)
    # This creates an "ideal" or "average" speed profile for the car/driver combo.
    
    # Get curvature for centerline
    curvature = calculate_curvature(centerline['points'])
    
    # Map curvature to telemetry based on distance
    # Telemetry 'Distance' matches centerline 'dist' (mostly)
    # We can interpolate curvature to telemetry points
    
    cl_dists = np.array([p['dist'] for p in centerline['points']])
    
    # Interpolate curvature to telemetry rows
    df['curvature'] = np.interp(df['Distance'], cl_dists, curvature)
    
    # Drop NaNs
    df = df.dropna(subset=['speed', 'Distance', 'curvature'])
    
    # Features: Distance (as fraction of track?), Curvature, Previous Speed?
    # If we want a static profile, just Distance and Curvature.
    # But Distance is cyclic. Maybe sin/cos of distance?
    # Or just use Distance if we are overfitting to this specific track (which we are).
    
    X = df[['Distance', 'curvature']]
    y = df['speed']
    
    # Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, min_samples_leaf=5, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"Model R2 Score - Train: {train_score:.4f}, Test: {test_score:.4f}")
    
    return model

def save_model(model, output_path):
    print(f"Saving model to {output_path}...")
    joblib.dump(model, output_path)

def generate_ideal_lap(model, centerline, output_path):
    print("Generating ideal lap profile...")
    
    # Create a dataframe for centerline points
    cl_points = centerline['points']
    curvature = calculate_curvature(cl_points)
    dists = np.array([p['dist'] for p in cl_points])
    
    df_ideal = pd.DataFrame({
        'Distance': dists,
        'curvature': curvature
    })
    
    # Predict speed
    predicted_speed = model.predict(df_ideal[['Distance', 'curvature']])
    
    df_ideal['predicted_speed'] = predicted_speed
    
    # Save
    df_ideal.to_csv(output_path, index=False)
    print(f"Ideal lap saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python train_models.py <mapped_telemetry_csv> <centerline_json> <output_dir>")
        sys.exit(1)
        
    telemetry_path = sys.argv[1]
    centerline_path = sys.argv[2]
    output_dir = sys.argv[3]
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    df, centerline = load_data(telemetry_path, centerline_path)
    
    model = train_speed_model(df, centerline)
    
    save_model(model, os.path.join(output_dir, "speed_model.pkl"))
    
    generate_ideal_lap(model, centerline, os.path.join(output_dir, "ideal_lap.csv"))
