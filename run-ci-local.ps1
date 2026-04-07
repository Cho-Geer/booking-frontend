# Windows PowerShell script to run frontend CI locally using Docker containers
# This script simulates the GitHub Actions frontend-ci.yml workflow

Write-Host "=== Frontend CI Local Simulation ===" -ForegroundColor Cyan
Write-Host "Starting PostgreSQL and Redis containers..." -ForegroundColor Yellow

# Start infrastructure services
docker-compose -f docker-compose.yml up -d postgres redis

# Wait for services to be healthy
Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
$servicesReady = $false

while ($retryCount -lt $maxRetries -and -not $servicesReady) {
    $postgresHealth = docker-compose -f docker-compose.yml ps --filter "health=healthy" --services | Select-String "postgres"
    $redisHealth = docker-compose -f docker-compose.yml ps --filter "health=healthy" --services | Select-String "redis"
    
    if ($postgresHealth -and $redisHealth) {
        $servicesReady = $true
        Write-Host "✓ All services are healthy" -ForegroundColor Green
    } else {
        $retryCount++
        Write-Host "Waiting for services... ($retryCount/$maxRetries)"
        Start-Sleep -Seconds 2
    }
}

if (-not $servicesReady) {
    Write-Host "✗ Services failed to start within timeout" -ForegroundColor Red
    docker-compose -f docker-compose.yml logs
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "`n=== Running Quality Gate ===" -ForegroundColor Cyan

# Quality Gate - Frontend checks
Write-Host "1. Installing frontend dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend dependency installation failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "2. Running linting..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Linting failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "3. Running type checking..." -ForegroundColor Yellow
npm run check
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Type checking failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "4. Running unit tests..." -ForegroundColor Yellow
npm run test -- --runInBand
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Unit tests failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "5. Building frontend..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "✓ Quality Gate passed" -ForegroundColor Green

Write-Host "`n=== Running E2E Gate ===" -ForegroundColor Cyan

# E2E Gate - Backend setup and E2E tests
Write-Host "1. Setting up backend..." -ForegroundColor Yellow

# Run backend setup in Docker container
Write-Host "   Installing backend dependencies..." -ForegroundColor Gray
docker-compose -f docker-compose.yml run --rm ci-runner /bin/sh -c "cd /backend && npm ci --include=dev"
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend dependency installation failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "   Running Prisma generate..." -ForegroundColor Gray
docker-compose -f docker-compose.yml run --rm ci-runner /bin/sh -c "cd /backend && npm run prisma:generate"
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Prisma generate failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "   Running Prisma migrate deploy..." -ForegroundColor Gray
docker-compose -f docker-compose.yml run --rm ci-runner /bin/sh -c "cd /backend && npm run prisma:deploy"
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Prisma migrate failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "   Running Prisma seed..." -ForegroundColor Gray
docker-compose -f docker-compose.yml run --rm ci-runner /bin/sh -c "cd /backend && npm run prisma:seed"
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Prisma seed failed" -ForegroundColor Red
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "2. Starting backend server..." -ForegroundColor Yellow
# Start backend server in background using Docker
$backendJob = Start-Job -ScriptBlock {
    docker-compose -f docker-compose.yml run --rm -p 3001:3001 ci-runner /bin/sh -c "cd /backend && npm run start:dev"
}

# Wait for backend to be ready
Write-Host "   Waiting for backend to start..." -ForegroundColor Gray
$backendReady = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/v1/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "   ✓ Backend is up!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "   Waiting for backend... ($i/30)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "✗ Backend failed to start" -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "3. Starting frontend server..." -ForegroundColor Yellow
# Start frontend server in background
$frontendJob = Start-Job -ScriptBlock {
    $env:NEXT_PUBLIC_API_URL = "http://localhost:3001/v1"
    npm run start -- --hostname 127.0.0.1 --port 3000
}

# Wait for frontend to be ready
Write-Host "   Waiting for frontend to start..." -ForegroundColor Gray
$frontendReady = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000/login" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "   ✓ Frontend is up!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "   Waiting for frontend... ($i/30)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $frontendReady) {
    Write-Host "✗ Frontend failed to start" -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    docker-compose -f docker-compose.yml down
    exit 1
}

Write-Host "4. Running E2E tests..." -ForegroundColor Yellow
$env:E2E_BASE_URL = "http://127.0.0.1:3000"
$env:NEXT_PUBLIC_API_URL = "http://localhost:3001/v1"
$env:CI = "true"

npm run test:e2e
$e2eExitCode = $LASTEXITCODE

# Cleanup
Write-Host "`n=== Cleaning up ===" -ForegroundColor Cyan
Stop-Job $backendJob -ErrorAction SilentlyContinue
Stop-Job $frontendJob -ErrorAction SilentlyContinue
docker-compose -f docker-compose.yml down

if ($e2eExitCode -eq 0) {
    Write-Host "`n=== CI Simulation Complete ===" -ForegroundColor Green
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n=== CI Simulation Failed ===" -ForegroundColor Red
    Write-Host "✗ E2E tests failed with exit code $e2eExitCode" -ForegroundColor Red
    exit $e2eExitCode
}