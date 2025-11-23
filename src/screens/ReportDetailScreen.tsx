import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Share, Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useNavigation, RouteProp as RNRouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  TrendingUp,
  Lightbulb,
  Target,
  FileText,
  DollarSign,
  Activity,
  Stethoscope,
  Settings,
} from "lucide-react-native";
import type { RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import type { GetReportResponse } from "@/shared/contracts";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = RNRouteProp<RootStackParamList, "ReportDetail">;

const ReportDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { reportId } = route.params;

  const { data, isLoading, error } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => api.get<GetReportResponse>(`/api/reports/${reportId}`),
  });

  const report = data?.report;
  const reportData = report?.data ? (typeof report.data === "string" ? JSON.parse(report.data) : report.data) : null;
  const aiAnalysis = reportData?.aiAnalysis;

  const getReportIcon = (type: string) => {
    switch (type) {
      case "financial":
        return { Icon: DollarSign, color: "#10B981" };
      case "operational":
        return { Icon: Activity, color: "#3B82F6" };
      case "clinical":
        return { Icon: Stethoscope, color: "#8B5CF6" };
      case "custom":
        return { Icon: Settings, color: "#F59E0B" };
      default:
        return { Icon: FileText, color: "#6B7280" };
    }
  };

  const handleDownload = async () => {
    if (!report?.fileUrl) {
      Alert.alert("Error", "Report file not available");
      return;
    }

    try {
      const fileUri = FileSystem.documentDirectory + `report_${report.id}.json`;
      const downloadUrl = report.fileUrl.startsWith("http")
        ? report.fileUrl
        : `${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}${report.fileUrl}`;

      await FileSystem.downloadAsync(downloadUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: report.title,
        });
      } else {
        Alert.alert("Success", "Report downloaded successfully");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download report");
    }
  };

  const handleShare = async () => {
    if (!report) return;

    try {
      const message = `${report.title}\n\nGenerated: ${new Date(report.createdAt).toLocaleDateString()}\nPeriod: ${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`;

      await Share.share({
        message,
        title: report.title,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading report...</Text>
        </View>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <FileText size={64} color="#EF4444" />
          <Text className="text-red-600 text-center mt-4">Failed to load report</Text>
        </View>
      </View>
    );
  }

  const { Icon, color } = getReportIcon(report.reportType);

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={[color, color + "CC"]}
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
            <View className="flex-row items-center">
              <Icon size={24} color="white" />
              <Text className="text-2xl font-bold text-white ml-2" numberOfLines={1}>
                {report.title}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center ml-12">
          <Calendar size={14} color="rgba(255, 255, 255, 0.8)" />
          <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, marginLeft: 6 }}>
            {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Action Buttons */}
        <View className="flex-row mb-4">
          <Pressable
            onPress={handleDownload}
            className="flex-1 bg-white border border-gray-300 rounded-xl p-3 mr-2 flex-row items-center justify-center active:opacity-70"
          >
            <Download size={18} color="#3B82F6" />
            <Text className="text-blue-600 font-semibold ml-2">Download</Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            className="flex-1 bg-white border border-gray-300 rounded-xl p-3 ml-2 flex-row items-center justify-center active:opacity-70"
          >
            <Share2 size={18} color="#3B82F6" />
            <Text className="text-blue-600 font-semibold ml-2">Share</Text>
          </Pressable>
        </View>

        {/* AI Analysis Section */}
        {aiAnalysis && (
          <>
            {/* Executive Summary */}
            <View
              className="bg-white rounded-2xl p-5 mb-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <FileText size={20} color={color} />
                </View>
                <Text className="text-gray-900 font-bold text-lg ml-3">Executive Summary</Text>
              </View>
              <Text className="text-gray-700 leading-6">{aiAnalysis.summary}</Text>
            </View>

            {/* Key Insights */}
            {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
              <View
                className="bg-white rounded-2xl p-5 mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-100">
                    <Lightbulb size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-900 font-bold text-lg ml-3">Key Insights</Text>
                </View>
                {aiAnalysis.keyInsights.map((insight: string, index: number) => (
                  <View key={index} className="flex-row mb-3">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                      style={{ backgroundColor: "#DBEAFE" }}
                    >
                      <Text className="text-blue-600 font-semibold text-xs">{index + 1}</Text>
                    </View>
                    <Text className="text-gray-700 flex-1 ml-3 leading-6">{insight}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Trends */}
            {aiAnalysis.trends && aiAnalysis.trends.length > 0 && (
              <View
                className="bg-white rounded-2xl p-5 mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full items-center justify-center bg-purple-100">
                    <TrendingUp size={20} color="#8B5CF6" />
                  </View>
                  <Text className="text-gray-900 font-bold text-lg ml-3">Trends & Patterns</Text>
                </View>
                {aiAnalysis.trends.map((trend: string, index: number) => (
                  <View key={index} className="flex-row mb-3">
                    <TrendingUp size={18} color="#8B5CF6" style={{ marginTop: 2 }} />
                    <Text className="text-gray-700 flex-1 ml-3 leading-6">{trend}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <View
                className="bg-white rounded-2xl p-5 mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full items-center justify-center bg-green-100">
                    <Target size={20} color="#10B981" />
                  </View>
                  <Text className="text-gray-900 font-bold text-lg ml-3">Recommendations</Text>
                </View>
                {aiAnalysis.recommendations.map((rec: string, index: number) => (
                  <View key={index} className="flex-row mb-3">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                      style={{ backgroundColor: "#D1FAE5" }}
                    >
                      <Text className="text-green-600 font-semibold text-xs">{index + 1}</Text>
                    </View>
                    <Text className="text-gray-700 flex-1 ml-3 leading-6">{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Report Metadata */}
        <View
          className="bg-white rounded-2xl p-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-gray-900 font-bold text-lg mb-3">Report Details</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Report Type</Text>
              <Text className="text-gray-900 font-medium capitalize">{report.reportType.replace("_", " ")}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Generated</Text>
              <Text className="text-gray-900 font-medium">{new Date(report.createdAt).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Status</Text>
              <Text className="text-green-600 font-medium capitalize">{report.status}</Text>
            </View>
            {report.description && (
              <View className="py-2">
                <Text className="text-gray-600 mb-1">Description</Text>
                <Text className="text-gray-900">{report.description}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportDetailScreen;
