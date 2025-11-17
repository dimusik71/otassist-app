import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react-native";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type { CreateClientRequest, CreateClientResponse } from "@/shared/contracts";

type Props = RootStackScreenProps<"CreateClient">;

const CreateClientScreen = ({ navigation }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const { mutate: createClient, isPending } = useMutation({
    mutationFn: (data: CreateClientRequest) =>
      api.post<CreateClientResponse>("/api/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      navigation.goBack();
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    createClient({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      dateOfBirth: dateOfBirth.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-gradient-to-br from-teal-600 to-blue-700 px-6 py-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-2">New Client</Text>
              <Text className="text-teal-100">Add client information</Text>
            </View>
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-white/20 w-10 h-10 rounded-full items-center justify-center"
            >
              <X size={24} color="white" />
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Name - Required */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Client full name"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Email */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="client@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Phone */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Address */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="123 Main St, City, State 12345"
              multiline
              numberOfLines={2}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Date of Birth */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Date of Birth</Text>
            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes about the client..."
              multiline
              numberOfLines={4}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isPending || !name.trim()}
            className={`rounded-xl py-4 items-center mb-8 ${
              isPending || !name.trim() ? "bg-gray-400" : "bg-teal-600"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isPending ? "Creating..." : "Create Client"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateClientScreen;
