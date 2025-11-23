import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Briefcase, DollarSign, FileText, CheckCircle, ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SecureStorage, AppStorage, SECURE_KEYS, APP_KEYS } from "@/lib/secureStorage";
import { api } from "@/lib/api";

interface Props {
  onComplete: () => void;
  onSkip?: () => void;
}

const ProfessionalProfileSetupScreen = ({ onComplete, onSkip }: Props) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Professional Registration
  const [ahpraNumber, setAhpraNumber] = useState("");
  const [profession, setProfession] = useState("");

  // Business Details
  const [businessName, setBusinessName] = useState("");
  const [abn, setAbn] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  // Rates
  const [hourlyRate, setHourlyRate] = useState("150");
  const [assessmentFee, setAssessmentFee] = useState("250");
  const [reportFee, setReportFee] = useState("180");
  const [travelRate, setTravelRate] = useState("85");

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save profile data - only send non-empty fields
      const profileData: any = {
        defaultHourlyRate: parseFloat(hourlyRate) || 150,
        assessmentFee: parseFloat(assessmentFee) || 250,
        reportFee: parseFloat(reportFee) || 180,
        travelRate: parseFloat(travelRate) || 85,
      };

      // Only add string fields if they have values (prevents empty string regex validation failures)
      if (ahpraNumber.trim()) profileData.ahpraNumber = ahpraNumber.trim();
      if (profession.trim()) profileData.profession = profession.trim();
      if (businessName.trim()) profileData.businessName = businessName.trim();
      if (abn.trim()) profileData.abn = abn.trim();
      if (businessPhone.trim()) profileData.businessPhone = businessPhone.trim();
      if (businessEmail.trim()) profileData.businessEmail = businessEmail.trim();
      if (businessAddress.trim()) profileData.businessAddress = businessAddress.trim();

      // Send to backend API
      await api.post("/api/profile", profileData);

      // Store locally as encrypted backup (Healthcare compliant)
      await SecureStorage.setSecureJSON(SECURE_KEYS.PROFESSIONAL_PROFILE, profileData);
      await AppStorage.set(APP_KEYS.PROFILE_SETUP_COMPLETED, "true");

      onComplete();
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await AppStorage.set(APP_KEYS.PROFILE_SETUP_SKIPPED, "true");
      if (onSkip) {
        onSkip();
      } else {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to skip setup:", error);
      onComplete();
    }
  };

  const renderStep1 = () => (
    <View className="flex-1 px-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
          <Briefcase size={32} color="#2563eb" />
        </View>
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Professional Registration
        </Text>
        <Text className="text-slate-300 text-center">
          Add your professional credentials (optional)
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-white font-semibold mb-2">AHPRA Number</Text>
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
          <Text className="text-white font-semibold mb-2">Profession</Text>
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
  );

  const renderStep2 = () => (
    <View className="flex-1 px-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
          <FileText size={32} color="#10b981" />
        </View>
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Business Details
        </Text>
        <Text className="text-slate-300 text-center">
          Configure your business information
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-white font-semibold mb-2">Business Name</Text>
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
          <Text className="text-white font-semibold mb-2">ABN</Text>
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
          <Text className="text-white font-semibold mb-2">Business Phone</Text>
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
          <Text className="text-white font-semibold mb-2">Business Email</Text>
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
          <Text className="text-white font-semibold mb-2">Business Address</Text>
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
  );

  const renderStep3 = () => (
    <View className="flex-1 px-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-4">
          <DollarSign size={32} color="#f59e0b" />
        </View>
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Your Rates
        </Text>
        <Text className="text-slate-300 text-center">
          Set your default pricing (can be changed later)
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-white font-semibold mb-2">Hourly Rate ($)</Text>
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
          <Text className="text-white font-semibold mb-2">Assessment Fee ($)</Text>
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
          <Text className="text-white font-semibold mb-2">Report Fee ($)</Text>
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
          <Text className="text-white font-semibold mb-2">Travel Rate ($)</Text>
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
  );

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
          <Text className="text-white text-lg font-semibold">Professional Setup</Text>
          <Text className="text-slate-400 text-sm mt-1">
            Step {step} of 3
          </Text>
        </LinearGradient>

        {/* Progress Bar */}
        <View className="px-6 py-4">
          <View className="flex-row space-x-2">
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? "bg-blue-600" : "bg-slate-800"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Footer */}
        <View
          className="bg-slate-900 border-t border-slate-800 px-6"
          style={{ paddingBottom: insets.bottom + 16, paddingTop: 16 }}
        >
          <View className="flex-row items-center space-x-3">
            {step > 1 && (
              <Pressable
                onPress={handleBack}
                className="flex-1 bg-slate-800 py-4 rounded-xl items-center active:opacity-70"
              >
                <Text className="text-white font-semibold">Back</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleNext}
              disabled={loading}
              className={`flex-1 py-4 rounded-xl items-center flex-row justify-center active:opacity-70 ${
                loading ? "bg-blue-400" : "bg-blue-600"
              }`}
            >
              {step === 3 ? (
                <>
                  <CheckCircle size={20} color="white" />
                  <Text className="text-white font-bold ml-2">
                    {loading ? "Saving..." : "Complete"}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-white font-bold mr-2">Next</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </Pressable>
          </View>

          {step === 1 && (
            <Pressable onPress={handleSkip} className="mt-3 py-2 items-center active:opacity-70">
              <Text className="text-slate-400 text-sm">Skip for now</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProfessionalProfileSetupScreen;
