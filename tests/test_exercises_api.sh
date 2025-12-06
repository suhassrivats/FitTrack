#!/bin/bash

# Quick test to verify exercises API is working

BASE_URL="http://localhost:5000/api"

echo "🧪 Testing Exercises API"
echo "========================"
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s "$BASE_URL/exercises" > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "   Start it with: docker-compose up -d"
    exit 1
fi
echo ""

# Get exercises count
echo "2. Fetching exercises..."
RESPONSE=$(curl -s "$BASE_URL/exercises")
COUNT=$(echo $RESPONSE | jq '.exercises | length' 2>/dev/null || echo "0")

if [ "$COUNT" -gt 0 ]; then
    echo "   ✅ Found $COUNT exercises"
    echo ""
    echo "   First 5 exercises:"
    echo $RESPONSE | jq -r '.exercises[:5] | .[] | "   - [\(.id)] \(.name) (\(.category))"' 2>/dev/null
else
    echo "   ❌ No exercises found in database!"
    echo ""
    echo "   Fix this by running:"
    echo "   docker-compose exec backend python seed_data.py"
fi
echo ""

echo "3. Testing exercise detail endpoint..."
FIRST_EXERCISE_ID=$(echo $RESPONSE | jq -r '.exercises[0].id' 2>/dev/null)
if [ "$FIRST_EXERCISE_ID" != "null" ] && [ "$FIRST_EXERCISE_ID" != "" ]; then
    DETAIL=$(curl -s "$BASE_URL/exercises/$FIRST_EXERCISE_ID")
    EXERCISE_NAME=$(echo $DETAIL | jq -r '.exercise.name' 2>/dev/null)
    echo "   ✅ Successfully fetched: $EXERCISE_NAME"
else
    echo "   ⚠️  Could not test detail endpoint (no exercises)"
fi
echo ""

echo "========================"
echo "Summary:"
echo "  Backend: Running"
echo "  Exercises: $COUNT"
echo ""

if [ "$COUNT" -eq 0 ]; then
    echo "⚠️  Action Required:"
    echo "   Run: docker-compose exec backend python seed_data.py"
else
    echo "✅ All systems ready!"
    echo ""
    echo "   You can now:"
    echo "   1. Open the mobile app"
    echo "   2. Create a class as instructor"
    echo "   3. Click 'Assigned Workouts'"
    echo "   4. Click '+' to assign workout"
    echo "   5. Click 'Add Exercise' button"
    echo "   6. Select from $COUNT available exercises"
fi
echo ""

