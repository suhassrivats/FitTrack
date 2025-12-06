from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.nutrition import Meal, Food, MealFood, NutritionGoal
from datetime import datetime, timedelta

bp = Blueprint('nutrition', __name__, url_prefix='/api/nutrition')

@bp.route('/meals', methods=['GET'])
@jwt_required()
def get_meals():
    """Get all meals for current user"""
    user_id = int(get_jwt_identity())
    
    # Optional date filter
    date_str = request.args.get('date')
    
    query = Meal.query.filter_by(user_id=user_id)
    
    if date_str:
        date = datetime.fromisoformat(date_str).date()
        query = query.filter(Meal.date == date)
    
    meals = query.order_by(Meal.date.desc(), Meal.created_at.desc()).all()
    
    return jsonify({
        'meals': [m.to_dict() for m in meals]
    }), 200

@bp.route('/meals', methods=['POST'])
@jwt_required()
def create_meal():
    """Create a new meal"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    meal = Meal(
        user_id=user_id,
        name=data['name'],
        meal_type=data.get('meal_type'),
        date=datetime.fromisoformat(data['date']).date() if data.get('date') else datetime.utcnow().date()
    )
    
    db.session.add(meal)
    db.session.commit()
    
    # Add foods if provided
    if data.get('foods'):
        for food_data in data['foods']:
            meal_food = MealFood(
                meal_id=meal.id,
                food_id=food_data['food_id'],
                servings=food_data.get('servings', 1.0)
            )
            db.session.add(meal_food)
        
        db.session.commit()
    
    return jsonify({
        'message': 'Meal created successfully',
        'meal': meal.to_dict()
    }), 201

@bp.route('/meals/<int:meal_id>', methods=['DELETE'])
@jwt_required()
def delete_meal(meal_id):
    """Delete a meal"""
    user_id = int(get_jwt_identity())
    meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first()
    
    if not meal:
        return jsonify({'error': 'Meal not found'}), 404
    
    db.session.delete(meal)
    db.session.commit()
    
    return jsonify({'message': 'Meal deleted successfully'}), 200

@bp.route('/foods', methods=['GET'])
def get_foods():
    """Get all foods"""
    search = request.args.get('search')
    tags = request.args.get('tags')
    
    query = Food.query
    
    if search:
        query = query.filter(Food.name.ilike(f'%{search}%'))
    
    if tags:
        tag_list = tags.split(',')
        for tag in tag_list:
            query = query.filter(Food.tags.like(f'%{tag}%'))
    
    foods = query.all()
    
    return jsonify({
        'foods': [f.to_dict() for f in foods]
    }), 200

@bp.route('/foods/<int:food_id>', methods=['GET'])
def get_food(food_id):
    """Get specific food"""
    food = Food.query.get(food_id)
    
    if not food:
        return jsonify({'error': 'Food not found'}), 404
    
    return jsonify({'food': food.to_dict()}), 200

@bp.route('/foods', methods=['POST'])
def create_food():
    """Create a new food item"""
    data = request.get_json()
    
    food = Food(
        name=data['name'],
        description=data.get('description'),
        calories=data['calories'],
        protein=data['protein'],
        carbs=data['carbs'],
        fat=data['fat'],
        serving_size=data.get('serving_size'),
        image_url=data.get('image_url'),
        tags=','.join(data['tags']) if data.get('tags') else None
    )
    
    db.session.add(food)
    db.session.commit()
    
    return jsonify({
        'message': 'Food created successfully',
        'food': food.to_dict()
    }), 201

@bp.route('/goals', methods=['GET'])
@jwt_required()
def get_nutrition_goals():
    """Get nutrition goals for current user"""
    user_id = int(get_jwt_identity())
    goal = NutritionGoal.query.filter_by(user_id=user_id).first()
    
    if not goal:
        # Create default goal if doesn't exist
        goal = NutritionGoal(user_id=user_id)
        db.session.add(goal)
        db.session.commit()
    
    return jsonify({'goals': goal.to_dict()}), 200

@bp.route('/goals', methods=['PUT'])
@jwt_required()
def update_nutrition_goals():
    """Update nutrition goals"""
    user_id = int(get_jwt_identity())
    goal = NutritionGoal.query.filter_by(user_id=user_id).first()
    
    if not goal:
        goal = NutritionGoal(user_id=user_id)
        db.session.add(goal)
    
    data = request.get_json()
    
    if 'daily_calories' in data:
        goal.daily_calories = data['daily_calories']
    if 'daily_protein' in data:
        goal.daily_protein = data['daily_protein']
    if 'daily_carbs' in data:
        goal.daily_carbs = data['daily_carbs']
    if 'daily_fat' in data:
        goal.daily_fat = data['daily_fat']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Nutrition goals updated successfully',
        'goals': goal.to_dict()
    }), 200

@bp.route('/daily-summary', methods=['GET'])
@jwt_required()
def get_daily_summary():
    """Get daily nutrition summary"""
    user_id = int(get_jwt_identity())
    date_str = request.args.get('date', datetime.utcnow().date().isoformat())
    date = datetime.fromisoformat(date_str).date()
    
    # Get today's meals
    meals = Meal.query.filter_by(user_id=user_id, date=date).all()
    
    # Calculate totals
    totals = {
        'calories': 0,
        'protein': 0,
        'carbs': 0,
        'fat': 0
    }
    
    for meal in meals:
        meal_totals = meal.calculate_totals()
        totals['calories'] += meal_totals['calories']
        totals['protein'] += meal_totals['protein']
        totals['carbs'] += meal_totals['carbs']
        totals['fat'] += meal_totals['fat']
    
    # Get goals
    goal = NutritionGoal.query.filter_by(user_id=user_id).first()
    
    return jsonify({
        'date': date.isoformat(),
        'consumed': totals,
        'goals': goal.to_dict() if goal else None,
        'remaining': {
            'calories': (goal.daily_calories - totals['calories']) if goal else 0,
            'protein': (goal.daily_protein - totals['protein']) if goal else 0,
            'carbs': (goal.daily_carbs - totals['carbs']) if goal else 0,
            'fat': (goal.daily_fat - totals['fat']) if goal else 0
        },
        'meals': [m.to_dict() for m in meals]
    }), 200

