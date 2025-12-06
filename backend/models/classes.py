from models import db
from datetime import datetime
import secrets
import string

class Class(db.Model):
    __tablename__ = 'classes'
    
    id = db.Column(db.Integer, primary_key=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    join_code = db.Column(db.String(10), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    instructor = db.relationship('User', backref='classes_taught', foreign_keys=[instructor_id])
    memberships = db.relationship('ClassMembership', backref='class_', lazy=True, cascade='all, delete-orphan')
    assigned_workouts = db.relationship('AssignedWorkout', backref='class_', lazy=True, cascade='all, delete-orphan')
    
    def generate_join_code(self):
        """Generate a unique 8-character join code"""
        characters = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(characters) for _ in range(8))
            # Check if code already exists
            if not Class.query.filter_by(join_code=code).first():
                return code
    
    def get_members(self):
        """Get all members of this class"""
        from models.user import User
        member_ids = [m.student_id for m in self.memberships]
        return User.query.filter(User.id.in_(member_ids)).all()
    
    def get_member_count(self):
        """Get count of members in this class"""
        return len(self.memberships)
    
    def to_dict(self, include_members=False):
        result = {
            'id': self.id,
            'instructor_id': self.instructor_id,
            'instructor': self.instructor.to_dict() if self.instructor else None,
            'name': self.name,
            'description': self.description,
            'join_code': self.join_code,
            'member_count': self.get_member_count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_members:
            result['members'] = [m.to_dict() for m in self.get_members()]
        
        return result


class ClassMembership(db.Model):
    __tablename__ = 'class_memberships'
    
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student = db.relationship('User', backref='class_memberships', foreign_keys=[student_id])
    
    # Unique constraint: a student can only join a class once
    __table_args__ = (db.UniqueConstraint('class_id', 'student_id', name='unique_class_membership'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'class_id': self.class_id,
            'student_id': self.student_id,
            'student': self.student.to_dict() if self.student else None,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None
        }


class AssignedWorkout(db.Model):
    __tablename__ = 'assigned_workouts'
    
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    workout_template = db.Column(db.JSON)  # Stores the workout structure (exercises, sets, reps, etc.)
    assigned_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    instructor = db.relationship('User', backref='assigned_workouts', foreign_keys=[instructor_id])
    student_logs = db.relationship('StudentWorkoutLog', backref='assigned_workout', lazy=True, cascade='all, delete-orphan')
    
    def get_completion_stats(self):
        """Get completion statistics for this assignment"""
        class_obj = Class.query.get(self.class_id)
        total_students = class_obj.get_member_count() if class_obj else 0
        completed_count = len([log for log in self.student_logs if log.completed])
        
        return {
            'total_students': total_students,
            'completed_count': completed_count,
            'completion_rate': (completed_count / total_students * 100) if total_students > 0 else 0
        }
    
    def to_dict(self, include_logs=False):
        result = {
            'id': self.id,
            'class_id': self.class_id,
            'instructor_id': self.instructor_id,
            'instructor': self.instructor.to_dict() if self.instructor else None,
            'name': self.name,
            'description': self.description,
            'workout_template': self.workout_template,
            'assigned_date': self.assigned_date.isoformat() if self.assigned_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completion_stats': self.get_completion_stats()
        }
        
        if include_logs:
            result['student_logs'] = [log.to_dict() for log in self.student_logs]
        
        return result


class StudentWorkoutLog(db.Model):
    __tablename__ = 'student_workout_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    assigned_workout_id = db.Column(db.Integer, db.ForeignKey('assigned_workouts.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.id'))  # Reference to actual workout logged
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    
    # Performance metrics
    duration = db.Column(db.Integer)  # in minutes
    total_volume = db.Column(db.Float)  # total weight lifted in kg
    calories_burned = db.Column(db.Integer)
    notes = db.Column(db.Text)
    
    # Relationships
    student = db.relationship('User', backref='workout_logs', foreign_keys=[student_id])
    workout = db.relationship('Workout', backref='student_logs', foreign_keys=[workout_id])
    
    # Unique constraint: a student can only have one log per assigned workout
    __table_args__ = (db.UniqueConstraint('assigned_workout_id', 'student_id', name='unique_student_workout_log'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'assigned_workout_id': self.assigned_workout_id,
            'student_id': self.student_id,
            'student': self.student.to_dict() if self.student else None,
            'workout_id': self.workout_id,
            'workout': self.workout.to_dict() if self.workout else None,
            'completed': self.completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'duration': self.duration,
            'total_volume': self.total_volume,
            'calories_burned': self.calories_burned,
            'notes': self.notes
        }

