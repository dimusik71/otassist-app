import React from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Users,
  ClipboardList,
  DollarSign,
  FileText,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react-native";
import type { RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import type { GetDashboardStatsResponse } from "@/shared/contracts";
import { useSession } from "@/lib/useSession";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<GetDashboardStatsResponse>("/api/dashboard/stats"),
    enabled: !!session,
    refetchInterval: 60000, // Refresh every minute
  });

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-gray-900 mb-2">Dashboard</Text>
          <Text className="text-gray-600 text-center mb-6">Please log in to view your dashboard</Text>
          <Pressable
            onPress={() => navigation.navigate("LoginModalScreen")}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  if (error || !data?.stats) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-red-600 text-center mt-4">Failed to load dashboard</Text>
        </View>
      </View>
    );
  }

  const stats = data.stats;
  const alertCount =
    stats.alerts.overdueInvoices +
    stats.alerts.expiringDocuments +
    stats.alerts.pendingAssessments;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <Text className="text-3xl font-bold text-white mb-2">Dashboard</Text>
        <Text style={{ color: "#DBEAFE" }}>Your practice at a glance</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Alerts Section */}
        {alertCount > 0 && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <AlertCircle size={20} color="#DC2626" />
              <Text className="text-red-900 font-bold ml-2 text-lg">
                {alertCount} Alert{alertCount !== 1 ? "s" : ""}
              </Text>
            </View>
            {stats.alerts.overdueInvoices > 0 && (
              <Text className="text-red-800 mb-1">
                • {stats.alerts.overdueInvoices} overdue invoice{stats.alerts.overdueInvoices !== 1 ? "s" : ""}
              </Text>
            )}
            {stats.alerts.expiringDocuments > 0 && (
              <Text className="text-red-800 mb-1">
                • {stats.alerts.expiringDocuments} document{stats.alerts.expiringDocuments !== 1 ? "s" : ""} expiring soon
              </Text>
            )}
            {stats.alerts.pendingAssessments > 0 && (
              <Text className="text-red-800">
                • {stats.alerts.pendingAssessments} pending assessment{stats.alerts.pendingAssessments !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
        )}

        {/* Revenue Overview */}
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-3">
            <View style={{ width: 40, height: 40, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 20 }} className="items-center justify-center">
              <TrendingUp size={22} color="white" />
            </View>
            <Text className="text-white font-bold text-xl ml-3">Revenue Overview</Text>
          </View>
          <Text className="text-white text-5xl font-bold mb-1">
            ${stats.invoices.totalRevenue.toLocaleString()}
          </Text>
          <Text style={{ color: "rgba(255, 255, 255, 0.8)" }} className="text-sm mb-4">
            Total Revenue
          </Text>
          <View className="flex-row justify-between mt-2">
            <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 12, padding: 16, marginRight: 8 }}>
              <Text style={{ color: "rgba(255, 255, 255, 0.9)" }} className="text-xs font-semibold mb-1">
                PAID
              </Text>
              <Text className="text-white font-bold text-2xl">
                ${stats.invoices.paidRevenue.toLocaleString()}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 12, padding: 16, marginLeft: 8 }}>
              <Text style={{ color: "rgba(255, 255, 255, 0.9)" }} className="text-xs font-semibold mb-1">
                PENDING
              </Text>
              <Text className="text-white font-bold text-2xl">
                ${stats.invoices.pendingRevenue.toLocaleString()}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          {/* Clients */}
          <Pressable
            onPress={() => navigation.navigate("Tabs", { screen: "ClientsTab" })}
            className="bg-white rounded-2xl p-5 mb-3 active:opacity-80"
            style={{ width: "48%", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
              <Users size={24} color="#3B82F6" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {stats.clients.total}
            </Text>
            <Text className="text-gray-600">Clients</Text>
          </Pressable>

          {/* Assessments */}
          <Pressable
            onPress={() => navigation.navigate("Tabs", { screen: "AssessmentsTab" })}
            className="bg-white rounded-2xl p-5 mb-3 active:opacity-80"
            style={{ width: "48%", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
          >
            <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-3">
              <ClipboardList size={24} color="#8B5CF6" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {stats.assessments.total}
            </Text>
            <Text className="text-gray-600">Assessments</Text>
            <View className="flex-row mt-2">
              <Text className="text-xs text-gray-500 mr-3">
                {stats.assessments.pending} pending
              </Text>
              <Text className="text-xs text-gray-500">
                {stats.assessments.completed} done
              </Text>
            </View>
          </Pressable>

          {/* Invoices */}
          <Pressable
            onPress={() => navigation.navigate("BusinessDocuments")}
            className="bg-white rounded-2xl p-5 mb-3 active:opacity-80"
            style={{ width: "48%", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
          >
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-3">
              <DollarSign size={24} color="#10B981" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {stats.invoices.total}
            </Text>
            <Text className="text-gray-600">Invoices</Text>
            <View className="flex-row mt-2">
              <Text className="text-xs text-green-600 mr-3">
                {stats.invoices.paid} paid
              </Text>
              {stats.invoices.overdue > 0 && (
                <Text className="text-xs text-red-600">
                  {stats.invoices.overdue} overdue
                </Text>
              )}
            </View>
          </Pressable>

          {/* Equipment */}
          <Pressable
            onPress={() => navigation.navigate("Tabs", { screen: "EquipmentTab" })}
            className="bg-white rounded-2xl p-5 mb-3 active:opacity-80"
            style={{ width: "48%", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
          >
            <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-3">
              <FileText size={24} color="#F97316" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {stats.equipment.total}
            </Text>
            <Text className="text-gray-600">Equipment Items</Text>
          </Pressable>
        </View>

        {/* Upcoming Tasks */}
        {stats.upcomingTasks.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-4"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
          >
            <View className="flex-row items-center mb-4">
              <Clock size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Upcoming Tasks</Text>
            </View>
            {stats.upcomingTasks.map((task) => (
              <Pressable
                key={task.id}
                onPress={() => navigation.navigate("AssessmentDetail", { assessmentId: task.id })}
                className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0 active:opacity-70"
              >
                <Text className="text-gray-900 font-semibold">{task.clientName}</Text>
                <Text className="text-gray-600 text-sm capitalize">
                  {task.type.replace("_", " ")} - {task.status}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {new Date(task.date).toLocaleDateString()}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View className="bg-white rounded-2xl p-5 mb-4"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
        >
          <View className="flex-row items-center mb-4">
            <Calendar size={20} color="#8B5CF6" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Recent Activity</Text>
          </View>
          {stats.assessments.recent.slice(0, 5).map((assessment) => (
            <Pressable
              key={assessment.id}
              onPress={() => navigation.navigate("AssessmentDetail", { assessmentId: assessment.id })}
              className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0 active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">{assessment.clientName}</Text>
                  <Text className="text-gray-600 text-sm capitalize">
                    {assessment.type.replace("_", " ")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {assessment.status === "completed" ? (
                    <CheckCircle size={16} color="#10B981" />
                  ) : (
                    <Clock size={16} color="#F59E0B" />
                  )}
                  <Text className={`text-xs ml-1 capitalize ${assessment.status === "completed" ? "text-green-600" : "text-amber-600"}`}>
                    {assessment.status}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Expiring Documents */}
        {stats.alerts.documents.length > 0 && (
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-5"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
          >
            <View className="flex-row items-center mb-4">
              <AlertCircle size={20} color="#F59E0B" />
              <Text className="text-lg font-bold text-amber-900 ml-2">Documents Expiring Soon</Text>
            </View>
            {stats.alerts.documents.map((doc) => (
              <View key={doc.id} className="border-b border-amber-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                <Text className="text-amber-900 font-semibold">{doc.title}</Text>
                <Text className="text-amber-700 text-sm capitalize">
                  {doc.type.replace("_", " ")}
                </Text>
                {doc.expiryDate && (
                  <Text className="text-amber-600 text-xs mt-1">
                    Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
            <Pressable
              onPress={() => navigation.navigate("BusinessDocuments")}
              className="bg-amber-600 rounded-xl py-3 items-center mt-3 active:opacity-80"
            >
              <Text className="text-white font-bold">Manage Documents</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
