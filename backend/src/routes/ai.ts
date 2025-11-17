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

export default aiRouter;
