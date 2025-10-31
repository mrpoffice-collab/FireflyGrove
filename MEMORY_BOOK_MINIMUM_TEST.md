# Memory Book - Minimum Test Requirements

## 🎯 Minimum Content for Decent Test

To see **all features** working in the Memory Book PDF, you need:

### Minimum Viable Test Branch

| Content Type | Quantity | Purpose |
|--------------|----------|---------|
| **Person Record** | 1 | Title page + Obituary layout |
| **Life Summary** | 1 long text memory | Obituary page content |
| **Photo Memories** | 3-4 | Test image layout + text wrap |
| **Audio Memory** | 1 | Test QR code generation |
| **Text-Only Memories** | 2-3 | Test text-only layout |
| **Total Memories** | 7-9 | ~8-10 page PDF |

---

## 📋 Detailed Breakdown

### 1. Person Record (Required)
**Why:** Populates title page and obituary

```typescript
{
  fullName: "Margaret Anne Wilson",
  birthDate: "1942-06-15",
  endDate: "2024-11-20",
  birthLocation: "Portland, Oregon",
  endLocation: "Seattle, Washington",
  photoUrl: "https://...", // Portrait photo
  isLegacy: true,
  relationshipToOwner: "Grandmother"
}
```

**Shows on:**
- Page 1: Name, dates, photo
- Page 2: Full obituary details

---

### 2. Life Summary Memory (1)
**Why:** Fills obituary page with meaningful content

**Requirements:**
- ✅ Long text (200-500 words)
- ✅ Biographical information
- ✅ First memory in chronological order (optional)

**Example:**
```
Margaret Anne Wilson passed peacefully on November 20, 2024...
Born in Portland, Oregon in 1942, she lived a remarkable 82 years...
She was a devoted wife, loving mother, cherished grandmother...
[3-4 paragraphs of life story]
```

**Shows on:** Page 2 (Obituary)

---

### 3. Photo Memories (3-4)
**Why:** Tests image embedding, text wrap, layout

**Requirements per memory:**
- ✅ Image URL (min 1200px wide for print quality)
- ✅ Text (50-150 words)
- ✅ Author name
- ✅ Optional: Memory Card title

**Example:**
```typescript
{
  text: "This was taken at our family reunion last summer...",
  mediaUrl: "https://images.unsplash.com/photo-...",
  memoryCard: "Summer 2023 - Family Reunion",
  author: { name: "John Smith" }
}
```

**Shows on:** Pages 3-5 (2 memories per page)

**Tests:**
- Photo embedding
- Text wrapping around images
- Image sizing/scaling
- Layout spacing

---

### 4. Audio Memory with QR Code (1)
**Why:** Tests QR code generation and audio integration

**Requirements:**
- ✅ Audio URL (MP3 format recommended)
- ✅ Text description
- ✅ Author name

**Example:**
```typescript
{
  text: "This is a recording of Mom singing 'Amazing Grace'...",
  audioUrl: "https://your-blob-storage.com/audio.mp3",
  memoryCard: "Her Beautiful Voice",
  author: { name: "Sarah Wilson" }
}
```

**Shows on:** Page 3-6 (wherever it fits)

**Tests:**
- QR code generation
- "Scan to hear" layout
- Permanent audio URL creation
- Print quality of QR code

---

### 5. Text-Only Memories (2-3)
**Why:** Tests pure text layout without media

**Requirements:**
- ✅ Various lengths (short quote, medium paragraph)
- ✅ No images or audio

**Examples:**

**Short (Quote):**
```
"Love you more than words can say."
- That's what she'd write in every birthday card.
```

**Medium (Anecdote):**
```
Every Sunday, Grandma would call at exactly 9am.
It didn't matter where I was or what I was doing -
that call was sacred. We'd talk about everything:
her garden, my work, the neighbors' cat.
Those calls were my anchor.
```

**Shows on:** Pages 4-6

**Tests:**
- Text-only layout
- Typography spacing
- Multi-memory per page layout

---

## 🚀 Quick Setup Script

Run this to create perfect test data:

```bash
npx tsx scripts/create-memory-book-test-data.ts
```

**Creates:**
- ✅ Test user (test@fireflygrove.com)
- ✅ Grove + Tree
- ✅ Person record (Margaret Anne Wilson)
- ✅ Branch with 7 memories:
  - 1 life summary
  - 3 photo memories
  - 1 audio memory
  - 2 text memories

**Output:**
```
✅ Test data created successfully!

📊 Summary:
   Branch ID: clx...
   Memories: 7
   Expected PDF: ~8 pages

🧪 Test command:
   fetch('/api/memory-book/generate-preview?branchId=clx...')
     .then(r => r.blob())
     .then(blob => window.open(URL.createObjectURL(blob)))
```

---

## 📖 Expected PDF Output

### With 7 memories, you'll get:

**Page 1: Title Page**
```
┌──────────────────────┐
│  FIREFLY GROVE       │ ← Gold logo
│                      │
│   [Person Photo]     │ ← Margaret's portrait
│                      │
│ In Loving Memory of  │
│                      │
│ MARGARET ANNE WILSON │ ← Large name
│                      │
│   1942 – 2024        │
└──────────────────────┘
```

**Page 2: Obituary**
```
┌──────────────────────┐
│ Margaret Anne Wilson │
│ June 15, 1942 –      │
│ November 20, 2024    │
│                      │
│ Portland, OR →       │
│ Seattle, WA          │
│ ──────────────────   │
│                      │
│ [Life summary text   │
│  3-4 paragraphs      │
│  biographical info]  │
└──────────────────────┘
```

**Page 3: Memories 1 & 2**
```
┌──────────────────────┐
│ Summer 2023          │
│ [Photo] Text wraps   │
│         around image │
│ — John Smith         │
├──────────────────────┤
│ Sunday Calls         │
│ Every Sunday,        │
│ Grandma would call   │
│ at exactly 9am...    │
│ — Sarah Wilson       │
└──────────────────────┘
```

**Page 4: Memories 3 & 4**
```
┌──────────────────────┐
│ Christmas 2022       │
│ [Photo] Christmas at │
│         Grandma's... │
│ — John Smith         │
├──────────────────────┤
│ Her Beautiful Voice  │
│ Recording of Mom...  │
│ — Sarah Wilson       │
│                      │
│ [QR] Scan to hear    │ ← QR code!
│      voice           │
└──────────────────────┘
```

**Pages 5-6: Remaining memories**

**Page 7-8: Attribution**
```
┌──────────────────────┐
│                      │
│  This memory book    │
│  was lovingly        │
│  created with        │
│                      │
│  FIREFLY GROVE       │
│                      │
│  fireflygrove.app    │
│                      │
│  "Every memory       │
│   deserves a light"  │
└──────────────────────┘
```

---

## 🔍 What Each Test Validates

### Title Page Tests
- ✅ Firefly Grove logo placement
- ✅ Person photo embedding
- ✅ Name typography (large, elegant)
- ✅ Date formatting
- ✅ "In Loving Memory of" text
- ✅ Optional subtitle

### Obituary Page Tests
- ✅ Biographical data layout
- ✅ Date/location formatting
- ✅ Life summary text flow
- ✅ Multi-paragraph formatting
- ✅ Divider line styling

### Photo Memory Tests
- ✅ Image download from URL
- ✅ Image sizing (fit content area)
- ✅ Text wrapping around images
- ✅ Photo quality at print resolution
- ✅ Layout spacing and margins

### Audio Memory Tests
- ✅ QR code generation (200x200px)
- ✅ QR code positioning
- ✅ "Scan to hear" label
- ✅ Author name in label
- ✅ Permanent URL creation
- ✅ Scannable at print size

### Text-Only Memory Tests
- ✅ Pure text layout
- ✅ Typography hierarchy
- ✅ Line spacing
- ✅ Multiple memories per page
- ✅ Author attribution

### Cover Tests
- ✅ Front cover design
- ✅ Person photo on cover
- ✅ Name and dates
- ✅ Spine width calculation
- ✅ Spine text rotation
- ✅ Back cover branding
- ✅ Bleed area sizing

---

## 🎨 Image Requirements

### For Best Results:

**Person Portrait:**
- Resolution: 1200x1200px minimum
- Format: JPG or PNG
- Subject: Head and shoulders
- Quality: High-res, well-lit

**Memory Photos:**
- Resolution: 1600x1200px minimum (landscape)
- Format: JPG or PNG
- Quality: Print-ready (not web-optimized)
- File size: <5MB per image

**Free Stock Photos (for testing):**
- Unsplash: https://unsplash.com
- Pexels: https://www.pexels.com
- Use direct image URLs (not download pages)

---

## ⚡ Quick Test Workflow

### 1. Run Setup Script (5 seconds)
```bash
npx tsx scripts/create-memory-book-test-data.ts
```

### 2. Copy Branch ID from output
```
Branch ID: clx1234567890
```

### 3. Generate PDF (Browser DevTools)
```javascript
fetch('/api/memory-book/generate-preview?branchId=clx1234567890')
  .then(r => r.blob())
  .then(blob => window.open(URL.createObjectURL(blob)))
```

### 4. Review PDF (30 seconds)
- ✅ Check all 8 pages generated
- ✅ Verify images loaded
- ✅ Check QR code visible
- ✅ Review typography
- ✅ Confirm layout spacing

### 5. Print Test (optional)
- Print page 4 (QR code page)
- Scan QR with phone
- Verify audio URL opens

**Total time: ~1 minute** ⚡

---

## 🐛 Troubleshooting

### "No memories found"
**Fix:** Ensure memories have:
- `status: 'ACTIVE'`
- `approved: true`
- `branchId` matches

### "Images not loading"
**Fix:** Use direct image URLs:
- ✅ `https://images.unsplash.com/photo-...`
- ❌ `https://unsplash.com/photos/...` (page, not image)

### "QR code missing"
**Fix:** Ensure audio memory has:
- `audioUrl` not null
- Valid URL format

### "PDF too small/large"
**Adjust:** Change memories per page:
```typescript
// Line 394 in memory-book-generator.ts
if (i === 0 || i % 2 === 0) {  // 2 per page
```

---

## 📊 Content Recommendations

### Ideal Test Content Mix:

| Content Type | Recommended | Why |
|--------------|-------------|-----|
| Life summary | 1 (300 words) | Tests obituary layout |
| Photo + text | 3-4 | Tests image handling |
| Audio + QR | 1-2 | Tests QR generation |
| Text only | 2-3 | Tests pure text layout |
| Short quotes | 1-2 | Tests compact layout |
| **Total** | **8-12 memories** | **10-14 page book** |

**Page count = 3 base pages + (memories ÷ 2.5)**

**Examples:**
- 7 memories = ~6 pages → rounds to **8 pages**
- 12 memories = ~8 pages → rounds to **8 pages**
- 20 memories = ~11 pages → rounds to **12 pages**

---

## ✅ Pre-Flight Checklist

Before generating your first PDF:

- [ ] Person record created (name, dates, photo)
- [ ] Branch has 7+ memories
- [ ] At least 1 photo memory (high-res image URL)
- [ ] At least 1 audio memory (with valid audioUrl)
- [ ] At least 1 life summary (200+ words)
- [ ] All memories have `status: 'ACTIVE'`
- [ ] All memories have `approved: true`
- [ ] Logged in as branch owner
- [ ] Browser DevTools open (F12)

---

## 🎯 Success Criteria

Your test is successful when you can:

✅ Generate 8-page PDF in <10 seconds
✅ Open PDF in browser
✅ See all 7 memories rendered
✅ Photos display clearly
✅ QR code visible on audio memory
✅ Typography is readable
✅ Layout looks professional
✅ No overlapping text
✅ No missing images
✅ Cover includes person photo and name

---

**Bottom Line:** You need just **7-9 memories** to test all features! 🎉

Run the setup script and you'll have perfect test data in 5 seconds.
