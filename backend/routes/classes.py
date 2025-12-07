from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.classes import Class, ClassMembership, ClassJoinRequest, AssignedWorkout, StudentWorkoutLog
from models.workout import Workout
from datetime import datetime
from sqlalchemy import func

bp = Blueprint('classes', __name__, url_prefix='/api/classes')


# ==================== CLASS MANAGEMENT ====================

@bp.route('', methods=['POST'])
@jwt_required()
def create_class():
    """Create a new class (instructor only)"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'instructor':
        return jsonify({'error': 'Only instructors can create classes'}), 403
    
    data = request.get_json()
    
    new_class = Class(
        instructor_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        join_code=''  # Will be generated
    )
    
    # Generate unique join code
    new_class.join_code = new_class.generate_join_code()
    
    db.session.add(new_class)
    db.session.commit()
    
    return jsonify({
        'message': 'Class created successfully',
        'class': new_class.to_dict()
    }), 201


@bp.route('', methods=['GET'])
@jwt_required()
def get_classes():
    """Get all classes for the current user (instructor sees taught classes, student sees enrolled classes)"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role == 'instructor':
        # Get classes taught by this instructor
        classes = Class.query.filter_by(instructor_id=user_id).all()
    else:
        # Get classes where user is a member
        memberships = ClassMembership.query.filter_by(student_id=user_id).all()
        class_ids = [m.class_id for m in memberships]
        classes = Class.query.filter(Class.id.in_(class_ids)).all() if class_ids else []
    
    return jsonify({
        'classes': [c.to_dict() for c in classes]
    }), 200


@bp.route('/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class(class_id):
    """Get details of a specific class"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    # Check if user has access to this class
    is_instructor = class_obj.instructor_id == user_id
    is_member = ClassMembership.query.filter_by(class_id=class_id, student_id=user_id).first() is not None
    
    if not (is_instructor or is_member):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({
        'class': class_obj.to_dict(include_members=True),
        'is_instructor': is_instructor
    }), 200


@bp.route('/<int:class_id>', methods=['PUT'])
@jwt_required()
def update_class(class_id):
    """Update class details (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can update this class'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        class_obj.name = data['name']
    if 'description' in data:
        class_obj.description = data['description']
    
    class_obj.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Class updated successfully',
        'class': class_obj.to_dict()
    }), 200


@bp.route('/<int:class_id>', methods=['DELETE'])
@jwt_required()
def delete_class(class_id):
    """Delete a class (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can delete this class'}), 403
    
    db.session.delete(class_obj)
    db.session.commit()
    
    return jsonify({'message': 'Class deleted successfully'}), 200


# ==================== CLASS MEMBERSHIP ====================

@bp.route('/join', methods=['POST'])
@jwt_required()
def join_class():
    """Request to join a class using join code (student only)"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    join_code = data.get('join_code', '').strip().upper()
    
    if not join_code:
        return jsonify({'error': 'Join code is required'}), 400
    
    # Find class by join code
    class_obj = Class.query.filter_by(join_code=join_code).first()
    
    if not class_obj:
        return jsonify({'error': 'Invalid join code'}), 404
    
    # Check if user is the instructor
    if class_obj.instructor_id == user_id:
        return jsonify({'error': 'Instructors cannot join their own class as students'}), 400
    
    # Check if already a member
    existing_membership = ClassMembership.query.filter_by(
        class_id=class_obj.id,
        student_id=user_id
    ).first()
    
    if existing_membership:
        return jsonify({'error': 'You are already a member of this class'}), 400
    
    # Check if there's already a pending request
    existing_pending = ClassJoinRequest.query.filter_by(
        class_id=class_obj.id,
        student_id=user_id,
        status='pending'
    ).first()
    
    if existing_pending:
        return jsonify({'error': 'You already have a pending request for this class'}), 400
    
    # If there's an old rejected request, we can optionally delete it to keep history clean
    # Or we can keep it for audit purposes. For now, we'll keep it but allow new requests.
    # If there's an old accepted request, the student should already be a member (checked above)
    
    # Create join request
    join_request = ClassJoinRequest(
        class_id=class_obj.id,
        student_id=user_id,
        status='pending'
    )
    
    db.session.add(join_request)
    db.session.commit()
    
    return jsonify({
        'message': 'Join request submitted. Waiting for instructor approval.',
        'class': class_obj.to_dict(),
        'request': join_request.to_dict()
    }), 201


@bp.route('/<int:class_id>/members', methods=['GET'])
@jwt_required()
def get_class_members(class_id):
    """Get all members of a class"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    # Check if user has access to this class
    is_instructor = class_obj.instructor_id == user_id
    is_member = ClassMembership.query.filter_by(class_id=class_id, student_id=user_id).first() is not None
    
    if not (is_instructor or is_member):
        return jsonify({'error': 'Access denied'}), 403
    
    memberships = ClassMembership.query.filter_by(class_id=class_id).all()
    
    return jsonify({
        'members': [m.to_dict() for m in memberships],
        'total_count': len(memberships)
    }), 200


@bp.route('/<int:class_id>/members/<int:student_id>', methods=['DELETE'])
@jwt_required()
def remove_member(class_id, student_id):
    """Remove a member from class (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can remove members'}), 403
    
    membership = ClassMembership.query.filter_by(
        class_id=class_id,
        student_id=student_id
    ).first()
    
    if not membership:
        return jsonify({'error': 'Member not found in this class'}), 404
    
    db.session.delete(membership)
    db.session.commit()
    
    return jsonify({'message': 'Member removed successfully'}), 200


# ==================== JOIN REQUESTS ====================

@bp.route('/<int:class_id>/join-requests', methods=['GET'])
@jwt_required()
def get_join_requests(class_id):
    """Get pending join requests for a class (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can view join requests'}), 403
    
    # Get only pending requests
    requests = ClassJoinRequest.query.filter_by(
        class_id=class_id,
        status='pending'
    ).order_by(ClassJoinRequest.requested_at.desc()).all()
    
    return jsonify({
        'requests': [r.to_dict() for r in requests],
        'total_count': len(requests)
    }), 200


@bp.route('/<int:class_id>/join-requests/<int:request_id>/accept', methods=['POST'])
@jwt_required()
def accept_join_request(class_id, request_id):
    """Accept a join request (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can accept join requests'}), 403
    
    join_request = ClassJoinRequest.query.get(request_id)
    
    if not join_request:
        return jsonify({'error': 'Join request not found'}), 404
    
    if join_request.class_id != class_id:
        return jsonify({'error': 'Request does not belong to this class'}), 400
    
    if join_request.status != 'pending':
        return jsonify({'error': 'This request has already been processed'}), 400
    
    # Check if student is already a member
    existing_membership = ClassMembership.query.filter_by(
        class_id=class_id,
        student_id=join_request.student_id
    ).first()
    
    if existing_membership:
        # Delete the request since they're already a member
        db.session.delete(join_request)
        db.session.commit()
        return jsonify({'error': 'Student is already a member of this class'}), 400
    
    # Create membership
    membership = ClassMembership(
        class_id=class_id,
        student_id=join_request.student_id
    )
    
    # Update request status
    join_request.status = 'accepted'
    join_request.responded_at = datetime.utcnow()
    
    db.session.add(membership)
    db.session.commit()
    
    return jsonify({
        'message': 'Join request accepted',
        'membership': membership.to_dict()
    }), 200


@bp.route('/<int:class_id>/join-requests/<int:request_id>/reject', methods=['POST'])
@jwt_required()
def reject_join_request(class_id, request_id):
    """Reject a join request (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can reject join requests'}), 403
    
    join_request = ClassJoinRequest.query.get(request_id)
    
    if not join_request:
        return jsonify({'error': 'Join request not found'}), 404
    
    if join_request.class_id != class_id:
        return jsonify({'error': 'Request does not belong to this class'}), 400
    
    if join_request.status != 'pending':
        return jsonify({'error': 'This request has already been processed'}), 400
    
    # Update request status
    join_request.status = 'rejected'
    join_request.responded_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Join request rejected'
    }), 200


# ==================== WORKOUT ASSIGNMENTS ====================

@bp.route('/<int:class_id>/assign-workout', methods=['POST'])
@jwt_required()
def assign_workout(class_id):
    """Assign a workout to all members of the class (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can assign workouts'}), 403
    
    data = request.get_json()
    
    # Build workout template with exercises
    # Format: { exercises: [{ exercise_id, name, target_sets, target_reps }] }
    workout_template = {
        'exercises': data.get('exercises', [])
    }
    
    assigned_workout = AssignedWorkout(
        class_id=class_id,
        instructor_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        workout_template=workout_template,
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
    )
    
    db.session.add(assigned_workout)
    db.session.commit()
    
    # Create logs for all students in the class
    memberships = ClassMembership.query.filter_by(class_id=class_id).all()
    for membership in memberships:
        student_log = StudentWorkoutLog(
            assigned_workout_id=assigned_workout.id,
            student_id=membership.student_id,
            completed=False
        )
        db.session.add(student_log)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Workout assigned successfully',
        'assigned_workout': assigned_workout.to_dict()
    }), 201


@bp.route('/<int:class_id>/assigned-workouts', methods=['GET'])
@jwt_required()
def get_assigned_workouts(class_id):
    """Get all assigned workouts for a class"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    # Check if user has access to this class
    is_instructor = class_obj.instructor_id == user_id
    is_member = ClassMembership.query.filter_by(class_id=class_id, student_id=user_id).first() is not None
    
    if not (is_instructor or is_member):
        return jsonify({'error': 'Access denied'}), 403
    
    assigned_workouts = AssignedWorkout.query.filter_by(class_id=class_id).order_by(
        AssignedWorkout.assigned_date.desc()
    ).all()
    
    # If student, include their completion status for each workout
    workouts_data = []
    for aw in assigned_workouts:
        workout_dict = aw.to_dict()
        if not is_instructor:
            # Add student's personal log info
            student_log = StudentWorkoutLog.query.filter_by(
                assigned_workout_id=aw.id,
                student_id=user_id
            ).first()
            workout_dict['my_log'] = student_log.to_dict() if student_log else None
        workouts_data.append(workout_dict)
    
    return jsonify({
        'assigned_workouts': workouts_data,
        'is_instructor': is_instructor
    }), 200


@bp.route('/<int:class_id>/assigned-workouts/<int:workout_id>', methods=['GET'])
@jwt_required()
def get_assigned_workout(class_id, workout_id):
    """Get details of a specific assigned workout"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    # Check if user has access to this class
    is_instructor = class_obj.instructor_id == user_id
    is_member = ClassMembership.query.filter_by(class_id=class_id, student_id=user_id).first() is not None
    
    if not (is_instructor or is_member):
        return jsonify({'error': 'Access denied'}), 403
    
    assigned_workout = AssignedWorkout.query.filter_by(id=workout_id, class_id=class_id).first()
    
    if not assigned_workout:
        return jsonify({'error': 'Assigned workout not found'}), 404
    
    workout_dict = assigned_workout.to_dict(include_logs=is_instructor)
    
    # If student, add their personal log
    if not is_instructor:
        student_log = StudentWorkoutLog.query.filter_by(
            assigned_workout_id=workout_id,
            student_id=user_id
        ).first()
        workout_dict['my_log'] = student_log.to_dict() if student_log else None
    
    return jsonify({
        'assigned_workout': workout_dict,
        'is_instructor': is_instructor
    }), 200


@bp.route('/<int:class_id>/assigned-workouts/<int:workout_id>', methods=['PUT'])
@jwt_required()
def update_assigned_workout(class_id, workout_id):
    """Update an assigned workout (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can update assigned workouts'}), 403
    
    assigned_workout = AssignedWorkout.query.filter_by(id=workout_id, class_id=class_id).first()
    
    if not assigned_workout:
        return jsonify({'error': 'Assigned workout not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        assigned_workout.name = data['name']
    if 'description' in data:
        assigned_workout.description = data.get('description', '')
    if 'due_date' in data:
        assigned_workout.due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
    if 'exercises' in data:
        # Update workout template with exercises
        workout_template = {
            'exercises': data.get('exercises', [])
        }
        assigned_workout.workout_template = workout_template
    
    db.session.commit()
    
    return jsonify({
        'message': 'Assigned workout updated successfully',
        'assigned_workout': assigned_workout.to_dict()
    }), 200


@bp.route('/<int:class_id>/assigned-workouts/<int:workout_id>', methods=['DELETE'])
@jwt_required()
def delete_assigned_workout(class_id, workout_id):
    """Delete an assigned workout (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can delete assigned workouts'}), 403
    
    assigned_workout = AssignedWorkout.query.filter_by(id=workout_id, class_id=class_id).first()
    
    if not assigned_workout:
        return jsonify({'error': 'Assigned workout not found'}), 404
    
    db.session.delete(assigned_workout)
    db.session.commit()
    
    return jsonify({'message': 'Assigned workout deleted successfully'}), 200


# ==================== STUDENT WORKOUT COMPLETION ====================

@bp.route('/<int:class_id>/assigned-workouts/<int:workout_id>/complete', methods=['POST'])
@jwt_required()
def complete_workout(class_id, workout_id):
    """Mark an assigned workout as complete and log performance (student)"""
    user_id = int(get_jwt_identity())
    
    # Verify student is a member of this class
    membership = ClassMembership.query.filter_by(class_id=class_id, student_id=user_id).first()
    if not membership:
        return jsonify({'error': 'You are not a member of this class'}), 403
    
    # Get the assigned workout
    assigned_workout = AssignedWorkout.query.filter_by(id=workout_id, class_id=class_id).first()
    if not assigned_workout:
        return jsonify({'error': 'Assigned workout not found'}), 404
    
    data = request.get_json()
    
    # Create a full workout entry in the workouts table
    workout_data = data.get('workout_data')
    if workout_data:
        from models.workout import WorkoutExercise, ExerciseSet
        
        workout = Workout(
            user_id=user_id,
            name=assigned_workout.name,
            duration=workout_data.get('duration'),
            total_volume=workout_data.get('total_volume'),
            calories_burned=workout_data.get('calories_burned'),
            notes=workout_data.get('notes'),
            date=datetime.utcnow()
        )
        db.session.add(workout)
        db.session.flush()  # Get workout ID
        
        # Add exercises
        if workout_data.get('exercises'):
            for exercise_data in workout_data['exercises']:
                workout_exercise = WorkoutExercise(
                    workout_id=workout.id,
                    exercise_id=exercise_data['exercise_id'],
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
        
        workout_id_ref = workout.id
    else:
        workout_id_ref = None
    
    # Get or create student log
    student_log = StudentWorkoutLog.query.filter_by(
        assigned_workout_id=workout_id,
        student_id=user_id
    ).first()
    
    if not student_log:
        student_log = StudentWorkoutLog(
            assigned_workout_id=workout_id,
            student_id=user_id
        )
        db.session.add(student_log)
    
    # Update log with completion data
    student_log.completed = True
    student_log.completed_at = datetime.utcnow()
    student_log.duration = data.get('duration')
    student_log.total_volume = data.get('total_volume')
    student_log.calories_burned = data.get('calories_burned')
    student_log.notes = data.get('notes', '')
    student_log.workout_id = workout_id_ref
    
    db.session.commit()
    
    return jsonify({
        'message': 'Workout marked as complete',
        'log': student_log.to_dict()
    }), 200


@bp.route('/<int:class_id>/assigned-workouts/<int:workout_id>/my-log', methods=['GET'])
@jwt_required()
def get_my_workout_log(class_id, workout_id):
    """Get student's log for a specific assigned workout"""
    user_id = int(get_jwt_identity())
    
    # Verify student is a member of this class
    membership = ClassMembership.query.filter_by(class_id=class_id, student_id=user_id).first()
    if not membership:
        return jsonify({'error': 'You are not a member of this class'}), 403
    
    student_log = StudentWorkoutLog.query.filter_by(
        assigned_workout_id=workout_id,
        student_id=user_id
    ).first()
    
    if not student_log:
        return jsonify({'error': 'Log not found'}), 404
    
    return jsonify({
        'log': student_log.to_dict()
    }), 200


# ==================== LEADERBOARD & STATS ====================

@bp.route('/<int:class_id>/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard(class_id):
    """Get leaderboard stats for all members of the class"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    # Check if user has access to this class
    is_instructor = class_obj.instructor_id == user_id
    is_member = ClassMembership.query.filter_by(class_id=class_id, student_id=user_id).first() is not None
    
    if not (is_instructor or is_member):
        return jsonify({'error': 'Access denied'}), 403
    
    # Get all members
    memberships = ClassMembership.query.filter_by(class_id=class_id).all()
    
    leaderboard = []
    for membership in memberships:
        student = membership.student
        
        # Get student's logs for this class
        logs = StudentWorkoutLog.query.join(AssignedWorkout).filter(
            AssignedWorkout.class_id == class_id,
            StudentWorkoutLog.student_id == student.id,
            StudentWorkoutLog.completed == True
        ).all()
        
        # Calculate stats
        total_workouts = len(logs)
        total_duration = sum(log.duration or 0 for log in logs)
        total_volume = sum(log.total_volume or 0 for log in logs)
        total_calories = sum(log.calories_burned or 0 for log in logs)
        
        # Get completion rate
        total_assigned = AssignedWorkout.query.filter_by(class_id=class_id).count()
        completion_rate = (total_workouts / total_assigned * 100) if total_assigned > 0 else 0
        
        leaderboard.append({
            'student': student.to_dict(),
            'stats': {
                'total_workouts': total_workouts,
                'total_duration': total_duration,
                'total_volume': total_volume,
                'total_calories': total_calories,
                'completion_rate': round(completion_rate, 1)
            }
        })
    
    # Sort by total workouts completed (descending)
    leaderboard.sort(key=lambda x: x['stats']['total_workouts'], reverse=True)
    
    # Add rank
    for i, entry in enumerate(leaderboard):
        entry['rank'] = i + 1
    
    return jsonify({
        'leaderboard': leaderboard,
        'total_members': len(leaderboard),
        'is_instructor': is_instructor
    }), 200


@bp.route('/<int:class_id>/stats', methods=['GET'])
@jwt_required()
def get_class_stats(class_id):
    """Get overall statistics for the class (instructor only)"""
    user_id = int(get_jwt_identity())
    class_obj = Class.query.get(class_id)
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    if class_obj.instructor_id != user_id:
        return jsonify({'error': 'Only the instructor can view class stats'}), 403
    
    # Get all assigned workouts
    assigned_workouts = AssignedWorkout.query.filter_by(class_id=class_id).all()
    
    # Get all completed logs
    completed_logs = StudentWorkoutLog.query.join(AssignedWorkout).filter(
        AssignedWorkout.class_id == class_id,
        StudentWorkoutLog.completed == True
    ).all()
    
    # Calculate stats
    total_assigned = len(assigned_workouts)
    total_completions = len(completed_logs)
    total_members = class_obj.get_member_count()
    
    avg_completion_rate = 0
    if total_assigned > 0 and total_members > 0:
        avg_completion_rate = (total_completions / (total_assigned * total_members)) * 100
    
    # Get most active student
    student_completion_counts = {}
    for log in completed_logs:
        student_completion_counts[log.student_id] = student_completion_counts.get(log.student_id, 0) + 1
    
    most_active_student = None
    if student_completion_counts:
        most_active_student_id = max(student_completion_counts, key=student_completion_counts.get)
        most_active_student = User.query.get(most_active_student_id)
    
    return jsonify({
        'stats': {
            'total_members': total_members,
            'total_assigned_workouts': total_assigned,
            'total_completions': total_completions,
            'average_completion_rate': round(avg_completion_rate, 1),
            'most_active_student': most_active_student.to_dict() if most_active_student else None,
            'most_active_student_completions': max(student_completion_counts.values()) if student_completion_counts else 0
        }
    }), 200

