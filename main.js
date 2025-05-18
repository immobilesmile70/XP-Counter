document.addEventListener('DOMContentLoaded', () => {
    let timerInterval;
    let elapsedTime = 0;
    let isRunning = false;
    let startTime = 0;
    let wasPaused = false;

    const stopwatchDisplay = document.getElementById('stopwatch');
    const startButton = document.getElementById('start');
    const resumeButton = document.getElementById('resume');
    const pauseButton = document.getElementById('pause');
    const resetButton = document.getElementById('reset');

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    function updateDisplay() {
        stopwatchDisplay.textContent = formatTime(elapsedTime);
    }

    function getState() {
        return {
            elapsedTime,
            isRunning,
            paused: !isRunning && elapsedTime > 0
        };
    }

    function setButtons() {
        const allButtons = [startButton, resumeButton, pauseButton, resetButton];
        let show = [];
        if (isRunning) {
            show = [pauseButton];
        } else if (elapsedTime > 0) {
            show = [resumeButton, resetButton];
        } else {
            show = [startButton];
        }

        const currentlyVisible = allButtons.filter(btn => btn.classList.contains("visible"));
        const toShow = show.filter(btn => !btn.classList.contains("visible"));
        const toHide = currentlyVisible.filter(btn => !show.includes(btn));

        if (toHide.length > 0) {
            let transitionsLeft = toHide.length;
            toHide.forEach(btn => {
                btn.classList.remove("visible");
                btn.addEventListener("transitionend", function handler() {
                    btn.classList.add("hidden");
                    btn.removeEventListener("transitionend", handler);
                    transitionsLeft--;
                    if (transitionsLeft === 0) {
                        toShow.forEach(showBtn => {
                            showBtn.classList.remove("hidden");
                            void showBtn.offsetWidth;
                            setTimeout(() => {
                                showBtn.classList.add("visible");
                            }, 10);
                        });
                    }
                });
            });
        } else {
            toShow.forEach(showBtn => {
                showBtn.classList.remove("hidden");
                void showBtn.offsetWidth;
                setTimeout(() => {
                    showBtn.classList.add("visible");
                }, 350);
            });
        }

        allButtons.forEach(btn => {
            if (show.includes(btn)) {
                btn.style.pointerEvents = "auto";
            } else {
                btn.style.pointerEvents = "none";
            }
        });
    }

    function startStopwatch() {
        if (!isRunning) {
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(tickAndBroadcast, 100);
            setButtons();
            broadcastState();
        }
    }

    function pauseStopwatch() {
        if (isRunning) {
            isRunning = false;
            clearInterval(timerInterval);
            setButtons();
            broadcastState();
        }
    }

    function resetStopwatch() {
        isRunning = false;
        clearInterval(timerInterval);
        elapsedTime = 0;
        updateDisplay();
        setButtons();
        broadcastState();
    }

    startButton.addEventListener('click', startStopwatch);
    resumeButton.addEventListener('click', startStopwatch);
    pauseButton.addEventListener('click', pauseStopwatch);
    resetButton.addEventListener('click', resetStopwatch);

    updateDisplay();
    setButtons();

    const channel = new BroadcastChannel('stopwatch-sync');

    function broadcastState() {
        channel.postMessage(getState());
    }

    function tickAndBroadcast() {
        elapsedTime = Date.now() - startTime;
        updateDisplay();
        broadcastState();
    }

    channel.onmessage = (event) => {
        if (event.data.command === "pause") pauseStopwatch();
        if (event.data.command === "reset") resetStopwatch();
        if (event.data.command === "start") startStopwatch();
        if (event.data.requestState) broadcastState();
    };

    document.getElementById("openPiP").addEventListener("click", async () => {
        if (!("documentPictureInPicture" in window)) {
            showPopupWithType("Picture-in-Picture not supported.");
            return;
        }

        const pipChannel = new BroadcastChannel('stopwatch-sync');
        let pipTimerEl;
        let pipButtons = {};

        async function setPiPButtons(state) {
            if (!pipButtons.startBtn) return;

            const { startBtn, pauseBtn, resumeBtn, resetBtn } = pipButtons;
            const allButtons = [startBtn, pauseBtn, resumeBtn, resetBtn];

            let show = [];
            if (state.isRunning) {
                show = [pauseBtn];
            } else if (state.paused) {
                show = [resumeBtn, resetBtn];
            } else {
                show = [startBtn];
            }

            allButtons.forEach(btn => {
                if (show.includes(btn)) {
                    if (!btn.classList.contains("visible")) {
                        btn.classList.remove("hidden");
                        void btn.offsetWidth;
                        btn.classList.add("visible");
                    }
                    btn.style.pointerEvents = "auto";
                } else {
                    if (btn.classList.contains("visible")) {
                        btn.classList.remove("visible");
                        btn.addEventListener("transitionend", function handler() {
                            btn.classList.add("hidden");
                            btn.removeEventListener("transitionend", handler);
                        });
                    }
                    btn.style.pointerEvents = "none";
                }
            });
        }

        pipChannel.onmessage = async (event) => {
            const { elapsedTime, isRunning, paused } = event.data;
            if (typeof elapsedTime === "number") {
                pipTimerEl.textContent = formatTime(elapsedTime);
                const state = { isRunning, paused };
                const nextVisible = getPiPButtonsForState(state, pipButtons);
                if (
                    nextVisible.length !== currentVisiblePiPButtons.length ||
                    nextVisible.some((btn, i) => btn !== currentVisiblePiPButtons[i])
                ) {
                    switchButtonsQueued(currentVisiblePiPButtons, nextVisible);
                }
            }
        };

        const pipWindow = await documentPictureInPicture.requestWindow({
            width: 350,
            height: 225,
        });

        const waitForBody = new Promise((resolve) => {
            const check = () => {
                if (pipWindow.document.body) resolve();
                else setTimeout(check, 10);
            };
            check();
        });

        await waitForBody;

        const style = document.createElement("style");
        style.textContent = `
    html { width: 100%; height: 100%; }
    body {
      margin: 0;
      background: #111;
      color: white;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    button {
      background-color: #373737;
      color: white;
      padding-top: 4px;
      width: 50px;
      height: 50px;
      font-size: 1.4rem;
      border: none;
      border-radius: 50pc;
      cursor: pointer;
      transform: scale(0);
      opacity: 0;
      transition: background-color 0.3s, transform 0.4s, opacity 0.4s;
      pointer-events: none;
    }
    button.visible {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
    button.hidden { display: none; }

    button:hover { transform: scale(1.1); background-color: #4f4f4f; }
    button:active { transform: scale(0.9); background-color: #232323; }
    
    #timer { font-size: 5rem; }
    #buttonContainer { display: flex; gap: 10px; }
    #appContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 20px;
      width: calc(100% - 40px);
      height: calc(100% - 40px);
      font-weight: bolder;
      user-select: none;
      overflow: hidden;
      opacity: 0;
      transition: opacity 1s ease;
    }
    #appContainer.visible { opacity: 1; }
    `;
        pipWindow.document.head.appendChild(style);

        pipTimerEl = document.createElement("div");
        pipTimerEl.textContent = "00:00";
        pipTimerEl.id = "timer";

        pipButtons.pauseBtn = document.createElement("button");
        pipButtons.pauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
        pipButtons.pauseBtn.classList.add("hidden");

        pipButtons.resumeBtn = document.createElement("button");
        pipButtons.resumeBtn.innerHTML = `<i class="fas fa-play"></i>`;
        pipButtons.resumeBtn.style.paddingLeft = "2px";
        pipButtons.resumeBtn.style.paddingRight = "0px";
        pipButtons.resumeBtn.classList.add("hidden");

        pipButtons.resetBtn = document.createElement("button");
        pipButtons.resetBtn.innerHTML = `<i class="fas fa-rotate-left"></i>`;
        pipButtons.resetBtn.classList.add("hidden");

        pipButtons.startBtn = document.createElement("button");
        pipButtons.startBtn.innerHTML = `<i class="fas fa-play"></i>`;
        pipButtons.startBtn.style.paddingLeft = "2px";
        pipButtons.startBtn.style.paddingRight = "0px";
        pipButtons.startBtn.classList.add("hidden");

        const buttonContainer = document.createElement("div");
        buttonContainer.id = "buttonContainer";
        buttonContainer.appendChild(pipButtons.startBtn);
        buttonContainer.appendChild(pipButtons.pauseBtn);
        buttonContainer.appendChild(pipButtons.resumeBtn);
        buttonContainer.appendChild(pipButtons.resetBtn);

        const appContainer = pipWindow.document.createElement("div");
        appContainer.id = "appContainer";
        appContainer.appendChild(pipTimerEl);
        appContainer.appendChild(buttonContainer);

        const tooltip = pipWindow.document.createElement("div");
        tooltip.id = "pip-tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.background = "#222";
        tooltip.style.color = "#fff";
        tooltip.style.padding = "6px 16px";
        tooltip.style.borderRadius = "8px";
        tooltip.style.fontSize = "1rem";
        tooltip.style.pointerEvents = "none";
        tooltip.style.opacity = "0";
        tooltip.style.transition = "opacity 0.2s";
        tooltip.style.zIndex = "1000";
        pipWindow.document.body.appendChild(tooltip);

        function showTooltip(e, text) {
            tooltip.textContent = text;
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
            tooltip.style.top = rect.top - 36 + "px";
            tooltip.style.opacity = "1";
        }
        function hideTooltip() {
            tooltip.style.opacity = "0";
        }

        let tooltipTimeout;

        pipButtons.startBtn.addEventListener("mouseenter", e => { clearTimeout(tooltipTimeout); tooltipTimeout = setTimeout(() => { showTooltip(e, "Start") }, 450); });
        pipButtons.startBtn.addEventListener("mouseleave", () => { clearTimeout(tooltipTimeout); hideTooltip(); });
        pipButtons.pauseBtn.addEventListener("mouseenter", e => { clearTimeout(tooltipTimeout); tooltipTimeout = setTimeout(() => { showTooltip(e, "Pause") }, 450); });
        pipButtons.pauseBtn.addEventListener("mouseleave", () => { clearTimeout(tooltipTimeout); hideTooltip(); });
        pipButtons.resumeBtn.addEventListener("mouseenter", e => { clearTimeout(tooltipTimeout); tooltipTimeout = setTimeout(() => { showTooltip(e, "Resume") }, 450); });
        pipButtons.resumeBtn.addEventListener("mouseleave", () => { clearTimeout(tooltipTimeout); hideTooltip(); });
        pipButtons.resetBtn.addEventListener("mouseenter", e => { clearTimeout(tooltipTimeout); tooltipTimeout = setTimeout(() => { showTooltip(e, "Reset") }, 450); });
        pipButtons.resetBtn.addEventListener("mouseleave", () => { clearTimeout(tooltipTimeout); hideTooltip(); });

        pipWindow.document.body.append(appContainer);
        const faLink = document.createElement("link");
        faLink.rel = "stylesheet";
        faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
        pipWindow.document.head.appendChild(faLink);

        setTimeout(() => {
            appContainer.classList.add("visible");
        }, 500);

        let currentVisiblePiPButtons = [];
        let transitionPromise = Promise.resolve();
        let latestNextVisible = null;

        function getPiPButtonsForState(state, pipButtons) {
            if (state.isRunning) return [pipButtons.pauseBtn];
            if (state.paused) return [pipButtons.resumeBtn, pipButtons.resetBtn];
            return [pipButtons.startBtn];
        }

        function transitionOut(button) {
            return new Promise(resolve => {
                if (!button.classList.contains("visible")) {
                    button.classList.add("hidden");
                    return resolve();
                }
                const onTransitionEnd = () => {
                    button.removeEventListener("transitionend", onTransitionEnd);
                    button.classList.add("hidden");
                    resolve();
                };
                button.addEventListener("transitionend", onTransitionEnd);
                button.classList.remove("visible");
            });
        }

        async function switchButtonsQueued(outgoingButtons = [], incomingButtons = []) {
            latestNextVisible = incomingButtons;
            await transitionPromise;
            if (latestNextVisible !== incomingButtons) return;
            transitionPromise = (async () => {
                await Promise.all(outgoingButtons.map(btn => transitionOut(btn)));
                if (latestNextVisible !== incomingButtons) return;
                for (const btn of incomingButtons) {
                    btn.classList.remove("hidden");
                    void btn.offsetWidth;
                    setTimeout(() => {
                        btn.classList.add("visible");
                    }, 10);
                }
                currentVisiblePiPButtons = incomingButtons;
            })();
            await transitionPromise;
        }

        pipButtons.startBtn.addEventListener("click", () => {
            pipChannel.postMessage({ command: "start" });
        });
        pipButtons.pauseBtn.addEventListener("click", () => {
            pipChannel.postMessage({ command: "pause" });
        });
        pipButtons.resumeBtn.addEventListener("click", () => {
            pipChannel.postMessage({ command: "start" });
        });
        pipButtons.resetBtn.addEventListener("click", () => {
            pipChannel.postMessage({ command: "reset" });
        });

        pipChannel.postMessage({ requestState: true });
    });
});