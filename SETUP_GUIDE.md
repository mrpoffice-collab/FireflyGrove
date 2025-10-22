# Complete Setup Guide - Firefly Grove

This guide walks you through setting up Firefly Grove from scratch.

## Table of Contents

1. [Quick Start (Recommended)](#quick-start)
2. [Manual Setup](#manual-setup)
3. [Verify Installation](#verify-installation)
4. [Troubleshooting](#troubleshooting)
5. [Production Deployment](#production-deployment)

---

## Quick Start

The fastest way to get started:

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npm run db:push

# 3. Seed demo data
npm run db:seed

# 4. Start the server
npm run dev
```

Then open http://localhost:3000 and use the demo login buttons.

**Demo Credentials:**
- Email: `alice@demo.local` or `bob@demo.local`
- Password: `demo123`

---

## Manual Setup

### Step 1: Clone and Install

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd firefly-grove

# Install all dependencies
npm install
```

This installs:
- Next.js 14 (React framework)
- Prisma (database ORM)
- NextAuth (authentication)
- Tailwind CSS (styling)
- Stripe SDK (payments)
- And more...

### Step 2: Environment Configuration

The `.env.local` file is already configured for demo mode. Review it:

```bash
# View current settings
cat .env.local
```

Key settings:
- `DEMO_MODE=true` - Enables demo mode
- `DATABASE_URL="file:./dev.db"` - Uses SQLite locally
- All external services are bypassed

### Step 3: Database Setup

Initialize the database schema:

```bash
# Create database and tables
npm run db:push
```

This creates `prisma/dev.db` with all necessary tables:
- Users
- Branches
- Entries (memories)
- BranchMembers
- Heirs
- Backups

### Step 4: Seed Demo Data

Populate the database with sample data:

```bash
npm run db:seed
```

This creates:
- Alice and Bob (demo users)
- Zachary Peterson branch (with 3 memories)
- Childhood Adventures branch (with 2 memories)
- Heir configurations
- Various memory types (private, shared, legacy)

### Step 5: Start Development Server

```bash
npm run dev
```

The app will start on http://localhost:3000

---

## Verify Installation

### 1. Check the Landing Page

Visit http://localhost:3000

You should see:
- "Firefly Grove" title
- Animated fireflies
- "Enter Your Grove" button

### 2. Test Login

Click "Enter Your Grove" → Should redirect to `/login`

Use demo credentials:
- Email: `alice@demo.local`
- Password: `demo123`

Or click "Login as Alice" quick button

### 3. View the Grove

After login, you should see:
- Header with "Firefly Grove" and user name
- Firefly canvas visualization
- Two branch cards:
  - Zachary Peterson (3 memories)
  - Childhood Adventures (2 memories)

### 4. Open a Branch

Click "Zachary Peterson" branch

You should see:
- Branch title and description
- Memory creation prompt
- List of 3 memories with:
  - Author name
  - Timestamp
  - Visibility badge
  - Memory text

### 5. Create a Memory

Click "Add Memory"

Test form:
- Enter text
- Upload a photo (optional)
- Record audio (optional - requires mic permission)
- Select visibility (Private/Shared/Legacy)
- Click "Save Memory"

Memory should appear in the list immediately

### 6. Test Export

Visit: http://localhost:3000/api/branches/[branchId]/export

(Replace [branchId] with actual ID from URL)

Should download an HTML file with all memories

---

## Troubleshooting

### Issue: Port 3000 already in use

**Solution:**
```bash
# Use different port
PORT=3001 npm run dev
```

### Issue: Database not found

**Solution:**
```bash
# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Prisma client not generated

**Solution:**
```bash
# Generate Prisma client
npx prisma generate
```

### Issue: TypeScript errors

**Solution:**
```bash
# Check for errors
npm run build

# If errors persist, check tsconfig.json
```

### Issue: Tailwind styles not loading

**Solution:**
```bash
# Verify Tailwind is installed
npm list tailwindcss

# If missing
npm install -D tailwindcss postcss autoprefixer
```

### Issue: Audio recording not working

**Causes:**
- Browser doesn't support MediaRecorder API
- Microphone permission denied
- Not using HTTPS (required in production)

**Solution:**
- Use Chrome or Edge browser
- Allow microphone access when prompted
- In production, ensure HTTPS is enabled

### Issue: Image upload shows broken image

**Explanation:**
- Demo mode uses data URLs
- Large images may cause issues
- In production, use real file storage (Backblaze B2)

**Workaround:**
- Use smaller images (<2MB)
- Or implement actual file upload service

### Issue: NextAuth session errors

**Solution:**
```bash
# Verify environment variables
grep NEXTAUTH .env.local

# Should show:
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=firefly-grove-demo-secret-key-change-in-production
```

---

## Production Deployment

For deploying to production, see `DEPLOYMENT.md`.

Quick overview:

1. **Switch Database**
   - Change from SQLite to PostgreSQL
   - Update `DATABASE_URL` in environment
   - Update `prisma/schema.prisma` provider

2. **Disable Demo Mode**
   - Set `DEMO_MODE=false`
   - Set `NEXT_PUBLIC_DEMO_MODE=false`

3. **Configure Services**
   - Set up Stripe for payments
   - Configure email service
   - Set up Backblaze B2 for storage

4. **Deploy to Vercel**
   - Push to GitHub
   - Import in Vercel
   - Configure environment variables
   - Deploy

Full instructions in `DEPLOYMENT.md`.

---

## Development Tips

### Database Management

```bash
# View database in browser
npm run db:studio

# Reset and reseed
rm prisma/dev.db && npm run db:push && npm run db:seed

# Export database
sqlite3 prisma/dev.db .dump > backup.sql
```

### Code Structure

```
app/
├── api/              # Backend API routes
├── branch/[id]/      # Dynamic branch pages
├── grove/            # Main dashboard
├── login/            # Auth pages
└── page.tsx          # Landing page

components/           # Reusable UI
lib/                  # Utilities & config
prisma/               # Database schema
```

### Hot Reload

Next.js automatically reloads when you edit:
- React components
- API routes
- CSS files

Database changes require:
```bash
npm run db:push
```

### Debugging

```bash
# API routes
console.log() in route handlers
Check terminal output

# Client components
console.log() in React components
Check browser console

# Database queries
Enable Prisma logging in lib/prisma.ts
```

---

## Next Steps

1. ✅ **Installation Complete** - You're ready to develop!
2. 📖 **Read the README** - Learn about all features
3. 🎨 **Customize** - Modify colors, prompts, animations
4. 🚀 **Deploy** - Follow DEPLOYMENT.md for production
5. 🧪 **Test** - Try all features before going live

---

## Getting Help

- **Documentation**: See README.md
- **Deployment**: See DEPLOYMENT.md
- **Quick Reference**: See QUICKSTART.md
- **Code Issues**: Check browser console and terminal
- **Database Issues**: Use `npm run db:studio`

---

## Summary Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Database initialized (`npm run db:push`)
- [ ] Demo data seeded (`npm run db:seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can login as Alice
- [ ] Can view branches
- [ ] Can create memories
- [ ] Ready to customize and deploy!

**Congratulations!** Firefly Grove is ready for development.
