#!/bin/bash

# Initialize database schema and seed data on Fly.io
# Usage: ./init-db.sh [app-name]

set -e

APP_NAME=${1:-fittrack-api}

echo "🗄️  Initializing database for $APP_NAME"
echo ""

# Check if app exists
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo "❌ Error: App '$APP_NAME' not found!"
    exit 1
fi

echo "📋 Creating database tables..."
flyctl ssh console --app "$APP_NAME" -C "python -c 'from app import app, db; app.app_context().push(); db.create_all(); print(\"✅ Tables created\")'"

echo ""
echo "🌱 Seeding database with sample data..."
flyctl ssh console --app "$APP_NAME" -C "python seed_data.py"

echo ""
echo "✅ Database initialized successfully!"
echo ""
echo "You can now use the API at: https://$APP_NAME.fly.dev"
echo ""

