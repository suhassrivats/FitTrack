#!/bin/bash

# FitTrack Backend - Fly.io Deployment Script
# Usage: ./deploy-fly.sh

set -e

echo "🚀 Deploying FitTrack API to Fly.io"
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: Fly.io CLI (flyctl) not found!"
    echo ""
    echo "Install it:"
    echo "  macOS: brew install flyctl"
    echo "  Or: curl -L https://fly.io/install.sh | sh"
    echo ""
    exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "⚠️  Not logged in to Fly.io"
    echo "Logging in..."
    flyctl auth login
fi

echo "✅ Fly.io CLI ready"
echo ""

# Check if app exists
APP_NAME="fittrack-api"
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo "📱 App '$APP_NAME' not found. Creating..."
    flyctl apps create "$APP_NAME" || true
    echo ""
fi

# Check if secrets are set
echo "🔐 Checking secrets..."
SECRETS=$(flyctl secrets list --app "$APP_NAME" 2>/dev/null || echo "")

if ! echo "$SECRETS" | grep -q "SECRET_KEY"; then
    echo "⚠️  SECRET_KEY not set. Generating and setting..."
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    flyctl secrets set SECRET_KEY="$SECRET_KEY" --app "$APP_NAME"
    echo "✅ SECRET_KEY set"
fi

if ! echo "$SECRETS" | grep -q "JWT_SECRET_KEY"; then
    echo "⚠️  JWT_SECRET_KEY not set. Generating and setting..."
    JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    flyctl secrets set JWT_SECRET_KEY="$JWT_SECRET_KEY" --app "$APP_NAME"
    echo "✅ JWT_SECRET_KEY set"
fi

# Note: Using SQLite for database (no DATABASE_URL needed)
# SQLite database will be stored in the instance/ directory

echo ""
echo "📦 Building and deploying..."
flyctl deploy --app "$APP_NAME"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Initialize database: ./init-db.sh $APP_NAME"
echo "  2. Check status: flyctl status --app $APP_NAME"
echo "  3. View logs: flyctl logs --app $APP_NAME"
echo "  4. Open app: flyctl open --app $APP_NAME"
echo ""
echo "🌐 Your API URL: https://$APP_NAME.fly.dev"
echo ""
echo "💡 Note: Using SQLite database (stored in instance/ directory)"
echo "   For production with multiple instances, consider using PostgreSQL"
echo ""

