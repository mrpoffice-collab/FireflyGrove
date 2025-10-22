# 🌟 Welcome to Firefly Grove

A private memory journal for preserving the stories that shaped your life.

---

## 🚀 Get Started in 3 Minutes

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Then open http://localhost:3000 and click **"Login as Alice"**

---

## 📚 Documentation Guide

Choose your path:

### I want to start immediately
→ Read **QUICKSTART.md** (5 minutes)

### I want detailed setup instructions
→ Read **SETUP_GUIDE.md** (15 minutes)

### I want to verify my installation
→ Use **INSTALLATION_CHECKLIST.md** (thorough)

### I want to deploy to production
→ Follow **DEPLOYMENT.md** (30 minutes)

### I want to understand the project
→ Review **PROJECT_SUMMARY.md** (overview)

### I want full documentation
→ See **README.md** (complete reference)

---

## 🎯 What is Firefly Grove?

Firefly Grove is not social media. It's a personal archive where:

- 🌳 **Branches** represent people or relationships
- ✦ **Memories** are stories, photos, and voice notes
- 🔒 **Legacy** lets you preserve memories for heirs
- 🎨 **Fireflies** glow softly as visual reminders

It's designed to feel **warm**, **private**, and **reflective**.

---

## ✨ Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ Ready | Secure login with NextAuth |
| Branches | ✅ Ready | Create memory collections |
| Memories | ✅ Ready | Text, photos, and audio |
| Firefly UI | ✅ Ready | Beautiful animated canvas |
| Visibility | ✅ Ready | Private, Shared, or Legacy |
| Export | ✅ Ready | Download as HTML archive |
| Legacy Release | ✅ Ready | Share with heirs later |
| Demo Mode | ✅ Ready | Full-featured demonstration |
| Stripe Billing | ✅ Ready | Subscription management |
| Automated Jobs | ✅ Ready | Backups and monitoring |

---

## 🎮 Demo Mode

The app includes a **fully functional demo** with:

- 2 pre-configured users (Alice and Bob)
- Sample branches ("Zachary Peterson", "Childhood Adventures")
- 5 beautifully written example memories
- Different visibility levels to explore
- No external services required

**Demo Credentials:**
- Email: `alice@demo.local` or `bob@demo.local`
- Password: `demo123`

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: SQLite (demo) / PostgreSQL (production)
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Deployment**: Vercel

---

## 📁 Project Structure

```
firefly-grove/
├── app/              # Pages and API routes
├── components/       # React components
├── lib/              # Utilities and configuration
├── prisma/           # Database schema and seeds
├── *.md              # Documentation (you are here!)
└── package.json      # Dependencies
```

---

## 🎨 Design Philosophy

### Visual
- Dark, intimate backgrounds
- Soft firefly glow (#ffd966)
- Gentle, breathing animations
- No bright, jarring colors

### Emotional
- Safe space for raw memories
- Privacy-first, not social
- Quiet reflection over sharing
- Built for long-term legacy

---

## 🚦 Next Steps

### 1. Install and Run
```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### 2. Explore the Demo
- Login as Alice
- View the two branches
- Read the sample memories
- Create a new memory
- Record audio or add a photo

### 3. Customize
- Edit prompts in memory creation
- Change colors in `tailwind.config.ts`
- Modify animations in `FireflyCanvas.tsx`

### 4. Deploy
- Follow `DEPLOYMENT.md`
- Switch to PostgreSQL
- Configure Stripe
- Deploy to Vercel

---

## 📖 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run db:push` | Initialize database |
| `npm run db:seed` | Add demo data |
| `npm run db:studio` | View database in browser |
| `npm run build` | Build for production |

---

## 🆘 Need Help?

### Installation Issues
See **SETUP_GUIDE.md** → Troubleshooting section

### Understanding Features
Read **README.md** → Core Features

### Deployment Problems
Check **DEPLOYMENT.md** → Troubleshooting

### General Questions
Review **PROJECT_SUMMARY.md** for overview

---

## 🎯 Success Checklist

After running the setup commands, you should be able to:

- [ ] Open http://localhost:3000
- [ ] See the landing page with fireflies
- [ ] Login as Alice (quick button)
- [ ] View the grove with 2 branches
- [ ] Open "Zachary Peterson" branch
- [ ] See 3 memories
- [ ] Create a new memory
- [ ] Upload a photo
- [ ] Record audio (optional)
- [ ] Export a branch to HTML

If all items work → **You're ready to go!** 🎉

---

## 🌟 What Makes This Special?

### Not Social Media
No likes, shares, or followers. Just your memories, preserved quietly.

### Legacy-First
Designed for memories that matter beyond your lifetime.

### Beautiful & Intimate
Soft animations and warm glow create a reflective space.

### Fully Functional Demo
Test everything before deployment. No external accounts needed.

### Production-Ready
Deploy to Vercel in 30 minutes. Scales to 1,000+ users.

---

## 📝 Documentation Files

| File | Purpose | Time |
|------|---------|------|
| START_HERE.md | This file - your entry point | 5 min |
| QUICKSTART.md | Fastest path to running app | 5 min |
| SETUP_GUIDE.md | Detailed installation guide | 15 min |
| INSTALLATION_CHECKLIST.md | Verify everything works | 20 min |
| README.md | Complete feature reference | 30 min |
| PROJECT_SUMMARY.md | Technical overview | 15 min |
| DEPLOYMENT.md | Production deployment | 30 min |

---

## 💡 Pro Tips

1. **Start with the demo** - Login as Alice to see sample data
2. **Read the memories** - They demonstrate different use cases
3. **Try all features** - Photos, audio, visibility levels
4. **Export a branch** - See the beautiful HTML output
5. **Check Prisma Studio** - View database structure
6. **Customize prompts** - Make them personal to you

---

## 🎨 Customization Ideas

Once running, you can:

- Change firefly colors in `globals.css`
- Edit memory prompts in `app/branch/[branchId]/page.tsx`
- Adjust animation speed in `FireflyCanvas.tsx`
- Modify branch limits in database schema
- Add new visibility levels
- Create custom export templates

---

## 🚀 Ready to Begin?

**Choose your path:**

### Path 1: Quick Start (Recommended)
```bash
npm install && npm run db:push && npm run db:seed && npm run dev
```
Then read **QUICKSTART.md**

### Path 2: Thorough Setup
Follow **SETUP_GUIDE.md** step by step

### Path 3: Jump to Production
Skip demo, go straight to **DEPLOYMENT.md**

---

## 📞 Support

- **Installation**: See SETUP_GUIDE.md
- **Features**: See README.md
- **Deployment**: See DEPLOYMENT.md
- **Code**: Check inline comments
- **Database**: Use `npm run db:studio`

---

## 🎉 That's It!

You have everything you need to:
- Run Firefly Grove locally
- Explore all features
- Customize the experience
- Deploy to production

**The grove awaits. Your memories matter.**

---

**Last Updated**: October 2024
**Version**: 0.1.0 (MVP)
**Status**: Ready for Development

---

### Quick Commands

```bash
# Setup
npm install
npm run db:push
npm run db:seed

# Run
npm run dev

# View DB
npm run db:studio

# Build
npm run build
```

### Quick Links

- Local: http://localhost:3000
- Login: alice@demo.local / demo123
- Studio: http://localhost:5555

---

**Welcome to Firefly Grove. Let's preserve what matters most.** ✨
