import json
import pandas as pd
import numpy as np
from scipy.spatial import KDTree
import sys
import os

def load_centerline(path):
    with open(path, 'r') as f:
        data = json.load(f)
    return data['points']

def map_telemetry(telemetry_path, centerline_path, output_path):
    # Load centerline
    centerline_points = load_centerline(centerline_path)
    cl_df = pd.DataFrame(centerline_points)
    
    # Identify columns to load
    # We need distance, lap, and telemetry values
    # Read header first
    header = pd.read_csv(telemetry_path, nrows=0).columns.tolist()
    
    # Check format
    is_long_format = 'telemetry_name' in header and 'telemetry_value' in header
    
    if is_long_format:
        print("Detected long format CSV. Processing...")
        # We need to pivot.
        # Columns: lap, telemetry_name, telemetry_value, timestamp, vehicle_number
        # We need to group by timestamp (and vehicle/lap) and pivot name/value.
        
        # Load only necessary columns
        cols = ['lap', 'telemetry_name', 'telemetry_value', 'timestamp', 'vehicle_number']
        df = pd.read_csv(telemetry_path, usecols=lambda c: c in cols)
        
        # Filter for relevant signals
        relevant_signals = [
            'speed', 'aps', 'pbrake_f', 'pbrake_r', 'Steering_Angle', 'gear', 'nmot', 
            'accx_can', 'accy_can', 'VBOX_Lat_Min', 'VBOX_Long_Minutes', 'Laptrigger_lapdist_dls'
        ]
        df = df[df['telemetry_name'].isin(relevant_signals)]
        
        # Pivot
        # Index: timestamp, lap, vehicle_number
        # Columns: telemetry_name
        # Values: telemetry_value
        
        print("Pivoting data (this may take a while)...")
        df_pivot = df.pivot_table(
            index=['timestamp', 'lap', 'vehicle_number'], 
            columns='telemetry_name', 
            values='telemetry_value',
            aggfunc='first' # Should be unique per timestamp
        ).reset_index()
        
        # Rename columns to match expected format
        df = df_pivot.rename(columns={
            'Laptrigger_lapdist_dls': 'Distance',
            'lap': 'Lap',
            'vehicle_number': 'VehicleNumber'
        })
        
        print(f"Pivoted to {len(df)} rows.")
        
    else:
        # Wide format
        dist_col = 'Distance'
        if 'Laptrigger_lapdist_dls' in header:
            dist_col = 'Laptrigger_lapdist_dls'
        elif 'Distance' not in header:
            print(f"No distance column found in {header}")
            return

        lap_col = 'lap' if 'lap' in header else 'Lap'
        if lap_col not in header:
            print("No lap column found")
            return
            
        print(f"Loading telemetry from {telemetry_path}...")
        df = pd.read_csv(telemetry_path, usecols=lambda c: c in [dist_col, lap_col] or c in header)
        df = df.rename(columns={dist_col: 'Distance', lap_col: 'Lap'})
    
    # Filter numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    numeric_cols = [c for c in numeric_cols if c not in ['Distance', 'Lap', 'VehicleNumber']]
    
    mapped_data = []
    
    # Group by Vehicle and Lap
    vehicles = df['VehicleNumber'].unique() if 'VehicleNumber' in df.columns else [0]
    
    for vehicle in vehicles:
        v_df = df[df['VehicleNumber'] == vehicle] if 'VehicleNumber' in df.columns else df
        
        laps = v_df['Lap'].unique()
        print(f"Processing Vehicle {vehicle}, Laps: {laps}")
        
        for lap in laps:
            if lap <= 0: continue
            
            lap_df = v_df[v_df['Lap'] == lap]
            
            if len(lap_df) < 100: continue
            
            # Sort by distance
            lap_df = lap_df.sort_values('Distance')
            
            # Remove duplicates
            lap_df = lap_df.drop_duplicates('Distance')
            
            # Interpolate
            new_data = {}
            cl_dists = cl_df['dist']
            
            for col in numeric_cols:
                if col not in lap_df.columns: continue
                new_data[col] = np.interp(cl_dists, lap_df['Distance'], lap_df[col], left=np.nan, right=np.nan)
            
            new_df = pd.DataFrame(new_data)
            new_df['Lap'] = lap
            new_df['Distance'] = cl_dists
            new_df['VehicleNumber'] = vehicle
            
            # Add centerline coords
            new_df['x'] = cl_df['x']
            new_df['z'] = cl_df['z']
            
            mapped_data.append(new_df)
        
    if mapped_data:
        final_df = pd.concat(mapped_data)
        final_df.to_csv(output_path, index=False)
        print(f"Mapped telemetry saved to {output_path}")
    else:
        print("Could not map telemetry (no valid laps)")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python map_telemetry_to_track.py <telemetry_csv> <centerline_json> <output_csv>")
    else:
        map_telemetry(sys.argv[1], sys.argv[2], sys.argv[3])
