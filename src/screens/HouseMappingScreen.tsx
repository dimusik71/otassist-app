import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Home, Plus, Edit2, Trash2, MapPin, Video } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { api } from "../lib/api";

type Props = NativeStackScreenProps<RootStackParamList, "HouseMapping">;

export default function HouseMappingScreen({ navigation, route }: Props) {
  const { assessmentId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [houseMap, setHouseMap] = useState<any>(null);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editingArea, setEditingArea] = useState<any>(null);

  // House map form state
  const [propertyType, setPropertyType] = useState("single_family");
  const [floors, setFloors] = useState("1");
  const [totalArea, setTotalArea] = useState("");

  // Room form state
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("living");
  const [roomFloor, setRoomFloor] = useState("1");
  const [roomLength, setRoomLength] = useState("");
  const [roomWidth, setRoomWidth] = useState("");
  const [roomHeight, setRoomHeight] = useState("");

  // Area form state
  const [areaName, setAreaName] = useState("");
  const [areaType, setAreaType] = useState("outdoor");
  const [areaLength, setAreaLength] = useState("");
  const [areaWidth, setAreaWidth] = useState("");

  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showAreaForm, setShowAreaForm] = useState(false);

  useEffect(() => {
    loadHouseMap();
  }, [assessmentId]);

  const loadHouseMap = async () => {
    try {
      setLoading(true);
      // First, try to get existing house map
      const assessment = (await api.get(`/api/assessments/${assessmentId}`)) as any;
      if (assessment.assessment?.houseMap) {
        const mapData = (await api.get(
          `/api/house-maps/${assessment.assessment.houseMap.id}`
        )) as any;
        setHouseMap(mapData.houseMap);
      }
    } catch (error: any) {
      console.error("Error loading house map:", error);
    } finally {
      setLoading(false);
    }
  };

  const createHouseMap = async () => {
    try {
      setSaving(true);

      // Check if house map already exists
      if (houseMap) {
        Alert.alert("Info", "House map already exists for this assessment");
        return;
      }

      const response = await api.post(`/api/assessments/${assessmentId}/house-map`, {
        propertyType,
        floors: parseInt(floors, 10),
        totalArea: totalArea ? parseFloat(totalArea) : undefined,
      });

      // Reload to get full map data
      await loadHouseMap();
      Alert.alert("Success", "House map created successfully!");
    } catch (error: any) {
      console.error("Error creating house map:", error);

      // Check if it's a duplicate error
      if (error.message && error.message.includes("already exists")) {
        // House map exists, just reload it
        await loadHouseMap();
        Alert.alert("Info", "House map already exists. Loading existing map...");
      } else {
        Alert.alert("Error", error.message || "Failed to create house map");
      }
    } finally {
      setSaving(false);
    }
  };

  const addRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert("Error", "Please enter a room name");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/api/house-maps/${houseMap.id}/rooms`, {
        name: roomName,
        roomType,
        floor: parseInt(roomFloor, 10),
        length: roomLength ? parseFloat(roomLength) : undefined,
        width: roomWidth ? parseFloat(roomWidth) : undefined,
        height: roomHeight ? parseFloat(roomHeight) : undefined,
      });

      // Clear form and reload
      setRoomName("");
      setRoomLength("");
      setRoomWidth("");
      setRoomHeight("");
      setShowRoomForm(false);
      await loadHouseMap();
      Alert.alert("Success", "Room added successfully!");
    } catch (error: any) {
      console.error("Error adding room:", error);
      Alert.alert("Error", error.message || "Failed to add room");
    } finally {
      setSaving(false);
    }
  };

  const addArea = async () => {
    if (!areaName.trim()) {
      Alert.alert("Error", "Please enter an area name");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/api/house-maps/${houseMap.id}/areas`, {
        name: areaName,
        areaType,
        length: areaLength ? parseFloat(areaLength) : undefined,
        width: areaWidth ? parseFloat(areaWidth) : undefined,
      });

      // Clear form and reload
      setAreaName("");
      setAreaLength("");
      setAreaWidth("");
      setShowAreaForm(false);
      await loadHouseMap();
      Alert.alert("Success", "Area added successfully!");
    } catch (error: any) {
      console.error("Error adding area:", error);
      Alert.alert("Error", error.message || "Failed to add area");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    Alert.alert("Delete Room", "Are you sure you want to delete this room?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/rooms/${roomId}`);
            await loadHouseMap();
            Alert.alert("Success", "Room deleted successfully!");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete room");
          }
        },
      },
    ]);
  };

  const deleteArea = async (areaId: string) => {
    Alert.alert("Delete Area", "Are you sure you want to delete this area?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/areas/${areaId}`);
            await loadHouseMap();
            Alert.alert("Success", "Area deleted successfully!");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete area");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={["top"]} className="bg-blue-700">
          <LinearGradient colors={["#1E40AF", "#3B82F6"]} className="px-6 py-4">
            <Text className="text-white text-3xl font-bold">House Mapping</Text>
          </LinearGradient>
        </SafeAreaView>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1E40AF" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={["top"]} className="bg-blue-700">
        <LinearGradient colors={["#1E40AF", "#3B82F6"]} className="px-6 py-4">
          <Text className="text-white text-3xl font-bold">House Mapping</Text>
          <Text className="text-blue-100 text-sm mt-1">Create 3D property layout</Text>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView className="flex-1">
        {!houseMap ? (
          // Create House Map Form
          <View className="p-6">
            {/* Video Walkthrough Option */}
            <TouchableOpacity
              onPress={() => navigation.navigate("VideoWalkthrough", { assessmentId })}
              className="mb-6"
            >
              <LinearGradient
                colors={["#8B5CF6", "#EC4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-6"
              >
                <View className="flex-row items-center mb-3">
                  <Video color="#fff" size={32} />
                  <Text className="text-white text-xl font-bold ml-3">AI Video Walkthrough</Text>
                </View>
                <Text className="text-purple-100 mb-3">
                  Walk through the property with your camera and let AI guide you. Automatically
                  creates a 3D map with rooms and areas.
                </Text>
                <View className="bg-white/20 rounded-lg px-3 py-2 self-start">
                  <Text className="text-white text-xs font-semibold">✨ RECOMMENDED</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="text-gray-500 text-sm mx-4">OR</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <View className="bg-blue-50 rounded-2xl p-6 mb-6">
              <Home color="#1E40AF" size={32} />
              <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">
                Create Property Map
              </Text>
              <Text className="text-gray-600 mb-4">
                Start by creating a map of the property. You&apos;ll then add rooms and outdoor
                areas.
              </Text>

              <Text className="text-sm font-semibold text-gray-700 mb-2">Property Type</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {["single_family", "apartment", "condo", "townhouse"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setPropertyType(type)}
                    className={`px-4 py-2 rounded-lg ${
                      propertyType === type ? "bg-blue-700" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`${propertyType === type ? "text-white" : "text-gray-700"}`}
                    >
                      {type.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Number of Floors
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4"
                value={floors}
                onChangeText={setFloors}
                keyboardType="number-pad"
                placeholder="1"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Total Area (sq ft/m²) - Optional
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4"
                value={totalArea}
                onChangeText={setTotalArea}
                keyboardType="decimal-pad"
                placeholder="2000"
              />

              <TouchableOpacity
                onPress={createHouseMap}
                disabled={saving}
                className="bg-blue-700 rounded-lg py-4 items-center"
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">Create House Map</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // House Map with Rooms and Areas
          <View className="p-6">
            {/* Property Summary */}
            <View className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-2">Property Details</Text>
              <Text className="text-gray-600">
                Type: {houseMap.propertyType?.replace("_", " ") || "Not specified"}
              </Text>
              <Text className="text-gray-600">Floors: {houseMap.floors}</Text>
              {houseMap.totalArea && (
                <Text className="text-gray-600">Area: {houseMap.totalArea} sq ft/m²</Text>
              )}
              <Text className="text-gray-600 mt-2">
                Rooms: {houseMap.rooms?.length || 0} | Areas: {houseMap.areas?.length || 0}
              </Text>
            </View>

            {/* Rooms Section */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">Rooms</Text>
                <TouchableOpacity
                  onPress={() => setShowRoomForm(!showRoomForm)}
                  className="bg-teal-600 rounded-lg px-4 py-2 flex-row items-center"
                >
                  <Plus color="#fff" size={16} />
                  <Text className="text-white font-semibold ml-2">Add Room</Text>
                </TouchableOpacity>
              </View>

              {showRoomForm && (
                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-3"
                    value={roomName}
                    onChangeText={setRoomName}
                    placeholder="Room name (e.g., Living Room)"
                  />

                  <Text className="text-sm font-semibold text-gray-700 mb-2">Room Type</Text>
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {["bedroom", "bathroom", "kitchen", "living", "dining", "hallway"].map(
                      (type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => setRoomType(type)}
                          className={`px-3 py-2 rounded-lg ${
                            roomType === type ? "bg-teal-600" : "bg-gray-200"
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              roomType === type ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  <View className="flex-row gap-2 mb-3">
                    <TextInput
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2"
                      value={roomFloor}
                      onChangeText={setRoomFloor}
                      placeholder="Floor"
                      keyboardType="number-pad"
                    />
                    <TextInput
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2"
                      value={roomLength}
                      onChangeText={setRoomLength}
                      placeholder="Length (m/ft)"
                      keyboardType="decimal-pad"
                    />
                    <TextInput
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2"
                      value={roomWidth}
                      onChangeText={setRoomWidth}
                      placeholder="Width (m/ft)"
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={addRoom}
                      disabled={saving}
                      className="flex-1 bg-teal-600 rounded-lg py-3 items-center"
                    >
                      {saving ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white font-semibold">Save Room</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowRoomForm(false);
                        setRoomName("");
                      }}
                      className="bg-gray-300 rounded-lg px-4 py-3"
                    >
                      <Text className="text-gray-700 font-semibold">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {houseMap.rooms?.map((room: any) => (
                <View
                  key={room.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-800">{room.name}</Text>
                      <Text className="text-sm text-gray-600">
                        {room.roomType} • Floor {room.floor}
                      </Text>
                      {(room.length || room.width) && (
                        <Text className="text-sm text-gray-600">
                          {room.length && room.width
                            ? `${room.length} × ${room.width} m/ft`
                            : room.length
                            ? `L: ${room.length}`
                            : `W: ${room.width}`}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => deleteRoom(room.id)} className="p-2">
                      <Trash2 color="#EF4444" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {(!houseMap.rooms || houseMap.rooms.length === 0) && !showRoomForm && (
                <Text className="text-gray-500 text-center py-8">
                  No rooms added yet. Tap &quot;Add Room&quot; to get started.
                </Text>
              )}
            </View>

            {/* Areas Section */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">Outdoor Areas</Text>
                <TouchableOpacity
                  onPress={() => setShowAreaForm(!showAreaForm)}
                  className="bg-orange-600 rounded-lg px-4 py-2 flex-row items-center"
                >
                  <Plus color="#fff" size={16} />
                  <Text className="text-white font-semibold ml-2">Add Area</Text>
                </TouchableOpacity>
              </View>

              {showAreaForm && (
                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-3"
                    value={areaName}
                    onChangeText={setAreaName}
                    placeholder="Area name (e.g., Front Patio)"
                  />

                  <Text className="text-sm font-semibold text-gray-700 mb-2">Area Type</Text>
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {["outdoor", "garage", "patio", "deck", "yard", "driveway"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setAreaType(type)}
                        className={`px-3 py-2 rounded-lg ${
                          areaType === type ? "bg-orange-600" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            areaType === type ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View className="flex-row gap-2 mb-3">
                    <TextInput
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2"
                      value={areaLength}
                      onChangeText={setAreaLength}
                      placeholder="Length (m/ft)"
                      keyboardType="decimal-pad"
                    />
                    <TextInput
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2"
                      value={areaWidth}
                      onChangeText={setAreaWidth}
                      placeholder="Width (m/ft)"
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={addArea}
                      disabled={saving}
                      className="flex-1 bg-orange-600 rounded-lg py-3 items-center"
                    >
                      {saving ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white font-semibold">Save Area</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowAreaForm(false);
                        setAreaName("");
                      }}
                      className="bg-gray-300 rounded-lg px-4 py-3"
                    >
                      <Text className="text-gray-700 font-semibold">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {houseMap.areas?.map((area: any) => (
                <View
                  key={area.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-800">{area.name}</Text>
                      <Text className="text-sm text-gray-600">{area.areaType}</Text>
                      {(area.length || area.width) && (
                        <Text className="text-sm text-gray-600">
                          {area.length && area.width
                            ? `${area.length} × ${area.width} m/ft`
                            : area.length
                            ? `L: ${area.length}`
                            : `W: ${area.width}`}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => deleteArea(area.id)} className="p-2">
                      <Trash2 color="#EF4444" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {(!houseMap.areas || houseMap.areas.length === 0) && !showAreaForm && (
                <Text className="text-gray-500 text-center py-8">
                  No outdoor areas added yet. Tap &quot;Add Area&quot; to get started.
                </Text>
              )}
            </View>

            {/* IoT Device Placement Button */}
            {houseMap.rooms && houseMap.rooms.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("IoTDeviceLibrary", {
                    houseMapId: houseMap.id,
                    assessmentId,
                  })
                }
                className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6"
              >
                <MapPin color="#fff" size={32} />
                <Text className="text-white text-xl font-bold mt-3">Place IoT Devices</Text>
                <Text className="text-purple-100 mt-1">
                  Recommend and place smart home devices based on this property layout
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
