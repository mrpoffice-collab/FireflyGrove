# Deployment Strategy - Stay Under 100 Vercel Deployments

## 🎯 Goal
Work with production data/images while keeping Vercel deployments under 100/month.

---

## 📊 Current Vercel Limits
- **Free Tier**: 100 deployments/month
- **Current Usage**: Check at https://vercel.com/dashboard/usage
- **Reset**: Monthly on your billing date

---

## 🌳 Branch Strategy

### Branch Structure
```
main (production)          ← Only deploy from here
  ↓
dev (development)          ← Work here, don't deploy
  ↓
feature/* (features)       ← Individual features
```

### How to Use Branches

#### 1. Create Development Branch (One Time Setup)
```bash
# Create and switch to dev branch
git checkout -b dev
git push -u origin dev
```

#### 2. Daily Workflow (Work on Dev Branch)
```bash
# Make sure you're on dev
git checkout dev

# Make your changes
# ... edit files ...

# Commit frequently (does NOT deploy)
git add .
git commit -m "Add /map page with auto-discovery"
git push origin dev
```

#### 3. When Ready to Deploy (Batch Changes)
```bash
# Switch to main
git checkout main

# Merge all your dev changes at once
git merge dev

# This ONE push triggers ONE deployment
git push origin main
```

**Result**: 10 commits on dev = 1 deployment when merged to main ✅

---

## ⚙️ Vercel Configuration

### Current Setup (`vercel.json`)
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,      ← Only main deploys
      "dev": false,      ← Dev doesn't deploy
      "staging": false   ← Staging doesn't deploy
    }
  }
}
```

### Verify in Vercel Dashboard
1. Go to: https://vercel.com/dashboard → Your Project → Settings
2. Click: **Git**
3. Under "Ignored Build Step": Should show only `main` branch deploys
4. Turn OFF "Deploy Preview" for other branches

---

## 🚀 Deployment Checklist

### Before Deploying to Main

**Test Locally First:**
```bash
# On dev branch
npm run build
npm run start

# Test the /map page
# Test marketing-genius dashboard
# Test any new features
```

**Pre-Deployment Checklist:**
- [ ] All features tested locally
- [ ] No console errors
- [ ] Database migrations tested
- [ ] Environment variables updated in Vercel (if needed)
- [ ] Marketing content proofread (if applicable)
- [ ] No hardcoded secrets or API keys

**Merge to Main:**
```bash
git checkout main
git merge dev
git push origin main
```

**Post-Deployment:**
- [ ] Visit production site to verify
- [ ] Check `/map` page works
- [ ] Check marketing-genius dashboard
- [ ] Check Vercel deployment logs for errors
- [ ] Update deployment counter (see below)

---

## 📈 Track Your Deployments

### Manual Counter
Create a simple counter in this file:

**Deployments This Month:**
```
Month: November 2025
Count: ||||| ||||| ||||| ||||| |||||     (25/100)

Date       | Reason
-----------|------------------------------------------
2025-11-01 | Initial /map page
2025-11-03 | Marketing genius updates
2025-11-05 | Admin improvements + blog posts
```

### Automatic Tracking (Optional)
```bash
# Add to your commit message when deploying to main
git commit -m "Deploy: Add /map page [deploy 25/100]"
```

---

## 💡 Tips to Reduce Deployments

### 1. Batch Changes
**Bad (uses 3 deployments):**
```bash
# Commit 1 → main → deploy
git commit -m "Add /map page" && git push origin main

# Commit 2 → main → deploy
git commit -m "Fix typo" && git push origin main

# Commit 3 → main → deploy
git commit -m "Update metadata" && git push origin main
```

**Good (uses 1 deployment):**
```bash
# All commits on dev (no deploys)
git checkout dev
git commit -m "Add /map page" && git push origin dev
git commit -m "Fix typo" && git push origin dev
git commit -m "Update metadata" && git push origin dev

# One merge to main (1 deploy)
git checkout main && git merge dev && git push origin main
```

### 2. Markdown Files Don't Deploy
Thanks to `.vercelignore`, these DON'T trigger deployments:
- `MARKETING_PLAN.md`
- `BRAND.md`
- `DEPLOYMENT_STRATEGY.md`
- Any `*.md` except README

**You can freely edit these on main without deploying!**

### 3. Use Local Scripts
Scripts like `scan-reddit-local.js` run on your machine, not Vercel:
```bash
# This doesn't require deployment
node scripts/scan-reddit-local.js
```

### 4. Database Changes via Prisma Studio
```bash
# Make data changes without deploying
npx prisma studio
```

### 5. Test Environment Variables Locally
```bash
# Test new env vars locally first
# Add to .env.local, test, then add to Vercel dashboard
```

---

## 🔄 Working with Production Database

Since you want to work with production data/images:

### Option A: Connect Locally to Production DB
```bash
# .env.local
DATABASE_URL="your-production-database-url"
```

**Pros:**
- Work with real data locally
- No deployments needed for testing
- Can use `/map`, `/marketing-genius` locally

**Cons:**
- Be careful with database changes
- Can't test Vercel-specific features (Edge functions, etc.)

### Option B: Production Testing via Branches
```bash
# Test on production using dev branch (if you enable preview for dev)
git push origin dev

# View preview at: firefly-grove-git-dev-username.vercel.app
```

**Note:** This uses a preview deployment (separate from production deployments count)

---

## 📦 Emergency: Running Out of Deployments

If you're approaching 100 deployments:

### 1. Upgrade to Pro ($20/month)
- Unlimited deployments
- Better performance
- Worth it if you deploy often

### 2. Wait for Monthly Reset
- Deployments reset monthly
- Plan your features for next month

### 3. Use Vercel CLI Preview
```bash
# Test without deploying
npx vercel --preview
```

This creates a temporary preview URL without counting toward your deployment limit (on Free tier).

---

## 🎯 Recommended Monthly Deployment Budget

With 100 deployments/month, plan for:

**Week 1: 20 deployments** (initial setup, bug fixes)
**Week 2: 25 deployments** (new features, testing)
**Week 3: 25 deployments** (marketing content, refinements)
**Week 4: 20 deployments** (final polish, optimizations)
**Buffer: 10 deployments** (emergency fixes)

**Daily Average: ~3 deployments/day**

---

## ✅ Quick Reference

### Start Working (Dev Branch)
```bash
git checkout dev
# ... make changes ...
git add . && git commit -m "Your changes"
git push origin dev
```

### Deploy (Main Branch)
```bash
git checkout main
git merge dev
git push origin main
```

### Check Deployment Count
```bash
# In Vercel dashboard
https://vercel.com/dashboard/usage
```

### Test Without Deploying
```bash
npm run build && npm run start
# Or
npx vercel --preview
```

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Usage Tracking**: https://vercel.com/dashboard/usage
- **Git Settings**: https://vercel.com/[project]/settings/git
- **Environment Variables**: https://vercel.com/[project]/settings/environment-variables

---

**Last Updated**: 2025-11-27
**Deployment Budget**: 25/100 used this month
