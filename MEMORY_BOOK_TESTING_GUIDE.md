# Memory Book - Testing Guide

## ✅ What's Been Built

You now have a **complete PDF generation system** that creates print-ready memory books **without needing Lulu API access**.

### Files Created
1. `lib/qr-generator.ts` - QR code generation
2. `lib/memory-book-generator.ts` - 750+ lines of PDF layout code
3. `app/api/memory-book/generate-preview/route.ts` - Preview/download API
4. `app/api/audio-playback/[entryId]/route.ts` - Permanent audio URLs

---

## 🧪 How to Test Locally (Right Now)

### Option 1: API Testing with Postman/Curl

**Generate Preview (Returns Base64 PDFs)**
```bash
curl -X POST http://localhost:3000/api/memory-book/generate-preview \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"branchId": "YOUR_BRANCH_ID", "includeAudioQR": true}'
```

**Download Interior PDF Directly**
```bash
curl -X GET "http://localhost:3000/api/memory-book/generate-preview?branchId=YOUR_BRANCH_ID" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -o memory-book-test.pdf
```

---

### Option 2: Browser Testing

1. **Login to Firefly Grove** locally
2. **Open Browser DevTools** (F12)
3. **Run in Console:**

```javascript
// Get your session (already logged in)
const branchId = 'YOUR_BRANCH_ID' // Replace with real ID

// Generate memory book
fetch('/api/memory-book/generate-preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ branchId, includeAudioQR: true })
})
  .then(r => r.json())
  .then(data => {
    console.log('Book generated:', data)

    // Download interior PDF
    const interior = atob(data.book.interiorPdf) // Decode base64
    const bytes = new Uint8Array(interior.length)
    for (let i = 0; i < interior.length; i++) {
      bytes[i] = interior.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    // Open in new tab
    window.open(url)

    // Or download
    const a = document.createElement('a')
    a.href = url
    a.download = 'memory-book-interior.pdf'
    a.click()
  })
```

---

### Option 3: Direct Download Link

Once logged in, visit:
```
http://localhost:3000/api/memory-book/generate-preview?branchId=YOUR_BRANCH_ID
```

Browser will download the PDF immediately.

---

## 📊 What You'll See in the PDF

### Interior PDF Structure

**Page 1: Title Page**
- Firefly Grove logo (gold)
- Person's photo (if available)
- "In Loving Memory of" / "Memories of"
- Full name in large elegant font
- Birth/death dates
- Optional quote/subtitle

**Page 2: Obituary/Life Summary**
- Full name as heading
- Detailed dates and locations
- Life summary (from first long text memory)
- Relationship description

**Page 3+: Memory Pages**
- 2 memories per page
- Each memory shows:
  - Date/memory card title (gold accent)
  - Photo (if exists, left-aligned with text wrap)
  - Memory text
  - Author name (italics)
  - **QR code** (if audio exists) with "Scan to hear [name]'s voice"

**Final Page: Attribution**
- "This memory book was lovingly created with"
- FIREFLY GROVE (gold)
- fireflygrove.app
- "Every memory deserves a light"

### Cover PDF Structure

**Front Cover (Right Side)**
- Firefly Grove logo
- Person's photo (if available)
- "In Loving Memory of"
- Person's name (large, white)
- Birth-death years

**Spine (Center)**
- Person's name rotated 90°
- Gold text on dark background

**Back Cover (Left Side)**
- Firefly Grove branding
- "Every memory deserves a light"
- fireflygrove.app
- Memory count

---

## 🔍 Quality Checks

### What to Verify:

1. **Page Count**
   - Should be even number (books need even pages)
   - Logged in console: `pageCount: X`

2. **Image Quality**
   - Photos should be sharp (not pixelated)
   - If blurry: source images are too low-res (<1200px)

3. **QR Codes**
   - Should appear for memories with audio
   - Print test page and scan with phone
   - Should open: `https://fireflygrove.app/api/audio-playback/[entryId]`

4. **Typography**
   - All text should be readable
   - No overlapping text
   - Proper line spacing

5. **Layout**
   - Photos don't overflow margins
   - Text wraps correctly around images
   - Consistent spacing

6. **Cover Alignment**
   - Front/spine/back should be aligned
   - Spine width = `(pageCount / 444) × 0.002252 inches`

---

## 🐛 Common Issues & Fixes

### Issue: "Branch not found or access denied"
**Fix:** Make sure you're logged in and own the branch

### Issue: PDF is blank or has missing content
**Fix:** Check that branch has:
- Person data (name, dates)
- At least 1 approved memory
- Status = ACTIVE

### Issue: Images not showing
**Possible causes:**
- Image URL is invalid/expired
- Image host blocks server-side fetching
- Network timeout

**Fix:** Check console for "Failed to load photo" errors

### Issue: QR codes not working
**Check:**
1. Audio URL exists in database
2. Permanent URL format: `/api/audio-playback/[entryId]`
3. Scan QR with phone - should redirect correctly

### Issue: PDF too large (>20MB)
**Cause:** Too many high-res images
**Fix:**
- Optimize images before upload
- Reduce image resolution to 2400px max width

---

## 📏 Lulu Print Specifications

The PDFs are already formatted for Lulu Direct:

### Interior Specs
- **Size:** 6" × 9" (432 × 648 points)
- **Margins:** 0.5" (36 points) all sides
- **Content Area:** 5" × 8" (360 × 576 points)
- **Color Mode:** RGB (will convert to CMYK at print)
- **Fonts:** Embedded Helvetica family
- **DPI:** 72 DPI in PDF (scales to 300 DPI at print)

### Cover Specs
- **Size:** Calculated based on page count
- **Bleed:** 0.125" (9 points) all sides
- **Spine Width:** `(pageCount / 444) × 0.002252` inches
- **Total Width:** Front (6.25") + Spine + Back (6.25")
- **Height:** 9.25" (including bleed)

### Lulu POD Package IDs
When you have API access, use:
- **Hardcover:** `0600X0900FCSTDCW060UW444MXX`
- **Softcover:** `0600X0900FCSTDPB060UW444MNG`

---

## 🎨 Customization Options

### Change Colors
Edit `lib/memory-book-generator.ts`:

```typescript
// Line 11: Change Firefly Grove gold
.fillColor('#FFD966') // ← Change this hex code

// Line 567: Change cover background
.fill('#1a1a1a') // ← Dark elegant background
```

### Change Fonts
```typescript
// Lines 16-21: Font definitions
const FONTS = {
  title: 'Helvetica-Bold',        // ← Change to 'Times-Bold', etc
  heading: 'Helvetica-Bold',
  body: 'Helvetica',
  italic: 'Helvetica-Oblique',
}
```

**Note:** Only use standard PDF fonts or you'll need to embed custom fonts

### Change Memories Per Page
```typescript
// Line 394: Currently 2 memories per page
if (i === 0 || i % 2 === 0) {  // ← Change % 2 to % 3 for 3 per page
  doc.addPage()
}
```

### Adjust QR Code Size
```typescript
// Line 497: QR code dimensions
const qrSize = 60  // ← Increase for larger QR codes
```

---

## 💾 Export Test PDFs

### For Client Review
1. Generate PDFs via API
2. Download both interior + cover
3. Share via Google Drive/Dropbox
4. Get feedback on layout/design

### For Lulu Testing (Manual Upload)
1. Generate PDFs
2. Go to https://www.lulu.com/sell/sell-on-lulu
3. Create new book project
4. Upload interior PDF + cover PDF
5. Order test print (~$15-25)
6. Verify print quality

---

## 📞 Audio QR Code Testing

### Test Audio Playback URL

**1. Get Entry ID**
```sql
SELECT id, audioUrl FROM Entry WHERE audioUrl IS NOT NULL LIMIT 1;
```

**2. Build Permanent URL**
```
https://fireflygrove.app/api/audio-playback/[ENTRY_ID]
```

**3. Generate QR Code**
Use any QR generator:
- https://www.qr-code-generator.com/
- Input: Your permanent URL
- Download PNG

**4. Print & Scan**
- Print the QR code
- Scan with phone camera
- Should open audio playback page
- Audio should play in browser

---

## 🚀 Next Steps (When Lulu API Available)

Once you have Lulu credentials:

### 1. Add Environment Variables
```bash
LULU_CLIENT_ID="xxx"
LULU_CLIENT_SECRET="xxx"
LULU_API_URL="https://api.lulu.com"
LULU_SANDBOX_MODE="true"
```

### 2. Create Lulu Client
```typescript
// lib/lulu-client.ts (from implementation plan)
const luluClient = new LuluClient()
await luluClient.authenticate()
```

### 3. Upload PDFs
```typescript
const uploadedInterior = await luluClient.uploadFile(
  book.interiorPdf,
  'interior.pdf'
)
const uploadedCover = await luluClient.uploadFile(
  book.coverPdf,
  'cover.pdf'
)
```

### 4. Create Print Job
```typescript
const printJob = await luluClient.createPrintJob({
  line_items: [{
    title: 'Memory Book',
    cover: uploadedCover,
    interior: uploadedInterior,
    pod_package_id: '0600X0900FCSTDCW060UW444MXX',
    quantity: 1,
  }],
  shipping_address: shippingInfo,
})
```

---

## 📋 Testing Checklist

Before showing to users:

- [ ] Generate PDF for branch with 1 memory
- [ ] Generate PDF for branch with 50+ memories
- [ ] Test with photos only
- [ ] Test with text only
- [ ] Test with audio + QR codes
- [ ] Test with legacy tree (obituary layout)
- [ ] Test with living person (memories layout)
- [ ] Verify page count calculation
- [ ] Print test page, scan QR code
- [ ] Check all images load correctly
- [ ] Review typography (no overlaps)
- [ ] Verify cover aligns properly
- [ ] Test download speeds (<10 seconds for 100-page book)
- [ ] Check PDF file sizes (<10MB for interior)

---

## 💡 Pro Tips

### Fast Iteration
1. Keep browser DevTools open
2. Edit `lib/memory-book-generator.ts`
3. Restart Next.js dev server
4. Re-run generation in console
5. Instant PDF preview

### Debug Layout Issues
```typescript
// Add visual guides (in memory-book-generator.ts)
doc.rect(MARGIN, MARGIN, CONTENT_WIDTH, CONTENT_HEIGHT)
   .stroke('#FF0000') // Red border shows content area
```

### Optimize Image Loading
```typescript
// Add caching for images (if generating multiple times)
const imageCache = new Map()

async function downloadImage(url) {
  if (imageCache.has(url)) return imageCache.get(url)
  const buffer = await fetch(url).then(r => r.arrayBuffer())
  imageCache.set(url, buffer)
  return buffer
}
```

---

## 🎯 Success Metrics

Your PDF generation is successful when:

✅ **Visual Quality**
- Professional appearance
- Readable at 6×9 size
- Proper margins and spacing
- Images sharp and well-positioned

✅ **Technical Quality**
- File size <10MB
- Generates in <30 seconds
- All fonts embedded
- QR codes scannable

✅ **Content Quality**
- All memories included
- Photos display correctly
- Audio QR codes work
- Obituary layout appropriate

✅ **Print Quality** (once tested)
- Colors accurate
- Text crisp and readable
- Photos high-resolution
- Binding allows full page spread

---

**You can now generate and test memory book PDFs locally without waiting for Lulu API access!** 🎉

Once you test and approve the layout, getting Lulu credentials is the only blocker to going live.
