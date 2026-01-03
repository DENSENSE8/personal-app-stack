# Setup script for local development
# Run this from PowerShell

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Personal App Stack - Local Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if we're on a mapped drive or UNC path
$currentPath = Get-Location
Write-Host "Current path: $currentPath" -ForegroundColor Yellow

if ($currentPath.Path -like "\\*") {
    Write-Host "`nWARNING: You're on a UNC path. NPM doesn't work well with UNC paths." -ForegroundColor Red
    Write-Host "Mapping to drive Z:...`n" -ForegroundColor Yellow
    
    # Map the drive
    $uncPath = "\\densense-1\personal_folder\Michael Garisek Portoflio"
    net use Z: $uncPath /persistent:yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully mapped to Z:" -ForegroundColor Green
        Set-Location "Z:\personal-app-stack"
        Write-Host "Changed directory to Z:\personal-app-stack`n" -ForegroundColor Green
    } else {
        Write-Host "Failed to map drive. Try manually with:" -ForegroundColor Red
        Write-Host "net use Z: `"$uncPath`" /persistent:yes" -ForegroundColor Yellow
        exit 1
    }
}

# Clean install
Write-Host "Step 1: Cleaning old installations..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "Removed node_modules" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "Removed package-lock.json" -ForegroundColor Green
}

# Install dependencies
Write-Host "`nStep 2: Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nFailed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed successfully!" -ForegroundColor Green

# Check for .env file
Write-Host "`nStep 3: Checking environment variables..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host ".env file found" -ForegroundColor Green
} else {
    Write-Host ".env file not found. Creating template..." -ForegroundColor Yellow
    @"
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Optional
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
BLOB_READ_WRITE_TOKEN=
AUTH_SECRET=
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env template created. Please update with your actual values." -ForegroundColor Yellow
}

Write-Host "`nStep 4: Setting up database..." -ForegroundColor Cyan
Write-Host "Running prisma db push..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nDatabase setup failed!" -ForegroundColor Red
    Write-Host "Make sure your DATABASE_URL in .env is correct." -ForegroundColor Yellow
    exit 1
}

Write-Host "Database setup complete!" -ForegroundColor Green

# Done
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env with your actual DATABASE_URL" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000`n" -ForegroundColor White

Write-Host "For Vercel deployment, see VERCEL_SETUP.md" -ForegroundColor Yellow

