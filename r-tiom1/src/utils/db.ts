const DB_NAME = 'rtiom_db';
const DB_VERSION = 1;
const STORE_NAME = 'files';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Saves a File or Blob to IndexedDB and returns a protocol URL (indexeddb://<key>) 
 * that can be easily resolved later.
 */
export async function saveFileToDB(key: string, file: File | Blob): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(file, key);

    request.onsuccess = () => resolve(`indexeddb://${key}`);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves a File or Blob from IndexedDB by key.
 */
export async function getFileFromDB(key: string): Promise<Blob | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Removes a file from IndexedDB by key.
 */
export async function deleteFileFromDB(key: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// In-memory cache for generated blob URLs so we can reuse them and clean them up
const blobUrlCache = new Map<string, string>();

/**
 * Resolves a URL string. If it is an "indexeddb://" URL, it loads the blob from IndexedDB,
 * caches the generated Object URL, and returns it. Otherwise returns the URL as-is.
 */
export async function resolveUrl(url: string | undefined): Promise<string> {
  if (!url) return '';
  if (!url.startsWith('indexeddb://')) {
    return url;
  }

  const cachedUrl = blobUrlCache.get(url);
  if (cachedUrl) return cachedUrl;

  const key = url.replace('indexeddb://', '');
  try {
    const blob = await getFileFromDB(key);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      blobUrlCache.set(url, blobUrl);
      return blobUrl;
    }
  } catch (err) {
    console.error(`Error resolving IndexedDB URL (${url}):`, err);
  }

  // Fallback
  return '';
}

/**
 * Revokes all cached Object URLs to free memory
 */
export function clearBlobUrlCache() {
  blobUrlCache.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  });
  blobUrlCache.clear();
}
