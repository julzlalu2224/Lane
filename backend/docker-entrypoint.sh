#!/bin/sh
set -e

echo "Initializing database schema..."
npx prisma db push --accept-data-loss --skip-generate

echo "Starting application..."
exec node dist/main
