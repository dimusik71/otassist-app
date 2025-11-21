import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, FlatList, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Check, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type {
  CreateAssessmentRequest,
  CreateAssessmentResponse,
  GetClientsResponse,
} from "@/shared/contracts";

type Props = RootStackScreenProps<"CreateAssessment">;

const CreateAssessmentScreen = ({ navigation, route }: Props) => {
  const preselectedClientId = route.params?.clientId;
  const insets = useSafeAreaInsets();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    preselectedClientId || null
  );
  const [assessmentType, setAssessmentType] = useState<"home" | "assistive_tech" | "general" | "mobility_scooter" | "falls_risk" | "movement_mobility">(
    "home"
  );
  const [location, setLocation] = useState("");

  const queryClient = useQueryClient();

  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => api.get<GetClientsResponse>("/api/clients"),
  });

  const { mutate: createAssessment, isPending } = useMutation({
    mutationFn: (data: CreateAssessmentRequest) =>
      api.post<CreateAssessmentResponse>("/api/assessments", data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      navigation.replace("AssessmentDetail", { assessmentId: response.assessment.id });
    },
  });

  const handleSubmit = () => {
    if (!selectedClientId) {
      return;
    }

    createAssessment({
      clientId: selectedClientId,
      assessmentType,
      location: location.trim() || undefined,
    });
  };

  const assessmentTypes = [
    { value: "home" as const, label: "Home Assessment", description: "In-home environmental evaluation", category: "Environmental" },
    {
      value: "assistive_tech" as const,
      label: "Assistive Technology",
      description: "Technology and equipment assessment",
      category: "Environmental"
    },
    { value: "mobility_scooter" as const, label: "Mobility Scooter", description: "NDIS scooter prescription assessment", category: "Equipment" },
    { value: "falls_risk" as const, label: "Falls Risk", description: "Comprehensive falls assessment (FRAT)", category: "Clinical" },
    { value: "movement_mobility" as const, label: "Movement & Mobility", description: "Functional mobility assessment (FIM)", category: "Clinical" },
    { value: "general" as const, label: "General", description: "General evaluation", category: "Other" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={["#1D4ED8", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 32 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-2">New Assessment</Text>
            <Text style={{ color: "#DBEAFE" }}>Select client and assessment type</Text>
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-white/20 w-10 h-10 rounded-full items-center justify-center"
          >
            <X size={24} color="white" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Assessment Type Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            Assessment Type <Text className="text-red-500">*</Text>
          </Text>
          {assessmentTypes.map((type) => (
            <Pressable
              key={type.value}
              onPress={() => setAssessmentType(type.value)}
              className={`mb-3 p-4 rounded-xl border-2 ${
                assessmentType === type.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className={`font-bold text-base mb-1 ${
                      assessmentType === type.value ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {type.label}
                  </Text>
                  <Text className="text-sm text-gray-600">{type.description}</Text>
                </View>
                {assessmentType === type.value && (
                  <View className="bg-blue-600 w-6 h-6 rounded-full items-center justify-center">
                    <Check size={16} color="white" />
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Client Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            Select Client <Text className="text-red-500">*</Text>
          </Text>

          {loadingClients ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#1E40AF" />
            </View>
          ) : clientsData?.clients && clientsData.clients.length > 0 ? (
            clientsData.clients.map((client) => (
              <Pressable
                key={client.id}
                onPress={() => setSelectedClientId(client.id)}
                className={`mb-3 p-4 rounded-xl border-2 ${
                  selectedClientId === client.id
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                        selectedClientId === client.id ? "bg-teal-200" : "bg-gray-200"
                      }`}
                    >
                      <User size={20} color={selectedClientId === client.id ? "#0D9488" : "#6B7280"} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-bold text-base ${
                          selectedClientId === client.id ? "text-teal-900" : "text-gray-900"
                        }`}
                      >
                        {client.name}
                      </Text>
                      {client.email && (
                        <Text className="text-sm text-gray-600">{client.email}</Text>
                      )}
                    </View>
                  </View>
                  {selectedClientId === client.id && (
                    <View className="bg-teal-600 w-6 h-6 rounded-full items-center justify-center">
                      <Check size={16} color="white" />
                    </View>
                  )}
                </View>
              </Pressable>
            ))
          ) : (
            <View className="bg-gray-100 rounded-xl p-6 items-center">
              <Text className="text-gray-600 text-center mb-4">No clients found</Text>
              <Pressable
                onPress={() => navigation.navigate("CreateClient")}
                className="bg-teal-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Add Client First</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isPending || !selectedClientId}
          className={`rounded-xl py-4 items-center mb-8 ${
            isPending || !selectedClientId ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          <Text className="text-white font-bold text-lg">
            {isPending ? "Creating..." : "Create Assessment"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default CreateAssessmentScreen;
