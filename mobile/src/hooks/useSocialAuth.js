import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert, Platform } from 'react-native';

// Enable dismiss for Google OAuth
WebBrowser.maybeCompleteAuthSession();

const API_URL = 'https://fittrack-api.fly.dev/api';

export const useSocialAuth = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  // Google Auth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      scheme: 'com.fittrack.mobile',
      path: 'redirect'
    }),
  });

  // Handle Google Sign In
  const signInWithGoogle = async () => {
    if (!request) {
      Alert.alert('Error', 'Google Sign In is not ready yet');
      return;
    }

    setLoading(true);
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const { authentication } = result;
        
        // Send token to backend
        const response = await axios.post(`${API_URL}/auth/google`, {
          id_token: authentication.idToken,
        });

        if (response.data.access_token) {
          // Save token
          await AsyncStorage.setItem('auth_token', response.data.access_token);
          onSuccess(response.data);
        }
      } else if (result?.type === 'error') {
        Alert.alert('Error', 'Google Sign In failed');
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple Sign In
  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign In is only available on iOS devices');
      return;
    }

    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send credential to backend
      const response = await axios.post(`${API_URL}/auth/apple`, {
        id_token: credential.identityToken,
        user: credential.fullName ? {
          fullName: {
            givenName: credential.fullName.givenName,
            familyName: credential.fullName.familyName,
          }
        } : null,
      });

      if (response.data.access_token) {
        // Save token
        await AsyncStorage.setItem('auth_token', response.data.access_token);
        onSuccess(response.data);
      }
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      console.error('Apple Sign In error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to sign in with Apple');
    } finally {
      setLoading(false);
    }
  };

  // Check if Apple Sign In is available
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
  
  // Check Apple Sign In availability on mount
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAppleSignInAvailable);
    }
  }, []);

  return {
    signInWithGoogle,
    signInWithApple,
    loading,
    isAppleSignInAvailable,
  };
};

