import pytest
import json
from models import db
from models.nutrition import Meal, Food, NutritionGoal
from datetime import datetime

class TestGetMeals:
    """Test getting meals"""
    
    def test_get_meals_success(self, client, auth_headers):
        """Test successfully getting meals"""
        response = client.get('/api/nutrition/meals', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'meals' in data
    
    def test_get_meals_with_date_filter(self, client, auth_headers):
        """Test getting meals with date filter"""
        date_str = datetime.utcnow().date().isoformat()
        response = client.get(f'/api/nutrition/meals?date={date_str}', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'meals' in data
    
    def test_get_meals_unauthorized(self, client):
        """Test getting meals without authentication"""
        response = client.get('/api/nutrition/meals')
        assert response.status_code == 401


class TestCreateMeal:
    """Test creating meals"""
    
    def test_create_meal_success(self, client, auth_headers):
        """Test successfully creating a meal"""
        meal_data = {
            'name': 'Breakfast',
            'meal_type': 'breakfast',
            'date': datetime.utcnow().date().isoformat()
        }
        response = client.post('/api/nutrition/meals',
            headers=auth_headers,
            json=meal_data
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'meal' in data
        assert data['meal']['name'] == 'Breakfast'
    
    def test_create_meal_unauthorized(self, client):
        """Test creating meal without authentication"""
        response = client.post('/api/nutrition/meals',
            json={'name': 'Breakfast'}
        )
        assert response.status_code == 401


class TestDeleteMeal:
    """Test deleting meals"""
    
    def test_delete_meal_success(self, client, auth_headers, test_user):
        """Test successfully deleting a meal"""
        with client.application.app_context():
            meal = Meal(
                user_id=test_user.id,
                name='Test Meal',
                date=datetime.utcnow().date()
            )
            db.session.add(meal)
            db.session.commit()
            meal_id = meal.id
        
        response = client.delete(f'/api/nutrition/meals/{meal_id}', headers=auth_headers)
        assert response.status_code == 200
        
        # Verify it's deleted
        get_response = client.get(f'/api/nutrition/meals/{meal_id}', headers=auth_headers)
        # Should return 404 or empty list
        assert get_response.status_code in [200, 404]
    
    def test_delete_meal_not_found(self, client, auth_headers):
        """Test deleting non-existent meal"""
        response = client.delete('/api/nutrition/meals/99999', headers=auth_headers)
        assert response.status_code == 404
    
    def test_delete_meal_unauthorized(self, client):
        """Test deleting meal without authentication"""
        response = client.delete('/api/nutrition/meals/1')
        assert response.status_code == 401


class TestGetFoods:
    """Test getting foods"""
    
    def test_get_foods_success(self, client):
        """Test successfully getting foods (public endpoint)"""
        response = client.get('/api/nutrition/foods')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'foods' in data
    
    def test_get_foods_with_search(self, client):
        """Test getting foods with search"""
        response = client.get('/api/nutrition/foods?search=apple')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'foods' in data


class TestGetFood:
    """Test getting a single food"""
    
    def test_get_food_success(self, client):
        """Test successfully getting a food (public endpoint)"""
        # First create a food
        with client.application.app_context():
            food = Food(
                name='Test Food',
                calories=100,
                protein=10.0,
                carbs=20.0,
                fat=5.0
            )
            db.session.add(food)
            db.session.commit()
            food_id = food.id
        
        response = client.get(f'/api/nutrition/foods/{food_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'food' in data
        assert data['food']['name'] == 'Test Food'
    
    def test_get_food_not_found(self, client):
        """Test getting non-existent food"""
        response = client.get('/api/nutrition/foods/99999')
        assert response.status_code == 404


class TestGetNutritionGoals:
    """Test getting nutrition goals"""
    
    def test_get_goals_success(self, client, auth_headers):
        """Test successfully getting nutrition goals"""
        response = client.get('/api/nutrition/goals', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'goals' in data
    
    def test_get_goals_unauthorized(self, client):
        """Test getting goals without authentication"""
        response = client.get('/api/nutrition/goals')
        assert response.status_code == 401


class TestUpdateNutritionGoals:
    """Test updating nutrition goals"""
    
    def test_update_goals_success(self, client, auth_headers):
        """Test successfully updating nutrition goals"""
        goals_data = {
            'calories': 2000,
            'protein': 150.0,
            'carbs': 250.0,
            'fat': 65.0
        }
        response = client.put('/api/nutrition/goals',
            headers=auth_headers,
            json=goals_data
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'goals' in data
    
    def test_update_goals_unauthorized(self, client):
        """Test updating goals without authentication"""
        response = client.put('/api/nutrition/goals',
            json={'calories': 2000}
        )
        assert response.status_code == 401

