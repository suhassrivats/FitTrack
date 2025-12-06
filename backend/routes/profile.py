from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.workout import Workout
from datetime import datetime, timedelta

bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Calculate stats
    total_workouts = Workout.query.filter_by(user_id=user_id).count()
    
    # Calculate streak (simplified version)
    recent_workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.date.desc()).limit(30).all()
    streak = 0
    if recent_workouts:
        last_date = recent_workouts[0].date
        current_date = datetime.utcnow().date()
        
        if last_date >= current_date - timedelta(days=1):
            streak = 1
            prev_date = last_date
            for workout in recent_workouts[1:]:
                if workout.date == prev_date - timedelta(days=1):
                    streak += 1
                    prev_date = workout.date
                elif workout.date == prev_date:
                    continue
                else:
                    break
    
    # Total time
    total_time = sum(w.duration or 0 for w in Workout.query.filter_by(user_id=user_id).all())
    
    return jsonify({
        'user': user.to_dict(),
        'stats': {
            'total_workouts': total_workouts,
            'streak': streak,
            'total_time': total_time
        }
    }), 200

@bp.route('', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'username' in data:
        # Check if username is taken
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({'error': 'Username already taken'}), 409
        user.username = data['username']
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_profile_stats():
    """Get detailed profile statistics"""
    user_id = int(get_jwt_identity())
    
    # Get workouts from last 30 days grouped by week
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    workouts = Workout.query.filter(
        Workout.user_id == user_id,
        Workout.date >= thirty_days_ago
    ).order_by(Workout.date).all()
    
    # Group by week
    weekly_data = {}
    for workout in workouts:
        week_num = (workout.date - thirty_days_ago.date()).days // 7 + 1
        if week_num not in weekly_data:
            weekly_data[week_num] = 0
        weekly_data[week_num] += 1
    
    weekly_stats = [
        {'week': f'Week {i}', 'count': weekly_data.get(i, 0)}
        for i in range(1, 5)
    ]
    
    return jsonify({
        'weekly_workouts': weekly_stats
    }), 200

