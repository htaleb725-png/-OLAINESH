/**
 * Realtime Google Sheets and Google Drive Auto-Sync Service
 * Automatically pushes records as they are saved in the system
 * without requiring the user to manually click any sync button.
 */

export interface SyncPayload {
  entityType: 'citizens' | 'requests' | 'interviews' | 'organization' | 'letters';
  action: 'insert' | 'update';
  data: any;
  timestamp: string;
}

// Queue for resilience
const syncQueue: SyncPayload[] = [];
let isProcessingQueue = false;

export async function pushToGoogleSheetsRealtime(
  entityType: 'citizens' | 'requests' | 'interviews' | 'organization' | 'letters',
  data: any,
  action: 'insert' | 'update' = 'insert',
  appsScriptUrl?: string,
  _sheetId?: string
): Promise<void> {
  const payload: SyncPayload = {
    entityType,
    action,
    data,
    timestamp: new Date().toISOString()
  };

  syncQueue.push(payload);
  processSyncQueue(appsScriptUrl);
}

async function processSyncQueue(customUrl?: string) {
  if (isProcessingQueue || syncQueue.length === 0) return;
  isProcessingQueue = true;

  try {
    const item = syncQueue.shift();
    if (!item) {
      isProcessingQueue = false;
      return;
    }

    // Determine target webhook URL from settings or environment
    const targetUrl = customUrl || (typeof window !== 'undefined' ? (localStorage.getItem('al_nashi_apps_script_url') || '') : '');

    if (targetUrl && targetUrl.startsWith('http')) {
      try {
        await fetch(targetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: item.action === 'insert' ? 'appendRow' : 'updateRow',
            sheetType: item.entityType,
            record: item.data,
            timestamp: item.timestamp,
            source: 'al_nashi_office_system'
          })
        });
      } catch (err) {
        console.warn('Realtime Google Sheets sync background warning:', err);
      }
    }
  } finally {
    isProcessingQueue = false;
    if (syncQueue.length > 0) {
      setTimeout(() => processSyncQueue(customUrl), 300);
    }
  }
}
