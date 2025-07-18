// src/content/content.js
import { GmailParser } from './gmail-parser.js';

class ContentScript {
  constructor() {
    this.parser = new GmailParser();
    this.init();
  }

  init() {
    console.log('AI Email Assistant Content Script Loaded');
    
    // Only run on Gmail
    if (!window.location.hostname.includes('mail.google.com')) {
      return;
    }

    // Wait for Gmail to load
    this.waitForGmail().then(() => {
      this.setupEmailMonitoring();
    });
  }

  async waitForGmail() {
    return new Promise((resolve) => {
      const checkGmail = () => {
        if (document.querySelector('[role="main"]')) {
          resolve();
        } else {
          setTimeout(checkGmail, 1000);
        }
      };
      checkGmail();
    });
  }

  setupEmailMonitoring() {
    // Monitor for new emails and email opens
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.handleDOMChanges(mutation);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial scan of visible emails
    this.scanVisibleEmails();
  }

  handleDOMChanges(mutation) {
    // Look for email conversation views
    const emailElements = mutation.target.querySelectorAll('[data-message-id]');
    emailElements.forEach(element => {
      if (!element.dataset.processed) {
        this.processEmailElement(element);
        element.dataset.processed = 'true';
      }
    });
  }

  scanVisibleEmails() {
    const emailElements = document.querySelectorAll('[data-message-id]');
    emailElements.forEach(element => {
      if (!element.dataset.processed) {
        this.processEmailElement(element);
        element.dataset.processed = 'true';
      }
    });
  }

  async processEmailElement(element) {
    try {
      const emailData = this.parser.parseEmailElement(element);
      if (emailData) {
        // Send to background script for processing
        chrome.runtime.sendMessage({
          action: 'PROCESS_EMAIL',
          emailData: emailData
        });
      }
    } catch (error) {
      console.error('Error processing email element:', error);
    }
  }
}

// Initialize content script
new ContentScript();