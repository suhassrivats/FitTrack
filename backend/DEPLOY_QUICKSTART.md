# Fly.io Quick Start Deployment Guide

This is a quick reference for deploying FitTrack to Fly.io. For detailed information, see [FLY_IO_DEPLOYMENT.md](../docs/FLY_IO_DEPLOYMENT.md).

## Prerequisites

1. **Install Fly.io CLI:**
   ```bash
   # macOS
   brew install flyctl
   
   # Or download from
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io:**
   ```bash
   flyctl auth login
   ```

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
cd backend
./deploy-fly.sh
```

The script will:
- Check if you're logged in
- Create the app if it doesn't exist
- Generate and set secrets if needed
- Deploy the application

### Option 2: Manual Steps

1. **Create App (if first time):**
   ```bash
   cd backend
   flyctl launch
   # Follow prompts, or use existing fly.toml
   ```

2. **Set Secrets:**
   ```bash
   # Generate secrets
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # Set them (replace with your generated values)
   flyctl secrets set SECRET_KEY="your-secret-key" --app fittrack-api
   flyctl secrets set JWT_SECRET_KEY="your-jwt-secret-key" --app fittrack-api
   ```

3. **Deploy:**
   ```bash
   flyctl deploy --app fittrack-api
   ```

4. **Initialize Database:**
   ```bash
   ./init-db.sh fittrack-api
   ```

**Note:** This deployment uses SQLite for the database. The database file will be stored in the `instance/` directory. For production with multiple instances or high traffic, consider using PostgreSQL.

## Verify Deployment

```bash
# Check status
flyctl status --app fittrack-api

# View logs
flyctl logs --app fittrack-api

# Test health endpoint
curl https://fittrack-api.fly.dev/health

# Open in browser
flyctl open --app fittrack-api
```

## Your API URL

Once deployed, your API will be available at:
```
https://fittrack-api.fly.dev
```

Update your mobile app's API configuration to use this URL!

## Common Commands

```bash
# View logs
flyctl logs --app fittrack-api

# SSH into container
flyctl ssh console --app fittrack-api

# Restart app
flyctl apps restart fittrack-api

# Scale app
flyctl scale count 2 --app fittrack-api
flyctl scale memory 512 --app fittrack-api

# View secrets
flyctl secrets list --app fittrack-api
```

## Troubleshooting

### App won't start
```bash
# Check logs
flyctl logs --app fittrack-api

# Verify secrets
flyctl secrets list --app fittrack-api

# Check database connection
flyctl postgres connect -a fittrack-db
```

### Database connection issues
- SQLite database is stored in `instance/fittrack.db`
- If database is missing, run: `./init-db.sh fittrack-api`
- For persistent storage across deployments, consider using a volume or PostgreSQL

### Build failures
- Check Dockerfile syntax
- Verify requirements-prod.txt is correct
- View build logs in Fly.io dashboard

## Next Steps

1. **Update Mobile App**: Point API base URL to `https://fittrack-api.fly.dev`
2. **Register First User**: Use `/api/auth/register` endpoint
3. **Monitor**: Set up alerts in Fly.io dashboard
4. **Backups**: Configure automatic PostgreSQL backups

## Need Help?

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io/
- Detailed Guide: [FLY_IO_DEPLOYMENT.md](../docs/FLY_IO_DEPLOYMENT.md)

