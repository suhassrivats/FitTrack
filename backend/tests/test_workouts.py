import pytest
import json
from datetime import datetime, timedelta
from models import db
from models.workout import Workout, WorkoutExercise, ExerciseSet, Routine

class TestGetWorkouts:
    """Test getting workouts"""
    
    def test_get_workouts_success(self, client, auth_headers, sample_workout):
        """Test successfully getting workouts"""
        response = client.get('/api/workouts', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'workouts' in data
        assert len(data['workouts']) >= 1
    
    def test_get_workouts_empty(self, client, auth_headers):
        """Test getting workouts when user has none"""
        response = client.get('/api/workouts', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'workouts' in data
        assert len(data['workouts']) == 0
    
    def test_get_workouts_unauthorized(self, client):
        """Test getting workouts without authentication"""
        response = client.get('/api/workouts')
        assert response.status_code == 401
    
    def test_get_workouts_with_date_filter(self, client, auth_headers, test_user):
        """Test getting workouts with date filters"""
        with client.application.app_context():
            # Create workout with specific date
            workout = Workout(
                user_id=test_user.id,
                name='Filtered Workout',
                date=(datetime.utcnow() - timedelta(days=5)).date()
            )
            db.session.add(workout)
            db.session.commit()
        
        start_date = (datetime.utcnow() - timedelta(days=10)).isoformat()
        end_date = (datetime.utcnow() - timedelta(days=1)).isoformat()
        
        response = client.get(
            f'/api/workouts?start_date={start_date}&end_date={end_date}',
            headers=auth_headers
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'workouts' in data


class TestGetWorkout:
    """Test getting a single workout"""
    
    def test_get_workout_success(self, client, auth_headers, sample_workout):
        """Test successfully getting a workout"""
        response = client.get(f'/api/workouts/{sample_workout.id}', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'workout' in data
        assert data['workout']['id'] == sample_workout.id
    
    def test_get_workout_not_found(self, client, auth_headers):
        """Test getting non-existent workout"""
        response = client.get('/api/workouts/99999', headers=auth_headers)
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_get_workout_unauthorized(self, client, sample_workout):
        """Test getting workout without authentication"""
        response = client.get(f'/api/workouts/{sample_workout.id}')
        assert response.status_code == 401


class TestCreateWorkout:
    """Test creating workouts"""
    
    def test_create_workout_success(self, client, auth_headers):
        """Test successfully creating a workout"""
        workout_data = {
            'name': 'New Workout',
            'duration': 60,
            'total_volume': 1000.0,
            'calories_burned': 300,
            'date': datetime.utcnow().date().isoformat()
        }
        response = client.post('/api/workouts', 
            headers=auth_headers,
            json=workout_data
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'workout' in data
        assert data['workout']['name'] == 'New Workout'
    
    def test_create_workout_with_exercises(self, client, auth_headers):
        """Test creating workout with exercises"""
        workout_data = {
            'name': 'Workout with Exercises',
            'date': datetime.utcnow().date().isoformat(),
            'exercises': [
                {
                    'custom_exercise_name': 'Push-ups',
                    'order': 0,
                    'sets': [
                        {'set_number': 1, 'reps': 10, 'weight': None, 'completed': True},
                        {'set_number': 2, 'reps': 10, 'weight': None, 'completed': True}
                    ]
                }
            ]
        }
        response = client.post('/api/workouts',
            headers=auth_headers,
            json=workout_data
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'workout' in data
    
    def test_create_workout_unauthorized(self, client):
        """Test creating workout without authentication"""
        response = client.post('/api/workouts',
            json={'name': 'Test Workout'}
        )
        assert response.status_code == 401


class TestUpdateWorkout:
    """Test updating workouts"""
    
    def test_update_workout_success(self, client, auth_headers, sample_workout):
        """Test successfully updating a workout"""
        update_data = {
            'name': 'Updated Workout',
            'duration': 90
        }
        response = client.put(f'/api/workouts/{sample_workout.id}',
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['workout']['name'] == 'Updated Workout'
        assert data['workout']['duration'] == 90
    
    def test_update_workout_not_found(self, client, auth_headers):
        """Test updating non-existent workout"""
        response = client.put('/api/workouts/99999',
            headers=auth_headers,
            json={'name': 'Updated'}
        )
        assert response.status_code == 404
    
    def test_update_workout_unauthorized(self, client, sample_workout):
        """Test updating workout without authentication"""
        response = client.put(f'/api/workouts/{sample_workout.id}',
            json={'name': 'Updated'}
        )
        assert response.status_code == 401


class TestDeleteWorkout:
    """Test deleting workouts"""
    
    def test_delete_workout_success(self, client, auth_headers, sample_workout):
        """Test successfully deleting a workout"""
        workout_id = sample_workout.id
        response = client.delete(f'/api/workouts/{workout_id}', headers=auth_headers)
        assert response.status_code == 200
        
        # Verify it's deleted
        get_response = client.get(f'/api/workouts/{workout_id}', headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_delete_workout_not_found(self, client, auth_headers):
        """Test deleting non-existent workout"""
        response = client.delete('/api/workouts/99999', headers=auth_headers)
        assert response.status_code == 404
    
    def test_delete_workout_unauthorized(self, client, sample_workout):
        """Test deleting workout without authentication"""
        response = client.delete(f'/api/workouts/{sample_workout.id}')
        assert response.status_code == 401


class TestWorkoutStats:
    """Test workout statistics"""
    
    def test_get_workout_stats_success(self, client, auth_headers, sample_workout):
        """Test successfully getting workout stats"""
        response = client.get('/api/workouts/stats', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'stats' in data
        assert 'total_workouts' in data['stats']
    
    def test_get_workout_stats_unauthorized(self, client):
        """Test getting stats without authentication"""
        response = client.get('/api/workouts/stats')
        assert response.status_code == 401


class TestRoutines:
    """Test routine endpoints"""
    
    def test_get_routines_success(self, client, auth_headers):
        """Test successfully getting routines"""
        response = client.get('/api/workouts/routines', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'routines' in data
    
    def test_create_routine_success(self, client, auth_headers):
        """Test successfully creating a routine"""
        routine_data = {
            'name': 'Test Routine',
            'description': 'Test Description',
            'exercise_ids': [1, 2, 3]
        }
        response = client.post('/api/workouts/routines',
            headers=auth_headers,
            json=routine_data
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'routine' in data
        assert data['routine']['name'] == 'Test Routine'
    
    def test_get_routine_success(self, client, auth_headers, test_user):
        """Test successfully getting a specific routine"""
        with client.application.app_context():
            routine = Routine(
                user_id=test_user.id,
                name='Test Routine',
                exercise_ids='1,2,3'
            )
            db.session.add(routine)
            db.session.commit()
            routine_id = routine.id
        
        response = client.get(f'/api/workouts/routines/{routine_id}', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'routine' in data
        assert data['routine']['name'] == 'Test Routine'
    
    def test_get_routine_not_found(self, client, auth_headers):
        """Test getting non-existent routine"""
        response = client.get('/api/workouts/routines/99999', headers=auth_headers)
        assert response.status_code == 404

