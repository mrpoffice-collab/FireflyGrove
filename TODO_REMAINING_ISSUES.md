# Remaining Issues - Session 2025-01-12

## 🔴 High Priority

### Firefly Burst Images Not Rendering Properly on iPhone
**Status:** Partially fixed, but still not working on mobile

**Root Cause:**
- 20 out of 29 images are base64 data URLs (up to 2.4MB each)
- These were from early nest uploads before blob storage was configured
- Base64 images are slow/problematic on mobile Safari

**What Was Done:**
✅ Added base64 image support to FireflyBurst component
✅ Created diagnostic scripts to identify the issue
✅ Created migration script to convert base64 to Vercel Blob URLs
✅ Improved error handling and logging

**What Still Needs to Be Done:**
- [ ] Run migration script from production: `npx tsx scripts/migrate-base64-to-blob.ts`
- [ ] Test on iPhone after migration completes
- [ ] Verify all images load properly in bursts
- [ ] Consider preventing base64 uploads in the future

**Testing:**
- Visit `/test-images` on production to see which images load
- Check browser console for image loading errors
- Try viewing a burst and note which images fail

---

## 🟡 Medium Priority

### Cache Issues on Mobile Safari
**Issue:** Changes not appearing on iPhone even after deployment

**Workarounds:**
1. Settings > Safari > Clear History and Website Data
2. Request Desktop Website in Safari
3. Force close Safari app completely

**Potential Solutions:**
- [ ] Add cache-busting query parameters
- [ ] Investigate service worker caching
- [ ] Add more aggressive cache headers for static assets

---

## 🟢 Low Priority / Completed

✅ Knowledge Bank mobile responsiveness - DONE
✅ Glow Guides mobile responsiveness - DONE
✅ Firefly Burst popup priority (wait for modals) - DONE
✅ Audio auto-play improvements - DONE
✅ Dynamic burst timing - DONE
✅ Treasure PDF download error handling - DONE

---

## 📝 Notes

- Deployment is live and pushed to GitHub
- All code changes are committed
- Migration script is ready but needs production environment
- Base64 images will technically "work" but are slow on mobile

---

## 🔧 Quick Commands

```bash
# Check what images need migration
npx tsx scripts/check-base64-images.ts

# Run migration (needs BLOB_READ_WRITE_TOKEN in env)
npx tsx scripts/migrate-base64-to-blob.ts

# Test images page
# Visit: [your-url]/test-images
```

---

## 💡 For Next Session

1. Start by running the migration script on production
2. Test burst images on iPhone after migration
3. If still issues, check browser console for specific errors
4. May need to investigate mobile Safari's image size limits
