import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const appointmentsRouter = new Hono<AppType>();

// Request validation schemas
const createAppointmentSchema = z.object({
  clientId: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  appointmentType: z.enum(["assessment", "follow_up", "consultation", "phone_call", "home_visit", "other"]),
  startTime: z.string(), // ISO date string
  endTime: z.string(), // ISO date string
  location: z.string().optional(),
  isAllDay: z.boolean().default(false),
  notes: z.string().optional(),
  summary: z.string().optional(),
  guidelines: z.string().optional(),
  consentRequired: z.boolean().default(true),
});

const updateAppointmentSchema = z.object({
  clientId: z.string().optional().nullable(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  appointmentType: z.enum(["assessment", "follow_up", "consultation", "phone_call", "home_visit", "other"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional().nullable(),
  isAllDay: z.boolean().optional(),
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed", "no_show"]).optional(),
  notes: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  guidelines: z.string().optional().nullable(),
  consentRequired: z.boolean().optional(),
});

// GET /api/appointments - Get all appointments for the user
appointmentsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");

    const where: any = { userId: user.id };

    // Filter by date range if provided
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return c.json({
      success: true,
      appointments: appointments.map((apt) => ({
        ...apt,
        startTime: apt.startTime.toISOString(),
        endTime: apt.endTime.toISOString(),
        reminderDate: apt.reminderDate?.toISOString() || null,
        consentGivenAt: apt.consentGivenAt?.toISOString() || null,
        createdAt: apt.createdAt.toISOString(),
        updatedAt: apt.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    return c.json({ error: "Failed to fetch appointments" }, 500);
  }
});

// GET /api/appointments/:id - Get single appointment
appointmentsRouter.get("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  try {
    const appointment = await db.appointment.findFirst({
      where: { id, userId: user.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!appointment) {
      return c.json({ error: "Appointment not found" }, 404);
    }

    return c.json({
      success: true,
      appointment: {
        ...appointment,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        reminderDate: appointment.reminderDate?.toISOString() || null,
        consentGivenAt: appointment.consentGivenAt?.toISOString() || null,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get appointment error:", error);
    return c.json({ error: "Failed to fetch appointment" }, 500);
  }
});

// POST /api/appointments - Create new appointment
appointmentsRouter.post("/", zValidator("json", createAppointmentSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = c.req.valid("json");

  try {
    // Verify client belongs to user if clientId provided
    if (body.clientId) {
      const client = await db.client.findFirst({
        where: { id: body.clientId, userId: user.id },
      });
      if (!client) {
        return c.json({ error: "Client not found" }, 404);
      }
    }

    // Calculate reminder date (24 hours before appointment)
    const startTime = new Date(body.startTime);
    const reminderDate = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);

    const appointment = await db.appointment.create({
      data: {
        userId: user.id,
        clientId: body.clientId || null,
        title: body.title,
        description: body.description || null,
        appointmentType: body.appointmentType,
        startTime,
        endTime: new Date(body.endTime),
        location: body.location || null,
        isAllDay: body.isAllDay,
        reminderDate,
        notes: body.notes || null,
        summary: body.summary || null,
        guidelines: body.guidelines || null,
        consentRequired: body.consentRequired,
        status: "scheduled",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "Appointment created successfully",
      appointment: {
        ...appointment,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        reminderDate: appointment.reminderDate?.toISOString() || null,
        consentGivenAt: appointment.consentGivenAt?.toISOString() || null,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    return c.json({ error: "Failed to create appointment" }, 500);
  }
});

// PUT /api/appointments/:id - Update appointment
appointmentsRouter.put("/:id", zValidator("json", updateAppointmentSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const body = c.req.valid("json");

  try {
    // Check appointment exists and belongs to user
    const existing = await db.appointment.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: "Appointment not found" }, 404);
    }

    // Verify client belongs to user if clientId provided
    if (body.clientId) {
      const client = await db.client.findFirst({
        where: { id: body.clientId, userId: user.id },
      });
      if (!client) {
        return c.json({ error: "Client not found" }, 404);
      }
    }

    const updateData: any = {};
    if (body.clientId !== undefined) updateData.clientId = body.clientId;
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.appointmentType) updateData.appointmentType = body.appointmentType;
    if (body.startTime) {
      updateData.startTime = new Date(body.startTime);
      // Recalculate reminder date if start time changes
      updateData.reminderDate = new Date(updateData.startTime.getTime() - 24 * 60 * 60 * 1000);
      updateData.reminderSent = false; // Reset reminder sent flag
    }
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.isAllDay !== undefined) updateData.isAllDay = body.isAllDay;
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.guidelines !== undefined) updateData.guidelines = body.guidelines;
    if (body.consentRequired !== undefined) updateData.consentRequired = body.consentRequired;

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: {
        ...appointment,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        reminderDate: appointment.reminderDate?.toISOString() || null,
        consentGivenAt: appointment.consentGivenAt?.toISOString() || null,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    return c.json({ error: "Failed to update appointment" }, 500);
  }
});

// DELETE /api/appointments/:id - Delete appointment
appointmentsRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  try {
    // Check appointment exists and belongs to user
    const existing = await db.appointment.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: "Appointment not found" }, 404);
    }

    await db.appointment.delete({
      where: { id },
    });

    return c.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return c.json({ error: "Failed to delete appointment" }, 500);
  }
});

// POST /api/appointments/check-reminders - Check and send email reminders
appointmentsRouter.post("/check-reminders", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const now = new Date();

    // Find appointments that need reminders
    const appointmentsNeedingReminders = await db.appointment.findMany({
      where: {
        userId: user.id,
        reminderSent: false,
        status: { in: ["scheduled", "confirmed"] },
        reminderDate: {
          lte: now,
        },
        startTime: {
          gte: now, // Only future appointments
        },
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`📧 [Appointments] Found ${appointmentsNeedingReminders.length} appointments needing reminders`);

    // Mark as sent (in real app, you would send emails here)
    for (const appointment of appointmentsNeedingReminders) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: { reminderSent: true },
      });

      console.log(`✅ [Appointments] Reminder marked sent for appointment: ${appointment.title}`);
      // TODO: Send actual email here using a service like SendGrid, AWS SES, or Resend
    }

    return c.json({
      success: true,
      message: `Processed ${appointmentsNeedingReminders.length} reminders`,
      count: appointmentsNeedingReminders.length,
    });
  } catch (error) {
    console.error("Check reminders error:", error);
    return c.json({ error: "Failed to check reminders" }, 500);
  }
});

// POST /api/appointments/:id/consent - Record client consent for appointment
appointmentsRouter.post("/:id/consent", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const { consentGivenBy, consentMethod } = body;

  try {
    // Check appointment exists and belongs to user
    const existing = await db.appointment.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: "Appointment not found" }, 404);
    }

    // Record consent
    const appointment = await db.appointment.update({
      where: { id },
      data: {
        consentGiven: true,
        consentGivenAt: new Date(),
        consentGivenBy: consentGivenBy || null,
        consentMethod: consentMethod || "email_reply",
        status: "confirmed", // Automatically confirm when consent is given
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    console.log(`✅ [Appointments] Consent recorded for appointment: ${appointment.title}`);

    return c.json({
      success: true,
      message: "Consent recorded successfully",
      appointment: {
        ...appointment,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        reminderDate: appointment.reminderDate?.toISOString() || null,
        consentGivenAt: appointment.consentGivenAt?.toISOString() || null,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Record consent error:", error);
    return c.json({ error: "Failed to record consent" }, 500);
  }
});

export default appointmentsRouter;
