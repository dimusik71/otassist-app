import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Save,
  X,
  FileText,
  Download,
} from "lucide-react-native";
import { api } from "@/lib/api";
import type { GetDocumentResponse, UpdateDocumentRequest } from "@/shared/contracts";
import type { RootStackParamList } from "@/navigation/types";

type NavigationProp = StackNavigationProp<RootStackParamList, "DocumentViewer">;
type DocumentViewerRouteProp = RouteProp<RootStackParamList, "DocumentViewer">;

const DocumentViewerScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DocumentViewerRouteProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { documentId, clientId, clientName } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  // Fetch document
  const { data, isLoading, error } = useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      const result = await api.get<GetDocumentResponse>(`/api/documents/${documentId}`);
      setEditedTitle(result.document.title);
      setEditedContent(result.document.content);
      return result;
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: UpdateDocumentRequest) => {
      return await api.put(`/api/documents/${documentId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
      setIsEditing(false);
      Alert.alert("Success", "Document updated successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to update document");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete document");
    },
  });

  const handleSave = () => {
    if (!editedTitle.trim()) {
      Alert.alert("Error", "Title cannot be empty");
      return;
    }
    updateMutation.mutate({
      title: editedTitle,
      content: editedContent,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const renderContent = () => {
    if (!data?.document) return null;

    try {
      const content = JSON.parse(data.document.content);

      // Render based on document type
      if (data.document.documentType === "invoice" || data.document.documentType === "quote") {
        return (
          <View className="space-y-4">
            {content.items?.map((item: any, index: number) => (
              <View key={index} className="bg-slate-700 p-3 rounded-lg">
                <Text className="text-white font-semibold">{item.name || item.description}</Text>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-slate-400">Qty: {item.quantity}</Text>
                  <Text className="text-emerald-400 font-semibold">
                    ${parseFloat(item.total || item.price || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
            <View className="border-t border-slate-600 pt-4 mt-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-300">Subtotal:</Text>
                <Text className="text-white font-semibold">
                  ${parseFloat(content.subtotal || 0).toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-300">GST:</Text>
                <Text className="text-white font-semibold">
                  ${parseFloat(content.tax || 0).toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-slate-600">
                <Text className="text-white font-bold text-lg">Total:</Text>
                <Text className="text-emerald-400 font-bold text-lg">
                  ${parseFloat(content.total || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        );
      }

      // For other types, show JSON prettified
      return (
        <View className="bg-slate-700 p-4 rounded-lg">
          <Text className="text-slate-300 font-mono text-xs">
            {JSON.stringify(content, null, 2)}
          </Text>
        </View>
      );
    } catch (e) {
      return (
        <View className="bg-slate-700 p-4 rounded-lg">
          <Text className="text-slate-300">{data.document.content}</Text>
        </View>
      );
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a" }} className="justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !data?.document) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a" }} className="justify-center items-center px-6">
        <FileText size={64} color="#64748b" />
        <Text className="text-slate-400 mt-4 text-center">Document not found</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-xl active:opacity-70"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {/* Header */}
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.goBack()} className="mr-3 active:opacity-70">
              <ArrowLeft size={24} color="#fff" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold" numberOfLines={1}>
                {data.document.title}
              </Text>
              <Text className="text-slate-400 text-sm">
                {clientName} • v{data.document.version}
              </Text>
            </View>
          </View>
          <View className="flex-row space-x-2 ml-2">
            <Pressable
              onPress={() => setIsEditing(true)}
              className="w-10 h-10 bg-blue-600 rounded-lg items-center justify-center active:opacity-70"
            >
              <Edit3 size={18} color="#fff" />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              className="w-10 h-10 bg-red-600 rounded-lg items-center justify-center active:opacity-70"
            >
              <Trash2 size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Metadata */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-400 text-sm">Type</Text>
            <Text className="text-white font-medium capitalize">
              {data.document.documentType.replace("_", " ")}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-400 text-sm">Status</Text>
            <View className={`px-3 py-1 rounded-full ${
              data.document.status === "draft" ? "bg-amber-500" :
              data.document.status === "final" ? "bg-emerald-500" : "bg-slate-500"
            }`}>
              <Text className="text-white text-xs font-medium capitalize">
                {data.document.status}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-sm">Created</Text>
            <Text className="text-white font-medium">
              {new Date(data.document.createdAt).toLocaleDateString("en-AU", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Document Content */}
        <Text className="text-white font-bold text-lg mb-3">Content</Text>
        {renderContent()}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
          <LinearGradient
            colors={["#1e293b", "#0f172a"]}
            style={{
              paddingTop: insets.top + 16,
              paddingBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-xl font-bold">Edit Document</Text>
              <Pressable onPress={() => setIsEditing(false)} className="active:opacity-70">
                <X size={24} color="#fff" />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView className="flex-1 px-5 py-4">
            <Text className="text-white font-semibold mb-2">Title</Text>
            <TextInput
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Document title"
              placeholderTextColor="#64748b"
              className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 mb-4"
            />

            <Text className="text-white font-semibold mb-2">Content (JSON)</Text>
            <TextInput
              value={editedContent}
              onChangeText={setEditedContent}
              placeholder="Document content"
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={15}
              textAlignVertical="top"
              className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 font-mono text-xs"
            />
          </ScrollView>

          <View
            className="bg-slate-900 border-t border-slate-800 px-5"
            style={{ paddingBottom: insets.bottom + 16, paddingTop: 16 }}
          >
            <Pressable
              onPress={handleSave}
              disabled={updateMutation.isPending}
              className="bg-blue-600 py-4 rounded-xl items-center flex-row justify-center active:opacity-70"
            >
              <Save size={20} color="white" />
              <Text className="text-white font-bold ml-2">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DocumentViewerScreen;
