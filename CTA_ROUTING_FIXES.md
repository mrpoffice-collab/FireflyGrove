# Discovery Modal CTA Routing - Issues & Fixes

**Date:** 2025-11-08
**Status:** Needs fixing

---

## Current State Analysis

### ✅ Working CTAs:

1. **TreesVsBranchesWelcomeModal**
   - **Current CTA:** "Plant My First Tree"
   - **Current Action:** `router.push('/grove/new-tree')`
   - **Status:** ✅ CORRECT

2. **HeirsWelcomeModal**
   - **Current CTA:** "Choose My Keepers"
   - **Current Action:** Routes to first available branch with settings modal
   - **Status:** ✅ CORRECT (complex but works)

### ❌ Broken CTAs:

3. **SharingWelcomeModal**
   - **Current CTA:** "Invite Someone to Garden"
   - **Current Action:** Just closes modal (`setShowSharingWelcome(false)`)
   - **Problem:** ❌ Doesn't take user anywhere!
   - **Should Do:** Route to first branch with `?openSharing=true` or open sharing modal

4. **VoiceMemoriesWelcomeModal** (in branch page)
   - **Current CTA:** "Record a Memory"
   - **Current Action:** Need to check app/branch/[branchId]/page.tsx
   - **Should Do:** Open new memory modal with audio tab selected

5. **PhotoMemoriesWelcomeModal** (in branch page)
   - **Current CTA:** "Add a Photo"
   - **Current Action:** Need to check app/branch/[branchId]/page.tsx
   - **Should Do:** Open new memory modal with photo upload OR route to /nest

6. **NestWelcomeModal** (in nest page)
   - **Current CTA:** "Upload Photos"
   - **Current Action:** Need to check app/nest/page.tsx
   - **Should Do:** Focus on upload area or trigger file picker

---

## Required Fixes

### Fix 1: SharingWelcomeModal in Grove Page

**Location:** `app/grove/page.tsx`

**Current Code:**
```typescript
const handleSharingWelcomeAction = () => {
  // For now just close - user will need to go to branch settings
  // Could improve by storing which branch to auto-open settings for
  setShowSharingWelcome(false)
}
```

**Fixed Code:**
```typescript
const handleSharingWelcomeAction = () => {
  handleSharingWelcomeClose() // Mark as seen

  // Find first available branch to share
  const firstBranch = branches?.[0]
  if (firstBranch) {
    router.push(`/branch/${firstBranch.id}?openSharing=true`)
  } else {
    // Fallback: just go to grove
    router.push('/grove')
  }
}
```

**Note:** Will also need to add URL param handling in branch page to auto-open sharing modal

---

### Fix 2: VoiceMemoriesWelcomeModal in Branch Page

**Location:** `app/branch/[branchId]/page.tsx`

**Need to find current implementation and ensure:**
```typescript
const handleVoiceWelcomeAction = () => {
  handleVoiceWelcomeClose() // Mark as seen

  // Open new memory modal with audio tab pre-selected
  setNewMemoryModalDefaultTab('audio')
  setShowNewMemoryModal(true)
}
```

---

### Fix 3: PhotoMemoriesWelcomeModal in Branch Page

**Location:** `app/branch/[branchId]/page.tsx`

**Two options:**

**Option A: Open new memory modal**
```typescript
const handlePhotoWelcomeAction = () => {
  handlePhotoWelcomeClose()

  // Open new memory modal with photo tab
  setNewMemoryModalDefaultTab('photo')
  setShowNewMemoryModal(true)
}
```

**Option B: Route to Nest (better for bulk)**
```typescript
const handlePhotoWelcomeAction = () => {
  handlePhotoWelcomeClose()
  router.push('/nest')
}
```

**Recommendation:** Use Option B (Nest) - more aligned with bulk photo workflow

---

### Fix 4: NestWelcomeModal in Nest Page

**Location:** `app/nest/page.tsx`

**Should:**
```typescript
const handleNestWelcomeAction = () => {
  handleNestWelcomeClose()

  // Trigger file upload picker
  uploadInputRef.current?.click()

  // OR scroll to upload area
  uploadAreaRef.current?.scrollIntoView({ behavior: 'smooth' })
}
```

---

## Additional Enhancement: Auto-Open Modals via URL Params

To make CTAs work properly, we need URL param support:

### In Branch Page (`app/branch/[branchId]/page.tsx`)

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search)

  // Auto-open sharing modal
  if (params.get('openSharing') === 'true') {
    setShowSettingsModal(true)
    setSettingsTab('sharing') // Or however sharing is opened
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname)
  }

  // Auto-open new memory with specific tab
  const openMemory = params.get('openMemory')
  if (openMemory) {
    setNewMemoryModalDefaultTab(openMemory as 'text' | 'audio' | 'photo')
    setShowNewMemoryModal(true)
    window.history.replaceState({}, '', window.location.pathname)
  }
}, [])
```

---

## Testing Checklist

After fixes, test each modal:

- [ ] TreesVsBranchesWelcomeModal → Creates tree
- [ ] HeirsWelcomeModal → Opens heir settings
- [ ] SharingWelcomeModal → Opens sharing settings/modal
- [ ] VoiceMemoriesWelcomeModal → Opens audio recording
- [ ] PhotoMemoriesWelcomeModal → Routes to nest or opens photo upload
- [ ] NestWelcomeModal → Triggers file picker

---

## Next: Knowledge Bank Reminder Popup

After fixing CTAs, build the "dismissed modal" reminder:

**Component:** `KnowledgeBankReminderPopup.tsx`

**Shows when:** User clicks "Maybe later" or X to close
**Where:** Bottom-right corner
**Auto-dismiss:** 5 seconds
**Content:** "💡 You can find this tip again in Knowledge Bank [View] [X]"

---

**Priority:** HIGH - These CTAs are critical UX
**Estimated Time:** 1-2 hours to fix all
