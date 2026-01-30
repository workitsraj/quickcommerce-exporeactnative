#!/bin/bash

# QuickCommerce Setup Script
# This script helps set up the development environment

set -e

echo "🚀 QuickCommerce Setup Script"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js v18 or higher from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

# Ask user what to setup
echo ""
echo "What would you like to setup?"
echo "1) Backend only"
echo "2) Mobile app only"
echo "3) Both (recommended)"
read -p "Enter your choice (1-3): " choice

setup_backend() {
    echo ""
    echo "📦 Setting up Backend..."
    echo "----------------------"
    
    cd backend
    
    # Install dependencies
    echo "Installing backend dependencies..."
    npm install
    
    # Setup environment file
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
    else
        echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}✓ Backend setup complete${NC}"
}

setup_mobile() {
    echo ""
    echo "📱 Setting up Mobile App..."
    echo "-------------------------"
    
    cd mobile
    
    # Install dependencies
    echo "Installing mobile dependencies..."
    npm install
    
    cd ..
    echo -e "${GREEN}✓ Mobile app setup complete${NC}"
}

case $choice in
    1)
        setup_backend
        ;;
    2)
        setup_mobile
        ;;
    3)
        setup_backend
        setup_mobile
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "=============================="
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo "=============================="
echo ""
echo "Next steps:"
echo ""

if [ "$choice" = "1" ] || [ "$choice" = "3" ]; then
    echo "📦 Backend:"
    echo "  1. Edit backend/.env with your configuration"
    echo "  2. Ensure MongoDB is running"
    echo "  3. Run: cd backend && npm run dev"
    echo ""
fi

if [ "$choice" = "2" ] || [ "$choice" = "3" ]; then
    echo "📱 Mobile:"
    echo "  1. Update API_BASE_URL in mobile/src/constants/index.js"
    echo "  2. Run: cd mobile && npm start"
    echo ""
fi

echo "📚 Documentation:"
echo "  - README.md - Project overview"
echo "  - backend/README.md - Backend API docs"
echo "  - mobile/README.md - Mobile app docs"
echo "  - API_TESTING.md - API testing guide"
echo "  - DEPLOYMENT.md - Deployment guide"
echo ""
echo "Happy coding! 🎉"
