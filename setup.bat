@echo off
REM OMI Backend API Automation Framework Setup Script for Windows
REM This script sets up the API automation framework

echo 🚀 Setting up OMI Backend API Automation Framework...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Install Playwright browsers
echo 🌐 Installing Playwright browsers...
npm run install:browsers

if %errorlevel% neq 0 (
    echo ❌ Failed to install Playwright browsers
    pause
    exit /b 1
)

echo ✅ Playwright browsers installed successfully

REM Create .env.local from .env template
if not exist .env.local (
    echo 📝 Creating .env.local from template...
    copy .env .env.local
    echo ✅ .env.local created. Please update it with your API endpoints and credentials.
) else (
    echo ✅ .env.local already exists
)

REM Run linting to check code quality
echo 🔍 Running code quality checks...
npm run lint

if %errorlevel% neq 0 (
    echo ⚠️  Linting issues found. Run 'npm run lint:fix' to fix them.
) else (
    echo ✅ Code quality checks passed
)

REM Run formatting check
echo 🎨 Checking code formatting...
npm run format:check

if %errorlevel% neq 0 (
    echo ⚠️  Formatting issues found. Run 'npm run format' to fix them.
) else (
    echo ✅ Code formatting is correct
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update .env.local with your API endpoints and credentials
echo 2. Run 'npm test' to execute all tests
echo 3. Run 'npm run test:report' to view test reports
echo 4. Check the README.md for detailed documentation
echo.
echo 🔧 Available commands:
echo   npm test              - Run all tests
echo   npm run test:auth     - Run authentication tests
echo   npm run test:users    - Run user management tests
echo   npm run test:healthcheck - Run health check tests
echo   npm run test:report   - View test reports
echo   npm run lint          - Check code quality
echo   npm run format        - Format code
echo.
echo 📚 For more information, see README.md
pause
