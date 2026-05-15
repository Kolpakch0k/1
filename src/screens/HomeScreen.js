// src/screens/HomeScreen.js
// Main screen: cipher selection, file picker, encryption, result modal.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import useStore from '../store/useStore';
import { encryptContent } from '../utils/ciphers';
import {
  logActivity,
  incrementEncryptions,
} from '../services/firestoreService';

// ── Cipher options ──
const CIPHERS = [
  {
    key: 'letter',
    label: 'Letter Cipher',
    description: 'Atbash: A↔Z substitution',
    icon: 'type',
  },
  {
    key: 'hieroglyph',
    label: 'Hieroglyph Mapping',
    description: 'Latin → CJK Unicode range',
    icon: 'globe',
  },
];

const HomeScreen = () => {
  const user = useStore((s) => s.user);
  const selectedCipher = useStore((s) => s.selectedCipher);
  const setSelectedCipher = useStore((s) => s.setSelectedCipher);

  const [selectedFile, setSelectedFile] = useState(null);
  const [encryptedUri, setEncryptedUri] = useState(null);
  const [encryptedName, setEncryptedName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // ── Pick a file ──
  const handlePickFile = async () => {
    if (!selectedCipher) {
      Alert.alert('Select cipher', 'Please choose an encryption method first.');
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      // User cancelled
      if (result.canceled) return;

      const file = result.assets[0];
      setSelectedFile(file);

      // Start encryption
      await processFile(file);
    } catch (err) {
      Alert.alert('File Error', err.message || 'Could not open file.');
    }
  };

  // ── Encrypt ──
  const processFile = async (file) => {
    setIsProcessing(true);
    try {
      // Read file as UTF-8 string
      const content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Apply cipher
      const encrypted = encryptContent(content, selectedCipher);

      // Write encrypted file to cache
      const outName = `encrypted_${file.name}`;
      const outUri = FileSystem.cacheDirectory + outName;
      await FileSystem.writeAsStringAsync(outUri, encrypted, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setEncryptedUri(outUri);
      setEncryptedName(outName);

      // Log to Firestore
      if (user) {
        await incrementEncryptions(user.uid);
        await logActivity(user.uid, {
          action: 'Encrypted',
          fileName: file.name,
          cipherMethod: selectedCipher,
        });
      }

      setModalVisible(true);
    } catch (err) {
      Alert.alert('Encryption Error', err.message || 'Failed to encrypt file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Modal actions ──
  const handleSave = async () => {
    try {
      // On native we can use Sharing or simply keep in documents dir
      if (Platform.OS !== 'web') {
        const dest =
          FileSystem.documentDirectory + encryptedName;
        await FileSystem.copyAsync({ from: encryptedUri, to: dest });
      }
      if (user) {
        await logActivity(user.uid, {
          action: 'Saved',
          fileName: encryptedName,
          cipherMethod: selectedCipher,
        });
      }
      Alert.alert('Saved', 'Encrypted file saved to app storage.');
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Save Error', err.message || 'Could not save file.');
    }
  };

  const handleContinue = () => {
    setModalVisible(false);
    // Keep current state on Home
  };

  const handleDelete = async () => {
    try {
      if (encryptedUri) {
        await FileSystem.deleteAsync(encryptedUri, { idempotent: true });
      }
      if (user) {
        await logActivity(user.uid, {
          action: 'Deleted',
          fileName: encryptedName,
          cipherMethod: selectedCipher,
        });
      }
    } catch (_) {
      // silent
    }
    setSelectedFile(null);
    setEncryptedUri(null);
    setEncryptedName('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title */}
        <Text style={styles.heading}>Encrypt a File</Text>
        <Text style={styles.subheading}>
          Choose a cipher method, then select a file.
        </Text>

        {/* Cipher list */}
        {CIPHERS.map((c) => {
          const active = selectedCipher === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelectedCipher(c.key)}
              activeOpacity={0.7}
            >
              <View style={styles.cardRow}>
                <Feather
                  name={c.icon}
                  size={24}
                  color={active ? '#000000' : '#FFFFFF'}
                />
                <View style={styles.cardText}>
                  <Text
                    style={[
                      styles.cardTitle,
                      active && styles.cardTitleActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                  <Text
                    style={[
                      styles.cardDesc,
                      active && styles.cardDescActive,
                    ]}
                  >
                    {c.description}
                  </Text>
                </View>
                {active && (
                  <Feather name="check-circle" size={22} color="#000000" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Selected file info */}
        {selectedFile && (
          <View style={styles.fileInfo}>
            <Feather name="file-text" size={18} color="#FFFFFF" />
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
          </View>
        )}

        {/* Pick file button */}
        <TouchableOpacity
          style={[styles.pickButton, isProcessing && styles.buttonDisabled]}
          onPress={handlePickFile}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          {isProcessing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Feather name="folder" size={22} color="#000000" />
              <Text style={styles.pickButtonText}>  Select File</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ── Success Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleContinue}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Feather
              name="check-circle"
              size={48}
              color="#FFFFFF"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.modalTitle}>Successful file encryption</Text>
            <Text style={styles.modalSub}>{encryptedName}</Text>

            {/* Save */}
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Feather name="download" size={20} color="#000000" />
              <Text style={styles.modalBtnText}>  Save</Text>
            </TouchableOpacity>

            {/* Continue */}
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnOutline]}
              onPress={handleContinue}
              activeOpacity={0.7}
            >
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
              <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>
                {'  Continue'}
              </Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnOutline]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={20} color="#FFFFFF" />
              <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>
                {'  Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { padding: 24, paddingBottom: 40 },
  heading: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheading: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 24,
  },
  // Cipher cards
  card: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardActive: {
    backgroundColor: '#FFFFFF',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: { flex: 1, marginLeft: 12 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cardTitleActive: { color: '#000000' },
  cardDesc: { color: '#666666', fontSize: 12, marginTop: 2 },
  cardDescActive: { color: '#000000' },
  // File info
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
  },
  fileName: { color: '#FFFFFF', fontSize: 14, marginLeft: 8, flex: 1 },
  // Pick button
  pickButton: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  pickButtonText: { color: '#000000', fontSize: 16, fontWeight: '700' },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalSub: {
    color: '#666666',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalBtnOutline: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  modalBtnText: { color: '#000000', fontSize: 15, fontWeight: '600' },
});
