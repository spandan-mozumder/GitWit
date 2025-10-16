# Vercel Deployment Fix - Prisma Client Issue

## Problem
Vercel build was failing with error:
```
Module not found: Can't resolve '@/generated/prisma'
```

## Root Cause
The project was using a custom Prisma client output path (`../src/generated/prisma`) which caused issues during Vercel's build process. Vercel's build environment expects the standard Prisma client location.

## Solution Applied

### 1. Updated Prisma Schema (`prisma/schema.prisma`)
**Before:**
```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["postgresqlExtensions"]
}
```

**After:**
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}
```

### 2. Updated Database Client Import (`src/server/db.ts`)
**Before:**
```typescript
import { PrismaClient } from "@/generated/prisma";
```

**After:**
```typescript
import { PrismaClient } from "@prisma/client";
```

### 3. Added Postinstall Script (`package.json`)
**Added:**
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma Client is generated automatically after `npm install` on Vercel.

## Why This Works

1. **Standard Location**: Using `@prisma/client` is the standard import path that works consistently across all environments
2. **Automatic Generation**: The `postinstall` script ensures the Prisma client is generated before the build step
3. **No Custom Paths**: Removes complexity and potential path resolution issues in different environments

## Verification Steps

### Local Build Test:
```bash
npm run build
```
✅ Should complete successfully without Prisma import errors

### Vercel Deployment:
1. Push changes to main branch
2. Vercel will automatically deploy
3. Build should now succeed

## What Changed on Vercel

During deployment, Vercel now:
1. Runs `npm install` (installs dependencies including `@prisma/client`)
2. Runs `postinstall` script (generates Prisma client to `node_modules/@prisma/client`)
3. Runs `npm run build` (Next.js build finds Prisma client at standard location)
4. ✅ Build succeeds!

## Additional Notes

- The generated Prisma client in `node_modules/@prisma/client` is automatically gitignored
- No need to commit generated files
- Works consistently across local development and production deployments
- Standard practice for Prisma + Next.js + Vercel deployments

## If Issues Persist

If you still encounter Prisma-related issues on Vercel:

1. **Check Environment Variables**: Ensure `DATABASE_URL` is set in Vercel's environment variables
2. **Check Node Version**: Vercel should use Node 18+ (configured in project settings)
3. **Clear Build Cache**: In Vercel dashboard, try clearing the build cache and redeploying

---

**Status**: ✅ Fixed and deployed  
**Date**: October 16, 2025  
**Commit**: 827651f
