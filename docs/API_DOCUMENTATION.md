# FitTrack API Documentation

Complete API reference for the FitTrack backend.

**Base URL:** `http://localhost:5000/api`

For detailed testing examples with curl commands, see [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md).

---

## Authentication Endpoints

### Register
- **POST** `/auth/register` - Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "full_name": "Full Name",
  "role": "student" // optional: "student" or "instructor"
}
```

### Login
- **POST** `/auth/login` - Login user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### Get Current User
- **GET** `/auth/me` - Get current user (requires JWT)

### Change Password
- **POST** `/auth/change-password` - Change password (requires JWT)

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

---

## Workout Endpoints

All workout endpoints require JWT authentication.

### List Workouts
- **GET** `/workouts` - List all workouts for current user

**Query Parameters:**
- `start_date` - Filter by start date
- `end_date` - Filter by end date

### Get Workout
- **GET** `/workouts/:id` - Get workout details

### Create Workout
- **POST** `/workouts` - Create workout with exercises

**Request Body:**
```json
{
  "name": "Morning Workout",
  "duration": 60,
  "date": "2024-12-06T10:00:00",
  "exercises": [
    {
      "exercise_id": 1,
      "order": 0,
      "sets": [
        {
          "set_number": 1,
          "weight": 135,
          "reps": 10,
          "completed": true
        }
      ]
    }
  ]
}
```

### Update Workout
- **PUT** `/workouts/:id` - Update workout

### Delete Workout
- **DELETE** `/workouts/:id` - Delete workout

### Get Workout Statistics
- **GET** `/workouts/stats` - Get workout statistics for current user

### List Routines
- **GET** `/workouts/routines` - List all routines for current user

### Create Routine
- **POST** `/workouts/routines` - Create routine

**Request Body:**
```json
{
  "name": "Push Day",
  "description": "Upper body focus",
  "icon": "dumbbell",
  "exercise_ids": [1, 2, 3]
}
```

### Get Routine
- **GET** `/workouts/routines/:id` - Get routine details

---

## Exercise Endpoints

### List Exercises
- **GET** `/exercises` - List all exercises (public)

**Query Parameters:**
- `category` - Filter by category
- `search` - Search by name

### Get Exercise
- **GET** `/exercises/:id` - Get exercise details (public)

### Create Exercise
- **POST** `/exercises` - Create exercise (requires JWT)

**Request Body:**
```json
{
  "name": "Custom Exercise",
  "description": "Description",
  "category": "strength",
  "muscle_groups": ["Chest", "Shoulders"],
  "equipment": "Dumbbells",
  "instructions": "Step by step instructions"
}
```

---

## Class Management Endpoints

All class endpoints require JWT authentication.

### Create Class
- **POST** `/classes` - Create class (instructor only)

**Request Body:**
```json
{
  "name": "Morning Fitness Class",
  "description": "High-intensity workout class"
}
```

### List Classes
- **GET** `/classes` - List classes for current user

### Get Class Details
- **GET** `/classes/:id` - Get class details

### Update Class
- **PUT** `/classes/:id` - Update class (instructor only)

### Delete Class
- **DELETE** `/classes/:id` - Delete class (instructor only)

### Join Class
- **POST** `/classes/join` - Join class with join code

**Request Body:**
```json
{
  "join_code": "ABC123"
}
```

### List Members
- **GET** `/classes/:id/members` - List class members

### Remove Member
- **DELETE** `/classes/:id/members/:studentId` - Remove member (instructor only)

---

## Assigned Workouts Endpoints

All assigned workout endpoints require JWT authentication.

### Assign Workout
- **POST** `/classes/:id/assign-workout` - Assign workout with exercises (instructor only)

**Request Body:**
```json
{
  "name": "Upper Body Power",
  "description": "Focus on compound movements",
  "exercises": [
    {
      "exercise_id": 1,
      "name": "Bench Press",
      "target_sets": 4,
      "target_reps": 8
    }
  ],
  "due_date": "2024-12-31"
}
```

### List Assigned Workouts
- **GET** `/classes/:id/assigned-workouts` - List assigned workouts

### Get Assigned Workout
- **GET** `/classes/:id/assigned-workouts/:workoutId` - Get workout details

### Complete Workout
- **POST** `/classes/:id/assigned-workouts/:workoutId/complete` - Complete workout

**Request Body:**
```json
{
  "duration": 50,
  "total_volume": 5400,
  "calories_burned": 400,
  "notes": "Felt strong today!",
  "workout_data": {
    "exercises": [
      {
        "exercise_id": 1,
        "sets": [
          {
            "set_number": 1,
            "weight": 135,
            "reps": 8,
            "completed": true
          }
        ]
      }
    ]
  }
}
```

### Get My Log
- **GET** `/classes/:id/assigned-workouts/:workoutId/my-log` - Get my workout log

### Delete Assignment
- **DELETE** `/classes/:id/assigned-workouts/:workoutId` - Delete assignment (instructor only)

---

## Leaderboard Endpoints

All leaderboard endpoints require JWT authentication.

### Get Leaderboard
- **GET** `/classes/:id/leaderboard` - Get class leaderboard

### Get Class Statistics
- **GET** `/classes/:id/stats` - Get class statistics (instructor only)

---

## Profile Endpoints

All profile endpoints require JWT authentication.

### Get Profile
- **GET** `/profile` - Get user profile

### Update Profile
- **PUT** `/profile` - Update profile

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### Get Profile Statistics
- **GET** `/profile/stats` - Get profile statistics

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To get a token:
1. Register or login via `/auth/register` or `/auth/login`
2. The response will include an `access_token`
3. Use this token in subsequent requests

---

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation error
- **500 Internal Server Error** - Server error

Error response format:
```json
{
  "error": "Error message description"
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. In production, consider implementing rate limiting to prevent abuse.

---

## Notes

- All dates should be in ISO 8601 format (e.g., `2024-12-06T10:00:00`)
- All weights are in kilograms (kg)
- All durations are in minutes
- All volumes are calculated in kg (weight × reps)

For detailed examples and testing instructions, see [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md).

