# Deployment Check

Last deployment: 2025-01-12
Commits pushed: 09f1b89

## Recent Changes:
1. ✅ Knowledge Bank mobile responsiveness
2. ✅ Firefly Burst improvements (popup priority, audio, dynamic timing)
3. ✅ Base64 image support
4. ✅ Test page added at /test-images

## To verify deployment on iPhone:

### Option 1: Hard refresh in Safari
1. Open Safari on iPhone
2. Go to your Firefly Grove URL
3. Tap the "AA" icon in address bar
4. Select "Request Desktop Website"
5. Refresh the page
6. Switch back to mobile view

### Option 2: Clear Safari cache
1. Settings app > Safari
2. Tap "Clear History and Website Data"
3. Re-open Safari and visit site

### Option 3: Check deployment status
Visit: https://vercel.com/[your-team]/firefly-grove/deployments

Look for commit "09f1b89" to confirm it deployed

### Option 4: Test page
Once deployed, visit: [your-url]/test-images
This will show if images are loading properly

## Known Issue:
20 of 29 images are base64 data URLs (from early nest uploads)
- These will load but may be slow (up to 2.4MB each)
- Run migration script to fix: `npx tsx scripts/migrate-base64-to-blob.ts`
