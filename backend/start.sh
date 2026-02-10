#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma db push --accept-data-loss --skip-generate

echo "Starting application..."
node dist/main
