"""Seed database with sample exercises and foods"""
from app import app
from models import db
from models.workout import Exercise
from models.nutrition import Food, NutritionGoal
from models.user import User
from models.classes import Class, ClassMembership, AssignedWorkout, StudentWorkoutLog
from datetime import datetime, timedelta

def seed_exercises():
    """Add sample exercises to the database"""
    exercises = [
        # CHEST EXERCISES
        {
            'name': 'Barbell Bench Press',
            'description': 'Classic chest exercise',
            'category': 'strength',
            'muscle_groups': 'Chest,Shoulders,Triceps',
            'equipment': 'Barbell',
            'instructions': '''1. Lie flat on the bench with your feet firmly on the floor.
2. Grip the barbell with hands slightly wider than shoulder-width apart.
3. Unrack the bar and stabilize it directly over your chest.
4. Inhale and slowly lower the bar to your mid-chest.
5. Exhale and press the bar back up to the starting position.''',
            'video_url': 'https://example.com/videos/bench-press.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Incline Barbell Bench Press',
            'description': 'Upper chest focus',
            'category': 'strength',
            'muscle_groups': 'Upper Chest,Shoulders,Triceps',
            'equipment': 'Barbell',
            'instructions': '''1. Set bench to 30-45 degree incline.
2. Lie back with feet flat on floor.
3. Grip bar slightly wider than shoulder width.
4. Lower bar to upper chest in controlled motion.
5. Press bar back up to starting position.''',
            'video_url': 'https://example.com/videos/incline-bench.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Decline Barbell Bench Press',
            'description': 'Lower chest emphasis',
            'category': 'strength',
            'muscle_groups': 'Lower Chest,Triceps',
            'equipment': 'Barbell',
            'instructions': '''1. Set bench to decline position.
2. Secure feet at top of bench.
3. Grip bar at shoulder width.
4. Lower bar to lower chest.
5. Press back up explosively.''',
            'video_url': 'https://example.com/videos/decline-bench.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Bench Press',
            'description': 'Greater range of motion',
            'category': 'strength',
            'muscle_groups': 'Chest,Shoulders,Triceps',
            'equipment': 'Dumbbells',
            'instructions': '''1. Lie on flat bench with dumbbells.
2. Start with weights at chest level.
3. Press dumbbells up until arms extended.
4. Lower with control to starting position.
5. Keep core tight throughout movement.''',
            'video_url': 'https://example.com/videos/db-bench.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Incline Dumbbell Press',
            'description': 'Upper chest builder',
            'category': 'strength',
            'muscle_groups': 'Upper Chest,Shoulders',
            'equipment': 'Dumbbells',
            'instructions': '''1. Set bench to 30-45 degree angle.
2. Start with dumbbells at shoulder level.
3. Press weights up and slightly together.
4. Lower slowly to starting position.
5. Maintain natural arch in lower back.''',
            'video_url': 'https://example.com/videos/incline-db-press.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Flyes',
            'description': 'Chest isolation exercise',
            'category': 'strength',
            'muscle_groups': 'Chest',
            'equipment': 'Dumbbells',
            'instructions': '''1. Lie on flat bench holding dumbbells above chest.
2. Slight bend in elbows.
3. Lower weights in arc motion to sides.
4. Feel stretch in chest.
5. Bring weights back together above chest.''',
            'video_url': 'https://example.com/videos/db-flyes.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        
        # BACK EXERCISES
        {
            'name': 'Deadlift',
            'description': 'Full body compound movement',
            'category': 'strength',
            'muscle_groups': 'Back,Glutes,Hamstrings,Core',
            'equipment': 'Barbell',
            'instructions': '''1. Stand with feet hip-width apart, bar over midfoot.
2. Bend down and grip the bar.
3. Keep your back straight and chest up.
4. Drive through your heels and stand up.
5. Lower the bar back down with control.''',
            'video_url': 'https://example.com/videos/deadlift.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Barbell Row',
            'description': 'Build back thickness',
            'category': 'strength',
            'muscle_groups': 'Back,Biceps,Core',
            'equipment': 'Barbell',
            'instructions': '''1. Hinge at hips with slight knee bend.
2. Grip bar slightly wider than shoulder width.
3. Pull bar to lower chest/upper abdomen.
4. Squeeze shoulder blades together.
5. Lower bar with control.''',
            'video_url': 'https://example.com/videos/barbell-row.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'T-Bar Row',
            'description': 'Middle back mass builder',
            'category': 'strength',
            'muscle_groups': 'Middle Back,Lats',
            'equipment': 'Barbell',
            'instructions': '''1. Stand over bar with staggered stance.
2. Bend at hips maintaining straight back.
3. Pull bar to chest.
4. Squeeze back muscles at top.
5. Lower under control.''',
            'video_url': 'https://example.com/videos/tbar-row.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Row',
            'description': 'Unilateral back exercise',
            'category': 'strength',
            'muscle_groups': 'Back,Lats,Biceps',
            'equipment': 'Dumbbells',
            'instructions': '''1. Place one knee and hand on bench.
2. Hold dumbbell in opposite hand.
3. Pull weight to hip.
4. Keep elbow close to body.
5. Lower with control.''',
            'video_url': 'https://example.com/videos/db-row.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Romanian Deadlift',
            'description': 'Hamstring and glute developer',
            'category': 'strength',
            'muscle_groups': 'Hamstrings,Glutes,Lower Back',
            'equipment': 'Barbell',
            'instructions': '''1. Start standing with barbell at hip level.
2. Slight bend in knees.
3. Push hips back lowering bar.
4. Feel stretch in hamstrings.
5. Drive hips forward to return to start.''',
            'video_url': 'https://example.com/videos/rdl.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Shrugs',
            'description': 'Trap development',
            'category': 'strength',
            'muscle_groups': 'Traps,Upper Back',
            'equipment': 'Dumbbells',
            'instructions': '''1. Stand holding dumbbells at sides.
2. Shrug shoulders straight up.
3. Hold contraction at top.
4. Lower shoulders slowly.
5. Avoid rolling shoulders.''',
            'video_url': 'https://example.com/videos/shrugs.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        
        # SHOULDER EXERCISES
        {
            'name': 'Barbell Overhead Press',
            'description': 'Complete shoulder developer',
            'category': 'strength',
            'muscle_groups': 'Shoulders,Triceps,Core',
            'equipment': 'Barbell',
            'instructions': '''1. Start with bar at shoulder level.
2. Grip slightly wider than shoulders.
3. Press bar overhead until arms locked.
4. Lower bar to starting position.
5. Keep core tight throughout.''',
            'video_url': 'https://example.com/videos/ohp.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Shoulder Press',
            'description': 'Build strong shoulders',
            'category': 'strength',
            'muscle_groups': 'Shoulders,Triceps',
            'equipment': 'Dumbbells',
            'instructions': '''1. Sit with back support, dumbbells at shoulder height.
2. Press the weights overhead until arms are fully extended.
3. Lower the dumbbells back to shoulder height.
4. Keep your core engaged throughout.''',
            'video_url': 'https://example.com/videos/shoulder-press.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Lateral Raise',
            'description': 'Side delt isolation',
            'category': 'strength',
            'muscle_groups': 'Side Delts',
            'equipment': 'Dumbbells',
            'instructions': '''1. Stand with dumbbells at sides.
2. Slight bend in elbows.
3. Raise weights out to sides.
4. Lift to shoulder height.
5. Lower under control.''',
            'video_url': 'https://example.com/videos/lateral-raise.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Front Raise',
            'description': 'Front delt emphasis',
            'category': 'strength',
            'muscle_groups': 'Front Delts',
            'equipment': 'Dumbbells',
            'instructions': '''1. Stand with dumbbells in front of thighs.
2. Raise one or both weights forward.
3. Lift to shoulder height.
4. Pause briefly at top.
5. Lower with control.''',
            'video_url': 'https://example.com/videos/front-raise.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Rear Delt Fly',
            'description': 'Rear delt isolation',
            'category': 'strength',
            'muscle_groups': 'Rear Delts',
            'equipment': 'Dumbbells',
            'instructions': '''1. Bend forward at hips.
2. Let dumbbells hang down.
3. Raise weights out to sides.
4. Squeeze shoulder blades.
5. Lower slowly.''',
            'video_url': 'https://example.com/videos/rear-delt-fly.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Arnold Press',
            'description': 'Complete shoulder workout',
            'category': 'strength',
            'muscle_groups': 'Shoulders,Triceps',
            'equipment': 'Dumbbells',
            'instructions': '''1. Start with dumbbells at shoulders, palms facing you.
2. Press up while rotating palms outward.
3. End with palms facing forward.
4. Reverse motion on way down.
5. Keep core engaged.''',
            'video_url': 'https://example.com/videos/arnold-press.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        
        # LEG EXERCISES
        {
            'name': 'Barbell Squat',
            'description': 'King of leg exercises',
            'category': 'strength',
            'muscle_groups': 'Quadriceps,Glutes,Hamstrings',
            'equipment': 'Barbell',
            'instructions': '''1. Position the barbell on your upper back.
2. Stand with feet shoulder-width apart.
3. Lower your body by bending at the knees and hips.
4. Keep your chest up and core tight.
5. Push through your heels to return to starting position.''',
            'video_url': 'https://example.com/videos/squat.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Front Squat',
            'description': 'Quad-focused squat variation',
            'category': 'strength',
            'muscle_groups': 'Quadriceps,Core',
            'equipment': 'Barbell',
            'instructions': '''1. Hold bar across front shoulders.
2. Elbows high, chest up.
3. Squat down keeping torso vertical.
4. Drive through heels to stand.
5. Maintain bar position throughout.''',
            'video_url': 'https://example.com/videos/front-squat.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Goblet Squat',
            'description': 'Perfect squat pattern',
            'category': 'strength',
            'muscle_groups': 'Quadriceps,Glutes',
            'equipment': 'Dumbbell',
            'instructions': '''1. Hold dumbbell at chest level.
2. Squat down between legs.
3. Keep chest up and elbows inside knees.
4. Drive through heels to stand.
5. Great for learning squat form.''',
            'video_url': 'https://example.com/videos/goblet-squat.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Bulgarian Split Squat',
            'description': 'Unilateral leg builder',
            'category': 'strength',
            'muscle_groups': 'Quadriceps,Glutes',
            'equipment': 'Dumbbells',
            'instructions': '''1. Rear foot elevated on bench.
2. Hold dumbbells at sides.
3. Lower back knee toward ground.
4. Keep front knee over ankle.
5. Drive through front heel to stand.''',
            'video_url': 'https://example.com/videos/bulgarian-split-squat.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Lunges',
            'description': 'Dynamic leg exercise',
            'category': 'strength',
            'muscle_groups': 'Quadriceps,Glutes,Hamstrings',
            'equipment': 'Dumbbells',
            'instructions': '''1. Hold dumbbells at sides.
2. Step forward into lunge.
3. Lower back knee toward ground.
4. Push through front heel to return.
5. Alternate legs or do all reps one side.''',
            'video_url': 'https://example.com/videos/lunges.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Stiff Leg Deadlift',
            'description': 'Hamstring focus',
            'category': 'strength',
            'muscle_groups': 'Hamstrings,Glutes',
            'equipment': 'Dumbbells',
            'instructions': '''1. Hold dumbbells in front of thighs.
2. Slight knee bend.
3. Hinge at hips pushing them back.
4. Lower weights along legs.
5. Feel stretch in hamstrings then return.''',
            'video_url': 'https://example.com/videos/stiff-leg-dl.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Calf Raises with Dumbbells',
            'description': 'Calf development',
            'category': 'strength',
            'muscle_groups': 'Calves',
            'equipment': 'Dumbbells',
            'instructions': '''1. Stand with dumbbells at sides.
2. Rise up onto toes.
3. Hold contraction at top.
4. Lower heels below starting point.
5. Keep legs mostly straight.''',
            'video_url': 'https://example.com/videos/calf-raises.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        
        # ARM EXERCISES - BICEPS
        {
            'name': 'Barbell Curl',
            'description': 'Classic bicep builder',
            'category': 'strength',
            'muscle_groups': 'Biceps',
            'equipment': 'Barbell',
            'instructions': '''1. Stand with barbell at arms length.
2. Curl bar up to shoulders.
3. Keep elbows stationary.
4. Squeeze biceps at top.
5. Lower with control.''',
            'video_url': 'https://example.com/videos/barbell-curl.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Bicep Curl',
            'description': 'Fundamental bicep exercise',
            'category': 'strength',
            'muscle_groups': 'Biceps',
            'equipment': 'Dumbbells',
            'instructions': '''1. Stand with dumbbells at sides.
2. Curl weights up simultaneously or alternating.
3. Keep upper arms stationary.
4. Rotate palms up as you curl.
5. Lower slowly under control.''',
            'video_url': 'https://example.com/videos/db-curl.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Hammer Curl',
            'description': 'Brachialis and bicep builder',
            'category': 'strength',
            'muscle_groups': 'Biceps,Forearms',
            'equipment': 'Dumbbells',
            'instructions': '''1. Hold dumbbells with neutral grip.
2. Curl weights keeping palms facing each other.
3. Elbows stay at sides.
4. Squeeze at top.
5. Lower under control.''',
            'video_url': 'https://example.com/videos/hammer-curl.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Preacher Curl',
            'description': 'Isolated bicep work',
            'category': 'strength',
            'muscle_groups': 'Biceps',
            'equipment': 'Barbell',
            'instructions': '''1. Arms resting on preacher bench.
2. Curl bar up to shoulder level.
3. Full stretch at bottom.
4. No momentum.
5. Slow negative.''',
            'video_url': 'https://example.com/videos/preacher-curl.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Concentration Curl',
            'description': 'Peak bicep contraction',
            'category': 'strength',
            'muscle_groups': 'Biceps',
            'equipment': 'Dumbbell',
            'instructions': '''1. Sit with elbow braced against inner thigh.
2. Curl weight up to shoulder.
3. Focus on peak contraction.
4. Lower slowly.
5. Complete all reps then switch arms.''',
            'video_url': 'https://example.com/videos/concentration-curl.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        
        # ARM EXERCISES - TRICEPS
        {
            'name': 'Close-Grip Bench Press',
            'description': 'Compound tricep builder',
            'category': 'strength',
            'muscle_groups': 'Triceps,Chest',
            'equipment': 'Barbell',
            'instructions': '''1. Lie on bench with narrow grip.
2. Lower bar to lower chest.
3. Keep elbows close to body.
4. Press bar back up.
5. Focus on tricep engagement.''',
            'video_url': 'https://example.com/videos/close-grip-bench.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Overhead Dumbbell Extension',
            'description': 'Tricep mass builder',
            'category': 'strength',
            'muscle_groups': 'Triceps',
            'equipment': 'Dumbbell',
            'instructions': '''1. Hold single dumbbell overhead with both hands.
2. Lower weight behind head.
3. Keep elbows pointing up.
4. Extend arms back to start.
5. Feel stretch in triceps.''',
            'video_url': 'https://example.com/videos/overhead-extension.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Kickback',
            'description': 'Tricep isolation',
            'category': 'strength',
            'muscle_groups': 'Triceps',
            'equipment': 'Dumbbells',
            'instructions': '''1. Hinge forward with upper arm parallel to ground.
2. Extend forearm back.
3. Squeeze tricep at full extension.
4. Return to 90-degree angle.
5. Keep upper arm stationary.''',
            'video_url': 'https://example.com/videos/kickback.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Skull Crusher',
            'description': 'Tricep developer',
            'category': 'strength',
            'muscle_groups': 'Triceps',
            'equipment': 'Dumbbells',
            'instructions': '''1. Lie on bench with dumbbells extended.
2. Lower weights to sides of forehead.
3. Keep upper arms vertical.
4. Extend back to start.
5. Control the weight throughout.''',
            'video_url': 'https://example.com/videos/skull-crusher.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        
        # CORE EXERCISES WITH WEIGHTS
        {
            'name': 'Weighted Crunch',
            'description': 'Abdominal strength',
            'category': 'strength',
            'muscle_groups': 'Abs',
            'equipment': 'Dumbbell',
            'instructions': '''1. Lie on back holding weight on chest.
2. Crunch up engaging abs.
3. Don't pull with arms.
4. Squeeze at top.
5. Lower with control.''',
            'video_url': 'https://example.com/videos/weighted-crunch.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Side Bend',
            'description': 'Oblique developer',
            'category': 'strength',
            'muscle_groups': 'Obliques',
            'equipment': 'Dumbbell',
            'instructions': '''1. Stand holding dumbbell in one hand.
2. Bend sideways away from weight.
3. Return to upright using obliques.
4. Bend toward weight side.
5. Complete reps then switch sides.''',
            'video_url': 'https://example.com/videos/side-bend.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        },
        {
            'name': 'Dumbbell Russian Twist',
            'description': 'Rotational core strength',
            'category': 'strength',
            'muscle_groups': 'Abs,Obliques',
            'equipment': 'Dumbbell',
            'instructions': '''1. Sit with feet off ground holding weight.
2. Lean back slightly.
3. Rotate torso side to side.
4. Touch weight to ground each side.
5. Keep core engaged throughout.''',
            'video_url': 'https://example.com/videos/russian-twist.mp4',
            'image_url': 'https://via.placeholder.com/400x300'
        }
    ]
    
    for exercise_data in exercises:
        existing = Exercise.query.filter_by(name=exercise_data['name']).first()
        if not existing:
            exercise = Exercise(**exercise_data)
            db.session.add(exercise)
    
    db.session.commit()
    print(f"✓ Seeded {len(exercises)} exercises")

def seed_foods():
    """Add sample foods to the database"""
    foods = [
        {
            'name': 'Grilled Chicken Breast',
            'description': 'Lean protein source',
            'calories': 165,
            'protein': 31,
            'carbs': 0,
            'fat': 3.6,
            'serving_size': '100g',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'high-protein,low-carb,lean'
        },
        {
            'name': 'Brown Rice',
            'description': 'Whole grain carbohydrate',
            'calories': 112,
            'protein': 2.6,
            'carbs': 24,
            'fat': 0.9,
            'serving_size': '100g cooked',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'high-carb,whole-grain'
        },
        {
            'name': 'Salmon Fillet',
            'description': 'Omega-3 rich fish',
            'calories': 208,
            'protein': 20,
            'carbs': 0,
            'fat': 13,
            'serving_size': '100g',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'high-protein,omega-3,healthy-fats'
        },
        {
            'name': 'Greek Yogurt',
            'description': 'High protein dairy',
            'calories': 59,
            'protein': 10,
            'carbs': 3.6,
            'fat': 0.4,
            'serving_size': '100g',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'high-protein,low-fat,dairy'
        },
        {
            'name': 'Oatmeal',
            'description': 'Fiber-rich breakfast',
            'calories': 71,
            'protein': 2.5,
            'carbs': 12,
            'fat': 1.5,
            'serving_size': '40g dry',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'high-fiber,whole-grain,breakfast'
        },
        {
            'name': 'Avocado',
            'description': 'Healthy fats',
            'calories': 160,
            'protein': 2,
            'carbs': 9,
            'fat': 15,
            'serving_size': '100g',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'healthy-fats,high-fiber'
        },
        {
            'name': 'Protein Shake',
            'description': 'Post-workout recovery',
            'calories': 150,
            'protein': 25,
            'carbs': 5,
            'fat': 2,
            'serving_size': '1 scoop (30g)',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'high-protein,quick-prep,supplement'
        },
        {
            'name': 'Sweet Potato',
            'description': 'Complex carbohydrate',
            'calories': 86,
            'protein': 1.6,
            'carbs': 20,
            'fat': 0.1,
            'serving_size': '100g',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'high-carb,high-fiber,complex-carb'
        },
        {
            'name': 'Mixed Greens Salad',
            'description': 'Nutrient-dense vegetables',
            'calories': 20,
            'protein': 1.5,
            'carbs': 3,
            'fat': 0.2,
            'serving_size': '100g',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'low-calorie,high-fiber,vegetables'
        },
        {
            'name': 'Almonds',
            'description': 'Healthy snack',
            'calories': 579,
            'protein': 21,
            'carbs': 22,
            'fat': 50,
            'serving_size': '100g',
            'image_url': 'https://via.placeholder.com/200',
            'tags': 'healthy-fats,high-protein,snack'
        }
    ]
    
    for food_data in foods:
        existing = Food.query.filter_by(name=food_data['name']).first()
        if not existing:
            food = Food(**food_data)
            db.session.add(food)
    
    db.session.commit()
    print(f"✓ Seeded {len(foods)} foods")

def seed_students():
    """Create sample students"""
    students_data = [
        {
            'email': 'student1@fittrack.app',
            'username': 'student1',
            'full_name': 'Alice Johnson',
            'role': 'student'
        },
        {
            'email': 'student2@fittrack.app',
            'username': 'student2',
            'full_name': 'Bob Smith',
            'role': 'student'
        },
        {
            'email': 'student3@fittrack.app',
            'username': 'student3',
            'full_name': 'Charlie Brown',
            'role': 'student'
        },
        {
            'email': 'student4@fittrack.app',
            'username': 'student4',
            'full_name': 'Diana Wilson',
            'role': 'student'
        },
        {
            'email': 'student5@fittrack.app',
            'username': 'student5',
            'full_name': 'Ethan Davis',
            'role': 'student'
        }
    ]
    
    students = []
    for student_data in students_data:
        existing = User.query.filter_by(email=student_data['email']).first()
        if not existing:
            student = User(**student_data)
            student.set_password('SamplePass123!')  # Default password for seeded test students
            db.session.add(student)
            students.append(student)
        else:
            students.append(existing)
    
    db.session.commit()
    print(f"✓ Created {len(students_data)} student users")
    return students


def seed_classes():
    """Create sample classes with members"""
    # Get the first instructor from the database
    instructor = User.query.filter_by(role='instructor').first()
    if not instructor:
        print("⚠ No instructor found, skipping class seeding")
        return None
    
    # Create a class
    existing_class = Class.query.filter_by(instructor_id=instructor.id).first()
    if not existing_class:
        fitness_class = Class(
            instructor_id=instructor.id,
            name='Advanced Strength Training',
            description='A comprehensive strength training program for intermediate to advanced lifters. Focus on progressive overload and compound movements.',
            join_code='FIT2024A'
        )
        db.session.add(fitness_class)
        db.session.commit()
        print(f"✓ Created class: {fitness_class.name} (Join code: {fitness_class.join_code})")
    else:
        fitness_class = existing_class
        print(f"✓ Class already exists: {fitness_class.name}")
    
    # Add students to the class
    students = User.query.filter_by(role='student').all()
    for student in students:
        existing_membership = ClassMembership.query.filter_by(
            class_id=fitness_class.id,
            student_id=student.id
        ).first()
        
        if not existing_membership:
            membership = ClassMembership(
                class_id=fitness_class.id,
                student_id=student.id
            )
            db.session.add(membership)
    
    db.session.commit()
    print(f"✓ Added {len(students)} students to the class")
    
    return fitness_class


def seed_assigned_workouts(fitness_class):
    """Create sample assigned workouts"""
    if not fitness_class:
        return
    
    # Assigned workout 1: Push Day (completed by most students)
    existing_workout1 = AssignedWorkout.query.filter_by(
        class_id=fitness_class.id,
        name='Push Day - Week 1'
    ).first()
    
    if not existing_workout1:
        workout1 = AssignedWorkout(
            class_id=fitness_class.id,
            instructor_id=fitness_class.instructor_id,
            name='Push Day - Week 1',
            description='Chest, shoulders, and triceps workout. Focus on progressive overload.',
            workout_template={
                'exercises': [
                    {
                        'name': 'Barbell Bench Press',
                        'sets': 4,
                        'reps': '8-10',
                        'rest': '2-3 min'
                    },
                    {
                        'name': 'Incline Dumbbell Press',
                        'sets': 3,
                        'reps': '10-12',
                        'rest': '90 sec'
                    },
                    {
                        'name': 'Dumbbell Shoulder Press',
                        'sets': 3,
                        'reps': '10-12',
                        'rest': '90 sec'
                    },
                    {
                        'name': 'Dumbbell Lateral Raise',
                        'sets': 3,
                        'reps': '12-15',
                        'rest': '60 sec'
                    },
                    {
                        'name': 'Overhead Dumbbell Extension',
                        'sets': 3,
                        'reps': '12-15',
                        'rest': '60 sec'
                    }
                ]
            },
            assigned_date=datetime.utcnow() - timedelta(days=5),
            due_date=datetime.utcnow() + timedelta(days=2)
        )
        db.session.add(workout1)
        db.session.flush()
        
        # Create logs for students with some completions
        students = User.query.filter_by(role='student').all()
        completion_data = [
            {'duration': 65, 'volume': 4500, 'calories': 350, 'completed': True},
            {'duration': 70, 'volume': 4200, 'calories': 380, 'completed': True},
            {'duration': 60, 'volume': 3800, 'calories': 320, 'completed': True},
            {'duration': None, 'volume': None, 'calories': None, 'completed': False},
            {'duration': 75, 'volume': 4800, 'calories': 400, 'completed': True}
        ]
        
        for i, student in enumerate(students):
            data = completion_data[i] if i < len(completion_data) else completion_data[-1]
            log = StudentWorkoutLog(
                assigned_workout_id=workout1.id,
                student_id=student.id,
                completed=data['completed'],
                completed_at=datetime.utcnow() - timedelta(days=2) if data['completed'] else None,
                duration=data['duration'],
                total_volume=data['volume'],
                calories_burned=data['calories']
            )
            db.session.add(log)
        
        print(f"✓ Created assigned workout: {workout1.name}")
    
    # Assigned workout 2: Pull Day (fewer completions)
    existing_workout2 = AssignedWorkout.query.filter_by(
        class_id=fitness_class.id,
        name='Pull Day - Week 1'
    ).first()
    
    if not existing_workout2:
        workout2 = AssignedWorkout(
            class_id=fitness_class.id,
            instructor_id=fitness_class.instructor_id,
            name='Pull Day - Week 1',
            description='Back and biceps workout. Focus on proper form and mind-muscle connection.',
            workout_template={
                'exercises': [
                    {
                        'name': 'Deadlift',
                        'sets': 4,
                        'reps': '6-8',
                        'rest': '3 min'
                    },
                    {
                        'name': 'Barbell Row',
                        'sets': 4,
                        'reps': '8-10',
                        'rest': '2 min'
                    },
                    {
                        'name': 'Dumbbell Row',
                        'sets': 3,
                        'reps': '10-12',
                        'rest': '90 sec'
                    },
                    {
                        'name': 'Barbell Curl',
                        'sets': 3,
                        'reps': '10-12',
                        'rest': '60 sec'
                    },
                    {
                        'name': 'Hammer Curl',
                        'sets': 3,
                        'reps': '12-15',
                        'rest': '60 sec'
                    }
                ]
            },
            assigned_date=datetime.utcnow() - timedelta(days=3),
            due_date=datetime.utcnow() + timedelta(days=4)
        )
        db.session.add(workout2)
        db.session.flush()
        
        # Create logs with fewer completions
        students = User.query.filter_by(role='student').all()
        completion_data = [
            {'duration': 70, 'volume': 5200, 'calories': 370, 'completed': True},
            {'duration': 68, 'volume': 4900, 'calories': 360, 'completed': True},
            {'duration': None, 'volume': None, 'calories': None, 'completed': False},
            {'duration': None, 'volume': None, 'calories': None, 'completed': False},
            {'duration': 72, 'volume': 5400, 'calories': 390, 'completed': True}
        ]
        
        for i, student in enumerate(students):
            data = completion_data[i] if i < len(completion_data) else completion_data[-1]
            log = StudentWorkoutLog(
                assigned_workout_id=workout2.id,
                student_id=student.id,
                completed=data['completed'],
                completed_at=datetime.utcnow() - timedelta(days=1) if data['completed'] else None,
                duration=data['duration'],
                total_volume=data['volume'],
                calories_burned=data['calories']
            )
            db.session.add(log)
        
        print(f"✓ Created assigned workout: {workout2.name}")
    
    # Assigned workout 3: Leg Day (current assignment)
    existing_workout3 = AssignedWorkout.query.filter_by(
        class_id=fitness_class.id,
        name='Leg Day - Week 1'
    ).first()
    
    if not existing_workout3:
        workout3 = AssignedWorkout(
            class_id=fitness_class.id,
            instructor_id=fitness_class.instructor_id,
            name='Leg Day - Week 1',
            description='Lower body strength and power. Remember to warm up properly!',
            workout_template={
                'exercises': [
                    {
                        'name': 'Barbell Squat',
                        'sets': 4,
                        'reps': '8-10',
                        'rest': '3 min'
                    },
                    {
                        'name': 'Romanian Deadlift',
                        'sets': 3,
                        'reps': '10-12',
                        'rest': '2 min'
                    },
                    {
                        'name': 'Bulgarian Split Squat',
                        'sets': 3,
                        'reps': '10-12',
                        'rest': '90 sec'
                    },
                    {
                        'name': 'Dumbbell Lunges',
                        'sets': 3,
                        'reps': '12-15',
                        'rest': '60 sec'
                    },
                    {
                        'name': 'Calf Raises with Dumbbells',
                        'sets': 4,
                        'reps': '15-20',
                        'rest': '60 sec'
                    }
                ]
            },
            assigned_date=datetime.utcnow() - timedelta(days=1),
            due_date=datetime.utcnow() + timedelta(days=6)
        )
        db.session.add(workout3)
        db.session.flush()
        
        # Create logs (mostly incomplete as it's new)
        students = User.query.filter_by(role='student').all()
        for student in students:
            log = StudentWorkoutLog(
                assigned_workout_id=workout3.id,
                student_id=student.id,
                completed=False
            )
            db.session.add(log)
        
        print(f"✓ Created assigned workout: {workout3.name}")
    
    db.session.commit()


def seed_all():
    """Seed all sample data"""
    with app.app_context():
        db.create_all()
        print("✓ Created database tables")
        
        seed_exercises()
        seed_foods()
        
        # Seed class-related data
        print("\n--- Seeding Class Feature Data ---")
        students = seed_students()
        fitness_class = seed_classes()
        seed_assigned_workouts(fitness_class)
        
        print("\n✅ Database seeded successfully!")
        if students:
            print("\n📚 Test Student Accounts:")
            print("   Students: student1-5@fittrack.app / SamplePass123!")
        if fitness_class:
            print(f"\n🏋️ Class Join Code: {fitness_class.join_code}")

if __name__ == '__main__':
    seed_all()

