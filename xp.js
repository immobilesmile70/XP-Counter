import {
    auth, ref, set, database, get, onAuthStateChanged
} from './firebase.js';
import { showPopupWithType } from './script.js';

let popupTimeout = null;
let isInfoPopup = false;
let flushDelay = 4200;
let pendingXP = 0;
let flushTimeout = null;
let localUsername = null;

export async function initXPHandlers(user, showPopup, toggleShimmer, updateXPDisplay) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const xpElement = document.getElementById("xp");
            if (!xpElement) {
                showPopupWithType("XP element not found in the DOM.", false);
                return;
            }
            const userRef = ref(database, `users/${user.uid}`);
            try {
                const userSnap = await get(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.val();
                    localUsername = userData.username;
                    const xp = parseInt(userData.xp || 0);
                    updateXPDisplay(xp);
                    xpElement.textContent = xp;
                    document.querySelectorAll(".xp-button").forEach(button => {
                        button.addEventListener("click", () => {
                            const change = parseInt(button.dataset.xp);
                            const currentXP = parseInt(xpElement.textContent || "0");
                            const newXP = currentXP + change;
                            if (newXP < -1000) {
                                showPopupWithType("XP cannot be less than -1000.", false);
                                return;
                            }
                            toggleShimmer("xp", true);
                            toggleShimmer("xp-tex", true);
                            setTimeout(() => {
                                toggleShimmer("xp", false);
                                toggleShimmer("xp-tex", false);
                            }, 300);
                            updateXPDisplay(newXP);
                            xpElement.textContent = newXP;
                            pendingXP = newXP;
                            if (flushTimeout) clearTimeout(flushTimeout);
                            flushTimeout = setTimeout(async () => {
                                try {
                                    await set(ref(database, `users/${auth.currentUser.uid}/xp`), pendingXP);
                                    console.log(`Flushed ${pendingXP} XP to the server.`);
                                    pendingXP = 0;
                                } catch (error) {
                                    console.error("Error flushing XP to the server:", error);
                                    showPopupWithType("Failed to send XP to the server.", false);
                                }
                            }, flushDelay);
                        });
                    });
                    const resetButton = document.getElementById("reset-xp");
                    if (!resetButton) {
                        showPopupWithType("Reset XP button not found in the DOM.", false);
                        return;
                    }
                    resetButton.addEventListener("click", async () => {
                        const currentXP = parseInt(xpElement.textContent || "0");
                        if (currentXP === 0 && pendingXP === 0) {
                            showPopupWithType("XP is already zero.", false);
                            return;
                        }
                        toggleShimmer("xp", true);
                        toggleShimmer("xp-tex", true);
                        setTimeout(() => {
                            toggleShimmer("xp", false);
                            toggleShimmer("xp-tex", false);
                        }, 300);
                        try {
                            pendingXP = 0;
                            clearTimeout(flushTimeout);
                            flushTimeout = null;
                            if (currentXP !== 0) {
                                await set(ref(database, `users/${auth.currentUser.uid}/xp`), 0);
                            }
                            updateXPDisplay(0);
                            xpElement.textContent = 0;
                            showPopupWithType("XP successfully reset!", true);
                        } catch (error) {
                            showPopupWithType("Error resetting XP: " + error.message, false);
                        }
                    });
                } else {
                    await set(ref(database, `users/${user.uid}/xp`), 0);
                    updateXPDisplay(0);
                    xpElement.textContent = 0;
                }
            } catch (error) {
                showPopupWithType("Error fetching XP from the server: " + error.message, false);
            }
        } else {
            console.warn("No user signed in");
        }
    });
}

export async function pushXPToFirebase(xp) {
    if (!auth.currentUser) {
        throw new Error("No user is currently signed in.");
    }
    try {
        const userXPRef = ref(database, `users/${auth.currentUser.uid}/xp`);
        const currentXPSnap = await get(userXPRef);
        let currentXP = 0;
        if (currentXPSnap.exists()) {
            currentXP = parseInt(currentXPSnap.val() || 0);
        }
        const newXP = currentXP + xp;
        await set(userXPRef, newXP);
        const xpElement = document.getElementById("xp");
        if (xpElement) xpElement.textContent = newXP;
        return newXP;
    } catch (error) {
        throw new Error("Failed to push XP to Firebase: " + error.message);
    }
}