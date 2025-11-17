import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Save, X, Trash2, CheckCircle } from "lucide-react-native";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";

type Props = RootStackScreenProps<"EquipmentDetail">;

interface Equipment {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  supplierPrice: number | null;
  margin: number | null;
  brand: string | null;
  model: string | null;
  specifications: string | null;
  governmentApproved: boolean;
  approvalReference: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const EquipmentDetailScreen = ({ navigation, route }: Props) => {
  const { equipmentId } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "mobility" as "mobility" | "bathroom" | "bedroom" | "assistive_tech" | "iot",
    price: "",
    supplierPrice: "",
    margin: "",
    brand: "",
    model: "",
    specifications: "",
    governmentApproved: false,
    approvalReference: "",
    imageUrl: "",
  });

  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery<Equipment>({
    queryKey: ["equipment", equipmentId],
    queryFn: async () => {
      const response = await api.get<{ equipment: Equipment[] }>("/api/equipment");
      const item = response.equipment.find((e) => e.id === equipmentId);
      if (!item) throw new Error("Equipment not found");

      // Initialize form data
      setFormData({
        name: item.name,
        description: item.description || "",
        category: item.category as any,
        price: item.price.toString(),
        supplierPrice: item.supplierPrice?.toString() || "",
        margin: item.margin?.toString() || "",
        brand: item.brand || "",
        model: item.model || "",
        specifications: item.specifications || "",
        governmentApproved: item.governmentApproved,
        approvalReference: item.approvalReference || "",
        imageUrl: item.imageUrl || "",
      });

      return item;
    },
  });

  const { mutate: updateEquipment, isPending: isUpdating } = useMutation({
    mutationFn: async (data: any) => {
      return api.put(`/api/equipment/${equipmentId}`, {
        ...data,
        price: parseFloat(data.price),
        supplierPrice: data.supplierPrice ? parseFloat(data.supplierPrice) : undefined,
        margin: data.margin ? parseFloat(data.margin) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment", equipmentId] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      setIsEditing(false);
      Alert.alert("Success", "Equipment updated successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to update equipment");
    },
  });

  const { mutate: deleteEquipment, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      return api.delete(`/api/equipment/${equipmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      navigation.goBack();
      Alert.alert("Success", "Equipment deleted successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete equipment");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Equipment",
      "Are you sure you want to delete this equipment item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEquipment(),
        },
      ]
    );
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Equipment name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert("Validation Error", "Valid price is required");
      return;
    }
    updateEquipment(formData);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!equipment) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Equipment not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-orange-600 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1 mx-4">
            <Text className="text-2xl font-bold text-white">{equipment.name}</Text>
            <Text className="text-orange-100 capitalize">{equipment.category.replace("_", " ")}</Text>
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
                // Reset form
                if (equipment) {
                  setFormData({
                    name: equipment.name,
                    description: equipment.description || "",
                    category: equipment.category as any,
                    price: equipment.price.toString(),
                    supplierPrice: equipment.supplierPrice?.toString() || "",
                    margin: equipment.margin?.toString() || "",
                    brand: equipment.brand || "",
                    model: equipment.model || "",
                    specifications: equipment.specifications || "",
                    governmentApproved: equipment.governmentApproved,
                    approvalReference: equipment.approvalReference || "",
                    imageUrl: equipment.imageUrl || "",
                  });
                }
              }}
              className="w-10 h-10 items-center justify-center"
            >
              <X size={20} color="white" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Basic Information */}
        <View className="bg-white rounded-2xl p-5 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-4">Basic Information</Text>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Name *</Text>
            {isEditing ? (
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Equipment name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{equipment.name}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Description</Text>
            {isEditing ? (
              <TextInput
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Equipment description"
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{equipment.description || "No description"}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Brand</Text>
            {isEditing ? (
              <TextInput
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="Brand name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{equipment.brand || "Not specified"}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Model</Text>
            {isEditing ? (
              <TextInput
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                placeholder="Model number"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{equipment.model || "Not specified"}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-600 mb-1">Specifications</Text>
            {isEditing ? (
              <TextInput
                value={formData.specifications}
                onChangeText={(text) => setFormData({ ...formData, specifications: text })}
                placeholder="Technical specifications"
                multiline
                numberOfLines={4}
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{equipment.specifications || "No specifications"}</Text>
            )}
          </View>
        </View>

        {/* Pricing */}
        <View className="bg-white rounded-2xl p-5 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-4">Pricing</Text>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Retail Price *</Text>
            {isEditing ? (
              <TextInput
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900 font-semibold">${equipment.price.toFixed(2)}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Supplier Price</Text>
            {isEditing ? (
              <TextInput
                value={formData.supplierPrice}
                onChangeText={(text) => setFormData({ ...formData, supplierPrice: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">
                {equipment.supplierPrice ? `$${equipment.supplierPrice.toFixed(2)}` : "Not set"}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-600 mb-1">Margin (%)</Text>
            {isEditing ? (
              <TextInput
                value={formData.margin}
                onChangeText={(text) => setFormData({ ...formData, margin: text })}
                placeholder="0.0"
                keyboardType="decimal-pad"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">
                {equipment.margin ? `${equipment.margin.toFixed(1)}%` : "Not calculated"}
              </Text>
            )}
          </View>
        </View>

        {/* Government Approval */}
        <View className="bg-white rounded-2xl p-5 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-4">Government Approval</Text>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-semibold text-gray-600">Approved for Government Funding</Text>
            {isEditing ? (
              <Switch
                value={formData.governmentApproved}
                onValueChange={(value) => setFormData({ ...formData, governmentApproved: value })}
              />
            ) : (
              <View className="flex-row items-center">
                {equipment.governmentApproved ? (
                  <>
                    <CheckCircle size={16} color="#10B981" />
                    <Text className="text-green-600 font-semibold ml-1">Approved</Text>
                  </>
                ) : (
                  <Text className="text-gray-500">Not approved</Text>
                )}
              </View>
            )}
          </View>

          {(isEditing || equipment.approvalReference) && (
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1">Approval Reference</Text>
              {isEditing ? (
                <TextInput
                  value={formData.approvalReference}
                  onChangeText={(text) => setFormData({ ...formData, approvalReference: text })}
                  placeholder="Reference number"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                />
              ) : (
                <Text className="text-base text-gray-900">{equipment.approvalReference || "Not provided"}</Text>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {isEditing ? (
          <Pressable
            onPress={handleSave}
            disabled={isUpdating}
            className="bg-orange-600 rounded-xl py-4 items-center flex-row justify-center mb-4"
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
              <Text className="text-white font-bold ml-2">Delete Equipment</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default EquipmentDetailScreen;
