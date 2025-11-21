import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Video, Camera, Square, CheckCircle, AlertTriangle, Edit3 } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { api } from "../lib/api";
import * as FileSystem from "expo-file-system";

type Props = NativeStackScreenProps<RootStackParamList, "VideoWalkthrough">;

const ROOM_TYPES = [
  { value: "living", label: "Living Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "dining", label: "Dining Room" },
  { value: "hallway", label: "Hallway" },
  { value: "entrance", label: "Entrance" },
  { value: "garage", label: "Garage" },
  { value: "office", label: "Office" },
  { value: "laundry", label: "Laundry" },
  { value: "outdoor", label: "Outdoor" },
];

export default function VideoWalkthroughScreen({ navigation, route }: Props) {
  const { assessmentId } = route.params;
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiGuidance, setAiGuidance] = useState<string>("Point your camera at the entrance and start recording");
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const [detectedRoomType, setDetectedRoomType] = useState<string>("");
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [coveragePercent, setCoveragePercent] = useState<number>(0);
  const [roomsScanned, setRoomsScanned] = useState<string[]>([]);
  const [capturedFrames, setCapturedFrames] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [generating, setGenerating] = useState(false);

  const cameraRef = useRef<any>(null);
  const frameIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  if (!permission) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <LinearGradient
          colors={["#1E40AF", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 32 }}
        >
          <Text className="text-white text-3xl font-bold">Camera Permission</Text>
        </LinearGradient>
        <View className="flex-1 justify-center items-center p-6">
          <Camera color="#1E40AF" size={64} />
          <Text className="text-xl font-bold text-gray-800 mt-6 mb-4 text-center">
            Camera Access Required
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            We need camera access to record a video walkthrough of the property and create a 3D map.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-blue-700 rounded-lg px-6 py-3"
          >
            <Text className="text-white font-semibold">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const captureAndAnalyzeFrame = async () => {
    if (!cameraRef.current || analyzing) return;

    try {
      setAnalyzing(true);

      // Take a photo
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });

      if (!photo.base64) return;

      // Store frame for final 3D map generation
      setCapturedFrames(prev => [...prev, { base64: photo.base64, timestamp: Date.now() }]);

      // Send to AI for analysis
      const response = (await api.post("/api/ai/analyze-video-frame", {
        frameBase64: photo.base64,
        context: currentRoom,
        roomsScanned,
        areasScanned: [],
      })) as any;

      if (response.success && response.analysis) {
        const analysis = response.analysis;

        // Update guidance
        setAiGuidance(analysis.guidance || "Continue scanning");
        setCoveragePercent(analysis.coveragePercent || 0);

        // Store AI detection info
        if (analysis.detectedRoomType) {
          setDetectedRoomType(analysis.detectedRoomType);
          setAiConfidence(analysis.confidence || 0);
        }

        // Update current room
        if (analysis.roomName && analysis.roomName !== currentRoom) {
          setCurrentRoom(analysis.roomName);
          if (!roomsScanned.includes(analysis.roomName)) {
            setRoomsScanned(prev => [...prev, analysis.roomName]);
          }
        }

        // Check if complete
        if (analysis.isComplete || analysis.nextAction === "finish_room") {
          setAiGuidance("Room complete! Move to the next area or finish recording.");
        }
      }
    } catch (error) {
      console.error("Frame analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setAiGuidance("Walk slowly and smoothly. Pan the camera across the room.");

      // Start capturing frames every 3 seconds
      frameIntervalRef.current = setInterval(() => {
        captureAndAnalyzeFrame();
      }, 3000);

      // Immediate first frame
      captureAndAnalyzeFrame();
    } catch (error) {
      console.error("Recording start error:", error);
      Alert.alert("Error", "Failed to start recording");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (capturedFrames.length > 0) {
      setIsComplete(true);
      setAiGuidance(`Captured ${capturedFrames.length} frames from ${roomsScanned.length} rooms. Ready to generate 3D map!`);
    } else {
      Alert.alert("No Frames", "Please record some video first");
    }
  };

  const generateMap = async () => {
    if (capturedFrames.length === 0) {
      Alert.alert("Error", "No frames captured");
      return;
    }

    try {
      setGenerating(true);

      const response = (await api.post("/api/ai/generate-3d-map", {
        assessmentId,
        frames: capturedFrames.slice(0, 10), // Send max 10 frames
        propertyType: "single_family",
      })) as any;

      if (response.success) {
        Alert.alert(
          "Success!",
          `3D map created with ${response.rooms?.length || 0} rooms and ${response.areas?.length || 0} outdoor areas.`,
          [
            {
              text: "View Map",
              onPress: () => navigation.replace("HouseMapping", { assessmentId }),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Map generation error:", error);
      Alert.alert("Error", error.message || "Failed to generate 3D map");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10 }}>
        <Text className="text-white text-2xl font-bold">AI Video Walkthrough</Text>
        <Text className="text-gray-300 text-sm mt-1">
          Rooms scanned: {roomsScanned.length} | Frames: {capturedFrames.length}
        </Text>
      </View>

      {/* Camera View - Live Preview */}
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        mode="picture"
      >
        {/* AI Guidance Overlay */}
        <View className="absolute top-20 left-0 right-0 px-6">
          <View className="bg-black/70 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1">
                {analyzing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <CheckCircle color="#10B981" size={20} />
                )}
                <Text className="text-white font-bold ml-2 flex-1">
                  {currentRoom || "Scanning..."}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowRoomPicker(true)}
                className="bg-white/20 rounded-lg px-3 py-1 ml-2 flex-row items-center"
              >
                <Edit3 color="#fff" size={14} />
                <Text className="text-white text-xs font-semibold ml-1">Edit</Text>
              </TouchableOpacity>
            </View>
            {detectedRoomType && aiConfidence > 0 && (
              <View className="mb-2">
                <Text className="text-gray-300 text-xs">
                  AI detected: {detectedRoomType} ({aiConfidence}% confidence)
                </Text>
              </View>
            )}
            <Text className="text-white text-sm">{aiGuidance}</Text>
            {coveragePercent > 0 && (
              <View className="mt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-300 text-xs">Coverage</Text>
                  <Text className="text-white text-xs font-bold">{coveragePercent}%</Text>
                </View>
                <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-green-500"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View className="absolute top-4 right-4 bg-red-600 rounded-full px-3 py-2 flex-row items-center">
            <View className="w-3 h-3 bg-white rounded-full mr-2" />
            <Text className="text-white font-bold text-sm">RECORDING</Text>
          </View>
        )}

        {/* Rooms List */}
        {roomsScanned.length > 0 && (
          <View className="absolute bottom-40 left-6 right-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {roomsScanned.map((room, idx) => (
                <View
                  key={idx}
                  className="bg-green-600/90 rounded-lg px-3 py-2 mr-2"
                >
                  <Text className="text-white text-xs font-semibold">{room}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </CameraView>

      {/* Controls */}
      <View style={{ position: 'absolute', bottom: insets.bottom, left: 0, right: 0 }}>
        <View className="bg-black/80 px-6 py-6">
          {!isComplete ? (
            <View className="flex-row items-center justify-center gap-4">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="bg-gray-700 rounded-full px-6 py-4"
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                className={`rounded-full px-8 py-4 ${
                  isRecording ? "bg-red-600" : "bg-blue-600"
                }`}
              >
                <View className="flex-row items-center">
                  {isRecording ? (
                    <Square color="#fff" size={20} fill="#fff" />
                  ) : (
                    <Video color="#fff" size={20} />
                  )}
                  <Text className="text-white font-bold ml-2 text-base">
                    {isRecording ? "Stop" : "Start Recording"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={generateMap}
              disabled={generating}
              className="bg-green-600 rounded-xl py-4 items-center"
            >
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle color="#fff" size={24} />
                  <Text className="text-white font-bold text-lg ml-2">
                    Generate 3D Map ({capturedFrames.length} frames)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Room Type Picker Modal */}
      <Modal
        visible={showRoomPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoomPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-800 mb-4">Select Room Type</Text>
            <ScrollView className="max-h-96">
              {ROOM_TYPES.map((room) => (
                <TouchableOpacity
                  key={room.value}
                  onPress={() => {
                    setCurrentRoom(room.label);
                    setDetectedRoomType(room.value);
                    if (!roomsScanned.includes(room.label)) {
                      setRoomsScanned(prev => [...prev, room.label]);
                    }
                    setShowRoomPicker(false);
                  }}
                  className={`py-4 px-4 rounded-lg mb-2 ${
                    currentRoom === room.label ? "bg-blue-100" : "bg-gray-50"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      currentRoom === room.label ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {room.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowRoomPicker(false)}
              className="bg-gray-200 rounded-lg py-3 mt-4"
            >
              <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
