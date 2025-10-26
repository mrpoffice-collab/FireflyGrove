# Greeting Card Hub - Complete Implementation Plan

## 🎯 Project Overview
Build a complete greeting card system with both digital and physical delivery options, integrated with Firefly Grove memories.

**Timeline:** 4-6 weeks (chunked into 9 phases)
**Revenue Potential:** $0.99-$9.99 per card + subscription option

---

## 📋 Implementation Phases

### **Phase 1: Database Schema** (Day 1-2)
**Goal:** Set up all database tables needed for cards

**Tables to Create:**
1. **CardTemplate**
   - id, name, category, htmlTemplate, cssStyles
   - previewImage, isActive, price (digital/physical)
   - firefly theme assets

2. **CardOrder**
   - id, userId, templateId, deliveryType (digital/physical)
   - recipientEmail/recipientAddress
   - customMessage, selectedPhotos (JSON array)
   - status, createdAt, deliveredAt

3. **CardCategory**
   - id, name, icon, description
   - displayOrder, isActive

4. **CardDelivery**
   - id, orderId, deliveryType, status
   - trackingId (for physical), openedAt (for digital)
   - lobMailId (if using Lob.com)

**Deliverable:** Prisma schema updated, migration run

---

### **Phase 2: Card Template System** (Day 3-5)
**Goal:** Build the card designer interface

**Components to Build:**
1. `/app/cards/create/page.tsx` - Main card creation flow
2. `/components/CardDesigner.tsx` - Visual editor
3. `/components/CardPreview.tsx` - Live preview
4. `/components/CardCategoryPicker.tsx` - Category selection

**Features:**
- Choose category (Sympathy, Birthday, Holiday, etc.)
- Select template from category
- Add custom message (textarea)
- Live preview of card
- Toggle between digital/physical view

**Deliverable:** Working card designer UI (no save yet)

---

### **Phase 3: Grove Photo Integration** (Day 6-7)
**Goal:** Let users pull photos from their grove into cards

**Components:**
1. `/components/GrovePhotoPicker.tsx` - Photo selector
2. API endpoint: `/api/cards/grove-photos` - Fetch user's branch photos

**Features:**
- Browse photos from user's branches
- Multi-select (up to 3 photos per card)
- Drag to reorder
- Preview how photos appear in card

**Deliverable:** Photo picker integrated into card designer

---

### **Phase 4: Payment Processing** (Day 8-10)
**Goal:** Stripe integration for both card types

**Pricing:**
- Digital: $0.99, $1.99, $2.99 (based on template)
- Physical: $4.99, $6.99, $9.99 (includes postage)

**API Endpoints:**
1. `/api/cards/checkout` - Create Stripe checkout session
2. `/api/cards/webhook` - Handle payment confirmation

**Features:**
- Calculate price based on template + delivery type
- Stripe Checkout for payment
- Handle successful payment → create order
- Handle failed payment → show error

**Deliverable:** Full payment flow working

---

### **Phase 5: Digital Delivery** (Day 11-13)
**Goal:** Send beautiful cards via email/link

**API Endpoints:**
1. `/api/cards/send-digital` - Send email with card
2. `/api/cards/view/[code]` - Public card view page

**Features:**
- Generate unique shareable link
- Send email with card preview + link
- Beautiful HTML email template
- Track when link is opened
- Animated firefly effects on view page
- Option to schedule send date

**Email Template:**
```
Subject: You have a card from [Sender]

[Beautiful preview image]
[Sender Name] sent you a heartfelt card.
[View Your Card Button] → /cards/view/[uniqueCode]
```

**Deliverable:** Working digital card delivery

---

### **Phase 6: Physical Printing** (Day 14-17)
**Goal:** Integrate with Lob.com for printing & mailing

**Setup:**
1. Sign up for Lob.com account
2. Get API keys
3. Test card specs (4x6 postcard or 5x7 folded card)

**API Endpoints:**
1. `/api/cards/print` - Submit to Lob for printing
2. `/api/cards/webhook-lob` - Receive Lob tracking updates

**Features:**
- Convert card design to Lob-compatible format
- Validate mailing address
- Submit print job to Lob
- Receive tracking ID
- Update order status when mailed
- Store delivery confirmation

**Lob.com Details:**
- Cost: ~$2-3 per card (we charge $4.99-$9.99)
- Turnaround: 1-3 days to print, 3-5 days to deliver
- Tracking: USPS tracking included

**Deliverable:** Working physical card printing & mailing

---

### **Phase 7: Order Management** (Day 18-20)
**Goal:** Dashboard to view and manage card orders

**Pages:**
1. `/app/cards/orders/page.tsx` - Order history
2. `/app/cards/orders/[id]/page.tsx` - Order details

**Features:**
- View all sent cards
- Track delivery status
- Resend digital cards
- Download receipts
- Cancel pending orders (if not yet sent)
- Filter by status, date, category

**Deliverable:** Order management dashboard

---

### **Phase 8: Card Templates** (Day 21-25)
**Goal:** Design 3-5 templates for each of 8 categories

**Categories & Templates:**

**1. Sympathy/Condolence 🕯️**
- "In Loving Memory" - soft firefly silhouette
- "Thinking of You" - gentle twilight scene
- "With Deepest Sympathy" - single glowing firefly

**2. Birthday 🎂**
- "Celebrate Your Light" - fireflies forming balloons
- "Another Year Brighter" - firefly cake candles
- "Happy Birthday" - festive firefly dance

**3. Christmas/Holiday 🎄**
- "Season's Glow" - fireflies on winter branches
- "Holiday Lights" - firefly garland
- "Warm Wishes" - cozy firefly scene

**4. Thank You 💐**
- "Grateful for You" - fireflies in flowers
- "Thanks for Everything" - simple elegant
- "You're Appreciated" - firefly heart

**5. Thinking of You 💭**
- "Sending Light Your Way" - single firefly path
- "You're in My Thoughts" - soft glow
- "Missing You" - distant fireflies

**6. Anniversary 💒**
- "Love Still Glows" - two fireflies dancing
- "Celebrating Us" - intertwined light trails
- "Forever Bright" - eternal flame motif

**7. New Baby 🌱**
- "Welcome Little Light" - tiny firefly
- "A New Glow" - firefly family
- "Precious Arrival" - gentle nursery scene

**8. Graduation 🎓**
- "Shine Bright Graduate" - upward firefly path
- "Your Future Glows" - horizon with fireflies
- "Congratulations" - celebratory burst

**Design Specs:**
- 5x7 inches (folded card) or 4x6 (postcard)
- Firefly brand colors (dark bg, golden glow)
- Space for 1-3 photos
- Custom message area
- Firefly Grove subtle branding

**Deliverable:** 24-40 beautiful card templates

---

### **Phase 9: Final Integration** (Day 26-28)
**Goal:** Add to menu, polish, and test everything

**Tasks:**
1. Add "💌 Greeting Cards" to Grove Exchange menu
2. Update `/app/grove-exchange/page.tsx` with live card
3. Create `/app/cards/page.tsx` - Landing page
4. End-to-end testing:
   - Create digital card → Pay → Receive email
   - Create physical card → Pay → Lob submission
   - Track order status
   - Resend digital card
5. Polish UI/UX
6. Add help documentation
7. Beta user testing

**Deliverable:** Production-ready Greeting Card Hub

---

## 🗂️ File Structure

```
app/
  cards/
    page.tsx                    # Landing page
    create/page.tsx            # Card designer
    orders/
      page.tsx                 # Order history
      [id]/page.tsx           # Order details
    view/[code]/page.tsx       # Public card view (digital)
  api/
    cards/
      checkout/route.ts        # Payment
      send-digital/route.ts    # Email delivery
      print/route.ts           # Lob integration
      grove-photos/route.ts    # Fetch branch photos
      webhook/route.ts         # Stripe webhooks
      webhook-lob/route.ts     # Lob webhooks
      orders/route.ts          # Order CRUD

components/
  CardDesigner.tsx             # Main designer
  CardPreview.tsx              # Live preview
  CardCategoryPicker.tsx       # Category selector
  CardTemplatePicker.tsx       # Template gallery
  GrovePhotoPicker.tsx         # Photo selector from grove
  CardMessageEditor.tsx        # Custom message input

lib/
  cards/
    templates.ts               # Template definitions
    renderer.ts                # HTML/CSS generation
    emailTemplates.ts          # Email HTML templates
  lob.ts                       # Lob.com client
  cardUtils.ts                 # Helper functions

prisma/
  schema.prisma                # Updated with card tables
```

---

## 💰 Revenue Model

**Pricing:**
- Digital: $0.99 - $2.99
- Physical: $4.99 - $9.99

**Costs:**
- Digital: ~$0 (just email/hosting)
- Physical: ~$2-3 (Lob.com printing + postage)

**Margins:**
- Digital: 95%+ profit
- Physical: 40-70% profit

**Potential:**
- 100 users × 3 cards/year × $3 avg = $900/year
- 1,000 users × 3 cards/year × $3 avg = $9,000/year

**Subscription Option (Phase 10):**
- $9.99/month = unlimited digital + 5 physical/month
- Target: Frequent senders (birthdays, sympathy, holidays)

---

## ✅ Success Criteria

Before marking as "complete":
- [ ] All 8 categories have templates
- [ ] Digital delivery works end-to-end
- [ ] Physical printing via Lob works
- [ ] Payment processing tested
- [ ] Order tracking functional
- [ ] Grove photo integration working
- [ ] Beta users send 10+ successful cards
- [ ] Added to navigation menu
- [ ] Documentation complete

---

## 🚀 Next Steps

1. Start with Phase 1 (Database Schema)
2. Work through each phase sequentially
3. Test after each phase before moving on
4. Deploy to production after Phase 9
5. Gather beta feedback
6. Iterate based on user needs

Ready to start with **Phase 1: Database Schema**?
