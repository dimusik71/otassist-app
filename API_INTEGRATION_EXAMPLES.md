# API Integration Examples

This document provides practical examples for using all the integrated APIs in the OT/AH Assessment App.

## 1. Apple Maps & Location

### Geocode Client Address
```typescript
import { geocodeAddress } from '@/lib/geocoding';

// Convert address to coordinates
const coords = await geocodeAddress('123 Main St, Sydney NSW 2000');
if (coords) {
  console.log(`Lat: ${coords.latitude}, Lng: ${coords.longitude}`);
  // Save to database
  await api.put(`/api/clients/${clientId}`, {
    latitude: coords.latitude,
    longitude: coords.longitude,
  });
}
```

### Get Current Location
```typescript
import { getCurrentLocation } from '@/lib/geocoding';

const location = await getCurrentLocation();
if (location) {
  // Use for assessment property location
  await api.put(`/api/assessments/${assessmentId}`, {
    latitude: location.latitude,
    longitude: location.longitude,
  });
}
```

### Open in Native Maps
```typescript
import { Platform, Linking } from 'react-native';

const openMaps = (lat: number, lng: number) => {
  const url = Platform.select({
    ios: `maps://app?daddr=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}`,
  });

  if (url) {
    Linking.openURL(url);
  }
};
```

## 2. GPT-4O Audio Transcription

### Basic Transcription
```typescript
import { transcribeAudio } from '@/lib/audioTranscriptionEnhanced';

const result = await transcribeAudio(audioUri, {
  model: 'gpt-4o-transcribe',
  language: 'en',
});

if (result.success) {
  console.log('Transcription:', result.transcription);
  console.log('Duration:', result.duration);
  console.log('Language:', result.language);
}
```

### Contextual Transcription (OT/AH Terms)
```typescript
import { transcribeWithContext } from '@/lib/audioTranscriptionEnhanced';

const result = await transcribeWithContext(
  audioUri,
  'grab bars, transfer bench, mobility aids, ADL, IADL'
);
```

### Transcribe with Analysis
```typescript
import { transcribeAndAnalyzeAudioNote } from '@/lib/audioTranscriptionEnhanced';

const result = await transcribeAndAnalyzeAudioNote(audioUri);

if (result.success) {
  console.log('Transcription:', result.transcription);
  console.log('Analysis:', result.analysis);
  console.log('Key Points:', result.keyPoints);
  console.log('Sentiment:', result.sentiment); // 'positive' | 'neutral' | 'concerning'
  console.log('Action Items:', result.actionItems);
}
```

### Batch Transcription
```typescript
import { transcribeBatch } from '@/lib/audioTranscriptionEnhanced';

const audioFiles = ['file1.m4a', 'file2.m4a', 'file3.m4a'];
const results = await transcribeBatch(audioFiles, {
  model: 'gpt-4o-transcribe',
});

results.forEach((result, index) => {
  if (result.success) {
    console.log(`File ${index + 1}:`, result.transcription);
  }
});
```

## 3. ElevenLabs Text-to-Speech

### Generate Speech
```typescript
import { generateSpeech, VOICES } from '@/lib/textToSpeech';

const result = await generateSpeech(
  'Welcome to the assessment. Let us begin with the entrance area.',
  {
    voiceId: VOICES.PROFESSIONAL_FEMALE,
    stability: 0.6,
    similarityBoost: 0.8,
  }
);

if (result.success && result.audioUri) {
  // Play the audio or save for later
  console.log('Audio saved to:', result.audioUri);
}
```

### Speak Text Immediately
```typescript
import { speakText, VOICES } from '@/lib/textToSpeech';

// Play audio immediately
await speakText('Please capture photos of the bathroom grab bars.', {
  voiceId: VOICES.FRIENDLY_FEMALE,
});
```

### Pre-generated Assessment Guidance
```typescript
import { generateAssessmentGuidance } from '@/lib/textToSpeech';

// Generate guidance for bathroom assessment
const result = await generateAssessmentGuidance('bathroom');

// Save for offline use
// Audio is automatically saved to FileSystem
```

### Voice Feedback for Analysis
```typescript
import { speakAnalysisResults } from '@/lib/textToSpeech';

const summary = 'The property has good accessibility features overall.';
const concerns = ['No grab bars in shower', 'Narrow doorway to bedroom'];

await speakAnalysisResults(summary, concerns);
```

### Safety Alerts
```typescript
import { speakSafetyAlert } from '@/lib/textToSpeech';

await speakSafetyAlert('Trip hazard detected in hallway. Immediate attention required.');
```

### Interactive Prompts
```typescript
import { speakPrompt, ASSESSMENT_PROMPTS } from '@/lib/textToSpeech';

// Photo taken
await speakPrompt('photoTaken');

// Video started
await speakPrompt('videoStarted');

// Analysis complete
await speakPrompt('analysisComplete');
```

### Batch Audio Generation (Offline Prep)
```typescript
import { generateBatchGuidance, VOICES } from '@/lib/textToSpeech';

const phrases = [
  { id: 'entrance', text: 'Assessing entrance area', voice: VOICES.PROFESSIONAL_FEMALE },
  { id: 'bathroom', text: 'Assessing bathroom safety', voice: VOICES.PROFESSIONAL_FEMALE },
  { id: 'kitchen', text: 'Assessing kitchen accessibility', voice: VOICES.PROFESSIONAL_FEMALE },
];

const results = await generateBatchGuidance(phrases);

results.forEach((result) => {
  if (result.audioUri) {
    console.log(`${result.id}: ${result.audioUri}`);
  }
});
```

## 4. Ideogram 3.0 Image Generation

### Generate Equipment Mockup
```typescript
import { generateEquipmentMockup } from '@/lib/imageGeneration';

// Realistic visualization
const imageUri = await generateEquipmentMockup(
  'Transfer bench',
  'bathroom',
  'realistic'
);

// Technical diagram
const technicalUri = await generateEquipmentMockup(
  'Stair lift',
  'staircase',
  'technical'
);
```

### Generate IoT Device Visualization
```typescript
import { generateIoTDevicePlacementVisualization } from '@/lib/imageGeneration';

const imageUri = await generateIoTDevicePlacementVisualization(
  'Fall detection sensor',
  'bedroom',
  'Mounted on ceiling, 10 feet high, covering entire room'
);
```

### Custom Image Generation
```typescript
import { generateImageWithIdeogram } from '@/lib/imageGeneration';

const imageUri = await generateImageWithIdeogram({
  prompt: 'Modern accessible bathroom with grab bars and roll-in shower',
  aspectRatio: '16x9',
  renderingSpeed: 'TURBO',
  styleType: 'REALISTIC',
  magicPrompt: 'ON',
});
```

### Edit Image with Ideogram
```typescript
import { editImageWithIdeogram } from '@/lib/imageGeneration';

const editedUri = await editImageWithIdeogram({
  prompt: 'Add grab bars to the shower area',
  imageUri: '/path/to/bathroom/photo.jpg',
  maskUri: '/path/to/mask.png', // Mask indicates where to edit
  renderingSpeed: 'DEFAULT',
});
```

## 5. GPT Image 1 Generation

### Generate Property Modification
```typescript
import { generatePropertyModification } from '@/lib/imageGeneration';

const imageUri = await generatePropertyModification(
  'Wheelchair ramp installation',
  'front entrance',
  '1:12 slope ratio, non-slip surface, handrails on both sides'
);
```

### Generate Image with GPT
```typescript
import { generateImageWithGPT } from '@/lib/imageGeneration';

const imageUri = await generateImageWithGPT({
  prompt: 'Accessible kitchen with lowered counters and open base cabinets',
  size: '1536x1024',
  quality: 'high',
});
```

### Edit Image with GPT
```typescript
import { editImageWithGPT } from '@/lib/imageGeneration';

const editedUri = await editImageWithGPT({
  prompt: 'Replace the standard toilet with a comfort-height toilet',
  imageUri: '/path/to/bathroom.jpg',
  size: '1024x1024',
  quality: 'high',
  inputFidelity: 'high', // Preserve original details
});
```

## 6. Voice Guidance Components

### Voice Guidance Toggle
```typescript
import { VoiceGuidanceToggle } from '@/components/VoiceGuidance';

<VoiceGuidanceToggle
  enabled={voiceEnabled}
  onToggle={(enabled) => setVoiceEnabled(enabled)}
/>
```

### Speak Button
```typescript
import { SpeakButton } from '@/components/VoiceGuidance';
import { VOICES } from '@/lib/textToSpeech';

<SpeakButton
  text="Please capture photos of all entry points to the property."
  voiceId={VOICES.PROFESSIONAL_FEMALE}
  label="Play Instructions"
  size="medium"
/>
```

### Voice Instruction with Auto-play
```typescript
import { VoiceInstruction } from '@/components/VoiceGuidance';

<VoiceInstruction
  instruction="Document the bathroom layout, including the location of the toilet, sink, and bathing area."
  autoPlay={true}
  showButton={true}
/>
```

## Integration in Assessment Flow

### Complete Assessment with Voice & AI

```typescript
import { transcribeAndAnalyzeAudioNote } from '@/lib/audioTranscriptionEnhanced';
import { speakPrompt } from '@/lib/textToSpeech';
import { generateEquipmentMockup } from '@/lib/imageGeneration';

// 1. Start assessment with voice guidance
await speakPrompt('start');

// 2. After photo capture
await speakPrompt('photoTaken');

// 3. After audio note recorded
await speakPrompt('audioStopped');

// 4. Transcribe and analyze
const analysis = await transcribeAndAnalyzeAudioNote(audioUri);

if (analysis.success) {
  // Save to database
  await api.post(`/api/assessments/${assessmentId}/media`, {
    type: 'audio',
    url: audioUri,
    aiAnalysis: analysis.analysis,
    transcription: analysis.transcription,
  });

  // Speak results
  await speakPrompt('analysisComplete');

  // Generate equipment mockup if recommended
  if (analysis.actionItems.includes('grab bars')) {
    const mockupUri = await generateEquipmentMockup(
      'Bathroom grab bars',
      'bathroom',
      'realistic'
    );
  }
}

// 5. Complete assessment
await speakPrompt('assessmentComplete');
```

## Environment Variables Required

Make sure these are configured in your Vibecode app:

- `EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY` - For GPT-4O transcription and GPT Image 1
- `EXPO_PUBLIC_VIBECODE_IDEOGRAM_API_KEY` - For Ideogram 3.0 image generation
- `EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY` - For ElevenLabs TTS

All these should already be configured in your Vibecode environment via the API integrations tab.
