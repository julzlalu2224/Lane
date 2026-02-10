# 🚀 Production Deployment Guide
## NestJS + Prisma + Supabase + Railway

---

## ✅ FIXES APPLIED

### 1️⃣ **Dockerfile** (Fixed)
**Location:** `backend/Dockerfile`

**What Changed:**
- ✅ Production stage now runs `npx prisma generate` AFTER installing production dependencies
- ✅ Removed copying `.prisma` from builder (it was causing version mismatches)
- ✅ Multi-stage build properly optimized

**Build Flow:**
```
Builder Stage:
1. Install all dependencies (including devDependencies for @nestjs/cli)
2. Copy prisma schema
3. Generate Prisma client
4. Build NestJS (creates dist/)

Production Stage:
1. Install ONLY production dependencies (--omit=dev)
2. Copy prisma schema
3. Generate Prisma client (matches production node_modules)
4. Copy dist/ from builder
5. Start application
```

---

### 2️⃣ **Startup Script** (Fixed)
**Location:** `backend/start.sh`

**❌ REMOVED:**
```bash
npx prisma db push
npx prisma migrate deploy
```

**✅ NOW DOES:**
- Only starts the NestJS application
- NO database changes
- Prisma client already generated during Docker build

---

### 3️⃣ **Prisma Schema** (Correct)
**Location:** `backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

✅ No `directUrl` field
✅ Only uses `DATABASE_URL`

---

### 4️⃣ **Package.json Scripts** (Verified)
**Location:** `backend/package.json`

**Production Scripts:**
```json
{
  "build": "npx nest build",           // ✅ Builds to dist/
  "start:prod": "node dist/main",      // ✅ Runs compiled code
  "prisma:generate": "npx prisma generate"
}
```

**Local Development Scripts:**
```json
{
  "start:dev": "nest start --watch",
  "prisma:migrate": "npx prisma migrate dev",  // LOCAL ONLY
  "prisma:deploy": "npx prisma migrate deploy"  // NOT USED
}
```

---

## 🗄️ DATABASE CONFIGURATION

### **Local Development**
```env
# .env (local only)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

**Usage:**
```bash
# Run migrations locally
npx prisma migrate dev --name your_migration_name

# This updates your Supabase database schema
# The changes persist and will be available in production
```

---

### **Production (Railway)**
```env
# Railway environment variables
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
```

**Key Points:**
- ✅ Uses port `6543` (Supabase pooler/pgBouncer)
- ✅ NO `DIRECT_URL` variable
- ✅ NO migrations run in production
- ⚠️ Tables already exist from local migrations

---

## ⚙️ RAILWAY ENVIRONMENT VARIABLES

### **Required Variables:**

1. **DATABASE_URL**
   ```
   postgresql://postgres:<password>@<host>:6543/postgres?pgbouncer=true
   ```
   - Get from Supabase → Project Settings → Database → Connection Pooling
   - Port: `6543` (Transaction mode)

2. **JWT_SECRET**
   ```
   your-super-secret-jwt-key-change-in-production
   ```

3. **JWT_REFRESH_SECRET**
   ```
   your-super-secret-refresh-key-change-in-production
   ```

4. **PORT** (Optional)
   ```
   3000
   ```
   - Railway auto-assigns if not set

---

## 📦 PRODUCTION BOOT FLOW

### **Step-by-Step: Git Push → Running Container**

#### **1. Local Development (Before Push)**
```bash
# Make code changes
# Run migrations locally
npx prisma migrate dev --name add_new_feature

# This creates migration files and updates Supabase
# The schema changes are now in your database
```

#### **2. Push to GitHub**
```bash
git add .
git commit -m "Add new feature"
git push origin main
```

#### **3. Railway Auto-Deploy Starts**

**Railway reads:** `railway.json`
```json
{
  "build": {
    "builder": "dockerfile",
    "dockerfile": "backend/Dockerfile"
  },
  "deploy": {
    "startCommand": "./start.sh"
  }
}
```

#### **4. Docker Build Process**
```
Railway runs: docker build -f backend/Dockerfile .

Stage 1 (Builder):
├─ Install node:18-alpine
├─ Copy backend/package*.json
├─ Copy backend/prisma/
├─ npm install (all dependencies)
├─ npx prisma generate → Creates @prisma/client
├─ Copy backend/ source code
├─ npm run build → Creates dist/ folder
└─ ✅ Builder stage complete

Stage 2 (Production):
├─ Fresh node:18-alpine
├─ Copy backend/package*.json
├─ Copy backend/prisma/
├─ npm install --omit=dev → Production deps only
├─ npx prisma generate → Regenerate for production
├─ Copy dist/ from builder
├─ Copy start.sh
└─ ✅ Image ready
```

#### **5. Container Startup**
```
Railway runs: ./start.sh

start.sh executes:
├─ Echo "🚀 Starting Lane Backend..."
├─ Echo "✅ Starting NestJS application..."
└─ exec node dist/main

NestJS boots:
├─ Load environment variables (DATABASE_URL, JWT_SECRET, etc.)
├─ Initialize Prisma client (already generated)
├─ Connect to Supabase (port 6543 pooler)
├─ Start Express server
└─ ✅ Application running on $PORT
```

#### **6. Railway Health Check**
```
Railway pings: https://your-app.railway.app
├─ If responds: ✅ Deployment successful
└─ If fails: ❌ Rollback to previous version
```

---

## 🔍 TROUBLESHOOTING

### **Issue: "Cannot find module '@prisma/client'"**
**Cause:** Prisma client not generated
**Fix:** Already fixed in Dockerfile (runs `npx prisma generate` in production stage)

### **Issue: "dist folder missing"**
**Cause:** Build step failed or missing
**Fix:** Verified `npm run build` runs in builder stage

### **Issue: "Migration required"**
**Cause:** Tables don't exist in database
**Fix:** Run migrations locally FIRST:
```bash
cd backend
npx prisma migrate dev
# This creates tables in Supabase
# Railway will connect to existing tables
```

### **Issue: "Prisma pooler connection error"**
**Cause:** Using port 5432 in production
**Fix:** Ensure Railway `DATABASE_URL` uses port `6543`

### **Issue: "Application crashes on startup"**
**Cause:** Missing environment variables
**Fix:** Check Railway dashboard → Variables tab:
- DATABASE_URL ✅
- JWT_SECRET ✅
- JWT_REFRESH_SECRET ✅

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before pushing to Railway:

- [ ] Run migrations locally: `npx prisma migrate dev`
- [ ] Verify tables exist in Supabase
- [ ] Set Railway environment variables:
  - [ ] `DATABASE_URL` (port 6543)
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
- [ ] Test local build: `npm run build`
- [ ] Verify `dist/main.js` exists after build
- [ ] Remove any `.env` files from git

---

## 📝 FILE SUMMARY

### **Files Changed:**
1. ✅ `backend/Dockerfile` - Fixed Prisma generation in production
2. ✅ `backend/start.sh` - Removed migrations

### **Files Correct (No Changes):**
1. ✅ `backend/package.json` - Scripts are good
2. ✅ `backend/prisma/schema.prisma` - No directUrl field
3. ✅ `railway.json` - Correct Dockerfile path

---

## 🎯 QUICK DEPLOY COMMANDS

```bash
# Local: Create migration
npx prisma migrate dev --name feature_name

# Local: Build test
cd backend && npm run build

# Deploy
git add .
git commit -m "Deploy changes"
git push origin main

# Railway auto-deploys and runs:
# docker build → npm install → prisma generate → npm run build → node dist/main
```

---

## ⚠️ CRITICAL RULES

1. **NEVER run migrations in Docker**
   - ❌ No `prisma migrate dev`
   - ❌ No `prisma migrate deploy`
   - ❌ No `prisma db push`

2. **Always use port 6543 in production**
   - Railway DATABASE_URL must have `:6543`

3. **Migrations only local**
   - Use port 5432 locally
   - Run `npx prisma migrate dev`
   - Changes persist in Supabase

4. **Prisma generate twice in Dockerfile**
   - Once in builder (for build)
   - Once in production (for runtime)

---

## 🎉 FINAL RESULT

Your app now:
- ✅ Builds consistently
- ✅ Generates Prisma client correctly
- ✅ Connects to Supabase pooler (port 6543)
- ✅ Does NOT run migrations in production
- ✅ Has dist/ folder with compiled code
- ✅ Starts with `node dist/main`

**Next deployment will work correctly.**
