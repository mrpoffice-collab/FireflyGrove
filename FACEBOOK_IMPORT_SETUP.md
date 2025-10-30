# 🚀 Facebook Import - Quick Setup Guide

## ✅ Step 1: Database Schema (DONE!)

I've updated the Prisma schema with:
- **NestItem** enhancements for imported photos
- **FacebookToken** model for OAuth tokens
- **ImportJob** model for tracking background imports
- **Entry** import tracking fields

## 📝 Step 2: YOUR ACTION - Create Facebook App

### Go to Facebook Developers:
https://developers.facebook.com/apps/

### Create New App:
1. Click "Create App"
2. Select **"Consumer"** use case
3. App name: **"Firefly Grove"**
4. Contact email: Your email
5. Click "Create App"

### Add Facebook Login Product:
1. In left sidebar, click "+ Add Product"
2. Find "Facebook Login" → Click "Set Up"
3. Choose "Web" platform
4. Site URL: `https://firefly-grove.vercel.app`

### Configure OAuth Settings:
1. Go to "Facebook Login" → "Settings"
2. Add these **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/facebook/callback
   https://firefly-grove.vercel.app/api/facebook/callback
   ```
3. Click "Save Changes"

### Request Permissions:
1. Go to "App Review" → "Permissions and Features"
2. Request these permissions:
   - `user_photos` - **REQUIRED** - Access user's photos
   - `user_posts` - **REQUIRED** - Access timeline posts

3. For each permission:
   - Click "Request Advanced Access"
   - Fill out use case: "Import user's photos to preserve family memories"
   - Submit for review

**Note:** You can test with your own account before permissions are approved!

### Get Your Credentials:
1. Go to "Settings" → "Basic"
2. Copy these values:
   - **App ID**: `________________`
   - **App Secret**: Click "Show" → `________________`

---

## 🔐 Step 3: Add Environment Variables

### Local Development (.env.local):
```env
# Add these to your .env.local file:

# Facebook API (for importing memories from Facebook)
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/facebook/callback
```

### Production (Vercel Dashboard):
1. Go to https://vercel.com/dashboard
2. Select "firefly-grove" project
3. Go to "Settings" → "Environment Variables"
4. Add these three variables:
   ```
   FACEBOOK_APP_ID=your_app_id_here
   FACEBOOK_APP_SECRET=your_app_secret_here
   FACEBOOK_REDIRECT_URI=https://firefly-grove.vercel.app/api/facebook/callback
   ```

---

## 🗄️ Step 4: Run Database Migration

After you've added the environment variables, I'll run:
```bash
npx prisma db push
```

This will update your Neon database with the new models.

---

## 🎯 Next Steps After Setup

Once you provide the Facebook App ID and App Secret:

1. **I'll build**: OAuth flow + Facebook API client
2. **You'll test**: Connect your Facebook account
3. **I'll build**: Import preview and analysis
4. **You'll test**: See what would be imported
5. **I'll build**: Smart routing and Nest UI
6. **You'll test**: Full import with your photos
7. **We'll iterate**: Adjust routing accuracy
8. **Deploy**: Roll out to beta testers

---

## 📖 Facebook API Documentation

- OAuth: https://developers.facebook.com/docs/facebook-login/web
- Photos API: https://developers.facebook.com/docs/graph-api/reference/user/photos
- Posts API: https://developers.facebook.com/docs/graph-api/reference/user/feed

---

## ⏱️ Estimated Timeline

- **Your setup**: 15-20 minutes
- **Initial development**: 2-3 days
- **Testing with your account**: 1 day
- **Polish and deployment**: 2-3 days
- **Total**: ~1 week to working MVP

---

## 🎬 Ready to Start?

1. Create Facebook App (15 mins)
2. Get App ID & Secret
3. Add to .env.local
4. Tell me when ready, I'll start building!

**The activation revolution is about to begin! 🚀**
