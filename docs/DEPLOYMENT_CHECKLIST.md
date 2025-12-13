# Fly.io Deployment Checklist

Use this checklist to ensure a smooth deployment to Fly.io.

## Pre-Deployment

- [ ] Fly.io CLI installed (`flyctl version`)
- [ ] Logged into Fly.io (`flyctl auth login`)
- [ ] App name chosen (must be globally unique)
- [ ] Region selected (default: `sjc` - San Jose, US West)
- [ ] Database type decided (SQLite for single instance, PostgreSQL for multi-instance)

## Configuration

- [ ] `fly.toml` configured with correct app name
- [ ] `Dockerfile` uses `requirements-prod.txt`
- [ ] `.dockerignore` excludes test files and unnecessary files
- [ ] Health check endpoint (`/health`) working

## Secrets & Environment Variables

- [ ] `SECRET_KEY` generated (32+ character random string)
- [ ] `JWT_SECRET_KEY` generated (32+ character random string)
- [ ] `DATABASE_URL` set only if using PostgreSQL (otherwise SQLite is used)
- [ ] `CORS_ORIGINS` configured (optional, defaults to `*`)

## Database

- [ ] Database type chosen (SQLite for single instance, PostgreSQL for multi-instance)
- [ ] If using PostgreSQL: database created or connection string ready
- [ ] If using PostgreSQL: database attached to app (if using Fly.io PostgreSQL)
- [ ] Database initialization script ready (`init-db.sh`)

## Deployment

- [ ] Code committed to git
- [ ] All tests passing locally
- [ ] `requirements-prod.txt` includes all necessary dependencies
- [ ] Deployment script tested (`deploy-fly.sh`)

## Post-Deployment

- [ ] App status verified (`flyctl status`)
- [ ] Health endpoint responding (`curl https://app.fly.dev/health`)
- [ ] Database initialized (`./init-db.sh`)
- [ ] Logs checked for errors (`flyctl logs`)
- [ ] API endpoints tested
- [ ] Mobile app API URL updated

## Monitoring

- [ ] Fly.io dashboard access configured
- [ ] Log monitoring set up
- [ ] Error alerts configured (optional)
- [ ] Database backup plan in place

## Security

- [ ] Strong secrets generated (not using defaults)
- [ ] CORS origins restricted (if needed)
- [ ] Database credentials secure
- [ ] No sensitive data in code or logs

## Documentation

- [ ] API URL documented
- [ ] Team members have access
- [ ] Deployment process documented
- [ ] Rollback procedure known

---

## Quick Commands Reference

```bash
# Deploy
cd backend && ./deploy-fly.sh

# Or manually
flyctl deploy --app fittrack-api

# Initialize database
./init-db.sh fittrack-api

# Check status
flyctl status --app fittrack-api

# View logs
flyctl logs --app fittrack-api

# SSH into container
flyctl ssh console --app fittrack-api

# Restart
flyctl apps restart fittrack-api
```

---

**Ready to deploy?** Run `./deploy-fly.sh` from the `backend/` directory!

