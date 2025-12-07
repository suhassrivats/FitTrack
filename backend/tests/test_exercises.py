import pytest
import json
from models import db
from models.workout import Exercise

class TestGetExercises:
    """Test getting exercises"""
    
    def test_get_exercises_success(self, client):
        """Test successfully getting exercises (public endpoint)"""
        response = client.get('/api/exercises')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'exercises' in data
    
    def test_get_exercises_with_category_filter(self, client):
        """Test getting exercises with category filter"""
        response = client.get('/api/exercises?category=strength')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'exercises' in data
    
    def test_get_exercises_with_search(self, client):
        """Test getting exercises with search"""
        response = client.get('/api/exercises?search=push')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'exercises' in data


class TestGetExercise:
    """Test getting a single exercise"""
    
    def test_get_exercise_success(self, client):
        """Test successfully getting an exercise (public endpoint)"""
        # First create an exercise
        with client.application.app_context():
            exercise = Exercise(
                name='Test Exercise',
                category='strength',
                muscle_groups='chest,triceps'
            )
            db.session.add(exercise)
            db.session.commit()
            exercise_id = exercise.id
        
        response = client.get(f'/api/exercises/{exercise_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'exercise' in data
        assert data['exercise']['name'] == 'Test Exercise'
    
    def test_get_exercise_not_found(self, client):
        """Test getting non-existent exercise"""
        response = client.get('/api/exercises/99999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data


class TestCreateExercise:
    """Test creating exercises"""
    
    def test_create_exercise_success(self, client, auth_headers):
        """Test successfully creating an exercise"""
        exercise_data = {
            'name': 'New Exercise',
            'description': 'Test Description',
            'category': 'strength',
            'muscle_groups': ['chest', 'triceps'],
            'equipment': 'dumbbells'
        }
        response = client.post('/api/exercises',
            headers=auth_headers,
            json=exercise_data
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'exercise' in data
        assert data['exercise']['name'] == 'New Exercise'
    
    def test_create_exercise_missing_name(self, client, auth_headers):
        """Test creating exercise without name"""
        response = client.post('/api/exercises',
            headers=auth_headers,
            json={'description': 'Test'}
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_exercise_unauthorized(self, client):
        """Test creating exercise without authentication"""
        response = client.post('/api/exercises',
            json={'name': 'Test Exercise'}
        )
        assert response.status_code == 401

