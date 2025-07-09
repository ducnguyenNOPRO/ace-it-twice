// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJMSdaXqPgxu0wCyXrpFguftB8iQj_0qE",
  authDomain: "ace-it-twice.firebaseapp.com",
  projectId: "ace-it-twice",
  storageBucket: "ace-it-twice.firebasestorage.app",
  messagingSenderId: "525083693658",
  appId: "1:525083693658:web:fa9cf155419e79b43bbe63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth}