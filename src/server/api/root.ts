import { projectRouter } from "@/server/api/routers/project";
import { codeReviewRouter } from "@/server/api/routers/codeReview";
import { teamChatRouter } from "@/server/api/routers/teamChat";
import { analyticsRouter } from "@/server/api/routers/analytics";
import { documentationRouter } from "@/server/api/routers/documentation";
import { meetingsEnhancedRouter } from "@/server/api/routers/meetingsEnhanced";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  // Tier 1: AI-Powered Code Review & Analysis
  codeReview: codeReviewRouter,
  // Tier 1: Team Collaboration Suite
  teamChat: teamChatRouter,
  // Tier 1: Advanced Analytics Dashboard
  analytics: analyticsRouter,
  // Tier 1: Smart Documentation Generator
  documentation: documentationRouter,
  // Tier 1: Enhanced Meeting Features
  meetingsEnhanced: meetingsEnhancedRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);