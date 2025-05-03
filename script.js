import {
    auth, deleteUser, ref, set, database, get, remove, reauthenticateWithCredential, EmailAuthProvider, signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from './firebase.js';

document.addEventListener('DOMContentLoaded', () =>  {
    const loginScreen = document.getElementById("login-screen");
    const mainScreen = document.getElementById("main-screen");
    const loadingScreen = document.getElementById("loading-screen");

    const loginButton = document.getElementById("login-button");
    const signUpButton = document.getElementById("signup-button");
    const forgetPassButton = document.getElementById("forget-pass-button");
    const logOutButton = document.getElementById("logout-button");
    const deleteUserButton = document.getElementById("delete-user-button");

    const emailInputLogin = document.getElementById("email-input-login");
    const passwordInputLogin = document.getElementById("password-input-login");

    const usernameInputSignup = document.getElementById("username-input-signup");
    const emailInputSignUp = document.getElementById("email-input-signup");
    const passwordInputSignUp = document.getElementById("password-input-signup");

    const emailInputForgetPass = document.getElementById("email-input-forget-pass");

    const usernameChangeInput = document.getElementById("username-change-input");
    const changeUsernameButton = document.getElementById("change-username-button");

    const loginForm = document.getElementById("login-form");
    const signUpForm = document.getElementById("signup-form");
    const forgetPassForm = document.getElementById("forget-pass-form");
    const loginSwitch = document.getElementById("login-switch");
    const signUpSwitch = document.getElementById("signup-switch");
    const forgetPassSwitch = document.getElementById("forget-pass-switch");
    const fLoginSwitch = document.getElementById("f-login-switch");

    const openSidebarBtn = document.getElementById("open-sidebar-btn");
    const closeSidebarBtn = document.getElementById("close-sidebar-btn");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");

    var sidebarAllowed = false;

    openSidebarBtn.addEventListener("click", () => {
        sidebar.classList.remove("hidden");
        sidebarOverlay.classList.remove("hidden");
    });

    closeSidebarBtn.addEventListener("click", () => {
        sidebar.classList.add("hidden");
        sidebarOverlay.classList.add("hidden");
    });

    sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.add("hidden");
        sidebarOverlay.classList.add("hidden");
    });

    const settingsButton = document.getElementById("settings");
    const settingsScreen = document.getElementById("settings-section");

    const leaderboardButton = document.getElementById("leaderboard");
    const leaderboardScreen = document.getElementById("leaderboard-section");

    const counterButton = document.getElementById("counter");
    const counterScreen = document.getElementById("xp-section");

    const sidebarElement = document.getElementById("sidebar");

    let pendingXP = 0;
    let flushTimeout = null;

    let transitionLock = false;

    counterButton.addEventListener("click", () => {
        showCounter();
    });

    leaderboardButton.addEventListener("click", () => {
        showLeaderboard();
    });

    settingsButton.addEventListener("click", () => {
        showSettings();
    });

    function showScreen(screenToShow, ...screensToHide) {
        if (transitionLock) return;

        transitionLock = true;

        if (sidebarAllowed) {
            sidebar.classList.add("hidden");
            sidebarOverlay.classList.add("hidden");
        }

        screenToShow.classList.remove("hide");
        setTimeout(() => screenToShow.classList.remove("hidden"), 10);

        screensToHide.forEach(screen => screen.classList.add("hidden"));

        setTimeout(() => {
            screensToHide.forEach(screen => screen.classList.add("hide"));
            transitionLock = false;
        }, 350);
    }

    function showCounter() {
        showScreen(counterScreen, leaderboardScreen, settingsScreen);
    }

    function showLeaderboard() {
        showScreen(leaderboardScreen, counterScreen, settingsScreen);
    }

    function showSettings() {
        showScreen(settingsScreen, leaderboardScreen, counterScreen);
    }

    const popup = document.getElementById('popup');
    const closePopupButton = document.getElementById("close-popup-button");
    let popupTimeout = null;
    let isInfoPopup = false;
  
    let localUsername = null;

    let justSignedUp = false;

    let flushDelay = 4200;

    const userNameTextHome = document.getElementById("username-text-home");

    usernameChangeInput.addEventListener("blur", () => {
        setTimeout(() => {
            usernameChangeInput.value = localUsername || "Student";
        }, 700);
    });

    changeUsernameButton.addEventListener("click", async () => {
        const newUsername = usernameChangeInput.value.trim();
        if (!newUsername) {
            clearTimeout(popupTimeout);
            isInfoPopup = true;
            showPopup("Username cannot be empty.");
            return;
        }
        if (newUsername === localUsername) {
            clearTimeout(popupTimeout);
            isInfoPopup = true;
            showPopup("New username cannot be the same as the current username.");
            return;
        }
        /*if (filter.isProfane(newUsername)) {
            clearTimeout(popupTimeout);
            isInfoPopup = false;
            showPopup("Username contains profanity. Please choose another one.");
            return;
        }*/
        try {
            const usersSnap = await get(ref(database, "users"));
            const usersData = usersSnap.val() || {};
            const usernameTaken = Object.values(usersData).some(user => user.username === newUsername);
            if (usernameTaken) {
                clearTimeout(popupTimeout);
                isInfoPopup = true;
                showPopup("Username already taken. Please choose another one.");
                return;
            }
            await set(ref(database, `users/${auth.currentUser.uid}/username`), newUsername);
            localUsername = newUsername;
            usernameChangeInput.value = localUsername;
            userNameTextHome.textContent = localUsername || "Student";
            clearTimeout(popupTimeout);
            isInfoPopup = true;
            showPopup("Username successfully updated!");
        } catch (error) {
            clearTimeout(popupTimeout);
            isInfoPopup = false;
            showPopup("Error updating username: " + error.message);
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (user && !justSignedUp) {
            const userSnap = await get(ref(database, `users/${user.uid}`));
            if (userSnap.exists()) {
                localUsername = userSnap.val().username;
                usernameChangeInput.value = localUsername;
                clearTimeout(popupTimeout);
                isInfoPopup = true;
                showPopup(`Signed in as: ${localUsername}`);
                fadeScreen(loginScreen, mainScreen);
            } else {
                clearTimeout(popupTimeout);
                isInfoPopup = true;
                showPopup("No user data found.");
                localUsername = "Student404";
                fadeScreen(loginScreen, mainScreen);
            }
        } else {
            console.warn("No user signed in.");
            fadeScreen(mainScreen, loginScreen);
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (justSignedUp) {
                justSignedUp = false;
                return;
            }
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

    function updateXPDisplay(xp) {
        const xpElement = document.getElementById("xp");
        if (xpElement) xpElement.textContent = xp;
    }

    loginSwitch.addEventListener("click", () => {
        loginForm.classList.remove("hidden");
        signUpForm.classList.add("hidden");
        forgetPassForm.classList.add("hidden");
    });

    fLoginSwitch.addEventListener("click", () => {
        loginForm.classList.remove("hidden");
        signUpForm.classList.add("hidden");
        forgetPassForm.classList.add("hidden");
    });

    signUpSwitch.addEventListener("click", () => {
        signUpForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        forgetPassForm.classList.add("hidden");
    });

    forgetPassSwitch.addEventListener("click", () => {
        forgetPassForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        signUpForm.classList.add("hidden");
    });

    loginButton.addEventListener("click", () => {
        const email = emailInputLogin.value.trim();
        const password = passwordInputLogin.value.trim();

        if (email && password) {
            signInWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    const userSnap = await get(ref(database, `users/${user.uid}`));
                    if (userSnap.exists()) {
                        localUsername = userSnap.val().username;
                    } else {
                        clearTimeout(popupTimeout);
                        isInfoPopup = false;
                        showPopup("User data not found.");
                    }
                    await fadeScreen(loginScreen, mainScreen);
                })
                .catch((error) => {
                    const mappedMessage = mapErrorMessage(error);
                    clearTimeout(popupTimeout);
                    isInfoPopup = false;
                    showPopup(`Login Failed: ${mappedMessage}`);
                });
        } else {
            clearTimeout(popupTimeout);
            isInfoPopup = false;
            showPopup("Please enter both email and password.");
        }
    });

    logOutButton.addEventListener("click", () => {
        signOut(auth)
            .then(async () => {
                await fadeScreen(mainScreen, loginScreen);
                emailInputLogin.value = "";
                passwordInputLogin.value = "";
                emailInputSignUp.value = "";
                passwordInputSignUp.value = "";
                emailInputForgetPass.value = "";
                usernameInputSignup.value = "";
                updateXPDisplay(0);
                loginForm.classList.remove("hidden");
                signUpForm.classList.add("hidden");
                forgetPassForm.classList.add("hidden");
                localUsername = null;
                showCounter();
            })
            .catch((error) => {
                const mappedMessage = mapErrorMessage(error);
                clearTimeout(popupTimeout);
                isInfoPopup = false;
                showPopup(`Error Signing Out: ${mappedMessage}`);
            });
    });

    deleteUserButton.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const credential = EmailAuthProvider.credential(user.email, prompt("Please re-enter your password:"));
                await reauthenticateWithCredential(user, credential);
                await remove(ref(database, `users/${user.uid}`));
                await deleteUser(user);
                console.log("User deleted successfully");
                await fadeScreen(mainScreen, loginScreen);
                emailInputLogin.value = "";
                passwordInputLogin.value = "";
                emailInputSignUp.value = "";
                passwordInputSignUp.value = "";
                emailInputForgetPass.value = "";
                usernameInputSignup.value = "";
                updateXPDisplay(0);
                showCounter();
                signUpForm.classList.remove("hidden");
                loginForm.classList.add("hidden");
                forgetPassForm.classList.add("hidden");
                localUsername = null;
            } catch (error) {
                const mappedMessage = mapErrorMessage(error);
                clearTimeout(popupTimeout);
                isInfoPopup = false;
                showPopup(`Error deleting user: ${mappedMessage}`);
            }
        } else {
            console.log("No user is currently signed in.");
        }
    });

    signUpButton.addEventListener("click", () => {
        const username = usernameInputSignup.value.trim();
        const email = emailInputSignUp.value.trim();
        const password = passwordInputSignUp.value.trim();

        if (username && email && password) {
            get(ref(database, "users")).then(async (snapshot) => {
                const usersData = snapshot.val() || {};
                const usernameTaken = Object.values(usersData).some(user => user.username === username);
                if (usernameTaken) {
                    clearTimeout(popupTimeout);
                    isInfoPopup = false;
                    showPopup("Username already taken. Please choose another one.");
                }
                /*else if (filter.isProfane(username)) {
                    clearTimeout(popupTimeout);
                    isInfoPopup = false;
                    showPopup("Username contains profanity. Please choose another one.");
                } else if (filter.isProfane(email)) {
                    clearTimeout(popupTimeout);
                    isInfoPopup = false;
                    showPopup("Email contains profanity. Please choose another one.");
                }*/
                else {
                    justSignedUp = true;
                    createUserWithEmailAndPassword(auth, email, password)
                        .then(async (userCredential) => {
                            const user = userCredential.user;
                            await set(ref(database, `users/${user.uid}`), {
                                username: username,
                                "E-Mail": email,
                                xp: 0
                            });
                            localUsername = username;
                            await fadeScreen(loginScreen, mainScreen);
                        })
                        .catch((error) => {
                            const mappedMessage = mapErrorMessage(error);
                            clearTimeout(popupTimeout);
                            showPopup(`SignUp Failed: ${mappedMessage}`);
                        });
                }
            }).catch((error) => {
                showPopup("Error checking username availability: " + error.message);
            });
        } else {
            clearTimeout(popupTimeout);
            isInfoPopup = false;
            showPopup("Please enter your email and password.");
        }
    });

    forgetPassButton.addEventListener("click", () => {
        const email = emailInputForgetPass.value.trim();

        if (email) {
            sendPasswordResetEmail(auth, email)
                .then(async () => {
                    isInfoPopup = true;
                    clearTimeout(popupTimeout);
                    showPopup(`Recovery email sent to ${email}. Please check your inbox.`);
                    loginForm.classList.remove("hidden");
                    forgetPassForm.classList.add("hidden");
                })
                .catch((error) => {
                    const mappedMessage = mapErrorMessage(error);
                    clearTimeout(popupTimeout);
                    isInfoPopup = false;
                    showPopup(`Recovery Failed: ${mappedMessage}`);
                });
        } else {
            clearTimeout(popupTimeout);
            isInfoPopup = false;
            showPopup("Please enter your email to recover your password.");
        }
    });

    function showPopup(message, duration = 3000) {
        const popupMessage = document.getElementById('popup-message');
        popupMessage.textContent = message;

        if (isInfoPopup) {
            popup.style.backgroundColor = "rgb(0, 118, 186)";
            closePopupButton.style.backgroundColor = "rgb(0, 80, 126)";
        }
        else {
            popup.style.backgroundColor = "rgb(232, 72, 72)";
            closePopupButton.style.backgroundColor = "rgb(174, 43, 43)";
        }

        popup.classList.remove('hide');
        setTimeout(() => { popup.classList.add('show'); }, 100);

        popupTimeout = setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => { popup.classList.add('hide'); }, 100);
        }, duration);
    }

    closePopupButton.addEventListener('click', () => {
        clearTimeout(popupTimeout);
        popup.classList.remove('show');
        setTimeout(() => { popup.classList.add('hide'); }, 100);
    });

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

    function checkScreenSize() {
        if (window.innerWidth < 871) {
            sidebarElement.classList.add('hidden');
            sidebarOverlay.classList.add("hidden");
            sidebarAllowed = true;
        } else {
            sidebarElement.classList.remove('hidden');
            sidebarOverlay.classList.add("hidden");
            sidebarAllowed = false;
        }
    }

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    function toggleShimmer(elementId, shouldShimmer) {
        const el = document.getElementById(elementId);
        if (shouldShimmer) {
            el.classList.add("shimmer");
        } else {
            el.classList.remove("shimmer");
        }
    }

    async function fadeScreen(fromScreen, toScreen, extraDelay = 1000) {
        fromScreen.classList.add("hidden");
        showLoadingScreen();

        await new Promise(resolve => setTimeout(resolve, 1000));

        toScreen.classList.remove("hide");
        fromScreen.classList.add("hide");
        toScreen.classList.remove("hidden");

        await new Promise(resolve => setTimeout(resolve, extraDelay));

        userNameTextHome.textContent = localUsername || "Student";

        hideLoadingScreen();
    }

    function showLoadingScreen() {
        loadingScreen.classList.remove("hide");
        loadingScreen.classList.remove("hidden");
    }

    function hideLoadingScreen() {
        loadingScreen.classList.add("hidden");
        setTimeout(() => {
            loadingScreen.classList.add("hide");
        }, 350);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function getSystemTheme() {
        return mediaQuery.matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        const finalTheme = theme === 'system' ? getSystemTheme() : theme;
        document.documentElement.setAttribute("data-theme", finalTheme);
    }

    let currentTheme = localStorage.getItem('theme') || 'system';
    applyTheme(currentTheme);

    mediaQuery.addEventListener('change', (e) => {
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });

    localStorage.setItem('theme', currentTheme);

    var x, i, j, selElmnt, a, b, c;
    x = document.getElementsByClassName("custom-select");
    for (i = 0; i < x.length; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        for (j = 0; j < selElmnt.options.length; j++) {
            if (selElmnt.options[j].value === currentTheme) {
                selElmnt.selectedIndex = j;
                break;
            }
        }
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");

        for (j = 0; j < selElmnt.length; j++) {
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            if (selElmnt.options[j].value === currentTheme) {
                c.setAttribute("class", "same-as-selected");
            }
            c.addEventListener("click", function (e) {
                const s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                const h = this.parentNode.previousSibling;

                for (var i = 0; i < s.length; i++) {
                    if (s.options[i].innerHTML === this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;

                        currentTheme = s.options[i].value;
                        applyTheme(currentTheme);
                        localStorage.setItem('theme', currentTheme);

                        const y = this.parentNode.getElementsByClassName("same-as-selected");
                        for (var k = 0; k < y.length; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }

        x[i].appendChild(b);
        a.addEventListener("click", function (e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }

    function closeAllSelect(elmnt) {
        const items = document.getElementsByClassName("select-items");
        const selected = document.getElementsByClassName("select-selected");
        for (let i = 0; i < selected.length; i++) {
            if (elmnt == selected[i]) continue;
            selected[i].classList.remove("select-arrow-active");
        }
        for (let i = 0; i < items.length; i++) {
            if (elmnt.nextSibling == items[i]) continue;
            items[i].classList.add("select-hide");
        }
    }

    document.addEventListener("click", closeAllSelect);
});