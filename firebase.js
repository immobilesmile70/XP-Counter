import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
    getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider, signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app-check.js";

const firebaseConfig = {
    apiKey: "AIzaSyAR3CuLQ0s1rBd8wPD36HDh52HJK-bT8bc",
    authDomain: "audio-5dacc.firebaseapp.com",
    databaseURL: "https://audio-5dacc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "audio-5dacc",
    storageBucket: "audio-5dacc.appspot.com",
    messagingSenderId: "65019243405",
    appId: "1:65019243405:web:101aeceae44cb00a172bc4"
};

const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeXjCwrAAAAAKqG4_xxkaQ8Q1WWPZI2t1RmAsT1'),
    isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);
const database = getDatabase(app);

export {
    auth, database, deleteUser, ref, set, get, remove, reauthenticateWithCredential, EmailAuthProvider, signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
};