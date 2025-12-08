from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(24).hex())
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', os.urandom(24).hex())

# Database configuration - support both SQLite (local) and PostgreSQL (Lambda/RDS)
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    # PostgreSQL for Lambda/RDS
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # SQLite for local development and single-instance deployments
    # Check if we're on Fly.io (volume mounted at /data) or local
    if os.path.exists('/data'):
        # Fly.io with persistent volume
        db_path = '/data/fittrack.db'
    else:
        # Local development - use instance directory
        instance_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
        os.makedirs(instance_dir, exist_ok=True)
        db_path = os.path.join(instance_dir, 'fittrack.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

# Lambda-optimized connection pooling
if os.getenv('AWS_LAMBDA_FUNCTION_NAME'):
    # In Lambda, use connection pooling suitable for serverless
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_size': 1,  # Minimal pool for Lambda
        'max_overflow': 0,  # No overflow for Lambda
        'connect_args': {
            'connect_timeout': 5,
            'options': '-c statement_timeout=30000'
        }
    }
else:
    # Local development - more generous pooling
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
    }

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS configuration - allow your mobile app domain
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',') if os.getenv('CORS_ORIGINS') else ['*']
CORS(app, origins=CORS_ORIGINS)

# Initialize JWT
jwt = JWTManager(app)

# Initialize database
from models import db
db.init_app(app)

# Import routes
from routes import auth, workouts, exercises, profile, classes

# Register blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(workouts.bp)
app.register_blueprint(exercises.bp)
app.register_blueprint(profile.bp)
app.register_blueprint(classes.bp)

@app.route('/')
def index():
    return {
        'message': 'FitTrack API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'workouts': '/api/workouts',
            'exercises': '/api/exercises',
            'profile': '/api/profile',
            'classes': '/api/classes'
        }
    }

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

