// src/background/background.js
import { GmailMonitor } from './gmail-monitor.js';
import { StorageManager } from '../utils/storage.js';

class BackgroundService {
  constructor() {
    this.gmailMonitor = new GmailMonitor();
    this.storage = new StorageManager();
    this.init();
  }

  async init() {
    console.log('AI Email Assistant Background Service Started');
    
    // Set up message listeners
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Set up alarm for periodic email checks
    chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
    
    // Create periodic email check alarm
    chrome.alarms.create('emailCheck', { 
      delayInMinutes: 1, 
      periodInMinutes: 5 
    });

    // Initialize storage
    await this.storage.init();
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'GET_TASKS':
          const tasks = await this.storage.getTasks();
          sendResponse({ success: true, data: tasks });
          break;
        
        case 'PROCESS_EMAIL':
          const result = await this.processEmail(request.emailData);
          sendResponse({ success: true, data: result });
          break;
        
        case 'GET_AUTH_STATUS':
          const authStatus = await this.checkAuthStatus();
          sendResponse({ success: true, data: authStatus });
          break;
        
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep message channel open for async response
  }

  async handleAlarm(alarm) {
    if (alarm.name === 'emailCheck') {
      await this.gmailMonitor.checkNewEmails();
    }
  }

  async processEmail(emailData) {
    // Placeholder for email processing logic
    // This will be implemented in Phase 3
    return { processed: true, tasks: [] };
  }

  async checkAuthStatus() {
    // Placeholder for auth status check
    // This will be implemented in authentication section
    return { authenticated: false };
  }
}

// Initialize background service
new BackgroundService();