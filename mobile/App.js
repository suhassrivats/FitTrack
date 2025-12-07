import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LogWorkoutScreen from './src/screens/LogWorkoutScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';
import ExerciseDetailsScreen from './src/screens/ExerciseDetailsScreen';
import FoodRecommendationsScreen from './src/screens/FoodRecommendationsScreen';
import MacroTrackingScreen from './src/screens/MacroTrackingScreen';
import MealPlannerScreen from './src/screens/MealPlannerScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import CreateRoutineScreen from './src/screens/CreateRoutineScreen';
import UnitsScreen from './src/screens/UnitsScreen';
import ClassesScreen from './src/screens/ClassesScreen';
import ClassDetailsScreen from './src/screens/ClassDetailsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import AssignedWorkoutsScreen from './src/screens/AssignedWorkoutsScreen';
import AssignWorkoutScreen from './src/screens/AssignWorkoutScreen';
import EditAssignedWorkoutScreen from './src/screens/EditAssignedWorkoutScreen';
import LogAssignedWorkoutScreen from './src/screens/LogAssignedWorkoutScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

// Import API configuration
import { setAuthToken } from './src/services/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#102216',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#13ec5b',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="dumbbell" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Classes"
        component={ClassesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="school" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Listen for storage changes (when user logs in/out)
    const interval = setInterval(() => {
      checkAuthSilently();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // Validate token format before using it
        console.log('Found token, setting auth...');
        setAuthToken(token);
        setIsAuthenticated(true);
      } else {
        console.log('No token found, user needs to login');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear invalid tokens
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthSilently = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#102216' },
          }}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} />
              <Stack.Screen name="LogAssignedWorkout" component={LogAssignedWorkoutScreen} />
              <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
              <Stack.Screen name="Units" component={UnitsScreen} />
              <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
              <Stack.Screen name="FoodRecommendations" component={FoodRecommendationsScreen} />
              <Stack.Screen name="MacroTracking" component={MacroTrackingScreen} />
              <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
              <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
              <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
              <Stack.Screen name="AssignedWorkouts" component={AssignedWorkoutsScreen} />
              <Stack.Screen name="AssignWorkout" component={AssignWorkoutScreen} />
              <Stack.Screen name="EditAssignedWorkout" component={EditAssignedWorkoutScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

