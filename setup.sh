#!/bin/bash

# OMI Backend API Automation Framework Setup Script
# This script sets up the API automation framework

echo "🚀 Setting up OMI Backend API Automation Framework..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npm run install:browsers

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers"
    exit 1
fi

echo "✅ Playwright browsers installed successfully"

# Create .env.local from .env template
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env .env.local
    echo "✅ .env.local created. Please update it with your API endpoints and credentials."
else
    echo "✅ .env.local already exists"
fi

# Run linting to check code quality
echo "🔍 Running code quality checks..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Linting issues found. Run 'npm run lint:fix' to fix them."
else
    echo "✅ Code quality checks passed"
fi

# Run formatting check
echo "🎨 Checking code formatting..."
npm run format:check

if [ $? -ne 0 ]; then
    echo "⚠️  Formatting issues found. Run 'npm run format' to fix them."
else
    echo "✅ Code formatting is correct"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your API endpoints and credentials"
echo "2. Run 'npm test' to execute all tests"
echo "3. Run 'npm run test:report' to view test reports"
echo "4. Check the README.md for detailed documentation"
echo ""
echo "🔧 Available commands:"
echo "  npm test              - Run all tests"
echo "  npm run test:auth     - Run authentication tests"
echo "  npm run test:users    - Run user management tests"
echo "  npm run test:healthcheck - Run health check tests"
echo "  npm run test:report   - View test reports"
echo "  npm run lint          - Check code quality"
echo "  npm run format        - Format code"
echo ""
echo "📚 For more information, see README.md"
