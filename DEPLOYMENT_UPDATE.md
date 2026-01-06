# Deployment Update - Build Script Fix

## Issue Encountered
The Vercel build was failing with:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/vercel/path0/script/build.ts'
```

## Root Cause
The build script was using `tsx` to run TypeScript directly, but Node.js v24 has different module loading behavior that was causing issues in the Vercel environment.

## Solution Applied
Created a JavaScript version of the build script (`script/build.js`) that Node.js can run directly without needing tsx.

### Changes Made:

1. **Created `script/build.js`** - JavaScript version of the build script
2. **Updated `package.json`**:
   - Changed `build` script from `tsx script/build.ts` to `node script/build.js`
   - Kept original as `build:ts` for local development if preferred

3. **Updated `vercel.json`**:
   - Configured to build the server as a Node.js function
   - Configured to serve static files from `dist/public`
   - Set up proper routing for API and static files

## Current Configuration

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.cjs",
      "use": "@vercel/node"
    },
    {
      "src": "dist/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/dist/index.cjs"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

### Build Process
1. `npm install` - Install dependencies
2. `npm run vercel-build` → `npm run build` → `node script/build.js`
3. Builds client (Vite) → `dist/public/`
4. Builds server (esbuild) → `dist/index.cjs`
5. Vercel deploys both

## Testing Locally

Before pushing, test the build:

```bash
# Test the new build script
npm run build

# Verify output
ls -la dist/
ls -la dist/public/

# Test the built server
npm start
```

## Deploy Again

Now you can deploy:

```bash
git add .
git commit -m "Fix build script for Vercel deployment"
git push
```

## Expected Build Output

You should see:
```
✓ Building client...
✓ Building server...
✓ Build completed successfully
```

Then Vercel will:
1. ✓ Install dependencies
2. ✓ Run build script
3. ✓ Deploy server function
4. ✓ Deploy static files
5. ✓ Configure routes

## What's Different

**Before:**
- Used `tsx` to run TypeScript build script
- Failed on Node.js v24 in Vercel

**After:**
- Uses plain JavaScript build script
- Works with any Node.js version
- Same functionality, better compatibility

## Files Changed

- ✨ Created: `script/build.js`
- 🔧 Modified: `package.json` (build script)
- 🔧 Modified: `vercel.json` (build configuration)
- 📝 Created: `DEPLOYMENT_UPDATE.md` (this file)

## Next Steps

1. Push the changes
2. Monitor the Vercel build logs
3. The build should complete successfully now
4. Test the deployed application

## Rollback Plan

If issues persist, you can always rollback:

```bash
git revert HEAD
git push
```

Or use the Vercel dashboard to redeploy a previous successful deployment.

