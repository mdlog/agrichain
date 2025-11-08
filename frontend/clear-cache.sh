#!/bin/bash

# Clear Next.js Cache Script
# Run this when you experience caching issues

echo "🧹 Clearing Next.js cache..."

# Stop any running dev server
echo "Stopping dev server..."
pkill -f "next dev" 2>/dev/null || true

# Remove .next directory
echo "Removing .next directory..."
rm -rf .next

# Remove node_modules/.cache
echo "Removing node_modules cache..."
rm -rf node_modules/.cache

# Clear npm cache (optional)
# echo "Clearing npm cache..."
# npm cache clean --force

echo "✅ Cache cleared!"
echo ""
echo "Now run: npm run dev"
