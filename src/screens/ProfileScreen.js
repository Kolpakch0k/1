// src/screens/ProfileScreen.js
// Displays user metadata, encryption count, activity history and logout.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import useStore from '../store/useStore';
import { logoutUser, getUserProfile } from '../services/authService';
import { getActivityHistory } from '../services/firestoreService';
import { formatDate, formatDateTime } from '../utils/helpers';

const ProfileScreen = () => {
  const user = useStore((s) => s.user);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [prof, hist] = await Promise.all([
        getUserProfile(user.uid),
        getActivityHistory(user.uid),
      ]);
      setProfile(prof);
      setHistory(hist);
    } catch (err) {
      console.warn('Profile fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ── Logout ──
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutUser();
          } catch (err) {
            Alert.alert('Error', 'Could not log out.');
          }
        },
      },
    ]);
  };

  // ── Action badge color ──
  const actionIcon = (action) => {
    switch (action) {
      case 'Encrypted':
        return 'lock';
      case 'Saved':
        return 'download';
      case 'Deleted':
        return 'trash-2';
      default:
        return 'activity';
    }
  };

  // ── Render activity item ──
  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <Feather name={actionIcon(item.action)} size={18} color="#FFFFFF" />
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyAction}>{item.action}</Text>
        <Text style={styles.historyFile} numberOfLines={1}>
          {item.fileName}
        </Text>
        <Text style={styles.historyMeta}>
          {item.cipherMethod === 'letter' ? 'Letter Cipher' : 'Hieroglyph'}{' '}
          · {formatDateTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  // ── Header component ──
  const ListHeader = () => (
    <View>
      {/* User info card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Feather name="user" size={32} color="#000000" />
        </View>
        <Text style={styles.nickname}>
          {user?.displayName || profile?.nickname || '—'}
        </Text>
        <Text style={styles.meta}>
          Registered: {formatDate(profile?.createdAt)}
        </Text>
        <Text style={styles.meta}>
          Total encryptions: {profile?.totalEncryptions ?? 0}
        </Text>
      </View>

      {/* Section title */}
      <Text style={styles.sectionTitle}>Activity History</Text>
      {history.length === 0 && !loading && (
        <Text style={styles.emptyText}>No activity yet.</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={20} color="#000000" />
            <Text style={styles.logoutText}>  Logout</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

export default ProfileScreen;

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 24, paddingBottom: 40 },
  // Profile card
  profileCard: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nickname: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  meta: { color: '#666666', fontSize: 13, marginTop: 4 },
  // Section
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: { color: '#666666', fontSize: 14 },
  // History item
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyContent: { flex: 1 },
  historyAction: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  historyFile: { color: '#FFFFFF', fontSize: 13, marginTop: 2 },
  historyMeta: { color: '#666666', fontSize: 11, marginTop: 4 },
  // Logout
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  logoutText: { color: '#000000', fontSize: 16, fontWeight: '700' },
});
