// src/background/gmail-monitor.js
import { APIClient } from '../utils/api.js';
import { EXTENSION_CONFIG } from '../utils/constants.js';

export class GmailMonitor {
  constructor() {
    this.apiClient = new APIClient();
    this.lastCheckTime = null;
    this.isMonitoring = false;
  }

  async init(accessToken) {
    this.apiClient.setAccessToken(accessToken);
    this.lastCheckTime = await this.getLastCheckTime();
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Started Gmail monitoring');
    
    // Initial check
    await this.checkNewEmails();
    
    // Set up periodic checks
    this.scheduleNextCheck();
  }

  async stopMonitoring() {
    this.isMonitoring = false;
    console.log('Stopped Gmail monitoring');
  }

  async checkNewEmails() {
    if (!this.isMonitoring) return;
    
    try {
      const query = this.buildSearchQuery();
      const response = await this.apiClient.getGmailMessages(query, 50);
      
      if (response.messages && response.messages.length > 0) {
        const newEmails = [];
        
        for (const message of response.messages) {
          const emailData = await this.apiClient.getGmailMessage(message.id);
          
          if (this.isNewEmail(emailData)) {
            newEmails.push(emailData);
          }
        }
        
        if (newEmails.length > 0) {
          await this.processNewEmails(newEmails);
        }
      }
      
      await this.updateLastCheckTime();
    } catch (error) {
      console.error('Error checking new emails:', error);
    }
  }

  buildSearchQuery() {
    const queries = [];
    
    // Look for unread emails
    queries.push('is:unread');
    
    // Academic-related keywords
    const keywords = [
      'assignment', 'homework', 'exam', 'quiz', 'project', 
      'deadline', 'due', 'submit', 'class', 'course'
    ];
    
    if (keywords.length > 0) {
      queries.push(`(${keywords.map(k => `subject:${k} OR body:${k}`).join(' OR ')})`);
    }
    
    // Time filter - only recent emails
    if (this.lastCheckTime) {
      const timeQuery = `after:${Math.floor(this.lastCheckTime / 1000)}`;
      queries.push(timeQuery);
    }
    
    return queries.join(' AND ');
  }

  isNewEmail(emailData) {
    const emailDate = new Date(emailData.internalDate);
    return !this.lastCheckTime || emailDate.getTime() > this.lastCheckTime;
  }

  async processNewEmails(emails) {
    for (const email of emails) {
      try {
        // Send to background script for AI processing
        chrome.runtime.sendMessage({
          action: 'PROCESS_EMAIL',
          emailData: this.parseGmailMessage(email)
        });
      } catch (error) {
        console.error('Error processing email:', error);
      }
    }
  }

  parseGmailMessage(gmailMessage) {
    const headers = gmailMessage.payload.headers;
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
    
    return {
      id: gmailMessage.id,
      subject: getHeader('Subject'),
      sender: getHeader('From'),
      date: new Date(parseInt(gmailMessage.internalDate)).toISOString(),
      body: this.extractBody(gmailMessage.payload),
      snippet: gmailMessage.snippet,
      labels: gmailMessage.labelIds || []
    };
  }

  extractBody(payload) {
    let body = '';
    
    if (payload.body && payload.body.data) {
      body = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
    
    return body;
  }

  async getLastCheckTime() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['lastEmailCheck'], (result) => {
        resolve(result.lastEmailCheck || Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago
      });
    });
  }

  async updateLastCheckTime() {
    const now = Date.now();
    await chrome.storage.sync.set({ lastEmailCheck: now });
    this.lastCheckTime = now;
  }

  scheduleNextCheck() {
    if (!this.isMonitoring) return;
    
    setTimeout(() => {
      this.checkNewEmails();
      this.scheduleNextCheck();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}