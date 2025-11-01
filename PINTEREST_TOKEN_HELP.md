# 🔑 How to Get Your Pinterest Board ID - Simple Guide

Your current token appears to be expired. Here are **3 easy ways** to get a new token and board ID:

---

## ⚡ Method 1: Use Pinterest's Token Generator (EASIEST - 2 minutes)

### Step 1: Go to Pinterest Developers
1. Open your browser and go to: https://developers.pinterest.com/
2. Click "My Apps" at the top
3. You should see your app (ID: 1535302)

### Step 2: Generate Access Token
1. Click on your app
2. Look for "Generate access token" or "OAuth" section
3. Select these scopes (if asked):
   - ✅ `boards:read`
   - ✅ `boards:write`
   - ✅ `pins:read`
   - ✅ `pins:write`
   - ✅ `user_accounts:read`
4. Click "Generate Token"
5. **Copy the token immediately** (starts with `pina_`)

### Step 3: Update Your .env.local
Open `.env.local` in a text editor and replace the old token:

```env
PINTEREST_ACCESS_TOKEN=pina_YOUR_NEW_TOKEN_HERE
```

Save the file.

### Step 4: Get Board ID
Run this in your terminal (I'll run it for you):
```bash
npx tsx scripts/get-pinterest-board-id.ts
```

Or use Method 2 or 3 below if you prefer manual steps.

---

## 🌐 Method 2: Use Browser Developer Console (5 minutes)

### Step 1: Get Your Access Token First
Follow Method 1 Step 1-3 above to get a fresh token.

### Step 2: Use Browser to Call API
1. Open your browser
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Paste this code (replace YOUR_TOKEN with your actual token):

```javascript
fetch('https://api.pinterest.com/v5/boards', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Your Boards:');
  data.items.forEach((board, i) => {
    console.log(`\n${i+1}. ${board.name}`);
    console.log(`   ID: ${board.id}`);
    console.log(`   Pins: ${board.pin_count}`);
  });
})
.catch(err => console.error('Error:', err));
```

4. Press Enter
5. You'll see your boards listed with their IDs
6. Copy the board ID you want to use

### Step 3: Add to .env.local
```env
PINTEREST_BOARD_ID=paste_board_id_here
```

---

## 📱 Method 3: Create a Test Board Manually (Alternative)

If you don't have boards or want a dedicated marketing board:

### Step 1: Create a Board on Pinterest
1. Go to https://pinterest.com
2. Click the "+" button
3. Select "Create Board"
4. Name it "Firefly Grove Marketing" (or whatever you like)
5. Set it to "Public"
6. Click "Create"

### Step 2: Get the Board ID
After creating the board:
1. Get a fresh access token (Method 1 or 2 above)
2. Run the script or browser console method to see all your boards
3. Find your new board in the list
4. Copy its ID

---

## 🔍 What Does a Board ID Look Like?

Pinterest board IDs are long numeric strings:
```
1234567890123456789
```

It's about 18-19 digits long.

---

## ⚠️ Common Issues

### Issue: "Authentication failed"
**Cause:** Token is expired or invalid

**Fix:**
1. Generate a new token from Pinterest Developers
2. Make sure you copy the FULL token (they're long!)
3. Update `.env.local` with the new token
4. Don't add quotes or spaces around the token

### Issue: "No boards found"
**Cause:** Your Pinterest account doesn't have any boards yet

**Fix:**
1. Go to pinterest.com
2. Create at least one board
3. Run the script again

### Issue: Script not running
**Cause:** Missing dependencies

**Fix:**
```bash
npm install tsx
```

Then try again:
```bash
npx tsx scripts/get-pinterest-board-id.ts
```

---

## 🎯 After You Get the Board ID

Once you have your board ID, add it to `.env.local`:

```env
# Pinterest Configuration
PINTEREST_APP_ID=1535302
PINTEREST_APP_SECRET=7460aefcda76b2212f2a297b73c0653827742188
PINTEREST_ACCESS_TOKEN=pina_YOUR_NEW_TOKEN
PINTEREST_BOARD_ID=1234567890123456789
```

**Important:** Also add these to Vercel environment variables for production!

---

## 🚀 Quick Test After Setup

To test if everything works, I can create a quick test script. Just let me know when you have:
1. ✅ Fresh access token in `.env.local`
2. ✅ Board ID in `.env.local`

Then we can test posting a pin!

---

## 💡 Alternative: Skip the Script

If you're having trouble with the script, you can also:

### Use Postman (Free App)
1. Download Postman: https://www.postman.com/downloads/
2. Create a new GET request
3. URL: `https://api.pinterest.com/v5/boards`
4. Add Header: `Authorization: Bearer YOUR_TOKEN`
5. Click Send
6. You'll see all your boards with IDs in the response

### Use cURL (Command Line)
If you have Git Bash or WSL:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.pinterest.com/v5/boards
```

This will print your boards with IDs.

---

## 📞 Need Help?

If you're still stuck, just tell me:
1. Did you get a new access token? (Yes/No)
2. Where did you get stuck? (Generating token, running script, etc.)
3. Any error messages you see?

I can help troubleshoot or find an alternative method!

---

**The key thing:** You need a **fresh access token** from Pinterest Developers. The one in your `.env.local` file has expired (that's why it says "Authentication failed").

Let me know if you'd like me to:
- Walk you through the Pinterest Developer Console
- Create a different method to get the board ID
- Test the connection once you have a new token
