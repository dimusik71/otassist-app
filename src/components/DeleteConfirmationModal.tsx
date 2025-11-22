import React, { useState } from "react";
import { Modal, View, Text, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, AlertTriangle, Clock, Baby } from "lucide-react-native";

interface DeleteConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  itemType: "client" | "assessment";
  itemName?: string;
  isChild?: boolean;
  isIncomplete?: boolean;
  associatedItemsCount?: number;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  visible,
  title,
  message,
  itemType,
  itemName,
  isChild,
  isIncomplete,
  associatedItemsCount,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim().length < 5) {
      Alert.alert("Invalid Reason", "Please provide a reason with at least 5 characters.");
      return;
    }
    onConfirm(reason.trim());
    setReason(""); // Reset for next time
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  const getRetentionMessage = () => {
    if (itemType === "client") {
      if (isChild) {
        return "This client is a child. Records will be retained for 7 years after they turn 18.";
      }
      return "Adult client records will be retained for 7 years from the archival date.";
    } else {
      // Assessment
      if (isIncomplete) {
        return "This is an incomplete assessment. It can be permanently deleted after 30 days.";
      }
      return "Completed assessments must be retained for 7 years due to healthcare record retention requirements.";
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <LinearGradient
            colors={["#DC2626", "#991B1B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 20, paddingHorizontal: 24 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-3">
                <AlertTriangle size={28} color="white" />
                <Text className="text-white font-bold text-xl">{title}</Text>
              </View>
              <Pressable onPress={handleCancel} className="bg-white/20 w-8 h-8 rounded-full items-center justify-center">
                <X size={20} color="white" />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView style={{ maxHeight: 500 }} contentContainerStyle={{ padding: 24 }}>
            {/* Warning Message */}
            <View className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-900 font-semibold mb-2">{message}</Text>
              {itemName && <Text className="text-red-700">Item: {itemName}</Text>}
              {associatedItemsCount !== undefined && associatedItemsCount > 0 && (
                <Text className="text-red-700 mt-1">
                  This will also archive {associatedItemsCount} associated {associatedItemsCount === 1 ? "assessment" : "assessments"}.
                </Text>
              )}
            </View>

            {/* Retention Info */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                {isChild ? <Baby size={20} color="#1D4ED8" /> : <Clock size={20} color="#1D4ED8" />}
                <Text className="text-blue-900 font-semibold">Record Retention Policy</Text>
              </View>
              <Text className="text-blue-800 text-sm">{getRetentionMessage()}</Text>
            </View>

            {/* Important Notice */}
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <Text className="text-amber-900 font-semibold mb-2">⚠️ Important</Text>
              <Text className="text-amber-800 text-sm">
                Records will be archived, not permanently deleted. You can restore them from the Archived Records screen, or
                permanently delete them after the retention period expires.
              </Text>
            </View>

            {/* Reason Input */}
            <Text className="text-gray-900 font-semibold mb-2">
              Reason for Deletion <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., Client requested, duplicate record, data error..."
              placeholderTextColor="#9CA3AF"
              className="bg-white border-2 border-gray-300 rounded-xl p-4 mb-4 text-gray-900"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />
            <Text className="text-gray-500 text-xs mb-6">Minimum 5 characters required. This will be stored in the audit log.</Text>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-gray-200 py-4 rounded-xl"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text className="text-gray-700 font-bold text-center text-base">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                disabled={isLoading || reason.trim().length < 5}
                className="flex-1 py-4 rounded-xl"
                style={{
                  backgroundColor: isLoading || reason.trim().length < 5 ? "#9CA3AF" : "#DC2626",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white font-bold text-center text-base">
                  {isLoading ? "Archiving..." : "Archive"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
