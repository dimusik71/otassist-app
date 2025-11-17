import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Image as ImageIcon, Mic, ArrowLeft, Plus, Sparkles, Package, FileText, DollarSign } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";

type Props = RootStackScreenProps<"AssessmentDetail">;

interface AssessmentMedia {
  id: string;
  type: string;
  url: string;
  caption: string | null;
  aiAnalysis: string | null;
  createdAt: string;
}

interface AssessmentDetail {
  id: string;
  clientId: string;
  assessmentType: string;
  status: string;
  location: string | null;
  assessmentDate: string;
  notes: string | null;
  aiSummary: string | null;
  reportGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string | null;
  };
  media: AssessmentMedia[];
  equipment: unknown[];
}

const AssessmentDetailScreen = ({ navigation, route }: Props) => {
  const { assessmentId } = route.params;
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const queryClient = useQueryClient();

  const { data: assessment, isLoading } = useQuery<AssessmentDetail>({
    queryKey: ["assessment", assessmentId],
    queryFn: () => api.get(`/api/assessments/${assessmentId}`),
  });

  const { mutate: analyzeWithAI, isPending: analyzingAI } = useMutation({
    mutationFn: async (assessmentId: string) => {
      // This will call OpenAI to analyze the assessment
      const response = await fetch(`${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}/api/assessments/${assessmentId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      Alert.alert("Success", "AI analysis completed!");
    },
  });

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Upload photo to assessment
      Alert.alert("Photo captured", "Photo will be uploaded to assessment");
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Photo library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Alert.alert("Media selected", "Media will be uploaded to assessment");
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Microphone permission is required");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Transcribe audio
        Alert.alert(
          "Processing Audio",
          "Transcribing your audio note...",
          [{ text: "OK" }],
          { cancelable: false }
        );

        // Import transcription function
        const { transcribeAudio } = await import("@/lib/audioTranscription");
        const result = await transcribeAudio(uri);

        if (result.success && result.transcription) {
          Alert.alert(
            "Transcription Complete",
            `Transcribed: "${result.transcription.substring(0, 100)}${result.transcription.length > 100 ? "..." : ""}"`
          );
          // TODO: Save transcription to assessment
        } else {
          Alert.alert("Error", result.error || "Failed to transcribe audio");
        }
      }
    } catch (err) {
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!assessment) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-600">Assessment not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-br from-blue-700 to-teal-600 px-6 py-8">
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3"
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">{assessment.client.name}</Text>
            <Text className="text-blue-100 capitalize">
              {assessment.assessmentType.replace("_", " ")}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              assessment.status === "completed"
                ? "bg-green-500"
                : assessment.status === "approved"
                  ? "bg-blue-500"
                  : "bg-gray-500"
            }`}
          >
            <Text className="text-white text-xs font-semibold">{assessment.status}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* AI Summary */}
        {assessment.aiSummary && (
          <View className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Sparkles size={20} color="#9333EA" />
              <Text className="text-purple-900 font-bold text-base ml-2">AI Summary</Text>
            </View>
            <Text className="text-purple-800">{assessment.aiSummary}</Text>
          </View>
        )}

        {/* Media Capture Actions */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Capture Media</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleTakePhoto}
              className="flex-1 bg-blue-600 rounded-xl py-4 items-center flex-row justify-center"
            >
              <Camera size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Camera</Text>
            </Pressable>

            <Pressable
              onPress={handlePickImage}
              className="flex-1 bg-teal-600 rounded-xl py-4 items-center flex-row justify-center"
            >
              <ImageIcon size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Gallery</Text>
            </Pressable>

            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              className={`flex-1 rounded-xl py-4 items-center flex-row justify-center ${
                isRecording ? "bg-red-600" : "bg-orange-600"
              }`}
            >
              <Mic size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                {isRecording ? "Stop" : "Audio"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* AI Analysis Button */}
        <Pressable
          onPress={() => analyzeWithAI(assessmentId)}
          disabled={analyzingAI || assessment.media.length === 0}
          className={`rounded-xl py-4 items-center flex-row justify-center mb-6 ${
            analyzingAI || assessment.media.length === 0 ? "bg-gray-400" : "bg-purple-600"
          }`}
        >
          <Sparkles size={20} color="white" />
          <Text className="text-white font-bold ml-2">
            {analyzingAI ? "Analyzing..." : "Analyze with AI"}
          </Text>
        </Pressable>

        {/* Phase 3 Features - AI-Powered Actions */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">AI-Powered Features</Text>
          <View className="gap-3">
            <Pressable
              onPress={() => navigation.navigate("EquipmentRecommendations", { assessmentId })}
              className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl py-4 items-center flex-row justify-center"
            >
              <Package size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Equipment Recommendations</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("GenerateQuote", { assessmentId })}
              className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl py-4 items-center flex-row justify-center"
            >
              <FileText size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Generate Quote (3 Options)</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("GenerateInvoice", { assessmentId })}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl py-4 items-center flex-row justify-center"
            >
              <DollarSign size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Generate Invoice</Text>
            </Pressable>
          </View>
        </View>

        {/* Media Gallery */}
        {assessment.media.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Media ({assessment.media.length})
            </Text>
            <FlatList
              data={assessment.media}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="mr-3 bg-white rounded-xl overflow-hidden" style={{ width: 150 }}>
                  {item.type === "photo" && item.url ? (
                    <Image source={{ uri: item.url }} className="w-full h-32" />
                  ) : (
                    <View className="w-full h-32 bg-gray-200 items-center justify-center">
                      <Text className="text-gray-500 capitalize">{item.type}</Text>
                    </View>
                  )}
                  {item.caption && (
                    <View className="p-2">
                      <Text className="text-xs text-gray-600" numberOfLines={2}>
                        {item.caption}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>
        )}

        {/* Assessment Info */}
        <View className="bg-white rounded-2xl p-5 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-4">Assessment Details</Text>
          {assessment.location && (
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-600">Location</Text>
              <Text className="text-base text-gray-900">{assessment.location}</Text>
            </View>
          )}
          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-600">Date</Text>
            <Text className="text-base text-gray-900">
              {new Date(assessment.assessmentDate).toLocaleString()}
            </Text>
          </View>
          {assessment.notes && (
            <View>
              <Text className="text-sm font-semibold text-gray-600">Notes</Text>
              <Text className="text-base text-gray-900">{assessment.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AssessmentDetailScreen;
