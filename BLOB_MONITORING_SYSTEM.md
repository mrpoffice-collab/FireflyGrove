# 🔒 Blob Storage Monitoring & Protection System

## Overview

Memorial images are **irreplaceable**. This system ensures no image is ever lost by providing:

- ✅ **Real-time verification** of every uploaded blob
- 🏥 **Health checks** to detect broken/missing blobs
- 📝 **Comprehensive logging** of all blob operations
- 🚨 **Automatic alerts** when issues are detected
- 🔄 **Retry mechanisms** for failed uploads
- 📊 **Admin dashboard** for monitoring

---

## 🚨 Critical Components

### 1. Safe Upload Wrapper (`lib/blob-upload-safe.ts`)

**ALWAYS use `safeBlobUpload()` instead of calling `put()` directly!**

```typescript
import { safeBlobUpload } from '@/lib/blob-upload-safe'

// Upload with automatic verification
const result = await safeBlobUpload(
  `nest/${userId}/${Date.now()}-${file.name}`,
  file,
  {
    userId,
    type: 'image',
    recordType: 'entry',
    recordId: entryId
  }
)

if (!result.success || !result.verified) {
  // Handle error - blob is NOT accessible
  console.error('Upload failed:', result.error)
  return
}

// Safe to save to database
await prisma.entry.update({
  where: { id: entryId },
  data: { mediaUrl: result.url }
})
```

**With automatic retry:**

```typescript
import { safeBlobUploadWithRetry } from '@/lib/blob-upload-safe'

// Retry up to 3 times if verification fails
const result = await safeBlobUploadWithRetry(
  pathname,
  file,
  context,
  { maxRetries: 3 }
)
```

### 2. Blob Monitoring (`lib/blob-monitoring.ts`)

Core functions:

```typescript
// Verify a single blob URL
const result = await verifyBlobUrl('https://...')
console.log(result.accessible) // true/false

// Verify immediately after upload (called automatically by safeBlobUpload)
const verification = await verifyBlobAfterUpload(url, context)

// Run comprehensive health check
const report = await runComprehensiveHealthCheck(limit)
console.log(`${report.broken} broken blobs found`)
```

### 3. Health Check Script (`scripts/check-blob-health.ts`)

Run manually or via cron job:

```bash
# Check 50 most recent blobs
npx tsx scripts/check-blob-health.ts

# Check 200 blobs
npx tsx scripts/check-blob-health.ts --limit=200

# Check ALL blobs (can take a while!)
npx tsx scripts/check-blob-health.ts --full
```

**Recommended: Run daily via cron or CI/CD**

```bash
# Example cron (runs daily at 2 AM)
0 2 * * * cd /path/to/firefly-grove && npx tsx scripts/check-blob-health.ts
```

### 4. Admin Dashboard API (`/api/admin/blob-health`)

```typescript
// GET /api/admin/blob-health?limit=50
// Run health check (returns report)

// POST /api/admin/blob-health/verify
// Verify a specific blob URL
{
  "url": "https://..."
}
```

---

## 📊 How It Works

### Upload Flow (PROTECTED)

1. User uploads file
2. `safeBlobUpload()` uploads to Vercel Blob
3. **IMMEDIATE VERIFICATION** via HEAD request
4. If accessible: ✅ Save to database
5. If NOT accessible: 🚨 Return error, prevent DB save

### Health Check Flow

1. Query database for blobs (Entry, NestItem, etc.)
2. Verify each blob URL via HEAD request
3. Log any inaccessible blobs
4. Alert admins if issues found
5. Save report to audit log

### Error Logging

All blob errors are logged to the `Audit` table:

```typescript
{
  action: 'BLOB_ERROR',
  targetType: 'BLOB',
  targetId: blobUrl,
  metadata: {
    error: 'HTTP 404: Not Found',
    severity: 'critical',
    context: { ... }
  }
}
```

---

## 🔧 Migration Guide

### Before

```typescript
import { put } from '@vercel/blob'

// ❌ UNSAFE - No verification!
const blob = await put(pathname, file, { access: 'public' })

await prisma.entry.create({
  data: {
    mediaUrl: blob.url  // Might not be accessible!
  }
})
```

### After

```typescript
import { safeBlobUpload } from '@/lib/blob-upload-safe'

// ✅ SAFE - Verified before DB save
const result = await safeBlobUpload(pathname, file, {
  userId,
  type: 'image',
  recordType: 'entry'
})

if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 500 })
}

await prisma.entry.create({
  data: {
    mediaUrl: result.url  // Guaranteed accessible!
  }
})
```

---

## 📋 Checklist: Protecting All Uploads

- [x] ✅ `/api/nest/upload` - Protected
- [ ] ⚠️  `/api/upload/audio` - **TODO: Add protection**
- [ ] ⚠️  `/api/audio-sparks/upload` - **TODO: Add protection**
- [ ] ⚠️  `/api/soundart/upload` - **TODO: Add protection**
- [ ] ⚠️  `/api/blog-video/upload-image` - **TODO: Add protection**

---

## 🚨 What To Do When Blobs Are Missing

### 1. Run Health Check

```bash
npx tsx scripts/check-blob-health.ts
```

### 2. Review Issues

Check the script output for:
- Entry IDs with broken blobs
- User IDs affected
- URLs that are inaccessible

### 3. Check Vercel Blob Storage

1. Go to Vercel Dashboard → Storage → Blob
2. Search for the blob URL
3. Check if it exists but is misconfigured

### 4. Check Audit Logs

```typescript
const blobErrors = await prisma.audit.findMany({
  where: {
    action: 'BLOB_ERROR',
    createdAt: { gte: new Date('2025-01-01') }
  },
  orderBy: { createdAt: 'desc' }
})
```

### 5. Recovery Options

**Option 1: User has duplicate**
- Check if user uploaded the same image elsewhere
- Copy blob URL to missing record

**Option 2: Backup exists**
- Check database backups for original URL
- Re-upload from backup if available

**Option 3: Contact user**
- Notify user of missing image
- Request re-upload

---

## 🔐 Security Notes

- All blob URLs are verified via HEAD requests (no download)
- Admin-only access to health check API
- All errors logged with user context (for recovery)
- No sensitive data in error messages

---

## 📈 Monitoring & Alerts

### Metrics to Track

1. **Upload success rate** - Should be >99%
2. **Verification failures** - Should be near 0
3. **Broken blobs found** - Should be 0
4. **Health check runtime** - Monitor for performance

### Alert Triggers

🚨 **CRITICAL** (immediate action):
- Any blob upload verification fails
- Health check finds >5 broken blobs
- Memorial image (Entry with legacy flag) is missing

⚠️  **WARNING** (review soon):
- Health check finds 1-5 broken blobs
- Upload verification takes >10 seconds
- Nest item blob is inaccessible

---

## 🛠️ Future Enhancements

- [ ] Automatic blob backup to secondary storage
- [ ] Real-time monitoring dashboard
- [ ] Email/Slack alerts for critical issues
- [ ] Automatic retry of failed uploads
- [ ] Blob recovery from backups
- [ ] Content hash verification (detect corruption)
- [ ] Redundant storage across providers

---

## 📞 Support

If you encounter blob storage issues:

1. Run health check script
2. Check Vercel Blob Storage dashboard
3. Review audit logs for errors
4. Contact Vercel support if widespread issue
5. Check #firefly-grove-alerts Slack channel

---

## 🎯 Summary

**Memorial images are irreplaceable. This system ensures they're protected.**

✅ **ALWAYS** use `safeBlobUpload()` for uploads
✅ **ALWAYS** verify before saving to database
✅ **RUN** health checks regularly
✅ **MONITOR** audit logs for blob errors
✅ **ALERT** admins immediately when issues found

---

*Last updated: 2025-01-05*
