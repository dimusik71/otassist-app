import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../types";
import {
  createHouseMapRequestSchema,
  createRoomRequestSchema,
  createAreaRequestSchema,
  updateRoomRequestSchema,
  updateAreaRequestSchema,
} from "../../../shared/contracts";

const app = new Hono<AppType>();

// POST /api/assessments/:id/house-map - Create house map for assessment
app.post("/assessments/:id/house-map", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const assessmentId = c.req.param("id");
    const body = await c.req.json();
    const data = createHouseMapRequestSchema.parse(body);

    // Verify assessment exists and belongs to user
    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, userId: user.id },
    });

    if (!assessment) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    // Check if house map already exists
    const existing = await db.houseMap.findUnique({
      where: { assessmentId },
    });

    if (existing) {
      return c.json({ error: "House map already exists for this assessment" }, 400);
    }

    // Create house map
    const houseMap = await db.houseMap.create({
      data: {
        assessmentId,
        propertyType: data.propertyType,
        totalArea: data.totalArea,
        floors: data.floors || 1,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        aiGenerated: false,
      },
    });

    return c.json({
      success: true,
      houseMap: {
        ...houseMap,
        totalArea: houseMap.totalArea ? Number(houseMap.totalArea) : null,
      },
    });
  } catch (error: any) {
    console.error("Error creating house map:", error);
    return c.json({ error: error.message || "Failed to create house map" }, 500);
  }
});

// GET /api/house-maps/:id - Get house map with rooms, areas, and IoT devices
app.get("/house-maps/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const houseMapId = c.req.param("id");

    const houseMap = await db.houseMap.findFirst({
      where: {
        id: houseMapId,
        assessment: { userId: user.id },
      },
      include: {
        rooms: true,
        areas: true,
        iotDevices: {
          include: {
            device: true,
          },
        },
      },
    });

    if (!houseMap) {
      return c.json({ error: "House map not found" }, 404);
    }

    return c.json({
      houseMap: {
        ...houseMap,
        totalArea: houseMap.totalArea ? Number(houseMap.totalArea) : null,
        rooms: houseMap.rooms.map((room) => ({
          ...room,
          length: room.length ? Number(room.length) : null,
          width: room.width ? Number(room.width) : null,
          height: room.height ? Number(room.height) : null,
          area: room.area ? Number(room.area) : null,
        })),
        areas: houseMap.areas.map((area) => ({
          ...area,
          length: area.length ? Number(area.length) : null,
          width: area.width ? Number(area.width) : null,
          area: area.area ? Number(area.area) : null,
        })),
        iotDevices: houseMap.iotDevices.map((placement) => ({
          ...placement,
          device: {
            ...placement.device,
            price: Number(placement.device.price),
            installationCost: placement.device.installationCost
              ? Number(placement.device.installationCost)
              : null,
            subscriptionCost: placement.device.subscriptionCost
              ? Number(placement.device.subscriptionCost)
              : null,
            coverageArea: placement.device.coverageArea
              ? Number(placement.device.coverageArea)
              : null,
          },
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching house map:", error);
    return c.json({ error: error.message || "Failed to fetch house map" }, 500);
  }
});

// POST /api/house-maps/:id/rooms - Add room to house map
app.post("/house-maps/:id/rooms", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const houseMapId = c.req.param("id");
    const body = await c.req.json();
    const data = createRoomRequestSchema.parse(body);

    // Verify house map exists and belongs to user
    const houseMap = await db.houseMap.findFirst({
      where: {
        id: houseMapId,
        assessment: { userId: user.id },
      },
    });

    if (!houseMap) {
      return c.json({ error: "House map not found" }, 404);
    }

    const room = await db.room.create({
      data: {
        houseMapId,
        name: data.name,
        roomType: data.roomType,
        floor: data.floor || 1,
        length: data.length,
        width: data.width,
        height: data.height,
        area: data.area,
        position3D: data.position3D ? JSON.stringify(data.position3D) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        notes: data.notes,
        photoUrl: data.photoUrl,
      },
    });

    return c.json({
      success: true,
      room: {
        ...room,
        length: room.length ? Number(room.length) : null,
        width: room.width ? Number(room.width) : null,
        height: room.height ? Number(room.height) : null,
        area: room.area ? Number(room.area) : null,
      },
    });
  } catch (error: any) {
    console.error("Error creating room:", error);
    return c.json({ error: error.message || "Failed to create room" }, 500);
  }
});

// PUT /api/rooms/:id - Update room
app.put("/rooms/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const roomId = c.req.param("id");
    const body = await c.req.json();
    const data = updateRoomRequestSchema.parse(body);

    // Verify room exists and belongs to user
    const existingRoom = await db.room.findFirst({
      where: {
        id: roomId,
        houseMap: {
          assessment: { userId: user.id },
        },
      },
    });

    if (!existingRoom) {
      return c.json({ error: "Room not found" }, 404);
    }

    const room = await db.room.update({
      where: { id: roomId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.roomType && { roomType: data.roomType }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.length !== undefined && { length: data.length }),
        ...(data.width !== undefined && { width: data.width }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.area !== undefined && { area: data.area }),
        ...(data.position3D && { position3D: JSON.stringify(data.position3D) }),
        ...(data.features && { features: JSON.stringify(data.features) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      },
    });

    return c.json({
      success: true,
      room: {
        ...room,
        length: room.length ? Number(room.length) : null,
        width: room.width ? Number(room.width) : null,
        height: room.height ? Number(room.height) : null,
        area: room.area ? Number(room.area) : null,
      },
    });
  } catch (error: any) {
    console.error("Error updating room:", error);
    return c.json({ error: error.message || "Failed to update room" }, 500);
  }
});

// DELETE /api/rooms/:id - Delete room
app.delete("/rooms/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const roomId = c.req.param("id");

    // Verify room exists and belongs to user
    const room = await db.room.findFirst({
      where: {
        id: roomId,
        houseMap: {
          assessment: { userId: user.id },
        },
      },
    });

    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    await db.room.delete({ where: { id: roomId } });

    return c.json({ success: true, message: "Room deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting room:", error);
    return c.json({ error: error.message || "Failed to delete room" }, 500);
  }
});

// POST /api/house-maps/:id/areas - Add area to house map
app.post("/house-maps/:id/areas", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const houseMapId = c.req.param("id");
    const body = await c.req.json();
    const data = createAreaRequestSchema.parse(body);

    // Verify house map exists and belongs to user
    const houseMap = await db.houseMap.findFirst({
      where: {
        id: houseMapId,
        assessment: { userId: user.id },
      },
    });

    if (!houseMap) {
      return c.json({ error: "House map not found" }, 404);
    }

    const area = await db.area.create({
      data: {
        houseMapId,
        name: data.name,
        areaType: data.areaType,
        length: data.length,
        width: data.width,
        area: data.area,
        position3D: data.position3D ? JSON.stringify(data.position3D) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        notes: data.notes,
        photoUrl: data.photoUrl,
      },
    });

    return c.json({
      success: true,
      area: {
        ...area,
        length: area.length ? Number(area.length) : null,
        width: area.width ? Number(area.width) : null,
        area: area.area ? Number(area.area) : null,
      },
    });
  } catch (error: any) {
    console.error("Error creating area:", error);
    return c.json({ error: error.message || "Failed to create area" }, 500);
  }
});

// PUT /api/areas/:id - Update area
app.put("/areas/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const areaId = c.req.param("id");
    const body = await c.req.json();
    const data = updateAreaRequestSchema.parse(body);

    // Verify area exists and belongs to user
    const existingArea = await db.area.findFirst({
      where: {
        id: areaId,
        houseMap: {
          assessment: { userId: user.id },
        },
      },
    });

    if (!existingArea) {
      return c.json({ error: "Area not found" }, 404);
    }

    const area = await db.area.update({
      where: { id: areaId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.areaType && { areaType: data.areaType }),
        ...(data.length !== undefined && { length: data.length }),
        ...(data.width !== undefined && { width: data.width }),
        ...(data.area !== undefined && { area: data.area }),
        ...(data.position3D && { position3D: JSON.stringify(data.position3D) }),
        ...(data.features && { features: JSON.stringify(data.features) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      },
    });

    return c.json({
      success: true,
      area: {
        ...area,
        length: area.length ? Number(area.length) : null,
        width: area.width ? Number(area.width) : null,
        area: area.area ? Number(area.area) : null,
      },
    });
  } catch (error: any) {
    console.error("Error updating area:", error);
    return c.json({ error: error.message || "Failed to update area" }, 500);
  }
});

// DELETE /api/areas/:id - Delete area
app.delete("/areas/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const areaId = c.req.param("id");

    // Verify area exists and belongs to user
    const area = await db.area.findFirst({
      where: {
        id: areaId,
        houseMap: {
          assessment: { userId: user.id },
        },
      },
    });

    if (!area) {
      return c.json({ error: "Area not found" }, 404);
    }

    await db.area.delete({ where: { id: areaId } });

    return c.json({ success: true, message: "Area deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting area:", error);
    return c.json({ error: error.message || "Failed to delete area" }, 500);
  }
});

export default app;
