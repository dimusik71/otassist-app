import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Circle, X, UserPlus, ClipboardList, Package, BookOpen, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const CHECKLIST_KEY = "@quick_start_checklist";

const QuickStartChecklist = ({ visible, onClose, onNavigate }: Props) => {
  const insets = useSafeAreaInsets();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "create_client",
      title: "Create Your First Client",
      description: "Add a client profile with contact details and address",
      icon: <UserPlus size={24} color="#3b82f6" />,
      completed: false,
      action: "CreateClient",
    },
    {
      id: "start_assessment",
      title: "Conduct an Assessment",
      description: "Start your first assessment with AI-powered guidance",
      icon: <ClipboardList size={24} color="#10b981" />,
      completed: false,
      action: "CreateAssessment",
    },
    {
      id: "explore_equipment",
      title: "Browse Equipment Catalog",
      description: "Explore assistive equipment and mobility aids",
      icon: <Package size={24} color="#f59e0b" />,
      completed: false,
      action: "EquipmentTab",
    },
    {
      id: "read_guide",
      title: "Read the User Guide",
      description: "Learn about all features and AI capabilities",
      icon: <BookOpen size={24} color="#8b5cf6" />,
      completed: false,
      action: "UserGuide",
    },
    {
      id: "try_ai",
      title: "Try AI Features",
      description: "Use photo analysis, audio transcription, or 3D mapping",
      icon: <Sparkles size={24} color="#ec4899" />,
      completed: false,
    },
  ]);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const saved = await AsyncStorage.getItem(CHECKLIST_KEY);
      if (saved) {
        const savedChecklist = JSON.parse(saved);
        setChecklist((prev) =>
          prev.map((item) => ({
            ...item,
            completed: savedChecklist[item.id] || false,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load checklist:", error);
    }
  };

  const toggleItem = async (id: string) => {
    const newChecklist = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(newChecklist);

    try {
      const checklistState = newChecklist.reduce(
        (acc, item) => ({ ...acc, [item.id]: item.completed }),
        {}
      );
      await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklistState));
    } catch (error) {
      console.error("Failed to save checklist:", error);
    }
  };

  const handleItemPress = (item: ChecklistItem) => {
    if (item.action) {
      onNavigate(item.action);
      onClose();
    } else {
      toggleItem(item.id);
    }
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50">
        <View
          className="flex-1 bg-slate-900 rounded-t-3xl overflow-hidden"
          style={{ marginTop: insets.top + 60 }}
        >
          {/* Header */}
          <LinearGradient colors={["#1e293b", "#0f172a"]}>
            <View className="px-6 py-6 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold mb-1">
                  Quick Start Guide
                </Text>
                <Text className="text-slate-400">
                  {completedCount} of {totalCount} completed
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="p-2 rounded-lg bg-slate-800 active:opacity-70"
              >
                <X size={24} color="white" />
              </Pressable>
            </View>

            {/* Progress Bar */}
            <View className="px-6 pb-6">
              <View className="bg-slate-700 h-2 rounded-full overflow-hidden">
                <View
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          </LinearGradient>

          {/* Checklist Items */}
          <ScrollView className="flex-1 px-6 py-4">
            {checklist.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => handleItemPress(item)}
                className="bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700 active:bg-slate-750"
              >
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1">
                    {item.completed ? (
                      <CheckCircle size={24} color="#10b981" />
                    ) : (
                      <Circle size={24} color="#64748b" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="mr-2">{item.icon}</View>
                      <Text
                        className={`text-lg font-semibold flex-1 ${
                          item.completed ? "text-slate-400 line-through" : "text-white"
                        }`}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Text className="text-slate-400 leading-5">
                      {item.description}
                    </Text>
                    {item.action && !item.completed && (
                      <Text className="text-blue-400 text-sm mt-2 font-medium">
                        Tap to start →
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}

            {/* Completion Message */}
            {completedCount === totalCount && (
              <View className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-xl p-6 border border-emerald-700 mt-2">
                <View className="flex-row items-center mb-2">
                  <CheckCircle size={24} color="#10b981" />
                  <Text className="text-white text-xl font-bold ml-2">
                    All Done!
                  </Text>
                </View>
                <Text className="text-emerald-200 leading-6">
                  Great job! You&apos;ve completed the quick start guide. You&apos;re ready to conduct professional assessments with AI-powered insights.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View
            className="bg-slate-800 border-t border-slate-700 px-6"
            style={{ paddingBottom: insets.bottom + 16, paddingTop: 16 }}
          >
            <Pressable
              onPress={onClose}
              className="bg-blue-600 py-4 rounded-xl items-center active:opacity-70"
            >
              <Text className="text-white font-bold text-base">
                {completedCount === totalCount ? "Close" : "I'll Do This Later"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QuickStartChecklist;
