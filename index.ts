//DO NOT REMOVE THIS CODE
// App version: v1.0.2 - Navigation error suppression active
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
      if (typeof firstArg === 'string' && firstArg.includes("Couldn't find a navigation context")) {
        return true;
      }
      if (firstArg instanceof Error && firstArg.message.includes("Couldn't find a navigation context")) {
        return true;
      }
      if (typeof firstArg.toString === 'function') {
        const str = firstArg.toString();
        if (str.includes("Couldn't find a navigation context") || str.includes("MISSING_CONTEXT_ERROR")) {
          return true;
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
    originalLog(...args);
  };

  console.warn = (...args: any[]) => {
    if (suppressMessage(args)) return;
    originalWarn(...args);
  };

  console.error = (...args: any[]) => {
    if (suppressMessage(args)) return;
    originalError(...args);
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
