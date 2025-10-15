import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const documentationRouter = createTRPCRouter({
  
  generateDocumentation: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        docType: z.enum([
          "API_REFERENCE",
          "ARCHITECTURE",
          "ONBOARDING",
          "CHANGELOG",
          "TECHNICAL_SPEC",
          "USER_GUIDE",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        include: {
          sourceCodeEmbedding: true,
          Commit: {
            orderBy: {
              commitDate: "desc",
            },
            take: 50,
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const docContent = await generateDocContent(
        project,
        input.docType
      );

      const documentation = await ctx.db.documentation.create({
        data: {
          projectId: input.projectId,
          title: docContent.title,
          content: docContent.content,
          docType: input.docType,
          tags: docContent.tags,
          estimatedReadTime: Math.ceil(docContent.content.length / 1000),
          sections: {
            create: docContent.sections,
          },
        },
        include: {
          sections: true,
        },
      });

      return documentation;
    }),

  getDocumentation: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        docType: z
          .enum([
            "API_REFERENCE",
            "ARCHITECTURE",
            "ONBOARDING",
            "CHANGELOG",
            "TECHNICAL_SPEC",
            "USER_GUIDE",
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.documentation.findMany({
        where: {
          projectId: input.projectId,
          docType: input.docType,
        },
        include: {
          sections: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),

  updateDocumentation: protectedProcedure
    .input(
      z.object({
        documentationId: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { documentationId, ...data } = input;
      return await ctx.db.documentation.update({
        where: { id: documentationId },
        data,
      });
    }),

  extractAPIEndpoints: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        include: {
          sourceCodeEmbedding: true,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const endpoints = await extractEndpoints(project.sourceCodeEmbedding);

      await ctx.db.aPIEndpoint.createMany({
        data: endpoints.map((endpoint) => ({
          ...endpoint,
          projectId: input.projectId,
        })),
        skipDuplicates: true,
      });

      return { count: endpoints.length };
    }),

  getAPIEndpoints: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.aPIEndpoint.findMany({
        where: {
          projectId: input.projectId,
          deprecated: false,
        },
        orderBy: {
          path: "asc",
        },
      });
    }),

  generateArchitectureDiagram: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        diagramType: z.enum([
          "ARCHITECTURE",
          "SEQUENCE",
          "CLASS",
          "ER_DIAGRAM",
          "FLOW_CHART",
          "COMPONENT",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        include: {
          sourceCodeEmbedding: true,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const diagramData = await generateDiagram(
        project,
        input.diagramType
      );

      const diagram = await ctx.db.architectureDiagram.create({
        data: {
          projectId: input.projectId,
          title: diagramData.title,
          description: diagramData.description,
          diagramType: input.diagramType,
          diagramCode: diagramData.code,
        },
      });

      return diagram;
    }),

  getArchitectureDiagrams: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.architectureDiagram.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),

  generateChangelog: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        sinceDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const commits = await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
          commitDate: input.sinceDate
            ? {
                gte: input.sinceDate,
              }
            : undefined,
        },
        orderBy: {
          commitDate: "desc",
        },
      });

      const changelog = categorizeCommits(commits);

      const documentation = await ctx.db.documentation.create({
        data: {
          projectId: input.projectId,
          title: "Changelog",
          content: formatChangelog(changelog),
          docType: "CHANGELOG",
          tags: ["changelog", "releases"],
          estimatedReadTime: 5,
          sections: {
            create: Object.entries(changelog).map(([category, items], index) => ({
              order: index,
              heading: category,
              content: (items as Array<{ commitMessage: string }>).map((c) => `- ${c.commitMessage}`).join("\n"),
            })),
          },
        },
        include: {
          sections: true,
        },
      });

      return documentation;
    }),
});

async function generateDocContent(project: { name: string; githubUrl?: string }, docType: string) {
  
  const templates: Record<string, { title: string; content: string; tags: string[]; sections: Array<{ heading: string; content: string; order: number }> }> = {
    API_REFERENCE: {
      title: `${project.name} API Reference`,
      content: "Complete API documentation for " + project.name,
      tags: ["api", "reference", "documentation"],
      sections: [
        {
          order: 0,
          heading: "Introduction",
          content: "This API provides access to " + project.name,
        },
        {
          order: 1,
          heading: "Authentication",
          content: "API uses token-based authentication",
        },
      ],
    },
    ARCHITECTURE: {
      title: `${project.name} Architecture`,
      content: "System architecture overview",
      tags: ["architecture", "system-design"],
      sections: [
        {
          order: 0,
          heading: "Overview",
          content: "High-level architecture of the system",
        },
      ],
    },
    ONBOARDING: {
      title: `Getting Started with ${project.name}`,
      content: "Onboarding guide for new developers",
      tags: ["onboarding", "getting-started"],
      sections: [
        {
          order: 0,
          heading: "Setup",
          content: "How to set up the development environment",
        },
        {
          order: 1,
          heading: "First Steps",
          content: "Your first task as a developer",
        },
      ],
    },
  };

  return templates[docType] || templates.ONBOARDING;
}

async function extractEndpoints(_codeEmbeddings: unknown[]) {
  
  return [
    {
      method: "GET" as const,
      path: "/api/users",
      description: "Get all users",
      filePath: "src/api/users.ts",
      lineNumber: 10,
      authenticated: true,
      requestSchema: {},
      responseSchema: {},
    },
    {
      method: "POST" as const,
      path: "/api/users",
      description: "Create a new user",
      filePath: "src/api/users.ts",
      lineNumber: 25,
      authenticated: true,
      requestSchema: {},
      responseSchema: {},
    },
  ];
}

async function generateDiagram(project: { name: string }, diagramType: string) {
  
  const diagrams: Record<string, { title: string; description: string; code: string }> = {
    ARCHITECTURE: {
      title: "System Architecture",
      description: "High-level system architecture",
      code: `graph TB
    Client[Client Application]
    API[API Server]
    DB[(Database)]
    Cache[(Redis Cache)]
    
    Client --> API
    API --> DB
    API --> Cache`,
    },
    SEQUENCE: {
      title: "User Authentication Flow",
      description: "Sequence diagram for user authentication",
      code: `sequenceDiagram
    participant User
    participant Client
    participant Server
    participant DB
    
    User->>Client: Enter credentials
    Client->>Server: POST /login
    Server->>DB: Validate user
    DB-->>Server: User data
    Server-->>Client: JWT token
    Client-->>User: Login success`,
    },
  };

  return diagrams[diagramType] || diagrams.ARCHITECTURE;
}

function categorizeCommits(commits: Array<{ commitMessage: string }>) {
  const categories: Record<string, Array<{ commitMessage: string }>> = {
    Features: [],
    Fixes: [],
    Documentation: [],
    Refactoring: [],
    Other: [],
  };

  commits.forEach((commit) => {
    const message = commit.commitMessage.toLowerCase();
    if (message.includes("feat") || message.includes("feature")) {
      categories.Features.push(commit);
    } else if (message.includes("fix") || message.includes("bug")) {
      categories.Fixes.push(commit);
    } else if (message.includes("docs") || message.includes("documentation")) {
      categories.Documentation.push(commit);
    } else if (message.includes("refactor")) {
      categories.Refactoring.push(commit);
    } else {
      categories.Other.push(commit);
    }
  });

  return categories;
}

function formatChangelog(changelog: Record<string, Array<{ commitMessage: string }>>): string {
  let content = "# Changelog\n\n";

  Object.entries(changelog).forEach(([category, commits]) => {
    if (commits.length > 0) {
      content += `## ${category}\n\n`;
      commits.forEach((commit) => {
        content += `- ${commit.commitMessage}\n`;
      });
      content += "\n";
    }
  });

  return content;
}
