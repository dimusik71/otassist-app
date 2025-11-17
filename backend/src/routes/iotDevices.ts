import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../index";
import {
  createIoTDeviceRequestSchema,
  updateIoTDeviceRequestSchema,
  createDevicePlacementRequestSchema,
  updateDevicePlacementRequestSchema,
} from "../../../shared/contracts";

const app = new Hono<AppType>();

// GET /api/iot-devices - Get all IoT devices
app.get("/iot-devices", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const devices = await db.ioTDeviceLibrary.findMany({
      orderBy: { category: "asc" },
    });

    return c.json({
      devices: devices.map((device) => ({
        ...device,
        price: Number(device.price),
        installationCost: device.installationCost ? Number(device.installationCost) : null,
        subscriptionCost: device.subscriptionCost ? Number(device.subscriptionCost) : null,
        coverageArea: device.coverageArea ? Number(device.coverageArea) : null,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching IoT devices:", error);
    return c.json({ error: error.message || "Failed to fetch IoT devices" }, 500);
  }
});

// POST /api/iot-devices - Create new IoT device
app.post("/iot-devices", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const data = createIoTDeviceRequestSchema.parse(body);

    const device = await db.ioTDeviceLibrary.create({
      data: {
        name: data.name,
        manufacturer: data.manufacturer,
        model: data.model,
        category: data.category,
        deviceType: data.deviceType,
        description: data.description,
        technicalSpecs: JSON.stringify(data.technicalSpecs),
        placementRules: data.placementRules ? JSON.stringify(data.placementRules) : null,
        coverageArea: data.coverageArea,
        powerRequirements: data.powerRequirements,
        connectivity: data.connectivity,
        price: data.price,
        installationCost: data.installationCost,
        subscriptionCost: data.subscriptionCost,
        subscriptionType: data.subscriptionType,
        imageUrl: data.imageUrl,
        documentationUrl: data.documentationUrl,
        approvedFor: data.approvedFor ? JSON.stringify(data.approvedFor) : null,
      },
    });

    return c.json({
      success: true,
      device: {
        ...device,
        price: Number(device.price),
        installationCost: device.installationCost ? Number(device.installationCost) : null,
        subscriptionCost: device.subscriptionCost ? Number(device.subscriptionCost) : null,
        coverageArea: device.coverageArea ? Number(device.coverageArea) : null,
      },
    });
  } catch (error: any) {
    console.error("Error creating IoT device:", error);
    return c.json({ error: error.message || "Failed to create IoT device" }, 500);
  }
});

// PUT /api/iot-devices/:id - Update IoT device
app.put("/iot-devices/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const deviceId = c.req.param("id");
    const body = await c.req.json();
    const data = updateIoTDeviceRequestSchema.parse(body);

    const existing = await db.ioTDeviceLibrary.findUnique({
      where: { id: deviceId },
    });

    if (!existing) {
      return c.json({ error: "IoT device not found" }, 404);
    }

    const device = await db.ioTDeviceLibrary.update({
      where: { id: deviceId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.category && { category: data.category }),
        ...(data.deviceType && { deviceType: data.deviceType }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.technicalSpecs && { technicalSpecs: JSON.stringify(data.technicalSpecs) }),
        ...(data.placementRules !== undefined && {
          placementRules: data.placementRules ? JSON.stringify(data.placementRules) : null,
        }),
        ...(data.coverageArea !== undefined && { coverageArea: data.coverageArea }),
        ...(data.powerRequirements !== undefined && { powerRequirements: data.powerRequirements }),
        ...(data.connectivity !== undefined && { connectivity: data.connectivity }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.installationCost !== undefined && { installationCost: data.installationCost }),
        ...(data.subscriptionCost !== undefined && { subscriptionCost: data.subscriptionCost }),
        ...(data.subscriptionType !== undefined && { subscriptionType: data.subscriptionType }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.documentationUrl !== undefined && { documentationUrl: data.documentationUrl }),
        ...(data.approvedFor !== undefined && {
          approvedFor: data.approvedFor ? JSON.stringify(data.approvedFor) : null,
        }),
      },
    });

    return c.json({
      success: true,
      device: {
        ...device,
        price: Number(device.price),
        installationCost: device.installationCost ? Number(device.installationCost) : null,
        subscriptionCost: device.subscriptionCost ? Number(device.subscriptionCost) : null,
        coverageArea: device.coverageArea ? Number(device.coverageArea) : null,
      },
    });
  } catch (error: any) {
    console.error("Error updating IoT device:", error);
    return c.json({ error: error.message || "Failed to update IoT device" }, 500);
  }
});

// DELETE /api/iot-devices/:id - Delete IoT device
app.delete("/iot-devices/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const deviceId = c.req.param("id");

    const device = await db.ioTDeviceLibrary.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return c.json({ error: "IoT device not found" }, 404);
    }

    await db.ioTDeviceLibrary.delete({ where: { id: deviceId } });

    return c.json({ success: true, message: "IoT device deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting IoT device:", error);
    return c.json({ error: error.message || "Failed to delete IoT device" }, 500);
  }
});

// POST /api/house-maps/:id/device-placements - Add device placement
app.post("/house-maps/:id/device-placements", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const houseMapId = c.req.param("id");
    const body = await c.req.json();
    const data = createDevicePlacementRequestSchema.parse(body);

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

    // Verify device exists
    const device = await db.ioTDeviceLibrary.findUnique({
      where: { id: data.deviceId },
    });

    if (!device) {
      return c.json({ error: "IoT device not found" }, 404);
    }

    // Verify room or area exists if provided
    if (data.roomId) {
      const room = await db.room.findFirst({
        where: { id: data.roomId, houseMapId },
      });
      if (!room) {
        return c.json({ error: "Room not found" }, 404);
      }
    }

    if (data.areaId) {
      const area = await db.area.findFirst({
        where: { id: data.areaId, houseMapId },
      });
      if (!area) {
        return c.json({ error: "Area not found" }, 404);
      }
    }

    const placement = await db.ioTDevicePlacement.create({
      data: {
        houseMapId,
        deviceId: data.deviceId,
        roomId: data.roomId,
        areaId: data.areaId,
        quantity: data.quantity,
        position3D: JSON.stringify(data.position3D),
        placementReason: data.placementReason,
        priority: data.priority,
        status: data.status,
        installationNotes: data.installationNotes,
        aiRecommended: data.aiRecommended,
      },
      include: {
        device: true,
      },
    });

    return c.json({
      success: true,
      placement: {
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
      },
    });
  } catch (error: any) {
    console.error("Error creating device placement:", error);
    return c.json({ error: error.message || "Failed to create device placement" }, 500);
  }
});

// PUT /api/device-placements/:id - Update device placement
app.put("/device-placements/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const placementId = c.req.param("id");
    const body = await c.req.json();
    const data = updateDevicePlacementRequestSchema.parse(body);

    // Verify placement exists and belongs to user
    const existing = await db.ioTDevicePlacement.findFirst({
      where: {
        id: placementId,
        houseMap: {
          assessment: { userId: user.id },
        },
      },
    });

    if (!existing) {
      return c.json({ error: "Device placement not found" }, 404);
    }

    const placement = await db.ioTDevicePlacement.update({
      where: { id: placementId },
      data: {
        ...(data.deviceId && { deviceId: data.deviceId }),
        ...(data.roomId !== undefined && { roomId: data.roomId }),
        ...(data.areaId !== undefined && { areaId: data.areaId }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.position3D && { position3D: JSON.stringify(data.position3D) }),
        ...(data.placementReason !== undefined && { placementReason: data.placementReason }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.installationNotes !== undefined && { installationNotes: data.installationNotes }),
        ...(data.aiRecommended !== undefined && { aiRecommended: data.aiRecommended }),
      },
      include: {
        device: true,
      },
    });

    return c.json({
      success: true,
      placement: {
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
      },
    });
  } catch (error: any) {
    console.error("Error updating device placement:", error);
    return c.json({ error: error.message || "Failed to update device placement" }, 500);
  }
});

// DELETE /api/device-placements/:id - Delete device placement
app.delete("/device-placements/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const placementId = c.req.param("id");

    // Verify placement exists and belongs to user
    const placement = await db.ioTDevicePlacement.findFirst({
      where: {
        id: placementId,
        houseMap: {
          assessment: { userId: user.id },
        },
      },
    });

    if (!placement) {
      return c.json({ error: "Device placement not found" }, 404);
    }

    await db.ioTDevicePlacement.delete({ where: { id: placementId } });

    return c.json({ success: true, message: "Device placement deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting device placement:", error);
    return c.json({ error: error.message || "Failed to delete device placement" }, 500);
  }
});

export default app;
