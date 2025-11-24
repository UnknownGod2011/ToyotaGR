import os
import json
import re

RACE_DATA_DIR = "Race_Data"
OUTPUT_FILE = "public/database.json"

# Known mappings for abbreviations
NAME_MAPPINGS = {
    "circuit-of-the-americas": ["cota"],
    "virginia-international-raceway": ["vir"],
    "indianapolis": ["indy"],
}

def normalize(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())

def find_map_file(track_dir_name, map_files):
    normalized_track = normalize(track_dir_name)
    keywords = track_dir_name.split('-')
    
    best_file = None
    max_score = 0
    
    # Check specific mappings first
    if track_dir_name in NAME_MAPPINGS:
        for alias in NAME_MAPPINGS[track_dir_name]:
            for f in map_files:
                if alias in f.lower():
                    return f

    for f in map_files:
        normalized_f = normalize(f)
        score = 0
        
        # Exact containment of normalized name
        if normalized_track in normalized_f:
            score += 10
            
        # Keyword matching
        for kw in keywords:
            if len(kw) > 2 and kw.lower() in f.lower():
                score += 1
        
        if score > max_score:
            max_score = score
            best_file = f
            
    return best_file

def scan_database():
    database = {"tracks": []}
    
    if not os.path.exists(RACE_DATA_DIR):
        print(f"Error: {RACE_DATA_DIR} not found.")
        return

    items = os.listdir(RACE_DATA_DIR)
    track_dirs = [d for d in items if os.path.isdir(os.path.join(RACE_DATA_DIR, d)) and not d.startswith('.') and d != "__MACOSX"]
    map_files = [f for f in items if os.path.isfile(os.path.join(RACE_DATA_DIR, f)) and f.lower().endswith('.pdf')]
    
    print(f"Found {len(track_dirs)} track directories.")

    for track_dir in track_dirs:
        track_path = os.path.join(RACE_DATA_DIR, track_dir)
        track_name = track_dir.replace("-", " ").title()
        
        map_file = find_map_file(track_dir, map_files)
        
        track_info = {
            "id": track_dir,
            "name": track_name,
            "path": track_path.replace("\\", "/"),
            "map_file": map_file,
            "sessions": []
        }
        
        # Walk to find sessions
        sessions_map = {}
        
        for root, dirs, files in os.walk(track_path):
            if "__MACOSX" in root:
                continue
                
            # Filter valid files
            valid_files = [f for f in files if not f.startswith('.') and f.lower().endswith('.csv')]
            
            if valid_files:
                # Use the immediate parent folder as session name, or track name if root
                rel_path = os.path.relpath(root, track_path)
                if rel_path == ".":
                    session_name = "Default"
                else:
                    # Use the last part of the path
                    session_name = os.path.basename(root)
                    # If path is like COTA/Race 1, we might want "Race 1"
                    # But if it's just "barber", we want "barber"
                
                if session_name not in sessions_map:
                    sessions_map[session_name] = {"path": rel_path.replace("\\", "/"), "files": []}
                
                sessions_map[session_name]["files"].extend(valid_files)
        
        for session_name, files in sessions_map.items():
            track_info["sessions"].append({
                "id": normalize(session_name),
                "name": session_name.replace("_", " ").title(),
                "path": sessions_map[session_name]["path"],
                "files": sorted(sessions_map[session_name]["files"])
            })
            
        database["tracks"].append(track_info)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(database, f, indent=2)
    
    print(f"Database index written to {OUTPUT_FILE}")

if __name__ == "__main__":
    scan_database()
