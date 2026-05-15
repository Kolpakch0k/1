# 🔐 CipherVault — File Encryption App

A React Native (Expo) mobile application that encrypts files using visual cipher methods with Firebase authentication and cloud logging.

---

## ✨ Features

- **Two cipher methods**: Letter Cipher (Atbash A↔Z) & Hieroglyph Mapping (Latin → CJK Unicode)
- **Firebase Authentication** — register / login with nickname + password
- **Cloud Firestore** — activity history & encryption counts synced in real-time
- **Black & White UI** — strict minimalist design, zero gradients
- **Two tabs** — Home (encrypt files) & Profile (history + stats)
- **Native file picker** — select any file type for encryption

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm / yarn | latest |
| Expo CLI | `npx expo` (bundled) |
| Firebase project | Free tier is fine |

### 1. Clone & Install

```bash
cd CipherVault
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
2. Enable **Email/Password** sign-in under **Authentication → Sign-in method**.
3. Create a **Cloud Firestore** database (start in **test mode** or apply the rules below).
4. Copy your **web app config** from **Project Settings → General → Your apps → Config**.
5. Open `src/services/firebaseConfig.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:xxxxxxxxxxxxxxxxxxxx',
};
```

### 3. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /activityHistory/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 4. Run

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) or press `a` / `i` to open an emulator.

---

## 📁 Project Structure

```
CipherVault/
├── App.js                          # Root — auth listener & navigation switch
├── app.json                        # Expo configuration
├── package.json
├── babel.config.js
├── assets/
└── src/
    ├── navigation/
    │   └── AppNavigator.js         # Bottom tabs (Home & Profile)
    ├── screens/
    │   ├── AuthScreen.js           # Login / Register screen
    │   ├── HomeScreen.js           # Cipher selection, file pick, encrypt
    │   └── ProfileScreen.js        # Stats, history, logout
    ├── services/
    │   ├── firebaseConfig.js       # Firebase init (auth + Firestore)
    │   ├── authService.js          # register / login / logout helpers
    │   └── firestoreService.js     # Activity logging & counters
    ├── store/
    │   └── useStore.js             # Zustand global state
    └── utils/
        ├── ciphers.js              # Letter Cipher & Hieroglyph Cipher
        └── helpers.js              # Date formatting, validation
```

---

## 🔒 Encryption Note

The ciphers included are **demo-grade** (Atbash substitution + Unicode remapping).

> **For production**, integrate **AES-256** via `crypto-js` or `react-native-quick-crypto`.

---

## 📝 License

MIT
