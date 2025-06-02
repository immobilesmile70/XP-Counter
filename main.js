// --- UpGrind Main Script ---

import { TaskManager } from './TaskManager.js';
import { Timer } from './TimerManager.js';
import { pushXPToFirebase } from './xp.js';
import { deleteTaskFromFirebase, updateTaskInFirebase, getUserId } from './firebase.js';
import { showPopupWithType, showDialog } from './script.js';

// --- DOM Elements ---
const nameInput = document.getElementById('task-name-input');
const counterTypeSelect = document.querySelector('.custom-timer-select select');
const durationHoursInput = document.getElementById('duration-hours');
const durationMinutesInput = document.getElementById('duration-minutes');
const durationSecondsInput = document.getElementById('duration-seconds');
const shortBreakHoursInput = document.getElementById('short-break-hours');
const shortBreakMinutesInput = document.getElementById('short-break-minutes');
const shortBreakSecondsInput = document.getElementById('short-break-seconds');
const longBreakHoursInput = document.getElementById('long-break-hours');
const longBreakMinutesInput = document.getElementById('long-break-minutes');
const longBreakSecondsInput = document.getElementById('long-break-seconds');
const createTaskButton = document.getElementById('create-task-button');
const cancelTaskButton = document.getElementById('cancel-task-button');
const editTaskButton = document.getElementById('edit-task-button');
const taskListEl = document.getElementById('task-list');
const stopwatchEl = document.getElementById('stopwatch');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resumeBtn = document.getElementById('resume');
const resetBtn = document.getElementById('reset');
const mainSection = document.getElementById('main-section');
const createTaskSection = document.getElementById('create-task-section');
const tasksSection = document.getElementById('tasks-section');
const createNewTaskBtn = document.getElementById('create-new-task');
const backToMainBtn = document.getElementById('back-to-main');
const pomodoroStatusEl = document.getElementById('pomodoro-status');
const taskSidebarButton = document.getElementById("tasks");
const createTaskSidebarButton = document.getElementById("create-task");
const mainTaskSidebarButton = document.getElementById("main");
const timerSidebarButton = document.getElementById("timer");
const counterSidebarButton = document.getElementById("counter");
const leaderboardSidebarButton = document.getElementById("leaderboard");

// --- Initialization & Managers ---
function clampDurationInputs() {
    if (durationHoursInput) {
        let v = parseInt(durationHoursInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 8) v = 8;
        durationHoursInput.value = v;
    }
    if (durationMinutesInput) {
        let v = parseInt(durationMinutesInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 59) v = 59;
        durationMinutesInput.value = v;
    }
    if (durationSecondsInput) {
        let v = parseInt(durationSecondsInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 59) v = 59;
        durationSecondsInput.value = v;
    }
    if (shortBreakHoursInput) {
        let v = parseInt(shortBreakHoursInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 2) v = 2;
        shortBreakHoursInput.value = v;
    }
    if (shortBreakMinutesInput) {
        let v = parseInt(shortBreakMinutesInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 59) v = 59;
        shortBreakMinutesInput.value = v;
    }
    if (shortBreakSecondsInput) {
        let v = parseInt(shortBreakSecondsInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 59) v = 59;
        shortBreakSecondsInput.value = v;
    }
    if (longBreakHoursInput) {
        let v = parseInt(longBreakHoursInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 2) v = 2;
        longBreakHoursInput.value = v;
    }
    if (longBreakMinutesInput) {
        let v = parseInt(longBreakMinutesInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 59) v = 59;
        longBreakMinutesInput.value = v;
    }
    if (longBreakSecondsInput) {
        let v = parseInt(longBreakSecondsInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 59) v = 59;
        longBreakSecondsInput.value = v;
    }
}

function getDurationInSeconds(hoursInput, minutesInput, secondsInput, isBreak = false) {
    let h = 0, m = 0, s = 0;
    if (typeof hoursInput === 'string') hoursInput = document.getElementById(hoursInput);
    if (typeof minutesInput === 'string') minutesInput = document.getElementById(minutesInput);
    if (typeof secondsInput === 'string') secondsInput = document.getElementById(secondsInput);
    if (hoursInput && hoursInput.value != null) h = parseInt(hoursInput.value) || 0;
    if (minutesInput && minutesInput.value != null) m = parseInt(minutesInput.value) || 0;
    if (secondsInput && secondsInput.value != null) s = parseInt(secondsInput.value) || 0;
    if (isBreak) {
        if (h < 0) h = 0;
        if (h > 2) h = 2;
    } else {
        if (h < 0) h = 0;
        if (h > 8) h = 8;
    }
    if (m < 0) m = 0;
    if (m > 59) m = 59;
    if (s < 0) s = 0;
    if (s > 59) s = 59;
    return h * 3600 + m * 60 + s;
}

// --- Task List Initialization Function ---
async function initializeAndLoadTasks() {
    window.taskManager = new TaskManager();
    window.taskTimers = [];
    let tasks = [];
    try {
        tasks = await loadAllTasksFromFirebase();
        if (!Array.isArray(tasks)) {
            tasks = [];
        }
    } catch (e) {
        tasks = [];
    }
    if (window.taskManager.clearAllTasks) window.taskManager.clearAllTasks();
    else if (window.taskManager.tasks) window.taskManager.tasks = new Map();

    let createdCount = 0;
    tasks.filter(task => task && task.id && task.name).forEach(task => {
        window.taskManager.createTask(task);
        createdCount++;
    });
    refreshTaskList();
}

// --- DOMContentLoaded Handler ---
document.addEventListener('DOMContentLoaded', async () => {
    window.timerManager = new Timer();
    if (window.activeTimer) {
        window.activeTimer.pause?.();
        if (typeof window.activeTimer.clearInterval === 'function') {
            window.activeTimer.clearInterval();
        }
        window.activeTimer = null;
        window.activeTaskId = null;
    }

    bindTaskFormEvents();
    bindGlobalUIEvents();
});

// --- Export for auth-triggered loading ---
export { initializeAndLoadTasks };

// Helper: flush queue for debounced Firebase writes
const firebaseFlushQueue = {};
/**
* Queues a Firebase update for a task, applies changes locally, and refreshes the UI immediately.
* @param {object} task - The task object (must have id).
* @param {object} [changes] - Partial update to apply to the task before syncing.
*/
function queueFirebaseUpdate(task, changes = {}) {
    const uid = getUserId();
    if (!uid || !task || !task.id) return;
    if (changes && typeof changes === 'object') {
        const localTask = window.taskManager.getTask(task.id);
        if (localTask) {
            Object.assign(localTask, changes);
        }
    }
    refreshTaskList();
    if (firebaseFlushQueue[task.id]) clearTimeout(firebaseFlushQueue[task.id]);
    firebaseFlushQueue[task.id] = setTimeout(() => {
        const latestTask = window.taskManager.getTask(task.id) || task;
        updateTaskInFirebase(uid, latestTask);
        delete firebaseFlushQueue[task.id];
        if (window.taskManager && typeof window.taskManager.getCurrentTask === 'function') {
            const current = window.taskManager.getCurrentTask();
            if (current && current.id === task.id && typeof window.taskManager.setCurrentTask === 'function') {
                window.taskManager.setCurrentTask(null);
            }
        }
    }, 1000);
}

function flushAllFirebaseUpdates() {
    Object.keys(firebaseFlushQueue).forEach(id => {
        clearTimeout(firebaseFlushQueue[id]);
        const task = window.taskManager.getTask(id);
        if (task) {
            const uid = getUserId();
            updateTaskInFirebase(uid, task);
        }
        delete firebaseFlushQueue[id];
    });
}

// --- Task Type Selection Logic ---
function getTaskType() {
    if (counterTypeSelect) {
        if (counterTypeSelect.value === 'up') return 'count_up';
        if (counterTypeSelect.value === 'down') return 'count_down';
        if (counterTypeSelect.value === 'pomo') return 'pomodoro';
    }
    return 'count_up';
}

// Utility: create a new task and add to TaskManager
async function createTask() {
    clampDurationInputs();
    if (!nameInput) return;
    const name = nameInput.value.trim();
    if (!name) {
        showPopupWithType('Please enter a task name.', false);
        return;
    }
    if (name.length < 3 || name.length > 50) {
        showPopupWithType('Please enter a shorter name.', false);
        return;
    }
    const type = getTaskType();
    const duration = getDurationInSeconds(durationHoursInput, durationMinutesInput, durationSecondsInput);
    const shortBreakDuration = getDurationInSeconds(shortBreakHoursInput, shortBreakMinutesInput, shortBreakSecondsInput, true);
    const longBreakDuration = getDurationInSeconds(longBreakHoursInput, longBreakMinutesInput, longBreakSecondsInput, true);
    if (type === 'count_down' && duration <= 0) {
        showPopupWithType('Please enter a valid duration for your countdown task.', false);
        return;
    }
    if (type === 'pomodoro') {
        if (duration <= 0) {
            showPopupWithType('Please enter a valid work duration for your Pomodoro task.', false);
            return;
        }
        if (shortBreakDuration <= 0) {
            showPopupWithType('Please enter a valid short break duration for your Pomodoro task.', false);
            return;
        }
        if (longBreakDuration <= 0) {
            showPopupWithType('Please enter a valid long break duration for your Pomodoro task.', false);
            return;
        }
    }

    tasksSection.classList.remove('hide');
    setTimeout(() => tasksSection.classList.remove('hidden'), 10);
    createTaskSection.classList.add('hidden');
    setTimeout(() => { createTaskSection.classList.add('hide'); }, 350);
    taskSidebarButton.style.display = 'block';
    createTaskSidebarButton.style.display = 'none';

    if (window.taskManager && typeof window.taskManager.getAllTasks === 'function') {
        const allTasks = window.taskManager.getAllTasks();
        if (allTasks.length >= 8) {
            alert('You can only have up to 8 tasks saved. Please delete a task before adding a new one.');
            return;
        }
    }
    const task = window.taskManager.createTask({ name, type, duration, shortBreakDuration, longBreakDuration, elapsedTime: 0, status: 'pending' });
    if (!task.id) return;
    task.status = 'pending';
    if (type === 'pomodoro') {
        task.pomodoroState = null;
    }
    window.taskManager.setCurrentTask(task.id);
    refreshTaskList();
    if (typeof resetTaskForm === 'function') resetTaskForm();
    const uid = getUserId();
    if (uid) {
        try {
            await updateTaskInFirebase(uid, task);
        } catch (e) {
            console.error('Failed to save new task to Firebase:', e);
        }
    } else {
        console.warn('No user ID found, task not saved to Firebase');
    }
    queueFirebaseUpdate(task, { status: 'pending' });
}

// Delete a task from TaskManager and Firebase
async function deleteTask(taskId) {
    window.taskManager.removeTask(taskId);
    if (activeTaskId === taskId) {
        removeActiveTimer();
    }
    refreshTaskList();
    const uid = getUserId();
    if (uid) {
        try {
            await deleteTaskFromFirebase(uid, taskId);
        } catch (e) {
            alert('Could not delete task from Firebase.');
        }
    }
}

// Load all tasks from Firebase for the current user
async function loadAllTasksFromFirebase() {
    const uid = getUserId();
    if (!uid) return [];
    try {
        const url = `https://audio-5dacc-default-rtdb.asia-southeast1.firebasedatabase.app/users/${uid}/tasks.json`;
        const res = await fetch(url);
        if (res.status === 404) return [];
        const data = await res.json();
        if (!data || typeof data !== 'object') return [];
        return Object.entries(data)
            .map(([id, task]) => ({ ...task, id }))
            .filter(task => task && typeof task === 'object' && task.name);
    } catch (e) {
        return [];
    }
}

function completeTask(taskId) {
    window.taskManager.updateStatus(taskId, 'completed');
    const task = window.taskManager.getTask(taskId);
    if (task) {
        task.status = 'completed';
        queueFirebaseUpdate(task, { status: 'completed' });
    }
    refreshTaskList();
    // Firebase: Mark as completed
    const uid = getUserId();
    if (uid && task) updateTaskInFirebase(uid, task);
}

function refreshTaskList() {
    if (!taskListEl) return;
    taskListEl.innerHTML = '';
    const tasks = window.taskManager.getAllTasks();
    const createdTasksEl = document.getElementById('created-tasks');
    if (createdTasksEl) {
        createdTasksEl.textContent = tasks.length;
    }
    tasks.forEach((task, idx) => {
        const div = document.createElement('div');
        div.className = 'task-list-item';
        div.setAttribute('data-task-id', task.id);
        let timeDisplay = '';
        if (task.type === 'count_up') {
            const elapsed = typeof task.elapsedTime === 'number' && task.elapsedTime > 0 ? task.elapsedTime : 0;
            timeDisplay = Timer.formatTime(elapsed);
        } else if (task.type === 'count_down') {
            let durationSec = task.duration || 0;
            let elapsedSec = task.elapsedTime || 0;
            let remaining = Math.max(durationSec - elapsedSec, 0);
            timeDisplay = Timer.formatTime(remaining);
        } else if (task.type === 'pomodoro') {
            timeDisplay = Timer.formatTime(task.duration || 0);
        } else {
            timeDisplay = Timer.formatTime(task.duration || 0);
        }
        div.innerHTML = `
            <span class="task-pos">${idx + 1}</span>
            <div class="task-values-flex">
            <span class="task-name">${task.name}</span>
            <div class="v-divider"></div>
            <span class="task-duration">${task.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            <div class="v-divider"></div>
            <span class="task-duration">${timeDisplay}</span>
            </div>
            <div class="task-actions-flex">
            <button class="start-task"><i class="fa-solid fa-play"></i></button>
            <button class="delete-task"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        div.querySelector('.start-task').onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.taskManager.setCurrentTask(task.id);
            startTask(task.id);
            if (mainSection) {
                mainSection.classList.remove('hide');
                setTimeout(() => mainSection.classList.remove('hidden'), 10);
            }
            if (tasksSection) {
                tasksSection.classList.add('hidden');
                setTimeout(() => { tasksSection.classList.add('hide'); }, 350);
            }
            if (createTaskSection) {
                createTaskSection.classList.add('hidden');
                setTimeout(() => { createTaskSection.classList.add('hide'); }, 350);
            }

            taskSidebarButton.style.display = 'none';
            mainTaskSidebarButton.style.display = 'block';
            createTaskSidebarButton.style.display = 'none';

            const taskNameEl = document.getElementById('task-name');
            if (taskNameEl) taskNameEl.textContent = task.name;
        };
        div.querySelector('.delete-task').onclick = () => {
            showDialog("Do you really want to delete the task?", "Once deleted, it can't be restored as this action cannot be undone from our side.", [
                {
                    text: "Yes", onClick: () => {
                        deleteTask(task.id);
                    }
                },
                {
                    text: "No", onClick: () => {
                        console.log("Delete task cancelled.");
                    }
                }
            ]);

        };
        taskListEl.appendChild(div);
    });
}

// --- Modular Timer System ---
let activeTimer = null;
let activeTaskId = null;
let pomodoroStatusInterval = null;

function getCurrentPomodoroBlockType() {
    if (activeTimer && activeTimer.type === 'pomodoro') {
        return activeTimer.getPomodoroBlockType();
    }
    return 'work';
}

function updatePomodoroStatusMessage() {
    if (!pomodoroStatusEl) return;
    const blockType = getCurrentPomodoroBlockType();
    pomodoroStatusEl.textContent = getRandomPomodoroMessage(blockType);
    pomodoroStatusEl.style.display = '';
}

function startPomodoroStatusInterval() {
    if (pomodoroStatusInterval) clearInterval(pomodoroStatusInterval);
    updatePomodoroStatusMessage();
    pomodoroStatusInterval = setInterval(updatePomodoroStatusMessage, 10 * 60 * 1000);
}

function stopPomodoroStatusInterval() {
    if (pomodoroStatusInterval) {
        clearInterval(pomodoroStatusInterval);
        pomodoroStatusInterval = null;
    }
}

function startTask(taskId) {
    const task = window.taskManager.getTask(taskId);
    if (!task) return;
    if (activeTimer && activeTimer.isRunning) {
        pauseTask();
    }
    removeActiveTimer();
    activeTaskId = taskId;
    let timerType = task.type === 'pomo' || task.type === 'pomodoro' ? 'pomodoro' : task.type;
    activeTimer = new Timer({
        type: timerType,
        duration: task.duration,
        shortBreakDuration: task.shortBreakDuration || 0,
        longBreakDuration: task.longBreakDuration || 0
    });
    if (timerType === 'pomodoro') {
        if (task.pomodoroState) {
            activeTimer.restorePomodoroState(task.pomodoroState);
        }
        if (stopwatchEl) stopwatchEl.textContent = Timer.formatTime(activeTimer.getCurrentTime());
        Timer.updateTimerStat(activeTimer.getPomodoroBlockType());
    } else if (typeof task.elapsedTime === 'number' && task.elapsedTime > 0) {
        activeTimer.currentTime = (task.type === 'count_down')
            ? activeTimer.duration - task.elapsedTime
            : task.elapsedTime;
        if (stopwatchEl) stopwatchEl.textContent = Timer.formatTime(activeTimer.currentTime);
        Timer.updateTimerStat();
    } else {
        if (stopwatchEl) stopwatchEl.textContent = Timer.formatTime(activeTimer.currentTime);
        Timer.updateTimerStat();
    }
    stopPomodoroStatusInterval();
    startPomodoroStatusInterval();
    activeTimer.onTick = (currentTime, blockType) => {
        if (activeTimer.type === 'pomodoro') {
            if (stopwatchEl) stopwatchEl.textContent = Timer.formatTime(currentTime);
            Timer.updateTimerStat(blockType);
            const t = window.taskManager.getTask(activeTaskId);
            if (t) {
                t.pomodoroState = activeTimer.getPomodoroState();
            }
        } else {
            if (stopwatchEl) stopwatchEl.textContent = Timer.formatTime(currentTime);
            Timer.updateTimerStat();
        }
        const t = window.taskManager.getTask(activeTaskId);
        if (t && activeTimer.type !== 'pomodoro') {
            if (activeTimer.type === 'count_down') {
                t.elapsedTime = (t.duration || 0) * 60 - currentTime;
            } else {
                t.elapsedTime = currentTime;
            }
        }
        refreshTaskList();
    };
    activeTimer.start();
}

function pauseTask() {
    if (activeTimer) {
        activeTimer.pause();
        saveElapsedTimeToTask();
        const task = window.taskManager.getTask(activeTaskId);
        if (task) {
            if (activeTimer.type === 'pomodoro') {
                task.pomodoroState = activeTimer.getPomodoroState();
            }
            task.status = 'paused';
            queueFirebaseUpdate(task, { status: 'paused', elapsedTime: task.elapsedTime, pomodoroState: task.pomodoroState });
        }
    }
}

function resumeTask() {
    if (activeTimer) {
        activeTimer.continue();
    }
}

function resetTask() {
    showDialog("Do you really want to reset the timer?", "Once you reset the timer, all of your current progress realted to this task will be reset. This action cannot be undone.", [
        {
            text: "Yes", onClick: () => {
                if (activeTimer) {
                    activeTimer.reset();
                    if (stopwatchEl) {
                        if (activeTimer.type === 'pomodoro') {
                            stopwatchEl.textContent = Timer.formatTime(activeTimer.getCurrentTime());
                            Timer.updateTimerStat(activeTimer.getPomodoroBlockType());
                        } else {
                            stopwatchEl.textContent = Timer.formatTime(activeTimer.currentTime);
                            Timer.updateTimerStat();
                        }
                    }
                    stopPomodoroStatusInterval();
                    startPomodoroStatusInterval();
                    saveElapsedTimeToTask(true);
                    const task = window.taskManager.getTask(activeTaskId);
                    if (task) {
                        if (activeTimer.type === 'pomodoro') {
                            task.pomodoroState = activeTimer.getPomodoroState();
                        }
                        task.status = 'pending';
                        queueFirebaseUpdate(task, { elapsedTime: 0, status: 'pending', pomodoroState: task.pomodoroState });
                    }
                }
            }
        }, 
        {
            text: "No", onClick: () => {
                console.log("Reset task cancelled.");
            }
        }
    ]);
}

function removeActiveTimer() {
    if (activeTimer) {
        stopPomodoroStatusInterval();
        activeTimer.pause();
        activeTimer = null;
        activeTaskId = null;
    }
}

function saveElapsedTimeToTask(reset = false) {
    if (!activeTaskId) return;
    const task = window.taskManager.getTask(activeTaskId);
    if (!task) return;
    if (reset) {
        task.elapsedTime = 0;
    } else if (activeTimer) {
        if (task.type === 'count_down') {
            task.elapsedTime = task.duration - activeTimer.currentTime;
        } else if (task.type === 'pomodoro') {
            task.pomodoroState = activeTimer.getPomodoroState();
        } else {
            task.elapsedTime = activeTimer.currentTime;
        }
    }
}

/**
function updateTimerButtons() {
    // Show/hide timer control buttons based on timer state
    if (!activeTimer) {
        if (startBtn) startBtn.classList.remove('hidden');
        if (pauseBtn) pauseBtn.classList.add('hidden');
        if (resumeBtn) resumeBtn.classList.add('hidden');
        if (resetBtn) resetBtn.classList.add('hidden');
        return;
    }
    if (activeTimer.isRunning) {
        if (startBtn) startBtn.classList.add('hidden');
        if (pauseBtn) pauseBtn.classList.remove('hidden');
        if (resumeBtn) resumeBtn.classList.add('hidden');
        if (resetBtn) resetBtn.classList.remove('hidden');
    } else if (activeTimer.currentTime > 0) {
        if (startBtn) startBtn.classList.add('hidden');
        if (pauseBtn) pauseBtn.classList.add('hidden');
        if (resumeBtn) resumeBtn.classList.remove('hidden');
        if (resetBtn) resetBtn.classList.remove('hidden');
    } else {
        if (startBtn) startBtn.classList.remove('hidden');
        if (pauseBtn) pauseBtn.classList.add('hidden');
        if (resumeBtn) resumeBtn.classList.add('hidden');
        if (resetBtn) resetBtn.classList.add('hidden');
    }
}
*/

// --- Bindings ---
function bindTaskFormEvents() {
    if (createTaskButton) createTaskButton.onclick = createTask;
    if (cancelTaskButton) cancelTaskButton.onclick = () => {
        if (typeof resetTaskForm === 'function') resetTaskForm();
        if (createTaskSection && tasksSection) {
            tasksSection.classList.remove('hide');
            setTimeout(() => tasksSection.classList.remove('hidden'), 10);
            createTaskSection.classList.add('hidden');
            setTimeout(() => { createTaskSection.classList.add('hide'); }, 350);
            taskSidebarButton.style.display = 'block';
            createTaskSidebarButton.style.display = 'none';
        }
    };

    if (editTaskButton) editTaskButton.onclick = () => {
        if (typeof editCurrentTask === 'function') editCurrentTask();
    };

    if (createNewTaskBtn) createNewTaskBtn.onclick = () => {
        if (tasksSection && createTaskSection) {
            createTaskSection.classList.remove('hide');
            setTimeout(() => createTaskSection.classList.remove('hidden'), 10);
            tasksSection.classList.add('hidden');
            setTimeout(() => { tasksSection.classList.add('hide'); }, 350);
            taskSidebarButton.style.display = 'none';
            createTaskSidebarButton.style.display = 'block';
        }
    };
}

function bindGlobalUIEvents() {
    if (startBtn) startBtn.onclick = () => { if (activeTaskId) startTask(activeTaskId); };
    if (pauseBtn) pauseBtn.onclick = pauseTask;
    if (resumeBtn) resumeBtn.onclick = resumeTask;
    if (resetBtn) resetBtn.onclick = resetTask;
    if (backToMainBtn && mainSection && tasksSection) {
        backToMainBtn.onclick = function () {
            if (activeTaskId) {
                saveElapsedTimeToTask();
                const task = window.taskManager.getTask(activeTaskId);
                if (task) {
                    if (task.type === 'count_down' && activeTimer) {
                        task.elapsedTime = task.duration - activeTimer.currentTime;
                    }
                    if (!task.status || task.status === 'pending') {
                        task.status = 'paused';
                    }
                    queueFirebaseUpdate(task, { elapsedTime: task.elapsedTime, status: task.status });
                }
            }
            if (activeTimer) {
                activeTimer.pause();
                if (typeof activeTimer.clearInterval === 'function') {
                    activeTimer.clearInterval();
                }
                activeTimer = null;
                activeTaskId = null;
            }
            refreshTaskList();
            tasksSection.classList.remove('hide');
            setTimeout(() => tasksSection.classList.remove('hidden'), 10);
            mainSection.classList.add('hidden');
            setTimeout(() => { mainSection.classList.add('hide'); }, 350);
            taskSidebarButton.style.display = 'block';
            mainTaskSidebarButton.style.display = 'none';
        };
    }
}

// --- Reset Task Form ---
function resetTaskForm() {
    if (nameInput) nameInput.value = '';
    if (durationHoursInput) durationHoursInput.value = '';
    if (durationMinutesInput) durationMinutesInput.value = '';
    if (durationSecondsInput) durationSecondsInput.value = '';
    if (shortBreakHoursInput) shortBreakHoursInput.value = '';
    if (shortBreakMinutesInput) shortBreakMinutesInput.value = '';
    if (shortBreakSecondsInput) shortBreakSecondsInput.value = '';
    if (longBreakHoursInput) longBreakHoursInput.value = '';
    if (longBreakMinutesInput) longBreakMinutesInput.value = '';
    if (longBreakSecondsInput) longBreakSecondsInput.value = '';
    if (counterTypeSelect) {
        counterTypeSelect.value = 'up';
        const parent = counterTypeSelect.closest('.custom-timer-select');
        if (parent) {
            const selectedDiv = parent.querySelector('.select-selected');
            const itemsDiv = parent.querySelector('.select-items');
            if (selectedDiv && itemsDiv) {
                const upOption = Array.from(counterTypeSelect.options).find(opt => opt.value === 'up');
                if (upOption) {
                    selectedDiv.textContent = upOption.text;
                    itemsDiv.querySelectorAll('.select-item').forEach(item => item.classList.remove('selected'));
                    const upItem = Array.from(itemsDiv.querySelectorAll('.select-item')).find(item => item.textContent === upOption.text);
                    if (upItem) upItem.classList.add('selected');
                }
            }
        }
    }

    // Hide all three fields
    const durationFlex = document.getElementById('duration-flex');
    const shortBreakFlex = document.getElementById('short-break-flex');
    const longBreakFlex = document.getElementById('long-break-flex');
    if (durationFlex) durationFlex.classList.add('hidden');
    if (shortBreakFlex) shortBreakFlex.classList.add('hidden');
    if (longBreakFlex) longBreakFlex.classList.add('hidden');
}

(function initCustomSelect() {
    const x = document.getElementsByClassName('custom-timer-select');
    for (let i = 0; i < x.length; i++) {
        const selElmnt = x[i].getElementsByTagName('select')[0];
        if (!selElmnt) continue;
        let hasPomo = false;
        for (let j = 0; j < selElmnt.options.length; j++) {
            if (selElmnt.options[j].value === 'pomo') {
                hasPomo = true;
                break;
            }
        }
        if (!hasPomo) {
            const pomoOption = document.createElement('option');
            pomoOption.value = 'pomo';
            pomoOption.text = 'Pomo';
            selElmnt.appendChild(pomoOption);
        }
        if (x[i].querySelector('.select-selected')) continue;
        for (let j = 0; j < selElmnt.options.length; j++) {
            if (selElmnt.options[j].value === 'up') {
                selElmnt.selectedIndex = j;
                break;
            }
        }
        const a = document.createElement('DIV');
        a.setAttribute('class', 'select-selected');
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        const b = document.createElement('DIV');
        b.setAttribute('class', 'select-items select-hide');
        for (let j = 0; j < selElmnt.length; j++) {
            const c = document.createElement('DIV');
            c.innerHTML = selElmnt.options[j].innerHTML;
            if (selElmnt.options[j].value === 'up') {
                c.setAttribute('class', 'same-as-selected');
            }
            c.classList.add('select-item');
            c.addEventListener('click', function (e) {
                const s = this.parentNode.parentNode.getElementsByTagName('select')[0];
                const h = this.parentNode.previousSibling;
                for (let i = 0; i < s.length; i++) {
                    if (s.options[i].innerHTML === this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        const y = this.parentNode.getElementsByClassName('same-as-selected');
                        for (let k = 0; k < y.length; k++) {
                            y[k].removeAttribute('class');
                        }
                        this.setAttribute('class', 'same-as-selected select-item');
                        break;
                    }
                }
                h.click();
                updateDurationBreakFields();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener('click', function (e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle('select-hide');
            this.classList.toggle('select-arrow-active');
        });
    }
    function closeAllSelect(elmnt) {
        const items = document.getElementsByClassName('select-items');
        const selected = document.getElementsByClassName('select-selected');
        for (let i = 0; i < selected.length; i++) {
            if (elmnt == selected[i]) continue;
            selected[i].classList.remove('select-arrow-active');
        }
        for (let i = 0; i < items.length; i++) {
            if (elmnt && elmnt.nextSibling == items[i]) continue;
            items[i].classList.add('select-hide');
        }
    }
    document.addEventListener('click', function (e) {
        closeAllSelect(null);
    });
})();

// --- Show/hide duration/break fields based on timer type ---
function updateDurationBreakFields() {
    const durationFlex = document.getElementById('duration-flex');
    const shortBreakFlex = document.getElementById('short-break-flex');
    const longBreakFlex = document.getElementById('long-break-flex');
    if (!counterTypeSelect) return;
    const val = counterTypeSelect.value;
    if (val === 'up') {
        if (durationFlex) durationFlex.classList.add('hidden');
        if (shortBreakFlex) shortBreakFlex.classList.add('hidden');
        if (longBreakFlex) longBreakFlex.classList.add('hidden');
    } else if (val === 'down') {
        if (durationFlex) durationFlex.classList.remove('hidden');
        if (shortBreakFlex) shortBreakFlex.classList.add('hidden');
        if (longBreakFlex) longBreakFlex.classList.add('hidden');
    } else if (val === 'pomo' || val === 'pomodoro') {
        if (durationFlex) durationFlex.classList.remove('hidden');
        if (shortBreakFlex) shortBreakFlex.classList.remove('hidden');
        if (longBreakFlex) longBreakFlex.classList.remove('hidden');
    }
}

if (counterTypeSelect) {
    counterTypeSelect.addEventListener('change', updateDurationBreakFields);
    // Also call on load to set initial state
    updateDurationBreakFields();
}

// Patch custom select UI to also call updateDurationBreakFields
(function patchCustomSelectForDurationFields() {
    const selects = document.getElementsByClassName('custom-timer-select');
    for (let i = 0; i < selects.length; i++) {
        const sel = selects[i].getElementsByTagName('select')[0];
        if (!sel) continue;
        sel.addEventListener('change', updateDurationBreakFields);
    }
})();

// Motivational/status messages for Pomodoro
const POMODORO_MESSAGES = {
    work: [
        "You're doing great, stay with it 😊",
        "One moment at a time ⏳",
        "Every second you're leveling up 🚀",
        "You've got this! Don’t stop now 🔥",
        "Focus mode: activated 👀",
        "Keep the streak alive 😎",
        "Momentum is building, ride it 🌊",
        "Stay in the zone, you're crushing it ⚡",
        "Power through with purpose 💡",
        "Locked in and making progress 🧩",
        "You're closer than you think 📍",
        "Keep showing up, it’s working 💯",
        "Stack those wins, one block at a time 🧱",
        "Mind sharp, focus strong 🎯",
        "Great things are built like this 🛠️"
    ],
    shortBreak: [
        "Time to reset, stretch it out 🙆‍♂️",
        "Hydration check 💧",
        "Small break, big gains 🌿",
        "Stand up, shake it off 🕺",
        "Let your mind wander a bit ☁️",
        "Deep breath in and out 🧘‍♀️",
        "Rest your eyes, refresh your mind 👀",
        "Wiggle your fingers, roll your shoulders 🌀",
        "Quick pause, steady rhythm 🎵",
        "Give your focus a soft reboot 🔁",
        "You're not wasting time, you're recovering 🧃",
        "Reset your energy like a champ 🔋"
    ],
    longBreak: [
        "Well deserved, take it easy 🛋️",
        "Time to unplug and recharge 🔌",
        "You're on a roll, enjoy the pause 🏆",
        "Celebrate your effort, you earned this 🎉",
        "Step away, breathe deep, smile 😌",
        "Let your mind cool off a bit 🌬️",
        "Now’s your moment to truly relax 🌅",
        "This break belongs to you 🎈",
        "Rest well, you’ve done the work 💤",
        "Kick back and soak in the progress ☀️",
        "Give yourself space to reset 🛑",
        "You’re building balance, not just progress ⚖️"
    ]
};

function getRandomPomodoroMessage(type) {
    const arr = POMODORO_MESSAGES[type] || [];
    if (!arr.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- Local XP Accumulation System ---
let pendingXP = 0;

function flushPendingXP() {
    if (!activeTaskId || !pendingXP) return;
    const task = window.taskManager.getTask(activeTaskId);
    if (!task) return;
    task.xpearned = (task.xpearned || 0) + pendingXP;
    pushXPToFirebase(pendingXP);
    pendingXP = 0;
}

const origStartTask = startTask;
startTask = function () {
    origStartTask.apply(this, arguments);
    if (activeTimer) {
        activeTimer.onTickXP = function () {
            pendingXP += 5;
        };
    }
};

const origPauseTask = pauseTask;
pauseTask = function () {
    flushPendingXP();
    origPauseTask.apply(this, arguments);
};
const origResetTask = resetTask;
resetTask = function () {
    flushPendingXP();
    origResetTask.apply(this, arguments);
};
const origCompleteTask = typeof completeTask === 'function' ? completeTask : () => { };
completeTask = function () {
    flushPendingXP();
    origCompleteTask.apply(this, arguments);
};

function hasUnsavedChanges() {
    return activeTimer && activeTimer.isRunning;
}

window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
        return;
    }
    try {
        if (activeTaskId) {
            saveElapsedTimeToTask();
            const task = window.taskManager.getTask(activeTaskId);
            if (task) {
                if (!task.status || task.status === 'pending') {
                    task.status = 'paused';
                }
                queueFirebaseUpdate(task, { elapsedTime: task.elapsedTime, status: task.status });
            }
        }
    } catch (e) {
        console.error('Error saving state before unload:', e);
    }
});