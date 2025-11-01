# ✨ Spark Collections - Grove-Wide Sharing Implementation

## Overview

Building on the existing Spark Collections system to add **Grove-wide sharing** so users can share their custom prompt collections with connected family members.

---

## 🎯 User Requirements

Based on your request, users need to:

1. **Upload Spark Collections** - Upload .txt files with multiple prompts
2. **Share Throughout Grove** - Make collections available to connected users
3. **Multiple Collections** - Upload several files and manage them
4. **Dropdown Organization** - Collections organized with subcategories
5. **Shared Sparks Section** - "My Sparks" → "Shared Sparks" subsection

---

## 📊 Current State Analysis

### ✅ What's Already Built:

1. **Database Schema** - Complete
   - `SparkCollection` table
   - `UserSparkCollection` table (user's active collections)
   - `Spark` table with `collectionId`

2. **Upload API** - `/api/spark-collections/upload` (EXISTS)
   - Accepts .txt file uploads
   - Creates collection + individual sparks
   - Auto-activates for uploading user

3. **Management UI** - `/spark-collections` page (EXISTS)
   - Upload modal
   - List user collections
   - Toggle collections on/off
   - Featured collections section

4. **SparkPicker Component** - Groups sparks by collection

### ⚠️ What's Missing:

1. **Grove-wide Sharing** - No ability to share with connected users
2. **Shared Collections Section** - No "Shared Sparks" in dropdown
3. **Permission System** - No concept of "shared with my Grove"
4. **Discovery** - Connected users can't see shared collections

---

## 🏗️ Architecture Design

### Database Schema Updates

We'll extend the existing `SparkCollection` model to add sharing:

```prisma
model SparkCollection {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String?  // Owner
  isFeatured  Boolean  @default(false)
  isGlobal    Boolean  @default(false)
  icon        String?
  promptCount Int      @default(0)

  // NEW: Sharing within Grove
  isSharedWithGrove Boolean @default(false) // Owner's flag: share with my family
  sharedAt          DateTime? // When sharing was enabled

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User?    @relation("UserSparkCollections", fields: [userId], references: [id])
  sparks      Spark[]
  userActivations UserSparkCollection[]
}
```

**Key:**
- `isSharedWithGrove` - Owner sets this to share collection with their connected users
- No separate "shares" table needed - we use the Grove connection graph
- Users in the same Grove can discover and activate shared collections

---

## 🔄 User Flow

### Flow 1: Uploading and Sharing a Collection

1. **User uploads** `Family Questions.txt`
   ```
   What was your first memory of this person?
   What's a funny story about them?
   What life lesson did they teach you?
   ... (20 more prompts)
   ```

2. **System creates:**
   - 1 `SparkCollection` record (name: "Family Questions", userId: user's ID)
   - 23 `Spark` records (collectionId linked)
   - 1 `UserSparkCollection` record (auto-activated for uploader)

3. **User shares with Grove:**
   - Clicks "Share with my Grove" toggle
   - System sets `isSharedWithGrove = true`
   - Now visible to connected users

4. **Connected users see:**
   - In their `/spark-collections` page under "Shared by Family"
   - Can activate for their grove
   - Prompts appear in their SparkPicker

---

### Flow 2: Discovering Shared Collections

**User's Collection Management View:**

```
┌──────────────────────────────────────────────┐
│ My Spark Collections                         │
│                                              │
│ [+ Upload New Collection]                    │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ 📖 Family Questions       [EDIT] [DEL] │  │
│ │ 23 prompts • Created Oct 20            │  │
│ │ Active: [ON]                           │  │
│ │ Share with my Grove: [ON] ← NEW       │  │
│ │ 3 family members are using this       │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ Shared by Family                         ← NEW │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ 💙 Recovery Prompts         [ACTIVATE] │  │
│ │ 18 prompts • Shared by Mom             │  │
│ │ Active: [OFF]                          │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ 🎄 Holiday Traditions       [ACTIVATE] │  │
│ │ 30 prompts • Shared by Grandma         │  │
│ │ Active: [ON]                           │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ Featured Collections (Firefly Grove)         │
│ ... (admin collections)                      │
└──────────────────────────────────────────────┘
```

---

### Flow 3: SparkPicker with Shared Collections

**When creating a memory:**

```
┌───────────────────────────────────────────┐
│ Choose a Memory Spark                     │
├───────────────────────────────────────────┤
│ Category: [All] [Childhood] [Family] ...  │
├───────────────────────────────────────────┤
│                                           │
│ 📂 My Collections                         │
│                                           │
│ 📖 Family Questions (23 prompts)         │
│ ┌───────────────────────────────────────┐ │
│ │ What was your first memory...         │ │
│ └───────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ │
│ │ What's a funny story...               │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ 📂 Shared by Family              ← NEW   │
│                                           │
│ 🎄 Holiday Traditions (by Grandma) (30)  │
│ ┌───────────────────────────────────────┐ │
│ │ What holiday tradition...             │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ 📂 Featured                               │
│                                           │
│ ⭐ Story Sparks (50 prompts)             │
│ ┌───────────────────────────────────────┐ │
│ │ Share a story that shows...           │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ [+ Write your own] [Manage Collections →] │
└───────────────────────────────────────────┘
```

---

## 🔧 Implementation Steps

### Step 1: Database Migration

Add sharing fields to `SparkCollection`:

```prisma
// In prisma/schema.prisma - UPDATE SparkCollection model

model SparkCollection {
  // ... existing fields ...

  isSharedWithGrove Boolean @default(false)
  sharedAt          DateTime?

  // ... rest of model ...
}
```

Run migration:
```bash
npx prisma migrate dev --name add_spark_sharing
```

---

### Step 2: Update Upload API

**File:** `app/api/spark-collections/upload/route.ts`

Already exists, just ensure it supports optional `isSharedWithGrove` parameter:

```typescript
const isSharedWithGrove = formData.get('isSharedWithGrove') === 'true'

const collection = await prisma.sparkCollection.create({
  data: {
    name,
    description,
    userId: user.id,
    icon,
    promptCount: prompts.length,
    isSharedWithGrove, // NEW
    sharedAt: isSharedWithGrove ? new Date() : null, // NEW
  }
})
```

---

### Step 3: Add Sharing Toggle API

**File:** `app/api/spark-collections/[id]/share/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { isShared } = await request.json()
    const collectionId = params.id

    // Verify user owns this collection
    const collection = await prisma.sparkCollection.findUnique({
      where: { id: collectionId },
    })

    if (!collection || collection.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Update sharing status
    const updated = await prisma.sparkCollection.update({
      where: { id: collectionId },
      data: {
        isSharedWithGrove: isShared,
        sharedAt: isShared ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, collection: updated })
  } catch (error) {
    console.error('Error toggling share:', error)
    return NextResponse.json({ error: 'Failed to update sharing' }, { status: 500 })
  }
}
```

---

### Step 4: Update Collections List API

**File:** `app/api/spark-collections/route.ts` (UPDATE)

Add logic to fetch shared collections from Grove members:

```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { grove: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's own collections
    const userCollections = await prisma.sparkCollection.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { userActivations: true } }, // How many people activated it
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get featured/global collections
    const featuredCollections = await prisma.sparkCollection.findMany({
      where: {
        OR: [{ isFeatured: true }, { isGlobal: true }],
      },
      orderBy: { name: 'asc' },
    })

    // NEW: Get collections shared by Grove members
    const sharedCollections = await getSharedCollections(user.id)

    return NextResponse.json({
      userCollections,
      featuredCollections,
      sharedCollections, // NEW
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}

// NEW: Helper function to get shared collections
async function getSharedCollections(userId: string) {
  // Find all users connected to this user's Grove
  const connectedUsers = await getConnectedUsers(userId)

  if (connectedUsers.length === 0) {
    return []
  }

  // Get collections shared by those users
  const sharedCollections = await prisma.sparkCollection.findMany({
    where: {
      userId: { in: connectedUsers.map((u) => u.id) },
      isSharedWithGrove: true,
    },
    include: {
      user: { select: { id: true, name: true } }, // Who shared it
    },
    orderBy: { sharedAt: 'desc' },
  })

  return sharedCollections
}

// Helper: Get all users connected to this user via Grove
async function getConnectedUsers(userId: string): Promise<{ id: string; name: string }[]> {
  // Get user's Grove
  const userGrove = await prisma.grove.findUnique({
    where: { userId },
  })

  if (!userGrove) return []

  // Find all users who have access to trees in this Grove
  const connectedUsers = await prisma.user.findMany({
    where: {
      OR: [
        // Users who own branches in this Grove's trees
        { ownedBranches: { some: { tree: { groveId: userGrove.id } } } },
        // Users who are members of branches in this Grove's trees
        { branchMemberships: { some: { branch: { tree: { groveId: userGrove.id } } } } },
      ],
      NOT: { id: userId }, // Exclude self
    },
    select: { id: true, name: true },
    distinct: ['id'],
  })

  return connectedUsers
}
```

---

### Step 5: Update SparkPicker UI

**File:** `components/SparkPicker.tsx` (UPDATE)

Group collections into sections:

```typescript
// Group collections by type
const myCollections = filteredSparks.filter(
  (s) => s.collection && !s.collection.isGlobal && !s.collection.isFeatured && !s.isSharedBy
)

const sharedCollections = filteredSparks.filter(
  (s) => s.collection && s.isSharedBy // NEW: needs API to mark this
)

const featuredCollections = filteredSparks.filter(
  (s) => s.collection && (s.collection.isGlobal || s.collection.isFeatured)
)

// Render sections
<div className="space-y-6">
  {myCollections.length > 0 && (
    <div>
      <h3 className="text-sm font-medium text-text-muted mb-2">📂 My Collections</h3>
      {renderCollectionGroup(myCollections)}
    </div>
  )}

  {sharedCollections.length > 0 && (
    <div>
      <h3 className="text-sm font-medium text-text-muted mb-2">📂 Shared by Family</h3>
      {renderCollectionGroup(sharedCollections, true)} {/* Show sharer name */}
    </div>
  )}

  {featuredCollections.length > 0 && (
    <div>
      <h3 className="text-sm font-medium text-text-muted mb-2">📂 Featured</h3>
      {renderCollectionGroup(featuredCollections)}
    </div>
  )}
</div>
```

---

### Step 6: Update Sparks API

**File:** `app/api/sparks/route.ts` (UPDATE)

Include shared collections in query:

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })

  // Get user's active collections
  const activeCollections = await prisma.userSparkCollection.findMany({
    where: { userId: user.id, isActive: true },
    select: { collectionId: true },
  })

  const collectionIds = activeCollections.map((c) => c.collectionId)

  // Get sparks from active collections
  const sparks = await prisma.spark.findMany({
    where: {
      collectionId: { in: collectionIds },
    },
    include: {
      collection: {
        include: {
          user: { select: { id: true, name: true } }, // NEW: Include owner info
        },
      },
    },
    orderBy: [
      { collection: { name: 'asc' } },
      { order: 'asc' },
    ],
  })

  // NEW: Mark which sparks are from shared collections
  const connectedUserIds = (await getConnectedUsers(user.id)).map((u) => u.id)

  const sparksWithMeta = sparks.map((spark) => ({
    ...spark,
    isSharedBy: spark.collection?.userId && connectedUserIds.includes(spark.collection.userId)
      ? spark.collection.user?.name
      : null,
  }))

  return NextResponse.json(sparksWithMeta)
}
```

---

### Step 7: Update Collection Management UI

**File:** `app/spark-collections/page.tsx` (UPDATE)

Add sharing toggle and shared collections section:

```tsx
// In collection card for user's collections
<div className="flex items-center gap-2 mt-2">
  <label className="flex items-center gap-2 text-sm text-text-muted">
    <input
      type="checkbox"
      checked={collection.isSharedWithGrove}
      onChange={() => handleShareToggle(collection.id, !collection.isSharedWithGrove)}
      className="rounded"
    />
    Share with my Grove
  </label>
  {collection.isSharedWithGrove && collection._count.userActivations > 0 && (
    <span className="text-xs text-firefly-glow">
      {collection._count.userActivations} family {collection._count.userActivations === 1 ? 'member' : 'members'} using
    </span>
  )}
</div>

// Add new section for shared collections
{sharedCollections.length > 0 && (
  <div className="mt-8">
    <h2 className="text-xl text-text-soft mb-4">Shared by Family</h2>
    <div className="space-y-3">
      {sharedCollections.map((collection) => (
        <div key={collection.id} className="bg-bg-darker border border-border-subtle rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text-soft font-medium">
                {collection.icon} {collection.name}
              </h3>
              <p className="text-sm text-text-muted">
                {collection.promptCount} prompts • Shared by {collection.user?.name}
              </p>
            </div>
            <button
              onClick={() => handleActivateShared(collection.id)}
              className="px-4 py-2 bg-firefly-dim text-bg-dark rounded hover:bg-firefly-glow transition-soft"
            >
              {isActive(collection.id) ? 'Active' : 'Activate'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## 🎨 Complete User Journey

### Journey 1: Mom Shares "Bible Verses"

1. **Mom uploads** `bible-verses.txt` (50 verses)
2. **Mom enables** "Share with my Grove" toggle
3. **Daughter logs in** → Goes to "Manage Spark Collections"
4. **Daughter sees** "Shared by Family" section with "📖 Bible Verses (by Mom)"
5. **Daughter activates** the collection
6. **When creating memory**, Daughter sees all 50 Bible verse prompts grouped under "Shared by Family"

### Journey 2: Family Holiday Collection

1. **Grandma uploads** "Holiday Traditions.txt" (30 prompts)
2. **Grandma shares** with Grove
3. **All 5 family members** can now activate and use those prompts
4. **Unified experience**: Everyone asking the same thoughtful questions
5. **Collective memories**: Building shared family history with consistent prompts

---

## 📊 Technical Summary

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/spark-collections` | GET | List user's, shared, and featured collections |
| `/api/spark-collections/upload` | POST | Upload new collection |
| `/api/spark-collections/[id]/share` | POST | Toggle sharing with Grove |
| `/api/spark-collections/[id]/toggle` | POST | Activate/deactivate collection |
| `/api/sparks` | GET | Get sparks from active collections (includes shared) |

### Database Fields

| Model | Field | Purpose |
|-------|-------|---------|
| SparkCollection | isSharedWithGrove | Owner enables sharing |
| SparkCollection | sharedAt | Timestamp of sharing |
| UserSparkCollection | (existing) | Tracks who activated collection |

### UI Components

| Component | Updates |
|-----------|---------|
| `SparkPicker.tsx` | Group by "My", "Shared", "Featured" |
| `app/spark-collections/page.tsx` | Add sharing toggle + shared section |
| `app/api/spark-collections/route.ts` | Include shared collections |
| `app/api/sparks/route.ts` | Mark shared sparks with sharer name |

---

## ✅ Acceptance Criteria

When complete, users should be able to:

- ✅ Upload multiple .txt files as separate collections
- ✅ Toggle "Share with my Grove" on their collections
- ✅ See collections shared by family members
- ✅ Activate shared collections for their own grove
- ✅ See shared prompts grouped separately in SparkPicker
- ✅ See who shared each collection
- ✅ Know how many family members are using their shared collections

---

## 🚀 Implementation Order

1. ✅ Add database fields (migration)
2. Create share toggle API endpoint
3. Update collections GET endpoint to include shared
4. Update sparks GET endpoint to mark shared
5. Add sharing toggle to collection management UI
6. Add "Shared by Family" section to management UI
7. Update SparkPicker to group by type
8. Test with multiple users in same Grove

---

**Next Steps:** Start with database migration and API endpoints, then update UI components.
