# Backend Tests

This directory contains comprehensive tests for the FitTrack backend API.

## Setup

Install test dependencies:

```bash
pip install -r requirements.txt
```

## Running Tests

Run all tests:
```bash
pytest
```

Run with verbose output:
```bash
pytest -v
```

Run specific test file:
```bash
pytest tests/test_auth.py
```

Run specific test:
```bash
pytest tests/test_auth.py::TestRegister::test_register_success
```

Run with coverage:
```bash
pytest --cov=. --cov-report=html
```

## Test Structure

- `conftest.py` - Test configuration and fixtures
- `test_auth.py` - Authentication and authorization tests
- `test_workouts.py` - Workout management tests
- `test_exercises.py` - Exercise management tests
- `test_nutrition.py` - Nutrition tracking tests
- `test_profile.py` - User profile tests
- `test_classes.py` - Class management tests

## Test Fixtures

Common fixtures available in `conftest.py`:
- `client` - Flask test client
- `auth_headers` - Authentication headers for a test user
- `test_user` - Test user instance
- `instructor_user` - Instructor user instance
- `instructor_headers` - Authentication headers for instructor
- `sample_workout` - Sample workout for testing
- `sample_class` - Sample class for testing

## Writing New Tests

When adding new tests:

1. Follow the naming convention: `test_*.py` for files, `test_*` for functions
2. Use descriptive class names: `TestFeatureName`
3. Group related tests in classes
4. Use fixtures from `conftest.py` when possible
5. Test both success and failure cases
6. Test authentication/authorization requirements

Example:
```python
class TestNewFeature:
    def test_feature_success(self, client, auth_headers):
        response = client.get('/api/feature', headers=auth_headers)
        assert response.status_code == 200
    
    def test_feature_unauthorized(self, client):
        response = client.get('/api/feature')
        assert response.status_code == 401
```

