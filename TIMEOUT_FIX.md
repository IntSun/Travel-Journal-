# Sign In Timeout Issue - MongoDB Connection

## The Problem

Sign in is taking too long and timing out. This means:
- ✅ The serverless function is running (no more dotenv error)
- ❌ MongoDB connection is timing out
- Most likely: **MONGODB_URI not set** or **IP not whitelisted**

## Quick Diagnosis

### Step 1: Check if MONGODB_URI is Set

Visit this URL in your browser:
```
https://travel-journal-mu-three.vercel.app/api/debug/env
```

You should see:
```json
{
  "hasMongoUri": true,
  "mongoUriPrefix": "mongodb+srv://...",
  "nodeEnv": "production",
  "vercelEnv": "production"
}
```

**If `hasMongoUri` is `false`:**
- MONGODB_URI is NOT set in Vercel
- Go to Vercel Dashboard → Settings → Environment Variables
- Add `MONGODB_URI` with your connection string
- Redeploy

### Step 2: Check MongoDB Atlas IP Whitelist

1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click "Network Access" (left sidebar)
4. Check if `0.0.0.0/0` is in the list

**If NOT:**
1. Click "Add IP Address"
2. Click "Allow Access from Anywhere"
3. Enter `0.0.0.0/0`
4. Click "Confirm"
5. Wait 2-3 minutes for it to take effect

### Step 3: Verify Connection String Format

Your MongoDB URI should look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

**Common mistakes:**
- ❌ `mongodb://` instead of `mongodb+srv://`
- ❌ Special characters in password not URL-encoded
- ❌ Wrong database name
- ❌ Extra spaces

### Step 4: Test Connection String Locally

Before deploying, test if your connection string works:

```bash
node test-mongodb.js
```

If it works locally but not on Vercel:
- It's an environment variable issue
- Or IP whitelist issue

## Quick Fix Checklist

- [ ] Visit `/api/debug/env` - does it show `hasMongoUri: true`?
- [ ] Is `0.0.0.0/0` in MongoDB Atlas Network Access?
- [ ] Does your password have special characters? (URL-encode them)
- [ ] Did you redeploy after setting environment variables?
- [ ] Wait 2-3 minutes after adding IP whitelist

## Set MONGODB_URI in Vercel

### Via Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Click "Add New"
5. Name: `MONGODB_URI`
6. Value: Your full connection string
7. Environment: Check **Production**
8. Click "Save"
9. **Important:** Redeploy!

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Via CLI:
```bash
vercel env add MONGODB_URI production
# Paste your connection string when prompted

# Redeploy
vercel --prod
```

## URL-Encode Special Characters

If your password has special characters, encode them:

**Example:**
- Password: `MyPass@123!`
- Encoded: `MyPass%40123%21`

**Common encodings:**
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `=` → `%3D`
- `+` → `%2B`

Use: https://www.urlencoder.org/

## Get Your MongoDB Connection String

1. Go to https://cloud.mongodb.com
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" driver
5. Copy the connection string
6. Replace `<password>` with your actual password (URL-encoded)
7. Replace `<database>` with your database name

**Example:**
```
mongodb+srv://myuser:MyPass%40123@cluster0.abc123.mongodb.net/traveljournal?retryWrites=true&w=majority
```

## Deploy the Timeout Fix

I've added a 5-second timeout to fail faster if MongoDB is unreachable:

```bash
git add .
git commit -m "Add MongoDB connection timeout and debug endpoint"
git push
```

## After Deployment

1. Visit `/api/debug/env` to check if MONGODB_URI is set
2. Try signing in again
3. If still timing out, check Vercel function logs

## Check Vercel Logs

```bash
# Install Vercel CLI if not already
npm i -g vercel

# View logs in real-time
vercel logs https://travel-journal-mu-three.vercel.app --follow
```

Or in dashboard:
1. Deployments → Latest
2. Functions → api
3. View logs

Look for:
- `MONGODB_URI not found` → Not set in Vercel
- `MongoDB connection error` → IP whitelist or wrong credentials
- `MongoServerError: bad auth` → Wrong password
- `MongoNetworkError` → IP not whitelisted

## Most Likely Solution

Based on the timeout, you probably need to:

1. **Set MONGODB_URI in Vercel** (if not already done)
2. **Add `0.0.0.0/0` to MongoDB IP whitelist**
3. **Redeploy after setting variables**

---

**Check `/api/debug/env` first** - it will tell you if the environment variable is set! 🔍

