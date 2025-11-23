import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import type { UploadCatalogResponse, ParseCatalogResponse } from "@/shared/contracts";

type NavigationProp = StackNavigationProp<RootStackParamList, "UploadCatalog">;

const UploadCatalogScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "parsing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParseCatalogResponse | null>(null);

  // Upload PDF mutation
  const { mutate: uploadPDF, isPending: isUploading } = useMutation({
    mutationFn: async (file: any) => {
      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("pdf", {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any);

      const response = await fetch(`${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}/api/upload/catalog`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json() as Promise<UploadCatalogResponse>;
    },
    onSuccess: async (data) => {
      console.log("PDF uploaded successfully:", data);
      // Now parse the catalog
      setUploadStatus("parsing");
      parseCatalog(data.url, data.filename);
    },
    onError: (error: any) => {
      setUploadStatus("error");
      setErrorMessage(error.message || "Failed to upload PDF");
      Alert.alert("Upload Error", error.message || "Failed to upload PDF");
    },
  });

  // Parse catalog mutation
  const parseCatalog = async (fileUrl: string, filename: string) => {
    try {
      const response = await api.post<ParseCatalogResponse>("/api/ai/parse-catalog", {
        fileUrl,
        filename,
      });
      setParsedData(response);
      setUploadStatus("success");
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      Alert.alert(
        "Success!",
        `Successfully added ${response.equipmentCount} equipment items to your catalog`,
        [
          {
            text: "View Equipment",
            onPress: () => navigation.navigate("Tabs", { screen: "EquipmentTab" }),
          },
        ]
      );
    } catch (error: any) {
      setUploadStatus("error");
      setErrorMessage(error.message || "Failed to parse catalog");
      Alert.alert("Parsing Error", error.message || "Failed to parse catalog");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("Selected PDF:", file.name);
        setSelectedFile(file);
        setUploadStatus("idle");
        setErrorMessage(null);
        setParsedData(null);
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      Alert.alert("No File Selected", "Please select a PDF catalog first");
      return;
    }
    uploadPDF(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setErrorMessage(null);
    setParsedData(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={["#7C3AED", "#A855F7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => navigation.goBack()} className="mr-3 active:opacity-70">
            <ArrowLeft size={24} color="#fff" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Upload Catalog</Text>
            <Text style={{ color: "#E9D5FF" }}>AI-powered equipment extraction</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Instructions */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Text className="text-blue-900 font-semibold mb-2">How it works:</Text>
          <Text className="text-blue-800 text-sm mb-1">1. Select a PDF equipment catalog</Text>
          <Text className="text-blue-800 text-sm mb-1">
            2. AI extracts all equipment items automatically
          </Text>
          <Text className="text-blue-800 text-sm">3. Items are added to your equipment list</Text>
        </View>

        {/* File Selection */}
        <View className="bg-white rounded-2xl p-6 mb-6" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
          <Text className="text-lg font-bold text-gray-900 mb-4">Select PDF Catalog</Text>

          {selectedFile ? (
            <View className="mb-4">
              <View className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex-row items-center">
                <FileText size={24} color="#7C3AED" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
                {uploadStatus === "idle" && (
                  <Pressable onPress={handleReset} className="ml-2">
                    <Text className="text-purple-600 font-semibold">Change</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <Pressable
              onPress={pickDocument}
              className="border-2 border-dashed border-gray-300 rounded-xl py-12 items-center active:opacity-70"
            >
              <Upload size={48} color="#9CA3AF" />
              <Text className="text-gray-900 font-semibold mt-4">Select PDF File</Text>
              <Text className="text-gray-500 text-sm mt-1">Tap to browse</Text>
            </Pressable>
          )}

          {/* Upload Button */}
          {selectedFile && uploadStatus === "idle" && (
            <Pressable
              onPress={handleUpload}
              className="bg-purple-600 rounded-xl py-4 items-center active:opacity-80"
            >
              <Text className="text-white font-bold text-lg">Upload & Parse Catalog</Text>
            </Pressable>
          )}
        </View>

        {/* Status */}
        {uploadStatus !== "idle" && (
          <View className="bg-white rounded-2xl p-6" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
            <Text className="text-lg font-bold text-gray-900 mb-4">Processing Status</Text>

            {uploadStatus === "uploading" && (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="text-gray-700 font-semibold mt-4">Uploading PDF...</Text>
                <Text className="text-gray-500 text-sm mt-1">Please wait</Text>
              </View>
            )}

            {uploadStatus === "parsing" && (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="text-gray-700 font-semibold mt-4">
                  AI is extracting equipment...
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  This may take 30-60 seconds
                </Text>
              </View>
            )}

            {uploadStatus === "success" && parsedData && (
              <View className="items-center py-4">
                <CheckCircle size={64} color="#10B981" />
                <Text className="text-gray-900 font-bold text-xl mt-4">Success!</Text>
                <Text className="text-gray-600 text-center mt-2">
                  Added {parsedData.equipmentCount} equipment items to your catalog
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("Tabs", { screen: "EquipmentTab" })}
                  className="bg-purple-600 rounded-xl py-3 px-6 mt-6 active:opacity-80"
                >
                  <Text className="text-white font-bold">View Equipment</Text>
                </Pressable>
                <Pressable onPress={handleReset} className="mt-4">
                  <Text className="text-purple-600 font-semibold">Upload Another Catalog</Text>
                </Pressable>
              </View>
            )}

            {uploadStatus === "error" && (
              <View className="items-center py-4">
                <AlertCircle size={64} color="#EF4444" />
                <Text className="text-gray-900 font-bold text-xl mt-4">Error</Text>
                <Text className="text-gray-600 text-center mt-2">{errorMessage}</Text>
                <Pressable
                  onPress={handleReset}
                  className="bg-purple-600 rounded-xl py-3 px-6 mt-6 active:opacity-80"
                >
                  <Text className="text-white font-bold">Try Again</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default UploadCatalogScreen;
