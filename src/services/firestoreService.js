// src/services/firestoreService.js
// Handles Firestore read/write for activity history & encryption counts.

import {
  doc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  increment,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Log an activity entry for the user.
 * @param {string} uid       – Firebase Auth UID
 * @param {object} entry     – { action, fileName, cipherMethod }
 */
export const logActivity = async (uid, entry) => {
  const colRef = collection(db, 'users', uid, 'activityHistory');
  await addDoc(colRef, {
    ...entry,
    timestamp: serverTimestamp(),
  });
};

/**
 * Increment the totalEncryptions counter on the user document.
 */
export const incrementEncryptions = async (uid) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { totalEncryptions: increment(1) });
};

/**
 * Fetch all activity entries, sorted newest-first.
 */
export const getActivityHistory = async (uid) => {
  const colRef = collection(db, 'users', uid, 'activityHistory');
  const q = query(colRef, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
