import pytest
import os
import tempfile
from datetime import datetime
from app import app
from models import db
from models.user import User
from models.workout import Workout, WorkoutExercise, ExerciseSet, Routine
from models.nutrition import Meal, Food, NutritionGoal
from flask_jwt_extended import create_access_token

@pytest.fixture
def client():
    """Create a test client"""
    # Use in-memory SQLite database for testing
    db_fd, db_path = tempfile.mkstemp()
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()
    
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def auth_headers(client):
    """Create a test user and return auth headers"""
    with app.app_context():
        user = User(
            email='test@example.com',
            username='testuser',
            role='student'
        )
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()
        
        token = create_access_token(identity=str(user.id))
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

@pytest.fixture
def test_user(client):
    """Create and return a test user"""
    with app.app_context():
        user = User(
            email='test@example.com',
            username='testuser',
            role='student'
        )
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()
        return user

@pytest.fixture
def instructor_user(client):
    """Create and return an instructor user"""
    with app.app_context():
        user = User(
            email='instructor@example.com',
            username='instructor',
            role='instructor'
        )
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()
        return user

@pytest.fixture
def instructor_headers(client, instructor_user):
    """Return auth headers for instructor"""
    with app.app_context():
        token = create_access_token(identity=str(instructor_user.id))
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

@pytest.fixture
def sample_workout(client, test_user):
    """Create a sample workout for testing"""
    with app.app_context():
        workout = Workout(
            user_id=test_user.id,
            name='Test Workout',
            duration=60,
            total_volume=1000.0,
            calories_burned=300,
            date=datetime.utcnow().date()
        )
        db.session.add(workout)
        db.session.commit()
        return workout

@pytest.fixture
def sample_class(client, instructor_user):
    """Create a sample class for testing"""
    with app.app_context():
        from models.classes import Class
        class_obj = Class(
            name='Test Class',
            description='Test Description',
            instructor_id=instructor_user.id
        )
        # Generate join code
        class_obj.join_code = class_obj.generate_join_code()
        db.session.add(class_obj)
        db.session.commit()
        return class_obj

