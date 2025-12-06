from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db
from models.workout import Exercise

bp = Blueprint('exercises', __name__, url_prefix='/api/exercises')

@bp.route('', methods=['GET'])
def get_exercises():
    """Get all exercises - Public endpoint"""
    category = request.args.get('category')
    search = request.args.get('search')
    
    query = Exercise.query
    
    if category:
        query = query.filter(Exercise.category == category)
    
    if search:
        query = query.filter(Exercise.name.ilike(f'%{search}%'))
    
    exercises = query.all()
    
    return jsonify({
        'exercises': [e.to_dict() for e in exercises]
    }), 200

@bp.route('/<int:exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    """Get specific exercise - Public endpoint"""
    exercise = Exercise.query.get(exercise_id)
    
    if not exercise:
        return jsonify({'error': 'Exercise not found'}), 404
    
    return jsonify({'exercise': exercise.to_dict()}), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_exercise():
    """Create a new exercise"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Exercise name is required'}), 400
    
    # Handle muscle_groups - can be a list or comma-separated string
    muscle_groups = None
    if data.get('muscle_groups'):
        if isinstance(data['muscle_groups'], list):
            muscle_groups = ','.join(data['muscle_groups'])
        else:
            muscle_groups = data['muscle_groups']
    
    exercise = Exercise(
        name=data['name'],
        description=data.get('description'),
        category=data.get('category', 'strength'),
        muscle_groups=muscle_groups,
        equipment=data.get('equipment'),
        instructions=data.get('instructions'),
        video_url=data.get('video_url'),
        image_url=data.get('image_url')
    )
    
    db.session.add(exercise)
    db.session.commit()
    
    return jsonify({
        'message': 'Exercise created successfully',
        'exercise': exercise.to_dict()
    }), 201

