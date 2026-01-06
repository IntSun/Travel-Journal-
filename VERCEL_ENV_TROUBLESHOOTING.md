# Vercel Environment Variables Troubleshooting

## The Issue
Your app is getting 500 errors, which means the serverless function is running but crashing - most likely due to MongoDB connection issues.

## Step-by-Step Fix

### 1. Check Vercel Function Logs

**Go to Vercel Dashboard:**
1. Open https://vercel.com/dashboard
2. Select your project
3. Click on "Deployments"
4. Click on the latest deployment
5. Click on "Functions" tab
6. Click on the `api` function
7. View the logs

**Look for these error messages:**
- `MONGODB_URI not found in environment variables`
- `MongoDB connection error:`
- `MongoServerError: bad auth`
- `MongoNetworkError`

### 2. Verify Environment Variables in Vercel

**Check if MONGODB_URI is set:**
1. Go to your Vercel project
2. Click "Settings"
3. Click "Environment Variables"
4. Look for `MONGODB_URI`

**Important checks:**
- ✅ Variable name is exactly `MONGODB_URI` (case-sensitive)
- ✅ Value is the full MongoDB connection string
- ✅ Applied to "Production" environment
- ✅ No extra spaces before/after the value

### 3. Common MongoDB Connection String Issues

#### Issue 1: Wrong Format
**❌ Wrong:**
```
mongodb://username:password@cluster.mongodb.net/database
```

**✅ Correct:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

#### Issue 2: Special Characters in Password
If your password has special characters like `@`, `#`, `%`, etc., they need to be URL-encoded:

**Example:**
- Password: `Pass@123!`
- Encoded: `Pass%40123%21`

**URL Encoding Reference:**
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`

**Use this tool:** https://www.urlencoder.org/

#### Issue 3: IP Whitelist
MongoDB Atlas blocks connections from unknown IPs.

**Fix:**
1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Select your cluster
3. Click "Network Access" in left sidebar
4. Click "Add IP Address"
5. Click "Allow Access from Anywhere"
6. Enter `0.0.0.0/0` (allows all IPs including Vercel)
7. Click "Confirm"

⚠️ **Note:** For production, you should whitelist only Vercel's IP ranges, but `0.0.0.0/0` works for testing.

#### Issue 4: Database User Permissions
Your MongoDB user might not have proper permissions.

**Fix:**
1. Go to MongoDB Atlas
2. Click "Database Access"
3. Find your user
4. Click "Edit"
5. Ensure "Built-in Role" is set to "Atlas admin" or "Read and write to any database"
6. Click "Update User"

### 4. Test Your Connection String Locally

Before deploying, test if the connection string works:

```bash
# Create a test file
node test-mongodb.js
```

If this works locally but fails on Vercel, it's an environment variable issue.

### 5. How to Set Environment Variables in Vercel

#### Method 1: Via Dashboard (Recommended)
1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add new variable:
   - **Name:** `MONGODB_URI`
   - **Value:** Your full connection string
   - **Environment:** Check "Production", "Preview", and "Development"
4. Click "Save"
5. **Important:** Redeploy your app after adding variables!

#### Method 2: Via Vercel CLI
```bash
vercel env add MONGODB_URI production
# Paste your connection string when prompted
```

### 6. Force Redeploy

After setting environment variables, you MUST redeploy:

```bash
# Option 1: Push a commit
git commit --allow-empty -m "Trigger redeploy"
git push

# Option 2: Redeploy from dashboard
# Go to Deployments → Click "..." → Redeploy
```

### 7. Verify Environment Variables Are Loaded

Add this temporary debug endpoint to check:

Create `server/debug.ts`:
```typescript
import { Router } from "express";

const router = Router();

router.get("/api/debug/env", (req, res) => {
  res.json({
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriLength: process.env.MONGODB_URI?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    // Don't log the actual value for security!
  });
});

export default router;
```

Then visit: `https://your-app.vercel.app/api/debug/env`

Should show:
```json
{
  "hasMongoUri": true,
  "mongoUriLength": 150,
  "nodeEnv": "production",
  "vercelEnv": "production"
}
```

### 8. Common Mistakes Checklist

- [ ] Variable name is `MONGODB_URI` (not `MONGO_URI` or `DATABASE_URL`)
- [ ] Connection string starts with `mongodb+srv://` (not `mongodb://`)
- [ ] Password special characters are URL-encoded
- [ ] IP whitelist includes `0.0.0.0/0` or Vercel IPs
- [ ] Database user has proper permissions
- [ ] Environment variable is set for "Production" environment
- [ ] App was redeployed after setting variables
- [ ] No extra quotes around the connection string
- [ ] No trailing spaces in the connection string

### 9. Get Your Correct MongoDB URI

**From MongoDB Atlas:**
1. Go to https://cloud.mongodb.com
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string
6. Replace `<password>` with your actual password (URL-encoded if needed)
7. Replace `<database>` with your database name (e.g., `traveljournal`)

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/traveljournal?retryWrites=true&w=majority
```

### 10. Still Not Working?

**Check Vercel Function Logs:**
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs your-app-url --follow
```

**Or check in dashboard:**
1. Deployments → Latest → Functions → api
2. Look for error messages
3. Share the error message for more specific help

## Quick Fix Commands

```bash
# 1. Set environment variable
vercel env add MONGODB_URI production
# Paste your connection string

# 2. Redeploy
git commit --allow-empty -m "Fix env vars"
git push

# 3. Check logs
vercel logs --follow
```

## Example Working Configuration

**Environment Variables in Vercel:**
```
MONGODB_URI=mongodb+srv://user:pass@cluster0.abc123.mongodb.net/mydb?retryWrites=true&w=majority
NODE_ENV=production
```

**MongoDB Atlas Settings:**
- Network Access: `0.0.0.0/0` allowed
- Database Access: User with "Read and write" permissions
- Cluster: Running and accessible

## Need More Help?

Share the following information:
1. Error message from Vercel function logs
2. Screenshot of your Environment Variables page (hide the actual values)
3. Whether the connection string works locally
4. MongoDB Atlas cluster status

---

**Most Common Solution:**
1. URL-encode password special characters
2. Add `0.0.0.0/0` to MongoDB IP whitelist
3. Redeploy after setting environment variables

