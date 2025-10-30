# Firefly Grove - User Journey & Navigation Tracks

## Overview
This document outlines the primary user journeys and decision tracks available in Firefly Grove, a digital legacy and family memory preservation platform.

---

## 1. New User Journey

### Entry Points
- **Landing Page** → Sign Up
- **Beta Invite Email** → Direct Sign Up Link
- **Social Share Link** → View Public Memorial → Sign Up

### Initial Authentication
```
/ (Landing)
  ├→ /auth/signin (Sign In)
  ├→ /auth/signup (Sign Up)
  └→ /auth/reset-password (Forgot Password)
```

### First-Time Setup
```
Sign Up Success
  └→ /grove (Your Grove - Empty State)
      └→ Create Your First Branch
          ├→ Memorial Branch (for deceased loved one)
          └→ Living Branch (for living family member)
```

---

## 2. Core User Tracks

### Track A: Memorial Creator (Primary Use Case)
**Goal**: Create and manage a memorial for a deceased loved one

```
/grove
  └→ "Create New Branch"
      └→ Select: "Memorial Branch"
          └→ /branch/create
              ├→ Enter person details (name, dates, relationship)
              ├→ Choose privacy: Private or Open Grove (public)
              ├→ Set memory limit (optional)
              └→ CREATE
                  └→ /branch/[branchId]
                      ├→ Add First Memory
                      │   ├→ Text memory
                      │   ├→ Photo memory
                      │   ├→ Audio memory
                      │   └→ Facebook/Instagram import
                      │
                      ├→ Invite Contributors
                      │   └→ Share branch link with family
                      │
                      ├→ Share Branch
                      │   ├→ Facebook
                      │   ├→ Twitter/X
                      │   ├→ WhatsApp
                      │   └→ Email
                      │
                      └→ Legacy Planning
                          └→ /branch/[branchId]/heirs
                              ├→ Add heirs (email addresses)
                              ├→ Set trustees (optional)
                              └→ Schedule transfer (on inactivity)
```

**Ongoing Activities**:
- View and manage memories
- Respond to others' memories (comments)
- Edit branch settings
- Monitor memory limit
- Share individual memories

---

### Track B: Living Branch Creator
**Goal**: Create a living memory collection for family member still alive

```
/grove
  └→ "Create New Branch"
      └→ Select: "Living Branch"
          └→ /branch/create
              ├→ Enter person details (name, birth date, relationship)
              ├→ Privacy: Always private (no Open Grove for living)
              └→ CREATE
                  └→ /branch/[branchId]
                      ├→ Add memories (same as memorial)
                      ├→ Invite contributors
                      └→ Share privately with family
```

**Key Difference**: No Open Grove option, no death date, focus on celebrating life.

---

### Track C: Memory Contributor
**Goal**: Add memories to someone else's branch

```
Receive Invitation Link
  └→ /branch/[branchId] (if signed in)
      OR
  └→ /auth/signin → /branch/[branchId]

      └→ View Branch
          └→ "Add Memory" button
              ├→ Write text memory
              ├→ Upload photo
              ├→ Record/upload audio
              └→ Import from social media

          └→ Interact with Memories
              ├→ Read others' memories
              ├→ Share individual memories
              └→ View memory timeline
```

---

### Track D: Open Grove Visitor (Public Discovery)
**Goal**: Explore public memorials, discover stories

```
/open-grove (Landing)
  ├→ Featured Memorial
  ├→ Search by Name
  └→ "View All Memorials"

      └→ /open-grove/memorials
          ├→ Search & Filter
          │   ├→ Sort: First Name (A-Z)
          │   ├→ Sort: Last Name (A-Z)
          │   └→ Sort: Most Recent
          │
          └→ Click Memorial
              └→ /branch/[branchId] (Public View)
                  ├→ Read memories
                  ├→ Share memorial
                  └→ Sign Up to Add Memory (if interested)
```

---

### Track E: Heir/Trustee (Legacy Management)
**Goal**: Manage inherited branches or act as trustee

```
Receive Transfer Email (automated)
  └→ "Accept Branch Transfer" link
      └→ /auth/signin (if not signed in)
          └→ Transfer Accepted
              └→ /grove (now shows inherited branch)

                  └→ /branch/[branchId]
                      ├→ Full ownership access
                      ├→ Continue adding memories
                      ├→ Manage contributors
                      ├→ Update legacy plan
                      └→ Export memories (PDF/ZIP)
```

**Trustee Path**:
```
User Inactive (missed check-ins)
  └→ Trustee receives notification
      └→ /branch/[branchId]/heirs
          └→ "Initiate Transfer" button
              └→ Confirms transfer to heirs
```

---

### Track F: Admin User
**Goal**: Manage platform, send invites, monitor system

```
/grove (with admin badge)
  └→ Admin Dropdown Menu
      ├→ /admin/beta-invites
      │   ├→ Send beta invite emails
      │   ├→ Add custom message
      │   └→ Track invites sent
      │
      ├→ /admin/fix-open-grove (if issues arise)
      │   └→ Fix missing branches
      │
      └→ View all user branches (admin access)
```

---

## 3. Subscription Tracks

### Free Tier User
```
/grove
  └→ Create up to 3 branches
  └→ 50 memories per branch
  └→ Basic features
  └→ "Upgrade" prompt when limits reached
      └→ /billing
```

### Premium User Journey
```
/billing
  ├→ View Current Plan
  ├→ "Upgrade to Premium" ($4.99/month)
  │   └→ Stripe Checkout
  │       └→ Payment Success
  │           └→ /grove (unlimited branches/memories)
  │
  ├→ Manage Subscription
  │   ├→ Cancel subscription
  │   └→ Update payment method
  │
  └→ View Usage Stats
      ├→ Branches created
      ├→ Memories added
      └→ Storage used
```

---

## 4. Secondary Navigation Paths

### Account Management
```
Header Dropdown (any page)
  ├→ /profile (Account Settings)
  │   ├→ Update name/email
  │   ├→ Change password
  │   ├→ Manage notifications
  │   └→ Delete account
  │
  ├→ /billing (Subscription)
  ├→ /feedback (Report Issue)
  └→ Sign Out
```

### Help & Information
```
Footer (any page)
  ├→ /privacy (Privacy Policy)
  ├→ /terms (Terms of Service)
  ├→ /feedback (Report Bug/Feature Request)
  └→ /open-grove (Explore Memorials)
```

### Social Sharing Paths
```
Any Branch or Memory
  └→ Share Button
      └→ Share Panel (slides from left)
          ├→ Native Share (mobile)
          ├→ Facebook
          ├→ Twitter/X
          ├→ WhatsApp
          ├→ Email
          └→ Copy Link
```

---

## 5. Automated System Journeys

### Subscription Lifecycle
```
User Subscribes
  └→ Confirmation email
  └→ Monthly renewal
      ├→ Success → Continue service
      └→ Failed → Payment reminder emails
          └→ Grace period (7 days)
              └→ Downgrade to free tier
```

### Legacy Transfer Automation
```
User Creates Branch + Adds Heirs
  └→ Monthly check-in emails
      ├→ User responds → Reset timer
      └→ No response (3 months)
          └→ Trustee notification (if set)
              └→ Transfer initiated
                  └→ Heirs receive transfer email
```

### Backup & Export
```
Automated Daily Backups (cron)
  └→ All branches backed up
  └→ User can trigger manual export
      └→ /branch/[branchId]/settings
          └→ "Export Branch"
              ├→ PDF (formatted memories)
              └→ ZIP (all media files)
```

---

## 6. Decision Points & Key Forks

### Branch Type Decision
```
Create Branch
  ├→ Memorial (deceased) → Can be public (Open Grove)
  └→ Living → Must be private
```

### Privacy Decision
```
Memorial Branch Creation
  ├→ Private → Only invited people can view
  └→ Open Grove (Public) → Anyone can view, appears in directory
```

### Subscription Decision Points
```
Approach Limit
  ├→ 3rd branch created → "Upgrade for unlimited"
  ├→ 45 memories on branch → "5 memories remaining"
  └→ Limit reached → "Upgrade to continue adding memories"
```

### Legacy Planning Decision
```
Create Branch
  └→ Skip heir setup → Reminded later
  OR
  └→ Set up now
      ├→ Add heirs only → Direct transfer
      └→ Add heirs + trustee → Managed transfer
```

---

## 7. Navigation Map

```
HOME (/)
├─ AUTH
│  ├─ /auth/signin
│  ├─ /auth/signup
│  └─ /auth/reset-password
│
├─ GROVE (Dashboard)
│  └─ /grove
│      └─ /branch/create
│          └─ /branch/[branchId]
│              ├─ /branch/[branchId]/settings
│              ├─ /branch/[branchId]/heirs
│              └─ /branch/[branchId]/import
│
├─ OPEN GROVE (Public)
│  ├─ /open-grove
│  └─ /open-grove/memorials
│
├─ ACCOUNT
│  ├─ /profile
│  ├─ /billing
│  └─ /feedback
│
├─ ADMIN (admin only)
│  ├─ /admin/beta-invites
│  └─ /admin/fix-open-grove
│
└─ LEGAL
   ├─ /privacy
   └─ /terms
```

---

## 8. User Goals by Track

| Track | Primary Goal | Success Metric |
|-------|-------------|----------------|
| **Memorial Creator** | Preserve loved one's legacy | Branch created, memories added, heirs set |
| **Living Branch Creator** | Celebrate living family | Branch created, family invited |
| **Contributor** | Share memories | Memories added to others' branches |
| **Open Grove Visitor** | Discover stories | Memorials viewed, potentially sign up |
| **Heir** | Receive legacy | Transfer accepted, branch continued |
| **Premium User** | Unlimited preservation | Subscription active, multiple branches |
| **Admin** | Platform management | Invites sent, issues resolved |

---

## 9. Common User Flows

### Quick Flow: Create Memorial & Share
```
Sign Up → Create Memorial Branch → Add First Memory → Share on Facebook
(5 minutes)
```

### Complete Flow: Full Legacy Setup
```
Sign Up → Create Branch → Add Memories → Invite Family → Set Up Heirs → Subscribe to Premium
(30 minutes)
```

### Visitor to User Conversion
```
Search Open Grove → Find Memorial → Read Stories → Sign Up → Create Own Memorial
```

---

## 10. Mobile vs Desktop Differences

### Mobile Optimizations
- Native share dialog (Web Share API)
- Photo upload from camera
- Audio recording in-app
- Simplified navigation
- Touch-optimized controls

### Desktop Features
- Drag & drop uploads
- Keyboard shortcuts
- Wider memory cards
- Side-by-side views
- Export bulk downloads

---

**Last Updated**: January 2025
**Version**: 1.0
