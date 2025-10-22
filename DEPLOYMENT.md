# Deployment Guide - Firefly Grove

## Quick Start (Demo Mode)

The easiest way to test Firefly Grove is to run it locally in demo mode:

```bash
# Install dependencies
npm install

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` and use the demo login buttons.

## Production Deployment to Vercel

### Prerequisites

1. GitHub account with your code pushed
2. Vercel account (free tier works)
3. PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Supabase](https://supabase.com))
4. Stripe account for payments
5. (Optional) Backblaze B2 account for backups

### Step 1: Prepare Your Database

#### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the `DATABASE_URL` connection string

#### Option B: Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy the connection string (use the "Transaction" pooler)

### Step 2: Update Prisma Schema

Edit `prisma/schema.prisma` and change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

### Step 4: Environment Variables

In your Vercel project settings, add these environment variables:

#### Required

```bash
# Disable demo mode for production
DEMO_MODE=false
NEXT_PUBLIC_DEMO_MODE=false
NODE_ENV=production

# Database
DATABASE_URL=your_postgres_connection_string

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cron Jobs
CRON_SECRET=generate_with_openssl_rand_hex_32
```

#### Optional (for full functionality)

```bash
# Backblaze B2 (for backups and media storage)
B2_APPLICATION_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET_NAME=firefly-grove-production
B2_BUCKET_ID=your_bucket_id

# Email (for notifications)
EMAIL_API_KEY=your_sendgrid_or_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Step 5: Initialize Database Schema

After deployment, run Prisma migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run Prisma push
vercel env pull .env.production
DATABASE_URL="your_postgres_url" npx prisma db push
```

### Step 6: Configure Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Step 7: Verify Cron Jobs

Vercel Cron Jobs are configured in `vercel.json`:

- **Weekly Backup**: Sundays at 2 AM
- **Monthly Integrity Check**: 1st of month at 3 AM
- **Daily Legacy Monitor**: Daily at 1 AM
- **Nightly Subscription Monitor**: Daily at midnight

Jobs are secured with `CRON_SECRET` environment variable.

## Post-Deployment Checklist

- [ ] Database schema is initialized
- [ ] Demo mode is disabled (`DEMO_MODE=false`)
- [ ] Stripe webhooks are configured
- [ ] Test user registration and login
- [ ] Test creating a branch and memory
- [ ] Test media upload (photo/audio)
- [ ] Verify cron jobs are running (check Vercel logs)
- [ ] Configure custom domain (optional)

## Monitoring

### Logs

View logs in Vercel Dashboard:
- Runtime logs for API errors
- Cron job execution logs
- Build logs

### Database

Monitor your database:
- Check connection pool usage
- Monitor storage size
- Set up backups (automatic in Vercel Postgres)

### Stripe

Monitor in Stripe Dashboard:
- Active subscriptions
- Failed payments
- Webhook delivery status

## Scaling Considerations

### Database

- Vercel Postgres handles up to 1,000 users easily on free tier
- For more users, upgrade to paid tier or migrate to dedicated Postgres

### Storage

- Data URLs work for demo but use real file storage for production
- Integrate Backblaze B2 or Vercel Blob for media files
- Implement cleanup jobs for old data URLs

### Performance

- Next.js automatically optimizes static pages
- API routes use edge functions for low latency
- Enable Vercel Analytics for monitoring

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
DATABASE_URL="your_url" npx prisma db push
```

### NextAuth Errors

- Ensure `NEXTAUTH_URL` matches your deployment URL
- Verify `NEXTAUTH_SECRET` is set
- Check that cookies are allowed

### Stripe Webhook Failures

- Verify webhook endpoint URL
- Check `STRIPE_WEBHOOK_SECRET` matches
- Review Stripe webhook logs for details

### Cron Jobs Not Running

- Verify `vercel.json` is in repository root
- Check `CRON_SECRET` is set in environment variables
- View logs in Vercel Dashboard > Deployments > Functions

## Custom Domain

1. Go to Vercel Project Settings > Domains
2. Add your domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` to use custom domain
5. Update Stripe webhook URL

## Backup and Recovery

### Database Backups

Vercel Postgres includes automatic backups. For manual backups:

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Code Backups

- Code is in GitHub
- Vercel maintains deployment history
- Can roll back to any previous deployment

## Security Checklist

- [ ] All environment variables use strong secrets
- [ ] Database connection uses SSL
- [ ] Stripe webhook signature verification enabled
- [ ] Cron endpoints secured with `CRON_SECRET`
- [ ] Demo mode disabled in production
- [ ] User passwords hashed with bcrypt
- [ ] Rate limiting on API routes (future enhancement)

## Support

For deployment issues:
- Check Vercel documentation
- Review Prisma documentation for database issues
- Consult Stripe documentation for payment issues

## Next Steps

After successful deployment:
1. Invite beta testers
2. Monitor error logs and fix issues
3. Implement Backblaze B2 for media storage
4. Add email notifications
5. Set up monitoring and alerts
6. Configure custom domain
7. Enable Vercel Analytics
