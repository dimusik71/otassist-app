import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  ClipboardList,
  Home,
  Sparkles,
  Package,
  MessageCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppStorage, APP_KEYS } from "@/lib/secureStorage";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: [string, string];
}

interface Props {
  onComplete: () => void;
}

const OnboardingScreen = ({ onComplete }: Props) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides: OnboardingSlide[] = [
    {
      id: "1",
      title: "Welcome to OT/AH Assessment",
      description:
        "A professional tool for Occupational Therapists and Allied Health professionals to conduct comprehensive client assessments with AI-powered insights.",
      icon: <ClipboardList size={80} color="white" />,
      gradient: ["#1D4ED8", "#0D9488"],
    },
    {
      id: "2",
      title: "AI-Powered Assessments",
      description:
        "Capture photos, videos, and audio notes during assessments. Our AI analyzes everything to identify safety concerns, accessibility barriers, and recommend equipment.",
      icon: <Sparkles size={80} color="white" />,
      gradient: ["#7C3AED", "#EC4899"],
    },
    {
      id: "3",
      title: "3D House Mapping",
      description:
        "Create detailed 3D property maps from video walkthroughs. AI automatically detects rooms, estimates dimensions, and identifies features for accurate documentation.",
      icon: <Home size={80} color="white" />,
      gradient: ["#059669", "#0891B2"],
    },
    {
      id: "4",
      title: "Smart Recommendations",
      description:
        "Get AI-powered equipment and IoT device recommendations tailored to each client. Generate professional quotes and invoices with NDIS item codes automatically.",
      icon: <Package size={80} color="white" />,
      gradient: ["#DC2626", "#EA580C"],
    },
    {
      id: "5",
      title: "Always Here to Help",
      description:
        "Access our interactive user guide with AI chatbot support anytime. Get instant answers to questions about features, best practices, and troubleshooting.",
      icon: <MessageCircle size={80} color="white" />,
      gradient: ["#2563EB", "#7C3AED"],
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AppStorage.set(APP_KEYS.ONBOARDING_COMPLETED, "true");
      onComplete();
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
      onComplete();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={{ width, flex: 1 }}>
      <LinearGradient
        colors={item.gradient}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 40,
        }}
      >
        <View className="items-center mb-8">{item.icon}</View>
        <Text className="text-white text-3xl font-bold text-center mb-4">
          {item.title}
        </Text>
        <Text className="text-white/90 text-lg text-center leading-7">
          {item.description}
        </Text>
      </LinearGradient>
    </View>
  );

  const renderPagination = () => (
    <View className="flex-row justify-center items-center py-4">
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 20, 8],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={index}
            className="h-2 bg-white rounded-full mx-1"
            style={{
              width: dotWidth,
              opacity,
            }}
          />
        );
      })}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Footer */}
      <View
        style={{
          paddingBottom: insets.bottom + 20,
          paddingTop: 20,
          paddingHorizontal: 24,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
        }}
      >
        {renderPagination()}

        <View className="flex-row items-center justify-between mt-6">
          {currentIndex < slides.length - 1 ? (
            <>
              <Pressable
                onPress={handleSkip}
                className="px-6 py-3 active:opacity-70"
              >
                <Text className="text-white/70 font-semibold">Skip</Text>
              </Pressable>
              <Pressable
                onPress={handleNext}
                className="bg-white px-8 py-4 rounded-xl flex-row items-center active:opacity-70"
              >
                <Text className="text-slate-900 font-bold mr-2">Next</Text>
                <ArrowRight size={20} color="#0f172a" />
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={handleComplete}
              className="flex-1 bg-white py-4 rounded-xl flex-row items-center justify-center active:opacity-70"
            >
              <CheckCircle size={20} color="#10b981" />
              <Text className="text-slate-900 font-bold ml-2 text-lg">
                Get Started
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
