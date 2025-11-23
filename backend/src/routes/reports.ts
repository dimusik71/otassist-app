import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const reportsRouter = new Hono<AppType>();

// Validation schemas
const generateReportSchema = z.object({
  reportType: z.enum(["financial", "operational", "clinical", "custom"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
  filters: z.record(z.any()).optional(),
  columns: z.array(z.string()).optional(), // For custom reports
});

// GET /api/reports - Get all reports for the user
reportsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const reportType = c.req.query("reportType");
    const where: any = { userId: user.id };

    if (reportType) {
      where.reportType = reportType;
    }

    const reports = await db.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return c.json({
      success: true,
      reports: reports.map((report) => ({
        ...report,
        startDate: report.startDate.toISOString(),
        endDate: report.endDate.toISOString(),
        nextRunDate: report.nextRunDate?.toISOString() || null,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return c.json({ error: "Failed to fetch reports" }, 500);
  }
});

// GET /api/reports/:id - Get single report
reportsRouter.get("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  try {
    const report = await db.report.findFirst({
      where: { id, userId: user.id },
    });

    if (!report) {
      return c.json({ error: "Report not found" }, 404);
    }

    return c.json({
      success: true,
      report: {
        ...report,
        startDate: report.startDate.toISOString(),
        endDate: report.endDate.toISOString(),
        nextRunDate: report.nextRunDate?.toISOString() || null,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get report error:", error);
    return c.json({ error: "Failed to fetch report" }, 500);
  }
});

// POST /api/reports/generate - Generate a new report
reportsRouter.post("/generate", zValidator("json", generateReportSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = c.req.valid("json");

  try {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    // Generate report data based on type
    let reportData: any = {};

    switch (body.reportType) {
      case "financial":
        reportData = await generateFinancialReport(user.id, startDate, endDate, body.filters);
        break;
      case "operational":
        reportData = await generateOperationalReport(user.id, startDate, endDate, body.filters);
        break;
      case "clinical":
        reportData = await generateClinicalReport(user.id, startDate, endDate, body.filters);
        break;
      case "custom":
        reportData = await generateCustomReport(user.id, startDate, endDate, body.filters, body.columns);
        break;
      default:
        return c.json({ error: "Invalid report type" }, 400);
    }

    // Save report to database
    const report = await db.report.create({
      data: {
        userId: user.id,
        reportType: body.reportType,
        title: body.title,
        description: body.description || null,
        startDate,
        endDate,
        data: JSON.stringify(reportData),
        filters: body.filters ? JSON.stringify(body.filters) : null,
        columns: body.columns ? JSON.stringify(body.columns) : null,
        status: "generated",
      },
    });

    console.log(`✅ [Reports] Generated ${body.reportType} report: ${report.title}`);

    return c.json({
      success: true,
      message: "Report generated successfully",
      report: {
        ...report,
        data: reportData, // Return parsed data
        startDate: report.startDate.toISOString(),
        endDate: report.endDate.toISOString(),
        nextRunDate: report.nextRunDate?.toISOString() || null,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Generate report error:", error);
    return c.json({ error: "Failed to generate report" }, 500);
  }
});

// DELETE /api/reports/:id - Delete a report
reportsRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  try {
    const existing = await db.report.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: "Report not found" }, 404);
    }

    await db.report.delete({
      where: { id },
    });

    return c.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    return c.json({ error: "Failed to delete report" }, 500);
  }
});

// =================
// REPORT GENERATORS
// =================

async function generateFinancialReport(
  userId: string,
  startDate: Date,
  endDate: Date,
  filters?: Record<string, any>
) {
  // Get all invoices in date range
  const invoices = await db.invoice.findMany({
    where: {
      assessment: { userId },
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      assessment: {
        include: {
          client: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate financial metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const paidRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.total), 0);
  const pendingRevenue = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + Number(inv.total), 0);
  const overdueRevenue = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  // Group by month
  const monthlyRevenue: Record<string, { total: number; paid: number; pending: number }> = {};
  invoices.forEach((inv) => {
    const month = inv.createdAt.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyRevenue[month]) {
      monthlyRevenue[month] = { total: 0, paid: 0, pending: 0 };
    }
    monthlyRevenue[month].total += Number(inv.total);
    if (inv.status === "paid") {
      monthlyRevenue[month].paid += Number(inv.total);
    } else {
      monthlyRevenue[month].pending += Number(inv.total);
    }
  });

  // Top clients by revenue
  const clientRevenue: Record<string, { name: string; revenue: number; invoiceCount: number }> = {};
  invoices.forEach((inv) => {
    const clientId = inv.assessment.client.id;
    if (!clientRevenue[clientId]) {
      clientRevenue[clientId] = {
        name: inv.assessment.client.name,
        revenue: 0,
        invoiceCount: 0,
      };
    }
    clientRevenue[clientId].revenue += Number(inv.total);
    clientRevenue[clientId].invoiceCount += 1;
  });

  const topClients = Object.values(clientRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    summary: {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      overdueRevenue,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter((i) => i.status === "paid").length,
      pendingInvoices: invoices.filter((i) => i.status === "sent").length,
      overdueInvoices: invoices.filter((i) => i.status === "overdue").length,
      averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
    },
    monthlyRevenue,
    topClients,
    invoices: invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.assessment.client.name,
      amount: Number(inv.total),
      status: inv.status,
      dueDate: inv.dueDate?.toISOString() || null,
      paidDate: inv.paidDate?.toISOString() || null,
      createdAt: inv.createdAt.toISOString(),
    })),
  };
}

async function generateOperationalReport(
  userId: string,
  startDate: Date,
  endDate: Date,
  filters?: Record<string, any>
) {
  // Get assessments in date range
  const assessments = await db.assessment.findMany({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      client: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get appointments in date range
  const appointments = await db.appointment.findMany({
    where: {
      userId,
      startTime: { gte: startDate, lte: endDate },
    },
    include: {
      client: true,
    },
  });

  // Get clients added in date range
  const newClients = await db.client.findMany({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  // Assessment metrics
  const assessmentsByType: Record<string, number> = {};
  const assessmentsByStatus: Record<string, number> = {};
  assessments.forEach((a) => {
    assessmentsByType[a.assessmentType] = (assessmentsByType[a.assessmentType] || 0) + 1;
    assessmentsByStatus[a.status] = (assessmentsByStatus[a.status] || 0) + 1;
  });

  // Appointment metrics
  const appointmentsByType: Record<string, number> = {};
  const appointmentsByStatus: Record<string, number> = {};
  appointments.forEach((a) => {
    appointmentsByType[a.appointmentType] = (appointmentsByType[a.appointmentType] || 0) + 1;
    appointmentsByStatus[a.status] = (appointmentsByStatus[a.status] || 0) + 1;
  });

  // Daily activity
  const dailyActivity: Record<string, { assessments: number; appointments: number }> = {};
  assessments.forEach((a) => {
    const date = a.createdAt.toISOString().substring(0, 10);
    if (!dailyActivity[date]) dailyActivity[date] = { assessments: 0, appointments: 0 };
    dailyActivity[date].assessments += 1;
  });
  appointments.forEach((a) => {
    const date = a.startTime.toISOString().substring(0, 10);
    if (!dailyActivity[date]) dailyActivity[date] = { assessments: 0, appointments: 0 };
    dailyActivity[date].appointments += 1;
  });

  return {
    summary: {
      totalAssessments: assessments.length,
      completedAssessments: assessments.filter((a) => a.status === "completed").length,
      pendingAssessments: assessments.filter((a) => a.status === "draft").length,
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter((a) => a.status === "completed").length,
      upcomingAppointments: appointments.filter((a) => a.status === "scheduled" || a.status === "confirmed").length,
      newClients: newClients.length,
      totalClients: await db.client.count({ where: { userId, isArchived: false } }),
    },
    assessmentsByType,
    assessmentsByStatus,
    appointmentsByType,
    appointmentsByStatus,
    dailyActivity,
    recentAssessments: assessments.slice(0, 20).map((a) => ({
      id: a.id,
      clientName: a.client.name,
      type: a.assessmentType,
      status: a.status,
      date: a.assessmentDate.toISOString(),
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

async function generateClinicalReport(
  userId: string,
  startDate: Date,
  endDate: Date,
  filters?: Record<string, any>
) {
  // Get completed assessments in date range
  const assessments = await db.assessment.findMany({
    where: {
      userId,
      status: "completed",
      assessmentDate: { gte: startDate, lte: endDate },
    },
    include: {
      client: true,
      equipment: {
        include: {
          equipment: true,
        },
      },
      media: true,
    },
    orderBy: { assessmentDate: "desc" },
  });

  // Equipment recommendations analysis
  const equipmentRecommendations: Record<string, { count: number; priority: Record<string, number> }> = {};
  assessments.forEach((a) => {
    a.equipment.forEach((eq) => {
      const category = eq.equipment.category;
      if (!equipmentRecommendations[category]) {
        equipmentRecommendations[category] = { count: 0, priority: {} };
      }
      equipmentRecommendations[category].count += 1;
      equipmentRecommendations[category].priority[eq.priority] =
        (equipmentRecommendations[category].priority[eq.priority] || 0) + 1;
    });
  });

  // Assessment type analysis
  const assessmentTypes: Record<string, number> = {};
  assessments.forEach((a) => {
    assessmentTypes[a.assessmentType] = (assessmentTypes[a.assessmentType] || 0) + 1;
  });

  // Client demographics
  const clientAges: number[] = [];
  assessments.forEach((a) => {
    if (a.client.dateOfBirth) {
      const age = Math.floor(
        (new Date().getTime() - new Date(a.client.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      clientAges.push(age);
    }
  });

  const averageAge = clientAges.length > 0 ? clientAges.reduce((a, b) => a + b, 0) / clientAges.length : 0;

  return {
    summary: {
      totalAssessments: assessments.length,
      clientsAssessed: new Set(assessments.map((a) => a.clientId)).size,
      totalEquipmentRecommendations: assessments.reduce((sum, a) => sum + a.equipment.length, 0),
      totalMediaCaptured: assessments.reduce((sum, a) => sum + a.media.length, 0),
      averageClientAge: Math.round(averageAge),
      ageRange: clientAges.length > 0 ? `${Math.min(...clientAges)} - ${Math.max(...clientAges)}` : "N/A",
    },
    assessmentTypes,
    equipmentRecommendations,
    assessments: assessments.map((a) => ({
      id: a.id,
      clientName: a.client.name,
      clientAge: a.client.dateOfBirth
        ? Math.floor(
            (new Date().getTime() - new Date(a.client.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          )
        : null,
      type: a.assessmentType,
      date: a.assessmentDate.toISOString(),
      equipmentCount: a.equipment.length,
      mediaCount: a.media.length,
      location: a.location,
    })),
  };
}

async function generateCustomReport(
  userId: string,
  startDate: Date,
  endDate: Date,
  filters?: Record<string, any>,
  columns?: string[]
) {
  // Custom report builder - combine data from multiple sources
  const data: any = {};

  // Always include date range
  data.dateRange = {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };

  // Include selected data based on columns
  if (!columns || columns.includes("clients")) {
    data.clients = await db.client.count({
      where: { userId, isArchived: false },
    });
  }

  if (!columns || columns.includes("assessments")) {
    data.assessments = await db.assessment.count({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });
  }

  if (!columns || columns.includes("invoices")) {
    const invoices = await db.invoice.findMany({
      where: {
        assessment: { userId },
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    data.invoices = {
      count: invoices.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
    };
  }

  if (!columns || columns.includes("appointments")) {
    data.appointments = await db.appointment.count({
      where: {
        userId,
        startTime: { gte: startDate, lte: endDate },
      },
    });
  }

  return data;
}

export default reportsRouter;
