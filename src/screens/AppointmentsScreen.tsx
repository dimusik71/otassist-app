import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  User,
  Phone,
  Home,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react-native";
import type { RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import type { GetAppointmentsResponse, Appointment } from "@/shared/contracts";
import { useSession } from "@/lib/useSession";
import CreateEditAppointmentModal from "@/components/CreateEditAppointmentModal";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AppointmentsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api.get<GetAppointmentsResponse>("/api/appointments"),
    enabled: !!session,
  });

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    if (!data?.appointments) return new Map<string, Appointment[]>();

    const groups = new Map<string, Appointment[]>();

    data.appointments.forEach((apt) => {
      const date = new Date(apt.startTime).toDateString();
      const existing = groups.get(date) || [];
      groups.set(date, [...existing, apt]);
    });

    // Sort appointments within each group by start time
    groups.forEach((appointments, date) => {
      appointments.sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    return groups;
  }, [data?.appointments]);

  // Get sorted dates
  const sortedDates = useMemo(() => {
    return Array.from(groupedAppointments.keys()).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );
  }, [groupedAppointments]);

  // Get upcoming appointments (future only)
  const upcomingAppointments = useMemo(() => {
    if (!data?.appointments) return [];
    const now = new Date();
    return data.appointments
      .filter(apt => new Date(apt.startTime) >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [data?.appointments]);

  // Get status icon and color
  const getStatusDisplay = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return { icon: Clock, color: "#F59E0B", text: "Scheduled" };
      case "confirmed":
        return { icon: CheckCircle, color: "#10B981", text: "Confirmed" };
      case "cancelled":
        return { icon: XCircle, color: "#EF4444", text: "Cancelled" };
      case "completed":
        return { icon: CheckCircle, color: "#6B7280", text: "Completed" };
      case "no_show":
        return { icon: AlertCircle, color: "#EF4444", text: "No Show" };
      default:
        return { icon: Clock, color: "#6B7280", text: status };
    }
  };

  // Get appointment type icon
  const getTypeIcon = (type: Appointment["appointmentType"]) => {
    switch (type) {
      case "assessment":
        return Calendar;
      case "home_visit":
        return Home;
      case "phone_call":
        return Phone;
      case "consultation":
        return MessageSquare;
      default:
        return Calendar;
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-gray-900 mb-2">Appointments</Text>
          <Text className="text-gray-600 text-center mb-6">Please log in to view your appointments</Text>
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
          <Text className="text-gray-600 mt-4">Loading appointments...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-red-600 text-center mt-4">Failed to load appointments</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={["#8B5CF6", "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-3xl font-bold text-white">Calendar</Text>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="bg-white px-4 py-2 rounded-xl flex-row items-center active:opacity-80"
          >
            <Plus size={20} color="#8B5CF6" />
            <Text className="text-purple-600 font-semibold ml-2">New</Text>
          </Pressable>
        </View>
        <Text style={{ color: "#E9D5FF" }}>Manage your appointments</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor="#8B5CF6" />
        }
      >
        {/* Stats Cards */}
        <View className="flex-row mb-4">
          <View
            className="bg-white rounded-2xl p-4 mr-2"
            style={{
              flex: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text className="text-gray-600 text-sm mb-1">Total</Text>
            <Text className="text-2xl font-bold text-gray-900">{data?.appointments?.length || 0}</Text>
          </View>
          <View
            className="bg-white rounded-2xl p-4 ml-2"
            style={{
              flex: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text className="text-gray-600 text-sm mb-1">Upcoming</Text>
            <Text className="text-2xl font-bold text-purple-600">{upcomingAppointments.length}</Text>
          </View>
        </View>

        {/* No appointments */}
        {(!data?.appointments || data.appointments.length === 0) && (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Calendar size={64} color="#D1D5DB" />
            <Text className="text-gray-900 font-semibold text-lg mt-4 mb-2">No Appointments Yet</Text>
            <Text className="text-gray-600 text-center mb-6">
              Create your first appointment to get started
            </Text>
            <Pressable
              onPress={() => setShowCreateModal(true)}
              className="bg-purple-600 px-6 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-white font-semibold">Create Appointment</Text>
            </Pressable>
          </View>
        )}

        {/* Appointments grouped by date */}
        {sortedDates.map((dateString) => {
          const appointments = groupedAppointments.get(dateString) || [];
          const isPast = new Date(dateString) < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <View key={dateString} className="mb-6">
              {/* Date Header */}
              <View className="flex-row items-center mb-3">
                <Text className="text-lg font-bold text-gray-900">{formatDate(dateString)}</Text>
                <View className="flex-1 h-px bg-gray-200 ml-3" />
                {isPast && (
                  <Text className="text-xs text-gray-500 ml-2">Past</Text>
                )}
              </View>

              {/* Appointments for this date */}
              {appointments.map((appointment) => {
                const StatusIcon = getStatusDisplay(appointment.status).icon;
                const statusColor = getStatusDisplay(appointment.status).color;
                const TypeIcon = getTypeIcon(appointment.appointmentType);

                return (
                  <Pressable
                    key={appointment.id}
                    onPress={() => {
                      // TODO: Navigate to appointment detail screen
                      console.log("View appointment:", appointment.id);
                    }}
                    className="bg-white rounded-2xl p-4 mb-3 active:opacity-70"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    {/* Time and Status */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <Clock size={16} color="#6B7280" />
                        <Text className="text-gray-900 font-semibold ml-2">
                          {appointment.isAllDay
                            ? "All Day"
                            : `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <StatusIcon size={14} color={statusColor} />
                        <Text className="text-xs ml-1" style={{ color: statusColor }}>
                          {getStatusDisplay(appointment.status).text}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text className="text-gray-900 font-bold text-lg mb-2">{appointment.title}</Text>

                    {/* Type */}
                    <View className="flex-row items-center mb-2">
                      <TypeIcon size={14} color="#8B5CF6" />
                      <Text className="text-purple-600 text-sm ml-2 capitalize">
                        {appointment.appointmentType.replace("_", " ")}
                      </Text>
                    </View>

                    {/* Client */}
                    {appointment.client && (
                      <Pressable
                        onPress={() => navigation.navigate("ClientDetail", { clientId: appointment.client!.id })}
                        className="flex-row items-center mb-2 active:opacity-70"
                      >
                        <User size={14} color="#3B82F6" />
                        <Text className="text-blue-600 text-sm ml-2">{appointment.client.name}</Text>
                      </Pressable>
                    )}

                    {/* Location */}
                    {appointment.location && (
                      <View className="flex-row items-center mb-2">
                        <MapPin size={14} color="#6B7280" />
                        <Text className="text-gray-600 text-sm ml-2">{appointment.location}</Text>
                      </View>
                    )}

                    {/* Description */}
                    {appointment.description && (
                      <Text className="text-gray-600 text-sm mt-2" numberOfLines={2}>
                        {appointment.description}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {/* Create/Edit Appointment Modal */}
      <CreateEditAppointmentModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </View>
  );
};

export default AppointmentsScreen;
