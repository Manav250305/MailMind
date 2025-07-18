// src/popup/popup.js
class PopupManager {
  constructor() {
    this.currentTab = 'tasks';
    this.tasks = [];
    this.init();
  }

  async init() {
    await this.setupEventListeners();
    await this.checkAuthStatus();
  }

  setupEventListeners() {
    // Tab navigation
    document.getElementById('tasksTab').addEventListener('click', () => {
      this.switchTab('tasks');
    });
    
    document.getElementById('calendarTab').addEventListener('click', () => {
      this.switchTab('calendar');
    });
    
    document.getElementById('insightsTab').addEventListener('click', () => {
      this.switchTab('insights');
    });

    // Authentication
    document.getElementById('authBtn').addEventListener('click', () => {
      this.handleAuth();
    });

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Task filtering
    document.getElementById('filterSelect').addEventListener('change', (e) => {
      this.filterTasks(e.target.value);
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    document.getElementById(`${tabName}View`).style.display = 'block';

    this.currentTab = tabName;

    // Load tab-specific content
    switch (tabName) {
      case 'tasks':
        this.loadTasks();
        break;
      case 'calendar':
        this.loadCalendar();
        break;
      case 'insights':
        this.loadInsights();
        break;
    }
  }

  async checkAuthStatus() {
    this.showLoading();
    
    try {
      const response = await this.sendMessage({ action: 'GET_AUTH_STATUS' });
      
      if (response.success && response.data.authenticated) {
        this.showMainSection();
        this.loadTasks();
      } else {
        this.showAuthSection();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.showAuthSection();
    }
  }

  async handleAuth() {
    try {
      // This will be implemented with Google OAuth
      console.log('Authentication flow will be implemented here');
      
      // For now, simulate successful auth
      setTimeout(() => {
        this.showMainSection();
        this.loadTasks();
      }, 2000);
      
    } catch (error) {
      console.error('Authentication failed:', error);
      this.showError('Authentication failed. Please try again.');
    }
  }

  async loadTasks() {
    try {
      const response = await this.sendMessage({ action: 'GET_TASKS' });
      
      if (response.success) {
        this.tasks = response.data || [];
        this.renderTasks();
      } else {
        this.showError('Failed to load tasks');
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.showError('Failed to load tasks');
    }
  }

  renderTasks() {
    const tasksList = document.getElementById('tasksList');
    
    if (this.tasks.length === 0) {
      tasksList.innerHTML = `
        <div class="empty-state">
          <h3>No tasks found</h3>
          <p>New tasks will appear here when emails are processed</p>
        </div>
      `;
      return;
    }

    tasksList.innerHTML = this.tasks.map(task => `
      <div class="task-item" data-task-id="${task.id}">
        <div class="task-title">${task.title}</div>
        <div class="task-details">
          <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
          <span class="task-priority priority-${task.priority}">${task.priority}</span>
        </div>
      </div>
    `).join('');

    // Add click listeners to tasks
    document.querySelectorAll('.task-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const taskId = e.currentTarget.dataset.taskId;
        this.showTaskDetails(taskId);
      });
    });
  }

  filterTasks(filter) {
    const filteredTasks = this.tasks.filter(task => {
      switch (filter) {
        case 'pending':
          return !task.completed;
        case 'completed':
          return task.completed;
        case 'overdue':
          return task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        default:
          return true;
      }
    });

    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = filteredTasks.map(task => `
      <div class="task-item" data-task-id="${task.id}">
        <div class="task-title">${task.title}</div>
        <div class="task-details">
          <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
          <span class="task-priority priority-${task.priority}">${task.priority}</span>
        </div>
      </div>
    `).join('');
  }

  loadCalendar() {
    // Calendar integration will be implemented in Phase 4
    document.getElementById('calendarContainer').innerHTML = `
      <div class="empty-state">
        <h3>Calendar Integration</h3>
        <p>Calendar view will be available in the next update</p>
      </div>
    `;
  }

  loadInsights() {
    // Analytics will be implemented in Phase 5
    document.getElementById('insightsContainer').innerHTML = `
      <div class="empty-state">
        <h3>Productivity Insights</h3>
        <p>Analytics and insights will be available in the next update</p>
      </div>
    `;
  }

  showTaskDetails(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      // Show task details modal or navigate to details view
      console.log('Show task details for:', task);
    }
  }

  showLoading() {
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'none';
  }

  showAuthSection() {
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
  }

  showMainSection() {
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';
  }

  showError(message) {
    // Simple error display - can be enhanced with better UI
    alert(message);
  }

  sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});