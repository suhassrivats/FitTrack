# FitTrack - Fitness Tracking Mobile App

A comprehensive fitness tracking application with workout logging and class management features. Built with Flask REST API backend and React Native frontend for iOS and Android.

---

## Features

### Workout Management
- ✅ Track workouts with exercises, sets, reps, and weight
- ✅ Create custom workout routines
- ✅ View workout history and statistics
- ✅ Exercise library with detailed instructions and videos
- ✅ Timer for tracking workout duration
- ✅ Progress tracking and personal records

### Class Management
- ✅ Instructors can create and manage fitness classes
- ✅ Students can join classes with join codes
- ✅ Assign workouts with specific exercises and targets
- ✅ Students log actual performance (sets, reps, weight)
- ✅ Class leaderboards and completion tracking
- ✅ View student progress and statistics

### Profile & Analytics
- ✅ User profile with comprehensive workout statistics
- ✅ Track workout streaks and consistency
- ✅ Weekly workout analytics with charts
- ✅ Account settings and preferences
- ✅ Units selection (kg/lbs)

## Tech Stack

### Backend
- **Flask** - Python web framework
- **Flask-JWT-Extended** - JWT authentication
- **Flask-SQLAlchemy** - ORM for database
- **SQLite** - Database
- **Flask-CORS** - CORS support
- **bcrypt** - Password hashing

### Frontend
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **React Native Vector Icons** - Icon library

## Project Structure

```
├── backend/                  # Flask REST API
│   ├── models/              # Database models
│   │   ├── __init__.py     # Database initialization
│   │   ├── user.py         # User authentication and profiles
│   │   ├── workout.py      # Workouts, exercises, routines
│   │   └── classes.py      # Classes, memberships, assigned workouts
│   ├── routes/              # API endpoints
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── workouts.py     # Workout management
│   │   ├── exercises.py    # Exercise library
│   │   ├── profile.py      # User profiles
│   │   └── classes.py      # Class management
│   ├── app.py               # Flask application entry point
│   ├── seed_data.py         # Database seeding script
│   ├── requirements.txt     # Python dependencies
│   ├── requirements-prod.txt # Production dependencies
│   ├── Dockerfile           # Backend Docker configuration
│   ├── fly.toml             # Fly.io deployment config
│   ├── lambda_handler.py    # AWS Lambda handler
│   ├── serverless.yml       # Serverless framework config
│   ├── Procfile             # Heroku/Procfile config
│   ├── runtime.txt          # Python runtime version
│   └── deploy.sh            # Deployment script
│
├── mobile/                   # React Native app
│   ├── src/
│   │   ├── screens/         # App screens (20+ screens)
│   │   │   ├── WelcomeScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── LogWorkoutScreen.js
│   │   │   ├── ExercisesScreen.js
│   │   │   ├── ClassesScreen.js
│   │   │   ├── MacroTrackingScreen.js
│   │   │   └── ... (more screens)
│   │   ├── components/      # Reusable components
│   │   │   ├── Button.js
│   │   │   └── Input.js
│   │   ├── services/        # API services and utilities
│   │   │   └── api.js       # API client configuration
│   │   ├── styles/          # Global styling and themes
│   │   │   ├── colors.js
│   │   │   ├── globalStyles.js
│   │   │   └── ... (screen-specific styles)
│   │   └── utils/           # Utility functions
│   │       └── units.js     # Unit conversion helpers
│   ├── App.js               # App entry point & navigation
│   ├── package.json         # Node dependencies
│   ├── app.json             # Expo configuration
│   ├── babel.config.js      # Babel configuration
│   └── eas.json             # EAS Build configuration
│
├── docs/                     # Documentation
│   ├── API_DOCUMENTATION.md # Complete API reference
│   ├── API_TESTING_GUIDE.md # API testing guide with examples
│   ├── DEPLOYMENT_GUIDE.md  # Deployment instructions
│   ├── RESTART_BACKEND.md   # Backend restart guide
│   ├── TROUBLESHOOTING.md   # Troubleshooting guide
│   ├── FLY_IO_DEPLOYMENT.md # Fly.io deployment guide
│   └── SIMULATOR_SETUP.md   # Simulator setup guide
│
├── tests/                    # Test scripts
│   ├── test_exercises_api.sh # Exercises API tests
│   └── test_assigned_workouts.sh # Assigned workouts tests
│
├── docker-compose.yml        # Docker Compose configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## Detailed Setup Instructions

### Backend Setup

#### Using Docker Compose

Docker Compose is the easiest way to get started for both development and testing.

```bash
# From the project root directory
docker-compose up -d
```

This single command will:
- ✅ Build the backend Docker image
- ✅ Create the database
- ✅ Seed sample data (exercises, foods, etc.)
- ✅ Start the Flask API server
- ✅ Enable hot-reload for development

**Common Docker Commands:**

```bash
# View logs
docker-compose logs -f backend

# Restart after code changes
docker-compose restart backend

# Stop all services
docker-compose down

# Rebuild after dependency changes
docker-compose up -d --build

# Access the container shell
docker-compose exec backend bash

# Re-seed the database
docker-compose exec backend python seed_data.py
```

**Verify it's working:**
```bash
curl http://localhost:5000/api/exercises
# Should return a list of exercises
```

The backend API will be available at `http://localhost:5000`

**Note:** Make sure Python 3.8+ is installed on your system. It's recommended to use Docker for consistency.

### API Documentation

📖 **Complete API Reference:** See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for detailed endpoint documentation.

📝 **Testing Guide:** See [API_TESTING_GUIDE.md](docs/API_TESTING_GUIDE.md) for curl commands and testing examples.

### Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Install Expo CLI globally (if not installed)
npm install -g expo-cli
```

**Configure API Connection:**

Edit `mobile/src/services/api.js`:
```javascript
export const API_URL = 'http://YOUR_IP:5000/api';

// Platform-specific configurations:
// iOS Simulator:     'http://localhost:5000/api'
// Android Emulator:  'http://10.0.2.2:5000/api'
// Physical Device:   'http://192.168.1.X:5000/api'
```

**Start the development server:**
```bash
npx expo start
# or
expo start
```

**Run on your platform:**

| Platform | Command | Requirements |
|----------|---------|--------------|
| **iOS Simulator** | Press `i` | Mac only, Xcode installed |
| **Android Emulator** | Press `a` | Android Studio + emulator running |
| **Physical Device** | Scan QR code | Expo Go app installed |

**Using Expo Go (Easiest Method):**
1. Install Expo Go from App Store/Play Store
2. Scan the QR code displayed in terminal
3. App opens in Expo Go automatically

## Testing the App

### Verify Backend is Running

```bash
# Check Docker containers
docker-compose ps

# Should show backend container as "Up"
# Test API endpoint
curl http://localhost:5000/api/exercises | jq

# View backend logs
docker-compose logs -f backend
```

**To re-seed manually:**
```bash
docker-compose exec backend python seed_data.py
```

## Troubleshooting

📖 **Complete Troubleshooting Guide:** See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed solutions to common issues.

Quick reference for common problems:
- **Backend not starting:** Check [RESTART_BACKEND.md](docs/RESTART_BACKEND.md)
- **Database issues:** Restart with `docker-compose down -v && docker-compose up -d`
- **Connection errors:** Verify API_URL in `mobile/src/services/api.js`
- **Port conflicts:** Check what's using port 5000 with `lsof -i :5000` (macOS/Linux)

## Environment Variables

### Backend

When using Docker Compose, environment variables are configured in `docker-compose.yml`.

**Development (.env or docker-compose.yml):**
```bash
FLASK_ENV=development
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret
DATABASE_URL=sqlite:///instance/fittrack.db
DEV_MODE=true
```

**Production:**
```bash
FLASK_ENV=production
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>
DATABASE_URL=postgresql://user:pass@host:5432/fittrack
DEV_MODE=false
```

**Note:** In development mode, authentication is simplified with `DEV_USER_ID = 1` in route files.

### Mobile App

Configure in `mobile/src/services/api.js`:
```javascript
export const API_URL = 'http://YOUR_IP:5000/api';
```

## Building for Production

### Backend

**Using Docker Compose (Recommended):**
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or manually:
docker build -t fittrack-backend:production ./backend
docker run -d -p 5000:5000 \
  -e FLASK_ENV=production \
  -e SECRET_KEY=your-secret-key \
  --name fittrack-api \
  fittrack-backend:production
```

**Environment Variables for Production:**
```bash
FLASK_ENV=production
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>
DATABASE_URL=postgresql://user:pass@host:5432/fittrack  # Use PostgreSQL in production
```

### Mobile App

#### iOS
```bash
cd mobile
npx expo build:ios
```

#### Android
```bash
cd mobile
npx expo build:android
```


## Testing

### Backend Tests

**Using Docker:**
```bash
# Run tests in Docker container
docker-compose exec backend python -m pytest tests/

# Or run with coverage
docker-compose exec backend python -m pytest tests/ --cov=. --cov-report=html
```

**Local (without Docker):**
```bash
cd backend
python -m pytest tests/
```

### Mobile Tests
```bash
cd mobile
npm test
```

## Documentation

All documentation is available in the [`docs/`](docs/) directory:

- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - Complete API reference with all endpoints
- **[API_TESTING_GUIDE.md](docs/API_TESTING_GUIDE.md)** - API testing guide with curl/Postman examples
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Comprehensive troubleshooting guide
- **[RESTART_BACKEND.md](docs/RESTART_BACKEND.md)** - Backend restart and database setup guide
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[FLY_IO_DEPLOYMENT.md](docs/FLY_IO_DEPLOYMENT.md)** - Fly.io deployment guide
- **[SIMULATOR_SETUP.md](docs/SIMULATOR_SETUP.md)** - Simulator setup instructions

---

Built with ❤️ by the FitTrack Team
