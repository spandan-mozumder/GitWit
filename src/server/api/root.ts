import { projectRouter } from "@/server/api/routers/project";
import { codeReviewRouter } from "@/server/api/routers/codeReview";
import { teamChatRouter } from "@/server/api/routers/teamChat";
import { analyticsRouter } from "@/server/api/routers/analytics";
import { documentationRouter } from "@/server/api/routers/documentation";
import { meetingsEnhancedRouter } from "@/server/api/routers/meetingsEnhanced";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  
  codeReview: codeReviewRouter,
  
  teamChat: teamChatRouter,
  
  analytics: analyticsRouter,
  
  documentation: documentationRouter,
  
  meetingsEnhanced: meetingsEnhancedRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);