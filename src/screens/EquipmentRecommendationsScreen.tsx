import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, TextInput } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, ArrowLeft, Package, Plus, Trash2, Save } from "lucide-react-native";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";

type Props = RootStackScreenProps<"EquipmentRecommendations">;

interface SavedRecommendation {
  id: string;
  equipmentId: string;
  priority: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
  equipment: {
    id: string;
    name: string;
    category: string;
    price: number;
    brand: string | null;
  };
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  price: number;
  brand: string | null;
}

const EquipmentRecommendationsScreen = ({ navigation, route }: Props) => {
  const { assessmentId } = route.params;
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [priority, setPriority] = useState<"essential" | "recommended" | "optional">("recommended");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  // Fetch saved recommendations
  const { data: savedRecs } = useQuery<{ recommendations: SavedRecommendation[] }>({
    queryKey: ["equipmentRecommendations", assessmentId],
    queryFn: () => api.get(`/api/assessments/${assessmentId}/equipment`),
  });

  // Fetch all equipment for dropdown
  const { data: allEquipment } = useQuery<{ equipment: Equipment[] }>({
    queryKey: ["equipment"],
    queryFn: () => api.get("/api/equipment"),
  });

  const { mutate: addRecommendation, isPending: isAdding } = useMutation({
    mutationFn: async (data: { equipmentId: string; priority: string; quantity: number; notes?: string }) => {
      return api.post(`/api/assessments/${assessmentId}/equipment`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipmentRecommendations", assessmentId] });
      setShowAddForm(false);
      setSelectedEquipment("");
      setQuantity("1");
      setNotes("");
      Alert.alert("Success", "Equipment recommendation saved");
    },
    onError: () => {
      Alert.alert("Error", "Failed to save recommendation");
    },
  });

  const { mutate: deleteRecommendation } = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/assessments/${assessmentId}/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipmentRecommendations", assessmentId] });
      Alert.alert("Success", "Recommendation removed");
    },
  });

  const generateAIRecommendations = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}/api/ai/equipment-recommendations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      setAiRecommendations(data.recommendations);
    } catch (error) {
      Alert.alert("Error", "Failed to generate AI recommendations");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSaveRecommendation = () => {
    if (!selectedEquipment) {
      Alert.alert("Validation", "Please select equipment");
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      Alert.alert("Validation", "Quantity must be at least 1");
      return;
    }
    addRecommendation({
      equipmentId: selectedEquipment,
      priority,
      quantity: qty,
      notes: notes.trim() || undefined,
    });
  };

  const getPriorityColor = (p: string) => {
    if (p === "essential") return "bg-red-100 text-red-700 border-red-300";
    if (p === "recommended") return "bg-blue-100 text-blue-700 border-blue-300";
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-br from-purple-600 to-pink-600 pt-12 pb-6 px-6">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1 mx-4">
            <Text className="text-2xl font-bold text-white">Equipment Recommendations</Text>
            <Text className="text-purple-100">
              {savedRecs?.recommendations.length || 0} saved • AI-powered
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Saved Recommendations */}
        {savedRecs && savedRecs.recommendations.length > 0 && (
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-3">Saved Recommendations</Text>
            {savedRecs.recommendations.map((rec) => (
              <View key={rec.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">{rec.equipment.name}</Text>
                    <Text className="text-sm text-gray-500 capitalize">
                      {rec.equipment.category.replace("_", " ")}
                      {rec.equipment.brand && ` • ${rec.equipment.brand}`}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      Alert.alert("Delete", "Remove this recommendation?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deleteRecommendation(rec.id) },
                      ]);
                    }}
                    className="ml-2"
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </Pressable>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center gap-2">
                    <View className={`px-3 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}>
                      <Text className="text-xs font-semibold capitalize">{rec.priority}</Text>
                    </View>
                    <Text className="text-sm text-gray-600">Qty: {rec.quantity}</Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-900">${rec.equipment.price.toFixed(2)}</Text>
                </View>
                {rec.notes && <Text className="text-sm text-gray-600 mt-2">{rec.notes}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Add Recommendation Form */}
        {showAddForm ? (
          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">Add Equipment Recommendation</Text>

            {/* Equipment Selection */}
            <Text className="text-sm font-semibold text-gray-600 mb-2">Select Equipment</Text>
            <ScrollView horizontal className="mb-4">
              <View className="flex-row gap-2">
                {allEquipment?.equipment.map((eq) => (
                  <Pressable
                    key={eq.id}
                    onPress={() => setSelectedEquipment(eq.id)}
                    className={`px-4 py-3 rounded-xl border ${
                      selectedEquipment === eq.id ? "bg-purple-600 border-purple-600" : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${selectedEquipment === eq.id ? "text-white" : "text-gray-700"}`}
                      numberOfLines={1}
                    >
                      {eq.name}
                    </Text>
                    <Text className={`text-xs ${selectedEquipment === eq.id ? "text-purple-100" : "text-gray-500"}`}>
                      ${eq.price.toFixed(2)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Priority */}
            <Text className="text-sm font-semibold text-gray-600 mb-2">Priority</Text>
            <View className="flex-row gap-2 mb-4">
              {(["essential", "recommended", "optional"] as const).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    priority === p ? getPriorityColor(p) : "bg-white border-gray-300"
                  }`}
                >
                  <Text className={`text-sm font-semibold text-center capitalize`}>{p}</Text>
                </Pressable>
              ))}
            </View>

            {/* Quantity */}
            <Text className="text-sm font-semibold text-gray-600 mb-2">Quantity</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="1"
              className="border border-gray-300 rounded-lg px-3 py-2 text-base mb-4"
            />

            {/* Notes */}
            <Text className="text-sm font-semibold text-gray-600 mb-2">Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes"
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-lg px-3 py-2 text-base mb-4"
            />

            {/* Buttons */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowAddForm(false)}
                className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveRecommendation}
                disabled={isAdding}
                className="flex-1 bg-purple-600 rounded-xl py-3 items-center flex-row justify-center"
              >
                {isAdding ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Save size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">Save</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowAddForm(true)}
            className="bg-purple-600 rounded-xl py-4 items-center flex-row justify-center mb-6"
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-bold ml-2">Add Equipment Recommendation</Text>
          </Pressable>
        )}

        {/* AI Recommendations */}
        {!aiRecommendations && !loadingAI && (
          <View className="bg-purple-50 rounded-2xl p-5 mb-6">
            <View className="items-center">
              <View className="bg-purple-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                <Sparkles size={32} color="#9333EA" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">Get AI Suggestions</Text>
              <Text className="text-gray-600 text-center mb-4">
                Let AI analyze the assessment and suggest equipment
              </Text>
              <Pressable
                onPress={generateAIRecommendations}
                className="bg-purple-600 px-6 py-3 rounded-xl flex-row items-center"
              >
                <Sparkles size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Generate AI Recommendations</Text>
              </Pressable>
            </View>
          </View>
        )}

        {loadingAI && (
          <View className="bg-white rounded-2xl p-6 items-center mb-6">
            <ActivityIndicator size="large" color="#9333EA" />
            <Text className="text-gray-600 mt-4">Analyzing with Grok 4 Fast...</Text>
          </View>
        )}

        {aiRecommendations && !loadingAI && (
          <View className="bg-white rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Sparkles size={20} color="#9333EA" />
              <Text className="text-lg font-bold text-gray-900 ml-2">AI Suggestions</Text>
            </View>
            <Text className="text-gray-800 leading-relaxed mb-4">{aiRecommendations}</Text>
            <Pressable
              onPress={generateAIRecommendations}
              className="bg-purple-100 px-4 py-2 rounded-lg items-center"
            >
              <Text className="text-purple-700 font-semibold">Regenerate</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default EquipmentRecommendationsScreen;
