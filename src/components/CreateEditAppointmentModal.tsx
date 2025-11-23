import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Modal, Platform } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Home,
  MessageSquare,
  FileText,
  Save,
  ChevronDown,
} from "lucide-react-native";
import type { RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import type {
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  UpdateAppointmentRequest,
  UpdateAppointmentResponse,
  GetAppointmentResponse,
  GetClientsResponse,
} from "@/shared/contracts";
import { useSession } from "@/lib/useSession";

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, "AppointmentDetail">;

interface CreateEditAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  appointmentId?: string;
  initialClientId?: string;
}

const appointmentTypes = [
  { value: "assessment", label: "Assessment", icon: FileText },
  { value: "follow_up", label: "Follow Up", icon: Calendar },
  { value: "consultation", label: "Consultation", icon: MessageSquare },
  { value: "phone_call", label: "Phone Call", icon: Phone },
  { value: "home_visit", label: "Home Visit", icon: Home },
  { value: "other", label: "Other", icon: Calendar },
] as const;

const CreateEditAppointmentModal: React.FC<CreateEditAppointmentModalProps> = ({
  visible,
  onClose,
  appointmentId,
  initialClientId,
}) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Form state
  const [clientId, setClientId] = useState<string | null>(initialClientId || null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [appointmentType, setAppointmentType] = useState<(typeof appointmentTypes)[number]["value"]>("assessment");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour from now
  const [location, setLocation] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [consentRequired, setConsentRequired] = useState(true);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);

  // Fetch clients for selection
  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: () => api.get<GetClientsResponse>("/api/clients"),
    enabled: !!session && visible,
  });

  // Fetch existing appointment if editing
  const { data: appointmentData, isLoading: loadingAppointment } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => api.get<GetAppointmentResponse>(`/api/appointments/${appointmentId}`),
    enabled: !!appointmentId && visible,
  });

  // Update form when appointment data loads
  React.useEffect(() => {
    if (appointmentData?.appointment) {
      setTitle(appointmentData.appointment.title);
      setDescription(appointmentData.appointment.description || "");
      setAppointmentType(appointmentData.appointment.appointmentType);
      setStartDate(new Date(appointmentData.appointment.startTime));
      setEndDate(new Date(appointmentData.appointment.endTime));
      setLocation(appointmentData.appointment.location || "");
      setIsAllDay(appointmentData.appointment.isAllDay);
      setNotes(appointmentData.appointment.notes || "");
      setSummary(appointmentData.appointment.summary || "");
      setGuidelines(appointmentData.appointment.guidelines || "");
      setConsentRequired(appointmentData.appointment.consentRequired);
      setClientId(appointmentData.appointment.clientId);
    }
  }, [appointmentData]);

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAppointmentRequest) =>
      api.post<CreateAppointmentResponse>("/api/appointments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
      resetForm();
    },
  });

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      api.put<UpdateAppointmentResponse>(`/api/appointments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setClientId(initialClientId || null);
    setTitle("");
    setDescription("");
    setAppointmentType("assessment");
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 60 * 60 * 1000));
    setLocation("");
    setIsAllDay(false);
    setNotes("");
    setSummary("");
    setGuidelines("");
    setConsentRequired(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title for the appointment");
      return;
    }

    if (startDate >= endDate && !isAllDay) {
      alert("End time must be after start time");
      return;
    }

    const appointmentData = {
      clientId,
      title: title.trim(),
      description: description.trim() || undefined,
      appointmentType,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location: location.trim() || undefined,
      isAllDay,
      notes: notes.trim() || undefined,
      summary: summary.trim() || undefined,
      guidelines: guidelines.trim() || undefined,
      consentRequired,
    };

    if (appointmentId) {
      updateMutation.mutate({ id: appointmentId, data: appointmentData });
    } else {
      createMutation.mutate(appointmentData);
    }
  };

  const selectedClient = clientsData?.clients?.find((c) => c.id === clientId);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        {/* Header */}
        <LinearGradient
          colors={["#8B5CF6", "#6366F1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-white">
              {appointmentId ? "Edit Appointment" : "New Appointment"}
            </Text>
            <Pressable onPress={onClose} className="w-10 h-10 items-center justify-center active:opacity-70">
              <X size={24} color="white" />
            </Pressable>
          </View>
          <Text style={{ color: "#E9D5FF" }}>
            {appointmentId ? "Update appointment details" : "Create a new appointment"}
          </Text>
        </LinearGradient>

        {loadingAppointment ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}>
            {/* Client Selection */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Client (Optional)</Text>
              <Pressable
                onPress={() => setShowClientPicker(true)}
                className="bg-white border border-gray-300 rounded-xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  <User size={20} color={selectedClient ? "#8B5CF6" : "#9CA3AF"} />
                  <Text className={`ml-3 ${selectedClient ? "text-gray-900" : "text-gray-500"}`}>
                    {selectedClient ? selectedClient.name : "Select a client (optional)"}
                  </Text>
                </View>
                <ChevronDown size={20} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Home Assessment for John Doe"
                placeholderTextColor="#9CA3AF"
                className="bg-white border border-gray-300 rounded-xl p-4 text-gray-900"
              />
            </View>

            {/* Appointment Type */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Type</Text>
              <View className="flex-row flex-wrap">
                {appointmentTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = appointmentType === type.value;
                  return (
                    <Pressable
                      key={type.value}
                      onPress={() => setAppointmentType(type.value)}
                      className={`flex-row items-center px-4 py-3 rounded-xl mr-2 mb-2 ${
                        isSelected ? "bg-purple-600" : "bg-white border border-gray-300"
                      }`}
                    >
                      <Icon size={16} color={isSelected ? "white" : "#6B7280"} />
                      <Text className={`ml-2 ${isSelected ? "text-white font-semibold" : "text-gray-700"}`}>
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* All Day Toggle */}
            <View className="mb-4">
              <Pressable
                onPress={() => setIsAllDay(!isAllDay)}
                className="flex-row items-center justify-between bg-white border border-gray-300 rounded-xl p-4"
              >
                <Text className="text-gray-700 font-semibold">All Day Event</Text>
                <View
                  className={`w-12 h-6 rounded-full ${isAllDay ? "bg-purple-600" : "bg-gray-300"}`}
                  style={{ justifyContent: "center", alignItems: isAllDay ? "flex-end" : "flex-start", paddingHorizontal: 2 }}
                >
                  <View className="w-5 h-5 bg-white rounded-full" />
                </View>
              </Pressable>
            </View>

            {/* Start Date & Time */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Start Date & Time</Text>
              <View className="flex-row">
                <Pressable
                  onPress={() => setShowStartDatePicker(true)}
                  className="flex-1 bg-white border border-gray-300 rounded-xl p-4 mr-2 flex-row items-center"
                >
                  <Calendar size={20} color="#8B5CF6" />
                  <Text className="text-gray-900 ml-3">
                    {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </Pressable>
                {!isAllDay && (
                  <Pressable
                    onPress={() => setShowStartTimePicker(true)}
                    className="flex-1 bg-white border border-gray-300 rounded-xl p-4 flex-row items-center"
                  >
                    <Clock size={20} color="#8B5CF6" />
                    <Text className="text-gray-900 ml-3">
                      {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* End Date & Time */}
            {!isAllDay && (
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">End Date & Time</Text>
                <View className="flex-row">
                  <Pressable
                    onPress={() => setShowEndDatePicker(true)}
                    className="flex-1 bg-white border border-gray-300 rounded-xl p-4 mr-2 flex-row items-center"
                  >
                    <Calendar size={20} color="#8B5CF6" />
                    <Text className="text-gray-900 ml-3">
                      {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowEndTimePicker(true)}
                    className="flex-1 bg-white border border-gray-300 rounded-xl p-4 flex-row items-center"
                  >
                    <Clock size={20} color="#8B5CF6" />
                    <Text className="text-gray-900 ml-3">
                      {endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Location */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Location (Optional)</Text>
              <View className="bg-white border border-gray-300 rounded-xl p-4 flex-row items-center">
                <MapPin size={20} color="#9CA3AF" />
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g., Client's Home, Office"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-gray-900 ml-3"
                />
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Description (Optional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of the appointment"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-white border border-gray-300 rounded-xl p-4 text-gray-900"
              />
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Notes (Optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes or reminders"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-white border border-gray-300 rounded-xl p-4 text-gray-900"
              />
            </View>

            {/* Summary */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Appointment Summary (Optional)</Text>
              <Text className="text-gray-500 text-sm mb-2">
                Brief summary of what the appointment is about - will be included in reminder email
              </Text>
              <TextInput
                value={summary}
                onChangeText={setSummary}
                placeholder="e.g., Home assessment to evaluate mobility and accessibility needs"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-white border border-gray-300 rounded-xl p-4 text-gray-900"
              />
            </View>

            {/* Guidelines */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Guidelines (Optional)</Text>
              <Text className="text-gray-500 text-sm mb-2">
                What to expect during the appointment - will be included in reminder email
              </Text>
              <TextInput
                value={guidelines}
                onChangeText={setGuidelines}
                placeholder="e.g., Please ensure all areas of the home are accessible. The assessment will take approximately 1-2 hours. Feel free to ask questions throughout."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-white border border-gray-300 rounded-xl p-4 text-gray-900"
              />
            </View>

            {/* Consent Required Toggle */}
            <View className="mb-4">
              <Pressable
                onPress={() => setConsentRequired(!consentRequired)}
                className="flex-row items-center justify-between bg-white border border-gray-300 rounded-xl p-4"
              >
                <View className="flex-1 mr-4">
                  <Text className="text-gray-700 font-semibold mb-1">Require Client Consent</Text>
                  <Text className="text-gray-500 text-sm">
                    Client must reply &quot;YES&quot; to reminder email to confirm consent
                  </Text>
                </View>
                <View
                  className={`w-12 h-6 rounded-full ${consentRequired ? "bg-purple-600" : "bg-gray-300"}`}
                  style={{ justifyContent: "center", alignItems: consentRequired ? "flex-end" : "flex-start", paddingHorizontal: 2 }}
                >
                  <View className="w-5 h-5 bg-white rounded-full" />
                </View>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* Save Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            paddingBottom: insets.bottom + 16,
            backgroundColor: "#F9FAFB",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
          }}
        >
          <Pressable
            onPress={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-purple-600 py-4 rounded-xl flex-row items-center justify-center active:opacity-80"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  {appointmentId ? "Update Appointment" : "Create Appointment"}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Date/Time Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(Platform.OS === "ios");
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}
        {showStartTimePicker && (
          <DateTimePicker
            value={startDate}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartTimePicker(Platform.OS === "ios");
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
              setShowEndDatePicker(Platform.OS === "ios");
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}
        {showEndTimePicker && (
          <DateTimePicker
            value={endDate}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndTimePicker(Platform.OS === "ios");
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}

        {/* Client Picker Modal */}
        <Modal visible={showClientPicker} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 24,
                paddingBottom: insets.bottom + 24,
                maxHeight: "70%",
              }}
            >
              <View className="flex-row items-center justify-between px-6 mb-4">
                <Text className="text-xl font-bold text-gray-900">Select Client</Text>
                <Pressable onPress={() => setShowClientPicker(false)}>
                  <X size={24} color="#6B7280" />
                </Pressable>
              </View>
              <ScrollView>
                <Pressable
                  onPress={() => {
                    setClientId(null);
                    setShowClientPicker(false);
                  }}
                  className="px-6 py-4 border-b border-gray-100 active:bg-gray-50"
                >
                  <Text className="text-gray-500 italic">No client (General appointment)</Text>
                </Pressable>
                {clientsData?.clients?.map((client) => (
                  <Pressable
                    key={client.id}
                    onPress={() => {
                      setClientId(client.id);
                      setShowClientPicker(false);
                    }}
                    className={`px-6 py-4 border-b border-gray-100 active:bg-gray-50 ${
                      clientId === client.id ? "bg-purple-50" : ""
                    }`}
                  >
                    <Text className="text-gray-900 font-semibold">{client.name}</Text>
                    {client.phone && <Text className="text-gray-600 text-sm mt-1">{client.phone}</Text>}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

export default CreateEditAppointmentModal;
