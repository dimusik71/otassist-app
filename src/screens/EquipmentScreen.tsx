import React from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Plus, DollarSign, CheckCircle, XCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import type { BottomTabScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type { GetEquipmentResponse } from "@/shared/contracts";
import { useSession } from "@/lib/useSession";

type Props = BottomTabScreenProps<"EquipmentTab">;

function EquipmentScreen({ navigation }: Props) {
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => api.get<GetEquipmentResponse>("/api/equipment"),
    enabled: !!session,
  });

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }} edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center bg-gray-50 px-6">
          <Text className="text-xl font-semibold text-gray-900 mb-2">Equipment Catalog</Text>
          <Text className="text-gray-600 text-center mb-6">
            Please log in to view equipment
          </Text>
          <Pressable
            onPress={() => navigation.navigate("LoginModalScreen")}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={["#EA580C", "#DB2777"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 py-8"
        >
          <Text className="text-3xl font-bold text-white mb-2">Equipment</Text>
          <Text style={{ color: "#FFEDD5" }}>Browse available equipment and pricing</Text>
        </LinearGradient>
      </SafeAreaView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center">Failed to load equipment</Text>
        </View>
      ) : (
        <FlatList
          data={data?.equipment || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center mb-4">No equipment in catalog</Text>
              <Text className="text-gray-400 text-sm text-center">
                Add equipment items to build your catalog
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("EquipmentDetail", { equipmentId: item.id })}
              className="bg-white rounded-2xl p-5 mb-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">{item.name}</Text>
                  <Text className="text-sm text-gray-500 capitalize mb-2">
                    {item.category.replace("_", " ")}
                  </Text>
                  {item.description && (
                    <Text className="text-sm text-gray-600" numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
                {item.governmentApproved ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : (
                  <XCircle size={20} color="#EF4444" />
                )}
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <View className="flex-row items-center gap-1">
                  <DollarSign size={18} color="#1E40AF" />
                  <Text className="text-lg font-bold text-blue-700">${item.price.toFixed(2)}</Text>
                </View>
                {item.brand && (
                  <Text className="text-xs text-gray-500">{item.brand}</Text>
                )}
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        onPress={() => navigation.navigate("AddEquipment")}
        className="absolute bottom-24 right-6 bg-orange-600 w-16 h-16 rounded-full items-center justify-center"
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
    </View>
  );
}

export default EquipmentScreen;
