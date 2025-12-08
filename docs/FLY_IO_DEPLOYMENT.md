# FitTrack Backend - Fly.io Deployment Guide

This guide will walk you through deploying the FitTrack backend API to Fly.io.

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io
2. **Fly CLI**: Install the Fly.io command-line tool
3. **PostgreSQL Database**: Fly.io PostgreSQL (we'll set this up)

### Install Fly.io CLI

**macOS:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Or using Homebrew:**
```bash
brew install flyctl
```

**Linux/Windows:** See https://fly.io/docs/hands-on/install-flyctl/

Verify installation:
```bash
flyctl version
```

## Step 1: Login to Fly.io

```bash
flyctl auth login
```

This will open a browser window for authentication.

## Step 2: Database Setup

This deployment uses **SQLite** for the database. The database file will be stored in the `instance/` directory.

**Note:** SQLite works well for single-instance deployments. For production with multiple instances or high traffic, consider using PostgreSQL (see alternative setup below).

**Alternative: Using PostgreSQL**
If you prefer PostgreSQL for production:
```bash
flyctl postgres create --name fittrack-db --region iad --vm-size shared-cpu-1x --volume-size 10
flyctl postgres attach fittrack-db --app fittrack-api
```

## Step 3: Configure Your App

### Update fly.toml (if needed)

The `fly.toml` file is already configured in the `backend/` directory. You may want to change:

- **App name**: Change `app = "fittrack-api"` to your preferred name (must be unique globally)
- **Region**: Change `primary_region = "iad"` to your preferred region
  - `iad` = Washington, D.C. (US East)
  - `sjc` = San Jose (US West)
  - `lhr` = London (Europe)
  - See https://fly.io/docs/reference/regions/ for all regions

### Set Environment Variables

Navigate to the backend directory:
```bash
cd backend
```

Set required secrets:
```bash
# Generate secure random keys
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Set the secrets in Fly.io (replace `fittrack-api` with your app name):
```bash
flyctl secrets set SECRET_KEY="your-secret-key-here" --app fittrack-api
flyctl secrets set JWT_SECRET_KEY="your-jwt-secret-key-here" --app fittrack-api
```

### Attach Database to App

If you created a PostgreSQL database with Fly.io, attach it:
```bash
flyctl postgres attach fittrack-db --app fittrack-api
```

This automatically sets the `DATABASE_URL` environment variable.

**Manual Database URL Setup:**
If using an external database or need to set it manually:
```bash
flyctl secrets set DATABASE_URL="postgresql://user:password@host:port/database" --app fittrack-api
```

### Set CORS Origins (Optional)

If you want to restrict CORS to specific domains:
```bash
flyctl secrets set CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com" --app fittrack-api
```

If omitted, CORS allows all origins (`*`).

## Step 4: Deploy the Application

From the `backend/` directory:

```bash
flyctl deploy
```

This will:
1. Build the Docker image from the Dockerfile
2. Push it to Fly.io
3. Deploy and start your application

**First-time setup:**
On first deploy, Fly.io will ask you to create the app:
```bash
flyctl launch
```

Then follow the prompts and deploy:
```bash
flyctl deploy
```

## Step 5: Initialize the Database

After deployment, initialize the database schema and seed data:

```bash
# SSH into the running container
flyctl ssh console --app fittrack-api

# Inside the container, run:
python seed_data.py

# Exit the container
exit
```

**Alternative: Run remotely**
```bash
flyctl ssh console --app fittrack-api -C "python seed_data.py"
```

## Step 6: Verify Deployment

Check your app status:
```bash
flyctl status --app fittrack-api
```

View logs:
```bash
flyctl logs --app fittrack-api
```

Test the health endpoint:
```bash
curl https://fittrack-api.fly.dev/health
```

Test the API root:
```bash
curl https://fittrack-api.fly.dev/
```

## Step 7: Get Your App URL

```bash
flyctl info --app fittrack-api
```

Your app will be available at: `https://fittrack-api.fly.dev` (replace `fittrack-api` with your app name)

## Environment Variables Summary

The following environment variables are configured:

| Variable | Source | Description |
|----------|--------|-------------|
| `PORT` | Auto-set by Fly.io | Port the app listens on (8080) |
| `DATABASE_URL` | Optional | PostgreSQL connection string (if using PostgreSQL, otherwise SQLite is used) |
| `SECRET_KEY` | Manual (via secrets) | Flask session secret key |
| `JWT_SECRET_KEY` | Manual (via secrets) | JWT token signing key |
| `CORS_ORIGINS` | Optional (via secrets) | Allowed CORS origins (default: *) |
| `FLASK_ENV` | Auto-set in fly.toml | Set to "production" |

## Common Commands

### View Logs
```bash
flyctl logs --app fittrack-api
```

### SSH into Container
```bash
flyctl ssh console --app fittrack-api
```

### Scale Your App
```bash
# Scale to 2 instances
flyctl scale count 2 --app fittrack-api

# Scale memory
flyctl scale memory 512 --app fittrack-api
```

### Restart App
```bash
flyctl apps restart fittrack-api
```

### Open App in Browser
```bash
flyctl open --app fittrack-api
```

### Update Secrets
```bash
flyctl secrets set KEY="value" --app fittrack-api
```

### List Secrets
```bash
flyctl secrets list --app fittrack-api
```

### View App Info
```bash
flyctl info --app fittrack-api
```

## Database Management

### SQLite (Default)
The SQLite database is stored in `instance/fittrack.db` within the container.

**Access database:**
```bash
flyctl ssh console --app fittrack-api
# Inside container:
sqlite3 instance/fittrack.db
```

**Backup database:**
```bash
flyctl ssh console --app fittrack-api -C "cp instance/fittrack.db /tmp/fittrack-backup.db"
flyctl sftp shell --app fittrack-api
# Then download /tmp/fittrack-backup.db
```

### PostgreSQL (If using)
```bash
# Access database
flyctl postgres connect -a fittrack-db

# Create backup
flyctl postgres backup create -a fittrack-db

# View database info
flyctl postgres status -a fittrack-db
```

## Monitoring

### View Metrics
```bash
flyctl metrics --app fittrack-api
```

### View Status
```bash
flyctl status --app fittrack-api
```

## Troubleshooting

### App Won't Start
1. Check logs: `flyctl logs --app fittrack-api`
2. Verify secrets are set: `flyctl secrets list --app fittrack-api`
3. Check database connection: `flyctl postgres status -a fittrack-db`

### Database Connection Issues
1. **SQLite (Default):** Database is stored in `instance/fittrack.db`. If missing, run `./init-db.sh fittrack-api`
2. **PostgreSQL:** Verify DATABASE_URL is set: `flyctl secrets list --app fittrack-api`
3. **PostgreSQL:** Test connection: `flyctl postgres connect -a fittrack-db`

### Port Issues
- Fly.io uses port 8080 by default (configured in `fly.toml`)
- The Dockerfile listens on the PORT environment variable

### Build Failures
1. Check Dockerfile syntax
2. Verify requirements.txt is correct
3. View build logs: `flyctl logs --app fittrack-api`

## Updating Your Application

After making code changes:

```bash
cd backend
flyctl deploy
```

The app will be updated with zero-downtime deployment.

## Production Checklist

- [x] Removed dev login/user seeding
- [x] Set strong SECRET_KEY and JWT_SECRET_KEY
- [x] Database configured (SQLite or PostgreSQL)
- [x] Set up CORS origins (if needed)
- [x] Initialized database schema
- [x] Tested health endpoint
- [x] Verified API endpoints work
- [x] Configured monitoring/logging
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (auto-handled by Fly.io)
- [ ] Consider PostgreSQL for multi-instance deployments (if using SQLite)

## Custom Domain Setup (Optional)

1. Add your domain in Fly.io dashboard or via CLI
2. Configure DNS records as instructed
3. Fly.io automatically provisions SSL certificates

```bash
flyctl certs add yourdomain.com --app fittrack-api
```

## Cost Estimation

Fly.io offers a generous free tier:
- **Free Tier**: 3 shared-cpu-1x VMs with 256MB RAM each
- **SQLite**: No additional cost (included with app)
- **PostgreSQL**: Free tier includes 3GB storage (if using)
- **Bandwidth**: 160GB outbound data transfer per month

For production, consider:
- Upgrading VM size for better performance
- Adding more instances for redundancy (requires PostgreSQL, not SQLite)
- Using PostgreSQL for multi-instance deployments

**Note:** SQLite works well for single-instance deployments. If you need multiple instances or high availability, use PostgreSQL.

See https://fly.io/docs/about/pricing/ for details.

## Next Steps

1. **Update Mobile App**: Point your mobile app's API base URL to your Fly.io app URL
2. **Register First User**: Use the `/api/auth/register` endpoint to create your first instructor account
3. **Monitor Usage**: Set up alerts in Fly.io dashboard
4. **Set up Backups**: Configure automatic PostgreSQL backups

## Support

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io/
- FitTrack Issues: Open an issue in the repository

---

**Your API is now live at:** `https://fittrack-api.fly.dev`

Update your mobile app's API configuration to use this URL!

