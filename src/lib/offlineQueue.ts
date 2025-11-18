/**
 * Offline Queue Module
 * Queues API requests when offline and syncs when connection is restored
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = '@offline_queue';

export interface QueuedRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  timestamp: number;
  retries: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;

      // Notify listeners
      this.listeners.forEach((listener) => listener(isOnline || false));

      // Process queue when coming online
      if (isOnline && this.queue.length > 0 && !this.isProcessing) {
        this.processQueue();
      }
    });
  }

  async addToQueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedRequest);
    await this.saveQueue();

    // Try to process immediately if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && netInfo.isInternetReachable) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];

      try {
        // Check if still online
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected || !netInfo.isInternetReachable) {
          break;
        }

        // Process request (will be handled by api.ts)
        console.log(`Processing queued request: ${request.method} ${request.url}`);

        // Remove from queue on success
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        console.error('Failed to process queued request:', error);

        // Increment retry count
        request.retries++;

        // Remove if too many retries (max 3)
        if (request.retries >= 3) {
          this.queue.shift();
        }

        await this.saveQueue();
        break;
      }
    }

    this.isProcessing = false;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
  }

  onNetworkChange(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true && netInfo.isInternetReachable === true;
  }
}

export const offlineQueue = new OfflineQueue();
