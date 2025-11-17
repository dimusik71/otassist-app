import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Sparkles, ArrowLeft, Package } from "lucide-react-native";

import type { RootStackScreenProps } from "@/navigation/types";

type Props = RootStackScreenProps<"AssessmentDetail">;

const EquipmentRecommendationsScreen = ({ navigation, route }: Props) => {
  const { assessmentId } = route.params;
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}/api/ai/equipment-recommendations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Recommendation error:", error);
      setRecommendations("Unable to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-br from-purple-600 to-pink-600 px-6 py-8">
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3"
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Equipment Recommendations</Text>
            <Text className="text-purple-100">AI-powered suggestions</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {!recommendations && !loading && (
          <View className="items-center py-12">
            <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Package size={40} color="#9333EA" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
              Get Smart Equipment Recommendations
            </Text>
            <Text className="text-gray-600 text-center mb-6 px-4">
              Our AI will analyze this assessment and suggest the most suitable equipment from your
              catalog
            </Text>
            <Pressable
              onPress={generateRecommendations}
              className="bg-purple-600 px-8 py-4 rounded-xl flex-row items-center"
            >
              <Sparkles size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">Generate Recommendations</Text>
            </Pressable>
          </View>
        )}

        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#9333EA" />
            <Text className="text-gray-600 mt-4">Analyzing assessment...</Text>
            <Text className="text-gray-500 text-sm mt-2">Using Grok 4 Fast AI</Text>
          </View>
        )}

        {recommendations && !loading && (
          <View className="bg-white rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <Sparkles size={24} color="#9333EA" />
              <Text className="text-xl font-bold text-gray-900 ml-2">AI Recommendations</Text>
            </View>
            <Text className="text-gray-800 leading-relaxed">{recommendations}</Text>
            <Pressable
              onPress={generateRecommendations}
              className="bg-purple-100 px-6 py-3 rounded-xl items-center mt-6"
            >
              <Text className="text-purple-700 font-semibold">Regenerate Recommendations</Text>
            </Pressable>
          </View>
        )}

        {recommendations && (
          <View className="bg-blue-50 rounded-2xl p-5 mb-6">
            <Text className="text-sm font-semibold text-blue-900 mb-2">Next Steps</Text>
            <Text className="text-blue-800 text-sm mb-3">
              • Review recommendations with client
            </Text>
            <Text className="text-blue-800 text-sm mb-3">
              • Generate quote with 3 pricing options
            </Text>
            <Text className="text-blue-800 text-sm">• Schedule equipment installation</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default EquipmentRecommendationsScreen;
