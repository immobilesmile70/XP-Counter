import {
  auth,
  ref,
  set,
  database,
  get,
  onAuthStateChanged,
} from "./firebase.js";
import { showPopupWithType } from "./script.js";

let flushDelay = 4200;
let pendingXP = 0;
let flushTimeout = null;
let localUsername = null;

export async function initXPHandlers(
  user,
  showPopup,
  toggleShimmer,
  updateXPDisplay
) {
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
          animateXP(0, xp);
          xpElement.textContent = xp;
          document.querySelectorAll(".xp-button").forEach((button) => {
            button.addEventListener("click", () => {
              const change = parseInt(button.dataset.xp);
              const currentXP = parseInt(xpElement.textContent || "0");
              const newXP = currentXP + change;
              if (newXP < -1000) {
                showPopupWithType("XP cannot be less than -1000.", false);
                return;
              }
              if (newXP > 1000000) {
                showPopupWithType("XP cannot exceed 1,000,000.", false);
                return;
              }
              animateXP(currentXP, newXP);
              pendingXP = newXP;
              if (flushTimeout) clearTimeout(flushTimeout);
              flushTimeout = setTimeout(async () => {
                try {
                  await set(
                    ref(database, `users/${auth.currentUser.uid}/xp`),
                    pendingXP
                  );
                  console.log(`Flushed ${pendingXP} XP to the server.`);
                  pendingXP = 0;
                } catch (error) {
                  console.error("Error flushing XP to the server:", error);
                  showPopupWithType("Failed to send XP to the server.", false);
                }
              }, flushDelay);
            });
          });
        } else {
          await set(ref(database, `users/${user.uid}/xp`), 0);
          animateXP(0, 0);
          console.warn(
            "User data not found in Firebase, initializing XP to 0."
          );
          xpElement.textContent = 0;
        }
      } catch (error) {
        showPopupWithType(
          "Error fetching XP from the server: " + error.message,
          false
        );
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
    animateXP(currentXP, newXP);
    console.log(`Pushed ${xp} XP to Firebase. New total: ${newXP}`);
    return newXP;
  } catch (error) {
    throw new Error("Failed to push XP to Firebase: " + error.message);
  }
}

function animateXP(currentXP, targetXP) {
  const xpEl = document.getElementById("xp");

  if (currentXP === targetXP) {
    xpEl.textContent = `${targetXP} XP`;
    return;
  }

  const diff = targetXP - currentXP;

  const minDuration = 700;
  const maxDuration = 2000;
  const duration = Math.max(minDuration, maxDuration - diff);
  const frameRate = 60;
  const totalFrames = Math.round((duration / 1000) * frameRate);

  let frame = 0;

  const easeOutQuad = (t) => t * (2 - t);

  const update = () => {
    frame++;
    const progress = frame / totalFrames;
    const eased = easeOutQuad(progress);

    const currentValue = Math.round(currentXP + eased * diff);
    xpEl.textContent = `${currentValue} XP`;

    if (frame < totalFrames) {
      requestAnimationFrame(update);
    } else {
      xpEl.textContent = `${targetXP} XP`;
    }
  };

  requestAnimationFrame(update);
}
