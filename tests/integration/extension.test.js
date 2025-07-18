// tests/integration/extension.test.js
describe('Extension Integration', () => {
  beforeEach(() => {
    // Set up DOM for popup
    document.body.innerHTML = `
      <div id="app">
        <div id="loadingSection"></div>
        <div id="authSection"></div>
        <div id="mainSection"></div>
      </div>
    `;
  });

  test('should show auth section when not authenticated', async () => {
    // Mock unauthenticated state
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      if (message.action === 'GET_AUTH_STATUS') {
        callback({ success: true, data: { authenticated: false } });
      }
    });

    // Import and initialize popup
    const { PopupManager } = await import('../../src/popup/popup.js');
    const popup = new PopupManager();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(document.getElementById('authSection').style.display).toBe('block');
    expect(document.getElementById('mainSection').style.display).toBe('none');
  });
});