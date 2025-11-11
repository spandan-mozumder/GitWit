import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/server/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
const isAuthenticated = t.middleware(async ({ next, ctx }) => {
  const user = await auth();
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  const result = await next();
  const end = Date.now();
  return result;
});

const rateLimitMiddleware = t.middleware(async ({ next, ctx, path }) => {
  const user = await auth();
  const identifier =
    user?.userId || ctx.headers.get("x-forwarded-for") || "anonymous";

  const { success, remaining, reset } = await checkRateLimit(identifier);

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
    });
  }

  return next();
});

export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(rateLimitMiddleware);
export const protectedProcedure = t.procedure
  .use(isAuthenticated)
  .use(rateLimitMiddleware);
