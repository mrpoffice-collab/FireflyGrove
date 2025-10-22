# Quick Start Guide - Firefly Grove

Get Firefly Grove running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. **Install dependencies**
```bash
npm install
```

2. **Initialize the database**
```bash
npm run db:push
```

3. **Seed demo data**
```bash
npm run db:seed
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**

Visit [http://localhost:3000](http://localhost:3000)

## Demo Login

The app is pre-configured in **Demo Mode** with two test users:

**Alice's Account:**
- Email: `alice@demo.local`
- Password: `demo123`

**Bob's Account:**
- Email: `bob@demo.local`
- Password: `demo123`

Use the quick login buttons on the login page.

## What's Included

Alice's account has pre-seeded data:

- **Zachary Peterson** branch with 3 memories
- **Childhood Adventures** branch with 2 memories
- Mix of private, shared, and legacy memories
- Bob is a member of the Zachary Peterson branch

## Try These Features

### 1. View Your Grove
- See fireflies representing your branches
- Each firefly's brightness reflects memory count
- Click any branch card to view details

### 2. Create a New Branch
- Click "New Branch"
- Enter a name (e.g., "Summer 2024")
- Add an optional description

### 3. Add a Memory
- Open any branch
- Click "Add Memory"
- Write your thoughts
- Optional: upload a photo
- Optional: record audio (requires microphone permission)
- Choose visibility: Private, Shared, or Legacy

### 4. Export a Branch
- Navigate to Settings (future feature)
- Or use API: `/api/branches/[branchId]/export`
- Downloads as HTML "Forever Kit"

### 5. Legacy Features
- Memories marked as "Legacy" are hidden
- Configure heirs via API
- Set release conditions (date, manual, etc.)

## Demo Mode Features

When `DEMO_MODE=true`, the app:
- Uses SQLite instead of PostgreSQL
- Bypasses Stripe payment processing
- Skips external email services
- Bypasses cloud storage (uses data URLs)
- Provides instant access without registration

## File Structure

```
firefly-grove/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth
│   │   ├── branches/     # Branch & entry APIs
│   │   ├── cron/         # Scheduled jobs
│   │   ├── legacy/       # Legacy downloads
│   │   └── stripe/       # Payment webhooks
│   ├── branch/[id]/      # Branch detail page
│   ├── grove/            # Main dashboard
│   ├── login/            # Auth page
│   └── page.tsx          # Landing page
├── components/           # React components
├── lib/                  # Utilities
├── prisma/               # Database schema & seed
└── public/               # Static files
```

## Next Steps

1. **Explore the UI** - Click around and add memories
2. **Check the code** - See how firefly animations work
3. **Read the README** - Learn about production deployment
4. **Review DEPLOYMENT.md** - Steps for Vercel deployment

## Common Issues

### Database not found
```bash
# Re-run database setup
npm run db:push
npm run db:seed
```

### Port already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Audio recording not working
- Grant microphone permissions in browser
- Use HTTPS in production (required for media APIs)

### Firefly animation laggy
- Close other browser tabs
- Try Chrome or Edge for best performance

## Development Commands

```bash
# Start dev server
npm run dev

# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed

# View database
npm run db:studio

# Build for production
npm run build
npm run start
```

## Environment Variables

The `.env.local` file is already configured for demo mode. For production setup, see `DEPLOYMENT.md`.

## Getting Help

- Check `README.md` for full documentation
- Review API routes in `app/api/`
- Inspect database schema in `prisma/schema.prisma`
- Look at seed data in `prisma/seed.ts`

## What's Different from Production?

In demo mode:
- ✅ All core features work
- ✅ Full UI and animations
- ✅ Database operations
- ❌ No real payments (Stripe bypassed)
- ❌ No email notifications
- ❌ No cloud file storage
- ❌ Uses SQLite instead of PostgreSQL

To switch to production mode, see `DEPLOYMENT.md`.

---

**Enjoy exploring Firefly Grove!**

Remember: In demo mode, all data is stored locally in `prisma/dev.db`. Deleting this file resets everything.
