# FitTrack - Complete Deployment Guide

## 📱 Publishing Overview

Your FitTrack app has two components that need to be published:
1. **Mobile App** → iOS App Store & Google Play Store
2. **Backend API** → Cloud hosting service

---

## Part 1: Mobile App Publishing

### Option A: Expo Application Services (EAS) - RECOMMENDED

**Easiest and fastest method for Expo apps**

#### Prerequisites:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

#### Step 1: Configure EAS
```bash
cd mobile
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### Step 2: Update App Configuration

Edit `mobile/app.json`:
```json
{
  "expo": {
    "name": "FitTrack",
    "slug": "fittrack-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.fittrack",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.fittrack",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

#### Step 3: Build for iOS

```bash
# Submit to App Store Connect
eas build --platform ios --auto-submit

# Or build without submitting
eas build --platform ios
```

**Requirements:**
- Apple Developer Account ($99/year)
- App Store Connect access
- App icons and screenshots

#### Step 4: Build for Android

```bash
# Build APK for testing
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

**Requirements:**
- Google Play Developer Account ($25 one-time)
- Signed APK/AAB
- Store listing assets

---

### Option B: Build Standalone Apps Locally

#### For iOS:
```bash
cd mobile
npx expo prebuild
cd ios
pod install
open FitTrack.xcworkspace

# Then in Xcode:
# 1. Select "Any iOS Device"
# 2. Product → Archive
# 3. Distribute App → App Store Connect
```

#### For Android:
```bash
cd mobile
npx expo prebuild
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Part 2: Backend API Deployment

### Option A: Railway.app (RECOMMENDED - Free to start)

#### Step 1: Prepare Backend
```bash
cd backend

# Create production requirements
echo "Flask==3.0.0
flask-cors==4.0.0
flask-jwt-extended==4.5.3
flask-sqlalchemy==3.1.1
python-dotenv==1.0.0
bcrypt==4.1.1
gunicorn==21.2.0
psycopg2-binary==2.9.9" > requirements.txt

# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Create runtime.txt
echo "python-3.11.0" > runtime.txt
```

#### Step 2: Update Database for Production

Edit `backend/app.py`:
```python
import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Production database
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///fittrack.db')
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(24))
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', os.urandom(24))
```

#### Step 3: Deploy to Railway

1. **Sign up**: https://railway.app
2. **Create new project** → Deploy from GitHub
3. **Connect your repo**
4. **Add PostgreSQL database**:
   - Click "New" → Database → PostgreSQL
   - Railway automatically sets DATABASE_URL
5. **Deploy**: Automatic on git push

**Environment Variables to Set:**
```
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
FLASK_ENV=production
```

**Your API URL**: `https://your-app.railway.app`

---

### Option B: Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
cd backend
heroku create fittrack-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set JWT_SECRET_KEY=your-jwt-secret

# Deploy
git push heroku main

# Run migrations
heroku run python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

---

### Option C: AWS EC2

#### Step 1: Launch EC2 Instance
- Ubuntu Server 22.04
- t2.micro (free tier eligible)
- Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

#### Step 2: Setup Server
```bash
# SSH into server
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python, Docker, and dependencies
sudo apt install python3-pip docker.io docker-compose nginx -y

# Clone your repo
git clone https://github.com/yourusername/fittrack.git
cd fittrack

# Start backend with Docker (recommended)
docker-compose up -d

# OR if you prefer manual setup without Docker:
# cd backend
# pip3 install -r requirements.txt
# python3 seed_data.py
# python3 app.py

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Setup database
sudo -u postgres psql
CREATE DATABASE fittrack;
CREATE USER fittrackuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE fittrack TO fittrackuser;
\q

# Configure Nginx
sudo nano /etc/nginx/sites-available/fittrack
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fittrack /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

# Setup systemd service
sudo nano /etc/systemd/system/fittrack.service
```

Systemd service:
```ini
[Unit]
Description=FitTrack API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/fittrack/backend
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/local/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl enable fittrack
sudo systemctl start fittrack
```

---

## Part 3: Connect Mobile App to Production API

### Update API URL

Edit `mobile/src/services/api.js`:
```javascript
import { Platform } from 'react-native';

// Production API URL
const PRODUCTION_API_URL = 'https://your-app.railway.app/api';

// Development API URL
const DEV_API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api'
  : 'http://YOUR_LOCAL_IP:5000/api';

// Use production in release builds
const API_BASE_URL = __DEV__ ? DEV_API_URL : PRODUCTION_API_URL;

export const API_URL = API_BASE_URL;
```

---

## Part 4: Pre-Launch Checklist

### Mobile App:
- [ ] App icons (1024x1024 for iOS, various sizes for Android)
- [ ] Screenshots for stores (6.5", 5.5" for iOS; phone, tablet for Android)
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Test on real devices
- [ ] Handle permissions (camera, notifications, etc.)
- [ ] Set up crash reporting (Sentry, Bugsnag)
- [ ] Configure analytics (Google Analytics, Mixpanel)

### Backend:
- [ ] Environment variables secured
- [ ] Database backed up
- [ ] HTTPS/SSL certificate (Let's Encrypt)
- [ ] Rate limiting implemented
- [ ] Error logging (Sentry)
- [ ] Database migrations setup
- [ ] Monitoring (UptimeRobot, StatusCake)
- [ ] CORS configured for production domain

### Security:
- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Implement authentication properly
- [ ] Add request validation
- [ ] Set up rate limiting
- [ ] Enable CORS only for your domains

---

## Part 5: Cost Estimates

### Free Tier Options:
| Service | Cost | Limits |
|---------|------|--------|
| **Railway** | $0-5/mo | 500 hrs/mo, 512MB RAM |
| **Expo Go** | Free | Testing only |
| **PostgreSQL** (Railway) | Free | 1GB storage |

### Paid Options:
| Service | Cost | Features |
|---------|------|----------|
| **Apple Developer** | $99/year | Required for App Store |
| **Google Play** | $25 one-time | Required for Play Store |
| **Railway Pro** | $20/mo | 8GB RAM, unlimited hours |
| **Heroku Eco** | $5/mo | 1000 dyno hours |
| **AWS EC2** | ~$10/mo | t2.micro instance |
| **Domain** | ~$12/year | .com domain |

---

## Part 6: Quick Start Commands

### Deploy Backend to Railway:
```bash
cd backend
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
gh repo create fittrack-backend --public
git push origin main

# Then connect to Railway via web dashboard
```

### Build Mobile App:
```bash
cd mobile

# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

---

## Part 7: Post-Launch

### Monitoring:
```bash
# Railway logs
railway logs

# Heroku logs
heroku logs --tail

# AWS logs
sudo journalctl -u fittrack -f
```

### Updates:
```bash
# Update mobile app
cd mobile
# Increment version in app.json
eas build --platform all --auto-submit

# Update backend
git push origin main  # Auto-deploys on Railway/Heroku
```

---

## Recommended Deployment Path

### Phase 1: MVP Launch (Free)
1. ✅ Deploy backend to **Railway** (free tier)
2. ✅ Use **PostgreSQL** on Railway (free tier)
3. ✅ Build APK with **EAS** for Android testing
4. ✅ Test with TestFlight for iOS

### Phase 2: Public Launch
1. ✅ Publish to **Google Play Store** ($25)
2. ✅ Publish to **Apple App Store** ($99/year)
3. ✅ Add custom domain ($12/year)
4. ✅ Set up SSL certificate (free with Let's Encrypt)

### Phase 3: Scale
1. ✅ Upgrade to Railway Pro ($20/mo) or AWS
2. ✅ Add CDN for assets (Cloudflare - free)
3. ✅ Implement caching (Redis)
4. ✅ Add monitoring and analytics

---

## Need Help?

### Documentation:
- **Expo**: https://docs.expo.dev/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Railway**: https://docs.railway.app/
- **Flask Deployment**: https://flask.palletsprojects.com/en/latest/deploying/

### Support:
- **Expo Forums**: https://forums.expo.dev/
- **Railway Discord**: https://discord.gg/railway
- **Stack Overflow**: Tag with `expo`, `react-native`, `flask`

---

## Summary

**Fastest Path to Production:**
1. **Backend**: Deploy to Railway (5 minutes)
2. **Mobile**: Build with EAS (30 minutes)
3. **Publish**: Submit to stores (review takes 1-7 days)

**Total Cost to Start**: $124 ($99 Apple + $25 Google)

Your app is ready to publish! 🚀


