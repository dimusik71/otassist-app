import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import { ASSESSMENT_FORM, type AssessmentSection } from "@/constants/assessmentForm";
import { MOBILITY_SCOOTER_ASSESSMENT } from "@/constants/mobilityScooterAssessment";
import { FALLS_RISK_ASSESSMENT, MOVEMENT_MOBILITY_ASSESSMENT } from "@/constants/clinicalAssessment";

type Props = RootStackScreenProps<"ConductAssessment">;

function ConductAssessmentScreen({ navigation, route }: Props) {
  const { assessmentId, assessmentType } = route.params;
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // Select the appropriate assessment form based on type
  const getAssessmentForm = (): AssessmentSection[] => {
    switch (assessmentType) {
      case "mobility_scooter":
        return MOBILITY_SCOOTER_ASSESSMENT;
      case "falls_risk":
        return FALLS_RISK_ASSESSMENT;
      case "movement_mobility":
        return MOVEMENT_MOBILITY_ASSESSMENT;
      case "home":
      case "assistive_tech":
      case "general":
      default:
        return ASSESSMENT_FORM;
    }
  };

  const assessmentForm = getAssessmentForm();
  const currentSection = assessmentForm[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const totalQuestions = assessmentForm.reduce((sum, section) => sum + section.questions.length, 0);
  const completedQuestions =
    assessmentForm.slice(0, currentSectionIndex).reduce((sum, section) => sum + section.questions.length, 0) +
    currentQuestionIndex;

  const [answer, setAnswer] = useState<string>("");
  const [checkboxSelections, setCheckboxSelections] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);

  // Load existing responses for this assessment
  const { data: responsesData } = useQuery({
    queryKey: ["assessment-responses", assessmentId],
    queryFn: () => api.get<{ success: boolean; responses: any[] }>(`/api/assessments/${assessmentId}/responses`),
  });

  // Load previous assessments for pre-filling (for the same client)
  const { data: assessmentDetail } = useQuery({
    queryKey: ["assessment-detail", assessmentId],
    queryFn: () => api.get<{ assessment: any }>(`/api/assessments/${assessmentId}`),
  });

  const { data: previousResponsesData } = useQuery({
    queryKey: ["previous-responses", assessmentDetail?.assessment?.clientId],
    queryFn: async () => {
      if (!assessmentDetail?.assessment?.clientId) return { responses: [] };
      return api.get<{ success: boolean; responses: any[] }>(
        `/api/assessments/client/${assessmentDetail.assessment.clientId}/previous-responses`
      );
    },
    enabled: !!assessmentDetail?.assessment?.clientId,
  });

  // Load existing response for current question with pre-filling
  React.useEffect(() => {
    const existingResponse = responsesData?.responses?.find((r) => r.questionId === currentQuestion.id);

    if (existingResponse) {
      // Load saved response
      if (currentQuestion.type === "checkbox") {
        try {
          const parsed = JSON.parse(existingResponse.answer || "[]");
          setCheckboxSelections(Array.isArray(parsed) ? parsed : []);
        } catch {
          setCheckboxSelections([]);
        }
      } else {
        setAnswer(existingResponse.answer || "");
      }
      setNotes(existingResponse.notes || "");
      setMediaUrl(existingResponse.mediaUrl || null);
      setMediaType(existingResponse.mediaType || null);
    } else {
      // Try to pre-fill from previous assessments
      if (currentQuestion.prefillFrom && previousResponsesData?.responses) {
        const prefillResponse = previousResponsesData.responses.find((r: any) =>
          currentQuestion.prefillFrom?.includes(r.questionId)
        );
        if (prefillResponse) {
          if (currentQuestion.type === "checkbox") {
            try {
              const parsed = JSON.parse(prefillResponse.answer || "[]");
              setCheckboxSelections(Array.isArray(parsed) ? parsed : []);
            } catch {
              setCheckboxSelections([]);
            }
          } else {
            setAnswer(prefillResponse.answer || "");
          }
          setNotes(prefillResponse.notes || "");
        } else {
          // No pre-fill data, reset
          setAnswer("");
          setCheckboxSelections([]);
          setNotes("");
        }
      } else {
        // No pre-fill configured, reset
        setAnswer("");
        setCheckboxSelections([]);
        setNotes("");
      }
      setMediaUrl(null);
      setMediaType(null);
    }
  }, [currentQuestion.id, responsesData, previousResponsesData]);

  const { mutate: saveResponse, isPending: saving } = useMutation({
    mutationFn: (data: any) => api.post(`/api/assessments/${assessmentId}/responses`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-responses", assessmentId] });
    },
  });

  const { mutate: uploadMedia, isPending: uploading } = useMutation({
    mutationFn: async ({ fileUri, type }: { fileUri: string; type: string }) => {
      const fileName = fileUri.split("/").pop() || "upload";
      const fileType = type === "photo" ? "image/jpeg" : "video/mp4";

      const uploadResult = await api.upload<{ success: boolean; url: string }>("/api/upload/image", {
        file: {
          uri: fileUri,
          name: fileName,
          type: fileType,
        },
      });

      const fullUrl = `${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}${uploadResult.url}`;
      return { url: fullUrl, type };
    },
    onSuccess: ({ url, type }) => {
      setMediaUrl(url);
      setMediaType(type);
    },
    onError: () => {
      Alert.alert("Upload Error", "Failed to upload media. Please try again.");
    },
  });

  const { mutate: analyzeResponse, isPending: analyzing } = useMutation({
    mutationFn: async (responseId: string) => {
      return api.post<{ success: boolean; analysis: string }>(
        `/api/assessments/${assessmentId}/responses/${responseId}/analyze`,
        {}
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assessment-responses", assessmentId] });
      Alert.alert("AI Analysis", data.analysis, [{ text: "OK" }]);
    },
    onError: () => {
      Alert.alert("Error", "Failed to get AI analysis. Please try again.");
    },
  });

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadMedia({ fileUri: result.assets[0].uri, type: "photo" });
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Photo library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadMedia({ fileUri: result.assets[0].uri, type: "photo" });
    }
  };

  const handleSaveAndNext = () => {
    // Validate required fields
    if (currentQuestion.required) {
      if (currentQuestion.type === "checkbox" && checkboxSelections.length === 0) {
        Alert.alert("Required Field", "Please select at least one option before continuing.");
        return;
      }
      if ((currentQuestion.type === "yes_no" || currentQuestion.type === "multiple_choice") && !answer) {
        Alert.alert("Required Field", "Please answer this question before continuing.");
        return;
      }
    }

    // Save current response
    const answerToSave = currentQuestion.type === "checkbox" ? JSON.stringify(checkboxSelections) : answer;

    saveResponse({
      questionId: currentQuestion.id,
      sectionId: currentSection.id,
      answer: answerToSave,
      notes,
      mediaUrl,
      mediaType,
    });

    // Move to next question
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < assessmentForm.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Completed all questions
      Alert.alert("Assessment Complete", "You have completed all assessment questions!", [
        {
          text: "View Results",
          onPress: () => navigation.replace("AssessmentDetail", { assessmentId }),
        },
      ]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(assessmentForm[currentSectionIndex - 1].questions.length - 1);
    }
  };

  const handleGetAIFeedback = () => {
    // First save the current response, then analyze it
    const existingResponse = responsesData?.responses?.find((r) => r.questionId === currentQuestion.id);

    if (!existingResponse) {
      // Need to save first
      Alert.alert("Save First", "Please save your response before getting AI feedback");
      return;
    }

    analyzeResponse(existingResponse.id);
  };

  const progress = (completedQuestions / totalQuestions) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header with gradient */}
      <LinearGradient
        colors={["#1D4ED8", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 24 }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={() => navigation.goBack()} className="flex-row items-center gap-2">
            <ChevronLeft size={24} color="white" />
            <Text className="text-white font-semibold">Back</Text>
          </Pressable>
          <Text className="text-white font-semibold">
            {completedQuestions + 1} / {totalQuestions}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-white/20 rounded-full overflow-hidden">
          <View style={{ width: `${progress}%`, height: "100%", backgroundColor: "white" }} />
        </View>

        <Text className="text-white/80 text-sm mt-2">{Math.round(progress)}% Complete</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1, backgroundColor: "#FFFFFF" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Section Badge */}
        <View className="bg-blue-100 px-4 py-2 rounded-full self-start mb-4">
          <Text className="text-blue-700 font-semibold text-sm">{currentSection.title}</Text>
        </View>

        {/* Question */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">{currentQuestion.question}</Text>
        {currentQuestion.description && (
          <Text className="text-gray-600 mb-6">{currentQuestion.description}</Text>
        )}

        {/* Answer Input */}
        {currentQuestion.type === "yes_no" && (
          <View className="flex-row gap-3 mb-6">
            <Pressable
              onPress={() => setAnswer("Yes")}
              className={`flex-1 py-4 rounded-xl items-center ${
                answer === "Yes" ? "bg-green-600" : "bg-white border-2 border-gray-300"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className={`font-semibold text-base ${answer === "Yes" ? "text-white" : "text-gray-700"}`}>
                Yes
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setAnswer("No")}
              className={`flex-1 py-4 rounded-xl items-center ${
                answer === "No" ? "bg-red-600" : "bg-white border-2 border-gray-300"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className={`font-semibold text-base ${answer === "No" ? "text-white" : "text-gray-700"}`}>
                No
              </Text>
            </Pressable>
          </View>
        )}

        {currentQuestion.type === "text" && (
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            placeholder="Enter your answer..."
            placeholderTextColor="#9CA3AF"
            className="bg-white border-2 border-gray-300 rounded-xl p-4 mb-6 text-gray-900"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
            multiline
            numberOfLines={3}
          />
        )}

        {/* Multiple Choice */}
        {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
          <View className="mb-6">
            {currentQuestion.options.map((option) => (
              <Pressable
                key={option}
                onPress={() => setAnswer(option)}
                className={`mb-3 py-4 px-4 rounded-xl flex-row items-center ${
                  answer === option ? "bg-blue-600 border-2 border-blue-600" : "bg-white border-2 border-gray-300"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View
                  className={`w-5 h-5 rounded-full mr-3 items-center justify-center ${
                    answer === option ? "bg-white" : "bg-gray-200"
                  }`}
                >
                  {answer === option && <View className="w-3 h-3 rounded-full bg-blue-600" />}
                </View>
                <Text className={`font-semibold ${answer === option ? "text-white" : "text-gray-900"}`}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Checkbox */}
        {currentQuestion.type === "checkbox" && currentQuestion.options && (
          <View className="mb-6">
            {currentQuestion.prefillFrom && previousResponsesData?.responses && (
              <View className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-3">
                <Text className="text-teal-700 text-sm font-semibold">
                  ✨ Pre-filled from previous assessment
                </Text>
              </View>
            )}
            {currentQuestion.options.map((option) => {
              const isSelected = checkboxSelections.includes(option);
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    if (isSelected) {
                      setCheckboxSelections(checkboxSelections.filter((s) => s !== option));
                    } else {
                      setCheckboxSelections([...checkboxSelections, option]);
                    }
                  }}
                  className={`mb-3 py-4 px-4 rounded-xl flex-row items-center ${
                    isSelected ? "bg-teal-50 border-2 border-teal-600" : "bg-white border-2 border-gray-300"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View
                    className={`w-5 h-5 rounded mr-3 items-center justify-center ${
                      isSelected ? "bg-teal-600" : "bg-gray-200 border border-gray-400"
                    }`}
                  >
                    {isSelected && <CheckCircle size={20} color="white" />}
                  </View>
                  <Text className={`font-semibold ${isSelected ? "text-teal-900" : "text-gray-900"}`}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
            {currentQuestion.required && (
              <Text className="text-red-600 text-sm mt-2">* At least one selection required</Text>
            )}
          </View>
        )}

        {/* Notes */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any relevant observations or details..."
          placeholderTextColor="#9CA3AF"
          className="bg-white border-2 border-gray-300 rounded-xl p-4 mb-6 text-gray-900"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
          multiline
          numberOfLines={4}
        />

        {/* Media Upload */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Photo/Video Documentation {currentQuestion.requiresMedia && <Text className="text-red-600">(Required)</Text>}
        </Text>

        {mediaUrl ? (
          <View className="bg-white rounded-xl p-4 mb-4 border-2 border-green-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <CheckCircle size={20} color="#10B981" />
                <Text className="text-green-700 font-semibold">Media Uploaded</Text>
              </View>
              <Pressable onPress={() => { setMediaUrl(null); setMediaType(null); }}>
                <Text className="text-red-600 font-semibold">Remove</Text>
              </Pressable>
            </View>
            {mediaType === "photo" && (
              <Image source={{ uri: mediaUrl }} className="w-full h-40 rounded-lg" resizeMode="cover" />
            )}
          </View>
        ) : (
          <View className="flex-row gap-3 mb-6">
            <Pressable
              onPress={handleTakePhoto}
              disabled={uploading}
              className="flex-1 bg-white border-2 border-blue-300 py-4 rounded-xl items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {uploading ? (
                <ActivityIndicator color="#1D4ED8" />
              ) : (
                <>
                  <Camera size={24} color="#1D4ED8" />
                  <Text className="text-blue-700 font-semibold mt-1">Take Photo</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={handlePickImage}
              disabled={uploading}
              className="flex-1 bg-white border-2 border-purple-300 py-4 rounded-xl items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {uploading ? (
                <ActivityIndicator color="#7C3AED" />
              ) : (
                <>
                  <Upload size={24} color="#7C3AED" />
                  <Text className="text-purple-700 font-semibold mt-1">Upload</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* AI Feedback Button */}
        {(answer || checkboxSelections.length > 0 || notes || mediaUrl) && (
          <LinearGradient
            colors={["#7C3AED", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 12,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Pressable
              onPress={handleGetAIFeedback}
              disabled={analyzing}
              className="py-4 flex-row items-center justify-center gap-2"
              style={{ opacity: analyzing ? 0.7 : 1 }}
            >
              {analyzing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Sparkles size={20} color="white" />
                  <Text className="text-white font-bold text-base">Get AI Feedback</Text>
                </>
              )}
            </Pressable>
          </LinearGradient>
        )}

        {/* Show existing AI analysis if available */}
        {responsesData?.responses?.find((r) => r.questionId === currentQuestion.id)?.aiAnalysis && (
          <View className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={18} color="#7C3AED" />
              <Text className="text-purple-900 font-bold">AI Analysis</Text>
            </View>
            <Text className="text-purple-800">
              {responsesData.responses.find((r) => r.questionId === currentQuestion.id)?.aiAnalysis}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View
        className="bg-white border-t border-gray-200 p-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <View className="flex-row gap-3">
          {(currentSectionIndex > 0 || currentQuestionIndex > 0) && (
            <Pressable
              onPress={handlePrevious}
              className="bg-gray-200 py-4 px-6 rounded-xl flex-1"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text className="text-gray-700 font-bold text-center text-base">Previous</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleSaveAndNext}
            disabled={saving}
            className="py-4 px-6 rounded-xl flex-1 flex-row items-center justify-center gap-2"
            style={{
              backgroundColor: "#1D4ED8",
              opacity: saving ? 0.5 : 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-base">
                  {currentSectionIndex === assessmentForm.length - 1 &&
                  currentQuestionIndex === currentSection.questions.length - 1
                    ? "Complete"
                    : "Next"}
                </Text>
                <ChevronRight size={20} color="white" />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default ConductAssessmentScreen;
