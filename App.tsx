import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "@/lib/queryClient";
import RootStackNavigator from "@/navigation/RootNavigator";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AppStorage, APP_KEYS } from "@/lib/secureStorage";
import OnboardingScreen from "@/screens/OnboardingScreen";
import ProfessionalProfileSetupScreen from "@/screens/ProfessionalProfileSetupScreen";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AppStorage.get(APP_KEYS.ONBOARDING_COMPLETED);
      const hasCompletedProfile = await AppStorage.get(APP_KEYS.PROFILE_SETUP_COMPLETED);
      const hasSkippedProfile = await AppStorage.get(APP_KEYS.PROFILE_SETUP_SKIPPED);

      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      } else if (!hasCompletedProfile && !hasSkippedProfile) {
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setShowOnboarding(false);
      setShowProfileSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // After onboarding, check if we need to show profile setup
    checkOnboardingStatus();
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
  };

  if (isLoading) {
    return null; // Or a splash screen
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  if (showProfileSetup) {
    return (
      <SafeAreaProvider>
        <ProfessionalProfileSetupScreen
          onComplete={handleProfileSetupComplete}
          onSkip={handleProfileSetupComplete}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <NavigationContainer>
              <RootStackNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
