# 🚀 Quick Deploy Checklist

## Every Deployment

### 1. Local: Run Migrations (if schema changed)
```bash
cd backend
npx prisma migrate dev --name your_feature_name
```
This updates Supabase tables - production will use these tables.

### 2. Test Build Locally
```bash
npm run build
# Verify dist/main.js exists
ls -la dist/
```

### 3. Deploy to Railway
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Railway auto-deploys via Dockerfile.

---

## First-Time Setup

### Railway Environment Variables
Set in Railway Dashboard → Your Service → Variables:

```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:6543/postgres?pgbouncer=true
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
```

**Important:** DATABASE_URL must use port **6543** (pooler), not 5432.

### Supabase Connection Strings

**Local (.env):**
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
```
Port: 5432 (direct connection)

**Production (Railway):**
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:6543/postgres?pgbouncer=true
```
Port: 6543 (connection pooler)

---

## Railway Build Flow

```
git push
  ↓
Railway detects change
  ↓
Reads railway.json → uses backend/Dockerfile
  ↓
Docker build:
  ├─ npm install
  ├─ prisma generate (builder stage)
  ├─ npm run build
  ├─ npm install --omit=dev (production stage)
  ├─ prisma generate (production stage)
  └─ Copy dist/
  ↓
Start: ./start.sh → node dist/main
  ↓
✅ Live at https://your-app.railway.app
```

---

## ⚠️ Never Do This

- ❌ Don't run migrations in Docker/Railway
- ❌ Don't use port 5432 in Railway DATABASE_URL
- ❌ Don't commit .env file
- ❌ Don't add DIRECT_URL to Railway

---

## ✅ Always Do This

- ✅ Run migrations locally before deploying
- ✅ Use port 6543 in Railway DATABASE_URL
- ✅ Test `npm run build` before pushing
- ✅ Keep prisma/schema.prisma without directUrl field

---

## Verify Deployment

After Railway deploys:
```bash
curl https://your-app.railway.app/api
# Should return: {"message": "Lane API"}
```

Check logs in Railway Dashboard if issues occur.

---

## Quick Fixes

**Problem:** "Cannot find @prisma/client"
**Solution:** Already fixed - Dockerfile generates it

**Problem:** "dist folder missing"  
**Solution:** Already fixed - Dockerfile builds it

**Problem:** Tables not found
**Solution:** Run `npx prisma migrate dev` locally first

**Problem:** Connection timeout
**Solution:** Check Railway DATABASE_URL uses port 6543
