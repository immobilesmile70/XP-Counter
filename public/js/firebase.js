import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
    getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider, signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getDatabase, ref, get, set, remove, runTransaction } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app-check.js";
import { showPopupWithType } from '/js/script.js';

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

const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeXjCwrAAAAAKqG4_xxkaQ8Q1WWPZI2t1RmAsT1'),
    isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

function mapErrorMessage(error) {
    const errorMap = {
        "auth/invalid-email": "The email address is invalid.",
        "auth/user-not-found": "No account found with that email.",
        "auth/wrong-password": "The password is incorrect.",
        "auth/email-already-in-use": "This email is already in use.",
        "auth/weak-password": "The password is too weak. Try a stronger one.",
        "auth/operation-not-supported-in-this-environment": "This operation is not supported in this environment.",
        "auth/missing-password": "Please enter a password.",
        "auth/invalid-credential": "Invalid login credentials. Try again.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/operation-not-allowed": "This operation is not allowed. Please contact support."
    };

    const code = error.code || error.message;
    return errorMap[code] || "An unexpected error occurred. Please try again.";
}

export const signInWithGoogle = async ({
    filter,
    setJustSignedUp
}) => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const uid = user.uid;

        let rawUsername = user.displayName?.split(" ")[0] || "User";
        rawUsername = rawUsername.toLowerCase();

        if (filter.isProfane(rawUsername)) {
            rawUsername = `user${Math.floor(Math.random() * 10000)}`;
        }

        const snapshot = await get(ref(database, `users/${uid}`));
        if (!snapshot.exists()) {
            const allUsers = (await get(ref(database, "users"))).val() || {};
            let usernameTaken = Object.values(allUsers).some(user => user.username === rawUsername);

            while (usernameTaken) {
                rawUsername = `${rawUsername}${Math.floor(Math.random() * 1000)}`;
                usernameTaken = Object.values(allUsers).some(user => user.username === rawUsername);
            }

            await set(ref(database, `users/${uid}`), {
                username: rawUsername,
                "E-Mail": user.email,
                xp: 0
            });

            localStorage.setItem('username', rawUsername);

            setJustSignedUp();

        } else {
            const userData = snapshot.val();
            if (!userData.username) {
                rawUsername = `user${Math.floor(Math.random() * 10000)}`;
                await set(ref(database, `users/${uid}/username`), rawUsername);
                localStorage.setItem('username', rawUsername);
                console.log(`Fallback: Username set for user ${uid}: ${rawUsername}`);
            } else {
                rawUsername = userData.username;
                localStorage.setItem('username', rawUsername);
            }
        }

        console.log(`Signed in as: ${rawUsername}`);

    } catch (error) {
        console.error("Google Sign-in error:", error.message);
        const mappedMessage = mapErrorMessage(error);
        showPopupWithType("Google Sign-in failed: " + mappedMessage, false);
    }
};

// --- Task Helper Functions for XP Counter ---
export function getUserId() {
    return auth.currentUser ? auth.currentUser.uid : null;
}

export async function updateTaskInFirebase(uid, task) {
    if (!uid || !task || !task.id) return;
    const taskRef = ref(database, `users/${uid}/tasks/${task.id}`);
    await set(taskRef, JSON.parse(JSON.stringify(task)));
}

export async function deleteTaskFromFirebase(uid, taskId) {
    if (!uid || !taskId) return;
    await remove(ref(database, `users/${uid}/tasks/${taskId}`));
}

export async function loadTasksFromFirebase(uid) {
    if (!uid) return [];
    const snapshot = await get(ref(database, `users/${uid}/tasks`));
    if (!snapshot.exists()) return [];
    const tasksObj = snapshot.val();
    return Object.values(tasksObj || {});
}

/**
 * Increment the user's taskCount in Firebase by 1.
 */
export async function incrementTaskCount(uid) {
    if (!uid) return;
    const countRef = ref(database, `users/${uid}/taskCount`);
    await runTransaction(countRef, (current) => {
        return (typeof current === 'number' ? current : 0) + 1;
    });
}

/**
 * Decrement the user's taskCount in Firebase by 1 (min 0).
 */
export async function decrementTaskCount(uid) {
    if (!uid) return;
    const countRef = ref(database, `users/${uid}/taskCount`);
    await runTransaction(countRef, (current) => {
        const next = (typeof current === 'number' ? current : 0) - 1;
        return next < 0 ? 0 : next;
    });
}

export {
    auth, database, deleteUser, ref, set, get, remove, reauthenticateWithCredential, EmailAuthProvider, signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    appCheck 
};