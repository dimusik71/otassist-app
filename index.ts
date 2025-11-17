//DO NOT REMOVE THIS CODE
import "./global.css";
import "react-native-get-random-values";
import { LogBox } from "react-native";
import { registerRootComponent } from "expo";
import App from "./App";

// Suppress NativeWind CSS interop navigation context warnings in console
if (__DEV__) {
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    if (args.length > 0 && args[0] && typeof args[0].toString === 'function') {
      const message = args[0].toString();
      if (message.includes("Couldn't find a navigation context")) {
        return; // Suppress this specific warning
      }
    }
    originalLog(...args);
  };
}

console.log("[index] Project ID is: ", process.env.EXPO_PUBLIC_VIBECODE_PROJECT_ID);
LogBox.ignoreLogs([
  "Expo AV has been deprecated",
  "Disconnected from Metro",
  "Couldn't find a navigation context", // Suppress NativeWind CSS interop warning
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
