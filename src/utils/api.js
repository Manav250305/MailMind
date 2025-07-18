// src/utils/api.js
export class MessageHandler {
  constructor() {
    this.listeners = new Map();
  }

  addListener(action, handler) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, []);
    }
    this.listeners.get(action).push(handler);
  }

  async handleMessage(request, sender, sendResponse) {
    const { action } = request;
    
    if (this.listeners.has(action)) {
      const handlers = this.listeners.get(action);
      
      try {
        for (const handler of handlers) {
          const result = await handler(request, sender);
          if (result !== undefined) {
            sendResponse({ success: true, data: result });
            return;
          }
        }
        
        sendResponse({ success: false, error: 'No handler returned data' });
      } catch (error) {
        console.error(`Error handling message ${action}:`, error);
        sendResponse({ success: false, error: error.message });
      }
    } else {
      sendResponse({ success: false, error: `Unknown action: ${action}` });
    }
  }

  sendMessage(tabId, message) {
    return new Promise((resolve) => {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, message, resolve);
      } else {
        chrome.runtime.sendMessage(message, resolve);
      }
    });
  }
}

// Utility functions for API calls
export class APIClient {
  constructor() {
    this.baseURL = 'https://www.googleapis.com';
    this.accessToken = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getGmailMessages(query = '', maxResults = 10) {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString()
    });
    
    return await this.makeRequest(`/gmail/v1/users/me/messages?${params}`);
  }

  async getGmailMessage(messageId) {
    return await this.makeRequest(`/gmail/v1/users/me/messages/${messageId}`);
  }

  async getCalendarEvents(calendarId = 'primary', timeMin = null, timeMax = null) {
    const params = new URLSearchParams({
      calendarId,
      ...(timeMin && { timeMin }),
      ...(timeMax && { timeMax })
    });
    
    return await this.makeRequest(`/calendar/v3/calendars/${calendarId}/events?${params}`);
  }

  async createCalendarEvent(calendarId = 'primary', event) {
    return await this.makeRequest(`/calendar/v3/calendars/${calendarId}/events`, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }
}