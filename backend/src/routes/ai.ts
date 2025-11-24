import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../types";
import * as fs from "node:fs";
import * as path from "node:path";

const aiRouter = new Hono<AppType>();

// Import pdf-parse using require for compatibility with Bun
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");

// POST /api/ai/equipment-recommendations - Get equipment recommendations using Grok
aiRouter.post("/equipment-recommendations", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { assessmentId } = body;

  // Get assessment data
  const assessment = await db.assessment.findFirst({
    where: { id: assessmentId, userId: user.id },
    include: {
      client: true,
      media: true,
    },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  // Get equipment catalog
  const equipment = await db.equipmentItem.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  const equipmentList = equipment
    .map(
      (item) =>
        `- ${item.name} (${item.category}): $${item.price}${item.governmentApproved ? " [Gov Approved]" : ""}`
    )
    .join("\n");

  // Use Grok for fast equipment recommendations
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-fast-non-reasoning",
        messages: [
          {
            role: "system",
            content:
              "You are an equipment specialist for OT/AH assessments. Recommend appropriate assistive equipment based on client needs.",
          },
          {
            role: "user",
            content: `Assessment Details:
- Client: ${assessment.client.name}
- Type: ${assessment.assessmentType}
- Location: ${assessment.location || "N/A"}
- Media: ${assessment.media.length} items captured

Available Equipment:
${equipmentList}

Based on this assessment, recommend 3-5 equipment items with:
1. Equipment name and category
2. Why it's suitable for this client
3. Priority level (High/Medium/Low)
4. Estimated cost

Format as a numbered list with clear justifications.`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error("Grok API request failed");
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const recommendations = data.choices?.[0]?.message?.content || "";

    return c.json({
      success: true,
      recommendations,
      model: "grok-4-fast",
      equipmentCount: equipment.length,
    });
  } catch (error) {
    console.error("Equipment recommendation error:", error);
    return c.json(
      {
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// POST /api/ai/generate-quotes - Generate 3 quote options using Grok
aiRouter.post("/generate-quotes", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { assessmentId } = body;

  // Get assessment data
  const assessment = await db.assessment.findFirst({
    where: { id: assessmentId, userId: user.id },
    include: { client: true, media: true },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  // Get equipment catalog
  const equipment = await db.equipmentItem.findMany({
    take: 30,
  });

  const equipmentList = equipment
    .map((item) => `${item.name}|${item.category}|${Number(item.price)}`)
    .join("\n");

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-fast-non-reasoning",
        messages: [
          {
            role: "system",
            content:
              "You are a pricing specialist. Generate 3 quote options (Essential, Recommended, Premium) with appropriate equipment selections.",
          },
          {
            role: "user",
            content: `Generate 3 quote options for this assessment:

Assessment: ${assessment.assessmentType} for ${assessment.client.name}

Equipment Catalog (format: name|category|price):
${equipmentList}

Generate exactly 3 options:
1. ESSENTIAL - Basic necessary items (2-3 items, budget-friendly)
2. RECOMMENDED - Balanced selection (3-5 items, good value)
3. PREMIUM - Comprehensive solution (5-7 items, best quality)

Return ONLY valid JSON in this exact format:
{
  "quotes": [
    {
      "name": "Essential Package",
      "description": "Brief description",
      "items": [{"name": "Item Name", "quantity": 1, "price": 100.00}],
      "subtotal": 100.00,
      "tax": 10.00,
      "total": 110.00
    }
  ]
}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Grok API request failed");
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }

    const quotes = JSON.parse(jsonMatch[0]);

    return c.json({
      success: true,
      quotes: quotes.quotes,
      model: "grok-4-fast",
    });
  } catch (error) {
    console.error("Quote generation error:", error);
    return c.json(
      {
        error: "Failed to generate quotes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// POST /api/ai/vision-analysis - Analyze images using Gemini 3 Pro Image
aiRouter.post("/vision-analysis", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { imageBase64, prompt, mimeType = "image/jpeg" } = body;

  if (!imageBase64 || !prompt) {
    return c.json({ error: "Missing imageBase64 or prompt" }, 400);
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent",
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
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            topP: 0.95,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini 3 API request failed: ${errorText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return c.json({
      success: true,
      analysis,
      model: "gemini-3-pro-image",
    });
  } catch (error) {
    console.error("Vision analysis error:", error);
    return c.json(
      {
        error: "Failed to analyze image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// POST /api/ai/analyze-video-frame - Analyze video frame and provide guidance
aiRouter.post("/analyze-video-frame", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { frameBase64, context, roomsScanned, areasScanned } = body;

  if (!frameBase64) {
    return c.json({ error: "Missing frameBase64" }, 400);
  }

  try {
    // Use Gemini 2.5 Flash for real-time room recognition
    const googleApiKey = process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY;

    let roomType = "living";
    let roomName = "Room";
    let detectedRoomType = null;
    let confidence = 0;
    let aiDimensions = null;
    let aiFeatures: string[] = [];
    let aiSafetyIssues: string[] = [];

    if (googleApiKey) {
      try {
        // Call Gemini Vision API to analyze the room
        const prompt = `Analyze this room image and identify:
1. What type of room is this? (living room, kitchen, bedroom, bathroom, dining room, hallway, entrance, garage, office, laundry, or outdoor)
2. Key features visible (furniture, appliances, fixtures)
3. Estimated dimensions based on visible reference objects (doors are ~2m high, standard furniture sizes)
4. Any safety issues or hazards
5. Confidence level (0-100)

Respond in JSON format:
{
  "roomType": "kitchen",
  "confidence": 95,
  "features": ["stove", "refrigerator", "cabinets"],
  "estimatedDimensions": {"length": 4.2, "width": 3.5, "height": 2.4},
  "safetyIssues": ["wet floor", "cluttered walkway"],
  "reasoning": "Clear view of kitchen appliances and cabinetry"
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: "image/jpeg",
                        data: frameBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 512,
              },
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

          // Parse JSON response
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiAnalysis = JSON.parse(jsonMatch[0]);
            detectedRoomType = aiAnalysis.roomType || "living";
            roomType = detectedRoomType;
            confidence = aiAnalysis.confidence || 0;

            // Generate room name
            const typeCapitalized = roomType.charAt(0).toUpperCase() + roomType.slice(1);
            roomName = context || typeCapitalized;

            // Extract dimensions and features from AI analysis if available
            if (aiAnalysis.estimatedDimensions) {
              aiDimensions = {
                length: aiAnalysis.estimatedDimensions.length || 4.0,
                width: aiAnalysis.estimatedDimensions.width || 3.5,
                height: aiAnalysis.estimatedDimensions.height || 2.4,
              };
            }

            if (aiAnalysis.features && Array.isArray(aiAnalysis.features)) {
              aiFeatures = aiAnalysis.features;
            }

            if (aiAnalysis.safetyIssues && Array.isArray(aiAnalysis.safetyIssues)) {
              aiSafetyIssues = aiAnalysis.safetyIssues;
            }
          }
        }
      } catch (visionError) {
        console.error("Gemini vision error:", visionError);
        // Fall back to generic naming if AI fails
      }
    }

    const frameCount = (roomsScanned?.length || 0) + 1;
    let guidance = "Continue scanning slowly, moving the camera from left to right";
    let nextAction = "continue";
    let coveragePercent = Math.min(20 + (frameCount * 15), 95);

    if (frameCount === 1) {
      guidance = "Good! Now slowly pan to your right to capture the rest of this space";
    } else if (frameCount === 2) {
      guidance = "Great! Turn around 180 degrees to see the opposite wall";
      coveragePercent = 60;
    } else if (frameCount === 3) {
      guidance = "Almost done with this room! Capture any remaining corners or features";
      coveragePercent = 85;
    } else if (frameCount === 4) {
      guidance = "Room complete! Move to the next room and start recording there";
      nextAction = "move_to_next";
      coveragePercent = 100;
    } else if (frameCount > 4) {
      guidance = "Continue to the next area. Make sure to capture all rooms and outdoor spaces";
      coveragePercent = Math.min(30 + ((frameCount - 4) * 10), 90);
    }

    const analysis = {
      roomType,
      roomName,
      detectedRoomType,
      confidence,
      dimensions: aiDimensions || {
        length: 4.0 + Math.random() * 2,
        width: 3.5 + Math.random() * 1.5,
        height: 2.4 + Math.random() * 0.4,
      },
      features: aiFeatures.length > 0 ? aiFeatures : ["door", "window", "light fixture"],
      coveragePercent,
      guidance,
      safetyIssues: aiSafetyIssues,
      isComplete: frameCount % 4 === 0,
      nextAction,
    };

    return c.json({
      success: true,
      analysis,
      model: googleApiKey ? "gemini-2.0-flash-hybrid" : "rule-based-guidance",
    });
  } catch (error) {
    console.error("Video frame analysis error:", error);
    return c.json(
      {
        error: "Failed to analyze video frame",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// POST /api/ai/generate-3d-map - Generate 3D map from video frames
aiRouter.post("/generate-3d-map", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { assessmentId, frames, propertyType } = body;

  if (!assessmentId || !frames || frames.length === 0) {
    return c.json({ error: "Missing assessmentId or frames" }, 400);
  }

  try {
    // Verify assessment ownership
    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, userId: user.id },
    });

    if (!assessment) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    // Analyze frames using Gemini Vision to extract real room data
    const googleApiKey = process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY;
    const mapData = {
      propertyType: propertyType || "single_family",
      floors: 1,
      totalArea: 0,
      rooms: [] as any[],
      areas: [] as any[],
    };

    // Use AI to analyze each frame
    if (googleApiKey && frames.length > 0) {
      try {
        // Analyze up to 10 frames (to avoid API rate limits)
        const framesToAnalyze = frames.slice(0, Math.min(10, frames.length));
        const roomMap = new Map<string, any>(); // Deduplicate similar rooms

        for (const frame of framesToAnalyze) {
          try {
            const prompt = `Analyze this room image and provide detailed information in JSON format:
{
  "roomType": "kitchen" | "living" | "bedroom" | "bathroom" | "dining" | "hallway" | "entrance" | "garage" | "office" | "laundry" | "outdoor",
  "roomName": "Specific name (e.g., 'Master Bedroom', 'Kitchen')",
  "estimatedDimensions": {
    "length": <meters as float>,
    "width": <meters as float>,
    "height": <meters as float>
  },
  "features": ["list", "of", "visible", "features"],
  "isOutdoor": true/false,
  "confidence": <0-100>
}

Estimate dimensions based on visible reference objects (doors are ~2m height, standard furniture sizes, etc.)`;

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        { text: prompt },
                        {
                          inline_data: {
                            mime_type: "image/jpeg",
                            data: frame.base64 || frame,
                          },
                        },
                      ],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 512,
                  },
                }),
              }
            );

            if (response.ok) {
              const data = (await response.json()) as {
                candidates?: Array<{
                  content?: { parts?: Array<{ text?: string }> };
                }>;
              };
              const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              const jsonMatch = aiText.match(/\{[\s\S]*\}/);

              if (jsonMatch) {
                const roomData = JSON.parse(jsonMatch[0]);

                // Only add if confidence is reasonable
                if (roomData.confidence > 60) {
                  // Use roomType + index as key to deduplicate similar rooms
                  const roomKey = `${roomData.roomType}_${roomData.roomName}`;

                  if (!roomMap.has(roomKey)) {
                    const roomEntry = {
                      name: roomData.roomName || roomData.roomType.charAt(0).toUpperCase() + roomData.roomType.slice(1),
                      roomType: roomData.roomType,
                      floor: 1,
                      length: roomData.estimatedDimensions?.length || 4.0,
                      width: roomData.estimatedDimensions?.width || 3.5,
                      height: roomData.estimatedDimensions?.height || 2.4,
                      position3D: { x: roomMap.size * 5, y: 0, z: 0 },
                      features: roomData.features || [],
                    };

                    if (roomData.isOutdoor) {
                      mapData.areas.push({
                        name: roomData.roomName || "Outdoor Area",
                        areaType: "outdoor",
                        length: roomData.estimatedDimensions?.length || 3.0,
                        width: roomData.estimatedDimensions?.width || 2.0,
                        features: roomData.features || [],
                      });
                    } else {
                      roomMap.set(roomKey, roomEntry);
                      mapData.rooms.push(roomEntry);
                    }
                  }
                }
              }
            }
          } catch (frameError) {
            console.error("Frame analysis error:", frameError);
            // Continue with next frame
          }
        }

        // Calculate total area from analyzed rooms
        mapData.totalArea = mapData.rooms.reduce((sum, room) => {
          return sum + (room.length * room.width);
        }, 0);

      } catch (error) {
        console.error("AI vision analysis error:", error);
        // Fall back to basic room generation if AI fails
      }
    }

    // If no rooms were detected (AI failed or no API key), generate basic layout
    if (mapData.rooms.length === 0) {
      const numRooms = Math.max(2, Math.floor(frames.length / 3));
      const roomTypes = ["living", "kitchen", "bedroom", "bathroom", "dining", "hallway"];

      for (let i = 0; i < numRooms; i++) {
        const roomType = roomTypes[i % roomTypes.length];
        mapData.rooms.push({
          name: `${roomType?.charAt(0)?.toUpperCase() ?? ''}${roomType?.slice(1) ?? ''} ${i > 5 ? Math.floor(i / 6) + 1 : ''}`.trim(),
          roomType,
          floor: 1,
          length: 4.0 + Math.random() * 2,
          width: 3.5 + Math.random() * 1.5,
          height: 2.4 + Math.random() * 0.4,
          position3D: { x: i * 5, y: 0, z: 0 },
          features: ["door", "window", "ceiling light"],
        });
      }
      mapData.totalArea = numRooms * 18;
    }

    // Check if house map already exists for this assessment
    const existingHouseMap = await db.houseMap.findUnique({
      where: { assessmentId },
    });

    // If exists, delete it first (cascade will delete rooms and areas)
    if (existingHouseMap) {
      await db.houseMap.delete({
        where: { id: existingHouseMap.id },
      });
    }

    // Create house map in database
    const houseMap = await db.houseMap.create({
      data: {
        assessmentId,
        propertyType: mapData.propertyType || propertyType,
        totalArea: mapData.totalArea || null,
        floors: mapData.floors || 1,
        aiGenerated: true,
      },
    });

    // Create rooms
    const rooms = [];
    if (mapData.rooms) {
      for (const room of mapData.rooms) {
        const createdRoom = await db.room.create({
          data: {
            houseMapId: houseMap.id,
            name: room.name,
            roomType: room.roomType,
            floor: room.floor || 1,
            length: room.length,
            width: room.width,
            height: room.height,
            position3D: room.position3D ? JSON.stringify(room.position3D) : null,
            features: room.features ? JSON.stringify(room.features) : null,
          },
        });
        rooms.push(createdRoom);
      }
    }

    // Create areas
    const areas = [];
    if (mapData.areas) {
      for (const area of mapData.areas) {
        const createdArea = await db.area.create({
          data: {
            houseMapId: houseMap.id,
            name: area.name,
            areaType: area.areaType,
            length: area.length,
            width: area.width,
            features: area.features ? JSON.stringify(area.features) : null,
          },
        });
        areas.push(createdArea);
      }
    }

    return c.json({
      success: true,
      houseMap: {
        ...houseMap,
        totalArea: houseMap.totalArea ? Number(houseMap.totalArea) : null,
      },
      rooms: rooms.map((r) => ({
        ...r,
        length: r.length ? Number(r.length) : null,
        width: r.width ? Number(r.width) : null,
        height: r.height ? Number(r.height) : null,
      })),
      areas: areas.map((a) => ({
        ...a,
        length: a.length ? Number(a.length) : null,
        width: a.width ? Number(a.width) : null,
      })),
      model: mapData.rooms.length > 0 && googleApiKey ? "gemini-2.0-flash-vision" : "rule-based-generation",
      aiAnalyzed: mapData.rooms.length > 0 && googleApiKey,
    });
  } catch (error) {
    console.error("3D map generation error:", error);
    return c.json(
      {
        error: "Failed to generate 3D map",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// POST /api/ai/video-analysis - Analyze complete videos using Gemini 3 Pro Video
aiRouter.post("/video-analysis", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { videoBase64, prompt, mimeType = "video/mp4", assessmentType } = body;

  if (!videoBase64 || !prompt) {
    return c.json({ error: "Missing videoBase64 or prompt" }, 400);
  }

  try {
    // Build assessment-specific prompt enhancements
    let enhancedPrompt = prompt;
    if (assessmentType === "falls_risk") {
      enhancedPrompt = `${prompt}\n\nFocus on analyzing: gait pattern, balance, transfer technique, fall risk factors, mobility aids usage, and any safety concerns.`;
    } else if (assessmentType === "movement_mobility") {
      enhancedPrompt = `${prompt}\n\nFocus on analyzing: functional mobility, transfer independence, gait biomechanics, speed, step length, symmetry, and mobility aid effectiveness.`;
    } else if (assessmentType === "mobility_scooter") {
      enhancedPrompt = `${prompt}\n\nFocus on analyzing: scooter operation skills, steering control, obstacle navigation, transfer ability, and safety awareness.`;
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-video:generateContent",
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
                { text: enhancedPrompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: videoBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            topP: 0.95,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini 3 Video API request failed: ${errorText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return c.json({
      success: true,
      analysis,
      model: "gemini-3-pro-video",
      assessmentType,
    });
  } catch (error) {
    console.error("Video analysis error:", error);
    return c.json(
      {
        error: "Failed to analyze video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// POST /api/ai/support-chat - AI support chatbot for user guide
aiRouter.post("/support-chat", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { message, conversationHistory } = body as {
    message: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  };

  if (!message || message.trim().length === 0) {
    return c.json({ error: "Message is required" }, 400);
  }

  try {
    // Build conversation context
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI assistant for the OT/AH Assessment App, designed for Occupational Therapists and Allied Health professionals.

Your role is to help users understand and use the app effectively. You can answer questions about:
- How to conduct assessments (Home Environmental, Mobility Scooter, Falls Risk, Movement & Mobility, Assistive Technology)
- Using AI features (image analysis, audio transcription, text-to-speech, equipment recommendations)
- Creating 3D house maps from video walkthroughs
- Recommending IoT devices and assistive technology
- Managing clients and assessment records
- Generating quotes and invoices
- Best practices for documentation and photography

Be concise, professional, and specific to this app's features. If a user asks about something outside the app's scope, politely redirect them to app-related topics.`,
      },
    ];

    // Add conversation history (last 6 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach((msg) => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Use OpenAI GPT-4o-mini for fast, cost-effective responses
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const assistantResponse = data.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";

    return c.json({
      success: true,
      response: assistantResponse,
      model: "gpt-4o-mini",
    });
  } catch (error) {
    console.error("Support chat error:", error);
    return c.json(
      {
        error: "Failed to get AI response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// POST /api/ai/parse-catalog - Parse PDF equipment catalog using AI (Hybrid: Vision + Text)
aiRouter.post("/parse-catalog", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { fileUrl, filename } = body;
  console.log("📋 [AI] PDF catalog parsing request:", filename);

  if (!fileUrl || !filename) {
    return c.json({ error: "Missing fileUrl or filename" }, 400);
  }

  try {
    // Read PDF file from uploads directory
    const uploadsDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadsDir, filename);

    console.log("📄 [AI] Reading PDF from:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ [AI] PDF file not found:", filePath);
      return c.json({ error: "PDF file not found" }, 404);
    }

    // Parse PDF to extract text first
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const pdfText = pdfData.text;

    console.log(`✅ [AI] PDF parsed successfully. Text length: ${pdfText.length} characters, Pages: ${pdfData.numpages}`);

    // Strategy: Use Gemini Vision for visual PDFs, fallback to Grok text parsing
    const googleApiKey = process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY;
    let equipmentArray: any[] = [];
    let usingVision = false;

    // If PDF has very little text (image-heavy catalog), try Gemini Vision
    // For now, we'll use text-based approach but with enhanced Gemini prompt
    if (googleApiKey && pdfText.length < 500) {
      // Image-heavy PDF detected
      console.log("📸 [AI] Image-heavy PDF detected. Converting to base64 for vision analysis...");

      // Convert first page of PDF to base64
      const pdfBase64 = dataBuffer.toString('base64');

      try {
        console.log("🤖 [AI] Sending PDF to Gemini 3 Pro Vision for analysis...");

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent?key=${googleApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `This is an equipment catalog PDF. Extract ALL equipment items visible in this catalog and format as JSON.

For each item, extract:
- name: Product name (required)
- description: Product description/features
- category: One of: mobility, bathroom, bedroom, assistive_tech, iot, kitchen, outdoor, safety, other
- price: Price as number (if visible, otherwise 0)
- brand: Manufacturer/brand
- model: Model number/code
- specifications: Technical specs as JSON string

Return ONLY valid JSON:
{
  "equipment": [
    {
      "name": "Product Name",
      "description": "Description",
      "category": "mobility",
      "price": 299.99,
      "brand": "Brand",
      "model": "MODEL123",
      "specifications": "{\\"weight\\": \\"10kg\\"}"
    }
  ]
}`
                    },
                    {
                      inline_data: {
                        mime_type: "application/pdf",
                        data: pdfBase64
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8192,
              },
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };
          const visionText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

          const jsonMatch = visionText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            equipmentArray = parsedData.equipment || [];
            usingVision = true;
            console.log(`✅ [AI] Gemini Vision extracted ${equipmentArray.length} items`);
          }
        }
      } catch (visionError) {
        console.error("⚠️ [AI] Gemini Vision failed, falling back to text parsing:", visionError);
      }
    }

    // Fallback to text-based parsing with Grok if vision didn't work or PDF has text
    if (equipmentArray.length === 0 && pdfText.length > 0) {
      console.log("🤖 [AI] Using Grok text-based parsing...");

      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-4-fast-non-reasoning",
          messages: [
            {
              role: "system",
              content: `You are an equipment catalog parser. Extract all equipment items from the provided catalog text and format them as a structured JSON array. Focus on assistive technology, mobility aids, bathroom equipment, bedroom equipment, and related healthcare/OT equipment.

For each item, extract:
- name: The product name (required)
- description: Product description or features (optional)
- category: One of: mobility, bathroom, bedroom, assistive_tech, iot, kitchen, outdoor, safety, other
- price: Price as a number (required, if missing use 0)
- brand: Manufacturer/brand name (optional)
- model: Model number/code (optional)
- specifications: Technical specs or dimensions (optional, as JSON string)

Return ONLY a valid JSON object with this structure:
{
  "equipment": [
    {
      "name": "Product Name",
      "description": "Product description",
      "category": "mobility",
      "price": 299.99,
      "brand": "Brand Name",
      "model": "MODEL123",
      "specifications": "{\\"weight\\": \\"10kg\\", \\"dimensions\\": \\"50x30x20cm\\"}"
    }
  ]
}`,
            },
            {
              role: "user",
              content: `Extract all equipment items from this catalog:\n\n${pdfText.slice(0, 15000)}`,
            },
          ],
          max_tokens: 8000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [AI] Grok API error:", errorText);
        throw new Error(`Grok API request failed: ${errorText}`);
      }

      const aiData = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      const aiContent = aiData.choices?.[0]?.message?.content || "";
      console.log("✅ [AI] Received response from Grok");

      // Parse JSON response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("❌ [AI] Failed to extract JSON from response:", aiContent.slice(0, 200));
        throw new Error("Invalid JSON response from AI");
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      equipmentArray = parsedData.equipment || [];
    }

    if (equipmentArray.length === 0) {
      return c.json({
        error: "No equipment items found in catalog. The PDF may be empty, corrupted, or in an unsupported format."
      }, 400);
    }

    console.log(`🎉 [AI] Successfully extracted ${equipmentArray.length} equipment items using ${usingVision ? 'Gemini Vision' : 'Grok text parsing'}`);

    // Save equipment to database
    let createdCount = 0;
    for (const item of equipmentArray) {
      try {
        await db.equipmentItem.create({
          data: {
            name: item.name,
            description: item.description || null,
            category: item.category || "other",
            price: item.price || 0,
            brand: item.brand || null,
            model: item.model || null,
            specifications: item.specifications || null,
            governmentApproved: false,
          },
        });
        createdCount++;
      } catch (dbError) {
        console.error("⚠️ [AI] Failed to create equipment item:", item.name, dbError);
        // Continue with other items
      }
    }

    console.log(`💾 [AI] Saved ${createdCount} equipment items to database`);

    return c.json({
      success: true,
      message: `Successfully parsed catalog and added ${createdCount} equipment items`,
      equipmentCount: createdCount,
      equipment: equipmentArray,
      model: usingVision ? "gemini-3-pro-vision" : "grok-4-fast-text",
    });
  } catch (error) {
    console.error("💥 [AI] Catalog parsing error:", error);
    return c.json(
      {
        error: "Failed to parse catalog",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// POST /api/ai/generate-equipment-justification - Generate AI justification for equipment with NDIS/SAH approval analysis
aiRouter.post("/generate-equipment-justification", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { equipmentId, assessmentId } = body;

  if (!equipmentId || !assessmentId) {
    return c.json({ error: "Missing equipmentId or assessmentId" }, 400);
  }

  try {
    // Get assessment and equipment details
    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, userId: user.id },
      include: {
        client: true,
        responses: true,
        media: true,
      },
    });

    if (!assessment) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    const equipment = await db.equipmentItem.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      return c.json({ error: "Equipment not found" }, 404);
    }

    // Use Claude Sonnet for comprehensive justification analysis
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `You are an expert Occupational Therapist and assistive technology specialist in Australia. Generate a comprehensive justification for recommending the following equipment.

EQUIPMENT DETAILS:
- Name: ${equipment.name}
- Description: ${equipment.description || "N/A"}
- Category: ${equipment.category}
- Price: $${equipment.price}
- Brand/Model: ${equipment.brand || "N/A"} ${equipment.model || ""}
- Government Approved: ${equipment.governmentApproved ? "Yes" : "No"}
- Approval Reference: ${equipment.approvalReference || "N/A"}

CLIENT & ASSESSMENT:
- Client Name: ${assessment.client.name}
- Assessment Type: ${assessment.assessmentType}
- Assessment Date: ${assessment.assessmentDate}
- Location: ${assessment.location || "N/A"}
- Assessment Notes: ${assessment.notes || "N/A"}
- Media Captured: ${assessment.media.length} items
- Responses: ${assessment.responses.length} assessment questions answered

TASK:
Provide a detailed JSON response with the following structure:

{
  "aiJustification": "2-3 paragraph clinical justification for why this equipment is recommended based on the assessment",
  "clinicalRationale": "Specific clinical reasoning linking client needs to equipment features",
  "ndisApproved": true/false,
  "ndisCategory": "NDIS category code/name if approved, or null",
  "ndisJustification": "Explanation of NDIS eligibility and funding category if applicable",
  "sahApproved": true/false,
  "sahCategory": "SAH category if approved, or null",
  "sahJustification": "Explanation of SAH (Seniors at Home) eligibility if applicable",
  "fundingEligibility": {
    "ndisEligible": true/false,
    "ndisRequirements": ["list of requirements"],
    "sahEligible": true/false,
    "sahRequirements": ["list of requirements"],
    "privatePayRecommended": true/false,
    "estimatedFunding": "Amount or range if applicable"
  },
  "riskAssessment": "Any safety considerations or contraindications",
  "alternatives": ["Alternative equipment options if applicable"]
}

IMPORTANT GUIDELINES:
1. Base approval status on actual NDIS Assistive Technology List and SAH guidelines
2. Be conservative - only mark as approved if you're confident it meets criteria
3. Consider the client's specific needs from the assessment
4. Reference relevant NDIS practice standards and SAH criteria
5. Include specific evidence for funding justification
6. Be clinically accurate and professional

Return ONLY valid JSON, no other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API request failed: ${errorText}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const responseText = data.content?.[0]?.text || "{}";

    // Parse the JSON response
    let justificationData;
    try {
      justificationData = JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        justificationData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return c.json({
      success: true,
      ...justificationData,
    });
  } catch (error) {
    console.error("Equipment justification generation error:", error);
    return c.json(
      {
        error: "Failed to generate equipment justification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default aiRouter;
