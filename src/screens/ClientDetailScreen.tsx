import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  SafeAreaView,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Save, X, Trash2, MapPin, Navigation } from "lucide-react-native";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import { geocodeAddress, getCurrentLocation } from "@/lib/geocoding";

type Props = RootStackScreenProps<"ClientDetail">;

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  dateOfBirth: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Assessment {
  id: string;
  assessmentType: string;
  status: string;
  assessmentDate: string;
  mediaCount: number;
}

const ClientDetailScreen = ({ navigation, route }: Props) => {
  const { clientId } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
    dateOfBirth: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const clients = await api.get<{ clients: Client[] }>("/api/clients");
      const client = clients.clients.find((c) => c.id === clientId);
      if (!client) throw new Error("Client not found");

      // Initialize form data
      setFormData({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        latitude: client.latitude,
        longitude: client.longitude,
        dateOfBirth: client.dateOfBirth || "",
        notes: client.notes || "",
      });

      return client;
    },
  });

  const { data: assessments } = useQuery<Assessment[]>({
    queryKey: ["clientAssessments", clientId],
    queryFn: async () => {
      const response = await api.get<{ assessments: Assessment[] }>("/api/assessments");
      return response.assessments.filter((a: any) => a.clientId === clientId);
    },
  });

  const { mutate: updateClient, isPending: isUpdating } = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.put(`/api/clients/${clientId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsEditing(false);
      Alert.alert("Success", "Client updated successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to update client");
    },
  });

  const { mutate: deleteClient, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      return api.delete(`/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      navigation.goBack();
      Alert.alert("Success", "Client deleted successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete client");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Client",
      "Are you sure you want to delete this client? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteClient(),
        },
      ]
    );
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Client name is required");
      return;
    }
    updateClient(formData);
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) {
      Alert.alert("No Address", "Please enter an address first");
      return;
    }

    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(formData.address);
      if (coords) {
        setFormData({
          ...formData,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        Alert.alert("Success", "Location coordinates updated");
      } else {
        Alert.alert("Geocoding Failed", "Could not find coordinates for this address");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert("Error", "Failed to geocode address");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleOpenMaps = () => {
    if (!client?.latitude || !client?.longitude) {
      Alert.alert("No Location", "No coordinates available for this address");
      return;
    }

    const url = Platform.select({
      ios: `maps://app?daddr=${client.latitude},${client.longitude}`,
      android: `geo:${client.latitude},${client.longitude}?q=${client.latitude},${client.longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open maps app");
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!client) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Client not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with SafeAreaView */}
      <View className="bg-blue-700">
        <SafeAreaView>
          <View className="pb-6 px-6">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 items-center justify-center"
              >
                <ArrowLeft size={24} color="white" />
              </Pressable>
              <View className="flex-1 mx-4">
                <Text className="text-2xl font-bold text-white">{client.name}</Text>
                <Text className="text-blue-100">Client Details</Text>
              </View>
              {!isEditing ? (
                <Pressable
                  onPress={() => setIsEditing(true)}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Edit2 size={20} color="white" />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    setIsEditing(false);
                    // Reset form data
                    setFormData({
                      name: client.name,
                      email: client.email || "",
                      phone: client.phone || "",
                      address: client.address || "",
                      latitude: client.latitude,
                      longitude: client.longitude,
                      dateOfBirth: client.dateOfBirth || "",
                      notes: client.notes || "",
                    });
                  }}
                  className="w-10 h-10 items-center justify-center"
                >
                  <X size={20} color="white" />
                </Pressable>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Client Information */}
        <View className="bg-white rounded-2xl p-5 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-4">Contact Information</Text>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Name *</Text>
            {isEditing ? (
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Client name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{client.name}</Text>
            )}
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Email</Text>
            {isEditing ? (
              <TextInput
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{client.email || "Not provided"}</Text>
            )}
          </View>

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Phone</Text>
            {isEditing ? (
              <TextInput
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Phone number"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{client.phone || "Not provided"}</Text>
            )}
          </View>

          {/* Address */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Address</Text>
            {isEditing ? (
              <>
                <TextInput
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Street address"
                  multiline
                  numberOfLines={2}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base mb-2"
                />
                {formData.address.trim() && (
                  <Pressable
                    onPress={handleGeocodeAddress}
                    disabled={isGeocoding}
                    className="flex-row items-center justify-center bg-purple-600 rounded-lg py-2 px-3"
                  >
                    {isGeocoding ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <MapPin size={16} color="white" />
                        <Text className="text-white text-sm font-semibold ml-2">
                          Get Location Coordinates
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
                {formData.latitude && formData.longitude && (
                  <Text className="text-xs text-green-600 mt-1">
                    📍 Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text className="text-base text-gray-900 mb-2">{client.address || "Not provided"}</Text>
                {client.latitude && client.longitude && (
                  <>
                    <Text className="text-xs text-gray-500 mb-2">
                      📍 {client.latitude.toFixed(6)}, {client.longitude.toFixed(6)}
                    </Text>
                    <Pressable
                      onPress={handleOpenMaps}
                      className="flex-row items-center justify-center bg-blue-600 rounded-lg py-2 px-3"
                    >
                      <Navigation size={16} color="white" />
                      <Text className="text-white text-sm font-semibold ml-2">
                        Open in Maps
                      </Text>
                    </Pressable>
                  </>
                )}
              </>
            )}
          </View>

          {/* Date of Birth */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Date of Birth</Text>
            {isEditing ? (
              <TextInput
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                placeholder="YYYY-MM-DD"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">
                {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "Not provided"}
              </Text>
            )}
          </View>

          {/* Notes */}
          <View>
            <Text className="text-sm font-semibold text-gray-600 mb-1">Notes</Text>
            {isEditing ? (
              <TextInput
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Additional notes"
                multiline
                numberOfLines={4}
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{client.notes || "No notes"}</Text>
            )}
          </View>
        </View>

        {/* Assessment History */}
        <View className="bg-white rounded-2xl p-5 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-4">
            Assessment History ({assessments?.length || 0})
          </Text>
          {assessments && assessments.length > 0 ? (
            assessments.map((assessment) => (
              <Pressable
                key={assessment.id}
                onPress={() => navigation.navigate("AssessmentDetail", { assessmentId: assessment.id })}
                className="border-b border-gray-200 py-3 last:border-b-0"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 capitalize">
                      {assessment.assessmentType.replace("_", " ")}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(assessment.assessmentDate).toLocaleDateString()} • {assessment.mediaCount} media
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      assessment.status === "completed"
                        ? "bg-green-100"
                        : assessment.status === "approved"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        assessment.status === "completed"
                          ? "text-green-700"
                          : assessment.status === "approved"
                            ? "text-blue-700"
                            : "text-gray-700"
                      }`}
                    >
                      {assessment.status}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">No assessments yet</Text>
          )}
        </View>

        {/* Action Buttons */}
        {isEditing ? (
          <Pressable
            onPress={handleSave}
            disabled={isUpdating}
            className="bg-blue-600 rounded-xl py-4 items-center flex-row justify-center mb-4"
          >
            {isUpdating ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={20} color="white" />
                <Text className="text-white font-bold ml-2">Save Changes</Text>
              </>
            )}
          </Pressable>
        ) : null}

        <Pressable
          onPress={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 rounded-xl py-4 items-center flex-row justify-center mb-6"
        >
          {isDeleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Trash2 size={20} color="white" />
              <Text className="text-white font-bold ml-2">Delete Client</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default ClientDetailScreen;
