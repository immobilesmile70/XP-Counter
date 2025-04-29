import {
    auth, deleteUser, ref, set, database, get, remove, reauthenticateWithCredential, EmailAuthProvider, signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById("login-screen");
    const mainScreen = document.getElementById("main-screen");
    const loadingScreen = document.getElementById("loading-screen");
    const loadingText = document.getElementById("loading-text");

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

    let flushDelay = 6000;

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

        try {
            const newUserRef = ref(database, `users/${newUsername}`);
            const snapshot = await get(newUserRef);

            if (snapshot.exists()) {
                clearTimeout(popupTimeout);
                isInfoPopup = true;
                showPopup("Username already taken. Please choose another one.");
                return;
            }

            const currentUserRef = ref(database, `users/${localUsername}/${auth.currentUser.uid}`);
            const newUserData = (await get(currentUserRef)).val();
            await set(ref(database, `users/${newUsername}/${auth.currentUser.uid}`), newUserData);
            await remove(currentUserRef);
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
            const usersRef = ref(database, `users`);
            const snapshot = await get(usersRef);

            if (snapshot.exists()) {
                const usersData = snapshot.val();
                for (const username in usersData) {
                    if (usersData[username][user.uid]) {
                        localUsername = username;
                        if (localUsername) {
                            usernameChangeInput.value = localUsername;
                        }
                        break;
                    }
                }
            }

            if (localUsername) {
                clearTimeout(popupTimeout);
                isInfoPopup = true;
                showPopup(`Signed in as: ${localUsername}`);
                loadingText.innerHTML = `Welcome Back, ${localUsername}!`;
                fadeScreen(loginScreen, mainScreen);
            } else {
                clearTimeout(popupTimeout);
                isInfoPopup = true;
                showPopup("No user data found.");
                localUsername = "Student404";
            }
            fadeScreen(loginScreen, mainScreen);
        } else {
            console.warn("No user signed in.");
            fadeScreen(mainScreen, loginScreen);
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const xpElement = document.getElementById("xp");
            if (!xpElement) {
                clearTimeout(popupTimeout);
                isInfoPopup = false;
                showPopup("XP element not found in the DOM.");
                return;
            }

            const usersRef = ref(database, `users`);
            try {
                const snapshot = await get(usersRef);

                if (snapshot.exists()) {
                    const usersData = snapshot.val();
                    let foundUsername = null;

                    for (const username in usersData) {
                        if (usersData[username][user.uid]) {
                            foundUsername = username;
                            break;
                        }
                    }

                    if (foundUsername) {
                        localUsername = foundUsername;
                    } else {
                        clearTimeout(popupTimeout);
                        isInfoPopup = false;
                        showPopup("No username found for the current UID.");
                        localUsername = "UnknownUser";
                    }
                } else {
                    clearTimeout(popupTimeout);
                    isInfoPopup = false;
                    showPopup("No users found in the database.");
                    return;
                }
            } catch (error) {
                clearTimeout(popupTimeout);
                isInfoPopup = false;
                showPopup("Error fetching username:", error.message);
                return;
            }

            const userRefPath = `users/${localUsername}/${user.uid}/xp/value`;
            const userRef = ref(database, userRefPath);

            try {
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const xp = snapshot.val() || 0;
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
                            if (flushTimeout) {
                                clearTimeout(flushTimeout);
                            }

                            flushTimeout = setTimeout(async () => {
                                try {
                                    const userRefPath = `users/${localUsername}/${auth.currentUser.uid}/xp/value`;
                                    const userRef = ref(database, userRefPath);

                                    await set(userRef, pendingXP);
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
                                await set(ref(database, userRefPath), 0);
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
                    clearTimeout(popupTimeout);
                    isInfoPopup = false;
                    showPopup(`No XP data found at path: ${userRefPath}`);
                }
            } catch (error) {
                clearTimeout(popupTimeout);
                isInfoPopup = false;
                showPopup("Error fetching XP from the server:", error.message);
            }
        } else {
            console.warn("No user signed in.");
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

                    const usernameRef = ref(database, `users`);
                    const snapshot = await get(usernameRef);

                    if (snapshot.exists()) {
                        const usersData = snapshot.val();
                        let foundUsername = null;

                        for (const username in usersData) {
                            if (usersData[username][user.uid]) {
                                foundUsername = username;
                                break;
                            }
                        }

                        if (foundUsername) {
                            localUsername = foundUsername;
                            const userRef = ref(database, `users/${localUsername}/${user.uid}`);
                            const userSnapshot = await get(userRef);

                            if (userSnapshot.exists()) {
                                const data = userSnapshot.val();
                                loadingText.innerHTML = `Welcome Back, ${localUsername}!`;
                            } else {
                                loadingText.innerHTML = "Welcome Back!";
                            }
                        } else {
                            clearTimeout(popupTimeout);
                            isInfoPopup = false;
                            showPopup("User data not found.");
                        }
                    } else {
                        clearTimeout(popupTimeout);
                        isInfoPopup = false;
                        showPopup("No users found in the database.");
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
                loadingText.innerHTML = "See you soon!";
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

        if (user && localUsername) {
            try {
                const credential = EmailAuthProvider.credential(user.email, prompt("Please re-enter your password:"));
                await reauthenticateWithCredential(user, credential);

                const userRef = ref(database, `users/${localUsername}/${user.uid}`);
                await remove(userRef);

                await deleteUser(user);

                console.log("User deleted.");
                loadingText.innerHTML = "Visit Again!";
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
            console.log("No user is currently signed in or localUsername is not set.");
        }
    });

    signUpButton.addEventListener("click", () => {
        const username = usernameInputSignup.value.trim();
        const email = emailInputSignUp.value.trim();
        const password = passwordInputSignUp.value.trim();

        if (username && email && password) {
            const userRef = ref(database, `users/${username}`);
            get(userRef)
                .then(async (snapshot) => {
                    if (snapshot.exists()) {
                        clearTimeout(popupTimeout);
                        isInfoPopup = false;
                        showPopup("Username already taken. Please choose another one.");
                    } else {
                        justSignedUp = true;
                        createUserWithEmailAndPassword(auth, email, password)
                            .then(async (userCredential) => {
                                const user = userCredential.user;

                                const userRef = ref(database, `users/${username}/${user.uid}`);
                                await set(userRef, {
                                    email: { value: email },
                                    xp: { value: 0 }
                                });

                                localUsername = username;
                                loadingText.innerHTML = `Welcome ${localUsername}!`;
                                await fadeScreen(loginScreen, mainScreen);
                            })
                            .catch((error) => {
                                const mappedMessage = mapErrorMessage(error);
                                clearTimeout(popupTimeout);
                                showPopup(`SignUp Failed: ${mappedMessage}`);
                            });
                    }
                })
                .catch((error) => {
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
        } else {
            sidebarElement.classList.remove('hidden');
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
        startSpinner();
        loadingScreen.classList.remove("hide");
        loadingScreen.classList.remove("hidden");
    }

    function hideLoadingScreen() {
        loadingScreen.classList.add("hidden");
        setTimeout(() => {
            loadingScreen.classList.add("hide");
            setTimeout(stopSpinner, 500);
        }, 350);
    }

    class Spinner {
        constructor(element, codepoints, delay = 30, idleChar = 0xE100) {
            this.element = element;
            this.codepoints = codepoints;
            this.delay = delay;
            this.idleChar = idleChar;
            this.frame = 0;
            this.intervalId = null;
        }

        start() {
            if (this.intervalId) return;

            this.intervalId = setInterval(() => {
                this.element.textContent = String.fromCharCode(this.codepoints[this.frame]);
                this.frame = (this.frame + 1) % this.codepoints.length;
            }, this.delay);
        }

        stop() {
            if (!this.intervalId) return;

            clearInterval(this.intervalId);
            this.intervalId = null;
            this.element.textContent = String.fromCharCode(this.idleChar);
            this.frame = 0;
        }
    }

    const codepoints = [
        [0xE100, 0xE109],
        [0xE10A, 0xE10F],
        [0xE110, 0xE119],
        [0xE11A, 0xE11F],
        [0xE120, 0xE129],
        [0xE12A, 0xE12F],
        [0xE130, 0xE139],
        [0xE13A, 0xE13F],
        [0xE140, 0xE149],
        [0xE14A, 0xE14F],
        [0xE150, 0xE159],
        [0xE15A, 0xE15F],
        [0xE160, 0xE169],
        [0xE16A, 0xE16F],
        [0xE170, 0xE176]
    ].flatMap(([start, end]) =>
        Array.from({ length: end - start + 1 }, (_, i) => start + i)
    );

    const spinner2 = new Spinner(document.getElementById('spinner2'), codepoints);

    function startSpinner() {
        spinner2.start();
    }

    function stopSpinner() {
        spinner2.stop();
    }

    startSpinner();
    setTimeout(stopSpinner, 5000);

    //Custom Selection Menu
    var x, i, j, l, ll, selElmnt, a, b, c;
    x = document.getElementsByClassName("custom-select");
    l = x.length;
    for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < ll; j++) {
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function (e) {
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        yl = y.length;
                        for (k = 0; k < yl; k++) {
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
        var x, y, i, xl, yl, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        xl = x.length;
        yl = y.length;
        for (i = 0; i < yl; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (i = 0; i < xl; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }
    document.addEventListener("click", closeAllSelect);
});