# 🚀 Facebook Import Implementation Plan

## Phase 1: Facebook OAuth & API Setup ✅ START HERE

### 1.1 Facebook Developer Setup
**Your Action Required:**
1. Go to https://developers.facebook.com/apps/
2. Create new app → Choose "Consumer"
3. App name: "Firefly Grove"
4. Add "Facebook Login" product
5. Configure OAuth redirect URIs:
   - Development: `http://localhost:3000/api/facebook/callback`
   - Production: `https://firefly-grove.vercel.app/api/facebook/callback`
6. Add permissions in App Review:
   - `user_photos` (standard access)
   - `user_posts` (standard access)
   - `public_profile` (already approved)

**Get These Values:**
- App ID: `__________________`
- App Secret: `__________________`

### 1.2 Environment Variables
Add to `.env.local`:
```env
# Facebook API (for importing memories from Facebook)
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/facebook/callback
```

Add to Vercel (production):
```
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=https://firefly-grove.vercel.app/api/facebook/callback
```

### 1.3 Files to Create

**lib/facebook.ts** - Facebook Graph API Client
- OAuth token management
- Fetch user albums
- Fetch posts with photos
- Fetch photo metadata
- Rate limiting handling

**lib/contentAnalyzer.ts** - AI Content Analysis
- Meme detection
- People detection (from tags)
- Caption sentiment analysis
- Location/date context extraction
- Confidence scoring

**lib/importRouter.ts** - Smart Routing Logic
- Multi-pass analysis (faces, albums, captions, dates, social signals)
- Branch matching/suggestion
- Confidence scoring
- Grouping/clustering

---

## Phase 2: Database Schema Updates

### 2.1 New Models

**NestItem** - Staging area for imports
```prisma
model NestItem {
  id            String   @id @default(cuid())
  userId        String

  // Content
  text          String   @db.Text
  mediaUrls     String[] // Multiple images per post
  originalDate  DateTime?

  // Import metadata
  source        String   // 'facebook', 'instagram', etc.
  sourceId      String?  // Original Facebook post ID
  importMeta    Json?    // Original captions, comments, tags, location

  // AI analysis
  contentType   String?  // 'photo', 'landscape', 'meme', 'mixed'
  confidence    Float?   // AI confidence score (0-1)
  suggestedBranchId String?

  // Status
  status        String   @default("pending") // 'pending', 'reviewed', 'hatched'

  // Timestamps
  createdAt     DateTime @default(now())
  importedAt    DateTime @default(now())

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  suggestedBranch Branch? @relation(fields: [suggestedBranchId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([suggestedBranchId])
}
```

**FacebookToken** - Store user's Facebook access tokens
```prisma
model FacebookToken {
  id           String   @id @default(cuid())
  userId       String   @unique
  accessToken  String   @db.Text
  refreshToken String?  @db.Text
  expiresAt    DateTime?
  scope        String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**ImportJob** - Track background import progress
```prisma
model ImportJob {
  id              String   @id @default(cuid())
  userId          String

  source          String   // 'facebook', 'instagram'
  status          String   // 'analyzing', 'importing', 'complete', 'failed'

  // Counts
  totalItems      Int      @default(0)
  processedItems  Int      @default(0)
  importedItems   Int      @default(0)
  skippedItems    Int      @default(0)

  // Routing results
  autoRouted      Int      @default(0)
  needsReview     Int      @default(0)

  // Metadata
  settings        Json?    // User's import preferences
  error           String?  @db.Text

  // Timestamps
  startedAt       DateTime @default(now())
  completedAt     DateTime?

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
}
```

### 2.2 Update Existing Models

**User model** - Add relations
```prisma
// Add these relations:
nestItems      NestItem[]
facebookToken  FacebookToken?
importJobs     ImportJob[]
```

**Entry model** - Add import tracking
```prisma
// Add these fields:
importSource   String?  // 'facebook', 'instagram', 'manual'
importSourceId String?  // Original post/photo ID
importedAt     DateTime?
```

---

## Phase 3: API Routes

### 3.1 Facebook OAuth
- `app/api/facebook/connect/route.ts` - Initiate OAuth flow
- `app/api/facebook/callback/route.ts` - Handle OAuth callback
- `app/api/facebook/disconnect/route.ts` - Revoke token

### 3.2 Import Flow
- `app/api/facebook/albums/route.ts` - GET: Fetch user's albums
- `app/api/facebook/posts/route.ts` - GET: Fetch posts with photos
- `app/api/facebook/analyze/route.ts` - POST: Analyze photos for import preview
- `app/api/facebook/import/route.ts` - POST: Start background import job

### 3.3 Nest Management
- `app/api/nest/items/route.ts` - GET: Fetch nest items, POST: Create nest item
- `app/api/nest/items/[itemId]/route.ts` - GET, PATCH, DELETE nest item
- `app/api/nest/hatch/route.ts` - POST: Move item(s) from nest to branch
- `app/api/nest/bulk/route.ts` - POST: Bulk operations (delete, move, hatch)

### 3.4 Memory Management
- `app/api/memories/[memoryId]/move/route.ts` - POST: Move memory to different branch
- `app/api/memories/bulk-move/route.ts` - POST: Bulk move memories

### 3.5 Import Jobs
- `app/api/import-jobs/[jobId]/route.ts` - GET: Check import job status
- `app/api/import-jobs/route.ts` - GET: List user's import jobs

---

## Phase 4: UI Components

### 4.1 Import Wizard
**components/FacebookImportWizard.tsx**
- Step 1: Connect Facebook
- Step 2: Select albums & date range
- Step 3: Smart routing preview
- Step 4: Confirm & start import

### 4.2 Nest UI
**app/nest/page.tsx** - Enhanced nest page
- Filter by content type, source, confidence
- Bulk selection and actions
- AI suggestions display
- Quick hatch workflow

**components/NestItemCard.tsx**
- Display imported photo(s)
- Show AI suggestions
- Quick actions (hatch, edit, delete)
- Confidence indicator

**components/LandscapeReviewModal.tsx**
- Special UI for reviewing landscape photos
- Smart grouping by trip/location
- Bulk routing with notes

### 4.3 Memory Actions
**components/MemoryMoveModal.tsx**
- Select destination branch
- Bulk move support
- Safety warnings for shared memories

**Update: components/MemoryCard.tsx**
- Add "Move to Branch" action
- Add "imported from" badge

### 4.4 Import Dashboard
**components/FacebookImportButton.tsx**
- Connect Facebook button
- Show connection status
- Last import info

**app/settings/imports/page.tsx**
- Connected accounts
- Import history
- Manage tokens

---

## Phase 5: Background Jobs

### 5.1 Import Worker
**lib/workers/facebookImportWorker.ts**
- Process import job in background
- Fetch photos in batches (rate limiting)
- Run AI analysis
- Save to Nest or auto-route to branches
- Send email notification when complete

### 5.2 Email Notifications
**lib/email.ts** - Add import completion email
```
Subject: Your Facebook Memories are Ready! 🪺

Hi {name},

Great news! Your Facebook import is complete.

📊 Import Summary:
• 1,842 memories added to branches
• 158 items in your Nest for review

What's Next:
1. Visit your Nest to review items
2. Quick-sort with AI suggestions
3. Hatch to branches with one click

[View My Nest →]

✨ {totalMemories} fireflies are glowing in your grove!
```

---

## Phase 6: AI Integration

### 6.1 Content Analysis with Claude
**Use Anthropic API to analyze:**
- Image content (people, landscapes, objects)
- Caption sentiment and meaning
- Memory vs meme classification
- Suggested branch matching

**Batch processing:**
- Analyze 50 items at once for efficiency
- Cost: ~$0.01-0.05 per import
- Cache results in importMeta

### 6.2 Smart Routing Logic
**Multi-pass analysis:**
1. Face tags → Person branches
2. Album names → Event/trip branches
3. Captions → Memorial/emotion branches
4. Dates → Time-based grouping
5. Social signals → Importance scoring

**Confidence thresholds:**
- 95%+ → Auto-route to branch
- 70-94% → Suggest (user confirms)
- <70% → Send to Nest for review

---

## Phase 7: Testing Plan

### 7.1 Phase 1: Development Testing
- [ ] Test OAuth flow with your Facebook
- [ ] Verify token storage and refresh
- [ ] Test album fetching
- [ ] Test photo metadata extraction

### 7.2 Phase 2: Analysis Testing
- [ ] Test AI meme detection
- [ ] Test landscape vs people photo classification
- [ ] Test caption analysis
- [ ] Verify confidence scoring accuracy

### 7.3 Phase 3: Small Import Test
- [ ] Import 1 album (50 photos)
- [ ] Verify routing accuracy
- [ ] Test Nest review workflow
- [ ] Test hatching to branches

### 7.4 Phase 4: Large Import Test
- [ ] Import 500+ photos
- [ ] Verify background processing
- [ ] Test bulk operations
- [ ] Check performance

### 7.5 Phase 5: Full Test with Your Account
- [ ] Import all your Facebook photos
- [ ] Review routing accuracy
- [ ] Test move/relocate features
- [ ] Verify landscape photo handling
- [ ] Check multi-image post grouping

### 7.6 Phase 6: Beta Tester Testing
- [ ] Select 2-3 beta testers
- [ ] Guide through import flow
- [ ] Gather feedback on routing accuracy
- [ ] Measure time to first value
- [ ] Track activation improvements

---

## Phase 8: Deployment

### 8.1 Environment Setup
- [ ] Add Facebook credentials to Vercel
- [ ] Set up Anthropic API key for Claude
- [ ] Configure background job processing
- [ ] Set up email notifications

### 8.2 Database Migration
- [ ] Run Prisma migration for new models
- [ ] Add indexes for performance
- [ ] Test on staging environment

### 8.3 Gradual Rollout
- [ ] Deploy to staging
- [ ] Test with your account
- [ ] Deploy to production
- [ ] Enable for beta testers first
- [ ] Monitor error rates and performance
- [ ] Gather feedback
- [ ] Iterate and improve
- [ ] Open to all users

---

## Success Metrics

### Activation Metrics
- **Before:** Average 20-30 memories per user in first week
- **Target:** 200+ memories from Facebook import in first session
- **Measure:** Time from signup to first 100 memories

### Engagement Metrics
- **Import Adoption:** % of users who connect Facebook
- **Routing Accuracy:** % of auto-routed memories kept vs moved
- **Nest Completion:** % of Nest items hatched within 7 days
- **Continued Usage:** Do users add manual memories after import?

### Technical Metrics
- **Import Speed:** Time to import 1000 photos
- **AI Accuracy:** Precision/recall for routing decisions
- **Error Rates:** Failed imports, API errors
- **Cost per Import:** Anthropic API + processing costs

---

## Cost Estimates

### Per Import (2000 photos):
- **Anthropic Claude API:** ~$0.30-0.50 (batch analysis)
- **Vercel Blob Storage:** ~$0.10 (if we store copies vs linking)
- **Processing Time:** 5-10 minutes
- **Total:** ~$0.40-0.60 per large import

### Monthly (100 users importing):
- ~$40-60/month in AI costs
- Offset by activation improvements
- Break-even: 1-2 new subscribers from improved activation

---

## Timeline Estimate

**Phase 1-2: Setup & Database** (2-3 days)
- Facebook app setup
- Database schema
- OAuth implementation

**Phase 3-4: Core Features** (3-4 days)
- API routes
- Import logic
- Basic UI

**Phase 5-6: AI & Polish** (2-3 days)
- Content analysis
- Smart routing
- Background jobs

**Phase 7: Testing** (2-3 days)
- Your account testing
- Bug fixes
- Performance tuning

**Phase 8: Deployment** (1 day)
- Production deploy
- Beta tester rollout

**Total: ~2 weeks for MVP**

---

## Next Immediate Steps

1. **You:** Create Facebook App and get credentials
2. **Me:** Start building OAuth flow and Facebook API client
3. **You:** Test connection with your Facebook account
4. **Me:** Build analysis system
5. **Together:** Test import with your photos
6. **Me:** Build Nest UI and routing
7. **You:** Review and test full flow
8. **Me:** Deploy to production
9. **You:** Test with beta testers

---

**Ready to start? Let's get those Facebook credentials and begin building!** 🚀
