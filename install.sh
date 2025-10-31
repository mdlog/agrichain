#!/bin/bash

# AgriChain Finance - Installation Script
# This script automates the setup process

set -e

echo "🌾 AgriChain Finance - Installation Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Setup backend environment
if [ ! -f .env ]; then
    echo "⚙️  Setting up backend environment..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your Hedera credentials${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Backend .env already exists${NC}"
    echo ""
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Setup frontend environment
if [ ! -f .env ]; then
    echo "⚙️  Setting up frontend environment..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit frontend/.env with contract address after deployment${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Frontend .env already exists${NC}"
    echo ""
fi

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Setup Hedera Account:"
echo "   - Visit: https://portal.hedera.com"
echo "   - Create testnet account"
echo "   - Claim testnet HBAR"
echo ""
echo "2. Configure Backend:"
echo "   - Edit .env with your Hedera credentials"
echo "   - OPERATOR_ID=0.0.xxxxx"
echo "   - OPERATOR_KEY=302e020100..."
echo ""
echo "3. Deploy Smart Contract:"
echo "   npm run compile"
echo "   npm run deploy:testnet"
echo ""
echo "4. Configure Frontend:"
echo "   - Edit frontend/.env with contract address"
echo "   - NEXT_PUBLIC_CONTRACT_ADDRESS=0x..."
echo ""
echo "5. Run Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "6. Open Browser:"
echo "   http://localhost:3000"
echo ""
echo "📚 Documentation: ./docs/"
echo "🚀 Quick Start: ./QUICKSTART.md"
echo "📖 Full Guide: ./README.md"
echo ""
echo "Need help? Check docs/SETUP.md or open an issue on GitHub"
echo ""
