// src/utils/auth.js
import { EXTENSION_CONFIG } from './constants.js';

export class AuthManager {
  constructor() {
    this.clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual client ID
    this.accessToken = null;
    this.refreshToken = null;
  }

  async init() {
    // Check if we have stored tokens
    const tokens = await this.getStoredTokens();
    if (tokens.accessToken) {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      
      // Verify token is still valid
      const isValid = await this.verifyToken();
      if (!isValid && this.refreshToken) {
        await this.refreshAccessToken();
      }
    }
  }

  async authenticate() {
    try {
      // Use Chrome Identity API for OAuth flow
      const redirectURL = chrome.identity.getRedirectURL();
      const authURL = this.buildAuthURL(redirectURL);
      
      return new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
          {
            url: authURL,
            interactive: true
          },
          async (responseUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            try {
              const tokens = this.parseTokensFromURL(responseUrl);
              await this.storeTokens(tokens);
              this.accessToken = tokens.accessToken;
              this.refreshToken = tokens.refreshToken;
              resolve(tokens);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  buildAuthURL(redirectURL) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: redirectURL,
      scope: [
        ...EXTENSION_CONFIG.GMAIL.SCOPES,
        ...EXTENSION_CONFIG.CALENDAR.SCOPES
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  parseTokensFromURL(url) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const code = urlParams.get('code');
    
    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for tokens
    return this.exchangeCodeForTokens(code);
  }

  async exchangeCodeForTokens(code) {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: 'YOUR_CLIENT_SECRET', // Replace with actual secret
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: chrome.identity.getRedirectURL()
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type
    };
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: 'YOUR_CLIENT_SECRET',
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    this.accessToken = tokens.access_token;
    
    await this.storeTokens({
      accessToken: tokens.access_token,
      refreshToken: this.refreshToken,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type
    });

    return tokens.access_token;
  }

  async verifyToken() {
    if (!this.accessToken) {
      return false;
    }

    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${this.accessToken}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async storeTokens(tokens) {
    await chrome.storage.sync.set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: Date.now() + (tokens.expiresIn * 1000)
    });
  }

  async getStoredTokens() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['accessToken', 'refreshToken', 'tokenExpiry'], resolve);
    });
  }

  async clearTokens() {
    await chrome.storage.sync.remove(['accessToken', 'refreshToken', 'tokenExpiry']);
    this.accessToken = null;
    this.refreshToken = null;
  }

  async logout() {
    if (this.accessToken) {
      // Revoke token
      await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
        method: 'POST'
      });
    }
    
    await this.clearTokens();
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }
}