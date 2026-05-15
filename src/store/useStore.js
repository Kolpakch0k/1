// src/store/useStore.js
// Global state management with Zustand.

import { create } from 'zustand';

const useStore = create((set) => ({
  // ── Auth ──
  user: null,
  setUser: (user) => set({ user }),

  // ── Profile data from Firestore ──
  profile: null,
  setProfile: (profile) => set({ profile }),

  // ── Activity history ──
  history: [],
  setHistory: (history) => set({ history }),

  // ── Home screen state ──
  selectedCipher: null, // 'letter' | 'hieroglyph'
  setSelectedCipher: (method) => set({ selectedCipher: method }),

  selectedFile: null, // { name, uri, size, mimeType }
  setSelectedFile: (file) => set({ selectedFile: file }),

  encryptedUri: null,
  setEncryptedUri: (uri) => set({ encryptedUri: uri }),

  isProcessing: false,
  setIsProcessing: (v) => set({ isProcessing: v }),

  modalVisible: false,
  setModalVisible: (v) => set({ modalVisible: v }),

  // ── Reset home state ──
  resetHome: () =>
    set({
      selectedFile: null,
      encryptedUri: null,
      isProcessing: false,
      modalVisible: false,
    }),
}));

export default useStore;
