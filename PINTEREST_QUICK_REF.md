# 📌 Pinterest Setup - Quick Reference

## Current Status: ⚠️ Access Token Expired

---

## 🔑 Your App Credentials

```env
# Already in your .env.local:
PINTEREST_APP_ID=1535302
PINTEREST_APP_SECRET=7460aefcda76b2212f2a297b73c0653827742188

# EXPIRED - Need to replace:
PINTEREST_ACCESS_TOKEN=pina_[YOUR_TOKEN_HERE]

# MISSING - Get after token refresh:
PINTEREST_BOARD_ID=<get_from_script>
```

---

## ⚡ Fastest Way to Get Token

### Method 1: Developer Console (2 minutes)
1. Go to: https://developers.pinterest.com/apps/1535302/
2. Find "Generate Access Token" or "OAuth" section
3. Click generate, copy token
4. Update `.env.local`
5. Run: `npx tsx scripts/get-pinterest-board-id.ts`

### Method 2: OAuth URL (5 minutes)
1. Open in browser:
```
https://www.pinterest.com/oauth/?client_id=1535302&redirect_uri=https://localhost:3000/auth/pinterest/callback&response_type=code&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read
```

2. Click "Allow" → Copy the `code` from redirect URL

3. Exchange code for token (PowerShell):
```powershell
$body = @{
    grant_type = "authorization_code"
    client_id = "1535302"
    client_secret = "7460aefcda76b2212f2a297b73c0653827742188"
    code = "PASTE_CODE_HERE"
    redirect_uri = "https://localhost:3000/auth/pinterest/callback"
}
Invoke-RestMethod -Uri "https://api.pinterest.com/v5/oauth/token" -Method Post -Body $body
```

4. Copy `access_token` from response

---

## 📋 Complete Setup Checklist

### Phase 1: Get Credentials ⚠️ **START HERE**
- [ ] Visit https://developers.pinterest.com/apps/1535302/
- [ ] Generate new access token
- [ ] Copy token starting with `pina_`
- [ ] Update `.env.local` with new token
- [ ] Run: `npx tsx scripts/get-pinterest-board-id.ts`
- [ ] Copy board ID from output
- [ ] Add `PINTEREST_BOARD_ID=<id>` to `.env.local`

### Phase 2: Add Screenshots
- [ ] Take 5-10 screenshots of key features
- [ ] Save to `public/marketing/screenshots/features/`
- [ ] Open `public/marketing/screenshots/metadata.json`
- [ ] Add entry for each screenshot with tags
- [ ] Deploy images (push to GitHub/Vercel)

### Phase 3: Test System
- [ ] Run: `curl http://localhost:3000/api/marketing/posts/assign-images`
- [ ] Create a test marketing post
- [ ] Verify image was assigned
- [ ] Schedule post for Pinterest
- [ ] Check pin appears with image on Pinterest

### Phase 4: Production
- [ ] Add env vars to Vercel:
  - `PINTEREST_ACCESS_TOKEN`
  - `PINTEREST_BOARD_ID`
- [ ] Deploy: `vercel --prod`
- [ ] Set up cron job for auto-publishing
- [ ] Monitor Pinterest analytics

---

## 🚦 System Files Reference

| File | Purpose |
|------|---------|
| `scripts/get-pinterest-board-id.ts` | Get board ID from API |
| `lib/marketing/imageSelector.ts` | Smart image matching |
| `lib/marketing/platforms/pinterest.ts` | Pinterest API wrapper |
| `app/api/marketing/posts/assign-images/route.ts` | Bulk image assignment |
| `app/api/cron/publish-scheduled/route.ts` | Auto-publish posts |
| `public/marketing/screenshots/metadata.json` | Image database |
| `public/marketing/screenshots/README.md` | Screenshot guide |

---

## 🧪 Testing Commands

### Test Pinterest Connection
```bash
npx tsx scripts/get-pinterest-board-id.ts
```

### Check Posts Needing Images
```bash
curl http://localhost:3000/api/marketing/posts/assign-images
```

### Assign Images to All Posts
```bash
curl -X POST http://localhost:3000/api/marketing/posts/assign-images \
  -H "Cookie: your-session-cookie"
```

### Test Image Selection (Node)
```typescript
import { getBestImageForPost } from '@/lib/marketing/imageSelector'

const img = getBestImageForPost({
  keywords: ['family', 'memories'],
  topic: 'digital legacy',
  platform: 'pinterest',
  title: 'Test',
  content: 'Test'
})
console.log('Selected:', img)
```

---

## 🎯 Pinterest Image Best Practices

### Optimal Specs
- **Size**: 1000x1500px (2:3 ratio)
- **Format**: PNG or JPG
- **Quality**: High resolution
- **Text**: Large, readable fonts
- **Branding**: Subtle logo

### What to Screenshot
1. **Dashboard** - Show memory organization
2. **Upload Flow** - How easy it is to add memories
3. **Branch View** - Family tree structure
4. **Mobile App** - Mobile experience
5. **Before/After** - Transformation stories
6. **Success Stories** - With permission
7. **Features** - Heir management, backup, etc.

### Metadata Tips
```json
{
  "tags": ["specific", "keywords", "from", "content", "briefs"],
  "topics": ["digital legacy", "family memories"],
  "platform": ["pinterest"],
  "pinterestOptimized": true  // Gets +20 bonus points!
}
```

---

## 🆘 Troubleshooting

### Script returns "Authentication failed"
→ Access token expired or invalid
→ **Solution**: Get fresh token (see Phase 1 above)

### "No boards found"
→ Your Pinterest account has no boards
→ **Solution**: Create board at pinterest.com first

### Images not being selected
→ No matches in repository or tags don't align
→ **Solution**: Add more descriptive tags matching your keywords

### Pins posting without images
→ `PINTEREST_BOARD_ID` not set, or image URLs invalid
→ **Solution**: Complete Phase 1, ensure URLs are publicly accessible

---

## 📞 Quick Links

- **Pinterest Developer Console**: https://developers.pinterest.com/apps/1535302/
- **Your Pinterest Profile**: https://pinterest.com/
- **API Documentation**: https://developers.pinterest.com/docs/api/v5/
- **OAuth Guide**: https://developers.pinterest.com/docs/getting-started/authentication/

---

## 💡 Current Blockers

1. **🔴 CRITICAL**: Access token expired
   - **Fix**: Get new token (5 min)
   - **Impact**: Nothing works until fixed

2. **🟡 MEDIUM**: No board ID set
   - **Fix**: Run script after token refresh (30 sec)
   - **Impact**: Posts won't publish to Pinterest

3. **🟢 LOW**: No real screenshots yet
   - **Fix**: Take screenshots, update metadata (30 min)
   - **Impact**: Posts will use Unsplash fallback

**Priority**: Fix #1 first, then #2, then #3

---

## ✅ Success Criteria

You'll know it's working when:
- ✅ Script shows your boards (not "Authentication failed")
- ✅ `.env.local` has both token AND board ID
- ✅ Test post assigns an image automatically
- ✅ Scheduled Pinterest post publishes with image
- ✅ Pin appears on your Pinterest board

---

**Status**: System fully built, waiting for fresh token to activate 🚀

**Time to complete**: ~10 minutes (5 min token + 5 min testing)
