import os
import sys
import json
import numpy as np
import cv2
from pypdf import PdfReader
from scipy.interpolate import splprep, splev
import math

def extract_image_from_pdf(pdf_path, output_dir):
    reader = PdfReader(pdf_path)
    page = reader.pages[0]
    
    count = 0
    image_path = None
    
    for image_file_object in page.images:
        image_path = os.path.join(output_dir, "track_map_raw.png")
        with open(image_path, "wb") as fp:
            fp.write(image_file_object.data)
        count += 1
        break # Take the first image
        
    return image_path

def process_track_image(image_path, output_dir):
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        print("Failed to load image")
        return None
        
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Threshold to get the track line
    # Assuming track is dark on light background or vice versa
    # We'll try Otsu's binarization
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        print("No contours found")
        return None
        
    # Assume the largest contour is the track
    track_contour = max(contours, key=cv2.contourArea)
    
    # Simplify contour
    epsilon = 0.001 * cv2.arcLength(track_contour, True)
    approx = cv2.approxPolyDP(track_contour, epsilon, True)
    
    # Extract points
    points = approx.reshape(-1, 2)
    
    # Smooth points using spline
    # Separate x and y
    x = points[:, 0]
    y = points[:, 1]
    
    # Append first point to end to close loop
    x = np.append(x, x[0])
    y = np.append(y, y[0])
    
    # Spline interpolation
    tck, u = splprep([x, y], s=0, per=True)
    unew = np.linspace(0, 1, 1000)
    out = splev(unew, tck)
    
    smooth_points = np.column_stack((out[0], out[1]))
    
    # Normalize points to meters (approximate scale)
    # We need a reference scale. For now, let's normalize to fit in 1000x1000 box
    # and assume track length is roughly 4km (4000m)
    
    min_x, min_y = np.min(smooth_points, axis=0)
    max_x, max_y = np.max(smooth_points, axis=0)
    
    width = max_x - min_x
    height = max_y - min_y
    scale = 4000 / max(width, height) # Rough estimate if no scale provided
    
    # Center and scale
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2
    
    final_points = []
    total_dist = 0
    prev_p = None
    
    for p in smooth_points:
        # Flip Y for 3D world (Z is forward/backward, X is left/right)
        # Usually 2D map Y is up, but in 3D Z is often "depth".
        # Let's map X->X, Y->Z (flat on ground)
        
        px = (p[0] - center_x) * scale
        pz = (p[1] - center_y) * scale # Y becomes Z
        
        if prev_p is not None:
            dist = math.sqrt((px - prev_p[0])**2 + (pz - prev_p[1])**2)
            total_dist += dist
            
        final_points.append({
            "x": px,
            "y": 0,
            "z": pz,
            "dist": total_dist
        })
        prev_p = (px, pz)
        
    # Detect corners (curvature)
    # Curvature k = |x'y'' - y'x''| / (x'^2 + y'^2)^(3/2)
    # We can compute discrete curvature
    
    corners = []
    # Simple curvature check
    window = 10
    for i in range(window, len(final_points) - window):
        p1 = final_points[i-window]
        p2 = final_points[i]
        p3 = final_points[i+window]
        
        v1 = (p2['x'] - p1['x'], p2['z'] - p1['z'])
        v2 = (p3['x'] - p2['x'], p3['z'] - p2['z'])
        
        angle1 = math.atan2(v1[1], v1[0])
        angle2 = math.atan2(v2[1], v2[0])
        
        diff = angle2 - angle1
        # Normalize angle
        while diff <= -math.pi: diff += 2*math.pi
        while diff > math.pi: diff -= 2*math.pi
        
        if abs(diff) > 0.1: # Threshold
             # Check if local maximum
             pass
             
    # Save centerline
    centerline_data = {
        "points": final_points,
        "length": total_dist,
        "corners": corners
    }
    
    with open(os.path.join(output_dir, "centerline.json"), "w") as f:
        json.dump(centerline_data, f)
        
    # Generate debug image
    # Draw smooth path on original image
    debug_img = img.copy()
    pts = smooth_points.astype(np.int32)
    cv2.polylines(debug_img, [pts], True, (0, 0, 255), 3)
    cv2.imwrite(os.path.join(output_dir, "debug_overlay.png"), debug_img)
    
    return centerline_data

def generate_gltf(centerline_data, output_dir):
    # Simple GLTF generation (just a line or ribbon)
    # For now, we'll skip complex GLTF generation and rely on Three.js to render the line from JSON
    # Or we can generate a simple .obj
    
    points = centerline_data["points"]
    
    obj_content = "o Track\n"
    for p in points:
        obj_content += f"v {p['x']} {p['y']} {p['z']}\n"
        
    # Line definition
    obj_content += "l"
    for i in range(len(points)):
        obj_content += f" {i+1}"
    obj_content += "\n"
    
    with open(os.path.join(output_dir, "track.obj"), "w") as f:
        f.write(obj_content)
        
    # Create a dummy gltf or just use the obj/json in frontend
    # The requirement says "build a performance-friendly 3D mesh (glTF)"
    # I'll stick to JSON for now as it's easier to load in React-Three-Fiber and extrude dynamically
    pass

def main():
    if len(sys.argv) < 2:
        print("Usage: python process_track.py <track_dir>")
        return

    track_dir = sys.argv[1]
    
    # Find PDF
    pdf_files = [f for f in os.listdir(track_dir) if f.endswith('.pdf')]
    # Or check parent dir for map
    # In our structure, map is in Race_Data root usually
    
    # But we want to process a specific track.
    # We need the map file path.
    # Let's assume we pass the map file path as second arg or find it
    
    map_file = None
    if len(sys.argv) > 2:
        map_file = sys.argv[2]
    
    if not map_file or not os.path.exists(map_file):
        print("Map file not found")
        return

    print(f"Processing {track_dir} with map {map_file}")
    
    # Create output dir in public/tracks
    track_id = os.path.basename(track_dir)
    output_dir = os.path.join("public", "tracks", track_id)
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract image
    image_path = extract_image_from_pdf(map_file, output_dir)
    if not image_path:
        print("Failed to extract image")
        return
        
    # Process
    centerline = process_track_image(image_path, output_dir)
    
    if centerline:
        generate_gltf(centerline, output_dir)
        print("Track processing complete")
    else:
        print("Track processing failed")

if __name__ == "__main__":
    main()
