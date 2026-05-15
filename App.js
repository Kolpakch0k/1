// App.js
// Root component — listens for Firebase auth state and switches between
// AuthScreen and the main tab navigator.

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';
import useStore from './src/store/useStore';
import AuthScreen from './src/screens/AuthScreen';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const setUser = useStore((s) => s.setUser);
  const user = useStore((s) => s.user);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      if (initialising) setInitialising(false);
    });
    return unsubscribe;
  }, []);

  // Show loading spinner while Firebase resolves auth state
  if (initialising) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#FFFFFF',
            background: '#000000',
            card: '#000000',
            text: '#FFFFFF',
            border: '#FFFFFF',
            notification: '#FFFFFF',
          },
        }}
      >
        {user ? <AppNavigator /> : <AuthScreen />}
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
