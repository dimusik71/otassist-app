import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import {
  FileText,
  DollarSign,
  FileSpreadsheet,
  Home,
  ClipboardList,
  ArrowLeft,
  Plus,
  Filter,
} from "lucide-react-native";
import { api } from "@/lib/api";
import type { Document, GetDocumentsResponse } from "@/shared/contracts";
import type { RootStackParamList } from "@/navigation/types";

type NavigationProp = StackNavigationProp<RootStackParamList, "Documents">;
type DocumentsRouteProp = RouteProp<RootStackParamList, "Documents">;

const DocumentsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DocumentsRouteProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { clientId, clientName } = route.params;
  const [filterType, setFilterType] = useState<string | null>(null);

  // Fetch documents
  const { data, isLoading, error } = useQuery({
    queryKey: ["documents", clientId, filterType],
    queryFn: async () => {
      const url = filterType
        ? `/api/documents?clientId=${clientId}&documentType=${filterType}`
        : `/api/documents?clientId=${clientId}`;
      return await api.get<GetDocumentsResponse>(url);
    },
  });

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <DollarSign size={24} color="#10b981" />;
      case "quote":
        return <FileSpreadsheet size={24} color="#f59e0b" />;
      case "report":
        return <ClipboardList size={24} color="#3b82f6" />;
      case "house_map":
        return <Home size={24} color="#8b5cf6" />;
      case "assessment_summary":
        return <FileText size={24} color="#06b6d4" />;
      default:
        return <FileText size={24} color="#64748b" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "invoice":
        return "Invoice";
      case "quote":
        return "Quote";
      case "report":
        return "Report";
      case "house_map":
        return "House Map";
      case "assessment_summary":
        return "Assessment Summary";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-amber-500";
      case "final":
        return "bg-emerald-500";
      case "archived":
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  const handleDocumentPress = (document: Document) => {
    navigation.navigate("DocumentViewer", {
      documentId: document.id,
      clientId,
      clientName,
    });
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <Pressable
      onPress={() => handleDocumentPress(item)}
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
            {getDocumentTypeLabel(item.documentType)} • v{item.version}
          </Text>

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
    { label: "Invoices", value: "invoice" },
    { label: "Quotes", value: "quote" },
    { label: "Reports", value: "report" },
    { label: "Maps", value: "house_map" },
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
              <Text className="text-white text-xl font-bold">Documents</Text>
              <Text className="text-slate-400 text-sm" numberOfLines={1}>
                {clientName}
              </Text>
            </View>
          </View>
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
                  ? "bg-blue-600"
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
          <ActivityIndicator size="large" color="#3b82f6" />
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
          <Text className="text-slate-400 text-center mt-2">
            Documents will appear here when you generate invoices, quotes, or reports for
            this client
          </Text>
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
    </View>
  );
};

export default DocumentsScreen;
