import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB4LapoPYFyoLH6FEPe4JG0G4PM09Vga_M",
    authDomain: "fundagencyai.firebaseapp.com",
    projectId: "fundagencyai",
    storageBucket: "fundagencyai.firebasestorage.app",
    messagingSenderId: "757278589662",
    appId: "1:757278589662:web:35d810f8255647d7b7384f",
    measurementId: "G-HMHYPTLG7L",
    // Inferred database URL for RTDB - standard for creating new projects
    databaseURL: "https://fundagencyai-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);
