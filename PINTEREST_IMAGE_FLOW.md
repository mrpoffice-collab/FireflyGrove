# Pinterest Marketing Intelligence - Image Flow

## 🔄 How Images Get Assigned to Posts

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTENT CREATION                             │
│                                                                  │
│  Blog Post Generated → Contains keywords, topic, content        │
│           ↓                                                      │
│  Content Repurposer creates Pinterest pin drafts                │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                   IMAGE SELECTOR SERVICE                         │
│                                                                  │
│  1. Load metadata.json from screenshot repository               │
│  2. Filter images by platform (pinterest)                       │
│  3. Score each image based on:                                  │
│     • Platform match (+30 pts)                                  │
│     • Pinterest optimization (+20 pts)                          │
│     • Topic relevance (+15 pts each)                            │
│     • Keyword-tag matches (+10 pts each)                        │
│     • Title/description matches (+8 pts each)                   │
│  4. Select highest scoring image (min 20 pts)                   │
│  5. Fallback to Unsplash if no good match                       │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE ASSIGNMENT                              │
│                                                                  │
│  Post saved to DB with image URL in `image` field              │
│  • For new posts: Auto-assigned during creation                 │
│  • For existing posts: Use /assign-images API                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SCHEDULED PUBLISHING                           │
│                                                                  │
│  Cron Job runs daily → Finds approved posts                     │
│           ↓                                                      │
│  Calls publishToPinterest() with:                               │
│  • title                                                         │
│  • description                                                   │
│  • link (back to blog)                                          │
│  • imageUrl (from post.image field) ← NEW!                     │
│           ↓                                                      │
│  Pinterest API creates pin with image                           │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PINTEREST LIVE                              │
│                                                                  │
│  Pin appears on board with:                                     │
│  ✓ Optimized image (2:3 vertical)                              │
│  ✓ SEO-friendly title                                           │
│  ✓ Keyword-rich description                                     │
│  ✓ Link back to Firefly Grove                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Screenshot Repository Structure

```
public/marketing/screenshots/
│
├── metadata.json ◄─────────── Central metadata database
│   └── Contains:
│       • filename
│       • url (public URL)
│       • title, description
│       • tags (keywords)
│       • topics
│       • platform (pinterest, facebook)
│       • aspectRatio
│       • pinterestOptimized (true/false)
│
├── features/
│   ├── grove-overview.png
│   ├── memory-upload.png
│   ├── branch-organization.png
│   └── heir-management.png
│
├── use-cases/
│   ├── family-memories.png
│   ├── digital-legacy.png
│   └── photo-preservation.png
│
└── social-proof/
    ├── testimonial-1.png
    └── user-story.png
```

---

## 🎯 Example: Image Selection in Action

### Scenario: Blog post about "Family Photo Preservation"

**Input:**
```typescript
{
  keywords: ['photos', 'preservation', 'family', 'backup'],
  topic: 'photo preservation',
  platform: 'pinterest',
  title: 'How to Preserve Family Photos Forever',
  content: 'Keep precious memories safe...'
}
```

**Image Scoring Process:**

| Image | Platform Match | Topic Match | Tag Matches | Score | Selected? |
|-------|----------------|-------------|-------------|-------|-----------|
| photo-preservation.png | +30 | +15 (photo preservation) | +40 (4 tags) | **85** | ✅ **YES** |
| memory-upload.png | +30 | +12 (photo organization) | +20 (2 tags) | 62 | ❌ |
| grove-overview.png | +30 | 0 | +10 (1 tag) | 40 | ❌ |

**Result:** `photo-preservation.png` selected (score: 85)

---

## 🔧 How to Improve Image Selection

### If images aren't matching well:

1. **Add more descriptive tags**
   ```json
   "tags": [
     "photos",
     "preservation",
     "backup",
     "photo-backup",
     "photo-preservation",
     "family-photos",
     "memory-keeping"
   ]
   ```

2. **Include content brief keywords**
   - Check what keywords your blogs use
   - Add those exact keywords to image tags
   - Match your SEO strategy

3. **Update topics to match your content**
   ```json
   "topics": [
     "photo preservation",
     "digital legacy",
     "family memories",
     "photo backup"
   ]
   ```

4. **Create Pinterest-optimized versions**
   - Crop to 2:3 aspect ratio (1000x1500px)
   - Add text overlay with compelling headline
   - Set `pinterestOptimized: true`
   - Gets +20 bonus points

---

## 🚀 Quick Start Guide

### Step 1: Take Screenshots
```bash
# Use Windows Snipping Tool or browser dev tools
# Save to appropriate folder
public/marketing/screenshots/features/new-feature.png
```

### Step 2: Update Metadata
```json
{
  "filename": "features/new-feature.png",
  "url": "https://fireflygrove.app/marketing/screenshots/features/new-feature.png",
  "title": "New Feature Name",
  "description": "What this feature does and why it matters",
  "tags": ["feature", "keyword1", "keyword2", "keyword3"],
  "platform": ["pinterest", "facebook"],
  "topics": ["digital legacy", "family memories"],
  "aspectRatio": "2:3",
  "pinterestOptimized": true,
  "uploadedAt": "2025-01-15"
}
```

### Step 3: Deploy
```bash
# Commit and push
git add public/marketing/screenshots/
git commit -m "Add new marketing screenshot"
git push

# Or deploy to Vercel
vercel deploy --prod
```

### Step 4: Assign to Posts
```bash
# Automatic for new posts
# For existing posts:
curl -X POST https://fireflygrove.app/api/marketing/posts/assign-images
```

---

## 📊 Monitoring & Analytics

### Check Repository Stats
```typescript
import { getRepositoryStats } from '@/lib/marketing/imageSelector'

const stats = getRepositoryStats()
// {
//   totalImages: 7,
//   platforms: ['pinterest', 'facebook'],
//   lastUpdated: '2025-01-15',
//   imagesByPlatform: [
//     { platform: 'pinterest', count: 7 },
//     { platform: 'facebook', count: 7 }
//   ],
//   pinterestOptimized: 3
// }
```

### Check Posts Needing Images
```bash
GET /api/marketing/posts/assign-images

# Response:
{
  "needsImages": 12,
  "totalPosts": 45,
  "percentageWithImages": 73.3
}
```

### Test Image Selection
```typescript
import { selectImageForContent } from '@/lib/marketing/imageSelector'

const imageUrl = selectImageForContent({
  keywords: ['test', 'keywords'],
  topic: 'test topic',
  platform: 'pinterest',
  title: 'Test Title',
  content: 'Test content'
})

console.log('Selected:', imageUrl)
```

---

## 🎨 Pinterest-Specific Tips

### Create High-Performing Pins

1. **Vertical Format (2:3)**
   - 1000x1500px is optimal
   - Gets +20 bonus points in selection

2. **Text Overlay**
   - Add compelling headline
   - Use readable fonts (min 30px)
   - High contrast (light text on dark, or vice versa)

3. **Branding**
   - Firefly Grove logo in corner
   - Consistent color scheme (#FFD700 gold)
   - Brand voice in headlines

4. **Call to Action**
   - "Learn More"
   - "Discover How"
   - "Get Started Today"

### Screenshot Ideas
- [ ] Dashboard with memories loaded
- [ ] Memory upload flow (step by step)
- [ ] Branch organization view
- [ ] Heir management interface
- [ ] Mobile app screenshots
- [ ] Before/after (disorganized → organized)
- [ ] Success stories (with permission)
- [ ] Feature comparisons
- [ ] Pricing page highlights
- [ ] Testimonial graphics

---

## 🔍 Troubleshooting

### Problem: All posts get Unsplash fallback

**Cause:** No images scoring above 20 points

**Solutions:**
1. Add more relevant tags to images
2. Use keywords from your content briefs
3. Create Pinterest-optimized versions
4. Check image URLs are publicly accessible

### Problem: Wrong image selected

**Cause:** Another image scored higher

**Solutions:**
1. Make target image more specific (better tags)
2. Add Pinterest optimization (+20 pts)
3. Reduce irrelevant matches on other images
4. Add more topic matches

### Problem: Images not loading in pins

**Cause:** URLs not publicly accessible

**Solutions:**
1. Deploy images to production
2. Check URLs in metadata.json are correct
3. Test URL in browser (should be accessible without auth)
4. Ensure proper CORS headers

---

## 📈 Success Metrics

Track these to optimize your image strategy:

- **Selection Rate**: How often repository images beat Unsplash
- **Pin Performance**: Saves, clicks, impressions by image
- **Traffic**: Referrals from Pinterest to site
- **Conversions**: Sign-ups from Pinterest traffic

**Goal:** 100% of posts use repository images (no Unsplash fallback)

---

**Last Updated**: 2025-01-15
**System Status**: ✅ Fully Operational (pending Pinterest token refresh)
