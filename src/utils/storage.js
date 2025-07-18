// src/utils/storage.js
export class StorageManager {
  constructor() {
    this.cache = new Map();
  }

  async init() {
    // Initialize default settings
    const defaultSettings = {
      emailCheckInterval: 5, // minutes
      taskPriorities: ['high', 'medium', 'low'],
      categories: ['assignment', 'meeting', 'deadline', 'reminder'],
      notifications: {
        enabled: true,
        deadlineWarning: 24 // hours
      }
    };

    await this.setDefaults(defaultSettings);
  }

  async setDefaults(defaults) {
    const stored = await this.get(Object.keys(defaults));
    const toSet = {};

    Object.keys(defaults).forEach(key => {
      if (stored[key] === undefined) {
        toSet[key] = defaults[key];
      }
    });

    if (Object.keys(toSet).length > 0) {
      await this.set(toSet);
    }
  }

  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  }

  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, resolve);
    });
  }

  async remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(keys, resolve);
    });
  }

  async getTasks() {
    const data = await this.get(['tasks']);
    return data.tasks || [];
  }

  async saveTasks(tasks) {
    await this.set({ tasks });
    this.cache.set('tasks', tasks);
  }

  async addTask(task) {
    const tasks = await this.getTasks();
    task.id = this.generateId();
    task.createdAt = new Date().toISOString();
    tasks.push(task);
    await this.saveTasks(tasks);
    return task;
  }

  async updateTask(taskId, updates) {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      await this.saveTasks(tasks);
      return tasks[index];
    }
    
    return null;
  }

  async deleteTask(taskId) {
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    await this.saveTasks(filtered);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}