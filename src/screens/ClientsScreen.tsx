import React from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mail, Phone, MapPin } from "lucide-react-native";

import type { BottomTabScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type { GetClientsResponse } from "@/shared/contracts";
import { useSession } from "@/lib/useSession";

type Props = BottomTabScreenProps<"ClientsTab">;

const ClientsScreen: React.FC<Props> = ({ navigation }) => {
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: () => api.get<GetClientsResponse>("/api/clients"),
    enabled: !!session,
  });

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-xl font-semibold text-gray-900 mb-2">Client Management</Text>
        <Text className="text-gray-600 text-center mb-6">
          Please log in to manage your clients
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
      <View className="bg-gradient-to-br from-teal-600 to-blue-700 px-6 py-8">
        <Text className="text-3xl font-bold text-white mb-2">Clients</Text>
        <Text className="text-teal-100">Manage your client information</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center">Failed to load clients</Text>
        </View>
      ) : (
        <FlatList
          data={data?.clients || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center mb-4">No clients yet</Text>
              <Text className="text-gray-400 text-sm text-center">
                Add your first client to get started
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("ClientDetail", { clientId: item.id })}
              className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
            >
              <Text className="text-xl font-bold text-gray-900 mb-3">{item.name}</Text>

              {item.email && (
                <View className="flex-row items-center gap-2 mb-2">
                  <Mail size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-600">{item.email}</Text>
                </View>
              )}

              {item.phone && (
                <View className="flex-row items-center gap-2 mb-2">
                  <Phone size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-600">{item.phone}</Text>
                </View>
              )}

              {item.address && (
                <View className="flex-row items-center gap-2">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        onPress={() => navigation.navigate("CreateClient")}
        className="absolute bottom-6 right-6 bg-teal-600 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 8 }}
      >
        <Plus size={28} color="white" />
      </Pressable>
    </View>
  );
};

export default ClientsScreen;
