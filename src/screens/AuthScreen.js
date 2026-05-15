// src/screens/AuthScreen.js
// Single authentication screen with Login / Register toggle.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { registerUser, loginUser } from '../services/authService';
import { isValidNickname } from '../utils/helpers';

const AuthScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Nickname handler with validation ──
  const handleNicknameChange = (text) => {
    // Strip characters that don't match allowed set, enforce max 30
    const cleaned = text.replace(/[^A-Za-z0-9_]/g, '').slice(0, 30);
    setNickname(cleaned);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!nickname || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!isValidNickname(nickname)) {
      Alert.alert('Error', 'Nickname may only contain A-Z, a-z, 0-9, _');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(nickname, password);
      } else {
        await loginUser(nickname, password);
      }
      // Navigation is handled by the auth state listener in App.js
    } catch (err) {
      let msg = 'Something went wrong.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This nickname is already registered.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid nickname or password.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Invalid nickname or password.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak (min 6 chars).';
      }
      Alert.alert('Authentication Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Title */}
        <View style={styles.header}>
          <Feather name="lock" size={48} color="#FFFFFF" />
          <Text style={styles.title}>CipherVault</Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Create an account' : 'Sign in to continue'}
          </Text>
        </View>

        {/* Nickname */}
        <View style={styles.inputWrapper}>
          <Feather
            name="user"
            size={20}
            color="#666666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nickname"
            placeholderTextColor="#666666"
            value={nickname}
            onChangeText={handleNicknameChange}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.charCount}>{nickname.length}/30</Text>
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Feather
            name="key"
            size={20}
            color="#666666"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#666666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegister ? 'Register' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle */}
        <TouchableOpacity
          onPress={() => setIsRegister((v) => !v)}
          style={styles.toggleBtn}
        >
          <Text style={styles.toggleText}>
            {isRegister
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

// ── Styles ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    color: '#666666',
    fontSize: 14,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  charCount: {
    color: '#666666',
    fontSize: 12,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
