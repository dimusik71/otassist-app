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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";

type Props = RootStackScreenProps<"AddEquipment">;

const categories = [
  { value: "mobility", label: "Mobility" },
  { value: "bathroom", label: "Bathroom" },
  { value: "bedroom", label: "Bedroom" },
  { value: "assistive_tech", label: "Assistive Tech" },
  { value: "iot", label: "IoT" },
];

const AddEquipmentScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
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

  const { mutate: createEquipment, isPending } = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/api/equipment", {
        ...data,
        price: parseFloat(data.price),
        supplierPrice: data.supplierPrice ? parseFloat(data.supplierPrice) : undefined,
        margin: data.margin ? parseFloat(data.margin) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      navigation.goBack();
      Alert.alert("Success", "Equipment added successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error?.message || "Failed to add equipment");
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Equipment name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert("Validation Error", "Valid price is required");
      return;
    }

    createEquipment(formData);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={["#EA580C", "#F97316"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 32 }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1 mx-4">
            <Text className="text-2xl font-bold text-white">Add Equipment</Text>
            <Text className="text-orange-100">New equipment item</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-6">
          {/* Basic Information */}
          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">Basic Information</Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Equipment name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Category *</Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.value}
                    onPress={() => setFormData({ ...formData, category: cat.value as any })}
                    className={`px-4 py-2 rounded-full border ${
                      formData.category === cat.value
                        ? "bg-orange-600 border-orange-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        formData.category === cat.value ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Description</Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Equipment description"
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Brand</Text>
              <TextInput
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="Brand name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Model</Text>
              <TextInput
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                placeholder="Model number"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1">Specifications</Text>
              <TextInput
                value={formData.specifications}
                onChangeText={(text) => setFormData({ ...formData, specifications: text })}
                placeholder="Technical specifications"
                multiline
                numberOfLines={4}
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            </View>
          </View>

          {/* Pricing */}
          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">Pricing</Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Retail Price *</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                <Text className="text-base text-gray-500 mr-2">$</Text>
                <TextInput
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="flex-1 text-base"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Supplier Price</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                <Text className="text-base text-gray-500 mr-2">$</Text>
                <TextInput
                  value={formData.supplierPrice}
                  onChangeText={(text) => setFormData({ ...formData, supplierPrice: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="flex-1 text-base"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1">Margin (%)</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                <TextInput
                  value={formData.margin}
                  onChangeText={(text) => setFormData({ ...formData, margin: text })}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  className="flex-1 text-base"
                />
                <Text className="text-base text-gray-500 ml-2">%</Text>
              </View>
            </View>
          </View>

          {/* Government Approval */}
          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">Government Approval</Text>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-semibold text-gray-600">Approved for Government Funding</Text>
              <Switch
                value={formData.governmentApproved}
                onValueChange={(value) => setFormData({ ...formData, governmentApproved: value })}
              />
            </View>

            {formData.governmentApproved && (
              <View>
                <Text className="text-sm font-semibold text-gray-600 mb-1">Approval Reference</Text>
                <TextInput
                  value={formData.approvalReference}
                  onChangeText={(text) => setFormData({ ...formData, approvalReference: text })}
                  placeholder="Reference number"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                />
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            className="bg-orange-600 rounded-xl py-4 items-center flex-row justify-center mb-6"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Plus size={20} color="white" />
                <Text className="text-white font-bold ml-2">Add Equipment</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddEquipmentScreen;
