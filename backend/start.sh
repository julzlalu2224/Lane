#!/bin/sh
set -e

echo "🚀 Starting Lane Backend..."

# Prisma client is already generated in Docker build
# NO migrations run in production - they happen locally only

echo "✅ Starting NestJS application..."
exec node dist/main
