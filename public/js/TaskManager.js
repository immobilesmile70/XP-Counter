import { loadTasksFromFirebase, getUserId } from '/js/firebase.js';

class Task {
  constructor({
    id,
    name,
    type,
    duration = null,
    breakDuration = null,
    shortBreakDuration = null,
    longBreakDuration = null,
    cyclesPerSet = 4,
    elapsedTime = 0,
    pomodoroState = null,
    xpearned = 0,
  }) {
    this.id = id || crypto.randomUUID();
    this.name = name;
    this.type = type;
    this.duration = duration;
    this.breakDuration = breakDuration;
    this.shortBreakDuration = shortBreakDuration;
    this.longBreakDuration = longBreakDuration;
    this.cyclesPerSet = cyclesPerSet;
    this.elapsedTime = elapsedTime;
    this.pomodoroState = pomodoroState;
    this.status = 'pending';
    this.xpearned = xpearned || 0;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
  }

  addElapsedTime(seconds) {
    this.elapsedTime += seconds;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      duration: this.duration,
      breakDuration: this.breakDuration,
      shortBreakDuration: this.shortBreakDuration,
      longBreakDuration: this.longBreakDuration,
      cyclesPerSet: this.cyclesPerSet,
      elapsedTime: this.elapsedTime,
      pomodoroState: this.pomodoroState,
      status: this.status,
      xpearned: this.xpearned,
    };
  }
}

export class TaskManager {
  constructor() {
    this.tasks = new Map();
    this.currentTaskId = null;
  }

  createTask(taskData) {
    const task = new Task(taskData);
    this.tasks.set(task.id, task);
    return task;
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  setCurrentTask(id) {
    if (this.tasks.has(id)) {
      this.currentTaskId = id;
    }
  }

  getCurrentTask() {
    return this.tasks.get(this.currentTaskId);
  }

  updateXP(id, minutes) {
    const task = this.tasks.get(id);
    if (task) task.addXP(minutes);
  }

  updateStatus(id, status) {
    const task = this.tasks.get(id);
    if (task) task.updateStatus(status);
  }

  completeCurrentTask() {
    const task = this.getCurrentTask();
    if (task) {
      task.updateStatus('completed');
    }
  }

  removeTask(id) {
    this.tasks.delete(id);
    if (this.currentTaskId === id) {
      this.currentTaskId = null;
    }
  }

  toJSON() {
    const obj = {};
    this.tasks.forEach((task, id) => {
      obj[id] = task.toJSON();
    });
    return obj;
  }

  loadFromJSON(json) {
    this.tasks.clear();
    for (const id in json) {
      const task = new Task({ ...json[id], id });
      this.tasks.set(id, task);
    }
  }

  async loadTasksFromFirebase() {
    const uid = getUserId();
    if (!uid) return [];
    const tasks = await loadTasksFromFirebase(uid);
    if (Array.isArray(tasks)) {
      this.tasks = tasks;
      return tasks;
    }
    return [];
  }
}