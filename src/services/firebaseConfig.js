// src/services/firebaseConfig.js
// ─────────────────────────────────────────────────────────
// Firebase configuration for CipherVault.
// Replace the placeholder values below with your own
// Firebase project credentials from the Firebase Console.
// ─────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ⚠️  IMPORTANT — paste YOUR Firebase config here.
// Go to Firebase Console → Project Settings → General → Your apps → Config.
const firebaseConfig = {
  apiKey: 'AIzaSyAQpxafxJxr605W_IIbl17fg6ggSL-RwNM',
  authDomain: 'ciper-bc124.firebaseapp.com',
  projectId: 'ciper-bc124',
  storageBucket: 'ciper-bc124.firebasestorage.app',
  messagingSenderId: '272401440120',
  appId: '1:272401440120:web:1db7e083efc33fb58bbc8d',
};

// Initialise Firebase app
const app = initializeApp(firebaseConfig);

// Auth — use persistence on native, default on web
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Firestore
const db = getFirestore(app);

export { app, auth, db };
