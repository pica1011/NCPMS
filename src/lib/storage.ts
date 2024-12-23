import { getDb } from './db';

const DB_NAME = 'warehouseDB';
const STORE_NAME = 'sqliteBackup';

export const storage = {
  async saveDatabase() {
    const db = getDb();
    const data = db.export();
    const buffer = new Uint8Array(data).buffer;

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const saveRequest = store.put(buffer, 'database');
        
        saveRequest.onsuccess = () => resolve(true);
        saveRequest.onerror = () => reject(saveRequest.error);
        
        transaction.oncomplete = () => db.close();
      };
      
      request.onerror = () => reject(request.error);
    });
  },

  async loadDatabase(): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const getRequest = store.get('database');
        
        getRequest.onsuccess = () => {
          const buffer = getRequest.result;
          if (buffer) {
            resolve(new Uint8Array(buffer));
          } else {
            resolve(null);
          }
        };
        
        getRequest.onerror = () => reject(getRequest.error);
        
        transaction.oncomplete = () => db.close();
      };
      
      request.onerror = () => reject(request.error);
    });
  }
};