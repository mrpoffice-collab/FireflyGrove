# Sparks Integration Guide

## Overview
Sparks are memory prompts that help users create meaningful content. They've been refactored from a standalone page to be integrated into the memory creation flow at the branch level.

## Architecture Changes

### Database Schema
The `Spark` model now includes:
- `sparkType`: Categorizes sparks into 3 types
- `branchId`: Links custom sparks to specific branches
- Existing fields: `text`, `category`, `isGlobal`, `isActive`, `usageCount`

### 3 Types of Sparks

#### 1. Standard Sparks (`sparkType: "standard"`)
- **Source:** System-provided
- **Scope:** Global, available to all users
- **Management:** Admin-managed via seed data
- **Examples:**
  - "What was your first memory with this person?"
  - "Describe a time they made you laugh"
  - "What advice did they give you?"
- **Database:** `isGlobal: true`, `sparkType: "standard"`, `userId: null`, `branchId: null`

#### 2. Challenge Sparks (`sparkType: "challenge"`)
- **Source:** System-provided, seasonal/themed
- **Scope:** Global, time-limited or themed
- **Management:** Admin-managed
- **Examples:**
  - Fall/Autumn: "Share a favorite fall memory together"
  - Holiday: "Recall a special holiday tradition"
  - Summer: "Remember a summer adventure"
- **Database:** `isGlobal: true`, `sparkType: "challenge"`, `userId: null`, `branchId: null`
- **Can be toggled:** `isActive` field controls seasonal availability

#### 3. Custom Sparks (`sparkType: "custom"`)
- **Source:** User-uploaded
- **Scope:** Branch-specific
- **Management:** User-controlled from branch settings
- **Examples:**
  - Family-specific questions
  - Interview prompts
  - Custom memory themes
- **Database:** `sparkType: "custom"`, `userId: <userId>`, `branchId: <branchId>`

## Implementation Guide

### 1. Spark Picker Component
**Location:** `components/SparkPicker.tsx` (already exists)

**Usage in Memory Creation:**
```tsx
// In branch page or memory creation modal
import SparkPicker from '@/components/SparkPicker'

// Fetch sparks for current branch
const sparks = await fetch(`/api/branches/${branchId}/sparks`)

// Render picker with 3 tabs
<SparkPicker
  branchId={branchId}
  onSelect={(sparkText) => {
    // Insert spark text into memory textarea
    setMemoryText(sparkText)
  }}
/>
```

**Tabs in SparkPicker:**
1. **Standard** - System sparks (always populated)
2. **Challenges** - Seasonal/themed sparks (changes periodically)
3. **Custom** - User's uploaded sparks for this branch

### 2. Branch-Level Spark Upload
**Where:** Branch settings or branch page sidebar

**Flow:**
1. User clicks "Upload Sparks File" in branch settings
2. Upload `.txt` file with one prompt per line
3. Backend parses file and creates `Spark` records:
   ```ts
   sparkType: "custom"
   branchId: currentBranchId
   userId: currentUserId
   isGlobal: false
   ```
4. Sparks appear in "Custom" tab of SparkPicker for this branch only

**File Format Example:**
```
What was your favorite childhood toy?
Describe the house you grew up in
Share a memory from your first day of school
What was your relationship like with your siblings?
```

### 3. API Endpoints

#### GET `/api/branches/[branchId]/sparks`
Returns sparks for a specific branch:
```json
{
  "standard": [...],      // isGlobal: true, sparkType: "standard"
  "challenge": [...],     // isGlobal: true, sparkType: "challenge", isActive: true
  "custom": [...]         // branchId: <branchId>, sparkType: "custom"
}
```

#### POST `/api/branches/[branchId]/sparks/upload`
Upload custom sparks file:
```ts
// Request: multipart/form-data with .txt file
// Response: Created spark records
```

#### PATCH `/api/branches/[branchId]/sparks/[id]`
Edit/deactivate custom spark:
```json
{
  "text": "Updated prompt text",
  "isActive": false
}
```

#### DELETE `/api/branches/[branchId]/sparks/[id]`
Delete custom spark (branch owner only)

### 4. Seed Data Structure

**File:** `scripts/seed-sparks.ts`

```ts
const standardSparks = [
  { text: "...", category: "Childhood", sparkType: "standard" },
  // ... more standard sparks
]

const challengeSparks = [
  { text: "Share a fall memory...", category: "Seasonal", sparkType: "challenge" },
  // ... more challenge sparks
]

// Create with isGlobal: true, userId: null
```

### 5. Migration Notes

**Existing Sparks:**
- All current sparks should be set to `sparkType: "standard"`
- Run migration to add default values:
  ```sql
  UPDATE "Spark" SET "sparkType" = 'standard' WHERE "sparkType" IS NULL;
  ```

**User-Created Sparks:**
- Existing user sparks from `/sparks` page should be converted to `sparkType: "custom"`
- Since they weren't branch-specific, consider:
  - Option A: Delete them (clean slate)
  - Option B: Assign to user's first/primary branch
  - Option C: Create global custom category (not recommended)

## User Experience Flow

### Creating a Memory (Updated Flow)

1. User clicks "Add Memory" on branch page
2. Memory creation modal appears with:
   - Text area for memory
   - "✨ Get Inspired" button
3. Clicking "Get Inspired" shows SparkPicker modal:
   ```
   ┌─ Standard ─┬─ Challenges ─┬─ Custom ─┐
   │                                       │
   │  [List of sparks with categories]    │
   │                                       │
   │  Click a spark to use it as prompt   │
   └───────────────────────────────────────┘
   ```
4. User selects a spark → text auto-fills in memory textarea
5. User writes memory based on the prompt
6. Spark `usageCount` increments

### Managing Custom Sparks

1. Navigate to branch page
2. Click "Branch Settings" or "⚙️" icon
3. Go to "Custom Sparks" section
4. Options:
   - **Upload File:** Choose `.txt` file with prompts
   - **Add Manually:** Type prompt and click "Add"
   - **Edit/Delete:** Manage existing custom sparks
5. Sparks immediately available in "Custom" tab

## Benefits of New System

✅ **Context-Aware:** Sparks are relevant to the specific branch/person
✅ **Less Clutter:** No standalone sparks page in navigation
✅ **User Control:** Upload custom prompts per branch
✅ **Seasonal Variety:** Challenge sparks keep content fresh
✅ **Better UX:** Integrated into memory creation workflow
✅ **Scalable:** Branch-specific custom sparks don't pollute global space

## Technical Considerations

### Performance
- Cache standard/challenge sparks globally (they don't change per user)
- Fetch custom sparks only when opening SparkPicker
- Limit custom sparks per branch (e.g., 100 max)

### Security
- Validate file uploads (text only, size limits)
- Sanitize spark text (prevent XSS)
- Ensure users can only manage sparks for their own branches

### Analytics
- Track `usageCount` to identify popular sparks
- Could show "trending" sparks in future
- Help admins curate better standard/challenge sparks

## Future Enhancements

### Phase 2 Ideas
- **AI-Generated Sparks:** Based on branch metadata (person's interests, age, etc.)
- **Community Sparks:** Users can share custom sparks publicly
- **Spark Collections:** Curated themed sets (e.g., "Grandparent Interview Kit")
- **Smart Suggestions:** Recommend sparks based on previous memories
- **Spark Scheduler:** Send weekly email with a new spark

### Phase 3 Ideas
- **Collaborative Sparks:** Multiple users contribute to branch sparks
- **Spark Responses:** Track which memories were created from which sparks
- **Spark Templates:** Pre-filled sparks with variables (e.g., "${personName}'s favorite...")

## Migration Checklist

- [x] Update `Spark` schema with `sparkType` and `branchId`
- [x] Push schema changes to database
- [x] Remove `/sparks` page from navigation
- [ ] Update seed script with spark types
- [ ] Create `/api/branches/[branchId]/sparks` endpoint
- [ ] Add spark upload to branch settings UI
- [ ] Update SparkPicker component to show 3 tabs
- [ ] Add spark integration to memory creation flow
- [ ] Migrate existing user sparks (decide on strategy)
- [ ] Test with sample branch and custom uploads

## Questions to Resolve

1. **File Upload:** Should we support batch upload or also allow one-at-a-time manual entry?
   - **Recommendation:** Both - file upload for bulk, manual entry for quick adds

2. **Spark Limits:** How many custom sparks per branch?
   - **Recommendation:** 100 max per branch (prevents abuse)

3. **Existing Sparks:** What to do with user-created sparks from old `/sparks` page?
   - **Recommendation:** Delete on migration (clean slate, users can re-upload)

4. **Challenge Rotation:** How often should challenge sparks change?
   - **Recommendation:** Seasonal (quarterly) + special events (holidays)

---

**Status:** ✅ Schema updated, navigation updated, ready for API/UI implementation
**Last Updated:** 2025-10-26
