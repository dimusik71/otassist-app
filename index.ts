//DO NOT REMOVE THIS CODE
// App version: v1.0.4 - Targeted navigation error suppression
import "./global.css";
import "react-native-get-random-values";
import { LogBox } from "react-native";
import { registerRootComponent } from "expo";
import App from "./App";

// Comprehensive suppression of NativeWind CSS interop navigation context warnings
if (__DEV__) {
  // Suppress in console.log, console.warn, and console.error
  const suppressMessage = (args: any[]) => {
    if (args.length > 0 && args[0]) {
      const firstArg = args[0];

      // Check for string messages
      if (typeof firstArg === 'string' && firstArg.includes("Couldn't find a navigation context")) {
        return true;
      }

      // Check for Error objects
      if (firstArg instanceof Error && firstArg.message && firstArg.message.includes("Couldn't find a navigation context")) {
        return true;
      }

      // Check for Error-like objects with toString
      if (firstArg && typeof firstArg === 'object' && typeof firstArg.toString === 'function') {
        try {
          const str = String(firstArg);
          if (str.includes("Couldn't find a navigation context") || str.includes("MISSING_CONTEXT_ERROR")) {
            return true;
          }
        } catch (e) {
          // Ignore errors during toString
        }
      }

      // Check if it's an array with Error objects (LogBox format)
      if (Array.isArray(firstArg)) {
        try {
          const str = JSON.stringify(firstArg);
          if (str.includes("Couldn't find a navigation context") || str.includes("MISSING_CONTEXT_ERROR")) {
            return true;
          }
        } catch (e) {
          // Ignore stringify errors
        }
      }
    }
    return false;
  };

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args: any[]) => {
    if (suppressMessage(args)) return;
    originalLog.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    if (suppressMessage(args)) return;
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    if (suppressMessage(args)) return;
    originalError.apply(console, args);
  };
}

console.log("[index] Project ID is: ", process.env.EXPO_PUBLIC_VIBECODE_PROJECT_ID);
LogBox.ignoreLogs([
  "Expo AV has been deprecated",
  "Disconnected from Metro",
  "Couldn't find a navigation context",
  "MISSING_CONTEXT_ERROR",
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
