# Cross-Branching System Status Report

## What's Currently Implemented ✅

### 1. **Cross-Branch Memory Sharing (Within Same Grove)**
**Location**: `lib/sharing.ts`, `lib/association.ts`

**What it does**:
- Share a single memory between multiple branches within the same tree/grove
- Single canonical owner, referenced (not duplicated) in other branches
- Approval workflow for branches that opt-in
- Non-destructive removal (changes link status, doesn't delete)
- Permission propagation through origin branch owner

**Limitations**:
- ❌ Only works within the same user's grove
- ❌ Cannot share across different users' groves
- ❌ No cross-user branch discovery

---

### 2. **Person Model (Global Identity)**
**Location**: `prisma/schema.prisma` - Person model

**What it does**:
- Person entity can exist independently of any grove
- Can optionally link to a User account (`Person.userId`)
- Can appear in multiple groves via `GroveTreeMembership`

**Example**:
```
Person: "Kim Kelley"
- Can exist in multiple users' groves
- Single source of truth for identity
- Optional userId link if Kim is a registered user
```

---

### 3. **Grove Tree Membership (Cross-Grove Linking)**
**Location**: `prisma/schema.prisma` - GroveTreeMembership

**What it does**:
- Junction table linking Groves to Persons (Trees)
- `isOriginal` flag: true if created here, false if linked
- `adoptionType`: "adopted" (moved, uses slot) vs "rooted" (linked, no slot)

**Current Use Cases**:
- Legacy tree adoption from Open Grove to private grove
- Same Person appearing in multiple groves

---

## What's MISSING ❌ (Your Vision)

### 1. **Branch Creation Discovery**
**Status**: Not implemented

**What you want**:
```
User A creates branch "Kim Kelley"
↓
System checks:
  - Is "Kim Kelley" a registered user?
  - Does "Kim Kelley" exist as a Person in another grove?
↓
If YES → Prompt: "Would you like to connect this branch to Kim's existing tree?"
```

**What's needed**:
- API endpoint: `/api/branches/check-person?name=Kim+Kelley`
- Search logic to find matching Users by name
- Search logic to find matching Persons by name
- UI prompt in branch creation flow
- Connection request system

---

### 2. **Two-Sided Consent Mechanism**
**Status**: Not implemented

**What you want**:
```
User A requests to link to Kim's tree
↓
Kim receives notification: "Meschelle wants to connect their branch to your tree"
↓
Kim accepts → branches are cross-linked
Kim declines → branch remains separate
```

**What's needed**:
- BranchConnectionRequest model
- Notification system
- Approval/decline API endpoints
- UI for managing connection requests
- Auto-accept if Person.userId matches requestor

---

### 3. **Cross-User Memory Sharing**
**Status**: Partially implemented (schema exists, logic missing)

**Current**: Memories can be shared between branches in same grove
**Missing**: Memories shared across different users' groves

**What's needed**:
- Extend `lib/sharing.ts` to handle cross-grove sharing
- Permission checks across grove boundaries
- Visibility rules for cross-user content

---

### 4. **Visual Indicators for Cross-User Connections**
**Status**: Not implemented

**What you want**:
- Glowing connection icon on shared branches
- Visual badge showing "Connected to Kim's Tree"
- Indicator on memories showing they're cross-user shared

**What's needed**:
- UI components for connection badges
- Branch metadata indicating cross-user links
- Memory card updates to show cross-user origin

---

## Architecture Assessment

### ✅ Strong Foundation
The database schema is **well-designed** for cross-user linking:
- Person model supports global identity
- GroveTreeMembership supports cross-grove presence
- Branch model has `personId` for linking to global Person

### ⚠️ Missing Middle Layer
Need to build the **discovery and consent layer**:
1. Search/matching service
2. Connection request workflow
3. Notification system
4. Cross-grove permission logic

### 🎯 Recommended Implementation Order

#### Phase 1: Discovery (2-3 days)
- [ ] Create `/api/branches/search-person` endpoint
- [ ] Search by name for Users and Persons
- [ ] Return match suggestions with metadata
- [ ] Add "Connect to existing person" option in branch creation UI

#### Phase 2: Connection Requests (3-4 days)
- [ ] Create BranchConnectionRequest model
- [ ] POST `/api/branch-connections/request`
- [ ] POST `/api/branch-connections/:id/accept`
- [ ] POST `/api/branch-connections/:id/decline`
- [ ] Notification system integration
- [ ] UI for pending requests

#### Phase 3: Cross-User Sharing (4-5 days)
- [ ] Extend sharing logic for cross-grove scenarios
- [ ] Permission validation across grove boundaries
- [ ] Update memory sharing UI to show cross-user options
- [ ] Visual indicators for shared content

#### Phase 4: Auto-Linking (2 days)
- [ ] Auto-accept if Person.userId matches
- [ ] Auto-suggest connections on branch creation
- [ ] "Claim this branch" flow for registered users

---

## Questions to Clarify

1. **Branch vs Person Linking**: Your description mentions "branch to branch" linking, but the schema suggests "branch to Person" linking. Should branches link to:
   - A) Other specific branches across users?
   - B) A shared Person entity that appears in both users' groves?

2. **Permission Levels**: You mentioned:
   - owner → full control
   - co-sharer → edit caption/media, not delete
   - viewer → read-only

   Who sets these roles? The original owner or both parties?

3. **Memory Origin**: When a memory is created in a cross-linked branch:
   - Does it belong to the branch creator?
   - Does it belong to the Person owner?
   - Can both users see it by default?

4. **Discovery Scope**: Should search find:
   - Only public/discoverable Persons?
   - All Persons regardless of privacy settings?
   - Only registered Users?

---

## Current Cross-Branch Memory Sharing Demo

**What works TODAY** (within same grove):

```javascript
// Create memory on Branch A
const memory = await createMemory(branchA, "Summer 2020 trip")

// Share to Branch B (same tree)
await shareMemoryToBranch(memory.id, branchB.id)

// Both branches now show the memory
// Branch A = origin, full control
// Branch B = shared, shows "Shared from Branch A"
```

**What does NOT work**:
- Sharing across User A's grove to User B's grove
- Branch discovery when creating new branch
- Two-sided consent for connections

---

## Next Steps

I can help you build any of the missing pieces. Which would you like to tackle first?

1. **Quick Win**: Add discovery prompt to branch creation (shows if name matches existing user)
2. **Foundation**: Build connection request system
3. **Full Feature**: Complete cross-user memory sharing
4. **Testing**: Verify existing memory sharing works as expected within same grove

Let me know your priority and I'll start building!
