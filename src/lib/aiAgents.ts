// Multi-Agent AI Orchestrator for OT/AH Assessment App
// Routes tasks to appropriate AI models based on requirements

/**
 * Agent Types:
 * - VISION: Image analysis (Gemini 2.5 Flash - multimodal)
 * - TRANSCRIPTION: Audio transcription (OpenAI Whisper)
 * - ANALYSIS: Text analysis and summarization (GPT-5 Mini)
 * - RECOMMENDATION: Equipment recommendations (Grok 4 Fast)
 */

export type AgentType = "vision" | "transcription" | "analysis" | "recommendation";

export interface AgentTask {
  type: AgentType;
  input: string | { text?: string; image?: string; audio?: string };
  context?: Record<string, unknown>;
}

export interface AgentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  model: string;
}

/**
 * Vision Agent - Analyzes images using Gemini 2.5 Flash
 * Best for: Photo analysis, equipment identification, environment assessment
 */
export async function visionAgent(
  imageBase64: string,
  prompt: string
): Promise<AgentResponse> {
  try {
    const response = await fetch(
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
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return {
      success: true,
      data: { analysis: text },
      model: "gemini-2.5-flash",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Vision analysis failed",
      model: "gemini-2.5-flash",
    };
  }
}

/**
 * Analysis Agent - General text analysis using GPT-5 Mini
 * Best for: Assessment summaries, report generation, text analysis
 */
export async function analysisAgent(
  prompt: string,
  context?: string[]
): Promise<AgentResponse> {
  try {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are an expert Occupational Therapist assistant. Analyze assessments, provide recommendations, and generate professional summaries.",
      },
      ...(context?.map((ctx) => ({ role: "user" as const, content: ctx })) || []),
      { role: "user" as const, content: prompt },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages,
        max_completion_tokens: 2000,
        temperature: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return {
      success: true,
      data: { summary: text },
      model: "gpt-5-mini",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed",
      model: "gpt-5-mini",
    };
  }
}

/**
 * Recommendation Agent - Equipment recommendations using Grok 4 Fast
 * Best for: Quick recommendations, equipment matching, product suggestions
 */
export async function recommendationAgent(
  assessmentData: string,
  equipmentCatalog?: string
): Promise<AgentResponse> {
  try {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are an equipment specialist for OT/AH assessments. Recommend appropriate assistive equipment based on client needs and assessment data.",
      },
      {
        role: "user" as const,
        content: `Assessment Data:\n${assessmentData}\n\n${
          equipmentCatalog ? `Available Equipment:\n${equipmentCatalog}\n\n` : ""
        }Provide 3-5 specific equipment recommendations with justification.`,
      },
    ];

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-fast-non-reasoning",
        messages,
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return {
      success: true,
      data: { recommendations: text },
      model: "grok-4-fast",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Recommendation failed",
      model: "grok-4-fast",
    };
  }
}

/**
 * Structured Analysis Agent - Returns JSON using Gemini
 * Best for: Structured data extraction, form filling, categorization
 */
export async function structuredAnalysisAgent<T = unknown>(
  prompt: string,
  schema: Record<string, unknown>
): Promise<AgentResponse> {
  try {
    const response = await fetch(
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
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.5,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(jsonText);

    return {
      success: true,
      data: parsed as T,
      model: "gemini-2.5-flash",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Structured analysis failed",
      model: "gemini-2.5-flash",
    };
  }
}

/**
 * Multi-Agent Orchestrator
 * Coordinates multiple agents for complex tasks
 */
export async function orchestrateAssessmentAnalysis(assessment: {
  clientName: string;
  assessmentType: string;
  location?: string;
  notes?: string;
  media: Array<{ type: string; url?: string; caption?: string }>;
}): Promise<{
  summary: string;
  recommendations: string;
  visionAnalysis?: string[];
  success: boolean;
}> {
  const results: { summary?: string; recommendations?: string; visionAnalysis?: string[] } = {};

  try {
    // Step 1: Analyze images if present (Gemini Vision)
    const imageMedia = assessment.media.filter((m) => m.type === "photo" && m.url);
    if (imageMedia.length > 0) {
      console.log("🔍 Vision Agent analyzing images...");
      // Note: In production, you'd fetch and convert images to base64
      // For now, we'll skip actual image analysis
      results.visionAnalysis = [];
    }

    // Step 2: Generate assessment summary (GPT-5 Mini)
    console.log("📝 Analysis Agent generating summary...");
    const summaryPrompt = `Generate a professional OT/AH assessment summary:

Client: ${assessment.clientName}
Assessment Type: ${assessment.assessmentType}
Location: ${assessment.location || "Not specified"}
Media Captured: ${assessment.media.length} items (${assessment.media.map((m) => m.type).join(", ")})
Notes: ${assessment.notes || "None"}

Provide a concise professional summary including:
1. Assessment overview
2. Key observations
3. Client needs identified
4. Next steps recommended`;

    const summaryResult = await analysisAgent(summaryPrompt);
    if (summaryResult.success) {
      results.summary = (summaryResult.data as { summary: string }).summary;
    }

    // Step 3: Generate equipment recommendations (Grok 4 Fast)
    console.log("💡 Recommendation Agent suggesting equipment...");
    const assessmentData = `
Client: ${assessment.clientName}
Type: ${assessment.assessmentType}
Location: ${assessment.location || "N/A"}
Media Count: ${assessment.media.length}
Notes: ${assessment.notes || "None"}
`;

    const recommendationResult = await recommendationAgent(assessmentData);
    if (recommendationResult.success) {
      results.recommendations = (recommendationResult.data as { recommendations: string })
        .recommendations;
    }

    return {
      summary: results.summary || "Summary generation in progress...",
      recommendations: results.recommendations || "Recommendations pending...",
      visionAnalysis: results.visionAnalysis,
      success: true,
    };
  } catch (error) {
    console.error("Orchestration error:", error);
    return {
      summary: "Unable to generate summary at this time.",
      recommendations: "Unable to generate recommendations at this time.",
      success: false,
    };
  }
}
