# Backend Restart Instructions

## Quick Restart (No Database Changes Needed)

If you just need to restart the backend without database changes:

```bash
# From project root directory
docker-compose restart backend

# Or stop and start
docker-compose stop backend
docker-compose start backend
```

## Full Restart with Database Recreation (After Schema Changes)

Since we made database schema changes (added `custom_exercise_name` and made `exercise_id` nullable), you need to recreate the database:

### Step 1: Stop the Backend

```bash
# From project root directory
docker-compose down
```

### Step 2: Remove the Database Volume (⚠️ This deletes all data)

```bash
# Remove the SQLite database volume
docker volume rm fittrack_sqlite_data

# Or remove all volumes if you want a clean slate
docker-compose down -v
```

**⚠️ Warning:** This will delete all existing workout data, user accounts, and other data. Only do this if you're okay losing data or are in development.

### Step 3: Restart the Backend

```bash
# Start the backend (it will recreate the database automatically)
docker-compose up -d
```

### Step 4: Verify It's Working

```bash
# Check if backend is running
curl http://localhost:5000/api/exercises

# View logs to see if database was created successfully
docker-compose logs -f backend
```

You should see messages about:
- Database tables being created
- Seed data being loaded
- Server starting on port 5000

## View Backend Logs

```bash
# Follow logs in real-time
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend
```

## Check Backend Status

```bash
# Check if containers are running
docker-compose ps

# Should show backend service as "Up"
```

## Troubleshooting

### Backend won't start

```bash
# Check for errors
docker-compose logs backend

# Rebuild the Docker image
docker-compose build --no-cache backend
docker-compose up -d
```

### Port 5000 already in use

```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process or change the port in docker-compose.yml
```

### Database not recreating

```bash
# Force remove all volumes and restart
docker-compose down -v
docker-compose up -d --force-recreate
```

