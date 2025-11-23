import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import {
  FileText,
  DollarSign,
  Shield,
  Award,
  FileCheck,
  Receipt,
  ArrowLeft,
  Plus,
  Filter,
  X,
  Calendar,
  AlertCircle,
} from "lucide-react-native";
import { api } from "@/lib/api";
import type { RootStackParamList } from "@/navigation/types";

type NavigationProp = StackNavigationProp<RootStackParamList, "BusinessDocuments">;

interface BusinessDocument {
  id: string;
  documentType: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  amount: number | null;
  dueDate: string | null;
  paidDate: string | null;
  status: string;
  tags: string | null;
  notes: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetBusinessDocumentsResponse {
  documents: BusinessDocument[];
}

const BusinessDocumentsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [filterType, setFilterType] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    documentType: "note",
    content: "",
    notes: "",
    amount: "",
    expiryDate: "",
  });

  // Fetch business documents
  const { data, isLoading, error } = useQuery({
    queryKey: ["businessDocuments", filterType],
    queryFn: async () => {
      const url = filterType
        ? `/api/business-documents?documentType=${filterType}`
        : `/api/business-documents`;
      return await api.get<GetBusinessDocumentsResponse>(url);
    },
  });

  // Create document mutation
  const { mutate: createDocument, isPending: isCreating } = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/api/business-documents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessDocuments"] });
      setShowAddModal(false);
      setFormData({
        title: "",
        documentType: "note",
        content: "",
        notes: "",
        amount: "",
        expiryDate: "",
      });
      Alert.alert("Success", "Document created successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create document");
    },
  });

  // Delete document mutation
  const { mutate: deleteDocument } = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/business-documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessDocuments"] });
      Alert.alert("Success", "Document deleted successfully");
    },
  });

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "invoice_sent":
        return <DollarSign size={24} color="#10b981" />;
      case "insurance":
        return <Shield size={24} color="#3b82f6" />;
      case "registration":
      case "license":
      case "certification":
        return <Award size={24} color="#f59e0b" />;
      case "contract":
        return <FileCheck size={24} color="#8b5cf6" />;
      case "receipt":
        return <Receipt size={24} color="#06b6d4" />;
      default:
        return <FileText size={24} color="#64748b" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      invoice_sent: "Invoice Sent",
      insurance: "Insurance",
      registration: "Registration",
      license: "License",
      certification: "Certification",
      contract: "Contract",
      receipt: "Receipt",
      tax_document: "Tax Document",
      note: "Note",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "paid":
        return "bg-blue-500";
      case "overdue":
        return "bg-red-500";
      case "expired":
        return "bg-amber-500";
      case "archived":
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const handleCreateDocument = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    const payload: any = {
      title: formData.title,
      documentType: formData.documentType,
      content: formData.content || null,
      notes: formData.notes || null,
    };

    if (formData.amount) {
      payload.amount = parseFloat(formData.amount);
    }

    if (formData.expiryDate) {
      payload.expiryDate = new Date(formData.expiryDate).toISOString();
    }

    createDocument(payload);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteDocument(id),
        },
      ]
    );
  };

  const renderDocument = ({ item }: { item: BusinessDocument }) => (
    <Pressable
      onLongPress={() => handleDelete(item.id, item.title)}
      className="bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700 active:opacity-70"
    >
      <View className="flex-row items-start">
        <View className="w-12 h-12 bg-slate-700 rounded-lg items-center justify-center mr-3">
          {getDocumentIcon(item.documentType)}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-white font-semibold text-base flex-1" numberOfLines={1}>
              {item.title}
            </Text>
            <View className={`${getStatusColor(item.status)} px-2 py-1 rounded ml-2`}>
              <Text className="text-white text-xs font-medium capitalize">
                {item.status}
              </Text>
            </View>
          </View>

          <Text className="text-slate-400 text-sm mb-2">
            {getDocumentTypeLabel(item.documentType)}
            {item.amount && ` • $${item.amount.toFixed(2)}`}
          </Text>

          {item.expiryDate && (
            <View className="flex-row items-center mb-1">
              <Calendar size={14} color={isExpiringSoon(item.expiryDate) ? "#f59e0b" : "#64748b"} />
              <Text className={`text-xs ml-1 ${isExpiringSoon(item.expiryDate) ? "text-amber-500" : "text-slate-500"}`}>
                Expires: {new Date(item.expiryDate).toLocaleDateString("en-AU")}
              </Text>
              {isExpiringSoon(item.expiryDate) && (
                <AlertCircle size={14} color="#f59e0b" style={{ marginLeft: 4 }} />
              )}
            </View>
          )}

          <Text className="text-slate-500 text-xs">
            {new Date(item.createdAt).toLocaleDateString("en-AU", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const filterButtons = [
    { label: "All", value: null },
    { label: "Invoices", value: "invoice_sent" },
    { label: "Insurance", value: "insurance" },
    { label: "Licenses", value: "license" },
    { label: "Notes", value: "note" },
  ];

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
            <Pressable
              onPress={() => navigation.goBack()}
              className="mr-3 active:opacity-70"
            >
              <ArrowLeft size={24} color="#fff" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">Business Documents</Text>
              <Text className="text-slate-400 text-sm">Your professional files</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="bg-teal-600 px-4 py-2 rounded-lg flex-row items-center active:opacity-70"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-semibold ml-1 text-sm">Add</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Filter Pills */}
      <View className="px-5 py-3 border-b border-slate-800">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterButtons}
          keyExtractor={(item) => item.value || "all"}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilterType(item.value)}
              className={`mr-2 px-4 py-2 rounded-full ${
                filterType === item.value
                  ? "bg-teal-600"
                  : "bg-slate-800 border border-slate-700"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filterType === item.value ? "text-white" : "text-slate-300"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Documents List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#14b8a6" />
          <Text className="text-slate-400 mt-4">Loading documents...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <FileText size={48} color="#64748b" />
          <Text className="text-slate-400 mt-4 text-center">
            Failed to load documents
          </Text>
        </View>
      ) : data?.documents?.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <FileText size={64} color="#64748b" />
          <Text className="text-white text-lg font-semibold mt-4">
            No Documents Yet
          </Text>
          <Text className="text-slate-400 text-center mt-2 mb-6">
            Store your business documents like insurance policies, licenses, invoices, and receipts
          </Text>
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="bg-teal-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Add Your First Document</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data?.documents || []}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
        />
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View className="bg-slate-800 rounded-2xl p-6 mx-6 w-full max-w-md">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-xl font-bold">Add Document</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <X size={24} color="#94a3b8" />
              </Pressable>
            </View>

            <ScrollView className="max-h-96">
              {/* Title */}
              <Text className="text-slate-300 font-semibold mb-2">Title *</Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Document title"
                placeholderTextColor="#64748b"
                className="bg-slate-700 text-white rounded-lg px-4 py-3 mb-4"
              />

              {/* Document Type */}
              <Text className="text-slate-300 font-semibold mb-2">Type</Text>
              <View className="flex-row flex-wrap mb-4">
                {["note", "invoice_sent", "insurance", "license", "receipt"].map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setFormData({ ...formData, documentType: type })}
                    className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                      formData.documentType === type ? "bg-teal-600" : "bg-slate-700"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        formData.documentType === type ? "text-white font-semibold" : "text-slate-300"
                      }`}
                    >
                      {getDocumentTypeLabel(type)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Amount */}
              <Text className="text-slate-300 font-semibold mb-2">Amount (optional)</Text>
              <TextInput
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                className="bg-slate-700 text-white rounded-lg px-4 py-3 mb-4"
              />

              {/* Content/Notes */}
              <Text className="text-slate-300 font-semibold mb-2">Notes</Text>
              <TextInput
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Add notes..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                className="bg-slate-700 text-white rounded-lg px-4 py-3 mb-4"
                style={{ textAlignVertical: "top" }}
              />
            </ScrollView>

            {/* Actions */}
            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => setShowAddModal(false)}
                className="flex-1 bg-slate-700 rounded-xl py-3 items-center"
              >
                <Text className="text-slate-300 font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateDocument}
                disabled={isCreating}
                className="flex-1 bg-teal-600 rounded-xl py-3 items-center"
              >
                {isCreating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Create</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BusinessDocumentsScreen;
