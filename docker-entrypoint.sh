#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h ${POSTGRES_HOST:-postgres} -U ${POSTGRES_USER:-postgres}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - executing command"
exec "$@"
