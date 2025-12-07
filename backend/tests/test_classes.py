import pytest
import json
from models import db
from models.classes import Class, ClassMembership, ClassJoinRequest
from models.user import User

class TestCreateClass:
    """Test creating classes"""
    
    def test_create_class_success(self, client, instructor_headers):
        """Test successfully creating a class as instructor"""
        class_data = {
            'name': 'Test Class',
            'description': 'Test Description'
        }
        response = client.post('/api/classes',
            headers=instructor_headers,
            json=class_data
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'class' in data
        assert data['class']['name'] == 'Test Class'
        assert 'join_code' in data['class']
    
    def test_create_class_as_student(self, client, auth_headers):
        """Test creating class as student (should fail)"""
        class_data = {
            'name': 'Test Class',
            'description': 'Test Description'
        }
        response = client.post('/api/classes',
            headers=auth_headers,
            json=class_data
        )
        assert response.status_code == 403
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_class_unauthorized(self, client):
        """Test creating class without authentication"""
        response = client.post('/api/classes',
            json={'name': 'Test Class'}
        )
        assert response.status_code == 401


class TestGetClasses:
    """Test getting classes"""
    
    def test_get_classes_as_instructor(self, client, instructor_headers, instructor_user):
        """Test getting classes as instructor"""
        # Create a class
        with client.application.app_context():
            class_obj = Class(
                instructor_id=instructor_user.id,
                name='Instructor Class',
                join_code='TEST1234'
            )
            db.session.add(class_obj)
            db.session.commit()
        
        response = client.get('/api/classes', headers=instructor_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'classes' in data
        assert len(data['classes']) >= 1
    
    def test_get_classes_as_student(self, client, auth_headers, test_user, sample_class):
        """Test getting classes as student"""
        # Add student to class
        with client.application.app_context():
            membership = ClassMembership(
                class_id=sample_class.id,
                student_id=test_user.id
            )
            db.session.add(membership)
            db.session.commit()
        
        response = client.get('/api/classes', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'classes' in data
    
    def test_get_classes_unauthorized(self, client):
        """Test getting classes without authentication"""
        response = client.get('/api/classes')
        assert response.status_code == 401


class TestGetClass:
    """Test getting a single class"""
    
    def test_get_class_success(self, client, instructor_headers, sample_class):
        """Test successfully getting a class"""
        response = client.get(f'/api/classes/{sample_class.id}', headers=instructor_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'class' in data
        assert data['class']['id'] == sample_class.id
    
    def test_get_class_not_found(self, client, instructor_headers):
        """Test getting non-existent class"""
        response = client.get('/api/classes/99999', headers=instructor_headers)
        assert response.status_code == 404
    
    def test_get_class_unauthorized(self, client, sample_class):
        """Test getting class without authentication"""
        response = client.get(f'/api/classes/{sample_class.id}')
        assert response.status_code == 401


class TestJoinClass:
    """Test joining classes"""
    
    def test_join_class_success(self, client, auth_headers, sample_class):
        """Test successfully joining a class"""
        join_data = {
            'join_code': sample_class.join_code
        }
        response = client.post('/api/classes/join',
            headers=auth_headers,
            json=join_data
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
    
    def test_join_class_invalid_code(self, client, auth_headers):
        """Test joining class with invalid code"""
        join_data = {
            'join_code': 'INVALID'
        }
        response = client.post('/api/classes/join',
            headers=auth_headers,
            json=join_data
        )
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_join_class_missing_code(self, client, auth_headers):
        """Test joining class without code"""
        response = client.post('/api/classes/join',
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 400
    
    def test_join_class_unauthorized(self, client):
        """Test joining class without authentication"""
        response = client.post('/api/classes/join',
            json={'join_code': 'TEST1234'}
        )
        assert response.status_code == 401


class TestGetClassMembers:
    """Test getting class members"""
    
    def test_get_members_success(self, client, instructor_headers, sample_class):
        """Test successfully getting class members"""
        response = client.get(f'/api/classes/{sample_class.id}/members', headers=instructor_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'members' in data
    
    def test_get_members_unauthorized(self, client, sample_class):
        """Test getting members without authentication"""
        response = client.get(f'/api/classes/{sample_class.id}/members')
        assert response.status_code == 401

