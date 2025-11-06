import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    
    ASSEMBLY_API_KEY: z.string().min(1).optional(),
    
    GEMINI_API_KEY: z.string().min(1).optional(),
    
    UPLOADTHING_SECRET: z.string().min(1).optional(),
    RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),
    
    RESEND_API_KEY: z.string().min(1).optional(),
    
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  },
  
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
    
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  },
  
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    
    ASSEMBLY_API_KEY: process.env.ASSEMBLY_API_KEY,
    
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});