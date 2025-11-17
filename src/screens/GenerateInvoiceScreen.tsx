import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, DollarSign, Plus, X } from "lucide-react-native";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type { CreateInvoiceRequest } from "@/shared/contracts";

type Props = RootStackScreenProps<"GenerateInvoice">;

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

const GenerateInvoiceScreen = ({ navigation, route }: Props) => {
  const { assessmentId } = route.params;
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "Assessment Services", quantity: 1, rate: 250 },
  ]);
  const [hourlyRate, setHourlyRate] = useState("150");
  const [hoursWorked, setHoursWorked] = useState("2");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const { mutate: createInvoice, isPending } = useMutation({
    mutationFn: (data: CreateInvoiceRequest) => api.post("/api/invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      Alert.alert("Success", "Invoice generated successfully!");
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to generate invoice");
    },
  });

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const timeTotal = parseFloat(hourlyRate || "0") * parseFloat(hoursWorked || "0");
    const subtotal = itemsTotal + timeTotal;
    const tax = subtotal * 0.1;
    return {
      itemsTotal,
      timeTotal,
      subtotal,
      tax,
      total: subtotal + tax,
    };
  };

  const handleSubmit = () => {
    const totals = calculateTotal();

    if (totals.subtotal === 0) {
      Alert.alert("Error", "Invoice must have at least one item or time entry");
      return;
    }

    createInvoice({
      assessmentId,
      items: items.filter((item) => item.description.trim()),
      hourlyRate: parseFloat(hourlyRate || "0") || undefined,
      hoursWorked: parseFloat(hoursWorked || "0") || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const totals = calculateTotal();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <LinearGradient
          colors={["#2563EB", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 py-8"
        >
          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <ArrowLeft size={24} color="white" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Generate Invoice</Text>
              <Text style={{ color: "#DBEAFE" }}>Itemized invoice with hourly rates</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Hourly Rate Section */}
          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Professional Time</Text>
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Hourly Rate ($)</Text>
                <TextInput
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  placeholder="150"
                  keyboardType="decimal-pad"
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Hours Worked</Text>
                <TextInput
                  value={hoursWorked}
                  onChangeText={setHoursWorked}
                  placeholder="2"
                  keyboardType="decimal-pad"
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </View>
            </View>
            {totals.timeTotal > 0 && (
              <View className="bg-blue-50 rounded-xl p-3">
                <Text className="text-blue-900 font-semibold">
                  Time Total: ${totals.timeTotal.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Line Items */}
          <View className="bg-white rounded-2xl p-5 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Line Items</Text>
              <Pressable onPress={addItem} className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center">
                <Plus size={16} color="white" />
                <Text className="text-white font-semibold ml-1">Add Item</Text>
              </Pressable>
            </View>

            {items.map((item, index) => (
              <View key={index} className="mb-4 pb-4 border-b border-gray-100">
                <TextInput
                  value={item.description}
                  onChangeText={(value) => updateItem(index, "description", value)}
                  placeholder="Item description"
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base mb-3"
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-600 mb-1">Qty</Text>
                    <TextInput
                      value={String(item.quantity)}
                      onChangeText={(value) =>
                        updateItem(index, "quantity", parseInt(value) || 0)
                      }
                      placeholder="1"
                      keyboardType="numeric"
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-base"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-600 mb-1">Rate ($)</Text>
                    <TextInput
                      value={String(item.rate)}
                      onChangeText={(value) =>
                        updateItem(index, "rate", parseFloat(value) || 0)
                      }
                      placeholder="0"
                      keyboardType="decimal-pad"
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-base"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-600 mb-1">Total</Text>
                    <View className="bg-gray-100 rounded-xl px-4 py-2 justify-center">
                      <Text className="text-base font-semibold text-gray-900">
                        ${(item.quantity * item.rate).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  {items.length > 1 && (
                    <Pressable
                      onPress={() => removeItem(index)}
                      className="bg-red-100 w-10 h-10 rounded-xl items-center justify-center mt-4"
                    >
                      <X size={20} color="#DC2626" />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Notes */}
          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Payment terms, special instructions..."
              multiline
              numberOfLines={3}
              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* Total Summary */}
          <View className="bg-blue-600 rounded-2xl p-6 mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-white">Items Subtotal</Text>
              <Text className="text-white font-semibold">${totals.itemsTotal.toFixed(2)}</Text>
            </View>
            {totals.timeTotal > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-white">Time Total</Text>
                <Text className="text-white font-semibold">${totals.timeTotal.toFixed(2)}</Text>
              </View>
            )}
            <View className="flex-row justify-between mb-2">
              <Text className="text-white">Subtotal</Text>
              <Text className="text-white font-semibold">${totals.subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-3 pb-3 border-b border-blue-400">
              <Text className="text-white">Tax (10%)</Text>
              <Text className="text-white font-semibold">${totals.tax.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-white font-bold text-xl">Total</Text>
              <Text className="text-white font-bold text-xl">${totals.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isPending || totals.subtotal === 0}
            className={`rounded-xl py-4 items-center mb-8 flex-row justify-center ${
              isPending || totals.subtotal === 0 ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <DollarSign size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              {isPending ? "Generating..." : "Generate Invoice"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default GenerateInvoiceScreen;
