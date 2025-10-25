# Firefly Grove Sitemap

A complete navigation map of all pages and routes in Firefly Grove.

---

## 🏠 Public Pages

### Landing & Authentication
- `/` - Home page / Landing page
- `/login` - User login
- `/signup` - User registration
- `/feedback` - Public feedback form

---

## 🌳 Core User Pages

### Grove Management
- `/grove` - **Main grove view** - View all your trees and rooted legacy trees
- `/grove/new-tree` - Create a new tree in your grove

### Tree & Branch Pages
- `/tree/[treeId]` - View a specific tree and its branches
- `/tree/[treeId]/new-branch` - Create a new branch (connection) on a tree
- `/branch/[branchId]` - View a specific branch with its memories

### Memorial Features
- `/open-grove` - **Public memorial space** - Browse all discoverable memorials
- `/memorial/create` - Create a free public memorial
- `/memorial/created` - Memorial creation confirmation page
- `/legacy-tree/create` - Create a legacy tree (Open Grove or private)
- `/video-collage` - Create memorial video collages

---

## 💳 Account Management

### Billing & Subscription
- `/billing` - Manage subscription, view plan, update payment

### Invitations
- `/invite/[token]` - Accept invitation to a branch or grove

---

## 🔧 Admin & Testing

### Admin Pages
- `/admin/beta-invites` - Manage beta invitations (admin only)

### Development/Testing
- `/test-email` - Email template testing page

---

## 🌐 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/check-email` - Check if email exists
- `/api/auth/[...nextauth]` - NextAuth handlers (login, logout, session)

### Grove Management
- `GET /api/grove` - Get user's grove
- `PATCH /api/grove/rename` - Rename grove

### Tree Management
- `POST /api/trees` - Create a new tree
- `GET /api/trees/[treeId]` - Get tree details
- `PATCH /api/trees/[treeId]/rename` - Rename tree

### Branch Management
- `POST /api/branches` - Create a new branch
- `GET /api/branches/[branchId]` - Get branch details
- `PATCH /api/branches/[branchId]/update` - Update branch details
- `POST /api/branches/[branchId]/archive` - Archive/delete branch
- `POST /api/branches/[branchId]/restore` - Restore archived branch
- `POST /api/branches/[branchId]/export` - Export branch as Forever Kit
- `GET /api/branches/[branchId]/shareable-branches` - Get branches available for sharing
- `GET /api/branches/[branchId]/pending-approvals` - Get pending memory approvals

### Branch Settings
- `GET /api/branches/[branchId]/heirs` - Get heir list
- `POST /api/branches/[branchId]/heirs` - Add heir
- `GET /api/branches/[branchId]/members` - Get branch members
- `POST /api/branches/[branchId]/members` - Invite member
- `GET /api/branches/[branchId]/invites` - Get pending invites
- `GET /api/branches/[branchId]/preferences` - Get sharing preferences
- `PATCH /api/branches/[branchId]/preferences` - Update sharing preferences
- `POST /api/branches/[branchId]/legacy` - Enter legacy mode

### Memory Management
- `POST /api/branches/[branchId]/entries` - Create a new memory
- `POST /api/entries/[entryId]/withdraw` - Withdraw memory (author)
- `POST /api/entries/[entryId]/hide` - Hide memory from branch (owner)
- `POST /api/entries/[entryId]/restore` - Restore withdrawn/hidden memory
- `POST /api/entries/[entryId]/undo` - Undo recent deletion
- `POST /api/entries/[entryId]/report` - Report inappropriate content
- `GET /api/memories/[memoryId]/sharing-info` - Get memory sharing status
- `POST /api/memories/[memoryId]/share` - Share memory to other branches
- `POST /api/memories/[memoryId]/remove-from-branch` - Remove shared memory from branch
- `POST /api/memories/[memoryId]/approve` - Approve pending shared memory

### Trash Management
- `GET /api/trash` - Get user's trash (withdrawn/hidden items)

### Legacy Tree Management (Open Grove)
- `POST /api/legacy-tree/create` - Create a legacy tree memorial
- `POST /api/legacy-tree/check-duplicate` - Check for duplicate memorials
- `PATCH /api/legacy-tree/[personId]/discovery` - Toggle public discovery
- `POST /api/legacy-tree/[personId]/transfer` - Transfer ownership to family member
- `POST /api/legacy-tree/[personId]/adopt` - Adopt tree into private grove
- `POST /api/legacy-tree/[personId]/root` - Root (link) tree to private grove

### Person Management
- `GET /api/persons/search` - Search for people (legacy trees)
- `GET /api/persons/transplantable` - Get trees available to transplant
- `POST /api/persons/[personId]/transplant` - Transplant tree to your grove
- `PATCH /api/persons/[personId]/update` - Update person details

### Open Grove
- `GET /api/open-grove` - Get public memorials list

### Branch Connections
- `POST /api/branch-connections/request` - Request to connect branches
- `POST /api/branch-connections/[requestId]/accept` - Accept connection request
- `POST /api/branch-connections/[requestId]/decline` - Decline connection request

### Invitations
- `GET /api/invites/[inviteId]` - Get invite details
- `POST /api/invites/[inviteId]/accept` - Accept invite
- `POST /api/invites/[inviteId]/resend` - Resend invite
- `POST /api/invites/[inviteId]/cancel` - Cancel invite

### Billing & Subscriptions
- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/subscribe` - Create subscription
- `POST /api/billing/portal` - Access Stripe customer portal
- `POST /api/stripe/webhook` - Stripe webhook handler

### Legacy & Downloads
- `GET /api/legacy/download` - Download Forever Kit

### Video Features
- `GET /api/video-collage/branches` - Get branches for video collage

### System & Admin
- `GET /api/stats` - System statistics
- `POST /api/system/init-open-grove` - Initialize Open Grove (setup)
- `POST /api/admin/send-beta-invite` - Send beta invitation (admin)
- `POST /api/cron` - Cron job endpoint (automated tasks)

### Feedback
- `POST /api/feedback` - Submit user feedback

### Testing
- `POST /api/test-email` - Test email sending

---

## 📂 Page Hierarchy

```
/
├── Landing Page
├── /login
├── /signup
├── /feedback
│
├── /grove ⭐ Main Hub
│   └── /new-tree
│
├── /tree/[treeId]
│   └── /new-branch
│
├── /branch/[branchId] ⭐ Core Experience
│
├── /open-grove ⭐ Public Memorials
│
├── /memorial
│   ├── /create
│   └── /created
│
├── /legacy-tree
│   └── /create
│
├── /video-collage
│
├── /billing
│
├── /invite/[token]
│
├── /admin
│   └── /beta-invites
│
└── /test-email
```

---

## 🔑 Key User Flows

### New User Journey
1. `/` → `/signup` → `/grove` → `/grove/new-tree` → `/tree/[treeId]` → `/tree/[treeId]/new-branch` → `/branch/[branchId]`

### Creating a Memorial
1. `/` → `/memorial/create` → `/memorial/created` → `/branch/[branchId]`

### Managing Grove
1. `/grove` (view trees) → `/tree/[treeId]` (view branches) → `/branch/[branchId]` (view memories)

### Open Grove Exploration
1. `/open-grove` (browse) → `/branch/[branchId]` (view memorial)

### Branch Invitation
1. Email link → `/invite/[token]` → Accept → `/branch/[branchId]`

---

## 🎯 Core Pages Summary

**Most Important Pages:**
- `/grove` - User's main hub
- `/branch/[branchId]` - Where memories live
- `/open-grove` - Public memorial space
- `/billing` - Subscription management

**Entry Points:**
- `/` - Landing page
- `/login` - Authentication
- `/signup` - Registration
- `/memorial/create` - Free public memorial creation

---

*Last Updated: 2025-10-25*
