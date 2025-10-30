# 🔄 Facebook/Instagram Import Feature Design

## Overview
Two-way bridge between Firefly Grove and social media: Import FROM Facebook/Instagram and share TO them. This solves the activation energy problem by making Firefly Grove the primary vault with social media as distribution channels.

## 🎯 Core Questions Answered

### 1. Where Do Imported Items Go?
**Answer: The Nest (Staging Area)**

Imported Facebook/Instagram posts go to **Your Nest** as a staging area where you can:
- Review what was imported
- Add context and notes
- Group related memories together
- Choose which branch each memory should join
- Filter out unwanted content

Think of it like this:
- **Facebook/Instagram** = Your scattered memory fragments
- **The Nest** = Your organizing table
- **Branches** = Your permanent memory albums

### 2. How Are They Formatted?
**Answer: Memory-Style with Enhanced Metadata**

Each imported post becomes a **Nest Item** with:
- Original photo(s) from the post
- Original caption as the memory text
- Facebook/Instagram comments preserved as "Notes to Add"
- Post date becomes memory date
- Ready to "Hatch" into any branch

**Example Format:**
```
┌─────────────────────────────────────┐
│ 📸 From Facebook - Dec 25, 2023     │
│ ✨ 3 photos • 12 comments           │
├─────────────────────────────────────┤
│ [Photo 1] [Photo 2] [Photo 3]       │
│                                     │
│ "Best Christmas ever with the      │
│  family! So grateful for these     │
│  moments together."                │
│                                     │
│ 💬 Comments to Review:              │
│ • Mom: "Beautiful memories!"        │
│ • Sarah: "Miss you all so much"    │
│ • John: "Great times!"             │
│                                     │
│ [Add to Branch ▼] [Edit] [Delete]  │
└─────────────────────────────────────┘
```

### 3. What About Multiple Images?
**Answer: Grouped Together as Photo Collections**

Posts with multiple images (like vacation albums) stay grouped:
- Import as single Nest item with **photo gallery**
- Preview shows all images in grid
- Can "Hatch" entire collection to branch as one memory
- Or split into separate memories if preferred

**Vacation Post Example:**
```
┌────────────────────────────────────────┐
│ 🏖️ Hawaii Trip - July 2023            │
│ ✨ 15 photos from vacation album      │
├────────────────────────────────────────┤
│ [🖼️][🖼️][🖼️][🖼️][🖼️]                 │
│ [🖼️][🖼️][🖼️][🖼️][🖼️]                 │
│ [🖼️][🖼️][🖼️][🖼️][🖼️]                 │
│                                        │
│ "Two weeks in paradise! Every sunset  │
│  more beautiful than the last."       │
│                                        │
│ Actions:                               │
│ • Hatch all 15 to "Family Vacations"  │
│ • Split by day (5 memories)           │
│ • Select favorites (3 memories)       │
└────────────────────────────────────────┘
```

### 4. What About Memes and Non-Memories?
**Answer: AI Content Filtering with User Control**

Smart filtering helps identify what matters:

**✅ AUTO-IMPORT (High Confidence Memories):**
- Photos with people (faces detected)
- Posts with emotional keywords ("love", "grateful", "miss")
- Photos from albums named "Family", "Vacation", "Wedding"
- Posts with location tags
- Photos with 5+ comments from friends/family

**⚠️ REVIEW NEEDED (Uncertain):**
- Single photos with minimal text
- Posts with mixed content
- Screenshots with personal context

**❌ AUTO-SKIP (Likely Non-Memories):**
- Memes (text overlays, stock images)
- Shared articles/links
- Political posts
- Commercial/promotional content
- Screenshots of tweets/other social media

**User Control:**
- Preview everything BEFORE importing
- Toggle categories on/off
- Override AI decisions
- See confidence scores

## 🎨 The Complete User Experience

### Step 1: Connect Your Account
```
┌───────────────────────────────────────────┐
│ Import Memories from Facebook/Instagram  │
├───────────────────────────────────────────┤
│                                           │
│   🔐 Your data stays private in          │
│      Firefly Grove. We don't sell your   │
│      information or show you ads.        │
│                                           │
│   What we'll import:                     │
│   ✓ Photos you've posted                │
│   ✓ Original captions and dates          │
│   ✓ Comments from friends/family         │
│   ✓ Album collections                    │
│                                           │
│   What we WON'T import:                  │
│   × Shared posts from others             │
│   × Ads you've seen                      │
│   × Memes and viral content              │
│                                           │
│   [Connect Facebook] [Connect Instagram] │
│                                           │
└───────────────────────────────────────────┘
```

### Step 2: Select What to Import
```
┌────────────────────────────────────────────┐
│ Select Albums & Date Range                │
├────────────────────────────────────────────┤
│                                            │
│ Albums Found:                              │
│ ☑️ Family Photos (423 photos)             │
│ ☑️ Vacations (187 photos)                 │
│ ☑️ Mom's Memorial (34 photos) ⭐          │
│ ☑️ Christmas 2023 (56 photos)             │
│ ☐ Profile Pictures (89 photos)            │
│ ☐ Random/Other (1,234 photos)             │
│                                            │
│ Date Range:                                │
│ [2010] ←──────────────→ [2024]            │
│                                            │
│ Smart Filters:                             │
│ ☑️ Posts with people in photos            │
│ ☑️ Posts with 3+ comments                 │
│ ☑️ Posts with emotional keywords          │
│ ☐ Include all posts                       │
│                                            │
│ 📊 Preview: ~487 memories will be imported│
│                                            │
│ [Back] [Import to Nest →]                 │
│                                            │
└────────────────────────────────────────────┘
```

### Step 3: Smart Routing (For Large Imports)
```
┌────────────────────────────────────────────┐
│ 🧠 Smart Import Assistant                 │
├────────────────────────────────────────────┤
│                                            │
│ You're importing 2,147 photos!            │
│ Let's organize them automatically...      │
│                                            │
│ AI Detected Groups:                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                            │
│ 👤 People Detected:                        │
│ ☑️ Mom (342 photos) → [Mom's Tree ▼]     │
│ ☑️ Dad (287 photos) → [Dad's Tree ▼]     │
│ ☑️ Sarah (156 photos) → [Sarah's Tree ▼] │
│ ☑️ Multiple family (421 photos)           │
│    → [Family Celebrations ▼]              │
│                                            │
│ 📅 Time Periods:                           │
│ ☑️ 2020-2024 (834 photos)                 │
│    → [Recent Memories ▼]                  │
│ ☑️ 2015-2019 (456 photos)                 │
│    → [The 2010s ▼]                        │
│ ☑️ 2010-2014 (287 photos)                 │
│    → [Earlier Years ▼]                    │
│                                            │
│ 🏷️ Album Names:                            │
│ ☑️ "Mom's Memorial" (34 photos)           │
│    → [Mom's Tree ▼]                       │
│ ☑️ "Hawaii 2022" (43 photos)              │
│    → [Vacations ▼]                        │
│ ☑️ "Christmas 2023" (56 photos)           │
│    → [Holidays ▼]                         │
│                                            │
│ 🤔 Needs Review:                           │
│ ⚠️ 183 photos couldn't be categorized    │
│    → [Review in Nest]                     │
│                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                            │
│ Summary:                                   │
│ • 1,964 photos will auto-route to branches│
│ • 183 photos will go to Nest for review   │
│ • You can adjust any routing before import│
│                                            │
│ [Adjust Rules] [Preview All]              │
│ [Start Smart Import →]                    │
│                                            │
└────────────────────────────────────────────┘
```

### Step 3b: Review in Nest (Small Batch)
```
┌────────────────────────────────────────────┐
│ 🪺 Your Nest - 183 Items Need Review      │
├────────────────────────────────────────────┤
│                                            │
│ These couldn't be auto-categorized:       │
│                                            │
│ Filter: [All ▼] [No People ▼] [Unknown ▼] │
│                                            │
│ ☑️ Select All (183)  [Bulk Hatch ▼]       │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ 📸 Sunset Photo - July 2022          │  │
│ │ ✨ 1 photo • No caption               │  │
│ │ [Preview]                             │  │
│ │                                       │  │
│ │ Why in Nest? No faces detected        │  │
│ │ [Hatch to Branch ▼] [Delete]          │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ 🎂 Group Photo - Unknown date        │  │
│ │ ✨ 1 photo • 5 comments               │  │
│ │ [Preview]                             │  │
│ │                                       │  │
│ │ Why in Nest? Date unclear             │  │
│ │ [Hatch to Branch ▼] [Delete]          │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ [Select Multiple] [Bulk Delete]            │
│                                            │
└────────────────────────────────────────────┘
```

### Step 4: Hatch to Branches
```
┌──────────────────────────────────────┐
│ Hatch to Branch                      │
├──────────────────────────────────────┤
│                                      │
│ Memory: "Mom's 70th Birthday"        │
│ 8 photos, March 15, 2023             │
│                                      │
│ Select Branch:                       │
│ ○ Mom's Memorial Tree 🕯️            │
│ ○ Family Celebrations               │
│ ○ 2023 Highlights                   │
│                                      │
│ Add Context (Optional):              │
│ ┌──────────────────────────────────┐ │
│ │ Looking at these photos now, I   │ │
│ │ cherish every moment we shared   │ │
│ │ that day. Mom was so happy.      │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Visibility:                          │
│ ○ Private (only you)                │
│ ● Shared (branch members)           │
│ ○ Legacy (public memorial)          │
│                                      │
│ Include Facebook comments?           │
│ ☑️ Yes, preserve all 24 comments    │
│                                      │
│ [Cancel] [Hatch to Branch →]        │
│                                      │
└──────────────────────────────────────┘
```

## 🤖 Smart Routing Logic (for 2000+ Photo Imports)

### The Problem:
With 2000 photos, manually organizing each one in the Nest is overwhelming. You need intelligent automation that routes 90%+ directly to the right branches.

### The Solution: Multi-Pass AI Analysis

**Pass 1: Face Recognition**
- Use Facebook's tagged photos metadata
- "Photos of Mom" → auto-route to Mom's Tree
- "Photos with Dad" → auto-route to Dad's Tree
- Multiple people → route to "Family Celebrations" or most-featured person's tree

**Pass 2: Album Intelligence**
- Album name contains person's name → route to their tree
- "Mom's 70th Birthday" → Mom's Tree
- "Hawaii Vacation" → Vacations branch (or create new)
- "Christmas 2023" → Holidays branch (or create new)

**Pass 3: Caption Analysis (AI)**
- Use Claude to analyze caption text
- Keywords like "miss you Mom" → Mom's Tree
- "vacation in Hawaii" → Vacations
- "grateful for family" → Family Celebrations

**Pass 4: Date Clustering**
- Group photos within 24 hours as "events"
- Events with 10+ photos → likely vacation/celebration
- Suggest creating new branch or route to time-based branch

**Pass 5: Social Signals**
- 5+ comments = high-value memory
- Comments from specific people suggest routing
- Mom commented on 50 photos → all to Mom's Tree

**Pass 6: Landscape & Nature Memory Detection** ⭐
This handles sunsets, landscapes, places without people but WITH emotional meaning:

**HIGH-VALUE NATURE MEMORIES (auto-import):**
- Has caption with emotional context ("beautiful sunset on our anniversary")
- Has location tag ("Hawaii", "Mom's favorite beach")
- Multiple comments from friends/family (shows it mattered)
- Part of vacation/trip album (context from other photos)
- Posted during significant date (vacation dates, holidays)
- Caption mentions people ("wish you were here Mom", "thinking of Dad")

**PROBABLE MEMORIES (review in Nest):**
- Generic caption or no caption ("Sunset 🌅")
- No location tag
- Few or no comments
- Not part of larger album/event

**Example Smart Routing:**
```
Photo: Beach sunset, no people
Caption: "Last sunset on Maui before heading home. Miss this place already! 🌺"
Location: Maui, Hawaii
Album: "Hawaii Trip 2022"
Comments: 8 (friends saying "gorgeous!", "so jealous!")
→ AI Decision: HIGH CONFIDENCE
→ Auto-route to: "Hawaii Trip 2022" branch (with other vacation photos)

Photo: Sunset, no people
Caption: "🌅"
Location: None
Album: "Timeline Photos"
Comments: 1
→ AI Decision: UNCERTAIN
→ Send to Nest with note: "Landscape photo with minimal context"
```

### Confidence Scoring:

```
HIGH CONFIDENCE (auto-route): 95%+ confidence
├─ Face tagged + album name match + caption mentions person
├─ Memorial album (obvious destination)
└─ All photos from same event/vacation

MEDIUM CONFIDENCE (suggest but confirm): 70-94%
├─ Face detected but not tagged
├─ Caption mentions person but no face
└─ Album name suggests destination

LOW CONFIDENCE (send to Nest): <70%
├─ No faces, no caption, no album context
├─ Multiple possible destinations
└─ Unclear content or purpose
```

### User Control:

**Before Import:**
```
┌────────────────────────────────────────┐
│ Review Auto-Routing Rules             │
├────────────────────────────────────────┤
│                                        │
│ 342 photos of Mom → Mom's Tree        │
│ [Change Destination] [Split by Date]  │
│                                        │
│ 287 photos of Dad → Dad's Tree        │
│ [Change Destination] [Split by Date]  │
│                                        │
│ 43 "Hawaii 2022" → Create New Branch? │
│ [Yes, Create "Hawaii 2022"]           │
│ [No, Use Existing: Vacations ▼]       │
│                                        │
│ Advanced Options:                      │
│ ☑️ Create new branch for each album   │
│ ☐ Group by year into time branches    │
│ ☑️ Keep event photos together          │
│ ☐ Split large albums by date           │
│                                        │
└────────────────────────────────────────┘
```

### Batch Processing:

**Import Process:**
1. Connect Facebook → Analyze 2000 photos (30 seconds)
2. Show routing preview → User adjusts (2 minutes)
3. Confirm → Background import starts (5-10 minutes)
4. Email when complete: "1,847 photos added to branches, 183 in Nest for review"

**The Result:**
- 90-95% of photos route correctly without manual work
- Only 5-10% need manual review in Nest
- Total time: ~10 minutes vs 20+ hours manually

### Real Example: Your 2000 Photo Import

**Scenario:** You have 2000 Facebook photos spanning 2010-2024

**Smart Analysis Results:**
```
┌────────────────────────────────────────────────┐
│ 🧠 Import Analysis Complete                   │
├────────────────────────────────────────────────┤
│                                                │
│ 📊 2,000 photos analyzed                       │
│                                                │
│ AUTO-ROUTING (1,842 photos - 92%):            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                │
│ BY PERSON:                                     │
│ • Mom's Tree: 412 photos (tagged + albums)    │
│ • Dad's Tree: 287 photos                      │
│ • Sister Sarah's Tree: 156 photos             │
│ • Family Celebrations: 523 photos             │
│                                                │
│ BY EVENT/ALBUM:                                │
│ • "Hawaii 2022" → New Branch: 43 photos       │
│ • "Christmas Memories" → Holidays: 134 photos │
│ • "Mom's Memorial Album" → Mom's Tree: 34     │
│ • "Wedding 2015" → New Branch: 87 photos      │
│                                                │
│ BY TIME:                                       │
│ • Recent Years (2020-24): 166 photos          │
│   → Recent Memories branch                    │
│                                                │
│ NEEDS REVIEW (158 photos - 8%):               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                │
│ • 67 photos: No faces, minimal captions       │
│ • 41 photos: Multiple possible destinations   │
│ • 28 photos: Memes/screenshots detected       │
│ • 22 photos: Unclear date or context          │
│                                                │
│ These will go to Nest for manual review.      │
│                                                │
│ ⏱️ Estimated Time to Review: 15-20 minutes     │
│                                                │
│ [Adjust Routing] [See Details]                │
│ [Looks Good - Start Import →]                 │
│                                                │
└────────────────────────────────────────────────┘
```

**What Happens Next:**
1. You click "Start Import"
2. System processes in background (5-10 min)
3. You get email: "1,842 photos added to 9 branches"
4. You have 158 items in Nest to quickly review
5. Bulk actions let you route those in 10-15 minutes
6. **Total time: 30 minutes** (vs 40+ hours manually)

**Nest Review Tools for Remaining 158:**
```
┌────────────────────────────────────────────┐
│ 🪺 Nest - 158 Items Need Quick Review     │
├────────────────────────────────────────────┤
│                                            │
│ Quick Sort Options:                        │
│ [Show Memes (28)] [Landscapes (67)]       │
│ [Multiple People (41)] [Other (22)]       │
│                                            │
│ Bulk Actions:                              │
│ ☑️ Select all 28 memes                    │
│    [Delete Selected]                       │
│                                            │
│ Review 67 landscape photos:                │
│    [Start Landscape Review →]             │
│                                            │
│ Review 41 manually (mixed people):         │
│    [Next] [Skip] [Hatch ▼]                │
│                                            │
└────────────────────────────────────────────┘
```

**Special Landscape Photo Review Mode:**
```
┌─────────────────────────────────────────────┐
│ 🌅 Landscape Memory Review (67 photos)     │
├─────────────────────────────────────────────┤
│ Quick review mode for nature/place photos  │
│                                             │
│ Photo 1 of 67                               │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │        [Beautiful Sunset Image]         │ │
│ │                                         │ │
│ │ Posted: July 15, 2022                   │ │
│ │ Original Caption: "Perfect evening 🌅" │ │
│ │ Location: Maui, Hawaii                  │ │
│ │ Comments: 3                             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 🤖 AI Suggestion: Part of Hawaii vacation  │
│    → Route to "Hawaii 2022" branch?        │
│                                             │
│ Quick Actions:                              │
│ [✓ Accept Suggestion]                      │
│ [Choose Different Branch ▼]                │
│ [Add Caption/Context] [Delete]             │
│                                             │
│ Navigate: [← Previous] [Skip] [Next →]     │
│ Progress: 1/67 • [Accept All Similar →]    │
│                                             │
└─────────────────────────────────────────────┘
```

**Smart Grouping for Landscapes:**
```
┌─────────────────────────────────────────────┐
│ 🧠 AI Detected: 23 landscapes from Hawaii  │
├─────────────────────────────────────────────┤
│                                             │
│ [Thumbnail Grid of 23 sunset/beach photos] │
│                                             │
│ Common Patterns:                            │
│ • All posted July 10-24, 2022              │
│ • All have Hawaii location tags             │
│ • Mixed with 43 family photos from trip     │
│                                             │
│ Suggested Action:                           │
│ ● Route all 23 to "Hawaii 2022" branch     │
│ ○ Create separate "Hawaii Landscapes"      │
│ ○ Route to "Places & Travels" branch       │
│ ○ Review individually                       │
│                                             │
│ Add note to all? (Optional)                 │
│ ┌─────────────────────────────────────────┐ │
│ │ "Beautiful memories from our two weeks  │ │
│ │  in paradise. These sunsets were        │ │
│ │  unforgettable."                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Apply to All 23 →] [Review Each]          │
│                                             │
└─────────────────────────────────────────────┘
```

## 🌅 Handling Landscape/Nature Photos (Your Concern)

### The Challenge:
Sunsets, landscapes, nature photos without people ARE meaningful memories, but they're harder to auto-categorize. You don't want them filtered out as "non-memories" just because there are no faces.

### The Solution: Context-Based Intelligence

**We DON'T filter landscapes out.** Instead, we use context clues to understand their meaning:

### Auto-Import Triggers for Landscape Photos:

**Scenario 1: Part of Larger Event** ✅
```
Your sunset photo from Hawaii vacation
├─ Posted during July 10-24, 2022 (vacation dates)
├─ Location tagged: Maui, Hawaii
├─ Same album as 43 other Hawaii photos
└─ Decision: AUTO-ROUTE to "Hawaii 2022" with other vacation photos
```

**Scenario 2: Emotional Caption** ✅
```
Your sunset photo
├─ Caption: "Missing Dad tonight. He loved sunsets like this."
├─ Comments: 8 (friends offering support)
└─ Decision: AUTO-ROUTE to "Dad's Memorial Tree"
```

**Scenario 3: Anniversary/Special Date** ✅
```
Your sunset photo
├─ Posted on wedding anniversary
├─ Caption: "25 years together ❤️"
├─ Location: Beach where you got engaged
└─ Decision: AUTO-ROUTE to "Marriage Memories" or "Special Moments"
```

**Scenario 4: Generic Landscape** ⚠️
```
Your sunset photo
├─ Caption: "🌅" or "Pretty sunset"
├─ No location tag
├─ Not part of larger album
├─ Posted randomly, no special date
└─ Decision: NEST for review (but NOT filtered out!)
```

### The Nest Review Experience:

Even generic landscapes go to Nest with helpful context:
```
┌───────────────────────────────────────┐
│ 🌅 Sunset Photo - June 2019          │
├───────────────────────────────────────┤
│ [Image Preview]                       │
│                                       │
│ 📍 No location • 2 comments           │
│ 💭 Caption: "Beautiful evening"      │
│                                       │
│ 🤖 AI Suggestion:                     │
│ Based on date and your other posts,  │
│ this might be from your lake cabin   │
│ trip. Route to "Cabin Memories"?     │
│                                       │
│ Or choose:                            │
│ • Nature & Places (new branch)       │
│ • Special Moments                    │
│ • Year-based branch (2019)           │
│ • Add context first                  │
│                                       │
│ [Accept Suggestion]                  │
│ [Choose Branch ▼] [Skip]             │
└───────────────────────────────────────┘
```

### Special Feature: "Places & Travels" Branch

For landscapes that don't fit specific events, we can auto-create:
- **"Places & Travels"** branch for all your nature/landscape photos
- **"Beautiful Moments"** branch for sunsets, views, scenes
- **"Special Places"** branch for locations with meaning

You decide during import setup:
```
┌────────────────────────────────────────┐
│ 🤖 47 landscape photos detected        │
│    without clear event context         │
├────────────────────────────────────────┤
│                                        │
│ How should we handle these?            │
│                                        │
│ ○ Create "Places & Travels" branch    │
│   Route all landscapes there           │
│                                        │
│ ○ Review each one individually         │
│   I'll decide where each should go     │
│                                        │
│ ○ Skip these for now                   │
│   Leave in Nest for later              │
│                                        │
│ [Apply Choice]                         │
└────────────────────────────────────────┘
```

### Result:
- ✅ Landscape photos WITH context → Auto-routed correctly
- ✅ Landscape photos from trips/events → Grouped with those memories
- ✅ Generic landscapes → Quick review with AI suggestions
- ❌ NEVER filtered out or deleted automatically
- ✅ Easy bulk routing: "Route all 23 Hawaii sunsets together"

### Your Specific Use Case:
If you have sunset photos that mean something to you:
1. Those from vacations → Auto-route to vacation branches
2. Those with emotional captions → Auto-route to memorial branches
3. Random beautiful moments → Easy review in Nest with suggestions
4. All landscapes → Option to create "Beautiful Moments" branch

**The system respects that landscapes ARE memories, just needs help understanding where they belong.**

## 🔄 Relocating Imported Memories (Your Concern)

### The Need:
AI isn't perfect. Sometimes a memory gets routed to the wrong branch during import. You need an easy way to move it to the correct branch.

### Solution: "Move to Different Branch" Feature

We'll add this to imported memories (and eventually all memories). It's different from your existing "Share to Another Branch" feature:

**Existing Feature:** Share/Connect to Another Branch
- Memory stays on original branch AND appears on new branch(es)
- Good for: Shared memories between friends, cross-family memories
- Memory lives in multiple places simultaneously

**New Feature:** Move/Relocate to Different Branch
- Memory moves FROM one branch TO another branch
- Good for: Fixing AI routing mistakes, reorganizing
- Memory lives in only one place

### The UI:

**On Memory Card:**
```
┌─────────────────────────────────────────┐
│ 🌅 Sunset at Beach - July 2022         │
│ ✨ Imported from Facebook               │
├─────────────────────────────────────────┤
│ [Image]                                 │
│                                         │
│ "Beautiful evening with the family"    │
│                                         │
│ 📍 Currently in: "Hawaii 2022" branch  │
│                                         │
│ Actions: [⋮]                            │
│    • Move to Different Branch          │
│    • Share to Another Branch (existing)│
│    • Edit                               │
│    • Withdraw                           │
└─────────────────────────────────────────┘
```

**Move Modal:**
```
┌────────────────────────────────────────┐
│ Move Memory to Different Branch        │
├────────────────────────────────────────┤
│                                        │
│ Memory: "Sunset at Beach"              │
│                                        │
│ Currently in:                          │
│ 📂 Hawaii 2022 branch                 │
│                                        │
│ Move to:                               │
│ ┌────────────────────────────────────┐ │
│ │ Select destination branch...       │ │
│ │ ▼                                  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Your Branches:                         │
│ ○ Family Celebrations                 │
│ ○ Beautiful Moments                   │
│ ○ Dad's Memorial Tree                 │
│ ○ Vacations & Travels                 │
│ ● Places & Travels (NEW)              │
│                                        │
│ ⚠️ This will remove the memory from   │
│    "Hawaii 2022" and move it to the   │
│    selected branch.                   │
│                                        │
│ [Cancel] [Move Memory →]              │
│                                        │
└────────────────────────────────────────┘
```

### Bulk Move Feature:

For multiple memories that were mis-routed:
```
┌────────────────────────────────────────┐
│ Bulk Move Memories                     │
├────────────────────────────────────────┤
│                                        │
│ ☑️ 12 memories selected                │
│                                        │
│ Currently in: "Hawaii 2022"            │
│ Move all to: [Beautiful Moments ▼]    │
│                                        │
│ [Move All 12 Memories →]              │
│                                        │
└────────────────────────────────────────┘
```

### Post-Import Reorganization:

After importing 2000 photos, you might realize:
- "Hmm, these 23 landscapes shouldn't be in Hawaii branch"
- Solution: Filter view → Select all landscapes → Bulk move to "Beautiful Moments"

**Reorganization Workflow:**
```
1. Go to "Hawaii 2022" branch
2. Filter: "Show imported memories" → "Show landscapes only"
3. Select: 23 landscape photos appear
4. Click: "Bulk Actions" → "Move to Different Branch"
5. Choose: "Beautiful Moments" (or create new)
6. Done: 23 photos moved, Hawaii branch now only has people photos
```

### Technical Implementation:

**New API Endpoint:**
```typescript
// POST /api/memories/:memoryId/move
// Move memory from one branch to another

{
  fromBranchId: "branch_123",
  toBranchId: "branch_456",
  reason: "user_correction" // or "reorganization"
}

// Backend logic:
1. Verify user owns memory or has permission
2. Update memory.branchId to new branch
3. Update MemoryBranchLink records:
   - Set old branch link to 'removed_by_user'
   - Create/activate new branch link as 'origin'
4. Create audit log
5. Return success
```

**Difference from Existing Share API:**
- **Share API** (`/api/memories/:memoryId/share`): Creates ADDITIONAL MemoryBranchLink records, memory appears in multiple places
- **Move API** (`/api/memories/:memoryId/move`): CHANGES the origin branch, memory moves to new location

### Your Existing Share Feature Still Works:

This doesn't replace your cross-branch sharing system. You can still:
1. **Move** a memory to correct branch (relocate origin)
2. **Then Share** that memory to friend's branches (cross-connect)

Example:
```
AI routed sunset to Hawaii branch (wrong)
→ Move to "Beautiful Moments" (correct origin)
→ Share to friend's "Travel Memories" branch (cross-connect)

Result:
- Origin: Beautiful Moments (your branch)
- Shared to: Travel Memories (friend's branch)
```

### Safety Features:

**Can't Move If Shared:**
```
┌────────────────────────────────────────┐
│ ⚠️ Memory is Shared                   │
├────────────────────────────────────────┤
│                                        │
│ This memory is currently shared to     │
│ 2 other branches:                      │
│ • Friend's "Vacation Memories"         │
│ • Sister's "Family Photos"             │
│                                        │
│ Moving will NOT affect shared copies.  │
│ The memory will still appear on those  │
│ branches, but the origin will change.  │
│                                        │
│ Continue moving?                       │
│                                        │
│ [Cancel] [Yes, Move Origin]            │
│                                        │
└────────────────────────────────────────┘
```

### Result:

After importing 2000 photos with AI routing:
1. 90% routed correctly → No action needed
2. 10% need adjustment → Easy to fix:
   - Individual moves: Click → Move → Select branch
   - Bulk moves: Select multiple → Bulk move
   - Takes 5-10 minutes to fix routing mistakes

**AI suggestions + Easy corrections = Best of both worlds**

## 🔧 Technical Implementation

### Phase 1: Facebook OAuth & Data Fetching
**Files to Create:**
- `lib/facebook.ts` - Facebook Graph API client
- `app/api/facebook/connect/route.ts` - OAuth flow
- `app/api/facebook/albums/route.ts` - Fetch albums
- `app/api/facebook/posts/route.ts` - Fetch posts
- `app/api/facebook/import/route.ts` - Import processor

### Phase 2: Content Analysis & Filtering
**Files to Create:**
- `lib/contentAnalyzer.ts` - AI-powered filtering
- Uses Claude API to analyze images and text
- Confidence scoring for memory vs non-memory

### Phase 3: Nest Staging Area
**Files to Create:**
- `app/nest/page.tsx` - Enhanced Nest UI for imports
- `components/ImportedMemoryCard.tsx` - Special card for imported items
- `app/api/nest/hatch/route.ts` - Move to branch endpoint

### Phase 4: Multi-Image Support
**Database Changes:**
```prisma
model NestItem {
  id          String   @id @default(cuid())
  userId      String
  text        String   @db.Text
  mediaUrls   String[] // Array for multiple images
  importMeta  Json?    // Facebook metadata, comments, etc.
  confidence  Float?   // AI confidence score
  suggested   String?  // Suggested branch
  createdAt   DateTime @default(now())
  importedAt  DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}
```

## 🎯 Key Benefits

### For You (Testing with Your Facebook):
1. See all your Facebook memories in one organized place
2. Add missing context that Facebook doesn't allow
3. Group scattered posts into meaningful branches
4. Preserve comments from friends before they're lost
5. Control privacy (no ads, no algorithm manipulation)

### For Beta Testers:
1. **Instant Gratification** - See years of memories immediately
2. **Low Activation Energy** - One click to import vs typing each memory
3. **Familiar Content** - Their own photos they already loved
4. **Network Effect** - Comments show existing connections
5. **Clear Value Prop** - "Facebook vault, but private and permanent"

### For Growth:
1. **Onboarding Hook** - "Import your Facebook memories in 2 minutes"
2. **Viral Loop** - "See who commented? Invite them to this branch"
3. **Content Starter** - New users have memories day 1
4. **Differentiation** - "We don't own your memories or train AI on them"

## 📊 Testing Plan with Your Facebook

### Test Phase 1: Read-Only Preview
1. Connect your Facebook account
2. Show you EXACTLY what would be imported
3. Display preview in mockup UI
4. Get your feedback on filtering accuracy
5. Adjust AI thresholds based on your feedback

### Test Phase 2: Small Import
1. Import just ONE album (e.g., "Mom's Memorial")
2. Test the Nest staging area
3. Practice "hatching" to a branch
4. Verify comments are preserved correctly
5. Check multi-image handling

### Test Phase 3: Full Import
1. Import all selected albums
2. Test bulk operations
3. Verify no duplicate memories
4. Check performance with large datasets
5. Measure time to first value

## 🚀 Marketing Angle

**The Pitch:**
> "Facebook just announced they're using your memories to train AI and serve more ads.
>
> Firefly Grove is different. Import your memories once, own them forever. No ads. No algorithms. No AI training.
>
> Import 10 years of memories in 2 minutes. Add context Facebook never allowed. Organize by person, not timeline. Share privately with family, not advertisers.
>
> Your memories. Your way. Your forever."

## 🔐 Privacy & Trust

**Key Messages:**
- ✅ We only READ your Facebook data, never post without permission
- ✅ Import is one-time or on-demand (you control timing)
- ✅ Your data is stored encrypted in Firefly Grove
- ✅ We never sell your data or show ads
- ✅ You can delete imported memories anytime
- ✅ Facebook never knows what you do in Firefly Grove

## ⏭️ Next Steps

1. **Get Your Approval** on this UX design
2. **Connect Your Facebook** for read-only preview
3. **Show You** what would be imported
4. **Build** the import flow based on your feedback
5. **Test** with your actual data
6. **Launch** to beta testers

---

**Questions for You:**
1. Does this address your concerns about where items go and how they feel?
2. Do you like the Nest → Branch flow, or prefer direct import to branches?
3. Should we prioritize Facebook or Instagram first? (Or both at once?)
4. Any changes to the filtering logic or preview UI?
5. Ready to connect your Facebook for the test?
