// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAPRNSSnCLGmilUNhogSgDRm3GYS26TtIc",
    authDomain: "environment-monitoring-s-166b0.firebaseapp.com",
    databaseURL: "https://environment-monitoring-s-166b0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "environment-monitoring-s-166b0",
    storageBucket: "environment-monitoring-s-166b0.firebasestorage.app",
    messagingSenderId: "473271805681",
    appId: "1:473271805681:web:cd69a4a8378f0b1b7e2b50"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export
const database = getDatabase(app);

export { database };

