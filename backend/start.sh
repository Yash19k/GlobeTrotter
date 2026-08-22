#!/usr/bin/env bash
# GlobeTrotter — Render Backend Startup Script
# Automatically applies migrations, seeds catalog destinations, and starts Gunicorn.

set -e

echo "==> Applying database migrations..."
python manage.py migrate --noinput

echo "==> Seeding initial destination and activity catalog (idempotent)..."
python manage.py seed_data

echo "==> Starting Gunicorn WSGI server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --threads 4
