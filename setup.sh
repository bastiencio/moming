#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Moming Admin - Local Development Setup${NC}"
echo "=========================================="

# Check Node.js version
echo -e "\n${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

# Check npm
echo -e "\n${YELLOW}Checking npm installation...${NC}"
npm --version > /dev/null 2>&1 || { echo -e "${RED}npm is not installed${NC}"; exit 1; }
echo -e "${GREEN}✓ npm $(npm --version) installed${NC}"

# Create .env if it doesn't exist
echo -e "\n${YELLOW}Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        echo -e "${YELLOW}  ⚠ Please update .env with your Supabase credentials${NC}"
    else
        echo -e "${RED}.env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run linter
echo -e "\n${YELLOW}Running linter...${NC}"
npm run lint || echo -e "${YELLOW}Some lint warnings found (non-fatal)${NC}"
echo -e "${GREEN}✓ Linter check complete${NC}"

# Build check
echo -e "\n${YELLOW}Building production assets...${NC}"
npm run build
echo -e "${GREEN}✓ Production build successful${NC}"

echo -e "\n${GREEN}=========================================="
echo "Setup complete! 🎉"
echo ""
echo "Next steps:"
echo "  1. Update .env with your Supabase credentials"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Open http://localhost:8080 in your browser"
echo ""
echo "For deployment, see DEPLOYMENT.md"
echo -e "==========================================${NC}"
