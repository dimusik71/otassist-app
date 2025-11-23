/**
 * Secure Storage Module - Healthcare Compliant
 * Uses expo-secure-store for encrypted storage of sensitive data
 * Compliant with APP 11.1 (security of personal information)
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage for sensitive healthcare data
 * Data is encrypted at rest using device's secure enclave (iOS Keychain, Android Keystore)
 */
export class SecureStorage {
  /**
   * Store sensitive data securely
   * Use for: patient data, AHPRA numbers, banking details, session tokens
   */
  static async setSecure(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`[SecureStorage]: Failed to store secure data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve secure data
   */
  static async getSecure(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`[SecureStorage]: Failed to retrieve secure data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete secure data
   */
  static async deleteSecure(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`[SecureStorage]: Failed to delete secure data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Store object as secure JSON
   */
  static async setSecureJSON<T>(key: string, value: T): Promise<void> {
    await this.setSecure(key, JSON.stringify(value));
  }

  /**
   * Retrieve object from secure JSON
   */
  static async getSecureJSON<T>(key: string): Promise<T | null> {
    const json = await this.getSecure(key);
    if (!json) return null;
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      console.error(`[SecureStorage]: Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear all secure storage (for logout/data wipe)
   * WARNING: This cannot be undone
   */
  static async clearAllSecure(): Promise<void> {
    try {
      // SecureStore doesn't have a clear all method, so we track keys
      const keys = await AsyncStorage.getItem('@secure_storage_keys');
      if (keys) {
        const keyList: string[] = JSON.parse(keys);
        for (const key of keyList) {
          await SecureStore.deleteItemAsync(key);
        }
        await AsyncStorage.removeItem('@secure_storage_keys');
      }
    } catch (error) {
      console.error('[SecureStorage]: Failed to clear all secure data:', error);
    }
  }

  /**
   * Track secure keys for cleanup
   */
  private static async trackKey(key: string): Promise<void> {
    try {
      const keysJson = await AsyncStorage.getItem('@secure_storage_keys');
      const keys: string[] = keysJson ? JSON.parse(keysJson) : [];
      if (!keys.includes(key)) {
        keys.push(key);
        await AsyncStorage.setItem('@secure_storage_keys', JSON.stringify(keys));
      }
    } catch (error) {
      // Non-critical error, just log
      console.error('[SecureStorage]: Failed to track key:', error);
    }
  }
}

/**
 * Regular AsyncStorage wrapper for non-sensitive data
 * Use for: UI preferences, onboarding status, non-identifying data
 */
export class AppStorage {
  static async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  static async get(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  static async setJSON<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  static async getJSON<T>(key: string): Promise<T | null> {
    const json = await AsyncStorage.getItem(key);
    if (!json) return null;
    return JSON.parse(json) as T;
  }

  static async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

// Key constants for secure storage
export const SECURE_KEYS = {
  PROFESSIONAL_PROFILE: '@secure:professional_profile',
  SESSION_TOKEN: '@secure:session_token',
  CACHED_CLIENT_DATA: '@secure:cached_clients',
  CACHED_ASSESSMENT_DATA: '@secure:cached_assessments',
} as const;

// Key constants for regular storage
export const APP_KEYS = {
  ONBOARDING_COMPLETED: '@onboarding_completed',
  PROFILE_SETUP_COMPLETED: '@profile_setup_completed',
  PROFILE_SETUP_SKIPPED: '@profile_setup_skipped',
  CHECKLIST_DISMISSED: '@checklist_dismissed',
} as const;
