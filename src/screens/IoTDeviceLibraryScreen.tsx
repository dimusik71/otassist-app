import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Plus,
  Shield,
  Home,
  Bell,
  Lightbulb,
  Thermometer,
  MapPin,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { api } from "../lib/api";

type Props = NativeStackScreenProps<RootStackParamList, "IoTDeviceLibrary">;

interface IoTDevice {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  description?: string;
  technicalSpecs?: string;
  placementRules?: string;
  installationCost?: number;
  monthlySubscription?: number;
  governmentApproved: boolean;
  governmentReference?: string;
}

export default function IoTDeviceLibraryScreen({ navigation, route }: Props) {
  const { houseMapId, assessmentId } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All", icon: Home },
    { id: "safety", label: "Safety", icon: Shield },
    { id: "security", label: "Security", icon: Bell },
    { id: "accessibility", label: "Accessibility", icon: MapPin },
    { id: "lighting", label: "Lighting", icon: Lightbulb },
    { id: "climate", label: "Climate", icon: Thermometer },
  ];

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = (await api.get("/api/iot-devices")) as any;
      setDevices(response.devices || []);
    } catch (error: any) {
      console.error("Error loading IoT devices:", error);
      Alert.alert("Error", error.message || "Failed to load IoT devices");
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices =
    selectedCategory === "all"
      ? devices
      : devices.filter((d) => d.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "safety":
        return "#EF4444"; // red-500
      case "security":
        return "#3B82F6"; // blue-500
      case "accessibility":
        return "#8B5CF6"; // purple-500
      case "lighting":
        return "#F59E0B"; // amber-500
      case "climate":
        return "#10B981"; // emerald-500
      default:
        return "#6B7280"; // gray-500
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <LinearGradient
          colors={["#7C3AED", "#A855F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 32 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">IoT Device Library</Text>
        </LinearGradient>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <LinearGradient
        colors={["#7C3AED", "#A855F7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 32 }}
      >
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">IoT Device Library</Text>
          <Text className="text-purple-100 text-sm mt-1">
            Select devices to place in your property
          </Text>
        </LinearGradient>

      <ScrollView className="flex-1">
        {/* Category Filter */}
        <View className="p-6 pb-0">
          <Text className="text-lg font-bold text-gray-800 mb-3">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    className={`flex-row items-center px-4 py-2 rounded-lg ${
                      selectedCategory === cat.id ? "bg-purple-700" : "bg-gray-200"
                    }`}
                  >
                    <Icon
                      size={16}
                      color={selectedCategory === cat.id ? "#fff" : "#374151"}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        selectedCategory === cat.id ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Device List */}
        <View className="p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">
              {filteredDevices.length} Device{filteredDevices.length !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DevicePlacement", { houseMapId, assessmentId })
              }
              className="bg-purple-700 rounded-lg px-4 py-2 flex-row items-center"
            >
              <MapPin color="#fff" size={16} />
              <Text className="text-white font-semibold ml-2">View Placements</Text>
            </TouchableOpacity>
          </View>

          {filteredDevices.map((device) => (
            <View
              key={device.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 mb-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="flex-row items-start mb-3">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${getCategoryColor(device.category)}20` }}
                >
                  <Home size={24} color={getCategoryColor(device.category)} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-bold text-gray-800">{device.name}</Text>
                  <Text className="text-sm text-gray-600">{device.manufacturer}</Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: `${getCategoryColor(device.category)}20` }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: getCategoryColor(device.category) }}
                      >
                        {device.category.toUpperCase()}
                      </Text>
                    </View>
                    {device.governmentApproved && (
                      <View className="bg-emerald-100 px-2 py-1 rounded ml-2">
                        <Text className="text-xs font-semibold text-emerald-700">
                          GOVT APPROVED
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {device.description && (
                <Text className="text-sm text-gray-600 mb-3">{device.description}</Text>
              )}

              {((device.installationCost !== undefined && device.installationCost !== null) ||
                (device.monthlySubscription !== undefined && device.monthlySubscription !== null)) && (
                <View className="flex-row gap-4 mb-3">
                  {device.installationCost !== undefined &&
                   device.installationCost !== null &&
                   device.installationCost > 0 && (
                    <View>
                      <Text className="text-xs text-gray-500">Installation</Text>
                      <Text className="text-base font-bold text-gray-800">
                        ${device.installationCost.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {device.monthlySubscription !== undefined &&
                   device.monthlySubscription !== null &&
                   device.monthlySubscription > 0 && (
                    <View>
                      <Text className="text-xs text-gray-500">Monthly</Text>
                      <Text className="text-base font-bold text-gray-800">
                        ${device.monthlySubscription.toFixed(2)}/mo
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("DevicePlacement", {
                    houseMapId,
                    assessmentId,
                  })
                }
                className="bg-purple-700 rounded-lg py-3 items-center flex-row justify-center"
              >
                <Plus color="#fff" size={16} />
                <Text className="text-white font-semibold ml-2">Place in Property</Text>
              </TouchableOpacity>
            </View>
          ))}

          {filteredDevices.length === 0 && (
            <View className="py-12 items-center">
              <Text className="text-gray-500 text-center">
                No devices found in this category
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
