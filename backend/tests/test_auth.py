import pytest
import json
from models import db
from models.user import User, PasswordResetToken
from datetime import datetime, timedelta

class TestRegister:
    """Test user registration"""
    
    def test_register_success(self, client):
        """Test successful user registration"""
        response = client.post('/api/auth/register', 
            json={
                'email': 'newuser@example.com',
                'username': 'newuser',
                'password': 'password123',
                'role': 'student'
            }
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['email'] == 'newuser@example.com'
        assert data['user']['username'] == 'newuser'
        assert data['user']['role'] == 'student'
    
    def test_register_missing_fields(self, client):
        """Test registration with missing fields"""
        response = client.post('/api/auth/register', 
            json={'email': 'test@example.com'}
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email"""
        response = client.post('/api/auth/register',
            json={
                'email': 'test@example.com',
                'username': 'differentuser',
                'password': 'password123'
            }
        )
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already registered' in data['error'].lower()
    
    def test_register_duplicate_username(self, client, test_user):
        """Test registration with duplicate username"""
        response = client.post('/api/auth/register',
            json={
                'email': 'different@example.com',
                'username': 'testuser',
                'password': 'password123'
            }
        )
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'username' in data['error'].lower()
    
    def test_register_default_role(self, client):
        """Test registration defaults to student role"""
        response = client.post('/api/auth/register',
            json={
                'email': 'student@example.com',
                'username': 'student',
                'password': 'password123'
            }
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['user']['role'] == 'student'
    
    def test_register_instructor_role(self, client):
        """Test registration with instructor role"""
        response = client.post('/api/auth/register',
            json={
                'email': 'instructor@example.com',
                'username': 'instructor',
                'password': 'password123',
                'role': 'instructor'
            }
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['user']['role'] == 'instructor'


class TestLogin:
    """Test user login"""
    
    def test_login_success(self, client, test_user):
        """Test successful login"""
        response = client.post('/api/auth/login',
            json={
                'email': 'test@example.com',
                'password': 'testpass123'
            }
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['email'] == 'test@example.com'
    
    def test_login_invalid_email(self, client, test_user):
        """Test login with invalid email"""
        response = client.post('/api/auth/login',
            json={
                'email': 'wrong@example.com',
                'password': 'testpass123'
            }
        )
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_login_invalid_password(self, client, test_user):
        """Test login with invalid password"""
        response = client.post('/api/auth/login',
            json={
                'email': 'test@example.com',
                'password': 'wrongpassword'
            }
        )
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields"""
        response = client.post('/api/auth/login',
            json={'email': 'test@example.com'}
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data


class TestGetCurrentUser:
    """Test getting current user"""
    
    def test_get_current_user_success(self, client, auth_headers):
        """Test successfully getting current user"""
        response = client.get('/api/auth/me', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['email'] == 'test@example.com'
    
    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without token"""
        response = client.get('/api/auth/me')
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        headers = {
            'Authorization': 'Bearer invalid_token',
            'Content-Type': 'application/json'
        }
        response = client.get('/api/auth/me', headers=headers)
        assert response.status_code == 422  # JWT decode error


class TestChangePassword:
    """Test changing password"""
    
    def test_change_password_success(self, client, auth_headers, test_user):
        """Test successful password change"""
        response = client.post('/api/auth/change-password',
            headers=auth_headers,
            json={
                'current_password': 'testpass123',
                'new_password': 'newpass123'
            }
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        
        # Verify new password works
        login_response = client.post('/api/auth/login',
            json={
                'email': 'test@example.com',
                'password': 'newpass123'
            }
        )
        assert login_response.status_code == 200
    
    def test_change_password_wrong_current(self, client, auth_headers):
        """Test password change with wrong current password"""
        response = client.post('/api/auth/change-password',
            headers=auth_headers,
            json={
                'current_password': 'wrongpassword',
                'new_password': 'newpass123'
            }
        )
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_change_password_missing_fields(self, client, auth_headers):
        """Test password change with missing fields"""
        response = client.post('/api/auth/change-password',
            headers=auth_headers,
            json={'current_password': 'testpass123'}
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_change_password_unauthorized(self, client):
        """Test password change without authentication"""
        response = client.post('/api/auth/change-password',
            json={
                'current_password': 'testpass123',
                'new_password': 'newpass123'
            }
        )
        assert response.status_code == 401


class TestForgotPassword:
    """Test forgot password functionality"""
    
    def test_forgot_password_success(self, client, test_user):
        """Test successful forgot password request"""
        # Clear any existing tokens for this user
        PasswordResetToken.query.filter_by(user_id=test_user.id).delete()
        db.session.commit()
        
        response = client.post('/api/auth/forgot-password',
            json={'email': 'test@example.com'}
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        # Token should be generated in database
        token_count = PasswordResetToken.query.filter_by(user_id=test_user.id, used=False).count()
        assert token_count == 1
    
    def test_forgot_password_nonexistent_email(self, client):
        """Test forgot password with non-existent email (should still return success)"""
        # Clear any existing tokens
        PasswordResetToken.query.delete()
        db.session.commit()
        
        response = client.post('/api/auth/forgot-password',
            json={'email': 'nonexistent@example.com'}
        )
        # Should return success for security (prevent email enumeration)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        # No token should be generated
        token_count = PasswordResetToken.query.filter_by(used=False).count()
        assert token_count == 0
    
    def test_forgot_password_missing_email(self, client):
        """Test forgot password without email"""
        response = client.post('/api/auth/forgot-password',
            json={}
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data


class TestResetPassword:
    """Test reset password functionality"""
    
    def test_reset_password_success(self, client, test_user):
        """Test successful password reset"""
        # Clear any existing tokens
        PasswordResetToken.query.filter_by(user_id=test_user.id).delete()
        db.session.commit()
        
        # Generate a token in database
        import secrets
        reset_token = secrets.token_urlsafe(32)
        reset_token_obj = PasswordResetToken(
            token=reset_token,
            user_id=test_user.id,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db.session.add(reset_token_obj)
        db.session.commit()
        
        response = client.post('/api/auth/reset-password',
            json={
                'token': reset_token,
                'new_password': 'newpassword123'
            }
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        # Token should be marked as used after use
        db.session.refresh(reset_token_obj)
        assert reset_token_obj.used == True
        
        # Verify new password works
        login_response = client.post('/api/auth/login',
            json={
                'email': 'test@example.com',
                'password': 'newpassword123'
            }
        )
        assert login_response.status_code == 200
    
    def test_reset_password_invalid_token(self, client):
        """Test reset password with invalid token"""
        # Clear any existing tokens
        PasswordResetToken.query.delete()
        db.session.commit()
        
        response = client.post('/api/auth/reset-password',
            json={
                'token': 'invalid_token',
                'new_password': 'newpassword123'
            }
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_reset_password_expired_token(self, client, test_user):
        """Test reset password with expired token"""
        # Clear any existing tokens
        PasswordResetToken.query.filter_by(user_id=test_user.id).delete()
        db.session.commit()
        
        # Generate an expired token in database
        import secrets
        reset_token = secrets.token_urlsafe(32)
        reset_token_obj = PasswordResetToken(
            token=reset_token,
            user_id=test_user.id,
            expires_at=datetime.utcnow() - timedelta(hours=1)  # Expired
        )
        db.session.add(reset_token_obj)
        db.session.commit()
        
        response = client.post('/api/auth/reset-password',
            json={
                'token': reset_token,
                'new_password': 'newpassword123'
            }
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'expired' in data['error'].lower()
        # Token should still exist but be invalid
        db.session.refresh(reset_token_obj)
        assert not reset_token_obj.is_valid()
    
    def test_reset_password_short_password(self, client, test_user):
        """Test reset password with password too short"""
        # Clear any existing tokens
        PasswordResetToken.query.filter_by(user_id=test_user.id).delete()
        db.session.commit()
        
        import secrets
        reset_token = secrets.token_urlsafe(32)
        reset_token_obj = PasswordResetToken(
            token=reset_token,
            user_id=test_user.id,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db.session.add(reset_token_obj)
        db.session.commit()
        
        response = client.post('/api/auth/reset-password',
            json={
                'token': reset_token,
                'new_password': 'short'  # Less than 6 characters
            }
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert '6 characters' in data['error']
        # Token should still be valid (not used) since password was invalid
        db.session.refresh(reset_token_obj)
        assert reset_token_obj.is_valid()
    
    def test_reset_password_missing_fields(self, client):
        """Test reset password with missing fields"""
        response = client.post('/api/auth/reset-password',
            json={'token': 'some_token'}
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

