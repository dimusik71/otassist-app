import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Save, User, Briefcase, DollarSign, FileText } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";

type Props = RootStackScreenProps<"Settings">;

const SettingsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Form state
  const [ahpraNumber, setAhpraNumber] = useState("");
  const [profession, setProfession] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [abn, setAbn] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [hourlyRate, setHourlyRate] = useState("150");
  const [assessmentFee, setAssessmentFee] = useState("250");
  const [reportFee, setReportFee] = useState("180");
  const [travelRate, setTravelRate] = useState("85");

  // Fetch profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = (await api.get("/api/profile")) as Response;
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json() as Promise<{ profile: any }>;
    },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile;
      setAhpraNumber(profile.ahpraNumber || "");
      setProfession(profile.profession || "");
      setBusinessName(profile.businessName || "");
      setAbn(profile.abn || "");
      setBusinessPhone(profile.businessPhone || "");
      setBusinessEmail(profile.businessEmail || "");
      setBusinessAddress(profile.businessAddress || "");
      setHourlyRate(profile.defaultHourlyRate?.toString() || "150");
      setAssessmentFee(profile.assessmentFee?.toString() || "250");
      setReportFee(profile.reportFee?.toString() || "180");
      setTravelRate(profile.travelRate?.toString() || "85");
    }
  }, [profileData]);

  // Save profile mutation
  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = (await api.post("/api/profile", { json: data })) as Response;
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        throw new Error(result.error || "Failed to save profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      Alert.alert("Success", "Profile updated successfully!");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    saveProfile({
      ahpraNumber: ahpraNumber.trim() || null,
      profession: profession.trim() || null,
      businessName: businessName.trim() || null,
      abn: abn.trim() || null,
      businessPhone: businessPhone.trim() || null,
      businessEmail: businessEmail.trim() || null,
      businessAddress: businessAddress.trim() || null,
      defaultHourlyRate: parseFloat(hourlyRate) || 150,
      assessmentFee: parseFloat(assessmentFee) || 250,
      reportFee: parseFloat(reportFee) || 180,
      travelRate: parseFloat(travelRate) || 85,
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <LinearGradient
          colors={["#1e293b", "#0f172a"]}
          style={{
            paddingTop: insets.top + 20,
            paddingBottom: 20,
            paddingHorizontal: 24,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Pressable onPress={() => navigation.goBack()} className="mr-4">
                <ArrowLeft size={24} color="white" />
              </Pressable>
              <Text className="text-white text-xl font-bold">Profile Settings</Text>
            </View>
            <Pressable
              onPress={handleSave}
              disabled={isPending}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center active:opacity-70"
            >
              <Save size={18} color="white" />
              <Text className="text-white font-semibold ml-2">
                {isPending ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Professional Registration */}
          <View className="px-6 py-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Briefcase size={20} color="#2563eb" />
              </View>
              <Text className="text-white text-lg font-bold">Professional Registration</Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-slate-300 font-semibold mb-2">AHPRA Number</Text>
                <TextInput
                  value={ahpraNumber}
                  onChangeText={setAhpraNumber}
                  placeholder="e.g., OCC0001234567"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  autoCapitalize="characters"
                />
              </View>

              <View>
                <Text className="text-slate-300 font-semibold mb-2">Profession</Text>
                <TextInput
                  value={profession}
                  onChangeText={setProfession}
                  placeholder="e.g., Occupational Therapist"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Business Details */}
          <View className="px-6 py-6 border-t border-slate-800">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                <FileText size={20} color="#10b981" />
              </View>
              <Text className="text-white text-lg font-bold">Business Details</Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-slate-300 font-semibold mb-2">Business Name</Text>
                <TextInput
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="e.g., Smith OT Services"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-slate-300 font-semibold mb-2">ABN</Text>
                <TextInput
                  value={abn}
                  onChangeText={setAbn}
                  placeholder="11 digit ABN"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>

              <View>
                <Text className="text-slate-300 font-semibold mb-2">Business Phone</Text>
                <TextInput
                  value={businessPhone}
                  onChangeText={setBusinessPhone}
                  placeholder="e.g., 0400 123 456"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text className="text-slate-300 font-semibold mb-2">Business Email</Text>
                <TextInput
                  value={businessEmail}
                  onChangeText={setBusinessEmail}
                  placeholder="e.g., practice@example.com"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-slate-300 font-semibold mb-2">Business Address</Text>
                <TextInput
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                  placeholder="Street address"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Rates & Pricing */}
          <View className="px-6 py-6 border-t border-slate-800">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
                <DollarSign size={20} color="#f59e0b" />
              </View>
              <Text className="text-white text-lg font-bold">Your Rates</Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-slate-300 font-semibold mb-2">Hourly Rate ($)</Text>
                <TextInput
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  placeholder="150"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-slate-300 font-semibold mb-2">Assessment Fee ($)</Text>
                <TextInput
                  value={assessmentFee}
                  onChangeText={setAssessmentFee}
                  placeholder="250"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-slate-300 font-semibold mb-2">Report Fee ($)</Text>
                <TextInput
                  value={reportFee}
                  onChangeText={setReportFee}
                  placeholder="180"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-slate-300 font-semibold mb-2">Travel Rate ($)</Text>
                <TextInput
                  value={travelRate}
                  onChangeText={setTravelRate}
                  placeholder="85"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsScreen;
