/**
 * Storage Service Module
 * Handles localStorage and IndexedDB operations
 */

export const StorageService = {
  db: null,
  isInitialized: false,

  // ===== LocalStorage Methods =====

  /**
   * Save to localStorage
   */
  setLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to save to localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Get from localStorage
   */
  getLocal(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to read from localStorage: ${key}`, error);
      return defaultValue;
    }
  },

  /**
   * Remove from localStorage
   */
  removeLocal(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   */
  clearLocal() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage', error);
      return false;
    }
  },

  // ===== IndexedDB Methods =====

  /**
   * Clear and recreate IndexedDB with proper schema
   */
  async clearAndRecreateDB() {
    if (this.db) {
      this.db.close();
    }
    
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase('brandStudioDB');
      
      deleteRequest.onsuccess = () => {
        console.log('Database cleared successfully');
        this.isInitialized = false;
        this.initIndexedDB().then(resolve).catch(reject);
      };
      
      deleteRequest.onerror = () => {
        console.error('Failed to clear database:', deleteRequest.error);
        reject(deleteRequest.error);
      };
    });
  },

  /**
   * Initialize IndexedDB
   */
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BrandStudioDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('name', 'name', { unique: false });
          fileStore.createIndex('type', 'type', { unique: false });
          fileStore.createIndex('fieldName', 'fieldName', { unique: false });
          fileStore.createIndex('category', 'category', { unique: false });
        }
      };
    });
  },

  /**
   * Store file in IndexedDB with enhanced metadata for persistence
   */
  async storeFile(file, fieldName, metadata = {}) {
    if (!this.isInitialized) await this.initIndexedDB();
    
    // Check if file is valid
    if (!file || !(file instanceof File)) {
      console.warn('Invalid file object passed to storeFile:', file);
      return null;
    }
    
    // First, read the file
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        // Then create transaction and store the data
        try {
          const transaction = this.db.transaction(['files'], 'readwrite');
          const store = transaction.objectStore('files');
          
          const fileData = {
            id: `${fieldName}_${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            data: reader.result,
            fieldName: fieldName,
            createdAt: new Date().toISOString(),
            // Enhanced metadata for persistence
            systemPath: metadata.systemPath || null,
            originalName: metadata.originalName || file.name,
            uploadTime: metadata.uploadTime || new Date().toISOString(),
            // File categorization for better organization
            category: this.getFileCategory(fieldName),
            mimeType: file.type,
            extension: this.getFileExtension(file.name)
          };
          
          const request = store.put(fileData);
          request.onsuccess = () => {
            // Also store the file path in localStorage for easy access
            this.setLocal(`filePath_${fieldName}`, fileData.systemPath);
            resolve(fileData.id);
          };
          request.onerror = () => reject(request.error);
          transaction.onerror = () => reject(transaction.error);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      
      // Read the file as ArrayBuffer
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Get file category based on field name
   */
  getFileCategory(fieldName) {
    const categories = {
      'logoFile': 'branding',
      'faviconFile': 'branding', 
      'heroImageFile': 'branding',
      'inventoryFile': 'data'
    };
    return categories[fieldName] || 'general';
  },

  /**
   * Get file extension
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  },

  /**
   * Get stored file path for persistence
   */
  getFilePath(fieldName) {
    return this.getLocal(`filePath_${fieldName}`, null);
  },

  /**
   * Restore file from storage by field name
   */
  async restoreFile(fieldName) {
    if (!this.isInitialized) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        
        // Try to use the fieldName index first, fall back to getAll if index doesn't exist
        try {
          const index = store.index('fieldName');
          const request = index.getAll(fieldName);
          
          request.onsuccess = () => {
            const files = request.result;
            if (files.length > 0) {
              // Get the most recent file
              const latestFile = files.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              )[0];
              resolve(latestFile);
            } else {
              resolve(null);
            }
          };
          
          request.onerror = () => reject(request.error);
        } catch (indexError) {
          // Index doesn't exist, fall back to scanning all files
          console.warn('fieldName index not found, scanning all files:', indexError);
          const request = store.getAll();
          
          request.onsuccess = () => {
            const files = request.result;
            const matchingFiles = files.filter(file => file.fieldName === fieldName);
            
            if (matchingFiles.length > 0) {
              // Get the most recent file
              const latestFile = matchingFiles.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              )[0];
              resolve(latestFile);
            } else {
              resolve(null);
            }
          };
          
          request.onerror = () => reject(request.error);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Get file from IndexedDB
   */
  async getFile(fileId) {
    if (!this.isInitialized) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      
      const request = store.get(fileId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Delete file from IndexedDB
   */
  async deleteFile(fileId) {
    if (!this.isInitialized) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      const request = store.delete(fileId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Get all files from IndexedDB
   */
  async getAllFiles(fieldName = null) {
    if (!this.isInitialized) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      
      const request = fieldName 
        ? store.index('fieldName').getAll(fieldName)
        : store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Clear all files from IndexedDB
   */
  async clearAllFiles() {
    if (!this.isInitialized) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Create blob URL from stored file
   */
  async createBlobUrl(fileData) {
    if (!fileData || !fileData.data) return null;
    
    const blob = new Blob([fileData.data], { type: fileData.type });
    return URL.createObjectURL(blob);
  },

  /**
   * Convert stored file to File object
   */
  async getFileObject(fileId) {
    const fileData = await this.getFile(fileId);
    if (!fileData) return null;
    
    const blob = new Blob([fileData.data], { type: fileData.type });
    return new File([blob], fileData.name, { type: fileData.type });
  },

  /**
   * Revoke blob URL
   */
  revokeBlobUrl(url) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
};

export default StorageService;
