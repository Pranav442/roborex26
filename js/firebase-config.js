import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9SzR-7VPtXO8DRz-mhiveWYlUYPmhG-I",
  authDomain: "roborex-2026.firebaseapp.com",
  databaseURL: "https://roborex-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "roborex-2026",
  storageBucket: "roborex-2026.firebasestorage.app",
  messagingSenderId: "548873049659",
  appId: "1:548873049659:web:2809eb01a85f5990b02e1e",
  measurementId: "G-3WEEYWQWJC",
};

// Shared app instance. Database/Auth are created only where needed
// so the public dashboard doesn't download the Auth SDK.
export const app = initializeApp(firebaseConfig);
