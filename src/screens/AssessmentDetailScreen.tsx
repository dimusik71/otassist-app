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
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Image as ImageIcon, Mic, ArrowLeft, Plus, Sparkles, Package, FileText, DollarSign, Edit2, Save, X, CheckCircle, Clock, AlertCircle } from "lucide-react-native";
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  dueDate: string | null;
  paidDate: string | null;
  createdAt: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  optionName: string;
  total: number;
  validUntil: string | null;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: "draft" as "draft" | "completed" | "approved",
    location: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: assessment, isLoading } = useQuery<AssessmentDetail>({
    queryKey: ["assessment", assessmentId],
    queryFn: async () => {
      const data = await api.get<AssessmentDetail>(`/api/assessments/${assessmentId}`);
      // Initialize form data when assessment loads
      setEditFormData({
        status: data.status as "draft" | "completed" | "approved",
        location: data.location || "",
        notes: data.notes || "",
      });
      return data;
    },
  });

  const { mutate: updateAssessment, isPending: isUpdating } = useMutation({
    mutationFn: async (data: { status?: string; location?: string; notes?: string }) => {
      return api.put(`/api/assessments/${assessmentId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      setIsEditing(false);
      Alert.alert("Success", "Assessment updated successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to update assessment");
    },
  });

  // Fetch invoices for this assessment
  const { data: invoicesData } = useQuery<{ invoices: Invoice[] }>({
    queryKey: ["invoices", assessmentId],
    queryFn: () => api.get(`/api/invoices/${assessmentId}`),
  });

  // Fetch quotes for this assessment
  const { data: quotesData } = useQuery<{ quotes: Quote[] }>({
    queryKey: ["quotes", assessmentId],
    queryFn: () => api.get(`/api/quotes/${assessmentId}`),
  });

  const { mutate: updateInvoiceStatus } = useMutation({
    mutationFn: async ({ invoiceId, status, paidDate }: { invoiceId: string; status: string; paidDate?: string }) => {
      return api.put(`/api/invoices/${invoiceId}`, { status, paidDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", assessmentId] });
      Alert.alert("Success", "Invoice status updated");
    },
    onError: () => {
      Alert.alert("Error", "Failed to update invoice status");
    },
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

  const { mutate: uploadMedia, isPending: uploadingMedia } = useMutation({
    mutationFn: async ({ fileUri, type, caption }: { fileUri: string; type: string; caption?: string }) => {
      // Step 1: Upload file to server
      const fileName = fileUri.split("/").pop() || "upload";
      const fileType = type === "photo" ? "image/jpeg" : type === "video" ? "video/mp4" : "audio/m4a";

      const uploadResult = await api.upload<{ success: boolean; url: string }>("/api/upload/image", {
        file: {
          uri: fileUri,
          name: fileName,
          type: fileType,
        },
      });

      // Step 2: Create media record in assessment
      const fullUrl = `${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}${uploadResult.url}`;
      return api.post(`/api/assessments/${assessmentId}/media`, {
        type,
        url: fullUrl,
        caption,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      Alert.alert("Success", "Media uploaded successfully!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to upload media. Please try again.");
      console.error("Upload error:", error);
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
      uploadMedia({
        fileUri: result.assets[0].uri,
        type: "photo",
        caption: "Photo taken from camera",
      });
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
      const asset = result.assets[0];
      uploadMedia({
        fileUri: asset.uri,
        type: asset.type === "video" ? "video" : "photo",
        caption: asset.type === "video" ? "Video from gallery" : "Photo from gallery",
      });
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
          // Upload audio file first
          const fileName = uri.split("/").pop() || "audio.m4a";
          const uploadResult = await api.upload<{ success: boolean; url: string }>("/api/upload/image", {
            file: {
              uri,
              name: fileName,
              type: "audio/m4a",
            },
          });

          // Save with transcription
          const fullUrl = `${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}${uploadResult.url}`;
          await api.post(`/api/assessments/${assessmentId}/media`, {
            type: "audio",
            url: fullUrl,
            caption: "Audio note",
            aiAnalysis: result.transcription,
          });

          queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });

          Alert.alert(
            "Transcription Complete",
            `Transcribed: "${result.transcription.substring(0, 100)}${result.transcription.length > 100 ? "..." : ""}"`
          );
        } else {
          Alert.alert("Error", result.error || "Failed to transcribe audio");
        }
      }
    } catch (err) {
      Alert.alert("Error", "Failed to process recording");
      console.error("Recording error:", err);
    }
  };

  const handleSaveEdit = () => {
    updateAssessment(editFormData);
  };

  const handleCancelEdit = () => {
    // Reset form to current assessment values
    if (assessment) {
      setEditFormData({
        status: assessment.status as "draft" | "completed" | "approved",
        location: assessment.location || "",
        notes: assessment.notes || "",
      });
    }
    setIsEditing(false);
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    Alert.alert(
      "Mark as Paid",
      "Are you sure you want to mark this invoice as paid?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Paid",
          onPress: () => {
            updateInvoiceStatus({
              invoiceId,
              status: "paid",
              paidDate: new Date().toISOString(),
            });
          },
        },
      ]
    );
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "sent":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInvoiceStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={16} color="#15803D" />;
      case "overdue":
        return <AlertCircle size={16} color="#B91C1C" />;
      case "sent":
        return <Clock size={16} color="#1E40AF" />;
      default:
        return <Clock size={16} color="#6B7280" />;
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
      <LinearGradient
        colors={["#1D4ED8", "#0D9488"]}
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
            <Text className="text-2xl font-bold text-white">{assessment.client.name}</Text>
            <Text style={{ color: "#DBEAFE" }} className="capitalize">
              {assessment.assessmentType.replace("_", " ")}
            </Text>
          </View>
          {!isEditing ? (
            <>
              <View
                className={`px-3 py-1 rounded-full mr-2 ${
                  assessment.status === "completed"
                    ? "bg-green-500"
                    : assessment.status === "approved"
                      ? "bg-blue-500"
                      : "bg-gray-500"
                }`}
              >
                <Text className="text-white text-xs font-semibold">{assessment.status}</Text>
              </View>
              <Pressable
                onPress={() => setIsEditing(true)}
                className="bg-white/20 w-10 h-10 rounded-full items-center justify-center"
              >
                <Edit2 size={18} color="white" />
              </Pressable>
            </>
          ) : (
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleCancelEdit}
                className="bg-red-500/80 w-10 h-10 rounded-full items-center justify-center"
              >
                <X size={18} color="white" />
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                disabled={isUpdating}
                className="bg-green-500 w-10 h-10 rounded-full items-center justify-center"
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Save size={18} color="white" />
                )}
              </Pressable>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Start Assessment Form Button */}
        <Pressable
          onPress={() => navigation.navigate("ConductAssessment", { assessmentId })}
          className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-5 mb-6 flex-row items-center justify-between"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View className="flex-1">
            <Text className="text-white font-bold text-lg mb-1">Environmental Assessment Form</Text>
            <Text className="text-white/80 text-sm">
              Complete structured OT home assessment with AI guidance
            </Text>
          </View>
          <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center">
            <FileText size={24} color="white" />
          </View>
        </Pressable>

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
            <LinearGradient
              colors={["#9333EA", "#DB2777"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-xl"
            >
              <Pressable
                onPress={() => navigation.navigate("EquipmentRecommendations", { assessmentId })}
                className="py-4 items-center flex-row justify-center"
              >
                <Package size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Equipment Recommendations</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient
              colors={["#16A34A", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-xl"
            >
              <Pressable
                onPress={() => navigation.navigate("GenerateQuote", { assessmentId })}
                className="py-4 items-center flex-row justify-center"
              >
                <FileText size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Generate Quote (3 Options)</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient
              colors={["#2563EB", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-xl"
            >
              <Pressable
                onPress={() => navigation.navigate("GenerateInvoice", { assessmentId })}
                className="py-4 items-center flex-row justify-center"
              >
                <DollarSign size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Generate Invoice</Text>
              </Pressable>
            </LinearGradient>
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

          {/* Status */}
          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Status</Text>
            {isEditing ? (
              <View className="flex-row gap-2">
                {(["draft", "completed", "approved"] as const).map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => setEditFormData({ ...editFormData, status })}
                    className={`px-4 py-2 rounded-full border ${
                      editFormData.status === status
                        ? status === "completed"
                          ? "bg-green-500 border-green-500"
                          : status === "approved"
                            ? "bg-blue-500 border-blue-500"
                            : "bg-gray-500 border-gray-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold capitalize ${
                        editFormData.status === status ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text className="text-base text-gray-900 capitalize">{assessment.status}</Text>
            )}
          </View>

          {/* Location */}
          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-600 mb-1">Location</Text>
            {isEditing ? (
              <TextInput
                value={editFormData.location}
                onChangeText={(text) => setEditFormData({ ...editFormData, location: text })}
                placeholder="Enter location"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{assessment.location || "Not specified"}</Text>
            )}
          </View>

          {/* Date */}
          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-600">Date</Text>
            <Text className="text-base text-gray-900">
              {new Date(assessment.assessmentDate).toLocaleString()}
            </Text>
          </View>

          {/* Notes */}
          <View>
            <Text className="text-sm font-semibold text-gray-600 mb-1">Notes</Text>
            {isEditing ? (
              <TextInput
                value={editFormData.notes}
                onChangeText={(text) => setEditFormData({ ...editFormData, notes: text })}
                placeholder="Add notes"
                multiline
                numberOfLines={4}
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
            ) : (
              <Text className="text-base text-gray-900">{assessment.notes || "No notes"}</Text>
            )}
          </View>
        </View>

        {/* Invoices */}
        {invoicesData && invoicesData.invoices.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">
              Invoices ({invoicesData.invoices.length})
            </Text>
            {invoicesData.invoices.map((invoice) => (
              <View key={invoice.id} className="border-b border-gray-200 py-3 last:border-b-0">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">{invoice.invoiceNumber}</Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-gray-900">${invoice.total.toFixed(2)}</Text>
                    <View className={`px-2 py-1 rounded-full flex-row items-center mt-1 ${getInvoiceStatusColor(invoice.status)}`}>
                      {getInvoiceStatusIcon(invoice.status)}
                      <Text className={`text-xs font-semibold ml-1 ${getInvoiceStatusColor(invoice.status).split(' ')[1]}`}>
                        {invoice.status}
                      </Text>
                    </View>
                  </View>
                </View>
                {invoice.dueDate && !invoice.paidDate && (
                  <Text className="text-xs text-gray-500 mb-2">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </Text>
                )}
                {invoice.paidDate && (
                  <Text className="text-xs text-green-600 mb-2">
                    Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                  </Text>
                )}
                {invoice.status !== "paid" && (
                  <Pressable
                    onPress={() => handleMarkAsPaid(invoice.id)}
                    className="bg-green-600 rounded-lg py-2 items-center mt-2"
                  >
                    <Text className="text-white font-semibold text-sm">Mark as Paid</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Quotes */}
        {quotesData && quotesData.quotes.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">
              Quotes ({quotesData.quotes.length})
            </Text>
            {quotesData.quotes.map((quote) => {
              const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date();
              const isExpiringSoon = quote.validUntil && !isExpired &&
                new Date(quote.validUntil).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

              return (
                <View key={quote.id} className="border-b border-gray-200 py-3 last:border-b-0">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">{quote.quoteNumber}</Text>
                      <Text className="text-sm text-teal-600 font-medium">{quote.optionName}</Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-gray-900">${quote.total.toFixed(2)}</Text>
                  </View>
                  {quote.validUntil && (
                    <View className="flex-row items-center mt-1">
                      {isExpired ? (
                        <>
                          <AlertCircle size={14} color="#B91C1C" />
                          <Text className="text-xs text-red-600 font-semibold ml-1">
                            Expired {new Date(quote.validUntil).toLocaleDateString()}
                          </Text>
                        </>
                      ) : isExpiringSoon ? (
                        <>
                          <Clock size={14} color="#F59E0B" />
                          <Text className="text-xs text-amber-600 font-semibold ml-1">
                            Expires soon: {new Date(quote.validUntil).toLocaleDateString()}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-xs text-gray-500">
                          Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AssessmentDetailScreen;
