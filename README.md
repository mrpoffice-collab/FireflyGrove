# Firefly Grove

A private memory journal that helps people preserve stories, photos, and voice notes about the people and moments that shaped their lives.

## Features

- **Branches**: Each person or relationship becomes a branch in your grove
- **Memories**: Capture text, photos, and audio recordings
- **Firefly Visualization**: Each memory glows like a firefly, with brightness reflecting recent activity
- **Visibility Controls**: Private, Shared, or Legacy memories
- **Legacy Release**: Share memories with heirs after specific conditions are met
- **Demo Mode**: Full-featured demo with seeded data

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: Prisma ORM (SQLite for demo, PostgreSQL for production)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Payments**: Stripe (configured but bypassed in demo mode)
- **Deployment**: Vercel-ready

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npm run db:push
npm run db:seed
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Mode

Demo mode is enabled by default (see `.env.local`). This provides:

- Two pre-configured users: Alice and Bob
- Sample branches including "Zachary Peterson" and "Childhood Adventures"
- Pre-populated memories with various visibility settings
- Bypassed external services (Stripe, email, cloud storage)

**Demo Login Credentials:**
- Email: `alice@demo.local` or `bob@demo.local`
- Password: `demo123`

Quick login buttons are available on the login page in demo mode.

## Project Structure

```
firefly-grove/
├── app/
│   ├── api/              # API routes
│   ├── branch/           # Branch detail pages
│   ├── grove/            # Main grove view
│   ├── login/            # Authentication
│   └── page.tsx          # Landing page
├── components/           # Reusable React components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and seed
└── public/               # Static assets
```

## Core Concepts

### Branches
Each branch represents a person, relationship, or theme. Branches can be:
- Created by any user
- Shared with invited members
- Configured with legacy release settings

### Memories
Memories are entries within a branch that can include:
- Text content
- Optional photo
- Optional audio recording
- Visibility setting (Private/Shared/Legacy)

### Visibility Levels
- **Private**: Only the creator can see it
- **Shared**: Visible to all approved branch members
- **Legacy**: Hidden until release conditions are met

### Legacy Release
Branch owners can designate heirs and set release conditions:
- After death (requires external verification)
- After a specific date
- Manual release

## Environment Variables

See `.env.example` for all required environment variables.

Key settings:
- `DEMO_MODE`: Enable/disable demo mode
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Session encryption key
- `STRIPE_*`: Payment processing (optional in demo mode)

## Database

The app uses Prisma ORM with the following main models:
- `User`: User accounts with subscription status
- `Branch`: Memory collections for people/relationships
- `Entry`: Individual memories with media
- `BranchMember`: Access control for shared branches
- `Heir`: Legacy release configuration
- `Backup`: Backup tracking

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables in Vercel dashboard
4. For production, switch to PostgreSQL:
   - Update `DATABASE_URL` to PostgreSQL connection string
   - Update `prisma/schema.prisma` provider to `postgresql`
   - Run `npx prisma db push`

### Database Migration

To switch from SQLite (demo) to PostgreSQL (production):

1. Update `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Push schema:
```bash
npx prisma db push
```

## Future Enhancements

- Backblaze B2 integration for media storage
- Email notifications for invites and legacy releases
- Export to PDF/ZIP (Forever Kits)
- Automated backup jobs
- Subscription monitoring
- Mobile app

## Design Philosophy

Firefly Grove is designed to feel:
- **Warm and intimate**: Not social media, but a personal archive
- **Quiet and reflective**: Soft animations, muted colors
- **Safe and private**: Clear visibility controls and encryption
- **Lasting**: Export and legacy features for preservation

The firefly metaphor represents memories that glow brightest in quiet moments of reflection.

## License

Private project - All rights reserved

## Support

For issues or questions, please contact the development team.
