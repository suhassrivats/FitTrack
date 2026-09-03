import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authAPI, setAuthToken } from '../services/api';
import { GOOGLE_CLIENT_IDS } from '../config/google';

WebBrowser.maybeCompleteAuthSession();

// Expo Go pre-registers the `com.googleusercontent.apps.*` URL scheme on iOS,
// so we can complete the OAuth flow in Expo Go by explicitly using the
// reversed iOS client ID as the redirect URI. Without this override the SDK
// falls back to `exp://...`, which Google rejects with invalid_request.
function reversedIosRedirect() {
  const ios = GOOGLE_CLIENT_IDS.ios;
  if (!ios) return undefined;
  const reversed = ios.split('.').reverse().join('.');
  return `${reversed}:/oauth2redirect`;
}

export default function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_CLIENT_IDS.ios || undefined,
    androidClientId: GOOGLE_CLIENT_IDS.android || undefined,
    webClientId: GOOGLE_CLIENT_IDS.web || undefined,
    redirectUri: Platform.OS === 'ios' ? reversedIosRedirect() : undefined,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params?.id_token || response.authentication?.idToken;
      if (idToken) {
        exchange(idToken);
      } else {
        setLoading(false);
        Alert.alert('Google sign-in failed', 'No ID token returned by Google.');
      }
    } else if (response.type === 'error') {
      setLoading(false);
      Alert.alert(
        'Google sign-in failed',
        response.error?.message || 'Unknown error.'
      );
    } else if (response.type === 'dismiss' || response.type === 'cancel') {
      setLoading(false);
    }
  }, [response]);

  const exchange = async (idToken) => {
    try {
      const res = await authAPI.google({ id_token: idToken });
      if (res.data.access_token) {
        await AsyncStorage.setItem('authToken', res.data.access_token);
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        setAuthToken(res.data.access_token);
      }
    } catch (error) {
      const message =
        error.response?.data?.error || 'Google sign-in failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    console.log('[Google] tap; request ready =', !!request);
    if (
      !GOOGLE_CLIENT_IDS.ios &&
      !GOOGLE_CLIENT_IDS.android &&
      !GOOGLE_CLIENT_IDS.web
    ) {
      Alert.alert(
        'Not configured',
        'Google client IDs are missing. Fill in mobile/src/config/google.js.'
      );
      return;
    }
    if (!request) {
      Alert.alert(
        'Not ready',
        'Google auth request is still initializing. Try again in a moment.'
      );
      return;
    }
    console.log('[Google] redirectUri =', request.redirectUri);
    setLoading(true);
    try {
      const result = await promptAsync();
      console.log('[Google] prompt result type =', result?.type);
    } catch (e) {
      console.log('[Google] prompt error =', e?.message);
      setLoading(false);
      Alert.alert('Google sign-in error', e?.message || String(e));
    }
  };

  return { signIn, loading, ready: !!request };
}
