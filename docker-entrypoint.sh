#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - checking database..."

# Check if database is seeded
if psql -h postgres -U postgres -d chaarpaisa -c "SELECT COUNT(*) FROM users" > /dev/null 2>&1; then
  echo "Database already seeded"
else
  echo "Seeding database..."
  node scripts/seed.js || echo "Seeding failed or already done"
fi

echo "Starting Next.js application..."
exec "$@"
