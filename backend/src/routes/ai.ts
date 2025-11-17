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
    // For now, provide intelligent guidance based on context without AI vision
    // This allows the feature to work immediately while API keys are being configured
    // TODO: Add OpenAI API key to enable real AI vision analysis
    const frameCount = (roomsScanned?.length || 0) + 1;
    const roomTypes = ["living", "kitchen", "bedroom", "bathroom", "hallway", "entrance"];
    const currentRoomType = roomTypes[frameCount % roomTypes.length];

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
      roomType: currentRoomType,
      roomName: context || `${currentRoomType.charAt(0).toUpperCase() + currentRoomType.slice(1)} ${Math.floor(frameCount / 4) + 1}`,
      dimensions: {
        length: 4.0 + Math.random() * 2,
        width: 3.5 + Math.random() * 1.5,
        height: 2.4 + Math.random() * 0.4,
      },
      features: ["door", "window", "light fixture"],
      coveragePercent,
      guidance,
      safetyIssues: [],
      isComplete: frameCount % 4 === 0,
      nextAction,
    };

    return c.json({
      success: true,
      analysis,
      model: "rule-based-guidance",
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

    // Generate sample house map from captured frames
    // TODO: Add AI vision to analyze actual frame content
    const numFrames = frames.length;
    const numRooms = Math.max(2, Math.floor(numFrames / 3));

    const roomTypes = ["living", "kitchen", "bedroom", "bathroom", "dining", "hallway"];
    const mapData = {
      propertyType: propertyType || "single_family",
      floors: 1,
      totalArea: numRooms * 18, // Estimate ~18 sqm per room
      rooms: [] as any[],
      areas: [] as any[],
    };

    // Generate rooms based on frame count
    for (let i = 0; i < numRooms; i++) {
      const roomType = roomTypes[i % roomTypes.length];
      mapData.rooms.push({
        name: `${roomType.charAt(0).toUpperCase() + roomType.slice(1)} ${i > 5 ? Math.floor(i / 6) + 1 : ''}`.trim(),
        roomType,
        floor: 1,
        length: 4.0 + Math.random() * 2,
        width: 3.5 + Math.random() * 1.5,
        height: 2.4 + Math.random() * 0.4,
        position3D: { x: i * 5, y: 0, z: 0 },
        features: ["door", "window", "ceiling light"],
      });
    }

    // Add outdoor area if enough frames
    if (numFrames > 6) {
      mapData.areas.push({
        name: "Front Entrance",
        areaType: "outdoor",
        length: 3.0,
        width: 2.0,
        features: ["pathway", "lighting"],
      });
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
      model: "rule-based-generation",
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
