from models import db
from datetime import datetime

class Workout(db.Model):
    __tablename__ = 'workouts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    duration = db.Column(db.Integer)  # in minutes
    total_volume = db.Column(db.Float)  # total weight lifted in kg
    calories_burned = db.Column(db.Integer)
    notes = db.Column(db.Text)
    date = db.Column(db.Date, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    exercises = db.relationship('WorkoutExercise', backref='workout', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'duration': self.duration,
            'total_volume': self.total_volume,
            'calories_burned': self.calories_burned,
            'notes': self.notes,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'exercises': [ex.to_dict() for ex in self.exercises]
        }

class Exercise(db.Model):
    __tablename__ = 'exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # e.g., 'strength', 'cardio'
    muscle_groups = db.Column(db.String(255))  # comma-separated
    equipment = db.Column(db.String(120))
    instructions = db.Column(db.Text)
    video_url = db.Column(db.String(255))
    image_url = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'muscle_groups': self.muscle_groups.split(',') if self.muscle_groups else [],
            'equipment': self.equipment,
            'instructions': self.instructions,
            'video_url': self.video_url,
            'image_url': self.image_url
        }

class WorkoutExercise(db.Model):
    __tablename__ = 'workout_exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=True)  # Nullable for custom exercises
    custom_exercise_name = db.Column(db.String(120), nullable=True)  # For custom exercises not in database
    order = db.Column(db.Integer, default=0)
    
    # Relationships
    exercise = db.relationship('Exercise', backref='workout_exercises')
    sets = db.relationship('ExerciseSet', backref='workout_exercise', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'workout_id': self.workout_id,
            'exercise': self.exercise.to_dict() if self.exercise else None,
            'custom_exercise_name': self.custom_exercise_name,
            'order': self.order,
            'sets': [s.to_dict() for s in self.sets]
        }

class ExerciseSet(db.Model):
    __tablename__ = 'exercise_sets'
    
    id = db.Column(db.Integer, primary_key=True)
    workout_exercise_id = db.Column(db.Integer, db.ForeignKey('workout_exercises.id'), nullable=False)
    set_number = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float)  # in kg
    reps = db.Column(db.Integer)
    duration = db.Column(db.Integer)  # in seconds for timed exercises
    completed = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'set_number': self.set_number,
            'weight': self.weight,
            'reps': self.reps,
            'duration': self.duration,
            'completed': self.completed
        }

class Routine(db.Model):
    __tablename__ = 'routines'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    exercise_count = db.Column(db.Integer, default=0)
    exercise_ids = db.Column(db.String(500))  # Comma-separated exercise IDs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='routines')
    
    def get_exercises(self):
        """Get list of exercises in this routine"""
        if not self.exercise_ids:
            return []
        exercise_ids = [int(id) for id in self.exercise_ids.split(',')]
        exercises = Exercise.query.filter(Exercise.id.in_(exercise_ids)).all()
        # Maintain order from exercise_ids
        exercise_dict = {ex.id: ex for ex in exercises}
        return [exercise_dict[id] for id in exercise_ids if id in exercise_dict]
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'exercise_count': self.exercise_count,
            'exercise_ids': [int(id) for id in self.exercise_ids.split(',')] if self.exercise_ids else [],
            'exercises': [ex.to_dict() for ex in self.get_exercises()],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

