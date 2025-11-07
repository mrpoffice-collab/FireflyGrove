# Firefly Grove Knowledge Bank

A searchable library of features, tips, and guidance that users can access anytime.

---

## 🎯 Purpose

**The Challenge:**
- Discovery modals only show once
- Users might dismiss before they're ready
- New features added over time
- Users forget features they haven't used in a while

**The Solution:**
A permanent, searchable knowledge bank where users can:
- Search "How do I invite someone?"
- Browse by category (Getting Started, Sharing, Legacy, etc.)
- Watch quick video demos
- Revisit tips they previously dismissed

---

## 📍 Where It Lives

### Primary Access Point
**Header → User Dropdown → "💡 Tips & Features"**
- Always accessible
- Clear icon (lightbulb)
- No badge/notification (non-intrusive)

### Secondary Access Points
- Empty states: "Need help? Search tips"
- Settings pages: "Learn more about this feature"
- Footer: "Help Center"

---

## 🗂️ Knowledge Bank Structure

### Main Categories

#### 1. **🌱 Getting Started**
- What is Firefly Grove?
- Understanding Trees and Branches
- Creating your first memory
- The firefly metaphor explained
- Demo mode vs full account

#### 2. **👥 Sharing & Collaboration**
- Inviting family members
- Co-authoring memories
- Branch sharing settings
- Managing permissions
- Removing collaborators

#### 3. **🕯️ Legacy & Heirs**
- Choosing your keepers
- Setting up heir access
- Legacy release conditions
- What happens to my memories?
- Privacy and security

#### 4. **📸 Photos & Media**
- The Nest: Bulk photo uploads
- "Hatching" photos into memories
- Adding photos to existing memories
- Video uploads (beta)
- Audio recordings

#### 5. **🎙️ Voice & Audio**
- Recording voice memories
- Audio Sparks (quick captures)
- Speech-to-text feature
- Audio quality tips
- Editing audio memories

#### 6. **✨ Special Features**
- Treasure Chest (daily reflections)
- Firefly Bursts (memory discovery)
- Story Sparks (writing prompts)
- Memory threading (replies)
- Glowing memories (reactions)

#### 7. **🎁 Grove Exchange**
- Memorial video collages
- Sound wave art
- Forever Kits (export)
- Greeting cards
- Photo books (coming soon)

#### 8. **⚙️ Account & Settings**
- Managing your subscription
- Tree capacity limits
- Upgrading your plan
- Importing memories
- Exporting your data
- Privacy settings

#### 9. **🌳 Organization**
- Trees vs Open Grove
- Branching strategies
- Moving memories between branches
- Transplanting trees
- Rooting trees together

#### 10. **🔍 Tips & Tricks**
- Keyboard shortcuts
- Mobile app features
- Batch operations
- Search tips
- Best practices

---

## 📝 Knowledge Article Structure

Each article follows this template:

```markdown
# [Feature Name]

**Category:** [Primary Category]
**Tags:** [searchable, keywords, here]
**Time to Read:** [1-3 minutes]
**Related:** [Link to related articles]

---

## What is it?

[1-2 sentence explanation in Firefly Grove voice]

---

## Why use it?

[3-4 bullet points of benefits]
- 💫 Benefit 1
- 🌿 Benefit 2
- ✨ Benefit 3

---

## How to use it

### Step-by-step

1. **[Action 1]**
   - Screenshot or icon
   - Brief explanation

2. **[Action 2]**
   - Screenshot or icon
   - Brief explanation

3. **[Action 3]**
   - Screenshot or icon
   - Brief explanation

---

## Tips & Best Practices

- 💡 **Tip 1:** [Helpful advice]
- 💡 **Tip 2:** [Helpful advice]
- 💡 **Tip 3:** [Helpful advice]

---

## Common Questions

**Q: [Question]**
A: [Answer in friendly voice]

**Q: [Question]**
A: [Answer in friendly voice]

---

## Related Features

- [Link to related article 1]
- [Link to related article 2]
- [Link to related article 3]

---

**Need more help?** [Contact Support] | [Report an Issue]
```

---

## 🔍 Search Implementation

### Search Features

**1. Full-Text Search**
- Search article titles
- Search article content
- Search tags/keywords
- Fuzzy matching for typos

**2. Suggested Searches**
- "How do I..."
- "What is..."
- "Can I..."
- Show popular searches

**3. Quick Filters**
- Filter by category
- Filter by media type (video, article, demo)
- Filter by difficulty (beginner, intermediate, advanced)

**4. Search Results Display**
```
┌─────────────────────────────────────────┐
│ 🔍 Search: "invite family"              │
├─────────────────────────────────────────┤
│                                          │
│ 👥 Inviting Family Members               │
│ Sharing & Collaboration • 2 min read    │
│ Share the tending with those who...     │
│                                          │
│ ⚙️ Managing Permissions                  │
│ Sharing & Collaboration • 3 min read    │
│ Control who can add, edit, or...        │
│                                          │
│ 🕯️ Choosing Your Keepers                │
│ Legacy & Heirs • 2 min read             │
│ Designate who receives your...          │
└─────────────────────────────────────────┘
```

---

## 🎨 UI Design

### Knowledge Bank Page (`/help` or `/knowledge`)

```
┌─────────────────────────────────────────────────┐
│ Header (with back to app)                       │
├─────────────────────────────────────────────────┤
│                                                  │
│  💡 Tips & Features                              │
│  Your guide to Firefly Grove                    │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ 🔍 Search for anything...                │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  📚 Browse by Category                          │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 🌱       │ │ 👥       │ │ 🕯️      │       │
│  │ Getting  │ │ Sharing  │ │ Legacy   │       │
│  │ Started  │ │ & Collab │ │ & Heirs  │       │
│  │ 8 guides │ │ 6 guides │ │ 5 guides │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                  │
│  🌟 Popular Guides                              │
│  ├─ Understanding Trees and Branches            │
│  ├─ Inviting Family Members                     │
│  ├─ Choosing Your Keepers                       │
│  └─ The Nest: Bulk Photo Uploads                │
│                                                  │
│  ✨ What's New                                   │
│  ├─ Voice-to-Text for Memory Cards (New!)      │
│  ├─ Improved Photo Hatching Flow                │
│  └─ Enhanced Mobile Experience                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Article Page

```
┌─────────────────────────────────────────────────┐
│ ← Back to Knowledge Bank          Share  Print  │
├─────────────────────────────────────────────────┤
│                                                  │
│  👥 Inviting Family Members                      │
│  Sharing & Collaboration • 2 min read           │
│                                                  │
│  Share the tending with those who knew          │
│  them best. Every perspective makes the         │
│  story richer.                                  │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                  │
│  Why Share?                                     │
│  💫 Richer stories from multiple viewpoints     │
│  🌿 Share the work of preservation              │
│  ✨ Discover memories you didn't know about     │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                  │
│  How to Invite Someone                          │
│                                                  │
│  1. Open Branch Settings                        │
│     [Screenshot: Settings gear icon]            │
│     Click the settings icon on any branch       │
│                                                  │
│  2. Navigate to Sharing Tab                     │
│     [Screenshot: Modal with tabs]               │
│     Find the "Sharing" section                  │
│                                                  │
│  3. Enter Email & Send                          │
│     [Screenshot: Invite form]                   │
│     Add email, optional message, send           │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                  │
│  💡 Tips & Best Practices                        │
│                                                  │
│  • Send a personal message to explain why       │
│  • Start with close family, expand later        │
│  • They'll get email with direct link           │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                  │
│  Related Features                               │
│  → Managing Permissions                         │
│  → Removing Collaborators                       │
│  → Branch Privacy Settings                      │
│                                                  │
│  Was this helpful? [👍 Yes] [👎 No]            │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 💾 Data Structure

### Knowledge Article Schema

```typescript
interface KnowledgeArticle {
  id: string
  slug: string // URL-friendly: "inviting-family-members"
  title: string
  subtitle: string
  category: KnowledgeCategory
  tags: string[] // For search
  timeToRead: number // In minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  content: string // Markdown
  screenshots: {
    url: string
    caption: string
    alt: string
  }[]
  relatedArticles: string[] // IDs of related articles
  popularity: number // Track views
  helpful: { yes: number, no: number } // Feedback
  createdAt: Date
  updatedAt: Date
  featured: boolean // Show in "Popular" section
  new: boolean // Show "New!" badge
}

enum KnowledgeCategory {
  GETTING_STARTED = 'getting-started',
  SHARING = 'sharing',
  LEGACY = 'legacy',
  PHOTOS_MEDIA = 'photos-media',
  VOICE_AUDIO = 'voice-audio',
  SPECIAL_FEATURES = 'special-features',
  GROVE_EXCHANGE = 'grove-exchange',
  ACCOUNT_SETTINGS = 'account-settings',
  ORGANIZATION = 'organization',
  TIPS_TRICKS = 'tips-tricks'
}
```

---

## 🔗 Integration with Discovery Modals

**Two-way connection:**

### 1. Modal → Knowledge Bank
Every discovery modal includes:
```tsx
<div className="text-center text-sm text-text-muted">
  <Link href="/knowledge/[article-slug]" className="hover:text-firefly-glow">
    Learn more about this feature →
  </Link>
</div>
```

### 2. Knowledge Bank → Modal Preview
In knowledge bank articles:
```tsx
<div className="bg-bg-dark/50 rounded-lg p-4 border border-firefly-dim/30">
  <p className="text-sm text-text-muted mb-2">Want to see this in action?</p>
  <button onClick={() => showPreview('modalName')}>
    Preview Discovery Modal
  </button>
</div>
```

---

## 📱 Mobile Optimization

### Mobile Navigation
- Search bar at top (sticky)
- Category chips (horizontal scroll)
- Simplified article layout
- Larger touch targets
- Quick back button

### Mobile Article View
- Larger text (16px minimum)
- More spacing
- Expandable screenshots (tap to enlarge)
- Bottom navigation bar
- Share button prominent

---

## 📊 Analytics Tracking

Track these events:

```typescript
// Knowledge Bank Usage
knowledge_bank_opened // When user opens knowledge bank
knowledge_search // Search query submitted
knowledge_article_viewed // Article opened
knowledge_article_helpful // User clicked thumbs up/down
knowledge_category_browsed // User browsed category
knowledge_related_clicked // Clicked related article link

// Integration with Features
knowledge_to_feature // Clicked CTA to try feature
feature_to_knowledge // Accessed help from feature
discovery_modal_to_knowledge // Clicked "Learn more" in modal
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Now)
1. Create data structure
2. Write first 10 articles (high-priority features)
3. Build basic search component
4. Create category browsing
5. Design article page template

### Phase 2: Enhanced Search
6. Implement fuzzy search
7. Add suggested searches
8. Create "Popular" section
9. Add "What's New" section
10. Track analytics

### Phase 3: Rich Content
11. Add screenshots/GIFs to articles
12. Record video tutorials
13. Create interactive demos
14. Add "Was this helpful?" feedback
15. Related articles suggestions

### Phase 4: Integration
16. Link from discovery modals
17. Add help icons throughout app
18. Context-sensitive help (right article for right moment)
19. Empty state help links
20. Mobile app integration

---

## ✍️ Content Writing Guidelines

### Firefly Grove Voice for Help Articles

**DO:**
- ✅ Use gentle, guiding language
- ✅ "Let's..." "Here's how..." "You can..."
- ✅ Celebrate user actions: "Beautiful!" "Well done!"
- ✅ Use firefly metaphors naturally
- ✅ Keep it warm and human

**DON'T:**
- ❌ Technical jargon
- ❌ Corporate speak
- ❌ Command language: "You must..." "Do this..."
- ❌ Over-explain or condescend
- ❌ Marketing hype

**Example Transformation:**

❌ **Technical:**
"Navigate to the branch configuration panel and locate the user permission management interface to grant access rights to additional users."

✅ **Firefly Grove:**
"Let's invite someone to tend this branch with you. Open the settings (that gear icon), find the Sharing tab, and add their email. They'll receive an invitation to join you in preserving these memories."

---

## 🎁 Bonus Features

### 1. **Video Tutorials**
- 30-60 second screen recordings
- Voiceover with Firefly Grove tone
- No talking head (focus on UI)
- Embedded in articles

### 2. **Interactive Demos**
- Clickable walkthroughs
- Highlight UI elements
- "Try it yourself" sandbox mode
- Progress tracking

### 3. **Keyboard Shortcut Guide**
- Searchable shortcut list
- Learn as you go
- Print-friendly cheat sheet

### 4. **FAQ Section**
- Most common questions
- Quick answers
- Link to full articles

### 5. **Changelog/Release Notes**
- What's new in each release
- Feature announcements
- Improvements and fixes

---

## 📋 Initial Article List (20 Essential)

### Getting Started (5)
1. What is Firefly Grove?
2. Understanding Trees and Branches
3. Creating Your First Memory
4. The Firefly Metaphor Explained
5. Quick Start Guide

### Sharing & Legacy (4)
6. Inviting Family Members
7. Choosing Your Keepers (Heirs)
8. Legacy Release Conditions
9. Managing Branch Permissions

### Photos & Media (4)
10. The Nest: Bulk Photo Uploads
11. Hatching Photos into Memories
12. Recording Voice Memories
13. Adding Audio to Memories

### Special Features (4)
14. Treasure Chest: Daily Reflections
15. Firefly Bursts: Rediscovering Memories
16. Story Sparks: Writing Prompts
17. Memory Threading: Adding Replies

### Organization & Settings (3)
18. Trees vs Open Grove
19. Understanding Your Plan Limits
20. Exporting Your Memories (Forever Kits)

---

**Ready to start building?**

**Suggested first steps:**
1. Create the data structure (Prisma schema for articles)
2. Write the first 5 essential articles
3. Build the knowledge bank page UI
4. Implement basic search
5. Add "Tips & Features" link to header dropdown

What do you think?
