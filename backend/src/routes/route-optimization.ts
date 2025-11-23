import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { env } from "../env";
import Anthropic from "@anthropic-ai/sdk";

const routeOptimizationRouter = new Hono<AppType>();

// Schema for route optimization request
const optimizeRouteSchema = z.object({
  appointmentIds: z.array(z.string()).min(1, "At least one appointment is required"),
  startLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      address: z.string(),
    })
    .optional(),
});

// POST /api/route-optimization/optimize - Optimize route for multiple appointments
routeOptimizationRouter.post("/optimize", zValidator("json", optimizeRouteSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = c.req.valid("json");
    console.log(`🗺️  [Route] Optimizing route for ${body.appointmentIds.length} appointments`);

    // Fetch appointments with client location data
    const appointments = await db.appointment.findMany({
      where: {
        id: { in: body.appointmentIds },
        userId: user.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    if (appointments.length === 0) {
      return c.json({ error: "No appointments found" }, 404);
    }

    // Filter appointments with valid client locations
    const appointmentsWithLocations = appointments.filter(
      (apt) =>
        (apt.client?.latitude && apt.client?.longitude) ||
        (apt.location && apt.location.includes(",")) // Check if location has lat,long format
    );

    if (appointmentsWithLocations.length === 0) {
      return c.json(
        {
          error: "No appointments have valid location data",
          message: "Please ensure clients have addresses with coordinates or appointments have location set",
        },
        400
      );
    }

    // Prepare location data for AI optimization
    const locationData = appointmentsWithLocations.map((apt) => {
      let latitude: number;
      let longitude: number;
      let address: string;

      if (apt.client?.latitude && apt.client?.longitude) {
        latitude = apt.client.latitude;
        longitude = apt.client.longitude;
        address = apt.client.address || "Unknown address";
      } else if (apt.location) {
        // Try to parse lat,long from location string
        const coords = apt.location.split(",").map((s) => parseFloat(s.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          latitude = coords[0];
          longitude = coords[1];
          address = apt.location;
        } else {
          // Skip this appointment if we can't parse coordinates
          return null;
        }
      } else {
        return null;
      }

      return {
        appointmentId: apt.id,
        title: apt.title,
        clientName: apt.client?.name || "Unknown client",
        startTime: apt.startTime.toISOString(),
        endTime: apt.endTime.toISOString(),
        latitude,
        longitude,
        address,
      };
    });

    const validLocations = locationData.filter((loc) => loc !== null);

    if (validLocations.length === 0) {
      return c.json({ error: "Failed to parse location data for appointments" }, 400);
    }

    // Use AI to optimize the route
    console.log("🤖 [Route] Using AI to optimize route...");
    const optimizedRoute = await optimizeRouteWithAI(
      validLocations,
      body.startLocation || {
        latitude: validLocations[0].latitude,
        longitude: validLocations[0].longitude,
        address: "Starting point",
      }
    );

    console.log(`✅ [Route] Route optimized successfully`);

    return c.json({
      success: true,
      optimizedRoute,
      appointmentsCount: validLocations.length,
      totalEstimatedDuration: optimizedRoute.totalEstimatedDuration,
      totalDistance: optimizedRoute.totalDistance,
    });
  } catch (error) {
    console.error("❌ [Route] Route optimization error:", error);
    return c.json({ error: "Failed to optimize route" }, 500);
  }
});

// GET /api/route-optimization/appointments/:date - Get appointments for a specific day
routeOptimizationRouter.get("/appointments/:date", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const dateStr = c.req.param("date");
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return c.json({ error: "Invalid date format" }, 400);
    }

    // Get start and end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch appointments for the day
    const appointments = await db.appointment.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["scheduled", "confirmed"],
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return c.json({
      success: true,
      date: dateStr,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        title: apt.title,
        startTime: apt.startTime,
        endTime: apt.endTime,
        clientName: apt.client?.name || null,
        address: apt.client?.address || apt.location || null,
        hasLocation:
          (apt.client?.latitude && apt.client?.longitude) ||
          (apt.location && apt.location.includes(",")),
      })),
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    return c.json({ error: "Failed to fetch appointments" }, 500);
  }
});

// Helper function to optimize route using AI
async function optimizeRouteWithAI(
  locations: Array<{
    appointmentId: string;
    title: string;
    clientName: string;
    startTime: string;
    endTime: string;
    latitude: number;
    longitude: number;
    address: string;
  }>,
  startLocation: {
    latitude: number;
    longitude: number;
    address: string;
  }
): Promise<{
  route: Array<{
    appointmentId: string;
    order: number;
    title: string;
    clientName: string;
    startTime: string;
    endTime: string;
    latitude: number;
    longitude: number;
    address: string;
    estimatedTravelTime: number;
    estimatedDistance: number;
    directions: string;
    appleMapUrl: string;
  }>;
  totalEstimatedDuration: number;
  totalDistance: number;
  optimizationNotes: string;
}> {
  try {
    if (!env.ANTHROPIC_API_KEY) {
      console.warn("⚠️  [Route] No Anthropic API key found, using default ordering");
      return createDefaultRoute(locations, startLocation);
    }

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      baseURL: env.ANTHROPIC_BASE_URL,
    });

    // Create prompt for AI to optimize route
    const prompt = `You are a logistics optimization AI. You need to optimize the route for visiting multiple client locations to minimize total travel time and distance.

Starting Location:
- Address: ${startLocation.address}
- Coordinates: ${startLocation.latitude}, ${startLocation.longitude}

Appointments to visit (in chronological order by scheduled time):
${locations
  .map(
    (loc, idx) => `
${idx + 1}. ${loc.title} - ${loc.clientName}
   - Scheduled: ${new Date(loc.startTime).toLocaleString()}
   - Address: ${loc.address}
   - Coordinates: ${loc.latitude}, ${loc.longitude}
`
  )
  .join("\n")}

Please optimize the route considering:
1. Minimize total travel distance and time
2. Respect appointment time windows when possible
3. Use the Haversine formula to calculate distances between coordinates
4. Provide turn-by-turn navigation guidance
5. Consider typical traffic patterns (morning/afternoon rush, etc.)

For each location in the optimized order, calculate:
- Estimated travel time from previous location (in minutes)
- Estimated distance (in kilometers)
- Brief directions (1-2 sentences)

Respond in the following JSON format:
{
  "route": [
    {
      "appointmentId": "id here",
      "order": 1,
      "estimatedTravelTime": 15,
      "estimatedDistance": 8.5,
      "directions": "Head north on Main St, turn right on Oak Ave..."
    },
    ...
  ],
  "totalEstimatedDuration": 45,
  "totalDistance": 25.5,
  "optimizationNotes": "Brief explanation of optimization strategy"
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const aiResult = JSON.parse(jsonMatch[0]);

    // Merge AI results with original location data
    const optimizedRoute = aiResult.route.map((routeItem: any) => {
      const location = locations.find((loc) => loc.appointmentId === routeItem.appointmentId);
      if (!location) {
        throw new Error(`Location not found for appointment ${routeItem.appointmentId}`);
      }

      // Generate Apple Maps URL
      const appleMapUrl = `http://maps.apple.com/?daddr=${location.latitude},${location.longitude}&dirflg=d`;

      return {
        ...location,
        order: routeItem.order,
        estimatedTravelTime: routeItem.estimatedTravelTime,
        estimatedDistance: routeItem.estimatedDistance,
        directions: routeItem.directions,
        appleMapUrl,
      };
    });

    return {
      route: optimizedRoute,
      totalEstimatedDuration: aiResult.totalEstimatedDuration,
      totalDistance: aiResult.totalDistance,
      optimizationNotes: aiResult.optimizationNotes,
    };
  } catch (error) {
    console.error("❌ [Route] AI optimization error:", error);
    return createDefaultRoute(locations, startLocation);
  }
}

// Fallback function to create a basic route without AI
function createDefaultRoute(
  locations: Array<{
    appointmentId: string;
    title: string;
    clientName: string;
    startTime: string;
    endTime: string;
    latitude: number;
    longitude: number;
    address: string;
  }>,
  startLocation: {
    latitude: number;
    longitude: number;
    address: string;
  }
) {
  let totalDistance = 0;
  let totalDuration = 0;

  const route = locations.map((loc, index) => {
    const prevLoc = index === 0 ? startLocation : locations[index - 1];

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      prevLoc.latitude,
      prevLoc.longitude,
      loc.latitude,
      loc.longitude
    );

    // Estimate travel time (assuming 40 km/h average speed in city)
    const travelTime = Math.ceil((distance / 40) * 60);

    totalDistance += distance;
    totalDuration += travelTime;

    const appleMapUrl = `http://maps.apple.com/?daddr=${loc.latitude},${loc.longitude}&dirflg=d`;

    return {
      ...loc,
      order: index + 1,
      estimatedTravelTime: travelTime,
      estimatedDistance: parseFloat(distance.toFixed(2)),
      directions: `Travel ${distance.toFixed(1)} km to ${loc.address}`,
      appleMapUrl,
    };
  });

  return {
    route,
    totalEstimatedDuration: totalDuration,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    optimizationNotes: "Default route based on appointment schedule order",
  };
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default routeOptimizationRouter;
