import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CancellationRequest, EmailDispatchPayload } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

const COLLECTION_NAME = 'cancellation_requests';

// Create a new cancellation request in Firestore and sync with server
export async function createCancellationRequest(request: CancellationRequest): Promise<CancellationRequest> {
  // 1. Save to Firebase Firestore (strip undefined values to avoid Firestore Unsupported field error)
  try {
    const cleanDocData: Record<string, any> = {};
    for (const [key, value] of Object.entries(request)) {
      if (value !== undefined) {
        cleanDocData[key] = value;
      }
    }
    const docRef = doc(db, COLLECTION_NAME, request.id);
    await setDoc(docRef, cleanDocData);
    console.log('Saved to Firestore document:', request.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${request.id}`);
  }

  // 2. Also sync to Express backend
  try {
    await fetch('/api/cancellations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  } catch (err) {
    console.warn('Server sync notice:', err);
  }

  return request;
}

// Fetch all cancellations from Firestore (with server fallback)
export async function fetchCancellationRequests(): Promise<CancellationRequest[]> {
  const itemsMap = new Map<string, CancellationRequest>();

  // Attempt Firestore
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => {
      itemsMap.set(docSnap.id, docSnap.data() as CancellationRequest);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }

  // Also query server store to merge records
  try {
    const res = await fetch('/api/cancellations');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        data.data.forEach((item: CancellationRequest) => {
          if (!itemsMap.has(item.id)) {
            itemsMap.set(item.id, item);
          } else {
            // Prefer server state if it has newer emailStatus
            const existing = itemsMap.get(item.id)!;
            if (item.emailStatus === 'Sent' && existing.emailStatus !== 'Sent') {
              itemsMap.set(item.id, { ...existing, ...item });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Backend fetch notice:', err);
  }

  const result = Array.from(itemsMap.values());
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}

// Update cancellation status
export async function updateCancellationStatus(
  id: string,
  updates: Partial<CancellationRequest>
): Promise<void> {
  try {
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }

  try {
    await fetch(`/api/cancellations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn('Server update notice:', err);
  }
}

// Delete request
export async function deleteCancellationRequest(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }

  try {
    await fetch(`/api/cancellations/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Server delete notice:', err);
  }
}

// Dispatch Email via backend NodeMailer
export async function sendCancellationEmail(
  payload: EmailDispatchPayload & { forceSimulated?: boolean }
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
  isBadCredentials?: boolean;
  recipients?: string[];
  cc?: string[];
  fallbackNotice?: string;
}> {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok && !data.success) {
    return {
      success: false,
      error: data.error || data.message || 'Failed to dispatch email',
      isBadCredentials: data.isBadCredentials
    };
  }
  return data;
}

// Verify SMTP connection
export async function verifySmtpConnection(): Promise<{
  success: boolean;
  message?: string;
  isBadCredentials?: boolean;
  tip?: string;
  simulated?: boolean;
}> {
  const res = await fetch('/api/verify-smtp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return await res.json();
}

// Fetch SMTP Configuration
export async function getSmtpConfig(): Promise<{
  success: boolean;
  user: string;
  hasPass: boolean;
  maskedPass: string;
  mode: 'live' | 'simulated';
  autoFallback: boolean;
  ccRecipients: string[];
}> {
  const res = await fetch('/api/smtp-config');
  return await res.json();
}

// Update SMTP Configuration (e.g. user provides a 16-character Google App Password)
export async function updateSmtpConfig(config: {
  user?: string;
  pass?: string;
  mode?: 'live' | 'simulated';
  autoFallback?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  config: any;
}> {
  const res = await fetch('/api/smtp-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return await res.json();
}
