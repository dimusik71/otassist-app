import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Book, MessageCircle, Send, X, ChevronDown, ChevronRight, HelpCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/lib/api";
import type { RootStackScreenProps } from "@/navigation/types";

type Props = RootStackScreenProps<"UserGuide">;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  subsections?: Array<{ title: string; content: string }>;
  expanded?: boolean;
}

const UserGuideScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your OT/AH Assessment App assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);
  const chatScrollRef = useRef<ScrollView>(null);

  const guideSections: GuideSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "🚀",
      content: "Welcome to the OT/AH Assessment App! This guide will help you get started with conducting professional assessments.",
      subsections: [
        {
          title: "First Time Setup",
          content: "When you first open the app, you'll see a welcome tour introducing key features. After the tour, use the Quick Start Checklist (✓ icon in header) to complete essential setup steps.",
        },
        {
          title: "Creating Your First Client",
          content: "Tap the '+' button on the home screen, enter client details including name, contact information, and address. You can also add photos and notes.",
        },
        {
          title: "Starting an Assessment",
          content: "Select a client, tap 'New Assessment', choose the assessment type (Home Environmental, Mobility Scooter, Falls Risk, Movement & Mobility, or Assistive Technology), then tap 'Start Assessment'.",
        },
        {
          title: "Quick Start Checklist",
          content: "Access the checklist anytime by tapping the ✓ icon in the assessments screen header. Track your progress through essential setup tasks and get direct links to each feature.",
        },
      ],
    },
    {
      id: "assessments",
      title: "Conducting Assessments",
      icon: "📋",
      content: "Learn how to conduct comprehensive assessments with AI-powered guidance.",
      subsections: [
        {
          title: "Photo Capture",
          content: "Use the camera button to capture photos during assessments. The AI will automatically analyze images for safety concerns, accessibility issues, and provide recommendations.",
        },
        {
          title: "Video Walkthrough",
          content: "Record video walkthroughs of properties. The app analyzes frames every 3 seconds to detect rooms, estimate dimensions, and identify safety hazards.",
        },
        {
          title: "Audio Notes",
          content: "Tap the microphone button to record voice notes. Your audio is automatically transcribed using AI and saved with the assessment.",
        },
        {
          title: "AI Analysis",
          content: "After capturing media, tap 'Generate AI Analysis' to get comprehensive insights, safety recommendations, and equipment suggestions.",
        },
      ],
    },
    {
      id: "3d-mapping",
      title: "3D House Mapping",
      icon: "🏠",
      content: "Create detailed 3D maps of client properties with AI-powered room detection.",
      subsections: [
        {
          title: "Creating a Map",
          content: "From an assessment, tap '3D House Map'. Walk through the property and capture frames. The AI analyzes each frame to detect room types, estimate dimensions, and identify features.",
        },
        {
          title: "Viewing Maps",
          content: "View the generated 3D layout with room labels, dimensions, and outdoor areas. Maps help visualize the property and plan equipment placement.",
        },
      ],
    },
    {
      id: "iot-devices",
      title: "IoT Device Recommendations",
      icon: "📱",
      content: "Recommend and configure smart home devices for enhanced safety and independence.",
      subsections: [
        {
          title: "Browse Devices",
          content: "Tap 'IoT Devices' to browse smart sensors, emergency buttons, medication reminders, fall detectors, and more.",
        },
        {
          title: "AI Placement",
          content: "The AI suggests optimal device placement based on the property layout, client needs, and safety requirements.",
        },
        {
          title: "Technical Specs",
          content: "Generate detailed technical specifications and placement diagrams for installation teams.",
        },
      ],
    },
    {
      id: "equipment",
      title: "Equipment Recommendations",
      icon: "🛠️",
      content: "Browse and recommend assistive equipment from the comprehensive catalog.",
      subsections: [
        {
          title: "Equipment Catalog",
          content: "Access a catalog of mobility aids, bathroom equipment, kitchen modifications, and assistive technology. Filter by category and search by name.",
        },
        {
          title: "AI Recommendations",
          content: "Based on assessment data, the AI suggests appropriate equipment with justifications and NDIS item numbers.",
        },
        {
          title: "Adding to Assessment",
          content: "Tap any equipment item to view details and add it to the current assessment with custom notes.",
        },
      ],
    },
    {
      id: "quotes-invoices",
      title: "Quotes & Invoices",
      icon: "💰",
      content: "Generate professional quotes and invoices for services and equipment.",
      subsections: [
        {
          title: "Creating Quotes",
          content: "From an assessment, tap 'Generate Quote'. The AI automatically includes recommended equipment, services, and pricing based on assessment data.",
        },
        {
          title: "Generating Invoices",
          content: "Convert approved quotes to invoices with one tap. Invoices include detailed line items, NDIS codes, and payment terms.",
        },
        {
          title: "PDF Export",
          content: "Export quotes and invoices as professional PDF documents to send to clients and funding bodies.",
        },
      ],
    },
    {
      id: "ai-features",
      title: "AI-Powered Features",
      icon: "✨",
      content: "Understand how AI enhances your assessment workflow.",
      subsections: [
        {
          title: "Image Analysis",
          content: "AI analyzes photos to detect hazards (trip risks, poor lighting, clutter), accessibility barriers, and equipment needs.",
        },
        {
          title: "Voice Transcription",
          content: "Audio notes are transcribed using OpenAI Whisper for accurate text conversion and searchable records.",
        },
        {
          title: "Text-to-Speech",
          content: "The app can read assessment guidance, safety alerts, and recommendations aloud using ElevenLabs voices.",
        },
        {
          title: "Smart Recommendations",
          content: "AI suggests equipment, modifications, and IoT devices based on assessment data, client needs, and best practices.",
        },
      ],
    },
    {
      id: "tips",
      title: "Tips & Best Practices",
      icon: "💡",
      content: "Expert tips for conducting thorough and professional assessments.",
      subsections: [
        {
          title: "Photography Tips",
          content: "• Capture multiple angles of each area\n• Include context (doorways, furniture for scale)\n• Photograph hazards and accessibility barriers\n• Take close-ups of equipment and fixtures",
        },
        {
          title: "Video Walkthrough Tips",
          content: "• Walk slowly and smoothly\n• Pan across rooms systematically\n• Narrate as you go for context\n• Capture entry/exit points clearly",
        },
        {
          title: "Documentation",
          content: "• Add detailed notes about client concerns\n• Document measurements when possible\n• Record client preferences and goals\n• Note urgency of recommendations",
        },
        {
          title: "Assessment Quality",
          content: "• Complete all relevant questions\n• Review AI analysis for accuracy\n• Add professional insights\n• Generate reports before leaving site",
        },
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await api.post<{ response: string }>("/api/ai/support-chat", {
        message: userMessage.content,
        conversationHistory: messages.slice(-6), // Last 6 messages for context
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Scroll to bottom after assistant response
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Support chat error:", error);
      Alert.alert("Error", "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showChat && chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [showChat]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {/* Header */}
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        style={{
          paddingTop: insets.top,
          paddingBottom: 16,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable
              onPress={() => navigation.goBack()}
              className="mr-4 p-2 active:opacity-70"
            >
              <ArrowLeft size={24} color="white" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">User Guide</Text>
              <Text className="text-slate-400 text-sm mt-1">Learn how to use the app</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowChat(!showChat)}
            className="bg-blue-600 px-4 py-3 rounded-xl flex-row items-center active:opacity-70"
          >
            {showChat ? (
              <X size={20} color="white" />
            ) : (
              <MessageCircle size={20} color="white" />
            )}
            <Text className="text-white font-semibold ml-2">
              {showChat ? "Close" : "AI Help"}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      {showChat ? (
        /* AI Chat Interface */
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View className="flex-1 bg-slate-900">
            {/* Chat Messages */}
            <ScrollView
              ref={chatScrollRef}
              className="flex-1 px-4 py-4"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={`mb-4 ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <View
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-blue-600"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    <Text className="text-white leading-5">{message.content}</Text>
                    <Text className="text-slate-400 text-xs mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ))}
              {isLoading && (
                <View className="items-start mb-4">
                  <View className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl">
                    <ActivityIndicator size="small" color="#60a5fa" />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Area */}
            <View
              className="border-t border-slate-700 bg-slate-800 px-4"
              style={{ paddingBottom: insets.bottom + 8, paddingTop: 12 }}
            >
              <View className="flex-row items-center">
                <TextInput
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder="Ask me anything..."
                  placeholderTextColor="#64748b"
                  className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl mr-2"
                  multiline
                  maxLength={500}
                  onSubmitEditing={sendMessage}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-3 rounded-xl ${
                    inputMessage.trim() && !isLoading
                      ? "bg-blue-600 active:opacity-70"
                      : "bg-slate-700"
                  }`}
                >
                  <Send size={20} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* Guide Content */
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Introduction */}
          <View className="px-5 py-6 bg-gradient-to-b from-slate-800 to-transparent">
            <View className="flex-row items-center mb-3">
              <Book size={24} color="#60a5fa" />
              <Text className="text-white text-xl font-bold ml-2">
                Complete User Guide
              </Text>
            </View>
            <Text className="text-slate-300 leading-6">
              This guide covers everything you need to know about using the OT/AH
              Assessment App. Tap any section to expand and learn more. For
              personalized help, use the AI chat assistant.
            </Text>
          </View>

          {/* Guide Sections */}
          <View className="px-5">
            {guideSections.map((section, index) => {
              const isExpanded = expandedSections.has(section.id);
              return (
                <View
                  key={section.id}
                  className="mb-4 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                >
                  <Pressable
                    onPress={() => toggleSection(section.id)}
                    className="p-4 flex-row items-center active:bg-slate-700"
                  >
                    <Text className="text-2xl mr-3">{section.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-white text-lg font-bold">
                        {section.title}
                      </Text>
                      {!isExpanded && (
                        <Text className="text-slate-400 text-sm mt-1" numberOfLines={1}>
                          {section.content}
                        </Text>
                      )}
                    </View>
                    {isExpanded ? (
                      <ChevronDown size={20} color="#94a3b8" />
                    ) : (
                      <ChevronRight size={20} color="#94a3b8" />
                    )}
                  </Pressable>

                  {isExpanded && (
                    <View className="px-4 pb-4">
                      <Text className="text-slate-300 leading-6 mb-4">
                        {section.content}
                      </Text>

                      {section.subsections && (
                        <View className="space-y-3">
                          {section.subsections.map((subsection, subIndex) => (
                            <View
                              key={subIndex}
                              className="bg-slate-900 rounded-lg p-4 border border-slate-700"
                            >
                              <Text className="text-blue-400 font-semibold mb-2">
                                {subsection.title}
                              </Text>
                              <Text className="text-slate-300 leading-5">
                                {subsection.content}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Footer Help */}
          <View className="px-5 py-6 bg-slate-800 mx-5 rounded-xl border border-slate-700 mt-4">
            <View className="flex-row items-center mb-3">
              <HelpCircle size={20} color="#60a5fa" />
              <Text className="text-white font-semibold ml-2">Need More Help?</Text>
            </View>
            <Text className="text-slate-300 leading-6 mb-4">
              Can&apos;t find what you&apos;re looking for? Our AI assistant can answer
              specific questions about the app, guide you through features, and
              troubleshoot issues.
            </Text>
            <Pressable
              onPress={() => setShowChat(true)}
              className="bg-blue-600 py-3 rounded-lg items-center active:opacity-70"
            >
              <Text className="text-white font-semibold">
                Chat with AI Assistant
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default UserGuideScreen;
