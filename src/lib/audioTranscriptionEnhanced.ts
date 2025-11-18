// Enhanced audio transcription service with GPT-4O support
// Supports both Whisper and GPT-4O transcription models

export interface TranscriptionOptions {
  language?: string;
  prompt?: string; // Optional context to guide transcription
  temperature?: number;
  model?: 'whisper-1' | 'gpt-4o-transcribe';
}

export interface TranscriptionResult {
  success: boolean;
  transcription?: string;
  language?: string;
  duration?: number;
  error?: string;
}

/**
 * Transcribe audio using OpenAI (Whisper or GPT-4O)
 * GPT-4O provides better accuracy and multi-language support
 */
export async function transcribeAudio(
  audioUri: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    const {
      language = 'en',
      prompt,
      temperature = 0,
      model = 'gpt-4o-transcribe', // Default to GPT-4O for better accuracy
    } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Create FormData for multipart upload
      const formData = new FormData();

      // Extract filename and ensure it has the right extension
      const fileName = audioUri.split('/').pop() || 'recording.m4a';

      formData.append('file', {
        uri: audioUri,
        name: fileName,
        type: 'audio/m4a',
      } as any);

      formData.append('model', model);
      formData.append('language', language);
      formData.append('response_format', 'verbose_json'); // Get detailed info
      formData.append('temperature', temperature.toString());

      if (prompt) {
        formData.append('prompt', prompt);
      }

      xhr.open('POST', 'https://api.openai.com/v1/audio/transcriptions');
      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`
      );

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              transcription: data.text,
              language: data.language,
              duration: data.duration,
            });
          } catch (error) {
            reject({
              success: false,
              error: 'Failed to parse transcription response',
            });
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject({
              success: false,
              error:
                errorData.error?.message ||
                `Transcription failed with status ${xhr.status}`,
            });
          } catch {
            reject({
              success: false,
              error: `Transcription failed with status ${xhr.status}`,
            });
          }
        }
      };

      xhr.onerror = () => {
        reject({
          success: false,
          error: 'Network error during transcription',
        });
      };

      xhr.send(formData as any);
    });
  } catch (error) {
    console.error('[audioTranscription.ts]: Transcription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transcription error',
    };
  }
}

/**
 * Transcribe audio with contextual prompt for better accuracy
 * Useful for domain-specific terminology (OT/AH terms)
 */
export async function transcribeWithContext(
  audioUri: string,
  context: string
): Promise<TranscriptionResult> {
  const prompt = `This is an occupational therapy assessment recording. Common terms: ${context}`;

  return transcribeAudio(audioUri, {
    model: 'gpt-4o-transcribe',
    prompt,
    temperature: 0,
  });
}

/**
 * Transcribe and analyze audio note for assessment
 * Combines GPT-4O transcription with AI analysis
 */
export async function transcribeAndAnalyzeAudioNote(audioUri: string): Promise<{
  success: boolean;
  transcription?: string;
  analysis?: string;
  keyPoints?: string[];
  sentiment?: 'positive' | 'neutral' | 'concerning';
  actionItems?: string[];
  error?: string;
}> {
  try {
    // Step 1: Transcribe audio with GPT-4O
    const transcriptionResult = await transcribeAudio(audioUri, {
      model: 'gpt-4o-transcribe',
      prompt:
        'Occupational therapy assessment with medical and accessibility terminology',
    });

    if (!transcriptionResult.success || !transcriptionResult.transcription) {
      return {
        success: false,
        error: transcriptionResult.error || 'Failed to transcribe audio',
      };
    }

    // Step 2: Analyze transcription with GPT-4o
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert OT/AH assessment analyst. Extract structured information from assessment notes. Identify key observations, safety concerns, recommendations, and action items.',
          },
          {
            role: 'user',
            content: `Analyze this assessment note and provide structured output:

${transcriptionResult.transcription}

Provide:
1. Summary (2-3 sentences)
2. Key Points (bullet list)
3. Action Items (specific tasks)
4. Safety Concerns (if any)
5. Overall Sentiment (positive/neutral/concerning)

Format your response with clear sections.`,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!analysisResponse.ok) {
      // Return transcription even if analysis fails
      return {
        success: true,
        transcription: transcriptionResult.transcription,
        analysis: 'Analysis unavailable',
        keyPoints: [],
        sentiment: 'neutral',
        actionItems: [],
      };
    }

    const analysisData = await analysisResponse.json();
    const analysis = analysisData.choices[0].message.content;

    // Parse structured output
    const keyPoints = extractBulletPoints(analysis, 'Key Points');
    const actionItems = extractBulletPoints(analysis, 'Action Items');
    const sentiment = determineSentiment(analysis);

    return {
      success: true,
      transcription: transcriptionResult.transcription,
      analysis,
      keyPoints,
      sentiment,
      actionItems,
    };
  } catch (error) {
    console.error('[audioTranscription.ts]: Transcribe and analyze error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract bullet points from a section
 */
function extractBulletPoints(text: string, sectionName: string): string[] {
  const lines = text.split('\n');
  const sectionIndex = lines.findIndex((line) =>
    line.toLowerCase().includes(sectionName.toLowerCase())
  );

  if (sectionIndex === -1) return [];

  const points: string[] = [];
  for (let i = sectionIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
      points.push(line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim());
    } else if (line === '' || line.match(/^[A-Z][a-z]+:/)) {
      // End of section
      break;
    }
  }

  return points;
}

/**
 * Determine sentiment from analysis text
 */
function determineSentiment(text: string): 'positive' | 'neutral' | 'concerning' {
  const lowerText = text.toLowerCase();

  const concerningWords = [
    'concern',
    'risk',
    'danger',
    'unsafe',
    'hazard',
    'fall',
    'injury',
    'urgent',
  ];
  const positiveWords = [
    'good',
    'excellent',
    'safe',
    'appropriate',
    'adequate',
    'functional',
  ];

  const concernCount = concerningWords.reduce(
    (count, word) => count + (lowerText.includes(word) ? 1 : 0),
    0
  );
  const positiveCount = positiveWords.reduce(
    (count, word) => count + (lowerText.includes(word) ? 1 : 0),
    0
  );

  if (concernCount > 2) return 'concerning';
  if (positiveCount > concernCount) return 'positive';
  return 'neutral';
}

/**
 * Transcribe multiple audio files in batch
 */
export async function transcribeBatch(
  audioUris: string[],
  options?: TranscriptionOptions
): Promise<TranscriptionResult[]> {
  const results = await Promise.allSettled(
    audioUris.map((uri) => transcribeAudio(uri, options))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        error: 'Transcription failed',
      };
    }
  });
}
