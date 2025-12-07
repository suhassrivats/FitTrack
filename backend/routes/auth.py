from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.nutrition import NutritionGoal
import secrets
from datetime import datetime, timedelta

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'error': 'Email, username, and password are required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create new user
    user = User(
        email=data['email'],
        username=data['username'],
        full_name=data.get('full_name'),
        role=data.get('role', 'student')  # Default to 'student', can be 'instructor'
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create default nutrition goal
    nutrition_goal = NutritionGoal(user_id=user.id)
    db.session.add(nutrition_goal)
    db.session.commit()
    
    # Generate access token (convert user.id to string for JWT)
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access_token': access_token
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate access token (convert user.id to string for JWT)
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

# Simple in-memory store for reset tokens (in production, use Redis or database)
reset_tokens = {}

@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # For security, always return success even if user doesn't exist
    # This prevents email enumeration attacks
    if user:
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        # Store token with expiration (1 hour)
        reset_tokens[reset_token] = {
            'user_id': user.id,
            'email': user.email,
            'expires_at': datetime.utcnow() + timedelta(hours=1)
        }
        # In production, send email with reset link containing the token
        # For now, we'll just return success
        # TODO: Send email with reset link: /reset-password?token={reset_token}
    
    return jsonify({
        'message': 'If an account exists with this email, you will receive password reset instructions.'
    }), 200

@bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token"""
    data = request.get_json()
    
    if not data.get('token') or not data.get('new_password'):
        return jsonify({'error': 'Token and new password are required'}), 400
    
    token = data['token']
    
    # Check if token exists and is valid
    if token not in reset_tokens:
        return jsonify({'error': 'Invalid or expired reset token'}), 400
    
    token_data = reset_tokens[token]
    
    # Check if token has expired
    if datetime.utcnow() > token_data['expires_at']:
        del reset_tokens[token]
        return jsonify({'error': 'Reset token has expired'}), 400
    
    # Find user
    user = User.query.get(token_data['user_id'])
    if not user:
        del reset_tokens[token]
        return jsonify({'error': 'User not found'}), 404
    
    # Validate new password
    if len(data['new_password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    # Set new password
    user.set_password(data['new_password'])
    db.session.commit()
    
    # Remove used token
    del reset_tokens[token]
    
    return jsonify({'message': 'Password reset successfully'}), 200

