# 🔒 Blob Monitoring System - Migration Checklist

## ✅ Completed

### Core Infrastructure
- [x] Created `lib/blob-monitoring.ts` - Core monitoring utilities
- [x] Created `lib/blob-upload-safe.ts` - Safe upload wrapper
- [x] Created `scripts/check-blob-health.ts` - Health check script
- [x] Created `app/api/admin/blob-health/route.ts` - Admin API
- [x] Created `BLOB_MONITORING_SYSTEM.md` - Documentation

### Protected Upload Routes
- [x] `/api/nest/upload` - ✅ Protected with safeBlobUpload
- [x] `/api/audio-sparks/upload` - ✅ Protected with safeBlobUpload
- [x] `/api/upload/audio` - ✅ Protected with safeBlobUpload
- [x] `/api/soundart/upload` - ✅ Protected with safeBlobUpload
- [x] `/api/soundart/save-to-branch` - ✅ Protected with safeBlobUpload
- [x] `/api/blog-video/upload-image` - ✅ Protected with safeBlobUpload
- [x] `/api/import/facebook` - ✅ Protected with safeBlobUpload

---

## ✅ ALL ROUTES MIGRATED!

**Migration completed on:** 2025-01-05

All blob upload routes now use `safeBlobUpload()` which:
- ✅ Uploads to Vercel Blob
- ✅ Immediately verifies accessibility
- ✅ Logs errors to database
- ✅ Prevents saving to DB if upload fails
- ✅ Returns clear error messages to users

**Verification Results:**
```bash
# No remaining unsafe put() calls
$ grep -r "await put(" app/api --include="*.ts"
(no results)

# No remaining @vercel/blob put imports
$ grep -r "import.*put.*from '@vercel/blob'" app/api
(no results)
```

---

## 📋 Migration Template

For each unsafe upload route, follow this pattern:

### Step 1: Add import
```typescript
import { safeBlobUpload } from '@/lib/blob-upload-safe'
```

### Step 2: Replace upload call
```typescript
// Before
const blob = await put(pathname, file, {
  access: 'public',
  addRandomSuffix: true,
})

// After
const uploadResult = await safeBlobUpload(
  pathname,
  file,
  {
    userId: session.user.id,
    type: 'image', // or 'video', 'audio'
    recordType: 'entry', // or 'nestItem', 'soundArt', etc.
    recordId: optionalId
  }
)
```

### Step 3: Add error handling
```typescript
if (!uploadResult.success || !uploadResult.verified) {
  console.error('🚨 Upload verification failed', {
    error: uploadResult.error,
    userId,
    filename
  })

  return NextResponse.json(
    {
      error: 'Upload verification failed. Please try again.',
      details: uploadResult.error
    },
    { status: 500 }
  )
}
```

### Step 4: Update database save
```typescript
// Before
await prisma.entry.create({
  data: {
    mediaUrl: blob.url
  }
})

// After
await prisma.entry.create({
  data: {
    mediaUrl: uploadResult.url!
  }
})
```

---

## 🧪 Testing Checklist

After migrating each route:

- [ ] Test successful upload
- [ ] Verify blob is accessible
- [ ] Check logs for verification messages
- [ ] Test error handling (simulate failed upload)
- [ ] Verify database record is correct
- [ ] Check audit log for errors

---

## 🔍 Finding All Upload Routes

Search for unsafe blob uploads:

```bash
# Find all files using @vercel/blob
npx grep -r "from '@vercel/blob'" app/api

# Find all put() calls
npx grep -r "await put\(" app/api

# Find potential unsafe uploads
npx grep -r "blob.url" app/api
```

---

## 📊 Verification Commands

### Test health check
```bash
npx tsx scripts/check-blob-health.ts --limit=10
```

### Check audit logs for blob errors
```typescript
const errors = await prisma.audit.findMany({
  where: { action: 'BLOB_ERROR' },
  orderBy: { createdAt: 'desc' },
  take: 10
})
```

### Verify specific blob
```bash
curl -I "https://[blob-url]"
# Should return 200 OK
```

---

## 🚨 Rollback Plan

If issues occur after migration:

1. **Revert the route file** to previous version
2. **Check for orphaned blobs** in Vercel Blob Storage
3. **Review audit logs** for specific errors
4. **Contact users** if data loss occurred
5. **Restore from backup** if needed

---

## 📈 Success Metrics

After full migration:

- ✅ 100% of uploads use `safeBlobUpload()`
- ✅ 0 direct `put()` calls in upload routes
- ✅ All uploads verified before DB save
- ✅ Health checks show 0 broken blobs
- ✅ Audit logs show blob operations

---

## 🎯 Next Steps

1. **Migrate remaining routes** (see TODO list above)
2. **Set up cron job** for daily health checks
3. **Create admin dashboard** UI for blob monitoring
4. **Set up alerts** for critical blob errors
5. **Document recovery procedures**

---

*Last updated: 2025-01-05*
