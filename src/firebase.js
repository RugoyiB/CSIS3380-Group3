import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAK_cCqpu-Z9pkTUexID9hSVdsCm5hmgcA",
  authDomain: "silentauction-ca991.firebaseapp.com",
  projectId: "silentauction-ca991",
  storageBucket: "silentauction-ca991.firebasestorage.app",
  messagingSenderId: "721597681145",
  appId: "1:721597681145:web:8c99d2c59d39f733788128"

};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

export default app;
