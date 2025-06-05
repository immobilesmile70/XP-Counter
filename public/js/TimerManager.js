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
        this.startTimestamp = Date.now();
        this.initialTime = this.currentTime;
        if (this.type === TIMER_TYPE.POMODORO) {
            if (!this.pomodoroPlan || !this.pomodoroPlan.length) {
                this._generatePomodoroPlan();
                this.pomoIndex = 0;
                this.pomoBlockRemaining = this.pomodoroPlan[0]?.duration || 0;
            }
            this.pomoStartTimestamp = Date.now();
            this.initialPomoRemaining = this.pomoBlockRemaining;
        }
        this._runTimer();
        setTimerButtons('running');
    }

    pause() {
        if (!this.isRunning) return;
        this.isPaused = true;
        this.isRunning = false;
        clearInterval(this.interval);
        setTimerButtons('paused');
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = this.type === TIMER_TYPE.COUNT_DOWN ? this.duration : 0;
        this.interval = null;
        this.startTimestamp = null;
        this.initialTime = 0;
        this.pomoStartTimestamp = null;
        this.initialPomoRemaining = 0;
        if (this.type === TIMER_TYPE.POMODORO) {
            this._generatePomodoroPlan();
            this.pomoIndex = 0;
            this.pomoBlockRemaining = this.pomodoroPlan[0]?.duration || 0;
        }
        setTimerButtons('reset');
    }

    continue() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.isRunning = true;
        this.startTimestamp = Date.now();
        this.initialTime = this.currentTime;
        this._runTimer();
        setTimerButtons('continued');
        if (this.type === TIMER_TYPE.POMODORO) {
            this.pomoStartTimestamp = Date.now();
            this.initialPomoRemaining = this.pomoBlockRemaining;
        }
    }

    _runTimer() {
        clearInterval(this.interval);
        if (this.type === TIMER_TYPE.POMODORO) {
            this.interval = setInterval(() => {
                if (!this.isRunning) return;

                const elapsed = Math.floor((Date.now() - this.pomoStartTimestamp) / 1000);
                this.pomoBlockRemaining = this.initialPomoRemaining - elapsed;

                if (typeof this.onTick === 'function') {
                    const block = this.pomodoroPlan[this.pomoIndex];
                    this.onTick(this.pomoBlockRemaining, block.type, false, this.pomoIndex, this.pomodoroPlan.length);
                }

                if (typeof this.onTickXP === 'function') {
                    if (!this._xpTickCounter) this._xpTickCounter = 0;
                    this._xpTickCounter++;
                    if (this._xpTickCounter >= 60) {
                        this.onTickXP();
                        this._xpTickCounter = 0;
                    }
                }

                if (this.pomoBlockRemaining <= 0) {
                    this.pomoIndex++;
                    if (this.pomoIndex >= this.pomodoroPlan.length) {
                        if (typeof this.onCompleteTask === 'function') {
                            this.onCompleteTask();
                        } else {
                            this.pause();
                        }
                        return;
                    }

                    this.pomoBlockRemaining = this.pomodoroPlan[this.pomoIndex].duration;
                    this.initialPomoRemaining = this.pomoBlockRemaining;
                    this.pomoStartTimestamp = Date.now();
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
                    if (!this._xpTickCounter) this._xpTickCounter = 0;
                    this._xpTickCounter++;
                    if (this._xpTickCounter >= 60) {
                        this.onTickXP();
                        this._xpTickCounter = 0;
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
        if (this.type === TIMER_TYPE.POMODORO && this.pomodoroPlan) {
            return this.pomodoroPlan[this.pomoIndex]?.type || 'work';
        }
        return null;
    }

    getPomodoroState() {
        if (this.type !== TIMER_TYPE.POMODORO) return null;
        return {
            pomoIndex: this.pomoIndex,
            pomoBlockRemaining: this.pomoBlockRemaining
        };
    }

    restorePomodoroState(state) {
        if (this.type !== TIMER_TYPE.POMODORO || !state) return;
        this._generatePomodoroPlan();
        this.pomoIndex = typeof state.pomoIndex === 'number' ? state.pomoIndex : 0;
        this.pomoBlockRemaining = typeof state.pomoBlockRemaining === 'number' ? state.pomoBlockRemaining : this.pomodoroPlan[0]?.duration || 0;
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