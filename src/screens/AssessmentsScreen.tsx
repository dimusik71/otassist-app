import React from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar } from "lucide-react-native";

import type { BottomTabScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type { GetAssessmentsResponse } from "@/shared/contracts";
import { useSession } from "@/lib/useSession";

type Props = BottomTabScreenProps<"AssessmentsTab">;

const AssessmentsScreen = ({ navigation }: Props) => {
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.get<GetAssessmentsResponse>("/api/assessments"),
    enabled: !!session,
  });

  if (!session) {
    return (
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
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-br from-blue-700 to-teal-600 px-6 py-8">
        <Text className="text-3xl font-bold text-white mb-2">Assessments</Text>
        <Text className="text-blue-100">Manage client assessments and reports</Text>
      </View>

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
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
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
        className="absolute bottom-6 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 8 }}
      >
        <Plus size={28} color="white" />
      </Pressable>
    </View>
  );
};

export default AssessmentsScreen;
