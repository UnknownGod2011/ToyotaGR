# Setup script to copy Race_Data to public folder
# This is required for the development server to serve the CSV files

Write-Host "Setting up Race Data..." -ForegroundColor Cyan

# Check if Race_Data exists
if (-Not (Test-Path "Race_Data")) {
    Write-Host "ERROR: Race_Data folder not found in project root!" -ForegroundColor Red
    exit 1
}

# Create public folder if it doesn't exist
if (-Not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
}

# Remove existing Race_Data in public if it exists
if (Test-Path "public/Race_Data") {
    Write-Host "Removing old Race_Data from public folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "public/Race_Data"
}

# Copy Race_Data to public
Write-Host "Copying Race_Data to public folder..." -ForegroundColor Cyan
Copy-Item -Recurse -Force "Race_Data" "public/Race_Data"

Write-Host "Race Data setup complete!" -ForegroundColor Green
Write-Host "You can now run npm run dev to start the development server." -ForegroundColor Cyan
