from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.workout import Workout, WorkoutExercise, ExerciseSet, Routine
from datetime import datetime, timedelta

bp = Blueprint('workouts', __name__, url_prefix='/api/workouts')

@bp.route('', methods=['GET'])
@jwt_required()
def get_workouts():
    """Get all workouts for current user"""
    user_id = int(get_jwt_identity())
    
    # Optional filters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Workout.query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(Workout.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Workout.date <= datetime.fromisoformat(end_date))
    
    # Order by created_at (most recent first), then by date
    workouts = query.order_by(Workout.created_at.desc()).all()
    
    return jsonify({
        'workouts': [w.to_dict() for w in workouts]
    }), 200

@bp.route('/<int:workout_id>', methods=['GET'])
@jwt_required()
def get_workout(workout_id):
    """Get specific workout"""
    user_id = int(get_jwt_identity())
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
    
    if not workout:
        return jsonify({'error': 'Workout not found'}), 404
    
    return jsonify({'workout': workout.to_dict()}), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_workout():
    """Create a new workout"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    workout = Workout(
        user_id=user_id,
        name=data.get('name', 'Workout'),
        duration=data.get('duration'),
        total_volume=data.get('total_volume'),
        calories_burned=data.get('calories_burned'),
        notes=data.get('notes'),
        date=datetime.fromisoformat(data['date']) if data.get('date') else datetime.utcnow()
    )
    
    db.session.add(workout)
    db.session.commit()
    
    # Add exercises if provided
    if data.get('exercises'):
        for exercise_data in data['exercises']:
            # Handle both regular exercises and custom exercises
            exercise_id = exercise_data.get('exercise_id') if exercise_data.get('exercise_id') else None
            custom_exercise_name = exercise_data.get('custom_exercise_name') if not exercise_id else None
            
            # Validate: must have either exercise_id or custom_exercise_name
            if not exercise_id and not custom_exercise_name:
                continue  # Skip invalid exercises
            
            workout_exercise = WorkoutExercise(
                workout_id=workout.id,
                exercise_id=exercise_id,
                custom_exercise_name=custom_exercise_name,
                order=exercise_data.get('order', 0)
            )
            db.session.add(workout_exercise)
            db.session.flush()
            
            # Add sets
            if exercise_data.get('sets'):
                for set_data in exercise_data['sets']:
                    exercise_set = ExerciseSet(
                        workout_exercise_id=workout_exercise.id,
                        set_number=set_data['set_number'],
                        weight=set_data.get('weight'),
                        reps=set_data.get('reps'),
                        duration=set_data.get('duration'),
                        completed=set_data.get('completed', False)
                    )
                    db.session.add(exercise_set)
        
        db.session.commit()
    
    return jsonify({
        'message': 'Workout created successfully',
        'workout': workout.to_dict()
    }), 201

@bp.route('/<int:workout_id>', methods=['PUT'])
@jwt_required()
def update_workout(workout_id):
    """Update a workout"""
    user_id = int(get_jwt_identity())
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
    
    if not workout:
        return jsonify({'error': 'Workout not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        workout.name = data['name']
    if 'duration' in data:
        workout.duration = data['duration']
    if 'total_volume' in data:
        workout.total_volume = data['total_volume']
    if 'calories_burned' in data:
        workout.calories_burned = data['calories_burned']
    if 'notes' in data:
        workout.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Workout updated successfully',
        'workout': workout.to_dict()
    }), 200

@bp.route('/<int:workout_id>', methods=['DELETE'])
@jwt_required()
def delete_workout(workout_id):
    """Delete a workout"""
    user_id = int(get_jwt_identity())
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
    
    if not workout:
        return jsonify({'error': 'Workout not found'}), 404
    
    db.session.delete(workout)
    db.session.commit()
    
    return jsonify({'message': 'Workout deleted successfully'}), 200

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_workout_stats():
    """Get workout statistics for the user"""
    user_id = int(get_jwt_identity())
    
    # Get user info
    from models.user import User
    user = User.query.get(user_id)
    
    # Get workouts from last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_workouts = Workout.query.filter(
        Workout.user_id == user_id,
        Workout.date >= thirty_days_ago
    ).all()
    
    # Calculate stats
    total_workouts = len(recent_workouts)
    total_time = sum(w.duration or 0 for w in recent_workouts)
    total_volume = sum(w.total_volume or 0 for w in recent_workouts)
    
    # Get last workout
    last_workout = Workout.query.filter_by(user_id=user_id).order_by(Workout.date.desc()).first()
    
    return jsonify({
        'stats': {
            'user': user.to_dict() if user else None,
            'total_workouts': total_workouts,
            'total_time': total_time,
            'total_volume': total_volume,
            'last_workout': last_workout.to_dict() if last_workout else None
        }
    }), 200

@bp.route('/routines', methods=['GET'])
@jwt_required()
def get_routines():
    """Get all routines for current user"""
    user_id = int(get_jwt_identity())
    routines = Routine.query.filter_by(user_id=user_id).order_by(Routine.created_at.desc()).all()
    
    return jsonify({
        'routines': [r.to_dict() for r in routines]
    }), 200

@bp.route('/routines', methods=['POST'])
@jwt_required()
def create_routine():
    """Create a new routine"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Get exercise IDs from the request
    exercise_ids = data.get('exercise_ids', [])
    
    routine = Routine(
        user_id=user_id,
        name=data['name'],
        description=data.get('description'),
        icon=data.get('icon'),
        exercise_count=len(exercise_ids),
        exercise_ids=','.join(str(id) for id in exercise_ids) if exercise_ids else None
    )
    
    db.session.add(routine)
    db.session.commit()
    
    return jsonify({
        'message': 'Routine created successfully',
        'routine': routine.to_dict()
    }), 201

@bp.route('/routines/<int:routine_id>', methods=['GET'])
@jwt_required()
def get_routine(routine_id):
    """Get specific routine with exercises"""
    user_id = int(get_jwt_identity())
    routine = Routine.query.filter_by(id=routine_id, user_id=user_id).first()
    
    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    return jsonify({'routine': routine.to_dict()}), 200

