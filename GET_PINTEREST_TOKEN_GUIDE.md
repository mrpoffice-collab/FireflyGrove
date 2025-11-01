# 🔑 How to Get a Fresh Pinterest Access Token

Your Pinterest access token has expired. Follow this step-by-step guide to get a new one.

---

## 📋 What You Need

- Pinterest Developer Account (you already have this)
- App ID: `1535302` (already in your .env)
- App Secret: `7460aefcda76b2212f2a297b73c0653827742188` (already in your .env)

---

## 🚀 Step-by-Step Instructions

### Option 1: Using Pinterest Developer Console (Easiest)

1. **Go to Pinterest Developers**
   - Visit: https://developers.pinterest.com/apps/
   - Log in with your Pinterest account

2. **Select Your App**
   - You should see your app (ID: 1535302)
   - Click on it to open settings

3. **Navigate to Token Generation**
   - Look for "Generate Access Token" or "Access Token" section
   - This is usually under OAuth or Authentication settings

4. **Select Required Scopes**
   You need these permissions:
   - `boards:read` - Read board information
   - `boards:write` - Create and update boards
   - `pins:read` - Read pins
   - `pins:write` - Create and update pins
   - `user_accounts:read` - Read user account info

5. **Generate Token**
   - Click "Generate Token" button
   - Copy the token immediately (it's shown only once!)
   - It will look like: `pina_XXXXXXXXXXXXXXXXXXXXX...`

6. **Update Your .env.local**
   ```env
   PINTEREST_ACCESS_TOKEN=pina_YOUR_NEW_TOKEN_HERE
   ```

---

### Option 2: Using OAuth Flow (More Complex)

If the developer console doesn't have a direct "Generate Token" button, use OAuth:

#### Step 1: Get Authorization Code

Visit this URL in your browser (replace with your redirect URI):

```
https://www.pinterest.com/oauth/?
  client_id=1535302
  &redirect_uri=https://localhost:3000/auth/pinterest/callback
  &response_type=code
  &scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read
```

**Formatted URL:**
```
https://www.pinterest.com/oauth/?client_id=1535302&redirect_uri=https://localhost:3000/auth/pinterest/callback&response_type=code&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read
```

This will:
1. Ask you to authorize the app
2. Redirect to your callback URL with a `code` parameter
3. Copy the `code` from the URL

#### Step 2: Exchange Code for Token

Run this command (replace `YOUR_CODE` with the code from step 1):

```bash
curl -X POST https://api.pinterest.com/v5/oauth/token \
  -d "grant_type=authorization_code" \
  -d "client_id=1535302" \
  -d "client_secret=7460aefcda76b2212f2a297b73c0653827742188" \
  -d "code=YOUR_CODE" \
  -d "redirect_uri=https://localhost:3000/auth/pinterest/callback"
```

**Windows PowerShell version:**
```powershell
$body = @{
    grant_type = "authorization_code"
    client_id = "1535302"
    client_secret = "7460aefcda76b2212f2a297b73c0653827742188"
    code = "YOUR_CODE"
    redirect_uri = "https://localhost:3000/auth/pinterest/callback"
}

Invoke-RestMethod -Uri "https://api.pinterest.com/v5/oauth/token" -Method Post -Body $body
```

This will return JSON with your access token:
```json
{
  "access_token": "pina_XXXXXXXXXXXXX",
  "token_type": "bearer",
  "expires_in": 31536000,
  "refresh_token": "rt_XXXXXXXXXXXX",
  "scope": "boards:read,boards:write,pins:read,pins:write"
}
```

Copy the `access_token` value.

---

### Option 3: Using Postman (Visual Tool)

If you prefer a GUI:

1. **Download Postman** (if you don't have it)
   - https://www.postman.com/downloads/

2. **Create New Request**
   - Method: `GET`
   - URL: Follow Option 2 Step 1 URL in browser first to get code

3. **Exchange Code for Token**
   - Method: `POST`
   - URL: `https://api.pinterest.com/v5/oauth/token`
   - Body type: `x-www-form-urlencoded`
   - Add these key-value pairs:
     - `grant_type`: `authorization_code`
     - `client_id`: `1535302`
     - `client_secret`: `7460aefcda76b2212f2a297b73c0653827742188`
     - `code`: `YOUR_CODE_FROM_BROWSER`
     - `redirect_uri`: `https://localhost:3000/auth/pinterest/callback`

4. **Send Request**
   - Click "Send"
   - Copy the `access_token` from response

---

## ✅ After Getting Your Token

### 1. Update .env.local

Open `.env.local` and update:
```env
PINTEREST_ACCESS_TOKEN=pina_YOUR_NEW_TOKEN_HERE
```

### 2. Get Your Board ID

Run the script:
```bash
npx tsx scripts/get-pinterest-board-id.ts
```

**Expected Output:**
```
🔍 Fetching your Pinterest boards...

✅ Found 3 board(s):

1. Firefly Grove Marketing
   ID: 1234567890123456789
   Privacy: PUBLIC
   Pins: 5
   Created: 1/1/2025

2. Family Memories
   ID: 9876543210987654321
   Privacy: PUBLIC
   Pins: 12
   Created: 12/15/2024

💡 Recommended board: "Firefly Grove Marketing" (1234567890123456789)

PINTEREST_BOARD_ID=1234567890123456789
```

### 3. Add Board ID to .env.local

Copy the board ID from the output and add to `.env.local`:
```env
PINTEREST_BOARD_ID=1234567890123456789
```

### 4. Test the Connection

Create a simple test file `test-pinterest.ts`:

```typescript
import { pinterest } from './lib/pinterest'

async function test() {
  try {
    console.log('Testing Pinterest connection...')
    const boards = await pinterest.getBoards()
    console.log('✅ Success! Found', boards.length, 'boards')
    console.log(boards)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

test()
```

Run it:
```bash
npx tsx test-pinterest.ts
```

If it works, you'll see your boards! 🎉

---

## 🐛 Common Issues

### Issue: "redirect_uri_mismatch"

**Solution:** Make sure your redirect URI in Pinterest app settings matches exactly:
- Go to https://developers.pinterest.com/apps/1535302/
- Under "Redirect URIs", add: `https://localhost:3000/auth/pinterest/callback`
- Must match exactly (including https, port, path)

### Issue: "invalid_scope"

**Solution:** You might not have the right scopes enabled in your app:
- Go to app settings
- Under "Scopes" or "Permissions", enable:
  - `boards:read`
  - `boards:write`
  - `pins:read`
  - `pins:write`
  - `user_accounts:read`

### Issue: "access_denied"

**Solution:** You declined the authorization. Try again and click "Allow"

### Issue: Token expires quickly

**Solution:** Pinterest access tokens typically last 1 year, but:
- Save the `refresh_token` from OAuth response
- Use it to get new tokens without re-authorizing
- Consider implementing token refresh in your app

---

## 💡 Pro Tips

1. **Save Your Refresh Token**
   - When you get the access token, you also get a refresh token
   - Store it securely in `.env.local`:
     ```env
     PINTEREST_REFRESH_TOKEN=rt_XXXXXXXXXXXX
     ```
   - Use it to get new access tokens automatically

2. **Create a Dedicated Marketing Board**
   - Create a new Pinterest board specifically for Firefly Grove marketing
   - Name it "Firefly Grove Marketing" or similar
   - Set it to PUBLIC for maximum reach
   - Use this board ID in your .env

3. **Test with a Simple Pin First**
   - Don't wait for automated posts
   - Manually create one pin to verify everything works
   - Use the `/api/pinterest/pin` endpoint or admin UI

---

## 📞 Need Help?

### Pinterest Support
- Developer Docs: https://developers.pinterest.com/docs/
- Support: https://help.pinterest.com/en/business/contact-us

### Can't Generate Token?
If you're stuck, I can help you:
1. Create a manual test endpoint to authorize
2. Set up automatic token refresh
3. Use alternative Pinterest posting methods

---

## ✅ Success Checklist

Once you complete this:

- [ ] Fresh access token in `.env.local`
- [ ] Board ID in `.env.local`
- [ ] Script runs successfully
- [ ] Test pin created
- [ ] Ready to add screenshots and automate!

---

**Next Steps After Token Setup:**
1. Take screenshots of your site
2. Add them to `public/marketing/screenshots/`
3. Update `metadata.json`
4. Run `POST /api/marketing/posts/assign-images`
5. Schedule your first automated Pinterest post!

Good luck! Let me know when you have the token and I can help test the setup. 🚀
