# Pre-merge quality gate script for Windows
# Run this before merging development into main

Write-Host "🚀 Running Pre-Merge Quality Gate..." -ForegroundColor Cyan

# Check if we're on the right branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "⚠️  Warning: You're not on main branch (currently on: $currentBranch)" -ForegroundColor Yellow
    Write-Host "This script should be run on main branch before merging."
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -notmatch "^[Yy]$") {
        exit 1
    }
}

Write-Host "📋 Step 1: Type checking..." -ForegroundColor Blue
try {
    npm run type-check
    if ($LASTEXITCODE -ne 0) { throw "Type check failed" }
    Write-Host "✅ Type check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 2: Linting..." -ForegroundColor Blue
try {
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Linting failed" }
    Write-Host "✅ Linting passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Linting failed" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 3: Running tests..." -ForegroundColor Blue
try {
    npm run test:ci
    if ($LASTEXITCODE -ne 0) { throw "Tests failed" }
    Write-Host "✅ Tests passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Tests failed" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 4: Mutation testing..." -ForegroundColor Blue
try {
    npm run mutation:ci
    if ($LASTEXITCODE -ne 0) { throw "Mutation testing failed" }
    Write-Host "✅ Mutation testing passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Mutation testing failed" -ForegroundColor Red
    Write-Host "💡 Check the mutation report for details" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 All quality gates passed! Safe to merge to main." -ForegroundColor Green
Write-Host "💡 Remember to run 'git push origin main' after merging" -ForegroundColor Yellow
