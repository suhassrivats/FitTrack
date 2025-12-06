# FitTrack API Testing Guide

This guide provides curl commands and Postman examples to test the Assigned Workouts feature.

**Base URL:** `http://localhost:5000/api`

---

## 📋 Table of Contents

1. [Setup & Prerequisites](#setup--prerequisites)
2. [Authentication](#authentication)
3. [Exercises API](#exercises-api)
4. [Classes Management](#classes-management)
5. [Class Membership](#class-membership)
6. [Assigned Workouts](#assigned-workouts)
7. [Student Workout Completion](#student-workout-completion)
8. [Leaderboard & Stats](#leaderboard--stats)

---

## Setup & Prerequisites

### Start the Backend Server
```bash
# Start with Docker (recommended)
docker-compose up -d

# Or run locally (without Docker)
cd /Users/suhassrivats/Documents/suhas/FitTrack/backend
python app.py
```

Server should be running at: `http://localhost:5000`

### Default User IDs (Dev Mode)
- **User ID 1**: Default user (set in DEV_USER_ID)
- Check `backend/seed_data.py` for seeded users

---

## Authentication

> **Note:** Dev mode uses `DEV_USER_ID = 1` by default. No auth headers required.

For production (when implemented):
```bash
# Login would return a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in subsequent requests
# Add header: -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Exercises API

### Get All Exercises
```bash
curl -X GET http://localhost:5000/api/exercises
```

**Response:**
```json
{
  "exercises": [
    {
      "id": 1,
      "name": "Bench Press",
      "category": "strength",
      "muscle_groups": ["chest", "triceps"],
      "equipment": "barbell"
    }
  ]
}
```

### Get Exercise by ID
```bash
curl -X GET http://localhost:5000/api/exercises/1
```

---

## Classes Management

### 1. Create a New Class (Instructor Only)

```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Strength Training",
    "description": "For experienced lifters focusing on compound movements"
  }'
```

**Response:**
```json
{
  "message": "Class created successfully",
  "class": {
    "id": 1,
    "instructor_id": 1,
    "name": "Advanced Strength Training",
    "description": "For experienced lifters focusing on compound movements",
    "join_code": "ABC12345",
    "member_count": 0,
    "created_at": "2025-11-14T10:30:00",
    "instructor": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "instructor"
    }
  }
}
```

**Save the `join_code` and `id` for next steps!**

### 2. Get All Classes

```bash
# For instructor - gets classes they teach
curl -X GET http://localhost:5000/api/classes
```

**Response:**
```json
{
  "classes": [
    {
      "id": 1,
      "name": "Advanced Strength Training",
      "join_code": "ABC12345",
      "member_count": 2
    }
  ]
}
```

### 3. Get Class Details

```bash
curl -X GET http://localhost:5000/api/classes/1
```

**Response:**
```json
{
  "class": {
    "id": 1,
    "name": "Advanced Strength Training",
    "members": [
      {
        "id": 2,
        "student_id": 2,
        "student": {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ]
  },
  "is_instructor": true
}
```

### 4. Update Class

```bash
curl -X PUT http://localhost:5000/api/classes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Elite Strength Training",
    "description": "Updated description"
  }'
```

### 5. Delete Class

```bash
curl -X DELETE http://localhost:5000/api/classes/1
```

---

## Class Membership

### 1. Join a Class (Student)

```bash
curl -X POST http://localhost:5000/api/classes/join \
  -H "Content-Type: application/json" \
  -d '{
    "join_code": "ABC12345"
  }'
```

**Response:**
```json
{
  "message": "Successfully joined class",
  "class": {
    "id": 1,
    "name": "Advanced Strength Training"
  },
  "membership": {
    "id": 1,
    "class_id": 1,
    "student_id": 1,
    "joined_at": "2025-11-14T10:35:00"
  }
}
```

### 2. Get Class Members

```bash
curl -X GET http://localhost:5000/api/classes/1/members
```

### 3. Remove Member (Instructor Only)

```bash
curl -X DELETE http://localhost:5000/api/classes/1/members/2
```

---

## Assigned Workouts

### 1. Assign Workout with Exercises (Instructor)

**This is the NEW implementation!** Now accepts exercises array with targets.

```bash
curl -X POST http://localhost:5000/api/classes/1/assign-workout \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Upper Body Strength",
    "description": "Focus on chest, shoulders, and triceps",
    "exercises": [
      {
        "exercise_id": 1,
        "name": "Bench Press",
        "target_sets": 3,
        "target_reps": 10
      },
      {
        "exercise_id": 5,
        "name": "Overhead Press",
        "target_sets": 3,
        "target_reps": 8
      },
      {
        "exercise_id": 12,
        "name": "Tricep Dips",
        "target_sets": 3,
        "target_reps": 12
      }
    ],
    "due_date": "2025-12-31"
  }'
```

**Response:**
```json
{
  "message": "Workout assigned successfully",
  "assigned_workout": {
    "id": 1,
    "class_id": 1,
    "instructor_id": 1,
    "name": "Upper Body Strength",
    "description": "Focus on chest, shoulders, and triceps",
    "workout_template": {
      "exercises": [
        {
          "exercise_id": 1,
          "name": "Bench Press",
          "target_sets": 3,
          "target_reps": 10
        },
        {
          "exercise_id": 5,
          "name": "Overhead Press",
          "target_sets": 3,
          "target_reps": 8
        },
        {
          "exercise_id": 12,
          "name": "Tricep Dips",
          "target_sets": 3,
          "target_reps": 12
        }
      ]
    },
    "assigned_date": "2025-11-14T10:40:00",
    "due_date": "2025-12-31T00:00:00",
    "completion_stats": {
      "total_students": 2,
      "completed_count": 0,
      "completion_rate": 0.0
    }
  }
}
```

### 2. Get Assigned Workouts

#### For Students:
```bash
curl -X GET http://localhost:5000/api/classes/1/assigned-workouts
```

**Response (Student View):**
```json
{
  "assigned_workouts": [
    {
      "id": 1,
      "name": "Upper Body Strength",
      "workout_template": {
        "exercises": [
          {
            "exercise_id": 1,
            "name": "Bench Press",
            "target_sets": 3,
            "target_reps": 10
          }
        ]
      },
      "assigned_date": "2025-11-14T10:40:00",
      "due_date": "2025-12-31T00:00:00",
      "my_log": {
        "id": 1,
        "completed": false,
        "duration": null,
        "total_volume": null
      }
    }
  ],
  "is_instructor": false
}
```

#### For Instructors:
Same endpoint, but includes completion stats for all students.

### 3. Get Specific Assigned Workout

```bash
curl -X GET http://localhost:5000/api/classes/1/assigned-workouts/1
```

### 4. Delete Assigned Workout (Instructor Only)

```bash
curl -X DELETE http://localhost:5000/api/classes/1/assigned-workouts/1
```

---

## Student Workout Completion

### Complete Assigned Workout (NEW Implementation!)

**This now creates a full workout entry with all exercises and sets!**

```bash
curl -X POST http://localhost:5000/api/classes/1/assigned-workouts/1/complete \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 45,
    "total_volume": 4500.5,
    "calories_burned": 350,
    "notes": "Great workout! Felt strong today.",
    "workout_data": {
      "duration": 45,
      "total_volume": 4500.5,
      "calories_burned": 350,
      "notes": "Great workout! Felt strong today.",
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
            },
            {
              "set_number": 2,
              "weight": 135,
              "reps": 10,
              "completed": true
            },
            {
              "set_number": 3,
              "weight": 135,
              "reps": 8,
              "completed": true
            }
          ]
        },
        {
          "exercise_id": 5,
          "order": 1,
          "sets": [
            {
              "set_number": 1,
              "weight": 95,
              "reps": 8,
              "completed": true
            },
            {
              "set_number": 2,
              "weight": 95,
              "reps": 8,
              "completed": true
            },
            {
              "set_number": 3,
              "weight": 95,
              "reps": 6,
              "completed": true
            }
          ]
        },
        {
          "exercise_id": 12,
          "order": 2,
          "sets": [
            {
              "set_number": 1,
              "weight": 0,
              "reps": 12,
              "completed": true
            },
            {
              "set_number": 2,
              "weight": 0,
              "reps": 12,
              "completed": true
            },
            {
              "set_number": 3,
              "weight": 0,
              "reps": 10,
              "completed": true
            }
          ]
        }
      ]
    }
  }'
```

**Response:**
```json
{
  "message": "Workout marked as complete",
  "log": {
    "id": 1,
    "assigned_workout_id": 1,
    "student_id": 1,
    "workout_id": 42,
    "completed": true,
    "completed_at": "2025-11-14T11:30:00",
    "duration": 45,
    "total_volume": 4500.5,
    "calories_burned": 350,
    "notes": "Great workout! Felt strong today.",
    "workout": {
      "id": 42,
      "name": "Upper Body Strength",
      "exercises": [
        {
          "exercise": {
            "id": 1,
            "name": "Bench Press"
          },
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
  }
}
```

### Get My Workout Log

```bash
curl -X GET http://localhost:5000/api/classes/1/assigned-workouts/1/my-log
```

---

## Leaderboard & Stats

### 1. Get Class Leaderboard

```bash
curl -X GET http://localhost:5000/api/classes/1/leaderboard
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "student": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "stats": {
        "total_workouts": 5,
        "total_duration": 225,
        "total_volume": 15000.0,
        "total_calories": 1750,
        "completion_rate": 100.0
      }
    },
    {
      "rank": 2,
      "student": {
        "id": 3,
        "name": "Bob Johnson",
        "email": "bob@example.com"
      },
      "stats": {
        "total_workouts": 3,
        "total_duration": 150,
        "total_volume": 9000.0,
        "total_calories": 1050,
        "completion_rate": 60.0
      }
    }
  ],
  "total_members": 2,
  "is_instructor": false
}
```

### 2. Get Class Stats (Instructor Only)

```bash
curl -X GET http://localhost:5000/api/classes/1/stats
```

**Response:**
```json
{
  "stats": {
    "total_members": 2,
    "total_assigned_workouts": 5,
    "total_completions": 8,
    "average_completion_rate": 80.0,
    "most_active_student": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "most_active_student_completions": 5
  }
}
```

---

## 📦 Postman Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "FitTrack API - Assigned Workouts",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "class_id",
      "value": "1"
    },
    {
      "key": "workout_id",
      "value": "1"
    }
  ],
  "item": [
    {
      "name": "Exercises",
      "item": [
        {
          "name": "Get All Exercises",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/exercises",
              "host": ["{{base_url}}"],
              "path": ["exercises"]
            }
          }
        }
      ]
    },
    {
      "name": "Classes",
      "item": [
        {
          "name": "Create Class",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Advanced Strength Training\",\n  \"description\": \"For experienced lifters\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/classes",
              "host": ["{{base_url}}"],
              "path": ["classes"]
            }
          }
        },
        {
          "name": "Get All Classes",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/classes",
              "host": ["{{base_url}}"],
              "path": ["classes"]
            }
          }
        },
        {
          "name": "Get Class Details",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/classes/{{class_id}}",
              "host": ["{{base_url}}"],
              "path": ["classes", "{{class_id}}"]
            }
          }
        },
        {
          "name": "Join Class",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"join_code\": \"ABC12345\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/classes/join",
              "host": ["{{base_url}}"],
              "path": ["classes", "join"]
            }
          }
        }
      ]
    },
    {
      "name": "Assigned Workouts",
      "item": [
        {
          "name": "Assign Workout with Exercises",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Upper Body Strength\",\n  \"description\": \"Focus on chest, shoulders, and triceps\",\n  \"exercises\": [\n    {\n      \"exercise_id\": 1,\n      \"name\": \"Bench Press\",\n      \"target_sets\": 3,\n      \"target_reps\": 10\n    },\n    {\n      \"exercise_id\": 5,\n      \"name\": \"Overhead Press\",\n      \"target_sets\": 3,\n      \"target_reps\": 8\n    },\n    {\n      \"exercise_id\": 12,\n      \"name\": \"Tricep Dips\",\n      \"target_sets\": 3,\n      \"target_reps\": 12\n    }\n  ],\n  \"due_date\": \"2025-12-31\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/classes/{{class_id}}/assign-workout",
              "host": ["{{base_url}}"],
              "path": ["classes", "{{class_id}}", "assign-workout"]
            }
          }
        },
        {
          "name": "Get Assigned Workouts",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/classes/{{class_id}}/assigned-workouts",
              "host": ["{{base_url}}"],
              "path": ["classes", "{{class_id}}", "assigned-workouts"]
            }
          }
        },
        {
          "name": "Complete Workout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"duration\": 45,\n  \"total_volume\": 4500.5,\n  \"calories_burned\": 350,\n  \"notes\": \"Great workout!\",\n  \"workout_data\": {\n    \"duration\": 45,\n    \"total_volume\": 4500.5,\n    \"calories_burned\": 350,\n    \"exercises\": [\n      {\n        \"exercise_id\": 1,\n        \"order\": 0,\n        \"sets\": [\n          {\n            \"set_number\": 1,\n            \"weight\": 135,\n            \"reps\": 10,\n            \"completed\": true\n          },\n          {\n            \"set_number\": 2,\n            \"weight\": 135,\n            \"reps\": 10,\n            \"completed\": true\n          },\n          {\n            \"set_number\": 3,\n            \"weight\": 135,\n            \"reps\": 8,\n            \"completed\": true\n          }\n        ]\n      }\n    ]\n  }\n}"
            },
            "url": {
              "raw": "{{base_url}}/classes/{{class_id}}/assigned-workouts/{{workout_id}}/complete",
              "host": ["{{base_url}}"],
              "path": ["classes", "{{class_id}}", "assigned-workouts", "{{workout_id}}", "complete"]
            }
          }
        }
      ]
    },
    {
      "name": "Leaderboard",
      "item": [
        {
          "name": "Get Class Leaderboard",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/classes/{{class_id}}/leaderboard",
              "host": ["{{base_url}}"],
              "path": ["classes", "{{class_id}}", "leaderboard"]
            }
          }
        },
        {
          "name": "Get Class Stats",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/classes/{{class_id}}/stats",
              "host": ["{{base_url}}"],
              "path": ["classes", "{{class_id}}", "stats"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🧪 Complete Test Flow

### Step 1: Setup
```bash
# Get available exercises
curl -X GET http://localhost:5000/api/exercises | jq '.exercises[] | {id, name}'
```

### Step 2: Create Class (Instructor)
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Class", "description": "Testing workouts"}' | jq
```

**Save the `join_code` and `class_id`**

### Step 3: Assign Workout (Instructor)
```bash
curl -X POST http://localhost:5000/api/classes/1/assign-workout \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workout",
    "exercises": [
      {"exercise_id": 1, "name": "Bench Press", "target_sets": 3, "target_reps": 10}
    ],
    "due_date": "2025-12-31"
  }' | jq
```

**Save the `workout_id`**

### Step 4: View Assigned Workouts (Student)
```bash
curl -X GET http://localhost:5000/api/classes/1/assigned-workouts | jq
```

### Step 5: Complete Workout (Student)
```bash
curl -X POST http://localhost:5000/api/classes/1/assigned-workouts/1/complete \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 30,
    "total_volume": 4050,
    "workout_data": {
      "duration": 30,
      "total_volume": 4050,
      "exercises": [{
        "exercise_id": 1,
        "order": 0,
        "sets": [
          {"set_number": 1, "weight": 135, "reps": 10, "completed": true},
          {"set_number": 2, "weight": 135, "reps": 10, "completed": true},
          {"set_number": 3, "weight": 135, "reps": 10, "completed": true}
        ]
      }]
    }
  }' | jq
```

### Step 6: Check Leaderboard
```bash
curl -X GET http://localhost:5000/api/classes/1/leaderboard | jq
```

---

## 🔍 Debugging Tips

### Check if exercises exist:
```bash
curl -X GET http://localhost:5000/api/exercises | jq '.exercises | length'
```

### View full workout data:
```bash
curl -X GET http://localhost:5000/api/workouts | jq
```

### Check class members:
```bash
curl -X GET http://localhost:5000/api/classes/1/members | jq
```

### Pretty print JSON responses:
All examples use `| jq` for formatted output. Install jq:
```bash
# macOS
brew install jq

# Or use Python
curl ... | python -m json.tool
```

---

## 📝 Notes

- **Dev Mode**: No authentication required, uses `user_id=1`
- **Exercise IDs**: Run seed_data.py to populate exercises
- **Date Format**: `YYYY-MM-DD` for due dates
- **Content-Type**: Always use `application/json` for POST/PUT requests
- **Error Responses**: Check status codes and error messages in response body

---

## 🐛 Common Issues

### Issue: "Class not found"
**Solution:** Make sure you're using the correct class_id from create/get classes response

### Issue: "Exercise not found"
**Solution:** Run `python seed_data.py` to populate exercises database

### Issue: "Only instructors can assign workouts"
**Solution:** Check user role in database or switch user_id in DEV_USER_ID

### Issue: Connection refused
**Solution:** Make sure backend server is running on port 5000

---

## ✅ Quick Validation Checklist

- [ ] Backend server running
- [ ] Exercises populated (seed_data.py)
- [ ] Class created successfully
- [ ] Students joined class
- [ ] Workout assigned with exercises array
- [ ] Student can see assigned workout
- [ ] Student can complete workout with exercise data
- [ ] Workout appears in student's history
- [ ] Leaderboard updates correctly

---

Enjoy testing! 🚀

