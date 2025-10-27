# Spark Collections - New Architecture

**Date:** 2025-10-26
**Status:** Database Schema Complete ✅ | API & UI In Progress 🚧

---

## 🎯 Vision

Users upload **themed prompt files** as collections, not individual sparks.

### User Examples:
- Upload `Family Memories.txt` → Creates "Family Memories" collection
- Upload `Bible Verses.txt` → Creates "Bible Verses" collection
- Upload `Recovery Journey.txt` → Creates "Recovery Journey" collection
- Upload `Grandma's Stories.txt` → Creates "Grandma's Stories" collection

### Admin Examples:
- Admin creates "Story Sparks" (featured, available to all)
- Admin creates "Holiday Challenges" (seasonal)
- Admin creates "Memorial Prompts" (remembrance themed)

### User Control:
- In user dropdown menu → "Manage Spark Collections"
- See list of their collections + admin featured collections
- Toggle each collection on/off for their grove
- Only **active** collections appear in SparkPicker when creating memories

---

## 📊 Database Architecture (COMPLETE ✅)

### 1. SparkCollection Table
Represents a file/group of related prompts.

```typescript
model SparkCollection {
  id          String   // Unique ID
  name        String   // "Family Memories", "Bible Verses"
  description String?  // Optional description
  userId      String?  // Owner (null for admin collections)
  isFeatured  Boolean  // Admin highlights
  isGlobal    Boolean  // Available to all users
  icon        String?  // Emoji (🎄, 📖, 💙)
  promptCount Int      // Number of prompts

  sparks      Spark[]  // All prompts in this collection
  userActivations UserSparkCollection[] // Users who activated it
}
```

### 2. UserSparkCollection Table
Tracks which collections are active for each user.

```typescript
model UserSparkCollection {
  userId       String
  collectionId String
  isActive     Boolean  // User toggles on/off

  user         User
  collection   SparkCollection
}
```

### 3. Updated Spark Table
Individual prompts now belong to a collection.

```typescript
model Spark {
  id           String
  collectionId String?  // Now references a collection
  text         String   // The prompt
  order        Int      // Preserves order from file
  // ... other fields

  collection   SparkCollection
}
```

---

## 🔧 What Still Needs to Be Built

### 1. Collection Upload API ⏳
**File:** `app/api/spark-collections/upload/route.ts`

**Functionality:**
- Accept .txt file upload
- Ask user for collection name + optional icon
- Create SparkCollection record
- Parse file line-by-line
- Create Spark records with `collectionId` and `order`
- Auto-activate collection for the user (create UserSparkCollection)

**Request:**
```typescript
POST /api/spark-collections/upload
FormData {
  file: File,
  name: string,
  icon?: string,
  description?: string
}
```

**Response:**
```typescript
{
  collection: SparkCollection,
  promptCount: number,
  message: "Successfully uploaded 25 prompts!"
}
```

---

### 2. Collection Management API ⏳
**File:** `app/api/spark-collections/route.ts`

**Functionality:**
- GET: List user's collections + featured collections
- POST: Create new collection manually
- PATCH: Update collection name/description
- DELETE: Delete collection (and all its sparks)

**File:** `app/api/spark-collections/[id]/toggle/route.ts`
- POST: Activate/deactivate collection for user

---

### 3. Updated Sparks API ⏳
**File:** `app/api/sparks/route.ts` (modify existing)

**Change Behavior:**
- Only return sparks from **user's active collections**
- Query `UserSparkCollection` where `isActive = true`
- Filter sparks by those `collectionId`s

**Current (Wrong):**
```typescript
// Shows all user's sparks + all global sparks
OR: [
  { userId: userId },
  { isGlobal: true }
]
```

**New (Correct):**
```typescript
// Get user's active collection IDs
const activeCollections = await prisma.userSparkCollection.findMany({
  where: { userId, isActive: true },
  select: { collectionId: true }
})

const collectionIds = activeCollections.map(c => c.collectionId)

// Only return sparks from those collections
const sparks = await prisma.spark.findMany({
  where: {
    collectionId: { in: collectionIds }
  },
  include: { collection: true },
  orderBy: [
    { collection: { name: 'asc' } },
    { order: 'asc' }
  ]
})
```

---

### 4. Collection Management UI ⏳
**File:** `app/spark-collections/page.tsx` (new page)

**Access:** User dropdown → "Manage Spark Collections"

**Layout:**
```
┌─────────────────────────────────────────────┐
│ My Spark Collections                        │
│                                             │
│ [+ Upload New Collection]  [Download Template] │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 📖 Family Memories         [ON] [Edit]  │ │
│ │ 25 prompts • Created Oct 15             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 💙 Recovery Journey        [OFF] [Edit] │ │
│ │ 18 prompts • Created Oct 20             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ Featured Collections (Admin)                │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ⭐ Story Sparks             [ON]        │ │
│ │ 50 prompts • By Firefly Grove           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🎄 Holiday Challenges      [OFF]        │ │
│ │ 30 prompts • By Firefly Grove           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Features:**
- Upload button opens modal:
  - File input (.txt)
  - Collection name input
  - Icon picker (emoji)
  - Description textarea
- Each collection card shows:
  - Icon + name
  - Prompt count
  - Toggle switch (activates/deactivates)
  - Edit button (rename, change icon)
  - Delete button (user collections only)
- Featured collections section (read-only, toggle-only)

---

### 5. Updated SparkPicker Component ⏳
**File:** `components/SparkPicker.tsx` (modify existing)

**Change:**
- Group sparks by collection
- Show collection name above each group
- Filter out sparks from inactive collections

**Layout:**
```
┌───────────────────────────────────────────┐
│ Choose a Memory Spark                     │
├───────────────────────────────────────────┤
│ Category: [All] [Childhood] [Family] ...  │
├───────────────────────────────────────────┤
│                                           │
│ 📖 Family Memories (12 prompts)          │
│ ┌───────────────────────────────────────┐ │
│ │ What was the funniest thing...        │ │
│ └───────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ │
│ │ Describe a time they made you...      │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ⭐ Story Sparks (8 prompts)              │
│ ┌───────────────────────────────────────┐ │
│ │ Share a story that shows who...       │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ [+ Write your own custom prompt]          │
│                                           │
│ [Manage my collections →] [Skip & Continue] │
└───────────────────────────────────────────┘
```

---

### 6. Add to Header Dropdown ⏳
**File:** `components/Header.tsx` (modify existing)

**Add menu item:**
```typescript
<button
  onClick={() => {
    router.push('/spark-collections')
    setIsDropdownOpen(false)
  }}
  className="w-full text-left px-3 py-1.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
>
  ✨ Manage Spark Collections
</button>
```

Position: Between "Manage Plan" and "Report an Issue"

---

## 📝 User Flow Examples

### Example 1: User Uploads "Bible Verses"

1. User clicks their name → "Manage Spark Collections"
2. Clicks "Upload New Collection"
3. Modal opens:
   - Selects `bible-verses.txt` file
   - Names it "Daily Verses"
   - Chooses 📖 icon
   - Adds description: "Verses for reflection"
   - Clicks "Upload"
4. System:
   - Creates SparkCollection record
   - Parses 50 lines from file
   - Creates 50 Spark records with `collectionId`
   - Creates UserSparkCollection (isActive = true)
5. User sees:
   - "Successfully uploaded 50 prompts!"
   - Collection appears in list (toggle is ON)
6. When creating memory:
   - SparkPicker shows "📖 Daily Verses (50 prompts)"
   - All 50 verse prompts are available

### Example 2: User Toggles Off "Recovery Journey"

1. User goes to "Manage Spark Collections"
2. Sees "💙 Recovery Journey" with toggle ON
3. Clicks toggle → turns OFF
4. System updates `UserSparkCollection.isActive = false`
5. When creating memory:
   - Recovery prompts no longer appear in SparkPicker
   - Only active collections show

### Example 3: Admin Creates "Holiday Challenges"

1. Admin goes to admin panel
2. Creates SparkCollection:
   - Name: "Holiday Challenges"
   - Icon: 🎄
   - isFeatured: true
   - isGlobal: true
3. Adds 30 holiday-themed prompts
4. All users see:
   - "Featured Collections" section in management page
   - "🎄 Holiday Challenges" with toggle
   - Can activate/deactivate for their grove

---

## 🚀 Implementation Priority

### Phase 1: Core Functionality ⏳
1. ✅ Database schema (DONE)
2. Collection upload API
3. Collection management API
4. Updated sparks API (filter by active collections)

### Phase 2: User Interface ⏳
5. Collection management page (`/spark-collections`)
6. Upload modal with file input
7. Collection cards with toggles
8. Add to header dropdown menu

### Phase 3: Polish ⏳
9. Update SparkPicker to group by collection
10. Collection icons/emojis picker
11. Edit collection details
12. Delete collections

### Phase 4: Admin Features 🔮
13. Admin panel for featured collections
14. Seasonal collection scheduling
15. Collection analytics (usage tracking)

---

## 🔄 Migration from Current System

**Current sparks without collectionId:**
- Can remain as-is (legacy standalone sparks)
- Or migrate to a "My Custom Sparks" collection
- `collectionId` is nullable for backwards compatibility

**Current upload behavior:**
- Still works but creates individual sparks
- Need to update to create collections instead

---

## 📊 Key Differences: Old vs New

| Aspect | Old (Wrong) | New (Correct) |
|--------|------------|---------------|
| Upload | Individual sparks | Spark Collection (file) |
| Organization | Flat list by category | Grouped by collection |
| Visibility | All global + user's sparks | Only active collections |
| User Control | View/hide individual sparks | Toggle entire collections |
| File Context | Lost after upload | Preserved as collection |
| Use Cases | Limited to categories | Themes (Family, Bible, Recovery, etc.) |
| Sharing | Can't share sets | Can share/feature collections |
| Admin Curation | Individual approval | Featured collections |

---

## 🎨 UI Mockup: User Dropdown Menu

```
┌─────────────────────────────────┐
│ John Smith                      │
│ Plan: Family Grove              │
│ Trees: 3 / 5                    │
├─────────────────────────────────┤
│ Manage Plan                     │
│ ✨ Manage Spark Collections  ← NEW │
│ 🐛 Report an Issue              │
│ Sign Out                        │
└─────────────────────────────────┘
```

---

## ✅ Success Criteria

When complete, users should be able to:
- ✅ Upload `.txt` files as named collections
- ✅ See their collections in a dedicated management page
- ✅ Toggle collections on/off for their grove
- ✅ Only see prompts from active collections in SparkPicker
- ✅ Create multiple themed collections
- ✅ Access from user dropdown menu
- ✅ See admin featured collections separately
- ✅ Preserve file organization and order

---

**Next Step:** Build Collection Upload API (`app/api/spark-collections/upload/route.ts`)
