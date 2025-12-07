import pytest
import json
from models import db
from models.user import User
from models.workout import Workout
from datetime import datetime, timedelta

class TestGetProfile:
    """Test getting user profile"""
    
    def test_get_profile_success(self, client, auth_headers, test_user):
        """Test successfully getting profile"""
        response = client.get('/api/profile', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert 'stats' in data
        assert data['user']['email'] == 'test@example.com'
    
    def test_get_profile_unauthorized(self, client):
        """Test getting profile without authentication"""
        response = client.get('/api/profile')
        assert response.status_code == 401
    
    def test_get_profile_with_stats(self, client, auth_headers, sample_workout):
        """Test getting profile with workout stats"""
        response = client.get('/api/profile', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'stats' in data
        assert 'total_workouts' in data['stats']
        assert data['stats']['total_workouts'] >= 1


class TestUpdateProfile:
    """Test updating user profile"""
    
    def test_update_profile_success(self, client, auth_headers):
        """Test successfully updating profile"""
        update_data = {
            'full_name': 'Updated Name',
            'username': 'updateduser'
        }
        response = client.put('/api/profile',
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['user']['full_name'] == 'Updated Name'
        assert data['user']['username'] == 'updateduser'
    
    def test_update_profile_duplicate_username(self, client, auth_headers, test_user):
        """Test updating profile with duplicate username"""
        # Create another user
        with client.application.app_context():
            other_user = User(
                email='other@example.com',
                username='otheruser',
                role='student'
            )
            other_user.set_password('password123')
            db.session.add(other_user)
            db.session.commit()
        
        update_data = {'username': 'otheruser'}
        response = client.put('/api/profile',
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_update_profile_avatar(self, client, auth_headers):
        """Test updating profile avatar"""
        update_data = {'avatar_url': 'https://example.com/avatar.jpg'}
        response = client.put('/api/profile',
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['user']['avatar_url'] == 'https://example.com/avatar.jpg'
    
    def test_update_profile_unauthorized(self, client):
        """Test updating profile without authentication"""
        response = client.put('/api/profile',
            json={'full_name': 'Test'}
        )
        assert response.status_code == 401


class TestGetProfileStats:
    """Test getting profile statistics"""
    
    def test_get_profile_stats_success(self, client, auth_headers):
        """Test successfully getting profile stats"""
        response = client.get('/api/profile/stats', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'weekly_workouts' in data
    
    def test_get_profile_stats_with_workouts(self, client, auth_headers, test_user):
        """Test getting stats with workouts"""
        # Create some workouts
        with client.application.app_context():
            for i in range(5):
                workout = Workout(
                    user_id=test_user.id,
                    name=f'Workout {i}',
                    date=(datetime.utcnow() - timedelta(days=i)).date()
                )
                db.session.add(workout)
            db.session.commit()
        
        response = client.get('/api/profile/stats', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'weekly_workouts' in data
    
    def test_get_profile_stats_unauthorized(self, client):
        """Test getting stats without authentication"""
        response = client.get('/api/profile/stats')
        assert response.status_code == 401

