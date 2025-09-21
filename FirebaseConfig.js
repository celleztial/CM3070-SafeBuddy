// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAivngjRXiEtt6Cx4_aUXSJXDpibdl9FAQ",
  authDomain: "safebuddy-17537.firebaseapp.com",
  projectId: "safebuddy-17537",
  storageBucket: "safebuddy-17537.firebasestorage.app",
  messagingSenderId: "396196365009",
  appId: "1:396196365009:web:22d5055ed5558897b63bf0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);