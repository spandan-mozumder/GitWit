import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({

    createProject: protectedProcedure.input(z.object({
        name: z.string(),
        repoUrl: z.string(),
        gitHubToken: z.string().optional(),
    })).mutation(async ({ctx, input}) => {

        const {name, repoUrl, gitHubToken}= input;

        // Check if a project with the same name already exists for this user
        const existingProjectWithName = await ctx.db.project.findFirst({
            where: {
                name,
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null,
            }
        });

        if (existingProjectWithName) {
            throw new Error(`A project with the name "${name}" already exists. Please choose a different name.`);
        }

        // Check if a project accessing the same repository already exists for this user
        const existingProjectWithRepo = await ctx.db.project.findFirst({
            where: {
                repoUrl,
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null,
            }
        });

        if (existingProjectWithRepo) {
            throw new Error(`A project accessing this repository already exists. Repository: ${repoUrl}`);
        }

        const project = await ctx.db.project.create({
            data: {
                name,
                repoUrl,
                gitHubToken,
                userToProjects:{
                    create:{
                        userId: ctx.user.userId!,
                    }
                }
            },
        });
        await pollCommits(project.id);
        await indexGithubRepo(project.id, repoUrl, gitHubToken);
        return project;
    }),
    getProjects: protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {some: {userId: ctx.user.userId!}},
                deletedAt: null,
            },
        });
    }),
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ctx, input}) => {
        const {projectId} = input;

        console.log(`polling commits for project ${projectId}`);

        pollCommits(projectId)
            .then(() => {
                console.log(`Successfully polled commits for project ${projectId}`);
            })
            .catch((error) => {
                console.error(`Error polling commits for project ${projectId}`, error);
            });

        return await ctx.db.commit.findMany({
            where: {projectId},
        });
    }),

    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesRefrences:z.any()
    })).mutation(async ({ctx, input}) => {
        return await ctx.db.question.create({
            data:{
                answer: input.answer,
                filesRefrences:input.filesRefrences,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId!,
            }
        })
    }),
    
    getQuestions: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ctx, input}) => {
        return await ctx.db.question.findMany({
            where: {projectId: input.projectId},
            include:{
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }),

    uploadMeeting: protectedProcedure.input(z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
    })).mutation(async ({ctx, input}) => {
        const meeting = await ctx.db.meeting.create({
            data:{
                meetingUrl: input.meetingUrl,
                name: input.name,
                projectId: input.projectId,
                status: 'PROCESSING',
            }
        })
        return meeting
    }),

    getMeetings: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ctx, input}) => {
        return await ctx.db.meeting.findMany({
            where: {projectId: input.projectId},
            include:{
                issues: true,
            }
        });
    }),
    
    deleteMeeting: protectedProcedure.input(z.object({
        meetingId: z.string(),
    })).mutation(async ({ctx, input}) => {
        return await ctx.db.meeting.delete({
            where: {id: input.meetingId},
        });
    }),

    getMeetingById: protectedProcedure.input(z.object({
        meetingId: z.string(),
    })).query(async ({ctx, input}) => {
        return await ctx.db.meeting.findUnique({
            where: {id: input.meetingId},
            include:{
                issues: true,
            }
        });
    }),

    deleteProject: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).mutation(async ({ctx, input}) => {
        return await ctx.db.project.delete({
            where: {id: input.projectId},
        });
    }),

    getTeamMembers: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ctx, input}) => {
        return await ctx.db.userToProject.findMany({
            where:{
                projectId: input.projectId
            },
            include:{
                user: true
            }
        })
    }),

});