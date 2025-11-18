// ElevenLabs Text-to-Speech Integration
// Provides high-quality voice synthesis for assessment guidance and accessibility

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface TTSOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface TTSResult {
  success: boolean;
  audioUri?: string;
  error?: string;
}

// Pre-configured voice IDs for different use cases
export const VOICES = {
  // Professional, clear female voice - good for instructions
  PROFESSIONAL_FEMALE: '21m00Tcm4TlvDq8ikWAM',
  // Calm, reassuring male voice - good for guidance
  PROFESSIONAL_MALE: 'VR6AewLTigWG4xSOukaG',
  // Warm, friendly female voice - good for client interactions
  FRIENDLY_FEMALE: 'EXAVITQu4vr4xnSDxMaL',
  // Clear, authoritative male voice - good for technical info
  AUTHORITATIVE_MALE: 'pNInz6obpgDQGcFmaJgB',
};

/**
 * Generate speech from text using ElevenLabs API
 */
export async function generateSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<TTSResult> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const {
      voiceId = VOICES.PROFESSIONAL_FEMALE,
      modelId = 'eleven_multilingual_v2',
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0,
      useSpeakerBoost = true,
    } = options;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs TTS failed: ${error}`);
    }

    // Get audio as blob
    const audioBlob = await response.blob();

    // Convert blob to base64
    const reader = new FileReader();
    const base64Audio = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Save to file
    const timestamp = Date.now();
    const fileUri = `${FileSystem.documentDirectory}tts_${timestamp}.mp3`;
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      success: true,
      audioUri: fileUri,
    };
  } catch (error) {
    console.error('[textToSpeech.ts]: TTS generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown TTS error',
    };
  }
}

/**
 * Play generated speech immediately
 */
export async function speakText(text: string, options?: TTSOptions): Promise<boolean> {
  try {
    const result = await generateSpeech(text, options);

    if (!result.success || !result.audioUri) {
      console.error('[textToSpeech.ts]: Failed to generate speech');
      return false;
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Load and play audio
    const { sound } = await Audio.Sound.createAsync({ uri: result.audioUri });
    await sound.playAsync();

    // Clean up when finished
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        // Delete temp file
        FileSystem.deleteAsync(result.audioUri!, { idempotent: true });
      }
    });

    return true;
  } catch (error) {
    console.error('[textToSpeech.ts]: Speak text error:', error);
    return false;
  }
}

/**
 * Pre-generate common assessment instructions
 */
export async function generateAssessmentGuidance(
  assessmentType: 'entrance' | 'bathroom' | 'kitchen' | 'bedroom' | 'general'
): Promise<TTSResult> {
  const guidanceText = {
    entrance:
      "Let's assess the entrance and exit areas. Please capture photos of the doorway, steps, handrails, and lighting. Note any accessibility barriers or safety concerns.",
    bathroom:
      "We'll now assess the bathroom. Please photograph the toilet, shower or bath, grab bars, flooring, and any mobility aids. Pay attention to slip hazards and accessibility features.",
    kitchen:
      "Time to assess the kitchen. Capture images of storage areas, appliances, counter heights, and flooring. Note reach requirements and any safety hazards.",
    bedroom:
      "Let's assess the bedroom. Photograph the bed height, clearance space, lighting, closet access, and any mobility equipment. Consider transfer safety and accessibility.",
    general:
      "Please walk through the space and capture relevant photos. Document any safety concerns, accessibility barriers, or areas needing modification.",
  };

  return generateSpeech(guidanceText[assessmentType], {
    voiceId: VOICES.PROFESSIONAL_FEMALE,
    stability: 0.6,
    similarityBoost: 0.8,
  });
}

/**
 * Generate voice feedback for AI analysis results
 */
export async function speakAnalysisResults(
  summary: string,
  concerns: string[]
): Promise<boolean> {
  let text = `Assessment summary: ${summary}`;

  if (concerns.length > 0) {
    text += `. Key concerns identified: ${concerns.join('. ')}.`;
  } else {
    text += '. No major concerns identified.';
  }

  return speakText(text, {
    voiceId: VOICES.PROFESSIONAL_MALE,
    stability: 0.5,
  });
}

/**
 * Generate equipment recommendation audio
 */
export async function speakEquipmentRecommendation(
  equipmentName: string,
  reason: string
): Promise<boolean> {
  const text = `Recommendation: ${equipmentName}. ${reason}`;

  return speakText(text, {
    voiceId: VOICES.FRIENDLY_FEMALE,
    stability: 0.6,
  });
}

/**
 * Generate navigation guidance
 */
export async function speakNavigationGuidance(destination: string): Promise<boolean> {
  const text = `Navigating to ${destination}. Please follow the prompts on screen.`;

  return speakText(text, {
    voiceId: VOICES.PROFESSIONAL_FEMALE,
    stability: 0.7,
  });
}

/**
 * Generate safety alert
 */
export async function speakSafetyAlert(alertMessage: string): Promise<boolean> {
  const text = `Safety alert: ${alertMessage}`;

  return speakText(text, {
    voiceId: VOICES.AUTHORITATIVE_MALE,
    stability: 0.8,
    similarityBoost: 0.9,
  });
}

/**
 * Generate batch audio for offline use
 * Useful for preparing assessment guidance ahead of time
 */
export async function generateBatchGuidance(
  phrases: Array<{ id: string; text: string; voice?: string }>
): Promise<Array<{ id: string; audioUri?: string; error?: string }>> {
  const results = await Promise.allSettled(
    phrases.map(async (phrase) => {
      const result = await generateSpeech(phrase.text, {
        voiceId: phrase.voice as string | undefined,
      });
      return {
        id: phrase.id,
        audioUri: result.audioUri,
        error: result.error,
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        id: phrases[index].id,
        error: 'Generation failed',
      };
    }
  });
}

/**
 * Text-to-speech for accessibility
 * Reads screen content for visually impaired users
 */
export async function readScreenContent(content: string): Promise<boolean> {
  return speakText(content, {
    voiceId: VOICES.PROFESSIONAL_FEMALE,
    stability: 0.6,
    similarityBoost: 0.7,
  });
}

/**
 * Interactive voice prompts for assessments
 */
export const ASSESSMENT_PROMPTS = {
  start: 'Assessment started. You can begin documenting the property now.',
  photoTaken: 'Photo captured successfully. You can add more or continue to the next area.',
  videoStarted: 'Video recording has started.',
  videoStopped: 'Video recording stopped. Processing your footage.',
  audioStarted: 'Audio recording in progress. Speak your observations.',
  audioStopped: 'Audio note saved. Transcribing your comments.',
  analysisComplete: 'AI analysis complete. Review the recommendations on screen.',
  assessmentComplete:
    'Assessment completed successfully. You can now generate quotes and reports.',
};

/**
 * Speak a pre-defined prompt
 */
export async function speakPrompt(
  promptKey: keyof typeof ASSESSMENT_PROMPTS
): Promise<boolean> {
  return speakText(ASSESSMENT_PROMPTS[promptKey], {
    voiceId: VOICES.FRIENDLY_FEMALE,
  });
}
