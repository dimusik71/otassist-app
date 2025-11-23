import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useNavigation, RouteProp as RNRouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Navigation,
  Clock,
  MapPin,
  Route as RouteIcon,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Loader2,
} from "lucide-react-native";
import type { RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import type {
  GetAppointmentsByDateResponse,
  OptimizeRouteResponse,
  OptimizeRouteRequest,
} from "@/shared/contracts";

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = RNRouteProp<RootStackParamList, "RouteOptimization">;

const RouteOptimizationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { date } = route.params;

  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<
    OptimizeRouteResponse["optimizedRoute"] | null
  >(null);

  // Fetch appointments for the selected date
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments-by-date", date],
    queryFn: () =>
      api.get<GetAppointmentsByDateResponse>(
        `/api/route-optimization/appointments/${date}`
      ),
  });

  // Optimize route mutation
  const optimizeMutation = useMutation({
    mutationFn: (data: OptimizeRouteRequest) =>
      api.post<OptimizeRouteResponse>("/api/route-optimization/optimize", data),
    onSuccess: (response) => {
      setOptimizedRoute(response.optimizedRoute);
      Alert.alert("Success", "Route optimized successfully!");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to optimize route"
      );
    },
  });

  const appointments = appointmentsData?.appointments || [];
  const appointmentsWithLocation = appointments.filter((apt) => apt.hasLocation);

  const toggleAppointment = (id: string) => {
    setSelectedAppointments((prev) =>
      prev.includes(id) ? prev.filter((aptId) => aptId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedAppointments(appointmentsWithLocation.map((apt) => apt.id));
  };

  const deselectAll = () => {
    setSelectedAppointments([]);
  };

  const handleOptimizeRoute = () => {
    if (selectedAppointments.length === 0) {
      Alert.alert("No Selection", "Please select at least one appointment");
      return;
    }

    optimizeMutation.mutate({
      appointmentIds: selectedAppointments,
    });
  };

  const openInAppleMaps = (appleMapUrl: string) => {
    Linking.openURL(appleMapUrl).catch((err) => {
      console.error("Failed to open Apple Maps:", err);
      Alert.alert("Error", "Failed to open Apple Maps");
    });
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
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
            <Text className="text-3xl font-bold text-white">Route Optimization</Text>
          </View>
        </View>
        <View className="flex-row items-center ml-12">
          <Calendar size={14} color="rgba(255, 255, 255, 0.8)" />
          <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, marginLeft: 6 }}>
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Stats Card */}
        {appointmentsWithLocation.length > 0 && (
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
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-600 text-sm">Total Appointments</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {appointmentsWithLocation.length}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 text-sm">Selected</Text>
                <Text className="text-2xl font-bold text-blue-600">
                  {selectedAppointments.length}
                </Text>
              </View>
            </View>

            <View className="flex-row mt-4 space-x-2">
              <Pressable
                onPress={selectAll}
                className="flex-1 bg-blue-50 rounded-xl p-3 active:opacity-70"
              >
                <Text className="text-blue-600 font-semibold text-center">Select All</Text>
              </Pressable>
              <Pressable
                onPress={deselectAll}
                className="flex-1 bg-gray-100 rounded-xl p-3 active:opacity-70"
              >
                <Text className="text-gray-700 font-semibold text-center">Clear</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Appointments List */}
        {appointmentsWithLocation.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <MapPin size={64} color="#D1D5DB" />
            <Text className="text-gray-600 text-center mt-4">
              No appointments with location data found for this date
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-lg font-bold text-gray-900 mb-3">Select Appointments</Text>
            {appointmentsWithLocation.map((apt) => {
              const isSelected = selectedAppointments.includes(apt.id);
              return (
                <Pressable
                  key={apt.id}
                  onPress={() => toggleAppointment(apt.id)}
                  className="bg-white rounded-2xl p-4 mb-3 active:opacity-70"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? "#3B82F6" : "transparent",
                  }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-gray-900 font-semibold text-base mb-1">
                        {apt.title}
                      </Text>
                      {apt.clientName && (
                        <Text className="text-gray-600 text-sm mb-2">{apt.clientName}</Text>
                      )}
                      <View className="flex-row items-center mb-1">
                        <Clock size={14} color="#6B7280" />
                        <Text className="text-gray-600 text-sm ml-1">
                          {new Date(apt.startTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      {apt.address && (
                        <View className="flex-row items-center">
                          <MapPin size={14} color="#6B7280" />
                          <Text className="text-gray-600 text-sm ml-1 flex-1">
                            {apt.address}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center ${
                        isSelected ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={16} color="white" />}
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {/* Optimize Button */}
            <Pressable
              onPress={handleOptimizeRoute}
              disabled={selectedAppointments.length === 0 || optimizeMutation.isPending}
              className={`rounded-2xl p-5 mt-4 flex-row items-center justify-center active:opacity-70 ${
                selectedAppointments.length === 0 ? "bg-gray-300" : "bg-blue-600"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {optimizeMutation.isPending ? (
                <>
                  <Loader2 size={24} color="white" />
                  <Text className="text-white font-bold text-lg ml-2">Optimizing...</Text>
                </>
              ) : (
                <>
                  <RouteIcon size={24} color="white" />
                  <Text className="text-white font-bold text-lg ml-2">Optimize Route</Text>
                </>
              )}
            </Pressable>
          </>
        )}

        {/* Optimized Route Results */}
        {optimizedRoute && (
          <View className="mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Optimized Route</Text>

            {/* Route Summary */}
            <View
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 mb-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 12 }}>
                    Total Distance
                  </Text>
                  <Text className="text-white font-bold text-2xl">
                    {optimizedRoute.totalDistance.toFixed(1)} km
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: 12,
                      textAlign: "right",
                    }}
                  >
                    Total Time
                  </Text>
                  <Text className="text-white font-bold text-2xl text-right">
                    {Math.floor(optimizedRoute.totalEstimatedDuration / 60)}h{" "}
                    {optimizedRoute.totalEstimatedDuration % 60}m
                  </Text>
                </View>
              </View>
              <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 13 }}>
                {optimizedRoute.optimizationNotes}
              </Text>
            </View>

            {/* Route Steps */}
            {optimizedRoute.route.map((step, index) => (
              <View
                key={step.appointmentId}
                className="bg-white rounded-2xl p-4 mb-3"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-start mb-3">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: "#DBEAFE" }}
                  >
                    <Text className="text-blue-600 font-bold">{step.order}</Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-semibold text-base mb-1">
                      {step.title}
                    </Text>
                    <Text className="text-gray-600 text-sm mb-2">{step.clientName}</Text>
                    <View className="flex-row items-center mb-1">
                      <Clock size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {new Date(step.startTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-1 flex-1">{step.address}</Text>
                    </View>
                  </View>
                </View>

                {index > 0 && (
                  <View className="bg-blue-50 rounded-xl p-3 mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <TrendingUp size={16} color="#3B82F6" />
                        <Text className="text-blue-600 font-semibold ml-2">
                          {step.estimatedDistance.toFixed(1)} km
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Clock size={16} color="#3B82F6" />
                        <Text className="text-blue-600 font-semibold ml-2">
                          {step.estimatedTravelTime} min
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-700 text-sm">{step.directions}</Text>
                  </View>
                )}

                <Pressable
                  onPress={() => openInAppleMaps(step.appleMapUrl)}
                  className="bg-blue-600 rounded-xl p-3 flex-row items-center justify-center active:opacity-70"
                >
                  <Navigation size={18} color="white" />
                  <Text className="text-white font-semibold ml-2">Navigate in Apple Maps</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RouteOptimizationScreen;
