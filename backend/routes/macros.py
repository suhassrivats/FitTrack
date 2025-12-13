from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.macros import MacroGoal, Meal, DailyIntake
from datetime import datetime, date, timedelta

bp = Blueprint('macros', __name__, url_prefix='/api/macros')

def calculate_daily_intake(user_id, target_date):
    """Calculate and update daily intake for a given date"""
    meals = Meal.query.filter_by(user_id=user_id, date=target_date).all()
    
    total_calories = sum(meal.calories for meal in meals)
    total_protein = sum(meal.protein for meal in meals)
    total_carbs = sum(meal.carbs for meal in meals)
    total_fats = sum(meal.fats for meal in meals)
    
    # Get or create daily intake
    daily_intake = DailyIntake.query.filter_by(user_id=user_id, date=target_date).first()
    if not daily_intake:
        daily_intake = DailyIntake(
            user_id=user_id,
            date=target_date,
            total_calories=total_calories,
            total_protein=total_protein,
            total_carbs=total_carbs,
            total_fats=total_fats
        )
        db.session.add(daily_intake)
    else:
        daily_intake.total_calories = total_calories
        daily_intake.total_protein = total_protein
        daily_intake.total_carbs = total_carbs
        daily_intake.total_fats = total_fats
        daily_intake.updated_at = datetime.utcnow()
    
    db.session.commit()
    return daily_intake

@bp.route('/goals', methods=['GET'])
@jwt_required()
def get_goals():
    """Get user's active macro goals"""
    user_id = int(get_jwt_identity())
    goal = MacroGoal.query.filter_by(user_id=user_id, is_active=True).first()
    
    if not goal:
        # Create default goal
        goal = MacroGoal(
            user_id=user_id,
            plan_name='High Protein',
            calories=2450,
            protein=245,
            carbs=215,
            fats=68
        )
        db.session.add(goal)
        db.session.commit()
    
    return jsonify({'goal': goal.to_dict()}), 200

@bp.route('/goals', methods=['PUT'])
@jwt_required()
def update_goals():
    """Update user's macro goals"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    goal = MacroGoal.query.filter_by(user_id=user_id, is_active=True).first()
    
    if not goal:
        goal = MacroGoal(user_id=user_id)
        db.session.add(goal)
    
    goal.plan_name = data.get('plan_name', goal.plan_name)
    goal.calories = data.get('calories', goal.calories)
    goal.protein = data.get('protein', goal.protein)
    goal.carbs = data.get('carbs', goal.carbs)
    goal.fats = data.get('fats', goal.fats)
    goal.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get macro dashboard data for a specific date"""
    user_id = int(get_jwt_identity())
    date_str = request.args.get('date')
    
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            target_date = date.today()
    else:
        target_date = date.today()
    
    # Get active goal
    goal = MacroGoal.query.filter_by(user_id=user_id, is_active=True).first()
    if not goal:
        goal = MacroGoal(
            user_id=user_id,
            plan_name='High Protein',
            calories=2450,
            protein=245,
            carbs=215,
            fats=68
        )
        db.session.add(goal)
        db.session.commit()
    
    # Get daily intake
    daily_intake = calculate_daily_intake(user_id, target_date)
    
    # Get meals for the date
    meals = Meal.query.filter_by(user_id=user_id, date=target_date).order_by(Meal.created_at).all()
    
    # Calculate adherence
    protein_met = daily_intake.total_protein >= goal.protein * 0.9
    carbs_met = daily_intake.total_carbs >= goal.carbs * 0.8
    fats_met = daily_intake.total_fats >= goal.fats * 0.9
    
    adherence_status = 'On Track' if (protein_met and carbs_met and fats_met) else 'Needs Attention'
    
    # Get last 7 days for trends
    seven_days_ago = target_date - timedelta(days=6)
    trend_intakes = DailyIntake.query.filter(
        DailyIntake.user_id == user_id,
        DailyIntake.date >= seven_days_ago,
        DailyIntake.date <= target_date
    ).order_by(DailyIntake.date).all()
    
    trends = []
    for i in range(7):
        check_date = seven_days_ago + timedelta(days=i)
        intake = next((d for d in trend_intakes if d.date == check_date), None)
        if intake and goal:
            protein_met_day = intake.total_protein >= goal.protein * 0.9
            carbs_met_day = intake.total_carbs >= goal.carbs * 0.8
            fats_met_day = intake.total_fats >= goal.fats * 0.9
            if protein_met_day and carbs_met_day and fats_met_day:
                status = 'met'
            elif intake.total_calories > goal.calories * 1.1:
                status = 'over'
            else:
                status = 'under'
        else:
            status = 'none'
        trends.append({
            'date': check_date.isoformat(),
            'status': status
        })
    
    return jsonify({
        'date': target_date.isoformat(),
        'goal': goal.to_dict(),
        'daily_intake': daily_intake.to_dict(),
        'meals': [meal.to_dict() for meal in meals],
        'adherence': {
            'status': adherence_status,
            'protein': {'met': protein_met, 'status': 'Met Goal' if protein_met else 'Low Intake'},
            'carbs': {'met': carbs_met, 'status': 'Met Goal' if carbs_met else 'Low Intake'},
            'fats': {'met': fats_met, 'status': 'Met Goal' if fats_met else 'Low Intake'}
        },
        'trends': trends
    }), 200

@bp.route('/meals', methods=['GET'])
@jwt_required()
def get_meals():
    """Get meals for a specific date"""
    user_id = int(get_jwt_identity())
    date_str = request.args.get('date')
    
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            target_date = date.today()
    else:
        target_date = date.today()
    
    meals = Meal.query.filter_by(user_id=user_id, date=target_date).order_by(Meal.created_at).all()
    
    return jsonify({
        'meals': [meal.to_dict() for meal in meals]
    }), 200

@bp.route('/meals', methods=['POST'])
@jwt_required()
def create_meal():
    """Create a new meal entry"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    date_str = data.get('date')
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            target_date = date.today()
    else:
        target_date = date.today()
    
    meal = Meal(
        user_id=user_id,
        date=target_date,
        meal_type=data.get('meal_type', 'snack'),
        name=data.get('name', ''),
        description=data.get('description'),
        calories=data.get('calories', 0),
        protein=data.get('protein', 0),
        carbs=data.get('carbs', 0),
        fats=data.get('fats', 0)
    )
    
    db.session.add(meal)
    db.session.commit()
    
    # Recalculate daily intake
    calculate_daily_intake(user_id, target_date)
    
    return jsonify({'meal': meal.to_dict()}), 201

@bp.route('/meals/<int:meal_id>', methods=['PUT'])
@jwt_required()
def update_meal(meal_id):
    """Update a meal entry"""
    user_id = int(get_jwt_identity())
    meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first()
    
    if not meal:
        return jsonify({'error': 'Meal not found'}), 404
    
    data = request.get_json()
    meal.meal_type = data.get('meal_type', meal.meal_type)
    meal.name = data.get('name', meal.name)
    meal.description = data.get('description', meal.description)
    meal.calories = data.get('calories', meal.calories)
    meal.protein = data.get('protein', meal.protein)
    meal.carbs = data.get('carbs', meal.carbs)
    meal.fats = data.get('fats', meal.fats)
    meal.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    # Recalculate daily intake
    calculate_daily_intake(user_id, meal.date)
    
    return jsonify({'meal': meal.to_dict()}), 200

@bp.route('/meals/<int:meal_id>', methods=['DELETE'])
@jwt_required()
def delete_meal(meal_id):
    """Delete a meal entry"""
    user_id = int(get_jwt_identity())
    meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first()
    
    if not meal:
        return jsonify({'error': 'Meal not found'}), 404
    
    meal_date = meal.date
    db.session.delete(meal)
    db.session.commit()
    
    # Recalculate daily intake
    calculate_daily_intake(user_id, meal_date)
    
    return jsonify({'message': 'Meal deleted successfully'}), 200

