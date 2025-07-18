// src/utils/constants.js
export const EXTENSION_CONFIG = {
  // Gmail API Configuration
  GMAIL: {
    SCOPES: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
  },
  
  // Calendar API Configuration
  CALENDAR: {
    SCOPES: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
  },
  
  // Task Categories
  TASK_CATEGORIES: {
    ASSIGNMENT: 'assignment',
    MEETING: 'meeting',
    DEADLINE: 'deadline',
    REMINDER: 'reminder',
    EXAM: 'exam',
    SUBMISSION: 'submission'
  },
  
  // Task Priorities
  TASK_PRIORITIES: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  },
  
  // Email Processing Keywords
  EMAIL_KEYWORDS: {
    ASSIGNMENT: ['assignment', 'homework', 'task', 'project', 'essay', 'report'],
    DEADLINE: ['deadline', 'due', 'submit', 'submission', 'expire', 'final date'],
    MEETING: ['meeting', 'appointment', 'conference', 'call', 'session', 'office hours'],
    EXAM: ['exam', 'test', 'quiz', 'assessment', 'evaluation', 'midterm', 'final'],
    URGENT: ['urgent', 'asap', 'immediate', 'priority', 'important', 'critical']
  },
  
  // Time Parsing Patterns
  TIME_PATTERNS: {
    DATE_FORMATS: [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{4})/i
    ],
    TIME_FORMATS: [
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i
    ]
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    TASKS: 'tasks',
    SETTINGS: 'settings',
    AUTH_TOKEN: 'authToken',
    USER_PREFERENCES: 'userPreferences',
    LAST_SYNC: 'lastSync'
  }
};

export const DEFAULT_SETTINGS = {
  emailCheckInterval: 5,
  notificationsEnabled: true,
  deadlineWarningHours: 24,
  autoCreateCalendarEvents: true,
  taskCategories: Object.values(EXTENSION_CONFIG.TASK_CATEGORIES),
  excludedSenders: [],
  includeKeywords: [],
  excludeKeywords: ['spam', 'promotion', 'advertisement']
};