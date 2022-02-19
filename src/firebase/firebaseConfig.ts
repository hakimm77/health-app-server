import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBi4ht8JwydWBHG7-5iT6ok1AraNpDwVgc",
  authDomain: "health-app-4a25e.firebaseapp.com",
  projectId: "health-app-4a25e",
  storageBucket: "health-app-4a25e.appspot.com",
  messagingSenderId: "221620273686",
  appId: "1:221620273686:web:6bbb9f525868f7f08aeb37",
  measurementId: "G-HK00WRQJZ8",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
