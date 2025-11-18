// Voice Guidance Component
// Provides voice feedback and TTS controls for accessibility and guidance

import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { speakText, VOICES } from '@/lib/textToSpeech';

interface VoiceGuidanceProps {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function VoiceGuidanceToggle({ enabled = false, onToggle }: VoiceGuidanceProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <Pressable
      onPress={handleToggle}
      className="flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200"
    >
      {isEnabled ? (
        <Volume2 size={20} color="#7C3AED" />
      ) : (
        <VolumeX size={20} color="#9CA3AF" />
      )}
      <Text
        className={`ml-2 text-sm font-semibold ${isEnabled ? 'text-purple-700' : 'text-gray-500'}`}
      >
        Voice Guidance
      </Text>
    </Pressable>
  );
}

interface SpeakButtonProps {
  text: string;
  voiceId?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export function SpeakButton({
  text,
  voiceId = VOICES.PROFESSIONAL_FEMALE,
  label = 'Read Aloud',
  size = 'medium',
}: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    setIsSpeaking(true);
    await speakText(text, { voiceId });
    setIsSpeaking(false);
  };

  const sizeClasses = {
    small: 'px-2 py-1',
    medium: 'px-3 py-2',
    large: 'px-4 py-3',
  };

  const iconSize = {
    small: 14,
    medium: 18,
    large: 22,
  };

  return (
    <Pressable
      onPress={handleSpeak}
      disabled={isSpeaking}
      className={`flex-row items-center justify-center bg-purple-600 rounded-lg ${sizeClasses[size]}`}
    >
      {isSpeaking ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Volume2 size={iconSize[size]} color="white" />
      )}
      <Text className="text-white font-semibold ml-2 text-sm">{label}</Text>
    </Pressable>
  );
}

interface VoiceInstructionProps {
  instruction: string;
  autoPlay?: boolean;
  showButton?: boolean;
}

export function VoiceInstruction({
  instruction,
  autoPlay = false,
  showButton = true,
}: VoiceInstructionProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  React.useEffect(() => {
    if (autoPlay && !hasPlayed) {
      speakText(instruction, { voiceId: VOICES.PROFESSIONAL_FEMALE });
      setHasPlayed(true);
    }
  }, [autoPlay, hasPlayed, instruction]);

  return (
    <View className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <View className="flex-row items-start">
        <Volume2 size={20} color="#7C3AED" />
        <View className="flex-1 ml-3">
          <Text className="text-sm text-gray-700 mb-2">{instruction}</Text>
          {showButton && <SpeakButton text={instruction} size="small" label="Play Audio" />}
        </View>
      </View>
    </View>
  );
}
