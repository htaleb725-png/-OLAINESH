/**
 * IndexedDB Image Storage Helper
 * High-capacity client-side storage for thousands of high-resolution images (1,000 - 2,000+ images)
 * Bypasses localStorage 5MB limit safely and reliably.
 */

const DB_NAME = 'AlNashiOfficeImageArchiveDB';
const DB_VERSION = 1;
const STORE_NAME = 'request_images';

interface ImageRecord {
  id: string; // usually request_id or custom image id
  citizenName: string;
  citizenId?: string;
  dataUrl: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  uploadedAt: string;
  extractedText?: string;
  entity?: string;
  details?: string;
  phone?: string;
  priority?: 'عاجل' | 'عام' | 'خاص جداً';
  requestType?: string;
  confidence?: number;
  ocrProcessed?: boolean;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('citizenName', 'citizenName', { unique: false });
        store.createIndex('citizenId', 'citizenId', { unique: false });
        store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Save an image record into IndexedDB
 */
export async function saveImageToDB(record: ImageRecord): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save image to IndexedDB', err);
  }
}

/**
 * Save multiple images in a single batch transaction
 */
export async function saveBatchImagesToDB(records: ImageRecord[]): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const rec of records) {
        store.put(rec);
      }
    });
  } catch (err) {
    console.error('Failed to save batch images to IndexedDB', err);
  }
}

/**
 * Get an image record by ID
 */
export async function getImageFromDB(id: string): Promise<ImageRecord | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get image from IndexedDB', err);
    return null;
  }
}

/**
 * Get all stored image records
 */
export async function getAllImagesFromDB(): Promise<ImageRecord[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to fetch all images from IndexedDB', err);
    return [];
  }
}

/**
 * Delete image by ID
 */
export async function deleteImageFromDB(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete image from IndexedDB', err);
  }
}

/**
 * Delete multiple images by IDs
 */
export async function deleteBatchImagesFromDB(ids: string[]): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const id of ids) {
        store.delete(id);
      }
    });
  } catch (err) {
    console.error('Failed to delete batch images from IndexedDB', err);
  }
}

/**
 * Update image metadata
 */
export async function updateImageMetadataInDB(
  id: string, 
  updates: Partial<Omit<ImageRecord, 'id'>>
): Promise<void> {
  try {
    const existing = await getImageFromDB(id);
    if (!existing) return;
    const updated: ImageRecord = {
      ...existing,
      ...updates
    };
    await saveImageToDB(updated);
  } catch (err) {
    console.error('Failed to update image metadata in IndexedDB', err);
  }
}

/**
 * Clear all images from IndexedDB (Total wipeout)
 */
export async function clearAllImagesFromDB(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to clear all images from IndexedDB', err);
  }
}

export type { ImageRecord };
