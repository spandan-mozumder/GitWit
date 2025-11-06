import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
export const projectMembersRouter = createTRPCRouter({

  checkPermission: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      requiredRole: z.enum(['ADMIN', 'COLLABORATOR', 'VIEWER'])
    }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId
          }
        }
      });
      if (!member) return false;
      const roleHierarchy = { ADMIN: 3, COLLABORATOR: 2, VIEWER: 1 };
      return roleHierarchy[member.role] >= roleHierarchy[input.requiredRole];
    }),

  getMyRole: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId
          }
        }
      });
      return member?.role || null;
    }),

  assignRole: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      userId: z.string(),
      role: z.enum(['ADMIN', 'COLLABORATOR', 'VIEWER'])
    }))
    .mutation(async ({ ctx, input }) => {

      const requester = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId
          }
        }
      });
      if (requester?.role !== 'ADMIN') {
        throw new Error('Only admins can assign roles');
      }
      return await ctx.db.projectMember.upsert({
        where: {
          userId_projectId: {
            userId: input.userId,
            projectId: input.projectId
          }
        },
        create: {
          userId: input.userId,
          projectId: input.projectId,
          role: input.role,
          invitedBy: ctx.user.userId!
        },
        update: {
          role: input.role
        }
      });
    }),

  getProjectMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.projectMember.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'asc' }
      });
    }),

  removeMember: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      userId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {

      const requester = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId
          }
        }
      });
      if (requester?.role !== 'ADMIN') {
        throw new Error('Only admins can remove members');
      }

      const adminCount = await ctx.db.projectMember.count({
        where: {
          projectId: input.projectId,
          role: 'ADMIN'
        }
      });
      const targetMember = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: input.userId,
            projectId: input.projectId
          }
        }
      });
      if (targetMember?.role === 'ADMIN' && adminCount <= 1) {
        throw new Error('Cannot remove the last admin');
      }
      await ctx.db.projectMember.delete({
        where: {
          userId_projectId: {
            userId: input.userId,
            projectId: input.projectId
          }
        }
      });
    }),
});
