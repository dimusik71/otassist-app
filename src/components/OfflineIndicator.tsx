/**
 * Offline Indicator Component
 * Shows a banner when the device is offline
 */

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { offlineQueue } from '../lib/offlineQueue';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = offlineQueue.onNetworkChange((online) => {
      setIsOnline(online);
      setQueueSize(offlineQueue.getQueueSize());
    });

    // Check initial status
    offlineQueue.isOnline().then(setIsOnline);
    setQueueSize(offlineQueue.getQueueSize());

    return unsubscribe;
  }, []);

  if (isOnline && queueSize === 0) {
    return null;
  }

  return (
    <View
      className={`px-4 py-2 flex-row items-center justify-center ${
        isOnline ? 'bg-green-600' : 'bg-orange-600'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi color="#fff" size={16} />
          <Text className="text-white text-sm font-semibold ml-2">
            Back online • Syncing {queueSize} changes...
          </Text>
        </>
      ) : (
        <>
          <WifiOff color="#fff" size={16} />
          <Text className="text-white text-sm font-semibold ml-2">
            Offline Mode • Changes will sync when online
          </Text>
        </>
      )}
    </View>
  );
}
