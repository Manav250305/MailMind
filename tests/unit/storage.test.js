// tests/unit/storage.test.js
import { StorageManager } from '../../src/utils/storage.js';

describe('StorageManager', () => {
  let storageManager;
  
  beforeEach(() => {
    storageManager = new StorageManager();
    
    // Mock Chrome storage API
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn(),
          remove: jest.fn()
        }
      }
    };
  });

  test('should generate unique IDs', () => {
    const id1 = storageManager.generateId();
    const id2 = storageManager.generateId();
    
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });

  test('should add task with generated ID', async () => {
    const mockTasks = [];
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ tasks: mockTasks });
    });
    
    chrome.storage.sync.set.mockImplementation((data, callback) => {
      callback();
    });

    const task = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high'
    };

    const addedTask = await storageManager.addTask(task);
    
    expect(addedTask.id).toBeDefined();
    expect(addedTask.title).toBe('Test Task');
    expect(addedTask.createdAt).toBeDefined();
  });
});