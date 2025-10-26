# Card Sentiments - Current Status & Debug Guide

## 📋 Summary

**Goal:** Display poetic sentiment options when creating greeting cards in production.

**Current Status:**
- ✅ CSV file created with sentiments
- ✅ CSV updated with correct matching tags
- ✅ API endpoint created to read from CSV
- ✅ UI simplified to show all options upfront
- ✅ All code deployed to production
- ❌ **Sentiments NOT showing in production yet**

---

## 🔍 What We Built

### 1. CSV File: `config/card-sentiments.csv`
Contains poetic messages organized by category:
- **"In the Quiet of Loss"** (Sympathy) - 3 messages
- **"Another Year of Light"** (Birthday) - 3 messages
- **"Under the Same Sky"** (Thinking of You) - 3 messages
- **"Gratitude in Bloom"** (Thank You) - 3 messages
- **"Season of Warmth"** (Christmas/Holiday) - 3 messages
- **"Stepping Into the Light"** (Graduation) - 3 messages
- **"Love, Still Growing"** (Anniversary) - 3 messages
- **"New Light in the Grove"** (New Baby) - 3 messages
- Plus more categories...

**Total:** 47 sentiment options across multiple categories

### 2. API Endpoint: `/api/cards/sentiments`
- **File:** `app/api/cards/sentiments/route.ts`
- **What it does:**
  - Takes `categoryId` parameter
  - Reads CSV file
  - Filters sentiments by matching database category name with CSV tags
  - Returns matching sentiments

### 3. UI Component: `components/SentimentPicker.tsx`
- **What it does:**
  - Fetches sentiments when category is selected
  - Shows ALL sentiment options immediately (no expand/collapse)
  - Auto-selects first option
  - Highlights selected option with glowing border
  - Shows "Coming soon" if 0 sentiments found

---

## ❓ Why Sentiments Might Not Be Showing

### Issue 1: Database Categories Don't Match CSV Tags

**Database Categories:**
```
1. Sympathy & Condolence
2. Birthday
3. Christmas & Holiday
4. Thank You
5. Thinking of You
6. Anniversary
7. New Baby
8. Graduation
```

**CSV Tags Must Include These Keywords:**
- "Sympathy & Condolence" → CSV needs `sympathy` or `condolence` in Tags
- "Thinking of You" → CSV needs `thinking` in Tags
- "Thank You" → CSV needs `thank-you` in Tags
- etc.

**Current CSV Tags (after our fix):**
✅ "In the Quiet of Loss" has `sympathy,condolence` → should match
✅ "Another Year of Light" has `birthday` → should match
✅ "Under the Same Sky" has `thinking` → should match

### Issue 2: API Not Being Called
Check browser console (F12) when selecting a category:
```
Should see: GET /api/cards/sentiments?categoryId=xxx
Should return: { sentiments: [...] }
```

### Issue 3: Authentication Issue
The API requires authentication. If not logged in, it returns 401.

---

## 🐛 How to Debug

### Step 1: Check Production Deployment
1. Go to Vercel dashboard
2. Verify latest deployment succeeded
3. Check deployment logs for errors

### Step 2: Test in Production
1. Log in to your production site
2. Go to `/cards/create`
3. Select "Sympathy & Condolence" category
4. Open browser console (F12)
5. Look for API call: `GET /api/cards/sentiments?categoryId=...`

### Step 3: Check API Response
Look at the Network tab response:

**Expected (Success):**
```json
{
  "sentiments": [
    {
      "id": "csv-category-id-0",
      "coverMessage": "Some people aren't just part of our story...",
      "insideMessage": "In quiet moments, their memory glows...",
      "tags": "sympathy,condolence,poetic,firefly,memorial"
    },
    ...
  ]
}
```

**If Empty:**
```json
{
  "sentiments": []
}
```
→ This means matching failed

**If Error:**
```json
{
  "error": "Unauthorized"
}
```
→ Authentication issue

```json
{
  "error": "Category not found"
}
```
→ Category doesn't exist in database

---

## ✅ Quick Verification Checklist

Run these in production to verify:

### 1. Check if CSV file exists
```bash
ls -la config/card-sentiments.csv
```
Should show file with size ~9981 bytes

### 2. Check if first sentiment has correct tags
```bash
head -6 config/card-sentiments.csv
```
Should show: `"sympathy,condolence,poetic,firefly,memorial"` in Tags column

### 3. Check if categories exist in database
Run this in production console or Prisma Studio:
```sql
SELECT id, name FROM "CardCategory" LIMIT 5;
```
Should return categories like "Sympathy & Condolence", "Birthday", etc.

### 4. Test API directly
```bash
curl -H "Cookie: YOUR_SESSION_COOKIE" \
  "https://your-domain.vercel.app/api/cards/sentiments?categoryId=CATEGORY_ID"
```
Should return JSON with sentiments array

---

## 🔧 Common Fixes

### Fix 1: Categories Not Seeded
If categories don't exist in database:
```bash
npx ts-node scripts/seed-card-categories.ts
```

### Fix 2: CSV Tags Don't Match
Edit `config/card-sentiments.csv` and ensure Tags column includes database category keywords.

Example:
```csv
Category,Front,Inside,Tags
"In the Quiet of Loss","Message...","Message...","sympathy,condolence,poetic"
```
The `sympathy,condolence` keywords are critical!

### Fix 3: Clear Cache and Redeploy
```bash
rm -rf .next
git add .
git commit -m "Force rebuild"
git push
```

---

## 📝 Next Steps

1. **Verify deployment completed** - Check Vercel dashboard
2. **Test in production** - Go to /cards/create and select "Sympathy & Condolence"
3. **Check browser console** - Look for API calls and errors
4. **Share what you see** - Tell me:
   - Does the "Firefly Grove Message" section appear?
   - What does browser console show?
   - What does the API response contain?

---

## 🎯 Expected End Result

When you select "Sympathy & Condolence" category, you should see:

```
Firefly Grove Message                                    3 options
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose the poetic message that will appear on your card

┌─────────────────────────────────────────────────────┐
│ FRONT                                               │
│ Some people aren't just part of our story —        │
│ they are the light we see it by.                   │
│                                                     │
│ INSIDE                                              │
│ In quiet moments, their memory glows softly...     │
│ ✓ Selected                                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ FRONT                                               │
│ The stars remember what we sometimes forget.        │
│                                                     │
│ INSIDE                                              │
│ That love doesn't end — it only changes form...    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ FRONT                                               │
│ They were proof that light can live on...          │
│                                                     │
│ INSIDE                                              │
│ Some losses leave us wordless...                   │
└─────────────────────────────────────────────────────┘
```

All 3 sympathy sentiments should be visible immediately, no clicking required.
