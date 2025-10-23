# Cross-Branch Sharing, Memory Association Controls & Unlimited Legacy Trees

## Implementation Status

### ✅ Completed: Database Schema & Core APIs

#### **Schema Models Added**
1. **MemoryBranchLink** - Links memories to multiple branches
   - `role`: "origin" or "shared"
   - `visibilityStatus`: active, removed_by_branch, removed_by_user, pending_approval

2. **MemoryLocalMeta** - Per-branch metadata for shared memories
   - Local reactions/comments count
   - Pinned status

3. **BranchPreferences** - Memory association controls
   - `canBeTagged`: Allow others to share memories to this branch
   - `requiresTagApproval`: Require approval before shared memories appear
   - `visibleInCrossShares`: Visibility in cross-branch contexts

4. **LegacyHeir** - Legacy tree stewards and heirs
   - `role`: "steward" or "heir"

5. **Branch Updates** - Legacy tree enhancements
   - `type`: "living" or "legacy"
   - `legacyMarkedBy`: User who marked as legacy
   - `legacyProofUrl`: Optional proof artifact (private)

#### **API Endpoints Created**

**Memory Sharing:**
- ✅ `POST /api/memories/:memoryId/share` - Share memory to multiple branches
- ✅ `POST /api/memories/:memoryId/remove-from-branch` - Remove from branch (no notification)

**Association Controls:**
- ✅ `GET /api/branches/:branchId/preferences` - Get tagging preferences
- ✅ `PATCH /api/branches/:branchId/preferences` - Update tagging preferences
- ✅ `POST /api/memories/:memoryId/approve` - Approve pending shared memory
- ✅ `DELETE /api/memories/:memoryId/approve` - Decline pending shared memory

**Legacy Transitions:**
- ✅ `PATCH /api/branches/:branchId/legacy` - Mark branch as legacy with optional proof

---

## 🚧 Required Implementation (Before Production)

### 1. UI Components

#### Shared Memory Display
- ❌ **MemoryCard Updates** (`components/MemoryCard.tsx`)
  - Show "Shared" chip for shared memories
  - Display origin branch name
  - "Also in: Branch Name(s)" subtitle
  - "Remove from My Branch" button (quiet, non-destructive)
  - Edit propagates to all branches (show indicator)

#### Memory Creation Flow
- ❌ **Add "Also share with..." Section** (`components/MemoryModal.tsx`)
  - Multi-select branches dropdown
  - Show which branches require approval
  - Warn if branch has tagging disabled
  - Preview: "Will appear in 3 branches"

#### Branch Settings
- ❌ **Tagging & Sharing Controls** (`components/BranchSettingsModal.tsx`)
  - Toggle: "Allow shared memories that include me" (default: on)
  - Toggle: "Require my approval before shared memories appear" (default: off)
  - Toggle: "Do not allow others to tag/link my Branch" (hard opt-out)
  - Copy: "Tagging and sharing controls"

#### Pending Approvals View
- ❌ **Create PendingApprovals Component**
  - Show list of pending shared memories
  - Preview card with origin branch
  - "Approve" / "Decline" buttons
  - Batch actions: "Approve All" / "Decline All"
  - Location: Branch settings or dedicated page

#### Legacy Tree UI
- ❌ **Legacy Marking Modal**
  - Affirmation checkbox: "To the best of my knowledge, this person has passed"
  - Optional proof upload (obituary link, memorial program)
  - Birth/death date fields
  - Copy: "You're honoring a life. Memories added here will be preserved with a calm, steady glow."

- ❌ **Empty Legacy Prompt**
  - Show when legacy branch has 0 memories
  - Gentle prompt: "Add a memory to light this legacy"
  - Suggested prompts:
    - "Share a story about them"
    - "Upload a photo of a keepsake"
    - "Record a voice reflection"

- ❌ **Legacy Read-Only with Addendum**
  - Shared memories in legacy branches show read-only
  - Stewards/heirs can add "Addendum" (local reflection)
  - Addendum appears below original memory
  - Copy: "Add your reflection" (not "Edit")

### 2. Business Logic Functions

#### Memory Sharing Logic (`lib/sharing.ts`)
```typescript
// ❌ Create file
export async function getMemoryLinks(memoryId: string): Promise<MemoryBranchLink[]>
export async function canShareToBranch(branchId: string): Promise<boolean>
export async function getSharedBranches(memoryId: string): Promise<Branch[]>
export async function getMostRestrictiveVisibility(branchIds: string[]): Promise<string>
export async function propagateMemoryUpdate(memoryId: string, updates: Partial<Entry>): Promise<void>
```

#### Association Control Logic (`lib/association.ts`)
```typescript
// ❌ Create file
export async function getBranchPreferences(branchId: string): Promise<BranchPreferences>
export async function canTagBranch(branchId: string): Promise<boolean>
export async function requiresApproval(branchId: string): Promise<boolean>
export async function getPendingApprovals(branchId: string): Promise<MemoryBranchLink[]>
```

#### Legacy Logic (`lib/legacy.ts`)
```typescript
// ❌ Create file
export async function isLegacyBranch(branchId: string): Promise<boolean>
export async function getEmptyLegacyBranches(): Promise<Branch[]>
export async function hasMemories(branchId: string): Promise<boolean>
export async function getLegacyDaysSinceCreation(branchId: string): Promise<number>
```

### 3. Background Jobs

#### Empty Legacy Reminder (`app/api/cron/legacy-reminders/route.ts`)
```typescript
// ❌ Create file
// Runs weekly via Vercel Cron or similar
// Finds legacy branches with:
//   - type = 'legacy'
//   - 0 memories
//   - Created > 30 days ago
//   - No reminder sent in last 7 days
// Sends gentle email to steward:
//   "This legacy deserves a light. Add a story or photo when you're ready."
```

### 4. Telemetry Events

Add to analytics tracking (`lib/analytics.ts`):

```typescript
// ❌ Add events
export const EVENTS = {
  // Cross-branch sharing
  MEMORY_SHARED_CREATED: 'memory_shared_created',
  MEMORY_SHARED_REMOVED_BY_BRANCH: 'memory_shared_removed_by_branch',
  MEMORY_REMOVED_BY_USER: 'memory_removed_by_user',

  // Association controls
  TAG_APPROVAL_REQUIRED_SHOWN: 'tag_approval_required_shown',
  TAG_APPROVED: 'tag_approved',
  TAG_DECLINED: 'tag_declined',
  BRANCH_PREFERENCES_UPDATED: 'branch_preferences_updated',

  // Legacy
  BRANCH_MARKED_LEGACY: 'branch_marked_legacy',
  LEGACY_FIRST_MEMORY_ADDED: 'legacy_first_memory_added',
  LEGACY_EMPTY_REMINDER_SENT: 'legacy_empty_reminder_sent',
  LEGACY_PROOF_ATTACHED: 'legacy_proof_attached',
}
```

### 5. Visual & Motion Updates

#### CSS Variables (`app/globals.css`)
Already exist from previous implementation:
- ✅ `--legacy-amber`, `--legacy-silver`, `--legacy-text`, `--legacy-glow`
- ✅ `legacyPulse` animation (6s cycle, no drift)

Add new:
- ❌ Shared memory chip style
- ❌ Pending approval badge style
- ❌ Addendum visual treatment

#### Design Tokens
```css
/* ❌ Add to globals.css */
.chip-shared {
  background: var(--firefly-dim, #cc9933) / 0.2;
  color: var(--firefly-glow, #ffd966);
  border: 1px solid var(--firefly-dim, #cc9933) / 0.3;
}

.chip-pending {
  background: var(--text-muted, #8892a6) / 0.2;
  color: var(--text-soft, #e0e6ed);
  border: 1px solid var(--border-subtle, #1a1f2e);
}

.legacy-addendum {
  border-left: 3px solid var(--legacy-amber);
  background: var(--legacy-amber) / 0.05;
  padding-left: 1rem;
  margin-top: 1rem;
  font-style: italic;
  color: var(--legacy-text);
}
```

### 6. Copy & User Experience

#### Shared Memory
- Chip: "Shared"
- Tooltip: "This moment is shared with other branches"
- Action: "Remove from this Branch" (not "Delete")
- Confirmation: "Remove this memory from your branch? It will remain visible in other branches."

#### Tagging Preferences
- Hard opt-out: "This Branch doesn't accept shared tags"
- Approval required: "Pending your approval"
- Settings label: "Tagging and sharing controls"

#### Legacy Trees
- Mark as Legacy: "You're honoring a life. Memories added here will be preserved with a calm, steady glow."
- Empty prompt: "Add a memory to light this legacy"
- Reminder: "This legacy deserves a light. Add a story or photo when you're ready."
- Proof section: "Attach proof (optional)" with subtitle "Obituary link, memorial program, etc. — kept private"
- Affirmation: "To the best of my knowledge, this person has passed."

### 7. Edge Cases & Policy

#### Shared Memory with Opt-Out
- Memory remains for others
- Link set to `removed_by_user` for that branch
- No notification sent to original creator
- Audit log records the change

#### Visibility Inheritance
- Memory inherits most restrictive visibility from participating branches
- If any branch is PRIVATE, all viewing is restricted
- Legacy branches display shared memories read-only

#### Legacy Tree in Living Branch
- Memory appears in both
- Legacy context shows read-only
- Living branch allows normal interactions
- Addendum appears only in legacy view

#### Leaving a Grove (Future Feature)
- Creator keeps memories they authored
- Shared links to their branches are detached
- Other branches retain the memory

#### Abuse & Reporting
- Any memory can be reported from any branch
- Admin can hide globally or tombstone
- Tombstone: "Removed by admin on [date]"

---

## 📊 Database Migration Notes

### Migration Order
1. Add new models (MemoryBranchLink, MemoryLocalMeta, BranchPreferences, LegacyHeir)
2. Add new Branch fields (type, legacyMarkedBy, legacyProofUrl)
3. Backfill MemoryBranchLink for existing entries:
   - Create `role: 'origin'` link for each Entry ↔ Branch relationship
4. Create default BranchPreferences for all existing branches

### Migration Script (`prisma/migrations/add-sharing-legacy.ts`)
```typescript
// ❌ Create migration script
// 1. Create origin links for all existing memories
// 2. Create default preferences for all branches
// 3. No data loss - purely additive
```

---

## 🧪 Testing Scenarios

### Cross-Branch Sharing
- [ ] Create memory in Branch A, share to Branch B & C
- [ ] Edit memory in Branch A → changes appear in B & C
- [ ] Remove from Branch B → remains in A & C
- [ ] Branch C has `requiresTagApproval: true` → appears as pending
- [ ] Approve in Branch C → becomes visible
- [ ] Decline in Branch C → hidden from that branch

### Association Controls
- [ ] Set branch to `canBeTagged: false` → sharing attempts blocked
- [ ] Set `requiresTagApproval: true` → new shares go to pending
- [ ] Approve pending memory → becomes active
- [ ] Decline pending memory → hidden, no notification
- [ ] Batch approve/decline multiple pending memories

### Legacy Trees
- [ ] Mark branch as legacy with affirmation → visual changes apply
- [ ] Mark branch as legacy with proof URL → privately stored
- [ ] Create legacy branch → prompt to add first memory
- [ ] Legacy branch sits empty for 30 days → reminder sent
- [ ] Add first memory → "LEGACY_FIRST_MEMORY_ADDED" event fires
- [ ] Shared memory in legacy branch → read-only with addendum option
- [ ] Heir adds addendum → appears below original memory

### Visibility & Privacy
- [ ] Share memory to PRIVATE and SHARED branches → inherits PRIVATE
- [ ] User without access to PRIVATE branch → cannot see memory
- [ ] Legacy branch + Living branch → respects both contexts

---

## 🚀 Rollout Plan

### Phase 1: Cross-Branch Sharing (Week 1)
1. Run database migration
2. Deploy sharing APIs
3. Update MemoryCard UI
4. Add "Also share with..." to memory creation
5. Internal testing with conservative defaults
6. Gradual rollout to users

### Phase 2: Association Controls (Week 2)
1. Deploy preferences APIs
2. Add branch settings UI
3. Create pending approvals view
4. Email notifications for pending approvals (optional)
5. User education: "New privacy controls available"

### Phase 3: Unlimited Legacy Trees (Week 3)
1. Remove any existing legacy caps
2. Deploy updated legacy marking API
3. Add empty legacy prompts
4. Set up weekly reminder cron job
5. Communication: "Honor unlimited loved ones"

---

## 🎯 Success Metrics

### Engagement
- % of memories shared to multiple branches
- Average branches per shared memory
- Approval rate for pending memories
- Legacy branches with at least 1 memory (target: >80%)

### Health
- Opt-out rate (expect <5%)
- Approval requirement adoption (expect 5-10%)
- Empty legacy branches (target: <20% after 60 days)
- Abuse reports related to shared memories (target: <1%)

### User Sentiment
- Survey: "Sharing across branches is useful" (target: >70% agree)
- Survey: "I feel in control of my privacy" (target: >80% agree)
- Survey: "Legacy prompts are respectful" (target: >75% agree)

---

## 🔐 Privacy & Security

- Proof URLs stored privately, never displayed publicly
- Audit logs track all sharing actions
- No notifications on opt-out to avoid confrontation
- Most restrictive visibility always wins
- Admin override with audit trail

---

**Current Status**: Schema complete, core APIs implemented
**Next Step**: Create UI components for shared memory display
**Estimated Remaining**: 12-15 hours development + testing
