// Audio transcription service using Whisper API
// This service handles audio recording transcription for assessment notes

/**
 * Transcribe audio using OpenAI Whisper API
 * @param audioUri - Local file URI from expo-av recording
 * @returns Transcribed text
 */
export async function transcribeAudio(audioUri: string): Promise<{
  success: boolean;
  transcription?: string;
  error?: string;
}> {
  try {
    // Use XMLHttpRequest for proper React Native file upload
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Create FormData for multipart upload
      const formData = new FormData();

      // Append audio file with proper React Native format
      // Extract filename and ensure it has the right extension
      const fileName = audioUri.split("/").pop() || "recording.m4a";

      formData.append("file", {
        uri: audioUri,
        name: fileName,
        type: "audio/m4a",
      } as any);

      formData.append("model", "whisper-1");
      formData.append("language", "en");
      formData.append("response_format", "json");

      xhr.open("POST", "https://api.openai.com/v1/audio/transcriptions");
      xhr.setRequestHeader("Authorization", `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              transcription: data.text,
            });
          } catch (error) {
            reject({
              success: false,
              error: "Failed to parse transcription response",
            });
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject({
              success: false,
              error: errorData.error?.message || `Transcription failed with status ${xhr.status}`,
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
          error: "Network error during transcription",
        });
      };

      xhr.send(formData as any);
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown transcription error",
    };
  }
}

/**
 * Transcribe and analyze audio note for assessment
 * Combines transcription with AI analysis
 */
export async function transcribeAndAnalyzeAudioNote(audioUri: string): Promise<{
  success: boolean;
  transcription?: string;
  analysis?: string;
  keyPoints?: string[];
  error?: string;
}> {
  try {
    // Step 1: Transcribe audio
    const transcriptionResult = await transcribeAudio(audioUri);

    if (!transcriptionResult.success || !transcriptionResult.transcription) {
      return {
        success: false,
        error: transcriptionResult.error || "Failed to transcribe audio",
      };
    }

    // Step 2: Analyze transcription with Gemini 2.5 Flash
    const analysisResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are an OT/AH assistant. Extract key points and provide a brief analysis of assessment notes.\n\nAnalyze this assessment note and extract key points:\n\n${transcriptionResult.transcription}\n\nProvide:\n1. Brief summary (2-3 sentences)\n2. Key points (bullet list)\n3. Any action items or concerns`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!analysisResponse.ok) {
      // Return transcription even if analysis fails
      return {
        success: true,
        transcription: transcriptionResult.transcription,
        analysis: "Analysis unavailable",
        keyPoints: [],
      };
    }

    const analysisData = await analysisResponse.json();
    const analysis = analysisData.candidates?.[0]?.content?.parts?.[0]?.text ?? "Analysis unavailable";

    // Extract key points (simple parsing)
    const keyPoints = analysis
      .split("\n")
      .filter((line: string) => line.trim().startsWith("-") || line.trim().startsWith("•"))
      .map((line: string) => line.replace(/^[-•]\s*/, "").trim());

    return {
      success: true,
      transcription: transcriptionResult.transcription,
      analysis,
      keyPoints,
    };
  } catch (error) {
    console.error("Transcribe and analyze error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
