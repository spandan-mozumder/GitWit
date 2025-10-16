import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
export const meetingsEnhancedRouter = createTRPCRouter({
  createActionItem: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        title: z.string(),
        description: z.string(),
        priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
        dueDate: z.date().optional(),
        assigneeId: z.string().optional(),
        filePath: z.string().optional(),
        lineNumber: z.number().optional(),
        jiraId: z.string().optional(),
        linearId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const actionItem = await ctx.db.actionItem.create({
        data: input,
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      });
      if (input.dueDate) {
        const reminderDate = new Date(input.dueDate);
        reminderDate.setDate(reminderDate.getDate() - 1); 
        await ctx.db.reminder.create({
          data: {
            actionItemId: actionItem.id,
            scheduledFor: reminderDate,
          },
        });
      }
      return actionItem;
    }),
  getActionItems: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.actionItem.findMany({
        where: {
          meetingId: input.meetingId,
          status: input.status,
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          reminders: true,
        },
        orderBy: [
          {
            priority: "asc",
          },
          {
            dueDate: "asc",
          },
        ],
      });
    }),
  getMyActionItems: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.actionItem.findMany({
        where: {
          assigneeId: ctx.user.userId!,
          status: input.status,
          meeting: input.projectId
            ? {
                projectId: input.projectId,
              }
            : undefined,
        },
        include: {
          meeting: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
          },
          reminders: true,
        },
        orderBy: [
          {
            priority: "asc",
          },
          {
            dueDate: "asc",
          },
        ],
      });
    }),
  updateActionItem: protectedProcedure
    .input(
      z.object({
        actionItemId: z.string(),
        status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"]).optional(),
        assigneeId: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { actionItemId, ...data } = input;
      const updates: Record<string, unknown> = { ...data };
      if (data.status === "DONE") {
        updates.completedAt = new Date();
      }
      return await ctx.db.actionItem.update({
        where: { id: actionItemId },
        data: updates,
      });
    }),
  autoGenerateActionItems: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.findUnique({
        where: { id: input.meetingId },
        include: {
          issues: true,
        },
      });
      if (!meeting) {
        throw new Error("Meeting not found");
      }
      const actionItems = [];
      for (const issue of meeting.issues) {
        const actionItem = await ctx.db.actionItem.create({
          data: {
            meetingId: input.meetingId,
            title: issue.headline,
            description: issue.summary,
            priority: "MEDIUM",
            status: "TODO",
          },
        });
        actionItems.push(actionItem);
      }
      return { count: actionItems.length, items: actionItems };
    }),
  linkToExternalService: protectedProcedure
    .input(
      z.object({
        actionItemId: z.string(),
        service: z.enum(["jira", "linear", "asana"]),
        externalId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, string> = {};
      if (input.service === "jira") {
        updates.jiraId = input.externalId;
      } else if (input.service === "linear") {
        updates.linearId = input.externalId;
      } else if (input.service === "asana") {
        updates.asanaId = input.externalId;
      }
      return await ctx.db.actionItem.update({
        where: { id: input.actionItemId },
        data: updates,
      });
    }),
  getOverdueActionItems: protectedProcedure
    .input(z.object({ projectId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      return await ctx.db.actionItem.findMany({
        where: {
          status: {
            in: ["TODO", "IN_PROGRESS", "BLOCKED"],
          },
          dueDate: {
            lt: now,
          },
          meeting: input.projectId
            ? {
                projectId: input.projectId,
              }
            : undefined,
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          meeting: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      });
    }),
  sendReminder: protectedProcedure
    .input(z.object({ actionItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const actionItem = await ctx.db.actionItem.findUnique({
        where: { id: input.actionItemId },
        include: {
          assignee: true,
        },
      });
      if (!actionItem || !actionItem.assignee) {
        throw new Error("Action item or assignee not found");
      }
      await ctx.db.reminder.updateMany({
        where: {
          actionItemId: input.actionItemId,
          sent: false,
        },
        data: {
          sent: true,
          sentAt: new Date(),
        },
      });
      return { success: true };
    }),
  getActionItemStats: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [total, byStatus, byPriority, overdue] = await Promise.all([
        ctx.db.actionItem.count({
          where: {
            meeting: {
              projectId: input.projectId,
            },
          },
        }),
        ctx.db.actionItem.groupBy({
          by: ["status"],
          where: {
            meeting: {
              projectId: input.projectId,
            },
          },
          _count: true,
        }),
        ctx.db.actionItem.groupBy({
          by: ["priority"],
          where: {
            meeting: {
              projectId: input.projectId,
            },
          },
          _count: true,
        }),
        ctx.db.actionItem.count({
          where: {
            meeting: {
              projectId: input.projectId,
            },
            status: {
              in: ["TODO", "IN_PROGRESS", "BLOCKED"],
            },
            dueDate: {
              lt: new Date(),
            },
          },
        }),
      ]);
      return {
        total,
        byStatus,
        byPriority,
        overdue,
      };
    }),
});
