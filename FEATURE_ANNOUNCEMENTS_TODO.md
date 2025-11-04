# Feature Announcements & Welcome Popups - TODO

This document tracks which features need introduction popups for first-time users.

## Preview System Usage
Test any popup: `/grove?preview=featureName`

---

## ✅ COMPLETED

### Treasure Chest / Glow Trail
- **Preview:** `?preview=treasureWelcome`
- **Trigger:** treasureCount = 0
- **Status:** ✅ Deployed
- **Location:** `components/TreasureWelcomeModal.tsx`

---

## 🔲 TODO - CORE FEATURES

### 1. Branches (Memory Organization)
- **Preview:** `?preview=branchesWelcome`
- **Trigger:** User has 0 branches
- **Priority:** HIGH
- **Purpose:** Explain what branches are, why they matter
- **Key points:**
  - Organize memories by theme (childhood, wisdom, recipes, etc.)
  - Can be private or shared
  - Makes finding memories easier for heirs
  - Show example branch names

### 2. Heirs (Legacy Transfer)
- **Preview:** `?preview=heirsWelcome`
- **Trigger:** User has 0 heirs assigned
- **Priority:** HIGH
- **Purpose:** Core value prop - passing memories to loved ones
- **Key points:**
  - Choose who receives your memories
  - Set transfer conditions (immediately, after passing, specific date)
  - Heirs can be family, friends, organizations
  - Privacy and control

### 3. Voice Memories
- **Preview:** `?preview=voiceWelcome`
- **Trigger:** User has uploaded 0 audio entries
- **Priority:** MEDIUM
- **Purpose:** Encourage audio - most emotional format
- **Key points:**
  - Capture your voice for future generations
  - Tell stories in your own words
  - Easier than typing on mobile
  - Transcription available

### 4. Photo Memories
- **Preview:** `?preview=photoWelcome`
- **Trigger:** User has uploaded 0 photo entries
- **Priority:** MEDIUM
- **Purpose:** Encourage visual memories
- **Key points:**
  - Pictures tell stories words can't
  - Add context with captions
  - Multiple photos per memory
  - Safe storage for family photos

### 5. Video Memories
- **Preview:** `?preview=videoWelcome`
- **Trigger:** User has uploaded 0 video entries
- **Priority:** MEDIUM
- **Purpose:** Encourage richest format
- **Key points:**
  - Most personal format - voice + face + emotion
  - Share family recipes, tutorials, messages
  - Future generations hear and see you
  - Easy mobile recording

### 6. Grove Sharing / Co-Gardening
- **Preview:** `?preview=sharingWelcome`
- **Trigger:** User hasn't shared grove or invited anyone
- **Priority:** HIGH
- **Purpose:** Enable collaborative memory-keeping
- **Key points:**
  - Invite family to add memories together
  - Each person adds their perspective
  - Share the work of preserving memories
  - Richer, fuller family story

### 7. Memory Prompts
- **Preview:** `?preview=promptsWelcome`
- **Trigger:** User has never used a prompt
- **Priority:** LOW
- **Purpose:** Help overcome blank-page syndrome
- **Key points:**
  - Thoughtful questions to spark memories
  - Different categories (childhood, wisdom, family stories)
  - Optional - but helpful when stuck
  - New prompts regularly

### 8. Trees vs Open Grove
- **Preview:** `?preview=organizationWelcome`
- **Trigger:** First memory/tree creation
- **Priority:** HIGH
- **Purpose:** Explain organizational structure
- **Key points:**
  - Trees = person-focused (grandma, dad, etc.)
  - Open Grove = theme-focused (family recipes, farm history)
  - Choose structure that fits your story
  - Can use both

### 9. Nest (Profile/Settings)
- **Preview:** `?preview=nestWelcome`
- **Trigger:** First visit to /nest or incomplete profile
- **Priority:** LOW
- **Purpose:** Encourage complete profile
- **Key points:**
  - Your info helps heirs understand context
  - Set your own legacy preferences
  - Upload your photo
  - Update as life changes

### 10. Firefly Bursts (Weekly Memory Reminders)
- **Preview:** `?preview=burstsWelcome`
- **Trigger:** User has snoozed/dismissed multiple times
- **Priority:** LOW
- **Purpose:** Re-engage with gentle reminders
- **Key points:**
  - Weekly nudges to capture memories
  - Shows memories from this week in past years
  - Can snooze if not the right time
  - Helps maintain momentum

---

## 🔲 TODO - ADVANCED FEATURES

### 11. Export / Backup
- **Preview:** `?preview=exportWelcome`
- **Trigger:** User has 10+ memories but never exported
- **Priority:** LOW
- **Purpose:** Peace of mind, data ownership
- **Key points:**
  - Download all memories as PDF/ZIP
  - Your data, your control
  - Backup for safekeeping
  - Share outside platform if needed

### 12. Capacity Management
- **Preview:** `?preview=capacityWelcome`
- **Trigger:** User at 80% capacity
- **Priority:** MEDIUM
- **Purpose:** Upgrade awareness before hitting limit
- **Key points:**
  - Show current usage
  - Explain what counts toward capacity
  - Upgrade options
  - What happens at limit

### 13. Legacy Mode / Freezing
- **Preview:** `?preview=freezeWelcome`
- **Trigger:** User mentions "passing" or elder-related keywords
- **Priority:** LOW
- **Purpose:** Sensitive topic, important feature
- **Key points:**
  - Lock grove from editing
  - Ensures memories preserved as intended
  - Heirs notified
  - Reversible if needed

### 14. Transplanting (Moving People Between Groves)
- **Preview:** `?preview=transplantWelcome`
- **Trigger:** User has multiple groves, hasn't transplanted
- **Priority:** LOW
- **Purpose:** Advanced organization feature
- **Key points:**
  - Move person-trees between groves
  - Reorganize as family structure changes
  - Keeps memories intact
  - Useful for shared groves

---

## 🔲 TODO - SUBSCRIPTION/UPGRADE

### 15. Premium Features Overview
- **Preview:** `?preview=premiumWelcome`
- **Trigger:** Free user approaching limits
- **Priority:** MEDIUM
- **Purpose:** Soft upgrade encouragement
- **Key points:**
  - Unlimited storage
  - More trees/branches
  - Priority support
  - Advanced features

### 16. Beta Tester Perks
- **Preview:** `?preview=betaWelcome`
- **Trigger:** Beta tester first login
- **Priority:** HIGH (for beta program)
- **Purpose:** Thank beta testers, explain perks
- **Key points:**
  - Early access to features
  - Discounted pricing
  - Your feedback shapes the product
  - Special badge/recognition

---

## 🔲 TODO - SEASONAL/CONTEXTUAL

### 17. Holiday Memory Prompts
- **Preview:** `?preview=holidayWelcome`
- **Trigger:** Major holidays (Thanksgiving, Christmas, etc.)
- **Priority:** LOW
- **Purpose:** Timely encouragement
- **Key points:**
  - "Capture holiday traditions"
  - "Record family recipes being made today"
  - Seasonal prompts
  - Limited-time feel

### 18. Anniversary Reminders
- **Preview:** `?preview=anniversaryWelcome`
- **Trigger:** 1 year since joining, significant milestones
- **Priority:** LOW
- **Purpose:** Celebrate user journey
- **Key points:**
  - "You've captured X memories this year"
  - Growth visualization
  - Encouragement to continue
  - Reflect on journey

---

## IMPLEMENTATION NOTES

### Standard Pattern:
1. Create modal component: `components/FeatureWelcomeModal.tsx`
2. Add state to grove page: `const [showFeatureWelcome, setShowFeatureWelcome] = useState(false)`
3. Add trigger logic in appropriate place
4. Add preview parameter: `if (preview === 'featureName')`
5. Add localStorage key: `featureWelcomeDismissed`
6. Test with: `/grove?preview=featureName`

### Design Guidelines:
- Use Firefly Grove voice (poetic, gentle, meaningful)
- 3-4 key points maximum
- Visual icon/emoji for each point
- Clear primary action button
- Optional "Maybe later" dismiss
- Mobile-responsive
- Glowing green border aesthetic
- Backdrop blur

### Trigger Timing:
- First-time features: Show immediately when condition met
- Re-engagement: Show after 3-7 days of inactivity
- Upgrades: Show at 80% capacity, never pushy
- Seasonal: Show once per season/holiday
- Milestones: Show once at milestone

### Priority Order for Next Session:
1. Heirs (core value prop)
2. Branches (core organization)
3. Grove Sharing (collaborative feature)
4. Trees vs Open Grove (fundamental concept)
5. Voice/Photo/Video (engagement)

---

## TRACKING

- Total popups needed: 18
- Completed: 1 (Treasure Chest)
- In Progress: 0
- Remaining: 17

**Last Updated:** 2025-01-04
