import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
export const teamChatRouter = createTRPCRouter({
  getOrCreateChat: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let chat = await ctx.db.teamChat.findFirst({
        where: { projectId: input.projectId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });
      if (!chat) {
        chat = await ctx.db.teamChat.create({
          data: {
            projectId: input.projectId,
            participants: {
              create: {
                userId: ctx.user.userId!,
              },
            },
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        });
      }
      return chat;
    }),
  sendMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        content: z.string(),
        messageType: z
          .enum(["TEXT", "CODE", "FILE", "SYSTEM"])
          .default("TEXT"),
        roomId: z.string().optional(),
        attachments: z.array(z.object({
          fileName: z.string(),
          fileUrl: z.string(),
          fileType: z.string(),
          fileSize: z.number()
        })).optional(),
        attachmentUrl: z.string().optional(),
        attachmentName: z.string().optional(),
        attachmentSize: z.number().optional(),
        attachmentType: z.string().optional(),
        filePath: z.string().optional(),
        lineNumber: z.number().optional(),
        codeSnippet: z.string().optional(),
        codeLanguage: z.string().optional(),
        commitHash: z.string().optional(),
        parentMessageId: z.string().optional(),
        mentionedUserIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { mentionedUserIds, attachments, ...messageData } = input;
      const aiContext = input.messageType === "CODE" && input.codeSnippet
        ? await generateAIContext(input.codeSnippet)
        : null;
      const message = await ctx.db.chatMessage.create({
        data: {
          ...messageData,
          userId: ctx.user.userId!,
          aiContext,
          mentions: mentionedUserIds
            ? {
                create: mentionedUserIds.map((userId) => ({ userId })),
              }
            : undefined,
          attachments: attachments
            ? {
                create: attachments.map((att) => ({
                  fileName: att.fileName,
                  fileUrl: att.fileUrl,
                  fileType: att.fileType,
                  fileSize: att.fileSize,
                  uploadedBy: ctx.user.userId!,
                })),
              }
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          mentions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          reactions: true,
        },
      });
      await ctx.db.chatParticipant.updateMany({
        where: {
          chatId: input.chatId,
          userId: ctx.user.userId!,
        },
        data: {
          lastReadAt: new Date(),
        },
      });
      return message;
    }),
  getMessages: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        roomId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db.chatMessage.findMany({
        where: {
          chatId: input.chatId,
          roomId: input.roomId,
          parentMessageId: null,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          mentions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          attachments: true,
          threadMessages: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
              attachments: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });
      let nextCursor: string | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem!.id;
      }
      return {
        messages: messages.reverse(),
        nextCursor,
      };
    }),
  addReaction: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        emoji: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.messageReaction.create({
        data: {
          messageId: input.messageId,
          userId: ctx.user.userId!,
          emoji: input.emoji,
        },
      });
    }),
  removeReaction: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        emoji: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.messageReaction.deleteMany({
        where: {
          messageId: input.messageId,
          userId: ctx.user.userId!,
          emoji: input.emoji,
        },
      });
    }),
  markAsRead: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.chatParticipant.updateMany({
        where: {
          chatId: input.chatId,
          userId: ctx.user.userId!,
        },
        data: {
          lastReadAt: new Date(),
        },
      });
    }),
  getUnreadCount: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const participant = await ctx.db.chatParticipant.findFirst({
        where: {
          chatId: input.chatId,
          userId: ctx.user.userId!,
        },
      });
      if (!participant) return 0;
      const unreadCount = await ctx.db.chatMessage.count({
        where: {
          chatId: input.chatId,
          createdAt: {
            gt: participant.lastReadAt || new Date(0),
          },
          userId: {
            not: ctx.user.userId!,
          },
        },
      });
      return unreadCount;
    }),
  createAnnotation: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        filePath: z.string(),
        lineStart: z.number(),
        lineEnd: z.number(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.codeAnnotation.create({
        data: {
          ...input,
          userId: ctx.user.userId!,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      });
    }),
  getAnnotations: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        filePath: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.codeAnnotation.findMany({
        where: {
          projectId: input.projectId,
          filePath: input.filePath,
          resolved: false,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  replyToAnnotation: protectedProcedure
    .input(
      z.object({
        annotationId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.annotationReply.create({
        data: {
          annotationId: input.annotationId,
          userId: ctx.user.userId!,
          content: input.content,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      });
    }),
  resolveAnnotation: protectedProcedure
    .input(z.object({ annotationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.codeAnnotation.update({
        where: { id: input.annotationId },
        data: { resolved: true },
      });
    }),
});
async function generateAIContext(_codeSnippet: string): Promise<string> {
  return `This code snippet appears to be related to: [AI-generated context would go here]`;
}
