import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
export const liveMeetingsRouter = createTRPCRouter({
  // Start a new live meeting (Admin or Collaborator)
  startMeeting: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      title: z.string(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check COLLABORATOR or ADMIN permission
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId
          }
        }
      });
      if (!member || !['ADMIN', 'COLLABORATOR'].includes(member.role)) {
        throw new Error('Only admins or collaborators can host meetings');
      }
      // Create meeting
      const meeting = await ctx.db.liveMeeting.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          description: input.description,
          hostId: ctx.user.userId!,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          transcriptionStatus: 'PENDING'
        }
      });
      // Add host as participant
      await ctx.db.liveMeetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId: ctx.user.userId!,
          role: 'HOST',
          joinedAt: new Date()
        }
      });
      return meeting;
    }),
  // End meeting (Host only)
  endMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.liveMeeting.findUnique({
        where: { id: input.meetingId }
      });
      if (!meeting) throw new Error('Meeting not found');
      if (meeting.hostId !== ctx.user.userId!) {
        throw new Error('Only the host can end the meeting');
      }
      return await ctx.db.liveMeeting.update({
        where: { id: input.meetingId },
        data: {
          status: 'ENDED',
          endedAt: new Date()
        }
      });
    }),
  // Join meeting (Any project member)
  joinMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.liveMeeting.findUnique({
        where: { id: input.meetingId }
      });
      if (!meeting) throw new Error('Meeting not found');
      // Check if user is project member
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: meeting.projectId
          }
        }
      });
      if (!member) {
        throw new Error('Only project members can join meetings');
      }
      // Check if already joined
      const existing = await ctx.db.liveMeetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId: input.meetingId,
            userId: ctx.user.userId!
          }
        }
      });
      if (existing) {
        return existing; // Already joined
      }
      return await ctx.db.liveMeetingParticipant.create({
        data: {
          meetingId: input.meetingId,
          userId: ctx.user.userId!,
          role: 'PARTICIPANT',
          joinedAt: new Date()
        }
      });
    }),
  // Leave meeting
  leaveMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.liveMeetingParticipant.update({
        where: {
          meetingId_userId: {
            meetingId: input.meetingId,
            userId: ctx.user.userId!
          }
        },
        data: { leftAt: new Date() }
      });
    }),
  // Upload recording and trigger transcription
  uploadRecording: protectedProcedure
    .input(z.object({
      meetingId: z.string(),
      audioFileUrl: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.liveMeeting.findUnique({
        where: { id: input.meetingId }
      });
      if (!meeting) throw new Error('Meeting not found');
      if (meeting.hostId !== ctx.user.userId!) {
        throw new Error('Only the host can upload recordings');
      }
      // Update meeting with audio file
      await ctx.db.liveMeeting.update({
        where: { id: input.meetingId },
        data: {
          audioFileUrl: input.audioFileUrl,
          transcriptionStatus: 'PROCESSING'
        }
      });
      // Trigger AssemblyAI transcription
      try {
        const assemblyAiKey = process.env.ASSEMBLY_API_KEY;
        if (!assemblyAiKey) throw new Error('AssemblyAI API key not configured');
        const response = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers: {
            'authorization': assemblyAiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            audio_url: input.audioFileUrl
          })
        });
        const data = await response.json() as { id: string };
        // Store transcription ID
        await ctx.db.liveMeeting.update({
          where: { id: input.meetingId },
          data: { transcriptId: data.id }
        });
        return { transcriptId: data.id };
      } catch (error) {
        await ctx.db.liveMeeting.update({
          where: { id: input.meetingId },
          data: { transcriptionStatus: 'FAILED' }
        });
        throw error;
      }
    }),
  // Check transcription status
  checkTranscription: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const meeting = await ctx.db.liveMeeting.findUnique({
        where: { id: input.meetingId }
      });
      if (!meeting?.transcriptId) {
        throw new Error('No transcription in progress');
      }
      const assemblyAiKey = process.env.ASSEMBLY_API_KEY;
      if (!assemblyAiKey) throw new Error('AssemblyAI API key not configured');
      const response = await fetch(
        `https://api.assemblyai.com/v2/transcript/${meeting.transcriptId}`,
        {
          headers: {
            'authorization': assemblyAiKey
          }
        }
      );
      const data = await response.json() as { 
        status: string; 
        text?: string;
        error?: string;
      };
      // Update status based on AssemblyAI response
      if (data.status === 'completed' && data.text) {
        await ctx.db.liveMeeting.update({
          where: { id: input.meetingId },
          data: {
            transcript: data.text,
            transcriptionStatus: 'COMPLETED'
          }
        });
      } else if (data.status === 'error') {
        await ctx.db.liveMeeting.update({
          where: { id: input.meetingId },
          data: { transcriptionStatus: 'FAILED' }
        });
      }
      return {
        status: data.status,
        transcript: data.text,
        error: data.error
      };
    }),
  // Request summary (Admin only)
  requestSummary: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.liveMeeting.findUnique({
        where: { id: input.meetingId }
      });
      if (!meeting) throw new Error('Meeting not found');
      // Check ADMIN permission
      const member = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: meeting.projectId
          }
        }
      });
      if (member?.role !== 'ADMIN') {
        throw new Error('Only admins can request summaries');
      }
      if (meeting.transcriptionStatus !== 'COMPLETED') {
        throw new Error('Transcription must be completed first');
      }
      return await ctx.db.liveMeeting.update({
        where: { id: input.meetingId },
        data: {
          summaryRequested: true,
          summaryRequestedBy: ctx.user.userId!
        }
      });
    }),
  // Generate summary using Gemini
  generateSummary: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.liveMeeting.findUnique({
        where: { id: input.meetingId }
      });
      if (!meeting) throw new Error('Meeting not found');
      if (!meeting.summaryRequested) {
        throw new Error('Summary has not been requested');
      }
      if (!meeting.transcript) {
        throw new Error('No transcript available');
      }
      // Generate summary using Gemini
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) throw new Error('Gemini API key not configured');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Please provide a comprehensive summary of the following meeting transcript. Include key points, decisions made, action items, and any important discussions:\n\n${meeting.transcript}`
              }]
            }]
          })
        }
      );
      const data = await response.json() as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Failed to generate summary';
      // Update meeting with summary
      const updated = await ctx.db.liveMeeting.update({
        where: { id: input.meetingId },
        data: {
          summary,
          status: 'SUMMARIZED'
        }
      });
      return { summary: updated.summary };
    }),
  // Get meeting details
  getMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.liveMeeting.findUnique({
        where: { id: input.meetingId },
        include: {
          participants: true
        }
      });
    }),
  // Get all meetings for a project
  getProjectMeetings: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.liveMeeting.findMany({
        where: { projectId: input.projectId },
        include: {
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { startedAt: 'desc' }
      });
    }),
});
