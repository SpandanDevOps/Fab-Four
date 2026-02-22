#!/bin/bash

# JAAGRUK - YOUR VOICE
# Quick Start Setup & Verification Script
# This script helps you set up and verify the JAAGRUK platform is ready to run

set -e

echo "=========================================="
echo "🗣️  JAAGRUK - YOUR VOICE"
echo "Quick Start Setup & Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check Node.js version
echo ""
echo "📦 Checking Prerequisites..."
echo "────────────────────────────"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js installed: $NODE_VERSION"
else
    error "Node.js not found! Please install Node.js 18+"
    echo "Download from: https://nodejs.org/en/download/"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    success "npm installed: $NPM_VERSION"
else
    error "npm not found! Please install npm"
    exit 1
fi

# Check if in correct directory
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/package.json" ]; then
    error "Please run this script from the JYV root directory"
    error "Current directory: $(pwd)"
    exit 1
fi

success "Running from correct directory: $(pwd)"

echo ""
echo "🚀 Setting up Frontend..."
echo "────────────────────────────"

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    info "Installing frontend dependencies..."
    npm install
    success "Frontend dependencies installed"
else
    success "Frontend dependencies already installed"
fi

# Check .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        info "Creating .env from .env.example..."
        cp .env.example .env
        success ".env created"
        
        warning "⚠️  IMPORTANT: Edit .env and add your GEMINI_API_KEY"
        warning "Get it from: https://ai.google.dev/"
    fi
else
    success ".env file exists"
    
    # Check if Gemini API key is configured
    if grep -q "your_gemini_api_key_here" .env; then
        warning "⚠️  Gemini API key not configured in .env"
        warning "Get it from: https://ai.google.dev/"
    else
        success "Gemini API key appears to be configured"
    fi
fi

# Check API URL
if grep -q "VITE_API_URL=http://localhost:4000/api" .env; then
    success "API URL configured correctly"
else
    warning "API URL might need adjustment in .env"
fi

echo ""
echo "📋 Frontend Configuration:"
echo "────────────────────────────"
echo "Environment files:"
ls -la .env* | grep -E "\.env|\.env\.example"

echo ""
echo "🔧 Backend Status (Optional)..."
echo "────────────────────────────"

cd ../backend

if [ ! -d "node_modules" ]; then
    warning "Backend dependencies not installed"
    echo ""
    echo "To setup backend (optional):"
    echo "  cd backend"
    echo "  npm install"
    echo "  cp .env.example .env"
    echo "  npm run dev"
else
    success "Backend dependencies installed"
fi

cd ..

echo ""
echo "✨ Setup Summary"
echo "════════════════════════════════════════════════"
echo ""
echo "Frontend location: $(pwd)/frontend"
echo "Backend location:  $(pwd)/backend"
echo ""

echo "📝 Next Steps:"
echo "─────────────"
echo ""
echo "1️⃣  Configure Gemini API Key:"
echo "   → Edit: frontend/.env"
echo "   → Get key: https://ai.google.dev/"
echo "   → Add: VITE_GEMINI_API_KEY=your_key_here"
echo ""

echo "2️⃣  Start Frontend (Recommended):"
echo "   → cd frontend"
echo "   → npm run dev"
echo "   → Opens: http://localhost:3000"
echo ""

echo "3️⃣  Start Backend (Optional, for full features):"
echo "   → cd backend"
echo "   → npm install  (if not already done)"
echo "   → npm run dev"
echo "   → Runs on: http://localhost:4000"
echo ""

echo "4️⃣  Test the Platform:"
echo "   → Click 'Report an Issue'"
echo "   → Choose Named or Anonymous"
echo "   → Describe incident naturally"
echo "   → Select location"
echo "   → Add photo/video"
echo "   → Review & Submit"
echo "   → Get blockchain confirmation!"
echo ""

echo "📚 Documentation:"
echo "─────────────────"
echo "   • Main README:        README.md"
echo "   • Frontend Guide:     FRONTEND_SETUP.md"
echo "   • Troubleshooting:    See README.md #🛟-troubleshooting"
echo ""

echo "🎯 Useful Commands:"
echo "──────────────────"
echo "Frontend:"
echo "  npm run dev      - Start development server (HMR enabled)"
echo "  npm run build    - Production build"
echo "  npm run preview  - Preview production build"
echo "  npm run lint     - TypeScript type check"
echo ""
echo "Backend:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build TypeScript"
echo "  npm start        - Start production server"
echo ""

echo "🛠️  Troubleshooting:"
echo "───────────────────"
echo "Port already in use?"
echo "  npm run dev -- --port 3001"
echo ""
echo "Clear cache:"
echo "  rm -rf frontend/node_modules"
echo "  npm install"
echo ""
echo "Verify API connection:"
echo "  curl http://localhost:4000/api/health"
echo ""

echo "════════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "════════════════════════════════════════════════"
echo ""
echo "🚀 Ready to start? Run:"
echo "   cd frontend && npm run dev"
echo ""
echo "Questions? Check README.md or FRONTEND_SETUP.md"
echo ""
echo "Built with ❤️  for India — JAAGRUK - Your Voice"
echo "════════════════════════════════════════════════"
