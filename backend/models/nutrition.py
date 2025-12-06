from models import db
from datetime import datetime

class Meal(db.Model):
    __tablename__ = 'meals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    meal_type = db.Column(db.String(50))  # breakfast, lunch, dinner, snack
    date = db.Column(db.Date, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    foods = db.relationship('MealFood', backref='meal', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'meal_type': self.meal_type,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'foods': [f.to_dict() for f in self.foods],
            'totals': self.calculate_totals()
        }
    
    def calculate_totals(self):
        totals = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0
        }
        for meal_food in self.foods:
            if meal_food.food:
                totals['calories'] += meal_food.food.calories * meal_food.servings
                totals['protein'] += meal_food.food.protein * meal_food.servings
                totals['carbs'] += meal_food.food.carbs * meal_food.servings
                totals['fat'] += meal_food.food.fat * meal_food.servings
        return totals

class Food(db.Model):
    __tablename__ = 'foods'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    calories = db.Column(db.Float, nullable=False)  # per serving
    protein = db.Column(db.Float, nullable=False)  # grams
    carbs = db.Column(db.Float, nullable=False)  # grams
    fat = db.Column(db.Float, nullable=False)  # grams
    serving_size = db.Column(db.String(50))
    image_url = db.Column(db.String(255))
    tags = db.Column(db.String(255))  # comma-separated: high-protein, low-carb, etc.
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'serving_size': self.serving_size,
            'image_url': self.image_url,
            'tags': self.tags.split(',') if self.tags else []
        }

class MealFood(db.Model):
    __tablename__ = 'meal_foods'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    food_id = db.Column(db.Integer, db.ForeignKey('foods.id'), nullable=False)
    servings = db.Column(db.Float, default=1.0)
    
    # Relationships
    food = db.relationship('Food', backref='meal_foods')
    
    def to_dict(self):
        return {
            'id': self.id,
            'meal_id': self.meal_id,
            'food': self.food.to_dict() if self.food else None,
            'servings': self.servings
        }

class NutritionGoal(db.Model):
    __tablename__ = 'nutrition_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    daily_calories = db.Column(db.Integer, default=2400)
    daily_protein = db.Column(db.Float, default=160)
    daily_carbs = db.Column(db.Float, default=300)
    daily_fat = db.Column(db.Float, default=80)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref='nutrition_goal', uselist=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'daily_calories': self.daily_calories,
            'daily_protein': self.daily_protein,
            'daily_carbs': self.daily_carbs,
            'daily_fat': self.daily_fat,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

