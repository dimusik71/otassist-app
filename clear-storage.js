// Script to clear AsyncStorage
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearAll() {
  try {
    await AsyncStorage.clear();
    console.log('Successfully cleared AsyncStorage');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear AsyncStorage:', error);
    process.exit(1);
  }
}

clearAll();
