import React, { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, HelpCircle, CheckSquare, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BottomTabScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type { GetAssessmentsResponse } from "@/shared/contracts";
import { useSession } from "@/lib/useSession";
import QuickStartChecklist from "@/components/QuickStartChecklist";

type Props = BottomTabScreenProps<"AssessmentsTab">;

function AssessmentsScreen({ navigation }: Props) {
  const { data: session } = useSession();
  const insets = useSafeAreaInsets();
  const [showChecklist, setShowChecklist] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.get<GetAssessmentsResponse>("/api/assessments"),
    enabled: !!session,
  });

  useEffect(() => {
    if (session) {
      checkFirstTimeUser();
    }
  }, [session]);

  const checkFirstTimeUser = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem("@onboarding_completed");
      const checklistDismissed = await AsyncStorage.getItem("@checklist_dismissed");

      // Show checklist if onboarding was just completed and checklist hasn't been dismissed
      if (onboardingCompleted && !checklistDismissed) {
        setTimeout(() => setShowChecklist(true), 1000);
      }
    } catch (error) {
      console.error("Failed to check first-time user:", error);
    }
  };

  const handleChecklistClose = async () => {
    try {
      await AsyncStorage.setItem("@checklist_dismissed", "true");
      setShowChecklist(false);
    } catch (error) {
      console.error("Failed to save checklist state:", error);
      setShowChecklist(false);
    }
  };

  const handleNavigateFromChecklist = (screen: string) => {
    if (screen === "EquipmentTab") {
      navigation.navigate("EquipmentTab" as any);
    } else {
      navigation.navigate(screen as any);
    }
  };

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="flex-1 items-center justify-center bg-gray-50 px-6">
          <Text className="text-xl font-semibold text-gray-900 mb-2">Welcome to OT/AH Assessment</Text>
          <Text className="text-gray-600 text-center mb-6">
            Please log in to manage your client assessments
          </Text>
          <Pressable
            onPress={() => navigation.navigate("LoginModalScreen")}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={["#1D4ED8", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 32 }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white">Assessments</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setShowChecklist(true)}
              className="bg-white/20 p-2 rounded-xl active:opacity-70"
            >
              <CheckSquare size={24} color="white" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("UserGuide")}
              className="bg-white/20 p-2 rounded-xl active:opacity-70"
            >
              <HelpCircle size={24} color="white" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Settings")}
              className="bg-white/20 p-2 rounded-xl active:opacity-70"
            >
              <Settings size={24} color="white" />
            </Pressable>
          </View>
        </View>
        <Text style={{ color: "#DBEAFE" }}>Manage client assessments and reports</Text>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E40AF" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center">Failed to load assessments</Text>
        </View>
      ) : (
        <FlatList
          data={data?.assessments || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center mb-4">No assessments yet</Text>
              <Text className="text-gray-400 text-sm text-center">
                Create your first assessment to get started
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("AssessmentDetail", { assessmentId: item.id })}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">{item.clientName}</Text>
                  <Text className="text-sm text-gray-500 capitalize">{item.assessmentType.replace("_", " ")}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${
                  item.status === "completed" ? "bg-green-100" :
                  item.status === "approved" ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  <Text className={`text-xs font-semibold ${
                    item.status === "completed" ? "text-green-700" :
                    item.status === "approved" ? "text-blue-700" : "text-gray-700"
                  }`}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <Calendar size={14} color="#6B7280" />
                  <Text className="text-xs text-gray-600">
                    {new Date(item.assessmentDate).toLocaleDateString()}
                  </Text>
                </View>
                {item.location && (
                  <Text className="text-xs text-gray-500">{item.location}</Text>
                )}
                <Text className="text-xs text-gray-500">{item.mediaCount} media</Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        onPress={() => navigation.navigate("CreateAssessment", {})}
        className="absolute bottom-24 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Plus size={28} color="white" />
      </Pressable>

      {/* Quick Start Checklist */}
      <QuickStartChecklist
        visible={showChecklist}
        onClose={handleChecklistClose}
        onNavigate={handleNavigateFromChecklist}
      />
    </View>
  );
}

export default AssessmentsScreen;
