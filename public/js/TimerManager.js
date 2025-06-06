const TIMER_TYPE = {
    COUNT_UP: 'count_up',
    COUNT_DOWN: 'count_down',
    POMODORO: 'pomodoro',
};

const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resumeBtn = document.getElementById('resume');
const resetBtn = document.getElementById('reset');
const allButtons = [startBtn, resumeBtn, pauseBtn, resetBtn];

function setTimerButtons(state = 'default') {
    if (state === 'running') {
        showButton(pauseBtn);
    } else if (state === 'paused') {
        showButton(resumeBtn, resetBtn);
    } else if (state === 'reset') {
        showButton(startBtn);
    } else if (state === 'continued') {
        showButton(pauseBtn);
    }
}

function showButton(...buttonsToShow) {
    const buttonsToHide = allButtons.filter(btn => !buttonsToShow.includes(btn));
    buttonsToHide.forEach(btn => {
        if (btn) {
            btn.classList.remove('visible');
            setTimeout(() => {
                btn.classList.add('hidden');
            }, 300);
        }
    });

    setTimeout(() => {
        buttonsToShow.forEach(buttonToShow => {
            buttonToShow.classList.remove('hidden');
            setTimeout(() => {
                buttonToShow.classList.add('visible');
            }, 10);
        });
    }, 300);
}

class Timer {
    constructor(options = {}) {
        const {
            type = TIMER_TYPE.COUNT_UP,
            duration = 0,
            shortBreakDuration = 0,
            longBreakDuration = 0,
            cyclesPerSet = 4,
            onCompleteTask = null
        } = options;

        this.type = type;
        this.duration = duration;
        this.shortBreakDuration = shortBreakDuration;
        this.longBreakDuration = longBreakDuration;
        this.cyclesPerSet = cyclesPerSet;
        this.onCompleteTask = onCompleteTask;
        this.lastXPCheck = null;
        this.elapsedTime = 0;
        this._elapsedStartTime = null;

        this.reset();
    }


    _generatePomodoroPlan() {
        this.pomodoroPlan = [];
        let totalWork = this.duration;
        let totalShortBreak = this.shortBreakDuration;
        let totalLongBreak = this.longBreakDuration;
        let workBlocks = [];
        let minBlock = 20 * 60;
        let maxBlock = 40 * 60;
        while (totalWork > 0) {
            let block = Math.min(
                Math.floor(Math.random() * (maxBlock - minBlock + 1)) + minBlock,
                totalWork
            );
            workBlocks.push(block);
            totalWork -= block;
        }
        let breaks = [];
        let i = 0;
        while (totalShortBreak > 0 || totalLongBreak > 0) {
            if (i % 2 === 0 && totalShortBreak > 0) {
                let b = Math.min(5 * 60, totalShortBreak);
                breaks.push({ type: 'shortBreak', duration: b });
                totalShortBreak -= b;
            } else if (totalLongBreak > 0) {
                let b = Math.min(15 * 60, totalLongBreak);
                breaks.push({ type: 'longBreak', duration: b });
                totalLongBreak -= b;
            }
            i++;
        }
        this.pomodoroPlan = [];
        for (let j = 0; j < workBlocks.length; j++) {
            this.pomodoroPlan.push({ type: 'work', duration: workBlocks[j] });
            if (breaks[j]) this.pomodoroPlan.push(breaks[j]);
        }
    }

    start() {
        if (typeof window.isAnyTaskRunning === 'function' && !this.isRunning) {
            if (window.isAnyTaskRunning()) {
                alert('Another task is already running. Please pause or complete it before starting a new one.');
                return;
            }
        }

        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;

        if (this.type === TIMER_TYPE.POMODORO) {
            this.pomodoroStartTimestamp = Date.now();
            this._elapsedStartTime = Date.now();
        } else {
            this.startTimestamp = Date.now();
            this.initialTime = this.currentTime;
            this._elapsedStartTime = Date.now();
        }

        this.lastXPCheck = Date.now();
        this._runTimer();
        setTimerButtons('running');
    }


    pause() {
        if (!this.isRunning) return;
        this.isPaused = true;
        this.isRunning = false;
        if (this._elapsedStartTime) {
            const elapsedNow = Math.floor((Date.now() - this._elapsedStartTime) / 1000);
            this.elapsedTime += elapsedNow;
            this._elapsedStartTime = null;
        }
        clearInterval(this.interval);
        setTimerButtons('paused');
    }

    //Pomodoro is bugged *fucked

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = this.type === TIMER_TYPE.COUNT_DOWN ? this.duration : 0;
        this.interval = null;
        this.startTimestamp = null;
        this.initialTime = 0;
        this.pomoStartTimestamp = null;
        this.initialPomoRemaining = 0;
        this.lastXPCheck = null;
        if (this.type === TIMER_TYPE.POMODORO && !this.pomodoroPlan?.length) {
            this._generatePomodoroPlan();
        }
        if (this.type === TIMER_TYPE.POMODORO) {
            this.pomoIndex = 0;
            this.pomoBlockRemaining = this.pomodoroPlan[0]?.duration || 0;
        }
        if (this._elapsedStartTime) {
            const elapsedNow = Math.floor((Date.now() - this._elapsedStartTime) / 1000);
            this.elapsedTime += elapsedNow;
            this._elapsedStartTime = null;
        }
        setTimerButtons('reset');
    }

    continue() {
        if (!this.isPaused) return;

        this.isPaused = false;
        this.isRunning = true;

        if (this.type === TIMER_TYPE.POMODORO) {
            this.pomodoroStartTimestamp = Date.now();
            this._elapsedStartTime = Date.now();
        } else {
            this.startTimestamp = Date.now();
            this.initialTime = this.currentTime;
            this._elapsedStartTime = Date.now();
        }

        this.lastXPCheck = Date.now();
        this._runTimer();
        setTimerButtons('continued');
    }


    _runTimer() {
        clearInterval(this.interval);
        if (this.type === TIMER_TYPE.POMODORO) {
            this.interval = setInterval(() => {
                if (!this.isRunning) return;

                const totalElapsed = Math.floor((Date.now() - this.pomodoroStartTimestamp) / 1000);

                let timePassed = 0;
                let found = false;

                for (let i = 0; i < this.pomodoroPlan.length; i++) {
                    const block = this.pomodoroPlan[i];
                    const blockStart = timePassed;
                    const blockEnd = timePassed + block.duration;

                    if (totalElapsed < blockEnd) {
                        this.pomoIndex = i;
                        this.pomoBlockRemaining = blockEnd - totalElapsed;

                        if (typeof this.onTick === 'function') {
                            this.onTick(this.pomoBlockRemaining, block.type, false, i, this.pomodoroPlan.length);
                        }

                        found = true;
                        break;
                    }

                    timePassed = blockEnd;
                }

                if (!found) {
                    this.pomoIndex = this.pomodoroPlan.length;
                    this.pomoBlockRemaining = 0;

                    if (this._elapsedStartTime) {
                        const elapsedNow = Math.floor((Date.now() - this._elapsedStartTime) / 1000);
                        this.elapsedTime += elapsedNow;
                        this._elapsedStartTime = null;
                    }

                    if (typeof this.onCompleteTask === 'function') {
                        this.onCompleteTask();
                    } else {
                        this.pause();
                    }
                }

                if (typeof this.onTickXP === 'function') {
                    const now = Date.now();
                    const secondsSinceLastXP = Math.floor((now - this.lastXPCheck) / 1000);
                    if (secondsSinceLastXP >= 60) {
                        const xpChunks = Math.floor(secondsSinceLastXP / 60);
                        for (let i = 0; i < xpChunks; i++) this.onTickXP();
                        this.lastXPCheck += xpChunks * 60 * 1000;
                    }
                }

            }, 1000);
        } else {
            this.interval = setInterval(() => {
                if (!this.isRunning) return;

                const elapsed = Math.floor((Date.now() - this.startTimestamp) / 1000);

                if (this.type === TIMER_TYPE.COUNT_UP) {
                    this.currentTime = this.initialTime + elapsed;
                } else if (this.type === TIMER_TYPE.COUNT_DOWN) {
                    this.currentTime = Math.max(0, this.initialTime - elapsed);

                    if (this.currentTime <= 0) {
                        this.currentTime = 0;
                        if (typeof this.onCompleteTask === 'function') {
                            this.onCompleteTask();
                        } else {
                            this.pause();
                        }
                        return;
                    }
                }

                if (typeof this.onTick === 'function') {
                    this.onTick(this.currentTime);
                }

                if (typeof this.onTickXP === 'function') {
                    const now = Date.now();
                    const secondsSinceLastXP = Math.floor((now - this.lastXPCheck) / 1000);
                    if (secondsSinceLastXP >= 60) {
                        const xpChunks = Math.floor(secondsSinceLastXP / 60);
                        for (let i = 0; i < xpChunks; i++) {
                            this.onTickXP();
                        }
                        this.lastXPCheck += xpChunks * 60 * 1000;
                    }
                }
            }, 1000);
        }
    }

    getCurrentTime() {
        if (this.type === TIMER_TYPE.POMODORO) {
            return this.pomoBlockRemaining;
        }
        return this.currentTime;
    }

    getPomodoroBlockType() {
        if (this.type !== TIMER_TYPE.POMODORO || !this.pomodoroPlan) return null;

        const totalElapsed = Math.floor((Date.now() - this.pomodoroStartTimestamp) / 1000);
        let timePassed = 0;

        for (let i = 0; i < this.pomodoroPlan.length; i++) {
            const block = this.pomodoroPlan[i];
            timePassed += block.duration;

            if (totalElapsed < timePassed) {
                return block.type;
            }
        }

        return null;
    }


    getPomodoroState() {
        if (this.type !== TIMER_TYPE.POMODORO) return null;
        return {
            plan: this.pomodoroPlan,
            pomoIndex: this.pomoIndex,
            pomoStartTimestamp: this.pomodoroStartTimestamp,
            elapsedTime: this.elapsedTime,
            pomoBlockRemaining: this.pomoBlockRemaining
        };
    }

    restorePomodoroState(state) {
        if (this.type !== TIMER_TYPE.POMODORO || !state) return;

        this.pomodoroPlan = state.plan || [];
        this.pomoIndex = state.pomoIndex || 0;
        this.elapsedTime = state.elapsedTime || 0;

        const timeUsedBeforePause = this.pomodoroPlan
            .slice(0, this.pomoIndex)
            .reduce((sum, block) => sum + block.duration, 0);

        const currentBlock = this.pomodoroPlan[this.pomoIndex];
        const remainingInBlock = state.pomoBlockRemaining ?? currentBlock?.duration ?? 0;

        const totalTimePassed = timeUsedBeforePause + (currentBlock ? (currentBlock.duration - remainingInBlock) : 0);

        this.pomoBlockRemaining = remainingInBlock;
        this.pomodoroStartTimestamp = Date.now() - totalTimePassed * 1000;
        this._elapsedStartTime = Date.now() - this.elapsedTime * 1000;
    }


    static formatTime(seconds, blockType = null) {
        seconds = Math.max(0, Math.floor(seconds));
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    }

    static updateTimerStat(blockType) {
        const timerStatEl = document.getElementById('timer-stat');
        if (!timerStatEl) return;
        if (blockType === 'work') timerStatEl.textContent = 'Work Session';
        else if (blockType === 'shortBreak') timerStatEl.textContent = 'Short Break';
        else if (blockType === 'longBreak') timerStatEl.textContent = 'Long Break';
        else timerStatEl.textContent = '';
    }
}

export { Timer, TIMER_TYPE };