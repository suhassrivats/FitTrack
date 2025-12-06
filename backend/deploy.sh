#!/bin/bash

# FitTrack Backend - AWS Lambda Deployment Script
# Usage: ./deploy.sh [dev|prod]

set -e

STAGE=${1:-prod}
ENV_FILE=".env.${STAGE}"

echo "🚀 Deploying FitTrack API to AWS Lambda (stage: ${STAGE})"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: Environment file ${ENV_FILE} not found!"
    echo ""
    echo "Please create ${ENV_FILE} with the following variables:"
    echo "  DATABASE_URL=postgresql://user:pass@host:5432/dbname"
    echo "  SECRET_KEY=your-secret-key"
    echo "  JWT_SECRET_KEY=your-jwt-secret-key"
    echo "  CORS_ORIGINS=* (or comma-separated list)"
    echo ""
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI not found!"
    echo "Install it: brew install awscli (macOS) or visit https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Error: Serverless Framework not found!"
    echo "Install it: npm install -g serverless"
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables from ${ENV_FILE}..."
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Check required variables
if [ -z "$DATABASE_URL" ] || [ -z "$SECRET_KEY" ] || [ -z "$JWT_SECRET_KEY" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Required: DATABASE_URL, SECRET_KEY, JWT_SECRET_KEY"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "📦 Packaging and deploying..."
serverless deploy --stage ${STAGE}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Check logs: serverless logs -f api --stage ${STAGE} --tail"
echo "  2. Test endpoint: curl \$(serverless info --stage ${STAGE} | grep ServiceEndpoint | awk '{print \$2}')/health"
echo ""


