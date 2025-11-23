import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../types";

const dashboardRouter = new Hono<AppType>();

// GET /api/dashboard/stats - Get dashboard statistics
dashboardRouter.get("/stats", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Get all counts in parallel
    const [
      totalClients,
      totalAssessments,
      pendingAssessments,
      completedAssessments,
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalQuotes,
      totalEquipment,
      recentClients,
      recentAssessments,
      upcomingTasks,
      businessDocumentsExpiringSoon,
    ] = await Promise.all([
      // Total clients
      db.client.count({
        where: { userId: user.id, isArchived: false },
      }),

      // Total assessments
      db.assessment.count({
        where: { userId: user.id },
      }),

      // Pending assessments (draft or in_progress)
      db.assessment.count({
        where: {
          userId: user.id,
          status: { in: ["draft", "in_progress"] },
        },
      }),

      // Completed assessments
      db.assessment.count({
        where: {
          userId: user.id,
          status: "completed",
        },
      }),

      // Total invoices
      db.invoice.count({
        where: {
          assessment: { userId: user.id },
        },
      }),

      // Paid invoices
      db.invoice.count({
        where: {
          assessment: { userId: user.id },
          status: "paid",
        },
      }),

      // Overdue invoices
      db.invoice.count({
        where: {
          assessment: { userId: user.id },
          status: "overdue",
        },
      }),

      // Total quotes
      db.quote.count({
        where: {
          assessment: { userId: user.id },
        },
      }),

      // Total equipment items
      db.equipmentItem.count(),

      // Recent clients (last 5)
      db.client.findMany({
        where: { userId: user.id, isArchived: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),

      // Recent assessments (last 5)
      db.assessment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          client: {
            select: { name: true },
          },
        },
      }),

      // Upcoming tasks (assessments in progress)
      db.assessment.findMany({
        where: {
          userId: user.id,
          status: "in_progress",
        },
        orderBy: { assessmentDate: "asc" },
        take: 5,
        include: {
          client: {
            select: { name: true },
          },
        },
      }),

      // Business documents expiring soon (within 30 days)
      db.businessDocument.findMany({
        where: {
          userId: user.id,
          expiryDate: {
            not: null,
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            gte: new Date(), // Not already expired
          },
        },
        orderBy: { expiryDate: "asc" },
        take: 5,
      }),
    ]);

    // Calculate revenue stats
    const invoiceStats = await db.invoice.aggregate({
      where: {
        assessment: { userId: user.id },
      },
      _sum: {
        total: true,
      },
    });

    const paidRevenue = await db.invoice.aggregate({
      where: {
        assessment: { userId: user.id },
        status: "paid",
      },
      _sum: {
        total: true,
      },
    });

    const pendingRevenue = await db.invoice.aggregate({
      where: {
        assessment: { userId: user.id },
        status: { in: ["draft", "sent", "overdue"] },
      },
      _sum: {
        total: true,
      },
    });

    return c.json({
      success: true,
      stats: {
        clients: {
          total: totalClients,
          recent: recentClients.map((client) => ({
            id: client.id,
            name: client.name,
            createdAt: client.createdAt.toISOString(),
          })),
        },
        assessments: {
          total: totalAssessments,
          pending: pendingAssessments,
          completed: completedAssessments,
          recent: recentAssessments.map((assessment) => ({
            id: assessment.id,
            type: assessment.assessmentType,
            clientName: assessment.client.name,
            status: assessment.status,
            date: assessment.assessmentDate.toISOString(),
          })),
        },
        invoices: {
          total: totalInvoices,
          paid: paidInvoices,
          overdue: overdueInvoices,
          totalRevenue: Number(invoiceStats._sum.total || 0),
          paidRevenue: Number(paidRevenue._sum.total || 0),
          pendingRevenue: Number(pendingRevenue._sum.total || 0),
        },
        quotes: {
          total: totalQuotes,
        },
        equipment: {
          total: totalEquipment,
        },
        upcomingTasks: upcomingTasks.map((task) => ({
          id: task.id,
          type: task.assessmentType,
          clientName: task.client.name,
          date: task.assessmentDate.toISOString(),
          status: task.status,
        })),
        alerts: {
          overdueInvoices,
          expiringDocuments: businessDocumentsExpiringSoon.length,
          pendingAssessments,
          documents: businessDocumentsExpiringSoon.map((doc) => ({
            id: doc.id,
            title: doc.title,
            type: doc.documentType,
            expiryDate: doc.expiryDate?.toISOString() || null,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return c.json(
      {
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default dashboardRouter;
