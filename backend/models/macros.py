from models import db
from datetime import datetime, date

class MacroGoal(db.Model):
    """User's macro goals/plan"""
    __tablename__ = 'macro_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_name = db.Column(db.String(100), default='High Protein')
    calories = db.Column(db.Integer, nullable=False, default=2000)
    protein = db.Column(db.Float, nullable=False, default=150)  # in grams
    carbs = db.Column(db.Float, nullable=False, default=200)  # in grams
    fats = db.Column(db.Float, nullable=False, default=65)  # in grams
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref='macro_goals')
    
    def to_dict(self):
        return {
            'id': self.id,
            'plan_name': self.plan_name,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Meal(db.Model):
    """Individual meal entry"""
    __tablename__ = 'meals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    meal_type = db.Column(db.String(20), nullable=False)  # 'breakfast', 'lunch', 'dinner', 'snack'
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))
    calories = db.Column(db.Float, nullable=False, default=0)
    protein = db.Column(db.Float, nullable=False, default=0)  # in grams
    carbs = db.Column(db.Float, nullable=False, default=0)  # in grams
    fats = db.Column(db.Float, nullable=False, default=0)  # in grams
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref='meals')
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'meal_type': self.meal_type,
            'name': self.name,
            'description': self.description,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DailyIntake(db.Model):
    """Daily macro intake summary (calculated from meals)"""
    __tablename__ = 'daily_intakes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    total_calories = db.Column(db.Float, default=0)
    total_protein = db.Column(db.Float, default=0)  # in grams
    total_carbs = db.Column(db.Float, default=0)  # in grams
    total_fats = db.Column(db.Float, default=0)  # in grams
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref='daily_intakes')
    
    # Unique constraint on user_id and date
    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='unique_user_daily_intake'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'total_calories': self.total_calories,
            'total_protein': self.total_protein,
            'total_carbs': self.total_carbs,
            'total_fats': self.total_fats,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

