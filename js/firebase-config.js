import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9SzR-7VPtXO8DRz-mhiveWYlUYPmhG-I",
  authDomain: "roborex-2026.firebaseapp.com",
  databaseURL: "https://roborex-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "roborex-2026",
  storageBucket: "roborex-2026.firebasestorage.app",
  messagingSenderId: "548873049659",
  appId: "1:548873049659:web:2809eb01a85f5990b02e1e",
  measurementId: "G-3WEEYWQWJC"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);