# Firefly Grove - Production Deployment Checklist

**Purpose:** Ship a safe, reliable beta that can handle joyful events and bereavement with zero data loss, clear permissions, and graceful failure modes.

---

## ✅ Pre-Deployment Checklist

### 1. Environment and Feature Flags

- [ ] Set `DEMO_MODE=false` in production
- [ ] Set `IS_BETA=true` to show beta banner
- [ ] Configure `DATABASE_URL` for production Postgres
- [ ] Test database read/write connectivity
- [ ] Set storage variables:
  - `STORAGE_BUCKET`
  - `STORAGE_REGION`
  - `STORAGE_ACCESS_KEY`
  - `STORAGE_SECRET`
  - Prefix: `prod/`
- [ ] Set `EMAIL_API_KEY` (Resend/SendGrid)
- [ ] Verify `SENDER_EMAIL` domain
- [ ] Set Stripe to **live mode**:
  - `STRIPE_SECRET_KEY` (live)
  - `STRIPE_PRODUCT_ID`
  - `STRIPE_PRICE_ID`
- [ ] Configure backup storage:
  - `BACKUP_BUCKET`
  - Enable Object Lock (immutable)
- [ ] Set core app variables:
  - `APP_BASE_URL` (production domain)
  - `CORS_ORIGINS` (production only)
  - `SESSION_SECRET` (strong, rotated)

**Status:** ⏳ Not started

---

### 2. Data Model and Migrations

- [ ] Apply latest migrations to production Postgres
- [ ] Verify tables exist:
  - `users`
  - `branches`
  - `entries`
  - `branch_members`
  - `invites` (new table needed)
  - `heirs`
  - `notifications` (new table needed)
- [ ] Create critical indexes:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_entries_branch_created
    ON entries(branch_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_branch_members_branch_user
    ON branch_members(branch_id, user_id);
  CREATE INDEX IF NOT EXISTS idx_invites_token
    ON invites(token);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications(user_id, created_at);
  ```
- [ ] Run smoke test: create branch → add entry → delete → verify
- [ ] Purge test data

**Status:** ⏳ Not started

---

### 3. Storage Layout and Limits

- [ ] Enforce path schema: `/prod/{userId}/{branchId}/{entryId}/{filename}`
- [ ] Set upload limits:
  - Photos: ≤ 3 MB
  - Audio: ≤ 2 minutes or ≤ 5 MB
- [ ] Implement server-side validation:
  - Content-type checking
  - File extension validation
  - Image transcoding (normalize to WebP/JPEG)
  - Audio transcoding (normalize to MP3/WebM)
- [ ] Configure S3 lifecycle:
  - Day 0-60: Hot storage
  - Day 60+: Warm/cold archive (never delete)

**Status:** ⏳ Not started

---

### 4. Backups and Integrity

- [ ] Schedule weekly full DB dump to immutable bucket
- [ ] Verify encryption at rest
- [ ] Schedule daily incremental object copy: `prod/` → `archive/`
- [ ] Implement content-hash deduplication
- [ ] Add monthly integrity job:
  - Re-hash random 1% sample
  - Email pass/fail to admin
- [ ] Test end-to-end restore:
  - DB snapshot → temp environment
  - Files → temp storage
  - Verify branch loads correctly

**Status:** ⏳ Not started

---

### 5. Billing and Coupons

- [ ] Create "Beta100" coupon in Stripe:
  - 100% off
  - Valid for 1 year
  - Single use per customer
- [ ] Pre-apply coupon to checkout link for beta invitees
- [ ] Webhook updates `user.status = 'ACTIVE'` on subscription
- [ ] Grace period: 30 days after subscription end
- [ ] After grace: `status = 'LOCKED'` (view-only)
- [ ] Add "Reactivate" button with Stripe customer portal link
- [ ] Test full flow: checkout → webhook → status update

**Status:** ⏳ Not started

---

### 6. Email and Notifications

**Transactional Templates:**
- [ ] Branch invite
- [ ] Passwordless login magic link
- [ ] Shared entry notification
- [ ] Export ready download
- [ ] Heir legacy release notification

**Tone Review:**
- [ ] All templates reviewed for calm, humane language
- [ ] No upsell during memorial events
- [ ] Clear, actionable CTAs

**Infrastructure:**
- [ ] DKIM/SPF configured for `SENDER_DOMAIN`
- [ ] Test emails to Gmail, Outlook, iCloud
- [ ] Verify inbox placement (not spam)

**In-App Preferences:**
- [ ] Immediate notifications
- [ ] Daily digest
- [ ] Weekly digest
- [ ] Off (opt-out)

**Status:** ⏳ Not started

---

### 7. Privacy and Permissions (ACL)

**Entry Visibility:**
- [ ] Default visibility = `PRIVATE`
- [ ] `SHARED` requires explicit selection
- [ ] `LEGACY` hidden until release

**Guest Permissions:**
- [ ] Guest submissions default to `Pending`
- [ ] Owner approval required before visibility
- [ ] Guests see only `SHARED` entries in their branches

**Branch Privacy:**
- [ ] No cross-branch discovery
- [ ] Non-members cannot infer branch existence
- [ ] Branch list filtered by membership

**Access Control:**
- [ ] Every write endpoint checks ownership/membership
- [ ] Every read endpoint checks visibility + membership
- [ ] API returns 404 (not 403) for non-existent resources

**Status:** ⏳ Not started

---

### 8. Legacy and Event Modes

**Legacy Entries:**
- [ ] UI collects release condition:
  - After specific date
  - Manual release
  - "After death" (deferred post-beta with note)
- [ ] Heirs designated by email
- [ ] No auto-exposure
- [ ] Owner approval required for heir claims

**Event Grove Mode:**
- [ ] Time-boxed contribution window
- [ ] Host is the payer (or uses Beta100 coupon)
- [ ] Open contributions with minimal friction
- [ ] Post-event: host reviews all contributions
- [ ] Host can approve/reject before locking
- [ ] Clear "Event ended" state

**Status:** ⏳ Not started

---

### 9. Exports and "Forever Kit"

**ZIP Contents:**
- [ ] Markdown text file for each memory
- [ ] Normalized media files (JPEG/WebP, MP3)
- [ ] Simple `index.html` viewer
- [ ] `README.txt` with instructions

**Additional Features:**
- [ ] Store each export in archive bucket
- [ ] Return stable download URL (signed, 7-day expiry)
- [ ] Optional: voice reel (audio compilation)
- [ ] Optional: QR code page for funeral homes

**Status:** ⏳ Not started

---

### 10. Observability and Safety Rails

**Logging:**
- [ ] Structured logging with request IDs
- [ ] Mask PII in logs (emails, names)
- [ ] Log retention: 30 days hot, 1 year archive

**Monitoring:**
- [ ] Error tracking (Sentry or equivalent)
- [ ] Health endpoint: `/api/health`
  - Database connectivity
  - Storage connectivity
  - Return 200 or 503

**Rate Limiting:**
- [ ] Write endpoints: 10 req/min per user
- [ ] Upload endpoints: 5 uploads/min per user
- [ ] Open event endpoints: 30 contributions/hour

**Graceful Fallbacks:**
- [ ] Streaming fails → offer file download
- [ ] Email fails → show magic link inline
- [ ] Image fails → show placeholder, allow retry

**Status:** ⏳ Not started

---

### 11. UX and Content Guardrails

**Beta Banner:**
- [ ] Visible on all pages
- [ ] Single "Report a snag" button
- [ ] Form pre-fills: page URL, user ID, build version
- [ ] Allow screenshot attachment

**Confirmations:**
- [ ] Destructive actions require confirmation
- [ ] Soft delete with 30-day undo
- [ ] Clear "Are you sure?" modals

**Accessibility:**
- [ ] Keyboard navigation (tab order correct)
- [ ] Alt text on all images
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested

**Sensitive Copy:**
- [ ] Memorial flows have no marketing language
- [ ] Calm, respectful tone
- [ ] "Delete" → "Remove"
- [ ] "Upgrade" → hidden during memorial events

**Status:** ⏳ Not started

---

### 12. Security

**HTTPS and Headers:**
- [ ] HTTPS only (redirect HTTP → HTTPS)
- [ ] HSTS enabled (max-age=31536000)
- [ ] Content-Security-Policy header
- [ ] X-Frame-Options: DENY

**Session Security:**
- [ ] HttpOnly cookies
- [ ] Secure flag
- [ ] SameSite=Lax
- [ ] JWT/session secrets rotated
- [ ] Secrets stored in environment (not repo)

**CORS:**
- [ ] Restricted to production domain(s)
- [ ] No wildcard origins

**Admin Routes:**
- [ ] Protected by role check
- [ ] IP allowlist (optional)
- [ ] Audit log for admin actions

**Status:** ⏳ Not started

---

### 13. Staging to Production Hand-off

**Separate Environments:**
- [ ] Staging and production use separate:
  - Databases
  - Storage buckets
  - Stripe products
  - Email senders
- [ ] Staging seed data removed from production build
- [ ] Demo toggles removed from production build

**CDN Configuration:**
- [ ] Static assets cached (images, CSS, JS)
- [ ] API routes: no caching
- [ ] Cache invalidation on deploy

**Status:** ⏳ Not started

---

### 14. Go/No-Go Smoke Tests

**Must pass on production URL before launch:**

- [ ] **Branch and Entry Flow:**
  - Create branch
  - Add private entry
  - Add shared entry
  - Add legacy entry
  - Verify visibility for each type

- [ ] **Collaboration:**
  - Invite a guest
  - Guest submits entry (pending)
  - Owner approves entry
  - Verify guest sees only shared entries

- [ ] **Export:**
  - Export Forever Kit
  - Download ZIP
  - Open on iOS Safari
  - Open on Windows Chrome
  - Verify all media plays

- [ ] **Media Upload:**
  - Upload photo from iPhone Safari
  - Upload audio from Android Chrome
  - Playback in browser
  - Verify transcoding worked

- [ ] **Billing:**
  - Stripe checkout with Beta100 coupon
  - Complete payment
  - Webhook fires
  - User status → ACTIVE
  - Verify in database

- [ ] **Account Locking:**
  - Manually set subscription expired
  - Status → LOCKED
  - Verify view-only mode
  - Click "Reactivate"
  - Open Stripe portal
  - Verify can update payment

- [ ] **Invites:**
  - Send invite to Gmail
  - Send invite to Outlook
  - Send invite to iCloud
  - Accept invite on mobile
  - Verify link works

**Status:** ⏳ Not started

---

### 15. Support and Runbook

**Help System:**
- [ ] Add "Help" link in header
- [ ] Create status/support page
- [ ] Real support email monitored
- [ ] Auto-reply with ticket number

**Rollback Steps:**
1. Revert to previous Vercel deployment
2. If database changed: restore snapshot
3. Notify users of brief downtime
4. Test critical flows
5. Monitor error logs for 1 hour

**Funeral Home PDF:**
- [ ] One-page explainer
- [ ] "What is Firefly Grove"
- [ ] "How to contribute to a memorial"
- [ ] QR code to the specific memorial Grove
- [ ] Printable, professional design

**Status:** ⏳ Not started

---

### 16. Post-Deploy Day 1

**Monitoring:**
- [ ] Check error logs every hour
- [ ] Monitor email bounce rate
- [ ] Watch Stripe webhook success rate
- [ ] Check storage upload success rate

**Manual Testing:**
- [ ] Test 5 critical flows from clean account
- [ ] Verify on mobile (iOS + Android)
- [ ] Check performance (page load < 2s)

**Communication:**
- [ ] Thank early testers
- [ ] Remind of "Report a snag" button
- [ ] Set expectations for response time

**Status:** ⏳ Not started

---

## 🚫 Not Yet Ready Features

If any feature cannot be completed before launch, either:
1. Add "Not yet in beta" note in UI
2. Remove the entry point entirely

**Ship fewer things, perfectly dependable.**

---

## 📋 Summary Status

| Section | Status | Critical? |
|---------|--------|-----------|
| 1. Environment Variables | ⏳ Not started | ✅ Yes |
| 2. Database Migrations | ⏳ Not started | ✅ Yes |
| 3. Storage Limits | ⏳ Not started | ✅ Yes |
| 4. Backups | ⏳ Not started | ✅ Yes |
| 5. Billing | ⏳ Not started | ✅ Yes |
| 6. Email | ⏳ Not started | ✅ Yes |
| 7. ACL Permissions | ⏳ Not started | ✅ Yes |
| 8. Event Grove Mode | ⏳ Not started | ⚠️ Can defer |
| 9. Forever Kit Export | ⏳ Not started | ✅ Yes |
| 10. Observability | ⏳ Not started | ✅ Yes |
| 11. UX Guardrails | ⏳ Not started | ✅ Yes |
| 12. Security | ⏳ Not started | ✅ Yes |
| 13. Staging Separation | ⏳ Not started | ✅ Yes |
| 14. Smoke Tests | ⏳ Not started | ✅ Yes |
| 15. Support Runbook | ⏳ Not started | ✅ Yes |
| 16. Day 1 Monitoring | ⏳ Not started | ✅ Yes |

---

## 🎯 Next Steps

1. Review this checklist with your team
2. Identify which items can be automated
3. Create tickets for each section
4. Assign owners and deadlines
5. Track progress daily
6. Do not launch until all "✅ Yes" items are complete

**Remember:** This handles sensitive memorial content. Perfection over speed.

---

**Last Updated:** Ready for production deployment planning
**Owner:** Development Team
**Target Launch:** TBD after all critical items complete
