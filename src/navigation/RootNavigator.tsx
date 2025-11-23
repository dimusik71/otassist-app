import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { ClipboardList, Users, Wrench } from "lucide-react-native";

import type { BottomTabParamList, RootStackParamList } from "@/navigation/types";
import AssessmentsScreen from "@/screens/AssessmentsScreen";
import ClientsScreen from "@/screens/ClientsScreen";
import EquipmentScreen from "@/screens/EquipmentScreen";
import LoginModalScreen from "@/screens/LoginModalScreen";
import CreateClientScreen from "@/screens/CreateClientScreen";
import CreateAssessmentScreen from "@/screens/CreateAssessmentScreen";
import ConductAssessmentScreen from "@/screens/ConductAssessmentScreen";
import AssessmentDetailScreen from "@/screens/AssessmentDetailScreen";
import GenerateQuoteScreen from "@/screens/GenerateQuoteScreen";
import GenerateInvoiceScreen from "@/screens/GenerateInvoiceScreen";
import EquipmentRecommendationsScreen from "@/screens/EquipmentRecommendationsScreen";
import ClientDetailScreen from "@/screens/ClientDetailScreen";
import EquipmentDetailScreen from "@/screens/EquipmentDetailScreen";
import AddEquipmentScreen from "@/screens/AddEquipmentScreen";
import HouseMappingScreen from "@/screens/HouseMappingScreen";
import VideoWalkthroughScreen from "@/screens/VideoWalkthroughScreen";
import IoTDeviceLibraryScreen from "@/screens/IoTDeviceLibraryScreen";
import DevicePlacementScreen from "@/screens/DevicePlacementScreen";
import UserGuideScreen from "@/screens/UserGuideScreen";
import SettingsScreen from "@/screens/SettingsScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const RootNavigator = () => {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="LoginModalScreen"
        component={LoginModalScreen}
        options={{ presentation: "modal", title: "Login" }}
      />
      <RootStack.Screen
        name="CreateAssessment"
        component={CreateAssessmentScreen}
        options={{ title: "New Assessment", headerShown: false }}
      />
      <RootStack.Screen
        name="ConductAssessment"
        component={ConductAssessmentScreen}
        options={{ title: "Conduct Assessment", headerShown: false }}
      />
      <RootStack.Screen
        name="AssessmentDetail"
        component={AssessmentDetailScreen}
        options={{ title: "Assessment Details", headerShown: false }}
      />
      <RootStack.Screen
        name="CreateClient"
        component={CreateClientScreen}
        options={{ title: "New Client", headerShown: false }}
      />
      <RootStack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{ title: "Client Details", headerShown: false }}
      />
      <RootStack.Screen
        name="EquipmentDetail"
        component={EquipmentDetailScreen}
        options={{ title: "Equipment Details", headerShown: false }}
      />
      <RootStack.Screen
        name="AddEquipment"
        component={AddEquipmentScreen}
        options={{ title: "Add Equipment", headerShown: false }}
      />
      <RootStack.Screen
        name="GenerateQuote"
        component={GenerateQuoteScreen}
        options={{ title: "Generate Quote", headerShown: false }}
      />
      <RootStack.Screen
        name="GenerateInvoice"
        component={GenerateInvoiceScreen}
        options={{ title: "Generate Invoice", headerShown: false }}
      />
      <RootStack.Screen
        name="EquipmentRecommendations"
        component={EquipmentRecommendationsScreen}
        options={{ title: "Equipment Recommendations", headerShown: false }}
      />
      <RootStack.Screen
        name="HouseMapping"
        component={HouseMappingScreen}
        options={{ title: "House Mapping", headerShown: false }}
      />
      <RootStack.Screen
        name="VideoWalkthrough"
        component={VideoWalkthroughScreen}
        options={{ title: "Video Walkthrough", headerShown: false }}
      />
      <RootStack.Screen
        name="IoTDeviceLibrary"
        component={IoTDeviceLibraryScreen}
        options={{ title: "IoT Device Library", headerShown: false }}
      />
      <RootStack.Screen
        name="DevicePlacement"
        component={DevicePlacementScreen}
        options={{ title: "Device Placement", headerShown: false }}
      />
      <RootStack.Screen
        name="UserGuide"
        component={UserGuideScreen}
        options={{ title: "User Guide", headerShown: false }}
      />
      <RootStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings", headerShown: false }}
      />
    </RootStack.Navigator>
  );
};

// Placeholder screen for routes not yet implemented
const PlaceholderScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-gray-500">Coming soon...</Text>
    </View>
  );
};

const BottomTab = createBottomTabNavigator<BottomTabParamList>();
const BottomTabNavigator = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="AssessmentsTab"
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
        },
        tabBarBackground: () => (
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
        ),
        headerShown: false,
      }}
      screenListeners={() => ({
        transitionStart: () => {
          Haptics.selectionAsync();
        },
      })}
    >
      <BottomTab.Screen
        name="AssessmentsTab"
        component={AssessmentsScreen}
        options={{
          title: "Assessments",
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="ClientsTab"
        component={ClientsScreen}
        options={{
          title: "Clients",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="EquipmentTab"
        component={EquipmentScreen}
        options={{
          title: "Equipment",
          tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
};

export default RootNavigator;
