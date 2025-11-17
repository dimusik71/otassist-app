import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText, Sparkles } from "lucide-react-native";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";

type Props = RootStackScreenProps<"GenerateQuote">;

interface QuoteOption {
  name: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

const GenerateQuoteScreen = ({ navigation, route }: Props) => {
  const { assessmentId } = route.params;
  const [generating, setGenerating] = useState(false);
  const [quoteOptions, setQuoteOptions] = useState<QuoteOption[]>([]);
  const queryClient = useQueryClient();

  // Fetch equipment catalog
  const { data: equipmentData } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => api.get("/api/equipment"),
  });

  const generateQuotes = async () => {
    setGenerating(true);
    try {
      // Use Grok to generate 3 quote options
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}/api/ai/generate-quotes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate quotes");
      }

      const data = await response.json();
      setQuoteOptions(data.quotes);
    } catch (error) {
      Alert.alert("Error", "Failed to generate quote options");
    } finally {
      setGenerating(false);
    }
  };

  const saveQuote = async (option: QuoteOption) => {
    try {
      await api.post("/api/quotes", {
        assessmentId,
        optionName: option.name,
        items: option.items,
        notes: option.description,
      });

      queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      Alert.alert("Success", "Quote saved successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save quote");
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-br from-green-600 to-emerald-600 px-6 py-8">
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3"
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Generate Quote</Text>
            <Text className="text-green-100">3 pricing options powered by AI</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {quoteOptions.length === 0 && !generating && (
          <View className="items-center py-12">
            <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <FileText size={40} color="#16A34A" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
              Generate Professional Quotes
            </Text>
            <Text className="text-gray-600 text-center mb-6 px-4">
              AI will create 3 pricing options (Essential, Recommended, Premium) based on this
              assessment and your equipment catalog
            </Text>
            <Pressable
              onPress={generateQuotes}
              className="bg-green-600 px-8 py-4 rounded-xl flex-row items-center"
            >
              <Sparkles size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">Generate 3 Options</Text>
            </Pressable>
          </View>
        )}

        {generating && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#16A34A" />
            <Text className="text-gray-600 mt-4">Generating quote options...</Text>
            <Text className="text-gray-500 text-sm mt-2">Using Grok 4 Fast AI</Text>
          </View>
        )}

        {quoteOptions.length > 0 &&
          quoteOptions.map((option, index) => (
            <View key={index} className="bg-white rounded-2xl p-6 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-bold text-gray-900">{option.name}</Text>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-semibold text-sm">
                    ${option.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-600 mb-4">{option.description}</Text>

              {/* Items */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Included Items:</Text>
                {option.items.map((item, itemIndex) => (
                  <View key={itemIndex} className="flex-row justify-between mb-2">
                    <Text className="text-gray-800">
                      {item.quantity}x {item.name}
                    </Text>
                    <Text className="text-gray-600">${item.price.toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              {/* Pricing */}
              <View className="border-t border-gray-200 pt-3 mb-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Subtotal</Text>
                  <Text className="text-gray-800">${option.subtotal.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Tax (10%)</Text>
                  <Text className="text-gray-800">${option.tax.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-bold text-gray-900">Total</Text>
                  <Text className="font-bold text-gray-900">${option.total.toFixed(2)}</Text>
                </View>
              </View>

              <Pressable
                onPress={() => saveQuote(option)}
                className="bg-green-600 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">Select This Option</Text>
              </Pressable>
            </View>
          ))}

        {quoteOptions.length > 0 && (
          <Pressable
            onPress={generateQuotes}
            className="bg-green-100 py-3 rounded-xl items-center mb-6"
          >
            <Text className="text-green-700 font-semibold">Regenerate Options</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

export default GenerateQuoteScreen;
