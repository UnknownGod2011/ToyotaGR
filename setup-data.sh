#!/bin/bash
# Setup script to copy Race_Data to public folder
# This is required for the development server to serve the CSV files

echo "Setting up Race Data..."

# Check if Race_Data exists
if [ ! -d "Race_Data" ]; then
    echo "ERROR: Race_Data folder not found in project root!"
    exit 1
fi

# Create public folder if it doesn't exist
mkdir -p public

# Remove existing Race_Data in public if it exists
if [ -d "public/Race_Data" ]; then
    echo "Removing old Race_Data from public folder..."
    rm -rf public/Race_Data
fi

# Copy Race_Data to public
echo "Copying Race_Data to public folder..."
cp -r Race_Data public/Race_Data

echo "✓ Race Data setup complete!"
echo "You can now run 'npm run dev' to start the development server."
