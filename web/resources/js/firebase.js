// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDfp0NsUP-huAs2n7PcEtrWrGy7gsIsuns",
    authDomain: "quickdrop-f647e.firebaseapp.com",
    projectId: "quickdrop-f647e",
    storageBucket: "quickdrop-f647e.firebasestorage.app",
    messagingSenderId: "458174786803",
    appId: "1:458174786803:web:5d570fbbd8d280f55d5b86",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const messaging = getMessaging(app);

export { db, messaging, app };
