import {
    auth, ref, set, database, get, onAuthStateChanged
} from './firebase.js';

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
                clearTimeout(popupTimeout);
                isInfoPopup = false;
                showPopup("XP element not found in the DOM.");
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
                                clearTimeout(popupTimeout);
                                isInfoPopup = true;
                                showPopup("XP cannot be less than -1000.");
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
                                    clearTimeout(popupTimeout);
                                    isInfoPopup = false;
                                    showPopup("Failed to send XP to the server.");
                                }
                            }, flushDelay);
                        });
                    });
                    const resetButton = document.getElementById("reset-xp");
                    if (!resetButton) {
                        clearTimeout(popupTimeout);
                        isInfoPopup = false;
                        showPopup("Reset XP button not found in the DOM.");
                        return;
                    }
                    resetButton.addEventListener("click", async () => {
                        const currentXP = parseInt(xpElement.textContent || "0");
                        if (currentXP === 0 && pendingXP === 0) {
                            clearTimeout(popupTimeout);
                            isInfoPopup = true;
                            showPopup("XP is already zero.");
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
                            clearTimeout(popupTimeout);
                            isInfoPopup = true;
                            showPopup("XP successfully reset!");
                        } catch (error) {
                            clearTimeout(popupTimeout);
                            isInfoPopup = false;
                            showPopup("Error resetting XP: " + error.message);
                        }
                    });
                } else {
                    await set(ref(database, `users/${user.uid}/xp`), 0);
                    updateXPDisplay(0);
                    xpElement.textContent = 0;
                    clearTimeout(popupTimeout);
                    isInfoPopup = false;
                    showPopup("XP initialized to zero");
                }
            } catch (error) {
                clearTimeout(popupTimeout);
                isInfoPopup = false;
                showPopup("Error fetching XP from the server: " + error.message);
            }
        } else {
            console.warn("No user signed in");
        }
    });
}