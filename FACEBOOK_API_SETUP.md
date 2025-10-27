# Facebook Graph API Setup Guide

## What You'll Need:
1. Facebook App ID
2. Facebook App Secret
3. Page Access Token
4. Facebook Page ID

---

## Step-by-Step Setup

### 1. Create a Facebook App (Meta Developer Portal)

1. Go to: https://developers.facebook.com/apps
2. Click **"Create App"**
3. Choose **"Business"** as the app type
4. Fill in:
   - **App Name**: "Firefly Grove Marketing"
   - **App Contact Email**: Your email
   - **Business Account**: Select or create one
5. Click **"Create App"**
6. You'll see your **App ID** - SAVE THIS

### 2. Add Facebook Login Product

1. In your app dashboard, scroll to **"Add Products"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** as the platform
4. Enter your website URL: `https://firefly-grove.vercel.app`
5. Click **"Save"** and **"Continue"**

### 3. Configure Facebook Login Settings

1. In left sidebar, go to: **Facebook Login → Settings**
2. Add to **"Valid OAuth Redirect URIs"**:
   ```
   https://firefly-grove.vercel.app/api/auth/facebook/callback
   http://localhost:3000/api/auth/facebook/callback
   ```
3. Click **"Save Changes"**

### 4. Add Pages Product

1. In left sidebar, scroll to **"Add Products"**
2. Find **"Facebook Pages"** and click **"Set Up"**
3. This allows your app to post to pages

### 5. Get Your App Secret

1. In left sidebar, go to: **Settings → Basic**
2. Find **"App Secret"** and click **"Show"**
3. Enter your Facebook password to reveal it
4. **App Secret** - SAVE THIS (Keep it secret!)

### 6. Get Page Access Token

**IMPORTANT**: This is the trickiest part. You need a long-lived Page Access Token.

#### Option A: Using Graph API Explorer (Recommended)

1. Go to: https://developers.facebook.com/tools/explorer/
2. In top-right, select your app from dropdown
3. Click **"Generate Access Token"**
4. In the permissions dialog, select:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
5. Click **"Generate Access Token"** and authorize
6. You'll get a **User Access Token** (temporary)

#### Option B: Get Long-Lived Page Token (REQUIRED)

**You need to convert the User Token to a Long-Lived Page Token:**

1. Run this command in your terminal (replace YOUR_APP_ID, YOUR_APP_SECRET, and YOUR_USER_TOKEN):

```bash
curl -i -X GET "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_USER_TOKEN"
```

2. This returns a **Long-Lived User Token** (60 days)
3. Now get your pages and their tokens:

```bash
curl -i -X GET "https://graph.facebook.com/v19.0/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN"
```

4. Find your page in the response and copy its **access_token** - THIS IS YOUR PAGE ACCESS TOKEN
5. **Page Access Token** - SAVE THIS (This never expires as long as you don't revoke it!)

### 7. Get Your Page ID

**Easy method:**
1. Go to your Facebook Page
2. Click **"About"** in left sidebar
3. Scroll down to find **"Page ID"** or **"Page transparency"**
4. Copy the numeric ID

**Or from the API response in Step 6:**
- The `id` field in the `/me/accounts` response is your Page ID

---

## Add Credentials to Your App

Once you have all 4 values, add them to your environment variables:

### Local Development (.env.local)
```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_token_here
FACEBOOK_PAGE_ID=your_page_id_here
```

### Production (Vercel)
1. Go to: https://vercel.com/mrpoffice-collabs-projects/firefly-grove/settings/environment-variables
2. Add each variable:
   - `FACEBOOK_APP_ID`
   - `FACEBOOK_APP_SECRET`
   - `FACEBOOK_PAGE_ACCESS_TOKEN`
   - `FACEBOOK_PAGE_ID`

---

## Testing Your Credentials

Once credentials are added, you can test posting with this API call:

```bash
curl -X POST "https://graph.facebook.com/v19.0/YOUR_PAGE_ID/feed" \
  -d "message=Test post from Firefly Grove" \
  -d "access_token=YOUR_PAGE_ACCESS_TOKEN"
```

If it works, you'll see a response with a `post_id`!

---

## Troubleshooting

**Error: "(#200) The user hasn't authorized the application to perform this action"**
- Make sure you selected `pages_manage_posts` permission when generating token
- Regenerate your Page Access Token with correct permissions

**Error: "Invalid OAuth access token"**
- Your token expired or is incorrect
- Get a new Page Access Token (they don't expire unless revoked)

**Error: "Unsupported post request"**
- Check your Page ID is correct
- Make sure you're using PAGE Access Token, not USER Access Token

---

## When You're Ready

Once you have all 4 credentials added to `.env.local`, let me know and I'll:
1. Implement the Facebook posting API
2. Add a "Post to Facebook" button in drafts
3. Test the integration
