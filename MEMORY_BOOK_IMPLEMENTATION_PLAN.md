# Memory Book - Premium Physical Product Implementation Plan

## 🎯 Product Vision

**Premium Memorial & Legacy Books** - Transform digital memories into elegant, professionally printed keepsakes using Lulu Direct's print-on-demand API.

### Target Price Points
- **Base Memory Book (50-100 pages):** $149-199 (Lulu cost ~$40-60, 3x+ margin ✅)
- **Deluxe Memory Book (100-200 pages):** $249-299 (Lulu cost ~$70-90, 3x+ margin ✅)
- **Premium Legacy Collection (200+ pages):** $399-499 (Lulu cost ~$100-140, 3x+ margin ✅)

### Product Features
1. **Elegant Obituary First Page** - Professional memorial layout with photo, dates, life summary
2. **Memory Pages** - Text memories, photos, audio QR codes, organized chronologically or thematically
3. **Premium Cover Design** - Firefly Grove branded, customizable with name/photo
4. **QR Code Audio Integration** - Every audio memory gets a QR code linking to playback
5. **Professional Layout** - Template-based designs with consistent typography and spacing

---

## 📋 Implementation Phases

### Phase 1: Foundation & Dependencies (Week 1-2)
**Status:** Prerequisites before Lulu integration

#### 1.1 PDF Generation Library Setup
**Dependency:** Need robust PDF generation
**Options:**
- **PDFKit** (Node.js native) - Full control, complex layouts ⭐ RECOMMENDED
- **Puppeteer** (HTML to PDF) - Easier but slower, larger files
- **jsPDF** (Client-side) - Limited features

**Action Items:**
- [ ] Install PDFKit: `npm install pdfkit @types/pdfkit`
- [ ] Create `/lib/pdf-generator.ts` utility
- [ ] Test basic PDF generation with text + images

**Code Structure:**
```typescript
// lib/pdf-generator.ts
import PDFDocument from 'pdfkit'
import { createMemoryBookPDF } from './memory-book-generator'

export async function generateMemoryBookPDF(branchId: string) {
  // Fetch all memories for branch
  // Generate professional PDF layout
  // Return buffer for upload to Lulu
}
```

---

#### 1.2 QR Code Generation for Audio
**Dependency:** Audio memories → QR codes

**Action Items:**
- [ ] Install QR library: `npm install qrcode @types/qrcode`
- [ ] Create audio playback endpoint: `/api/audio-playback/[audioId]`
- [ ] Generate permanent audio URLs (not signed/expiring)
- [ ] Create QR code generator utility: `/lib/qr-generator.ts`

**Example:**
```typescript
// lib/qr-generator.ts
import QRCode from 'qrcode'

export async function generateAudioQRCode(audioUrl: string): Promise<Buffer> {
  // Generate QR code as PNG buffer
  return await QRCode.toBuffer(audioUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 200,
    margin: 2,
  })
}
```

**Database Addition Needed:**
```prisma
// Add to Entry model
model Entry {
  // ... existing fields
  audioPlaybackUrl String? // Permanent public URL for QR codes
}
```

---

#### 1.3 Image Optimization & Hosting
**Current Issue:** Images may be on Vercel Blob or external URLs
**Requirement:** Lulu needs high-res images (300 DPI minimum)

**Action Items:**
- [ ] Verify all images stored permanently (not temp URLs)
- [ ] Create image download/optimization utility
- [ ] Ensure images are at least 1200px wide for print quality
- [ ] Convert images to CMYK color space for print (optional but recommended)

**Code:**
```typescript
// lib/image-processor.ts
import sharp from 'sharp'

export async function optimizeForPrint(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()

  return await sharp(Buffer.from(buffer))
    .resize(2400, null, { withoutEnlargement: true }) // 8" @ 300 DPI
    .jpeg({ quality: 95 })
    .toBuffer()
}
```

---

#### 1.4 Cover Design System
**Requirement:** Elegant, branded covers with customization

**Action Items:**
- [ ] Design cover templates (front, spine, back)
- [ ] Create cover generator with overlays (name, photo)
- [ ] Follow Lulu cover specs (bleed, spine width calculation)

**Lulu Cover Requirements:**
- Trim size + bleed (0.125" each side)
- Spine width = (page count / 444) × 0.002252 inches
- Front: 6.125" × 9.25" (including bleed)
- Spine: calculated width
- Back: 6.125" × 9.25" (including bleed)

---

### Phase 2: Lulu API Integration (Week 3-4)

#### 2.1 Lulu Account Setup
**Prerequisites:**
- [ ] Create Lulu Direct account (https://www.lulu.com/sell)
- [ ] Get API credentials (Client ID + Secret)
- [ ] Add to `.env.local`:
```bash
LULU_CLIENT_ID="your_client_id"
LULU_CLIENT_SECRET="your_client_secret"
LULU_API_URL="https://api.lulu.com"
LULU_SANDBOX_MODE="true" # Start in sandbox
```

---

#### 2.2 Authentication Implementation
**Lulu uses OAuth 2.0**

**Action Items:**
- [ ] Create `/lib/lulu-client.ts`
- [ ] Implement OAuth token refresh
- [ ] Store token in memory/cache (expires after 24 hours)

**Code:**
```typescript
// lib/lulu-client.ts
export class LuluClient {
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  async authenticate() {
    const response = await fetch('https://api.lulu.com/auth/realms/glasstree/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.LULU_CLIENT_ID!,
        client_secret: process.env.LULU_CLIENT_SECRET!,
      }),
    })

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000)
  }

  async getToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate()
    }
    return this.accessToken!
  }
}
```

---

#### 2.3 Product Specification
**Lulu Book Specs:**
- **Trim Size:** 6" × 9" (standard memoir/biography)
- **Cover:** Premium Casewrap Hardcover OR Perfect Bound Softcover
- **Paper:** 60# White OR 70# Cream
- **Binding:** Perfect Bound (softcover) or Case Wrap (hardcover)
- **Color:** Full Color Interior

**Lulu POD ID Examples:**
- `0600X0900BWSTDPB060UW444MNG` = 6×9, B&W, Standard, Perfect Bound, 60# White
- `0600X0900FCSTDCW060UW444MXX` = 6×9, Full Color, Casewrap Hardcover, 60# White

**Action:**
- [ ] Test sandbox orders to determine exact POD ID needed
- [ ] Store product configurations in database

---

#### 2.4 Print Job Creation API
**Endpoint:** `POST /print-jobs/`

**Action Items:**
- [ ] Create `/api/memory-book/create-print-job` route
- [ ] Upload PDF to Lulu's servers
- [ ] Create print job with shipping details

**Code:**
```typescript
// app/api/memory-book/create-print-job/route.ts
export async function POST(req: Request) {
  const { branchId, userId, shippingAddress } = await req.json()

  // 1. Generate PDF
  const pdfBuffer = await generateMemoryBookPDF(branchId)

  // 2. Upload to Lulu
  const luluClient = new LuluClient()
  const uploadUrl = await luluClient.uploadFile(pdfBuffer, 'memory-book.pdf')

  // 3. Create print job
  const printJob = await luluClient.createPrintJob({
    line_items: [{
      title: 'Memory Book',
      cover: uploadUrl + '-cover.pdf',
      interior: uploadUrl + '-interior.pdf',
      pod_package_id: '0600X0900FCSTDCW060UW444MXX', // Hardcover
      quantity: 1,
    }],
    shipping_address: shippingAddress,
    contact_email: user.email,
  })

  // 4. Save order to database
  await prisma.memoryBookOrder.create({
    data: {
      userId,
      branchId,
      luluPrintJobId: printJob.id,
      status: 'PENDING',
      totalCost: printJob.total_cost_excl_tax,
    },
  })

  return NextResponse.json({ success: true, printJobId: printJob.id })
}
```

---

#### 2.5 Pricing Calculation API
**Endpoint:** `POST /print-job-cost-calculations/`

**Action Items:**
- [ ] Create `/api/memory-book/calculate-cost` route
- [ ] Get real-time Lulu pricing
- [ ] Add 3x markup + shipping

**Code:**
```typescript
export async function calculateMemoryBookCost(pageCount: number) {
  const luluClient = new LuluClient()

  const costCalc = await luluClient.calculateCost({
    line_items: [{
      page_count: pageCount,
      pod_package_id: '0600X0900FCSTDCW060UW444MXX',
      quantity: 1,
    }],
    shipping_level: 'MAIL',
    shipping_address: { country_code: 'US' }, // Estimate
  })

  const luluCost = costCalc.total_cost_excl_tax
  const ourPrice = Math.ceil(luluCost * 3.5) // 3.5x markup, rounded up
  const shippingEstimate = costCalc.shipping_cost?.total_cost_excl_tax || 0

  return {
    luluCost,        // $45
    ourPrice,        // $158
    shipping: shippingEstimate, // $8
    totalPrice: ourPrice + shippingEstimate, // $166
    margin: ourPrice - luluCost, // $113
    marginPercent: ((ourPrice - luluCost) / ourPrice * 100).toFixed(0), // 71%
  }
}
```

---

#### 2.6 Webhook Setup for Order Tracking
**Endpoint:** `POST /webhooks/` (Lulu sends updates here)

**Action Items:**
- [ ] Create `/api/webhooks/lulu` endpoint
- [ ] Register webhook URL with Lulu
- [ ] Handle events: `print_job.created`, `print_job.in_production`, `print_job.shipped`, `print_job.delivered`

**Code:**
```typescript
// app/api/webhooks/lulu/route.ts
export async function POST(req: Request) {
  const event = await req.json()

  // Verify webhook signature (Lulu provides HMAC)
  const signature = req.headers.get('X-Lulu-Signature')
  if (!verifyLuluSignature(event, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Handle event
  switch (event.event_type) {
    case 'print_job.in_production':
      await prisma.memoryBookOrder.update({
        where: { luluPrintJobId: event.print_job.id },
        data: { status: 'PRINTING' },
      })
      // Send email to user
      break

    case 'print_job.shipped':
      await prisma.memoryBookOrder.update({
        where: { luluPrintJobId: event.print_job.id },
        data: {
          status: 'SHIPPED',
          trackingNumber: event.tracking_number,
        },
      })
      // Send tracking email
      break

    case 'print_job.delivered':
      await prisma.memoryBookOrder.update({
        where: { luluPrintJobId: event.print_job.id },
        data: { status: 'DELIVERED' },
      })
      break
  }

  return NextResponse.json({ success: true })
}
```

---

### Phase 3: Database Schema (Week 3)

**Add to Prisma Schema:**

```prisma
model MemoryBookOrder {
  id                String   @id @default(cuid())
  userId            String
  branchId          String

  // Lulu Integration
  luluPrintJobId    String   @unique
  luluLineItemId    String?

  // Order Details
  status            String   @default("PENDING") // PENDING, PAYMENT_RECEIVED, PRINTING, SHIPPED, DELIVERED, CANCELLED, FAILED
  pageCount         Int
  coverType         String   // HARDCOVER, SOFTCOVER
  bookTitle         String

  // Pricing
  luluCost          Float    // What we pay Lulu
  ourPrice          Float    // What customer pays us
  shippingCost      Float
  totalPrice        Float    // ourPrice + shippingCost

  // Shipping
  shippingName      String
  shippingAddress1  String
  shippingAddress2  String?
  shippingCity      String
  shippingState     String
  shippingZip       String
  shippingCountry   String   @default("US")
  trackingNumber    String?

  // PDF Storage
  pdfUrl            String?  // Store generated PDF for re-orders
  coverPdfUrl       String?

  // Timestamps
  createdAt         DateTime @default(now())
  paidAt            DateTime?
  shippedAt         DateTime?
  deliveredAt       DateTime?

  // Relations
  user              User     @relation(fields: [userId], references: [id])
  branch            Branch   @relation(fields: [branchId], references: [id])

  @@index([userId])
  @@index([branchId])
  @@index([status])
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_memory_book_orders
```

---

### Phase 4: Frontend UI (Week 4-5)

#### 4.1 Memory Book Designer Page
**Route:** `/memory-book/create/[branchId]`

**Features:**
- Preview of book layout
- Page count calculator
- Cover customization
- Price display (live updates based on page count)
- Shipping address form
- Stripe payment integration

**UI Flow:**
1. Select branch to create book from
2. Choose memories to include (or include all)
3. Select cover type (hardcover vs softcover)
4. Customize cover (title, subtitle, photo)
5. Preview first 5 pages
6. Review pricing breakdown
7. Enter shipping address
8. Pay via Stripe
9. Order confirmation

---

#### 4.2 Order Status Page
**Route:** `/memory-book/orders`

**Features:**
- List all memory book orders
- Status badges (Pending, Printing, Shipped, Delivered)
- Tracking numbers (when shipped)
- Download PDF copy (for backup)
- Re-order button

---

### Phase 5: Payment Integration (Week 5)

**Stripe Checkout Session:**

```typescript
// app/api/memory-book/checkout/route.ts
export async function POST(req: Request) {
  const { branchId, shippingAddress, coverType } = await req.json()

  // Calculate pricing
  const pricing = await calculateMemoryBookCost(pageCount)

  // Create Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Memory Book - ${branch.title}`,
          description: `${pageCount} page premium ${coverType} memory book`,
          images: [coverImageUrl],
        },
        unit_amount: pricing.totalPrice * 100, // $199.00 → 19900
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/memory-book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/memory-book/create/${branchId}`,
    metadata: {
      branchId,
      userId: session.user.id,
      coverType,
      shippingAddress: JSON.stringify(shippingAddress),
    },
  })

  return NextResponse.json({ sessionId: session.id })
}
```

**Webhook Handler (Stripe):**
```typescript
// app/api/webhooks/stripe/route.ts - ADD TO EXISTING
case 'checkout.session.completed':
  if (session.metadata.type === 'memory_book') {
    // Payment successful - create Lulu print job
    await createMemoryBookPrintJob(session.metadata)
  }
  break
```

---

## 🚧 Obstacles & Dependencies

### Critical Blockers

#### 1. **Lulu API Access** 🔴 REQUIRED FIRST
**Issue:** Need approved Lulu Direct account
**Action:**
- Sign up at https://www.lulu.com/sell
- Get approved for API access (can take 1-3 business days)
- Request sandbox environment credentials

**Without this:** Cannot proceed to Phase 2

---

#### 2. **High-Resolution Image Storage** 🟡 IMPORTANT
**Current State:** Unknown if images are stored at print quality (300 DPI)
**Requirement:** 2400px minimum width for 8" @ 300 DPI
**Risk:** Blurry/pixelated photos in printed book

**Action:**
- Audit current image upload sizes
- Add image quality validation on upload
- May need to re-upload existing images at higher resolution

---

#### 3. **Permanent Audio URLs** 🟡 IMPORTANT
**Current State:** Audio stored on Vercel Blob (likely signed URLs that expire)
**Requirement:** QR codes need permanent, public URLs

**Solutions:**
1. **Option A:** Make Vercel Blob URLs public (if possible)
2. **Option B:** Create permanent playback endpoint `/audio/[id]` that proxies to Blob
3. **Option C:** Move audio to public S3 bucket with permanent URLs

**Recommendation:** Option B (proxy endpoint) - most secure, maintains access control

---

#### 4. **PDF Generation Complexity** 🟡 MODERATE
**Challenge:** Professional book layout is complex
**Skills Needed:** Typography, page layout, print design

**Mitigation:**
- Start with simple template
- Hire freelance book designer for initial template ($500-1000)
- Use PDFKit or Puppeteer (both have learning curves)

---

#### 5. **Lulu File Format Requirements** 🟡 MODERATE
**Requirements:**
- PDF/X-1a:2001 or PDF/X-3:2002 compliant
- CMYK color mode (not RGB)
- Fonts embedded
- Proper bleed and trim marks

**Risk:** PDF generated by Node.js may not meet print standards

**Mitigation:**
- Use PDFKit with proper settings
- Test sample order in Lulu sandbox
- Budget for test prints ($50-100)

---

### Technical Dependencies

#### Required NPM Packages
```json
{
  "dependencies": {
    "pdfkit": "^0.15.0",           // PDF generation
    "@types/pdfkit": "^0.13.5",
    "qrcode": "^1.5.4",             // QR codes for audio
    "@types/qrcode": "^1.5.5",
    "sharp": "^0.33.5",             // Image processing
    "archiver": "^7.0.1"            // Already installed (for ZIP)
  }
}
```

#### Environment Variables Needed
```bash
# Add to .env.local
LULU_CLIENT_ID="xxx"
LULU_CLIENT_SECRET="xxx"
LULU_API_URL="https://api.lulu.com"
LULU_SANDBOX_MODE="true"
LULU_WEBHOOK_SECRET="xxx"  # For signature verification
```

---

## 📊 Success Metrics

### Launch Targets (First 90 Days)

1. **Orders:** 10-20 memory books sold
2. **Revenue:** $2,000-4,000 total
3. **Margin:** 65-75% gross margin
4. **Quality:** 4.5+ star average rating
5. **Production Time:** 10-14 days average (Lulu: 3-5 days + shipping)

### Pricing Strategy

| Product | Pages | Lulu Cost | Our Price | Margin |
|---------|-------|-----------|-----------|--------|
| **Standard** | 50-75 | $35-45 | $149 | $104-114 (70-76%) |
| **Deluxe** | 100-150 | $55-75 | $249 | $174-194 (70-78%) |
| **Premium** | 200+ | $95-130 | $399 | $269-304 (67-76%) |

**Shipping:** Pass through at cost (~$8-15 USPS) OR include in base price

---

## 🎨 Design Specifications

### Cover Design (Front)
```
┌──────────────────────────────────┐
│                                  │
│   [Firefly Grove Logo - Gold]   │ ← Firefly glow branding
│                                  │
│        [Optional Photo]          │ ← Person's photo
│                                  │
│      In Loving Memory of         │
│     [PERSON NAME - Large]        │ ← Elegant serif font
│                                  │
│    [Birth Date] - [End Date]     │
│                                  │
│    [Optional Quote/Subtitle]     │
│                                  │
└──────────────────────────────────┘
```

**Typography:**
- Title: Playfair Display or Cormorant (elegant serif)
- Body: Lora or Crimson Text (readable serif)
- Accent: Firefly Grove gold (#FFD966)

---

### Interior Page Layouts

#### Page 1: Obituary/Life Summary
```
┌──────────────────────────────────┐
│  [Large portrait photo]          │
│                                  │
│  [Full Name]                     │
│  [Birth Date - End Date]         │
│  [Birth Location - End Location] │
│                                  │
│  [Life summary paragraph - 3-5   │
│   sentences capturing essence]   │
│                                  │
│  "Beloved [roles: mother,        │
│   grandmother, friend...]"       │
└──────────────────────────────────┘
```

#### Standard Memory Page Layout
```
┌──────────────────────────────────┐
│  [Date/Memory Card Title] ────┐  │
│                               │  │
│  ┌─────────────┐              │  │
│  │   Photo     │  [Memory     │  │
│  │  (if any)   │   text       │  │
│  │             │   wraps      │  │
│  └─────────────┘   around]    │  │
│                               │  │
│  [Author name]                │  │
│  ──────────────────────────────  │
│                                  │
│  [QR Code]  "Scan to hear        │
│             [Author]'s voice"    │ ← If audio exists
└──────────────────────────────────┘
```

---

## 🚀 Go-Live Checklist

### Pre-Launch (Before accepting first order)
- [ ] Lulu account approved and API credentials obtained
- [ ] Test print job completed in sandbox successfully
- [ ] Order 1 physical sample book to verify quality
- [ ] Database schema deployed to production
- [ ] Stripe webhook configured for memory book payments
- [ ] Lulu webhook endpoint live and tested
- [ ] PDF generation tested with real branch data
- [ ] QR codes tested and scanning correctly
- [ ] Cover design finalized and approved
- [ ] Pricing confirmed with 3x+ margin
- [ ] Shipping cost calculations accurate
- [ ] Legal review of product disclaimers (production time, shipping delays)
- [ ] Customer support docs written (FAQ, troubleshooting)
- [ ] Analytics tracking added for funnel (view → customize → checkout → order)

### Launch Day
- [ ] Feature flag enabled for beta users first
- [ ] Blog post announcing Memory Books
- [ ] Email to beta testers with promo code
- [ ] Social media posts with example pages
- [ ] Monitor error logs closely
- [ ] Customer support ready for questions

---

## 💡 Marketing Strategy

### Launch Messaging
**Headline:** "Transform Digital Memories into an Heirloom Book"

**Value Props:**
1. Premium quality hardcover book
2. Includes QR codes to hear their voice
3. Professional obituary-style tribute
4. Ships in 2 weeks
5. Keepsake that lasts generations

### Target Customers
1. **Post-funeral families** - Want physical memorial
2. **Anniversary tributes** - 1 year remembrance
3. **Living tributes** - Create while person is alive
4. **Estate planning** - Legacy gift for heirs

### Pricing Psychology
- Start at $149 (premium but accessible)
- Offer "Preview First 10 Pages Free" PDF
- Bundle discount: Buy 3 copies, save 15%
- Rush production (+$49 for 1-week turnaround)

---

## 📅 Timeline Summary

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1-2 | Foundation | PDF generator, QR codes, image optimization |
| 3 | Lulu Setup | API credentials, authentication, test orders |
| 4 | Integration | Print job creation, webhooks, database |
| 5 | Frontend | Designer UI, checkout flow, order tracking |
| 6 | Testing | Sample orders, QA, bug fixes |
| 7 | Launch Prep | Docs, marketing, support setup |
| 8 | **LAUNCH** | Beta release to 20 users |

**Target Launch Date:** 8 weeks from Phase 1 start

---

## 🎯 Next Immediate Actions

### This Week
1. **Get Lulu Access** ← START HERE
   - Create account at https://www.lulu.com/sell
   - Apply for API access
   - Request sandbox credentials

2. **Install Dependencies**
   ```bash
   npm install pdfkit @types/pdfkit qrcode @types/qrcode sharp
   ```

3. **Create Test PDF**
   - Build basic PDF generator
   - Test with sample branch data
   - Verify image quality

4. **Design Cover Template**
   - Hire freelancer OR use Canva template
   - Export as high-res PDF
   - Test with Lulu specs

### Next Week
5. **Implement QR Codes**
   - Create `/api/audio-playback/[id]` endpoint
   - Generate test QR codes
   - Verify scanning works

6. **Database Schema**
   - Add `MemoryBookOrder` model
   - Run migration
   - Create seed data for testing

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Lulu API access denied | 🔴 Critical | Low | Apply ASAP, have backup (Blurb, BookBaby) |
| Poor print quality | 🔴 Critical | Medium | Order test samples, iterate design |
| PDF generation bugs | 🟡 High | High | Start simple, test early, test often |
| Complex page layouts | 🟡 High | Medium | Hire designer, use templates |
| Shipping delays | 🟡 Medium | Medium | Set expectations (14-21 days) |
| Low order volume | 🟢 Low | High | Start with beta users, iterate based on feedback |

---

## 💰 Financial Projections

### Year 1 (Conservative)
- **Orders:** 100 books
- **Avg Price:** $199
- **Revenue:** $19,900
- **COGS (Lulu):** $6,000 (30%)
- **Gross Profit:** $13,900 (70%)
- **Net Profit:** ~$10,000 (after payment fees, support)

### Year 2 (Growth)
- **Orders:** 500 books
- **Revenue:** $99,500
- **Gross Profit:** $69,650
- **Net Profit:** ~$55,000

**This becomes a meaningful revenue stream** 🎯

---

## 📚 Resources

### Lulu Documentation
- Main API Docs: https://api.lulu.com/docs/
- Getting Started: https://developers.lulu.com/getting-started
- Print Job API: https://api.lulu.com/docs/#tag/Print-Jobs
- File Specs: https://www.lulu.com/sell/file-creation-guide

### Design Resources
- Book Layout Templates: Canva Pro, Adobe InDesign
- Free Fonts: Google Fonts (Playfair Display, Lora, Crimson Text)
- QR Code Testing: https://www.qr-code-generator.com/

### Competitor Analysis
- **Mixbook:** $40-120 (lower quality, consumer-focused)
- **Shutterfly:** $30-80 (mass market)
- **Artifact Uprising:** $60-200 (premium positioning) ← CLOSEST COMP
- **Chatbooks:** $20-40 (budget)

**Our Positioning:** Premium memorial books with unique QR audio integration

---

## ✅ Success Criteria

This project is successful when:
1. ✅ First memory book ships with 5-star quality
2. ✅ Gross margin ≥ 65%
3. ✅ Production + shipping ≤ 14 days average
4. ✅ 10 orders in first 60 days
5. ✅ NPS score ≥ 9 (would recommend to friend grieving loss)

---

**Document Version:** 1.0
**Created:** 2025-10-31
**Owner:** Firefly Grove Product Team
**Status:** READY TO BUILD 🚀
