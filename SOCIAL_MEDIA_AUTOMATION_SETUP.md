# Social Media Automation Setup Guide

This guide walks you through setting up automated posting to Facebook, Pinterest, Reddit, and Email newsletters.

## Overview

Once configured, the system will:
1. **Generate content** from approved topics
2. **You review and approve** posts in the Draft Posts Review page
3. **Cron job runs daily** and automatically publishes approved posts to all platforms
4. **No manual posting needed** - everything happens automatically

---

## 1. Facebook Auto-Posting

### Prerequisites
- Facebook Page (not personal profile)
- Facebook Developer Account

### Setup Steps

**Step 1: Create Facebook App**
1. Go to https://developers.facebook.com/apps
2. Click "Create App"
3. Select "Business" as app type
4. Fill in app name: "Firefly Grove Marketing"
5. Create app

**Step 2: Add Facebook Login Product**
1. In your app dashboard, click "Add Product"
2. Select "Facebook Login"
3. Select "Web" platform
4. Enter Site URL: `https://fireflygrove.app`

**Step 3: Get Page Access Token**
1. Go to Graph API Explorer: https://developers.facebook.com/tools/explorer/
2. Select your app from dropdown
3. Click "Get Token" → "Get Page Access Token"
4. Select your Facebook Page
5. Grant permissions: `pages_read_engagement`, `pages_manage_posts`
6. Copy the access token (starts with `EAAG...`)

**Step 4: Convert to Long-Lived Token**
1. Go to Access Token Debugger: https://developers.facebook.com/tools/debug/accesstoken/
2. Paste your token
3. Click "Extend Access Token"
4. Copy the new long-lived token (lasts 60 days)

**Step 5: Get Page ID**
1. Go to your Facebook Page
2. Click "About"
3. Scroll down to "Page ID" and copy it

**Step 6: Add to .env**
```bash
# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN=EAAG_your_long_lived_token_here
FACEBOOK_PAGE_ID=123456789012345
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

**Note:** Page access tokens expire every 60 days. You'll need to refresh them periodically.

---

## 2. Pinterest Auto-Posting

### Prerequisites
- Pinterest Business Account
- Pinterest Developer Account

### Setup Steps

**Step 1: Convert to Business Account**
1. Go to https://www.pinterest.com/settings/account-settings
2. Click "Convert to business account" (if personal)

**Step 2: Create Pinterest App**
1. Go to https://developers.pinterest.com/apps/
2. Click "Create app"
3. Fill in details:
   - App name: "Firefly Grove Marketing"
   - Description: "Automated content posting"
   - Website: https://fireflygrove.app
4. Accept terms and create

**Step 3: Get Access Token**
1. In your app, go to "Settings"
2. Under "OAuth 2.0", generate an access token
3. Select scopes: `boards:read`, `boards:write`, `pins:read`, `pins:write`
4. Copy the access token

**Step 4: Get Board ID**
1. Go to your Pinterest profile
2. Open the board where you want pins to post
3. Copy the board ID from URL: `pinterest.com/username/board-name/`
4. Board ID is the last part: `board-name`

Or use the API:
```bash
curl -X GET https://api.pinterest.com/v5/boards \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Step 5: Add to .env**
```bash
# Pinterest
PINTEREST_ACCESS_TOKEN=pina_your_access_token_here
PINTEREST_BOARD_ID=1234567890123456789
```

---

## 3. Reddit Auto-Posting

### Prerequisites
- Reddit Account
- Reddit App Credentials

### Setup Steps

**Step 1: Create Reddit App**
1. Go to https://www.reddit.com/prefs/apps
2. Scroll to bottom, click "create another app..."
3. Fill in:
   - Name: "Firefly Grove Marketing"
   - App type: Select "script"
   - Description: "Automated content posting"
   - About URL: https://fireflygrove.app
   - Redirect URI: http://localhost:8080 (not used but required)
4. Click "create app"

**Step 2: Get Credentials**
1. Copy the client ID (under app name, looks like `abcdefg1234567`)
2. Copy the client secret (labeled "secret")

**Step 3: Add to .env**
```bash
# Reddit
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
```

**Important Reddit Notes:**
- Use a dedicated account for bot posting (not your personal account)
- Read each subreddit's rules - many ban self-promotion
- Start with friendly subreddits: r/Genealogy, r/AskOldPeople, r/family
- Engage authentically - don't just drop links
- Consider posting to your own profile first (r/u_yourusername)

---

## 4. Email Newsletter Setup

### Prerequisites
- Resend Account (free tier: 3000 emails/month, 100/day)

### Setup Steps

**Step 1: Sign Up for Resend**
1. Go to https://resend.com/signup
2. Create account
3. Verify email

**Step 2: Get API Key**
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "Firefly Grove Production"
4. Copy the API key (starts with `re_...`)

**Step 3: Create Audience (Email List)**
1. Go to https://resend.com/audiences
2. Click "Create Audience"
3. Name: "Firefly Grove Newsletter"
4. Copy the Audience ID

**Step 4: Add Subscribers**
1. Manually add emails, or
2. Use Resend's audience import feature, or
3. Integrate with your signup form

**Step 5: Verify Domain (Optional but Recommended)**
1. Go to https://resend.com/domains
2. Add your domain: fireflygrove.app
3. Add DNS records provided by Resend
4. Wait for verification

**Step 6: Add to .env**
```bash
# Email Newsletter
RESEND_API_KEY=re_your_api_key_here
NEWSLETTER_FROM_EMAIL=newsletter@fireflygrove.app
NEWSLETTER_AUDIENCE_ID=audience_id_here
```

---

## 5. Cron Job Setup

### Option A: Vercel Cron (Recommended)

**Step 1: Create vercel.json**
Create `vercel.json` in project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Step 2: Set Cron Secret**
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add: `CRON_SECRET` = `your-random-secret-key-here`
3. Generate secret with: `openssl rand -base64 32`

**Step 3: Deploy**
```bash
git add vercel.json
git commit -m "Add cron job for scheduled publishing"
git push
```

Vercel will automatically set up the cron job.

### Option B: External Cron Service

If you want to test locally or use another service:

**cron-job.org Setup:**
1. Go to https://cron-job.org
2. Create account
3. Create new cron job:
   - Title: "Firefly Grove Publishing"
   - URL: `https://fireflygrove.app/api/cron/publish-scheduled`
   - Method: POST
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Daily at 9:00 AM
4. Save and enable

---

## 6. Testing the System

### Test Individual Platforms

**Facebook Test:**
```bash
curl -X POST http://localhost:3000/api/cron/publish-scheduled \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Check Scheduled Posts:**
```bash
curl http://localhost:3000/api/cron/publish-scheduled
```

### Manual Test Flow

1. Go to Topic Intelligence
2. Generate 1-2 test topics
3. Select topics → Batch Generate
4. Set start date to today
5. Go to Draft Posts Review
6. Approve 1 post from each platform
7. Manually trigger cron: `POST /api/cron/publish-scheduled`
8. Check each platform for posts

---

## 7. Environment Variables Summary

Add all of these to your `.env.local` and Vercel environment variables:

```bash
# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN=EAAG...
FACEBOOK_PAGE_ID=123456789012345
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# Pinterest
PINTEREST_ACCESS_TOKEN=pina_...
PINTEREST_BOARD_ID=...

# Reddit
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USERNAME=...
REDDIT_PASSWORD=...

# Email (Resend)
RESEND_API_KEY=re_...
NEWSLETTER_FROM_EMAIL=newsletter@fireflygrove.app
NEWSLETTER_AUDIENCE_ID=...

# Cron Security
CRON_SECRET=your-random-secret-key
```

---

## 8. Usage Workflow

**Daily Routine (Fully Automated):**
1. ✅ Cron runs at 9 AM
2. ✅ Publishes all approved posts scheduled for today
3. ✅ Blog posts → written to `/public/blog/`
4. ✅ Facebook → posted to your page
5. ✅ Pinterest → pins created
6. ✅ Reddit → posted to subreddits
7. ✅ Newsletter → sent to subscribers
8. ✅ You get notified of successes/failures

**Your Only Tasks:**
1. Review drafts (a few times per week)
2. Approve posts you like
3. Check analytics occasionally
4. Refresh Facebook token every 60 days

---

## 9. Troubleshooting

### "Facebook credentials not configured"
- Check FACEBOOK_PAGE_ACCESS_TOKEN is in .env
- Check token is still valid (use Token Debugger)
- Regenerate if expired

### "Pinterest API error"
- Verify board ID is correct
- Check access token has write permissions
- Make sure board is not private

### "Reddit authentication failed"
- Check username/password are correct
- Verify client ID and secret from app settings
- Try regenerating client secret

### "Email failed to send"
- Check Resend API key is valid
- Verify audience ID exists
- Check daily sending limit (100/day on free tier)

### Posts not publishing automatically
- Check Vercel cron is configured
- Verify CRON_SECRET matches in both places
- Check Vercel logs for errors
- Manually test: `POST /api/cron/publish-scheduled`

---

## 10. Best Practices

**Content Scheduling:**
- Schedule blog posts for 6-8 AM (best for SEO indexing)
- Schedule social posts for peak engagement times
- Spread posts throughout the day (don't flood followers)

**Content Quality:**
- Always review AI-generated content before approving
- Customize posts for each platform's audience
- Test with small batches first (5-10 posts)

**Subreddit Strategy:**
- Research subreddit rules before posting
- Engage authentically - don't just spam links
- Start with friendly communities (r/Genealogy)
- Post to your own profile initially (r/u_yourusername)

**Email Best Practices:**
- Test emails on yourself first
- Keep subject lines under 50 characters
- Include clear value proposition
- Easy unsubscribe link

**Security:**
- Never commit API keys to git
- Use environment variables only
- Rotate tokens periodically
- Use long, random CRON_SECRET

---

## Need Help?

- Facebook API Docs: https://developers.facebook.com/docs/graph-api
- Pinterest API Docs: https://developers.pinterest.com/docs/api/v5/
- Reddit API Docs: https://www.reddit.com/dev/api
- Resend Docs: https://resend.com/docs

---

## Summary

Once configured, your system will:
1. Generate 39 blog posts + 312 social pieces (3 months of content)
2. You approve what you like
3. System auto-publishes to all platforms on schedule
4. Zero manual posting required
5. You just check in occasionally to approve new batches

**Time investment:**
- Setup: 2-3 hours (one time)
- Weekly: 30 minutes reviewing drafts
- Monthly: 5 minutes refreshing Facebook token

**Result:** Consistent, automated presence across all platforms without daily manual work!
