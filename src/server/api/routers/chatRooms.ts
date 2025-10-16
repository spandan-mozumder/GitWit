import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
export const chatRoomsRouter = createTRPCRouter({
  // Create a new chat room (Admin only)
  createRoom: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      name: z.string(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check ADMIN permission
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId
          }
        }
      });
      if (member?.role !== 'ADMIN') {
        throw new Error('Only admins can create chat rooms');
      }
      return await ctx.db.chatRoom.create({
        data: {
          name: input.name,
          description: input.description,
          projectId: input.projectId,
          createdBy: ctx.user.userId!
        }
      });
    }),
  // Get all rooms for a project
  getRooms: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.chatRoom.findMany({
        where: { 
          projectId: input.projectId,
          isActive: true 
        },
        include: {
          memberships: true,
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
    }),
  // Get rooms where user is a member
  getMyRooms: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.chatRoom.findMany({
        where: {
          projectId: input.projectId,
          isActive: true,
          memberships: {
            some: {
              userId: ctx.user.userId!
            }
          }
        },
        include: {
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
    }),
  // Add participants to a room (Admin only)
  addParticipants: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      userIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      // Check ADMIN permission for the room's project
      const room = await ctx.db.chatRoom.findUnique({
        where: { id: input.roomId },
        select: { projectId: true }
      });
      if (!room) throw new Error('Room not found');
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: room.projectId
          }
        }
      });
      if (member?.role !== 'ADMIN') {
        throw new Error('Only admins can add participants');
      }
      await ctx.db.roomMembership.createMany({
        data: input.userIds.map(userId => ({
          roomId: input.roomId,
          userId,
          addedBy: ctx.user.userId!
        })),
        skipDuplicates: true
      });
    }),
  // Remove participant from room (Admin only)
  removeParticipant: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      userId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check ADMIN permission
      const room = await ctx.db.chatRoom.findUnique({
        where: { id: input.roomId },
        select: { projectId: true }
      });
      if (!room) throw new Error('Room not found');
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: room.projectId
          }
        }
      });
      if (member?.role !== 'ADMIN') {
        throw new Error('Only admins can remove participants');
      }
      await ctx.db.roomMembership.delete({
        where: {
          roomId_userId: {
            roomId: input.roomId,
            userId: input.userId
          }
        }
      });
    }),
  // Delete room (Admin only)
  deleteRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.chatRoom.findUnique({
        where: { id: input.roomId },
        select: { projectId: true }
      });
      if (!room) throw new Error('Room not found');
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: room.projectId
          }
        }
      });
      if (member?.role !== 'ADMIN') {
        throw new Error('Only admins can delete rooms');
      }
      // Soft delete
      await ctx.db.chatRoom.update({
        where: { id: input.roomId },
        data: { isActive: false }
      });
    }),
  // Get room participants
  getRoomParticipants: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.roomMembership.findMany({
        where: { roomId: input.roomId },
        orderBy: { addedAt: 'asc' }
      });
    }),
});
