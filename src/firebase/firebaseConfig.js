const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

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

const db = getFirestore(app);
const auth = getAuth(app);

module.exports = { db, auth };
