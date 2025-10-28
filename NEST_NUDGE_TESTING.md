# Nest Nudge Testing Guide

## Overview
The Nest Nudge feature reminds users to "hatch" photos from their nest that have been waiting for more than 10 days. The nudge appears on the Grove page and respects user attention with an 8-hour cooldown.

## Testing Instructions

### 1. Basic Functionality Test

**Setup:**
1. Open your browser's Developer Console (F12)
2. Navigate to `/nest` and upload some test photos
3. Navigate to `/grove` to trigger the nudge check

**Expected Console Output:**
```
[NestNudge] First time checking nest for this user
[NestNudge] Found X nest items
[NestNudge] Checking for items older than [DATE]
[NestNudge] Found Y items older than 10 days
[NestNudge] Oldest item is Z days old
[NestNudge] Showing nudge for Y old items
[NestNudge] Timestamp saved to localStorage
```

**Visual Check:**
- Popup should appear with firefly animation
- Shows correct count of old photos
- Shows correct age in days for oldest photo
- "Go to Nest" button navigates to `/nest`
- "Later" button dismisses the popup

---

### 2. Test the 8-Hour Cooldown

**After seeing the nudge once:**

**Test A: Immediate Reload (should NOT show)**
1. Refresh the `/grove` page immediately
2. Console should show:
   ```
   [NestNudge] Last shown 0.0 hours ago
   [NestNudge] Too soon to show again, skipping
   ```
3. Nudge should NOT appear

**Test B: Simulate 8 Hours Later (should show)**
1. Open Developer Console
2. Run this command to clear the cooldown:
   ```javascript
   localStorage.removeItem('nest-nudge-YOUR_USER_ID')
   ```
3. Refresh the page
4. Nudge should appear again

---

### 3. Test Without Old Photos

**Setup:**
1. Clear your nest OR ensure all photos are less than 10 days old
2. Navigate to `/grove`

**Expected Console Output:**
```
[NestNudge] Found X nest items
[NestNudge] Checking for items older than [DATE]
[NestNudge] Found 0 items older than 10 days
[NestNudge] No items older than 10 days, not showing nudge
```

**Visual Check:**
- No popup should appear

---

### 4. Test Database Manipulation (Advanced)

**To test with actually old photos:**

Option A: **Manual SQL Update** (if you have database access)
```sql
UPDATE "NestItem"
SET "uploadedAt" = NOW() - INTERVAL '15 days'
WHERE "userId" = 'YOUR_USER_ID'
LIMIT 3;
```

Option B: **Prisma Studio**
```bash
npx prisma studio
```
1. Find a NestItem record
2. Edit `uploadedAt` to be 15 days ago (e.g., `2025-10-13` if today is `2025-10-28`)
3. Save the change
4. Clear localStorage cooldown
5. Navigate to `/grove`

---

### 5. Edge Cases to Verify

**Test Case: Empty Nest**
- No nest items at all
- Console: `[NestNudge] No nest items found`
- Visual: No popup

**Test Case: No Session/No User ID**
- Console: `[NestNudge] No userId provided, skipping check`
- Visual: No popup

**Test Case: API Error**
- Simulate by stopping your dev server temporarily
- Console: `[NestNudge] Failed to fetch nest items: [ERROR]`
- Visual: No popup (graceful failure)

---

## Frequency Testing

The nudge will show:
- ✅ First time you visit Grove with old photos
- ✅ 8+ hours after last shown
- ✅ After clearing localStorage (testing only)

The nudge will NOT show:
- ❌ Within 8 hours of last shown
- ❌ If no nest items exist
- ❌ If all nest items are less than 10 days old
- ❌ If session/userId is missing

**Maximum frequency:** 3 times per 24 hours (every 8 hours)

---

## localStorage Inspection

Check the stored timestamp:
1. Open Developer Console
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Find "Local Storage" → Your domain
4. Look for key: `nest-nudge-[YOUR_USER_ID]`
5. Value is a Unix timestamp (milliseconds since epoch)

**To manually test cooldown:**
```javascript
// Check when last shown
const lastShown = localStorage.getItem('nest-nudge-YOUR_USER_ID')
const date = new Date(parseInt(lastShown))
console.log('Last shown:', date.toLocaleString())

// Calculate hours ago
const hoursAgo = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60)
console.log('Hours ago:', hoursAgo.toFixed(1))

// Clear cooldown (for testing)
localStorage.removeItem('nest-nudge-YOUR_USER_ID')
```

---

## Known Behaviors

1. **Nudge only appears on Grove page**
   - Design decision: Grove is the main hub where users plan their work
   - Does not appear on Nest page (users already there)

2. **Session-based means browser session**
   - If user closes browser and reopens: cooldown persists (localStorage)
   - If user opens in different browser: new cooldown (separate localStorage)
   - If user clears browser data: cooldown resets

3. **Popup is dismissible**
   - Clicking "Later" dismisses without navigating
   - Cooldown still applies (won't show again for 8 hours)

4. **Console logs are intentional**
   - Prefixed with `[NestNudge]` for easy filtering
   - Can be removed in production if desired
   - Useful for debugging and verifying logic

---

## Success Criteria

✅ **Feature works correctly if:**
1. Nudge appears when conditions are met (10+ day old photos)
2. Nudge does NOT appear within 8 hours of last showing
3. Nudge does NOT appear when no old photos exist
4. Console logs show correct logic flow
5. "Go to Nest" button navigates correctly
6. "Later" button dismisses the popup
7. No JavaScript errors in console

---

## Quick Test Checklist

- [ ] Upload test photos to nest
- [ ] Navigate to grove - nudge appears
- [ ] Click "Later" - popup dismisses
- [ ] Refresh page immediately - nudge does NOT appear
- [ ] Check console logs - correct timestamps
- [ ] Check localStorage - timestamp saved
- [ ] Clear localStorage cooldown
- [ ] Refresh page - nudge appears again
- [ ] Click "Go to Nest" - navigates to `/nest`
- [ ] No errors in console

---

## Troubleshooting

**Nudge not appearing?**
1. Check console for `[NestNudge]` logs
2. Verify you have nest items older than 10 days
3. Clear localStorage cooldown
4. Ensure you're on the `/grove` page
5. Check that session.user.id exists

**Nudge appearing too often?**
1. Check localStorage timestamp
2. Verify 8-hour cooldown is working
3. Clear browser cache if stuck

**Wrong photo count?**
1. Check API response in Network tab (`/api/nest`)
2. Verify date calculation logic in console logs
3. Ensure database has correct `uploadedAt` values
