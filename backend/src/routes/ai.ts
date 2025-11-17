import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../types";

const aiRouter = new Hono<AppType>();

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

    const data = await response.json();
    const recommendations = data.choices[0].message.content;

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

    const data = await response.json();
    const content = data.choices[0].message.content;

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

// POST /api/ai/vision-analysis - Analyze images using Gemini
aiRouter.post("/vision-analysis", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { imageBase64, prompt } = body;

  if (!imageBase64 || !prompt) {
    return c.json({ error: "Missing imageBase64 or prompt" }, 400);
  }

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
      throw new Error("Gemini API request failed");
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return c.json({
      success: true,
      analysis,
      model: "gemini-2.5-flash",
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
    const prompt = `You are an AI assistant helping an Occupational Therapist conduct a video walkthrough assessment of a property for assistive technology and IoT device placement.

Current context:
- Rooms already scanned: ${roomsScanned?.join(", ") || "None"}
- Areas already scanned: ${areasScanned?.join(", ") || "None"}
- Current location: ${context || "Unknown"}

Analyze this video frame and provide:
1. What room/area type this appears to be
2. Estimated dimensions (length, width, height in meters)
3. Key features visible (windows, doors, fixtures, hazards)
4. Coverage assessment: What percentage of this space has been captured?
5. Guidance: What should the user film next? (specific direction: left, right, turn around, move to next room, etc.)
6. Safety concerns or accessibility issues visible

Respond in JSON format:
{
  "roomType": "bedroom|bathroom|kitchen|living|dining|hallway|entrance|outdoor|garage|patio|yard",
  "roomName": "suggested name",
  "dimensions": {"length": 4.5, "width": 3.8, "height": 2.7},
  "features": ["window on north wall", "door on east side"],
  "coveragePercent": 60,
  "guidance": "Turn 90 degrees right to capture the rest of the room",
  "safetyIssues": ["low lighting", "uneven floor"],
  "isComplete": false,
  "nextAction": "continue|finish_room|move_to_next"
}`;

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
                    data: frameBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gemini API request failed");
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const analysis = JSON.parse(analysisText);

    return c.json({
      success: true,
      analysis,
      model: "gemini-2.5-flash",
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

    // Use Gemini to analyze all frames and create comprehensive 3D map
    const prompt = `You are an expert in 3D spatial mapping and property assessment. Analyze these ${frames.length} video frames from a property walkthrough and create a comprehensive 3D house map.

Property type: ${propertyType || "unknown"}

Create a complete property map with:
1. All rooms with accurate dimensions and positions
2. All outdoor areas
3. Floor plan layout
4. Relative positioning of rooms to each other

Respond in JSON format:
{
  "propertyType": "single_family|apartment|condo|townhouse",
  "floors": 1,
  "totalArea": 150.5,
  "rooms": [
    {
      "name": "Living Room",
      "roomType": "living",
      "floor": 1,
      "length": 5.5,
      "width": 4.2,
      "height": 2.7,
      "position3D": {"x": 0, "y": 0, "z": 0},
      "features": ["large window", "fireplace", "hardwood floor"]
    }
  ],
  "areas": [
    {
      "name": "Front Yard",
      "areaType": "yard",
      "length": 10.0,
      "width": 8.0,
      "features": ["grass", "pathway"]
    }
  ]
}`;

    // For now, send first 3 frames (to manage token limits)
    const framePrompts = frames.slice(0, 3).map((frame: any, idx: number) => ({
      inline_data: {
        mime_type: "image/jpeg",
        data: frame.base64,
      },
    }));

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
              parts: [{ text: prompt }, ...framePrompts],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gemini API request failed");
    }

    const data = await response.json();
    const mapDataText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const mapData = JSON.parse(mapDataText);

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
      model: "gemini-2.5-flash",
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

export default aiRouter;
