// src/services/authService.js
// Handles Firebase Authentication operations.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

/**
 * Register a new user with email/password and store nickname in Firestore.
 * We construct a fake email from the nickname so that users only need
 * to type a "username" — Firebase Auth requires email format internally.
 */
export const registerUser = async (nickname, password) => {
  // Build a deterministic email from the nickname
  const email = `${nickname.toLowerCase()}@ciphervault.app`;

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  // Save display name
  await updateProfile(user, { displayName: nickname });

  // Create Firestore user document
  await setDoc(doc(db, 'users', user.uid), {
    nickname,
    email,
    createdAt: serverTimestamp(),
    totalEncryptions: 0,
  });

  return user;
};

/**
 * Login an existing user.
 */
export const loginUser = async (nickname, password) => {
  const email = `${nickname.toLowerCase()}@ciphervault.app`;
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user;
};

/**
 * Sign the current user out.
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * Fetch user profile document from Firestore.
 */
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};
