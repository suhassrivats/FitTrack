import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base API URL - change this to your backend URL
// iOS Simulator: use localhost
// Android Emulator: use 10.0.2.2 (maps to host machine's localhost)
// Physical Device: use your computer's IP address
// Web: use localhost
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api'
  : Platform.OS === 'ios'
    ? 'http://localhost:5000/api'  // iOS Simulator can access localhost
    : 'http://10.0.2.2:5000/api';  // Android Emulator (or use your computer's IP for physical device)

// Export for use in screens
export const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Auth token error:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    // Clear invalid tokens on 401 unauthorized errors
    if (error.response?.status === 401) {
      console.log('Clearing invalid auth token due to 401');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Workout APIs
export const workoutAPI = {
  getWorkouts: (params) => api.get('/workouts', { params }),
  getWorkout: (id) => api.get(`/workouts/${id}`),
  createWorkout: (data) => api.post('/workouts', data),
  updateWorkout: (id, data) => api.put(`/workouts/${id}`, data),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`),
  getStats: () => api.get('/workouts/stats'),
  getRoutines: () => api.get('/workouts/routines'),
  getRoutine: (id) => api.get(`/workouts/routines/${id}`),
  createRoutine: (data) => api.post('/workouts/routines', data),
};

// Exercise APIs
export const exerciseAPI = {
  getExercises: (params) => api.get('/exercises', { params }),
  getExercise: (id) => api.get(`/exercises/${id}`),
  createExercise: (data) => api.post('/exercises', data),
};

// Nutrition APIs
export const nutritionAPI = {
  getMeals: (params) => api.get('/nutrition/meals', { params }),
  createMeal: (data) => api.post('/nutrition/meals', data),
  deleteMeal: (id) => api.delete(`/nutrition/meals/${id}`),
  getFoods: (params) => api.get('/nutrition/foods', { params }),
  getFood: (id) => api.get(`/nutrition/foods/${id}`),
  createFood: (data) => api.post('/nutrition/foods', data),
  getGoals: () => api.get('/nutrition/goals'),
  updateGoals: (data) => api.put('/nutrition/goals', data),
  getDailySummary: (params) => api.get('/nutrition/daily-summary', { params }),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  getStats: () => api.get('/profile/stats'),
};

// Class APIs
export const classAPI = {
  getClasses: () => api.get('/classes'),
  getClass: (id) => api.get(`/classes/${id}`),
  createClass: (data) => api.post('/classes', data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/classes/${id}`),
  joinClass: (data) => api.post('/classes/join', data),
  getMembers: (id) => api.get(`/classes/${id}/members`),
  removeMember: (classId, studentId) => api.delete(`/classes/${classId}/members/${studentId}`),
  getJoinRequests: (classId) => api.get(`/classes/${classId}/join-requests`),
  acceptJoinRequest: (classId, requestId) => api.post(`/classes/${classId}/join-requests/${requestId}/accept`),
  rejectJoinRequest: (classId, requestId) => api.post(`/classes/${classId}/join-requests/${requestId}/reject`),
  assignWorkout: (classId, data) => api.post(`/classes/${classId}/assign-workout`, data),
  getAssignedWorkouts: (classId) => api.get(`/classes/${classId}/assigned-workouts`),
  getAssignedWorkout: (classId, workoutId) => api.get(`/classes/${classId}/assigned-workouts/${workoutId}`),
  updateAssignedWorkout: (classId, workoutId, data) => api.put(`/classes/${classId}/assigned-workouts/${workoutId}`, data),
  deleteAssignedWorkout: (classId, workoutId) => api.delete(`/classes/${classId}/assigned-workouts/${workoutId}`),
  completeWorkout: (classId, workoutId, data) => api.post(`/classes/${classId}/assigned-workouts/${workoutId}/complete`, data),
  getLeaderboard: (classId) => api.get(`/classes/${classId}/leaderboard`),
  getClassStats: (classId) => api.get(`/classes/${classId}/stats`),
};

export default api;

