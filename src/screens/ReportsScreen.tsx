import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal, TextInput } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  FileText,
  Plus,
  DollarSign,
  Activity,
  Stethoscope,
  Settings,
  Download,
  Trash2,
  Calendar,
  TrendingUp,
  Users,
  ClipboardList,
  ArrowLeft,
} from "lucide-react-native";
import type { RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import type { GetReportsResponse, GenerateReportRequest, GenerateReportResponse } from "@/shared/contracts";
import { useSession } from "@/lib/useSession";
import DateTimePicker from "@react-native-community/datetimepicker";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const reportTypes = [
  {
    type: "financial" as const,
    title: "Financial Report",
    description: "Revenue, invoices, and payment analytics",
    icon: DollarSign,
    color: "#10B981",
  },
  {
    type: "operational" as const,
    title: "Operational Report",
    description: "Assessments, appointments, and workflow metrics",
    icon: Activity,
    color: "#3B82F6",
  },
  {
    type: "clinical" as const,
    title: "Clinical Report",
    description: "Client demographics and equipment recommendations",
    icon: Stethoscope,
    color: "#8B5CF6",
  },
  {
    type: "custom" as const,
    title: "Custom Report",
    description: "Build your own report with selected metrics",
    icon: Settings,
    color: "#F59E0B",
  },
];

const ReportsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<"financial" | "operational" | "clinical" | "custom">("financial");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.get<GetReportsResponse>("/api/reports"),
    enabled: !!session,
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      api.post<GenerateReportResponse>("/api/reports/generate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const resetForm = () => {
    setTitle("");
    setSelectedType("financial");
    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
  };

  const handleGenerate = () => {
    const reportConfig = reportTypes.find((t) => t.type === selectedType);

    generateMutation.mutate({
      reportType: selectedType,
      title: title.trim() || reportConfig?.title || "Report",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <FileText size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-900 mb-2 mt-4">Reports</Text>
          <Text className="text-gray-600 text-center">Please log in to view your reports</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading reports...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 w-10 h-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white">Reports</Text>
          </View>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="bg-white px-4 py-2 rounded-xl flex-row items-center active:opacity-80"
          >
            <Plus size={20} color="#3B82F6" />
            <Text className="text-blue-600 font-semibold ml-2">Generate</Text>
          </Pressable>
        </View>
        <Text style={{ color: "#DBEAFE", marginLeft: 52 }}>Business intelligence and analytics</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Report Type Cards */}
        <Text className="text-lg font-bold text-gray-900 mb-3">Report Types</Text>
        <View className="flex-row flex-wrap mb-6">
          {reportTypes.map((reportType) => {
            const Icon = reportType.icon;
            return (
              <Pressable
                key={reportType.type}
                onPress={() => {
                  setSelectedType(reportType.type);
                  setShowCreateModal(true);
                }}
                className="bg-white rounded-2xl p-4 mb-3 active:opacity-70"
                style={{
                  width: "48%",
                  marginRight: reportType.type === "financial" || reportType.type === "operational" ? "4%" : 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${reportType.color}20` }}
                >
                  <Icon size={24} color={reportType.color} />
                </View>
                <Text className="text-gray-900 font-bold text-sm mb-1">{reportType.title}</Text>
                <Text className="text-gray-600 text-xs">{reportType.description}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Recent Reports */}
        <Text className="text-lg font-bold text-gray-900 mb-3">Recent Reports</Text>
        {(!data?.reports || data.reports.length === 0) && (
          <View className="bg-white rounded-2xl p-8 items-center">
            <FileText size={64} color="#D1D5DB" />
            <Text className="text-gray-900 font-semibold text-lg mt-4 mb-2">No Reports Yet</Text>
            <Text className="text-gray-600 text-center mb-6">
              Generate your first report to get business insights
            </Text>
            <Pressable
              onPress={() => setShowCreateModal(true)}
              className="bg-blue-600 px-6 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-white font-semibold">Generate Report</Text>
            </Pressable>
          </View>
        )}

        {data?.reports?.map((report) => {
          const reportConfig = reportTypes.find((t) => t.type === report.reportType);
          const Icon = reportConfig?.icon || FileText;
          const color = reportConfig?.color || "#6B7280";

          return (
            <Pressable
              key={report.id}
              onPress={() => navigation.navigate("ReportDetail", { reportId: report.id })}
              className="bg-white rounded-2xl p-4 mb-3 active:opacity-70"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon size={20} color={color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-bold text-base">{report.title}</Text>
                      <Text className="text-gray-500 text-xs capitalize">{report.reportType} Report</Text>
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => deleteMutation.mutate(report.id)}
                  className="p-2 active:opacity-70"
                >
                  <Trash2 size={18} color="#EF4444" />
                </Pressable>
              </View>

              <View className="flex-row items-center mb-2">
                <Calendar size={14} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-2">
                  {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                </Text>
              </View>

              <Text className="text-gray-500 text-xs">
                Generated {new Date(report.createdAt).toLocaleDateString()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Generate Report Modal */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-3xl font-bold text-white">Generate Report</Text>
              <Pressable onPress={() => setShowCreateModal(false)} className="p-2">
                <Text className="text-white font-semibold">Cancel</Text>
              </Pressable>
            </View>
            <Text style={{ color: "#DBEAFE" }}>Create a custom business report</Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Report Type Selection */}
            <Text className="text-gray-700 font-semibold mb-3">Report Type</Text>
            <View className="flex-row flex-wrap mb-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.type;
                return (
                  <Pressable
                    key={type.type}
                    onPress={() => setSelectedType(type.type)}
                    className={`flex-row items-center px-4 py-3 rounded-xl mr-2 mb-2 ${
                      isSelected ? "bg-blue-600" : "bg-white border border-gray-300"
                    }`}
                  >
                    <Icon size={16} color={isSelected ? "white" : type.color} />
                    <Text className={`ml-2 ${isSelected ? "text-white font-semibold" : "text-gray-700"}`}>
                      {type.title.replace(" Report", "")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Title */}
            <Text className="text-gray-700 font-semibold mb-2">Title (Optional)</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={reportTypes.find((t) => t.type === selectedType)?.title || "Report Title"}
              placeholderTextColor="#9CA3AF"
              className="bg-white border border-gray-300 rounded-xl p-4 text-gray-900 mb-4"
            />

            {/* Date Range */}
            <Text className="text-gray-700 font-semibold mb-2">Date Range</Text>
            <View className="flex-row mb-4">
              <Pressable
                onPress={() => setShowStartDatePicker(true)}
                className="flex-1 bg-white border border-gray-300 rounded-xl p-4 mr-2"
              >
                <Text className="text-gray-500 text-xs mb-1">From</Text>
                <Text className="text-gray-900 font-medium">
                  {startDate.toLocaleDateString()}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowEndDatePicker(true)}
                className="flex-1 bg-white border border-gray-300 rounded-xl p-4"
              >
                <Text className="text-gray-500 text-xs mb-1">To</Text>
                <Text className="text-gray-900 font-medium">
                  {endDate.toLocaleDateString()}
                </Text>
              </Pressable>
            </View>

            {/* Generate Button */}
            <Pressable
              onPress={handleGenerate}
              disabled={generateMutation.isPending}
              className="bg-blue-600 py-4 rounded-xl items-center active:opacity-80"
            >
              {generateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Generate Report</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}
      </Modal>
    </View>
  );
};

export default ReportsScreen;
