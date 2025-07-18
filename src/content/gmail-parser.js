// src/content/gmail-parser.js
export class GmailParser {
  constructor() {
    this.selectors = {
      emailContainer: '[data-message-id]',
      subject: '[data-thread-perm-id] h2',
      sender: '[data-thread-perm-id] .go span[email]',
      date: '[data-thread-perm-id] .g3 span[title]',
      body: '[data-message-id] .ii.gt div',
      attachments: '[data-message-id] .aZo'
    };
  }

  parseEmailElement(element) {
    try {
      const messageId = element.getAttribute('data-message-id');
      if (!messageId) return null;

      const emailData = {
        id: messageId,
        subject: this.extractSubject(element),
        sender: this.extractSender(element),
        date: this.extractDate(element),
        body: this.extractBody(element),
        attachments: this.extractAttachments(element),
        isRead: !element.classList.contains('zE'),
        isImportant: element.classList.contains('zE'),
        labels: this.extractLabels(element)
      };

      return emailData;
    } catch (error) {
      console.error('Error parsing email element:', error);
      return null;
    }
  }

  extractSubject(element) {
    const subjectElement = element.querySelector(this.selectors.subject);
    return subjectElement ? subjectElement.textContent.trim() : '';
  }

  extractSender(element) {
    const senderElement = element.querySelector(this.selectors.sender);
    return senderElement ? senderElement.getAttribute('email') : '';
  }

  extractDate(element) {
    const dateElement = element.querySelector(this.selectors.date);
    if (dateElement) {
      const title = dateElement.getAttribute('title');
      return title ? new Date(title).toISOString() : null;
    }
    return null;
  }

  extractBody(element) {
    const bodyElements = element.querySelectorAll(this.selectors.body);
    let bodyText = '';
    
    bodyElements.forEach(el => {
      bodyText += el.textContent + '\n';
    });
    
    return bodyText.trim();
  }

  extractAttachments(element) {
    const attachmentElements = element.querySelectorAll(this.selectors.attachments);
    return Array.from(attachmentElements).map(el => {
      return {
        name: el.getAttribute('title') || el.textContent.trim(),
        type: this.getAttachmentType(el)
      };
    });
  }

  extractLabels(element) {
    const labelElements = element.querySelectorAll('.ar .at');
    return Array.from(labelElements).map(el => el.textContent.trim());
  }

  getAttachmentType(element) {
    const filename = element.getAttribute('title') || element.textContent.trim();
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
      'pdf': 'document',
      'doc': 'document',
      'docx': 'document',
      'txt': 'document',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'zip': 'archive',
      'rar': 'archive'
    };
    
    return typeMap[extension] || 'unknown';
  }

  isAcademicEmail(emailData) {
    const academicDomains = ['.edu', '.ac.', 'university', 'college', 'school'];
    const academicKeywords = ['assignment', 'homework', 'exam', 'course', 'class', 'professor', 'teacher'];
    
    // Check sender domain
    const senderDomain = emailData.sender.split('@')[1] || '';
    const isAcademicDomain = academicDomains.some(domain => 
      senderDomain.toLowerCase().includes(domain)
    );
    
    // Check subject and body for academic keywords
    const text = (emailData.subject + ' ' + emailData.body).toLowerCase();
    const hasAcademicKeywords = academicKeywords.some(keyword => 
      text.includes(keyword)
    );
    
    return isAcademicDomain || hasAcademicKeywords;
  }
}