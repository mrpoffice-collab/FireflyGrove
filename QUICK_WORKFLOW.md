# 🚀 Quick Workflow Guide

## Daily Development (No Deployments)

```bash
# 1. Make sure you're on dev branch
git checkout dev

# 2. Pull latest changes
git pull origin dev

# 3. Make your changes
# ... edit files ...

# 4. Commit and push (does NOT deploy)
git add .
git commit -m "Add new feature"
git push origin dev
```

**Repeat step 3-4 as many times as you want. No deployments!** ✅

---

## Deploy to Production (Use Sparingly)

```bash
# 1. Switch to main
git checkout main

# 2. Pull latest
git pull origin main

# 3. Merge all your dev changes
git merge dev

# 4. Push (triggers ONE deployment)
git push origin main

# 5. Switch back to dev for more work
git checkout dev
```

**This counts as 1 deployment. Do this only when ready!** 🚀

---

## Connect to Production Locally

Work with production data/images without deploying:

```bash
# 1. Get production database URL from Vercel dashboard
# 2. Add to .env.local:
DATABASE_URL="your-production-postgres-url"

# 3. Start local dev server
npm run dev

# 4. Access all features locally:
# - /map
# - /marketing-genius
# - /grove (with production data)
```

**You can test everything locally with production data!** 🎯

---

## When to Deploy to Main

Deploy only when you have:
- ✅ Multiple features complete and tested
- ✅ No breaking bugs
- ✅ Marketing content proofread
- ✅ Everything working in local testing

**Goal: Batch 5-10 commits into 1 deployment**

---

## Check Deployment Count

```bash
# In browser, visit:
https://vercel.com/dashboard/usage
```

Track your usage:
- Free tier: 100 deployments/month
- Try to stay under 80 (save 20 for emergencies)

---

## Emergency: Testing Without Deploying

```bash
# Run production build locally
npm run build
npm run start

# Opens on http://localhost:3000
# Test everything here before deploying
```

---

## Files That DON'T Trigger Deployment

You can edit these on ANY branch without deploying:
- `*.md` (all markdown files)
- `scripts/*.js` (local scripts)
- `BRAND.md`, `MARKETING_PLAN.md`, etc.

**You can update docs directly on main! No deployment needed.** 📝

---

## Quick Commands

```bash
# Switch to dev
git checkout dev

# Switch to main
git checkout main

# See current branch
git branch

# Deploy from dev to main
git checkout main && git merge dev && git push origin main && git checkout dev
```

---

**Remember: Work on `dev`, deploy from `main`!** 🌳
