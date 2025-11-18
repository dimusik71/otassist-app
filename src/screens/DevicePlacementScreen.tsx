import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Home,
  MapPin,
  Box,
  Shield,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { api } from "../lib/api";

type Props = NativeStackScreenProps<RootStackParamList, "DevicePlacement">;

interface Room {
  id: string;
  name: string;
  roomType: string;
  floor: number;
}

interface Area {
  id: string;
  name: string;
  areaType: string;
}

interface IoTDevice {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
}

interface DevicePlacement {
  id: string;
  deviceId: string;
  roomId?: string;
  areaId?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  notes?: string;
  device: IoTDevice;
  room?: Room;
  area?: Area;
}

export default function DevicePlacementScreen({ navigation, route }: Props) {
  const { houseMapId, assessmentId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [placements, setPlacements] = useState<DevicePlacement[]>([]);
  const [showPlacementForm, setShowPlacementForm] = useState(false);

  // Form state
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [placementNotes, setPlacementNotes] = useState("");

  useEffect(() => {
    loadData();
  }, [houseMapId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load house map with rooms and areas
      const mapResponse = (await api.get(`/api/house-maps/${houseMapId}`)) as any;
      setRooms(mapResponse.houseMap?.rooms || []);
      setAreas(mapResponse.houseMap?.areas || []);
      setPlacements(mapResponse.houseMap?.devicePlacements || []);

      // Load IoT devices
      const devicesResponse = (await api.get("/api/iot-devices")) as any;
      setDevices(devicesResponse.devices || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      Alert.alert("Error", error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlacement = async () => {
    if (!selectedDevice) {
      Alert.alert("Error", "Please select a device");
      return;
    }

    if (!selectedRoom && !selectedArea) {
      Alert.alert("Error", "Please select a room or area");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/api/house-maps/${houseMapId}/device-placements`, {
        deviceId: selectedDevice,
        roomId: selectedRoom || undefined,
        areaId: selectedArea || undefined,
        notes: placementNotes || undefined,
      });

      // Reset form
      setSelectedDevice("");
      setSelectedRoom("");
      setSelectedArea("");
      setPlacementNotes("");
      setShowPlacementForm(false);

      // Reload placements
      await loadData();
      Alert.alert("Success", "Device placed successfully!");
    } catch (error: any) {
      console.error("Error adding placement:", error);
      Alert.alert("Error", error.message || "Failed to place device");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlacement = async (placementId: string) => {
    Alert.alert("Delete Placement", "Remove this device from the property?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/device-placements/${placementId}`);
            await loadData();
            Alert.alert("Success", "Device placement removed!");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete placement");
          }
        },
      },
    ]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "safety":
        return "#EF4444";
      case "security":
        return "#3B82F6";
      case "accessibility":
        return "#8B5CF6";
      case "lighting":
        return "#F59E0B";
      case "climate":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={["top"]} className="bg-purple-700">
          <LinearGradient colors={["#7C3AED", "#A855F7"]} className="px-6 py-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-3xl font-bold">Device Placement</Text>
          </LinearGradient>
        </SafeAreaView>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={["top"]} className="bg-purple-700">
        <LinearGradient colors={["#7C3AED", "#A855F7"]} className="px-6 py-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">Device Placement</Text>
          <Text className="text-purple-100 text-sm mt-1">
            3D map of IoT devices in property
          </Text>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Summary Card */}
          <View className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">Property Summary</Text>
            <View className="flex-row flex-wrap gap-4">
              <View className="flex-row items-center">
                <Home color="#7C3AED" size={20} />
                <Text className="text-gray-700 ml-2">
                  {rooms.length} Room{rooms.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MapPin color="#7C3AED" size={20} />
                <Text className="text-gray-700 ml-2">
                  {areas.length} Area{areas.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Shield color="#7C3AED" size={20} />
                <Text className="text-gray-700 ml-2">
                  {placements.length} Device{placements.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Add Device Button */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Placed Devices</Text>
            <TouchableOpacity
              onPress={() => setShowPlacementForm(!showPlacementForm)}
              className="bg-purple-700 rounded-lg px-4 py-2 flex-row items-center"
            >
              <Plus color="#fff" size={16} />
              <Text className="text-white font-semibold ml-2">Place Device</Text>
            </TouchableOpacity>
          </View>

          {/* Placement Form */}
          {showPlacementForm && (
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Select Device</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row gap-2">
                  {devices.map((device) => (
                    <TouchableOpacity
                      key={device.id}
                      onPress={() => setSelectedDevice(device.id)}
                      className={`px-4 py-3 rounded-lg border-2 ${
                        selectedDevice === device.id
                          ? "bg-purple-700 border-purple-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedDevice === device.id ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {device.name}
                      </Text>
                      <Text
                        className={`text-xs ${
                          selectedDevice === device.id ? "text-purple-100" : "text-gray-500"
                        }`}
                      >
                        {device.category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text className="text-sm font-semibold text-gray-700 mb-2">Select Room</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row gap-2">
                  {rooms.map((room) => (
                    <TouchableOpacity
                      key={room.id}
                      onPress={() => {
                        setSelectedRoom(room.id);
                        setSelectedArea("");
                      }}
                      className={`px-4 py-3 rounded-lg border-2 ${
                        selectedRoom === room.id
                          ? "bg-teal-600 border-teal-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedRoom === room.id ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {room.name}
                      </Text>
                      <Text
                        className={`text-xs ${
                          selectedRoom === room.id ? "text-teal-100" : "text-gray-500"
                        }`}
                      >
                        Floor {room.floor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Or Select Outdoor Area
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row gap-2">
                  {areas.map((area) => (
                    <TouchableOpacity
                      key={area.id}
                      onPress={() => {
                        setSelectedArea(area.id);
                        setSelectedRoom("");
                      }}
                      className={`px-4 py-3 rounded-lg border-2 ${
                        selectedArea === area.id
                          ? "bg-orange-600 border-orange-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedArea === area.id ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {area.name}
                      </Text>
                      <Text
                        className={`text-xs ${
                          selectedArea === area.id ? "text-orange-100" : "text-gray-500"
                        }`}
                      >
                        {area.areaType}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4"
                value={placementNotes}
                onChangeText={setPlacementNotes}
                placeholder="e.g., Mount on ceiling near entrance"
                multiline
                numberOfLines={2}
              />

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleAddPlacement}
                  disabled={saving}
                  className="flex-1 bg-purple-700 rounded-lg py-3 items-center"
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">Place Device</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowPlacementForm(false);
                    setSelectedDevice("");
                    setSelectedRoom("");
                    setSelectedArea("");
                    setPlacementNotes("");
                  }}
                  className="bg-gray-300 rounded-lg px-6 py-3"
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Placements List */}
          {placements.length === 0 && !showPlacementForm ? (
            <View className="py-12 items-center">
              <Box color="#9CA3AF" size={64} />
              <Text className="text-gray-500 text-center mt-4 mb-2 text-lg font-semibold">
                No devices placed yet
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                Place IoT devices in rooms and outdoor areas to create your 3D map
              </Text>
              <TouchableOpacity
                onPress={() => setShowPlacementForm(true)}
                className="bg-purple-700 rounded-lg px-6 py-3 flex-row items-center"
              >
                <Plus color="#fff" size={20} />
                <Text className="text-white font-semibold ml-2">Place First Device</Text>
              </TouchableOpacity>
            </View>
          ) : (
            placements.map((placement) => (
              <View
                key={placement.id}
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
                    style={{
                      backgroundColor: `${getCategoryColor(placement.device.category)}20`,
                    }}
                  >
                    <Shield
                      size={24}
                      color={getCategoryColor(placement.device.category)}
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-bold text-gray-800">
                      {placement.device.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {placement.device.manufacturer}
                    </Text>
                    <View
                      className="px-2 py-1 rounded mt-1 self-start"
                      style={{
                        backgroundColor: `${getCategoryColor(placement.device.category)}20`,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: getCategoryColor(placement.device.category) }}
                      >
                        {placement.device.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeletePlacement(placement.id)}
                    className="p-2"
                  >
                    <Trash2 color="#EF4444" size={20} />
                  </TouchableOpacity>
                </View>

                <View className="bg-gray-50 rounded-lg p-3">
                  <View className="flex-row items-center mb-1">
                    <MapPin color="#6B7280" size={16} />
                    <Text className="text-sm font-semibold text-gray-700 ml-2">Location</Text>
                  </View>
                  {placement.room && (
                    <Text className="text-sm text-gray-600 ml-6">
                      {placement.room.name} (Floor {placement.room.floor})
                    </Text>
                  )}
                  {placement.area && (
                    <Text className="text-sm text-gray-600 ml-6">
                      {placement.area.name} ({placement.area.areaType})
                    </Text>
                  )}
                  {placement.notes && (
                    <Text className="text-sm text-gray-500 ml-6 mt-1 italic">
                      {placement.notes}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
