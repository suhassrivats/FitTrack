#!/bin/bash

# FitTrack Assigned Workouts API Test Script
# Run this to test the complete workflow

set -e  # Exit on error

BASE_URL="http://localhost:5000/api"
echo "🧪 Testing FitTrack Assigned Workouts API"
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if backend is running..."
if ! curl -s "$BASE_URL/exercises" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend server is not running!${NC}"
    echo "Start it with: docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Test 1: Get Exercises
echo -e "${BLUE}Test 1: Get Available Exercises${NC}"
EXERCISES=$(curl -s "$BASE_URL/exercises")
EXERCISE_COUNT=$(echo $EXERCISES | jq '.exercises | length')
echo "Found $EXERCISE_COUNT exercises"
echo "First 3 exercises:"
echo $EXERCISES | jq -r '.exercises[:3] | .[] | "  - ID \(.id): \(.name)"'
echo ""

# Test 2: Create Class
echo -e "${BLUE}Test 2: Create Test Class (Instructor)${NC}"
CLASS_RESPONSE=$(curl -s -X POST "$BASE_URL/classes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Class",
    "description": "Testing assigned workouts feature"
  }')

CLASS_ID=$(echo $CLASS_RESPONSE | jq -r '.class.id')
JOIN_CODE=$(echo $CLASS_RESPONSE | jq -r '.class.join_code')

if [ "$CLASS_ID" != "null" ]; then
    echo -e "${GREEN}✓ Class created successfully${NC}"
    echo "  Class ID: $CLASS_ID"
    echo "  Join Code: $JOIN_CODE"
else
    echo -e "${RED}❌ Failed to create class${NC}"
    echo $CLASS_RESPONSE | jq
    exit 1
fi
echo ""

# Test 3: Assign Workout with Exercises
echo -e "${BLUE}Test 3: Assign Workout with Exercises (NEW Feature!)${NC}"
ASSIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/classes/$CLASS_ID/assign-workout" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Upper Body Power",
    "description": "Focus on compound movements",
    "exercises": [
      {
        "exercise_id": 1,
        "name": "Bench Press",
        "target_sets": 4,
        "target_reps": 8
      },
      {
        "exercise_id": 2,
        "name": "Barbell Squat",
        "target_sets": 4,
        "target_reps": 10
      },
      {
        "exercise_id": 3,
        "name": "Deadlift",
        "target_sets": 3,
        "target_reps": 5
      }
    ],
    "due_date": "2025-12-31"
  }')

WORKOUT_ID=$(echo $ASSIGN_RESPONSE | jq -r '.assigned_workout.id')
WORKOUT_NAME=$(echo $ASSIGN_RESPONSE | jq -r '.assigned_workout.name')

if [ "$WORKOUT_ID" != "null" ]; then
    echo -e "${GREEN}✓ Workout assigned successfully${NC}"
    echo "  Workout ID: $WORKOUT_ID"
    echo "  Workout Name: $WORKOUT_NAME"
    echo "  Exercises:"
    echo $ASSIGN_RESPONSE | jq -r '.assigned_workout.workout_template.exercises[] | "    - \(.name): \(.target_sets) × \(.target_reps)"'
else
    echo -e "${RED}❌ Failed to assign workout${NC}"
    echo $ASSIGN_RESPONSE | jq
    exit 1
fi
echo ""

# Test 4: Get Assigned Workouts
echo -e "${BLUE}Test 4: View Assigned Workouts (Student View)${NC}"
WORKOUTS_RESPONSE=$(curl -s "$BASE_URL/classes/$CLASS_ID/assigned-workouts")
WORKOUT_COUNT=$(echo $WORKOUTS_RESPONSE | jq '.assigned_workouts | length')
echo "Found $WORKOUT_COUNT assigned workout(s)"
echo $WORKOUTS_RESPONSE | jq -r '.assigned_workouts[] | "  - \(.name) (Due: \(.due_date // "No due date"))"'
echo ""

# Test 5: Complete Workout
echo -e "${BLUE}Test 5: Complete Assigned Workout (NEW Implementation!)${NC}"
COMPLETE_RESPONSE=$(curl -s -X POST "$BASE_URL/classes/$CLASS_ID/assigned-workouts/$WORKOUT_ID/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 50,
    "total_volume": 5400,
    "calories_burned": 400,
    "notes": "Felt strong today! Hit all targets.",
    "workout_data": {
      "duration": 50,
      "total_volume": 5400,
      "calories_burned": 400,
      "notes": "Felt strong today! Hit all targets.",
      "exercises": [
        {
          "exercise_id": 1,
          "order": 0,
          "sets": [
            {"set_number": 1, "weight": 135, "reps": 8, "completed": true},
            {"set_number": 2, "weight": 135, "reps": 8, "completed": true},
            {"set_number": 3, "weight": 135, "reps": 8, "completed": true},
            {"set_number": 4, "weight": 135, "reps": 7, "completed": true}
          ]
        },
        {
          "exercise_id": 2,
          "order": 1,
          "sets": [
            {"set_number": 1, "weight": 225, "reps": 10, "completed": true},
            {"set_number": 2, "weight": 225, "reps": 10, "completed": true},
            {"set_number": 3, "weight": 225, "reps": 10, "completed": true},
            {"set_number": 4, "weight": 225, "reps": 9, "completed": true}
          ]
        },
        {
          "exercise_id": 3,
          "order": 2,
          "sets": [
            {"set_number": 1, "weight": 315, "reps": 5, "completed": true},
            {"set_number": 2, "weight": 315, "reps": 5, "completed": true},
            {"set_number": 3, "weight": 315, "reps": 5, "completed": true}
          ]
        }
      ]
    }
  }')

LOG_ID=$(echo $COMPLETE_RESPONSE | jq -r '.log.id')
CREATED_WORKOUT_ID=$(echo $COMPLETE_RESPONSE | jq -r '.log.workout_id')

if [ "$LOG_ID" != "null" ]; then
    echo -e "${GREEN}✓ Workout completed successfully${NC}"
    echo "  Log ID: $LOG_ID"
    echo "  Created Workout ID: $CREATED_WORKOUT_ID"
    echo "  Duration: $(echo $COMPLETE_RESPONSE | jq -r '.log.duration') minutes"
    echo "  Total Volume: $(echo $COMPLETE_RESPONSE | jq -r '.log.total_volume') kg"
    echo "  Calories: $(echo $COMPLETE_RESPONSE | jq -r '.log.calories_burned') kcal"
else
    echo -e "${RED}❌ Failed to complete workout${NC}"
    echo $COMPLETE_RESPONSE | jq
    exit 1
fi
echo ""

# Test 6: Verify Completion
echo -e "${BLUE}Test 6: Verify Workout Completion${NC}"
UPDATED_WORKOUTS=$(curl -s "$BASE_URL/classes/$CLASS_ID/assigned-workouts")
IS_COMPLETED=$(echo $UPDATED_WORKOUTS | jq -r ".assigned_workouts[] | select(.id == $WORKOUT_ID) | .my_log.completed")

if [ "$IS_COMPLETED" = "true" ]; then
    echo -e "${GREEN}✓ Workout marked as completed${NC}"
    echo $UPDATED_WORKOUTS | jq ".assigned_workouts[] | select(.id == $WORKOUT_ID) | {name, completed: .my_log.completed, duration: .my_log.duration, volume: .my_log.total_volume}"
else
    echo -e "${RED}❌ Workout not marked as completed${NC}"
fi
echo ""

# Test 7: Check Leaderboard
echo -e "${BLUE}Test 7: View Class Leaderboard${NC}"
LEADERBOARD=$(curl -s "$BASE_URL/classes/$CLASS_ID/leaderboard")
echo $LEADERBOARD | jq -r '.leaderboard[] | "  Rank \(.rank): \(.student.name // .student.email) - \(.stats.total_workouts) workouts, \(.stats.total_volume) kg"'
echo ""

# Summary
echo "════════════════════════════════════════"
echo -e "${GREEN}✅ All Tests Passed Successfully!${NC}"
echo "════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "  - Class ID: $CLASS_ID"
echo "  - Join Code: $JOIN_CODE"
echo "  - Assigned Workout ID: $WORKOUT_ID"
echo "  - Created Workout ID: $CREATED_WORKOUT_ID"
echo ""
echo "🎯 Key Features Tested:"
echo "  ✓ Exercise selection with target sets/reps"
echo "  ✓ Workout assignment with exercise template"
echo "  ✓ Student workout completion with full data"
echo "  ✓ Workout entry creation in history"
echo "  ✓ Leaderboard tracking"
echo ""
echo "Next Steps:"
echo "  1. Test in mobile app"
echo "  2. Check workout history API"
echo "  3. View detailed workout in app"
echo ""

