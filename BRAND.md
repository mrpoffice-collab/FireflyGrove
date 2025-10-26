# Firefly Grove - Brand Guidelines

## 🎯 Brand Overview

**Firefly Grove** is a digital legacy platform that helps families preserve and share their most precious memories. Like fireflies that light up the night with their gentle glow, we illuminate family stories and preserve them for future generations.

### Mission Statement
To provide families with a beautiful, intuitive platform for preserving memories, creating memorial tributes, and building a lasting digital legacy that transcends generations.

### Brand Promise
Every memory deserves to be preserved with dignity, beauty, and care. We make memory preservation effortless and meaningful.

---

## 🎨 Color Palette

### Primary Colors

#### Firefly Glow (Primary Brand Color)
- **Hex:** `#FFD966`
- **Tailwind:** `firefly-glow`
- **Usage:** Primary CTAs, links, highlights, active states, brand accents
- **Emotion:** Warmth, hope, illumination, nostalgia
- **Examples:** Buttons, hover states, navigation highlights

#### Firefly Dim (Secondary Brand Color)
- **Hex:** `#CC9933`
- **Tailwind:** `firefly-dim`
- **Usage:** Secondary buttons, muted highlights, subdued accents
- **Emotion:** Subtle warmth, understated elegance
- **Examples:** Button backgrounds, secondary CTAs

### Background Colors

#### Background Dark (Primary)
- **Hex:** `#0A0E14`
- **Tailwind:** `bg-dark`
- **Usage:** Primary background, input fields, cards
- **Emotion:** Depth, focus, intimacy

#### Background Darker (Deep)
- **Hex:** `#050810`
- **Tailwind:** `bg-darker`
- **Usage:** Body backgrounds, deep container backgrounds
- **Emotion:** Depth, professionalism, quietude

### Text Colors

#### Text Soft (Primary Text)
- **Hex:** `#E0E6ED`
- **Tailwind:** `text-soft`
- **Usage:** Headings, primary content, important text
- **Emotion:** Clarity, readability, elegance

#### Text Muted (Secondary Text)
- **Hex:** `#8892A6`
- **Tailwind:** `text-muted`
- **Usage:** Secondary content, labels, metadata, placeholders
- **Emotion:** Subtlety, supporting information

### Border Colors

#### Border Subtle
- **Hex:** `#1A1F2E`
- **Tailwind:** `border-subtle`
- **Usage:** Card borders, dividers, subtle separations
- **Emotion:** Definition without harshness

### Legacy Colors (Memorial Features)

#### Legacy Amber
- **Hex:** `#D4A574`
- **Tailwind:** `legacy-amber`
- **Usage:** Memorial features, tribute elements, remembrance UI
- **Emotion:** Warmth, nostalgia, reverence

#### Legacy Silver
- **Hex:** `#C5C9D4`
- **Tailwind:** `legacy-silver`
- **Usage:** Secondary memorial elements, metadata
- **Emotion:** Timelessness, dignity

#### Legacy Text
- **Hex:** `#B8B3C8`
- **Tailwind:** `legacy-text`
- **Usage:** Memorial page text, tribute descriptions
- **Emotion:** Softness, respect

#### Legacy Glow
- **Hex:** `#E8DCC0`
- **Tailwind:** `legacy-glow`
- **Usage:** Memorial highlights, tribute accents
- **Emotion:** Gentle illumination, honor

---

## 📝 Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
```

### Hierarchy

#### Display Text (Hero Headlines)
- **Size:** `text-5xl` to `text-6xl` (48-60px)
- **Weight:** `font-light` (300)
- **Usage:** Landing page heroes, major section headers
- **Example:** "Preserve Your Family Legacy Forever"

#### H1 (Page Titles)
- **Size:** `text-4xl` to `text-5xl` (36-48px)
- **Weight:** `font-light` (300)
- **Color:** `text-soft`
- **Usage:** Page titles, main headings
- **Example:** "Memory Sparks"

#### H2 (Section Headers)
- **Size:** `text-2xl` to `text-3xl` (24-30px)
- **Weight:** `font-medium` (500) or `font-light` (300)
- **Color:** `text-soft`
- **Usage:** Section headers, card titles

#### H3 (Subsection Headers)
- **Size:** `text-xl` to `text-2xl` (20-24px)
- **Weight:** `font-medium` (500)
- **Color:** `text-soft`
- **Usage:** Subsection headers, feature titles

#### Body Text (Large)
- **Size:** `text-lg` (18px)
- **Weight:** `font-normal` (400)
- **Color:** `text-muted`
- **Usage:** Feature descriptions, important paragraphs

#### Body Text (Regular)
- **Size:** `text-base` (16px)
- **Weight:** `font-normal` (400)
- **Color:** `text-soft` or `text-muted`
- **Usage:** Standard content, descriptions

#### Small Text (Metadata)
- **Size:** `text-sm` (14px)
- **Weight:** `font-normal` (400)
- **Color:** `text-muted`
- **Usage:** Labels, metadata, timestamps

#### Tiny Text (Captions)
- **Size:** `text-xs` (12px)
- **Weight:** `font-normal` (400)
- **Color:** `text-muted`
- **Usage:** Captions, fine print

### Blog Typography (Tailwind Typography)

```typescript
'--tw-prose-body': '#A8B3C0',        // Body text
'--tw-prose-headings': '#E8EDF2',    // All headings
'--tw-prose-links': '#FFD966',       // Links
'--tw-prose-bold': '#CBD5E0',        // Bold text
'--tw-prose-counters': '#FFD966',    // Ordered list numbers
'--tw-prose-bullets': '#FFD966',     // Unordered list bullets
'--tw-prose-quotes': '#CBD5E0',      // Blockquote text
'--tw-prose-quote-borders': '#FFD966', // Blockquote border
'--tw-prose-code': '#FFD966',        // Inline code
'--tw-prose-pre-code': '#E8EDF2',    // Code block text
'--tw-prose-pre-bg': '#0F1419',      // Code block background
```

**Usage:** Apply `prose prose-lg prose-invert max-w-none` to blog content areas.

---

## 🗣️ Voice & Tone

### Brand Voice Attributes

#### Warm & Compassionate
- We understand that memories are deeply personal and emotionally significant
- We approach memory preservation with empathy and care
- We honor the stories and lives being preserved

#### Professional & Trustworthy
- We're a reliable custodian of precious family memories
- We use clear, confident language without jargon
- We're transparent about features and limitations

#### Inviting & Accessible
- We make technology approachable for all ages
- We avoid technical terminology when possible
- We use friendly, conversational language

#### Respectful & Dignified
- We treat memorial and legacy features with appropriate reverence
- We avoid overly casual language in sensitive contexts
- We acknowledge the importance of what we're helping preserve

### Tone by Context

#### Marketing & Landing Pages
**Tone:** Inspirational, warm, benefit-focused
**Example:**
- ✅ "Preserve the stories that make your family unique"
- ✅ "Turn cherished voices into beautiful wall art"
- ❌ "Store your data in the cloud"
- ❌ "Database-backed memory management"

#### Product Features
**Tone:** Clear, helpful, encouraging
**Example:**
- ✅ "Add a memory to this branch"
- ✅ "Choose photos that capture their spirit"
- ❌ "Upload file to database"
- ❌ "Configure memory parameters"

#### Memorial & Tribute Features
**Tone:** Gentle, respectful, supportive
**Example:**
- ✅ "Create a beautiful tribute to honor their memory"
- ✅ "Preserve their voice for generations to come"
- ❌ "Generate memorial video"
- ❌ "Process audio file"

#### Help & Error Messages
**Tone:** Clear, patient, solution-oriented
**Example:**
- ✅ "We couldn't find that memory. Let's try again."
- ✅ "This file type isn't supported yet. Try uploading a .jpg or .png"
- ❌ "Error 404: Resource not found"
- ❌ "Invalid file format"

---

## 🎨 Design Principles

### 1. Beauty Through Simplicity
- Clean, uncluttered interfaces
- Generous white (dark) space
- Focus on content, not chrome
- Minimal UI elements that don't compete with memories

### 2. Respect for Content
- Photos and memories are the stars
- UI elements support, never overwhelm
- High-quality image display
- Thoughtful typography for text memories

### 3. Intuitive Navigation
- Clear hierarchy and information architecture
- Predictable interaction patterns
- Consistent navigation across features
- Breadcrumbs and context indicators

### 4. Emotional Resonance
- Subtle animations that feel organic (firefly-inspired)
- Warm color palette that evokes nostalgia
- Gentle transitions and hover states
- Visual elements that suggest light, warmth, preservation

### 5. Accessibility First
- High contrast text for readability
- Clear focus states
- Semantic HTML structure
- Keyboard navigation support

### 6. Mobile-First Responsive
- Design for small screens first
- Touch-friendly tap targets (44px minimum)
- Responsive layouts that adapt gracefully
- Performance optimization for all devices

---

## 🧩 Component Patterns

### Buttons

#### Primary CTA
```tsx
className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark
  rounded-lg font-medium transition-soft"
```
**Usage:** Primary actions, sign up, create, submit

#### Secondary Button
```tsx
className="px-6 py-3 bg-bg-elevated border border-border-subtle
  hover:border-firefly-dim text-text-soft rounded-lg font-medium
  transition-soft"
```
**Usage:** Cancel, secondary actions, alternative paths

#### Destructive Action
```tsx
className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400
  rounded text-sm transition-soft"
```
**Usage:** Delete, remove, destructive actions

### Cards

#### Standard Card
```tsx
className="bg-bg-elevated border border-border-subtle rounded-xl p-6"
```

#### Hover Card (Interactive)
```tsx
className="bg-bg-elevated border border-border-subtle rounded-xl p-6
  hover:border-firefly-dim transition-soft cursor-pointer"
```

### Input Fields

#### Text Input
```tsx
className="w-full px-4 py-3 bg-bg-dark border border-border-subtle
  rounded-lg text-text-soft placeholder-text-muted focus:outline-none
  focus:border-firefly-dim"
```

#### Textarea
```tsx
className="w-full px-4 py-3 bg-bg-dark border border-border-subtle
  rounded-lg text-text-soft placeholder-text-muted focus:outline-none
  focus:border-firefly-dim resize-none"
```

### Badges & Tags

#### Category Badge
```tsx
className="px-3 py-1 bg-firefly-glow/10 text-firefly-glow rounded-full
  text-xs font-medium"
```

#### Status Badge
```tsx
className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-sm"
```

### Animations

#### Transition Utility
```css
.transition-soft {
  transition: all 0.2s ease-in-out;
}
```

#### Fade In Animation
```tsx
animation: {
  fadeIn: 'fadeIn 0.2s ease-in-out',
}
keyframes: {
  fadeIn: {
    '0%': { opacity: '0', transform: 'translateY(4px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
}
```

---

## 📢 Marketing Messaging

### Value Propositions

#### Primary Value Props
1. **Preserve What Matters Most** - Capture and organize family memories before they're lost
2. **Create Beautiful Tributes** - Turn memories into memorial videos and sound wave art
3. **Build Your Family Legacy** - Organize memories by family branches and pass them down
4. **Share Across Generations** - Invite family members and designated heirs

#### Feature-Specific Messaging

**Memory Organization:**
- "Organize your family tree with branches for each person you love"
- "Keep memories organized by person, making it easy to find and share"

**Memorial Videos:**
- "Transform cherished photos into beautiful memorial tribute videos"
- "Honor their memory with a professional video tribute in minutes"

**Sound Wave Art:**
- "Turn meaningful voices into stunning wall art"
- "Preserve 'I love you' as a visual keepsake forever"

**Story Sparks:**
- "Never run out of memories to capture with our guided prompts"
- "Thoughtful questions that inspire meaningful storytelling"

**Digital Legacy:**
- "Designate heirs to receive your family memories when the time comes"
- "Ensure your family's stories live on for generations"

### Call-to-Action Variants

**High-Intent (Landing Page):**
- "Start Preserving Memories Free →"
- "Create Your Family Legacy →"
- "Try Firefly Grove Free →"

**Low-Intent (Blog, Content):**
- "Learn More →"
- "See How It Works →"
- "Explore Features →"

**In-App Actions:**
- "Add Your First Memory"
- "Create Memorial Video"
- "Upload Voice Recording"

---

## 🎯 Target Audience

### Primary Personas

#### The Memory Keeper (Primary)
- **Age:** 45-65
- **Role:** Family historian, often mother or grandmother
- **Motivation:** Preserve family history before it's lost
- **Pain Points:** Photos scattered across devices, aging relatives, no time to organize
- **Values:** Family, tradition, legacy, organization
- **Tech Comfort:** Moderate (uses Facebook, email, smartphone)

#### The Griever (Secondary)
- **Age:** 30-60
- **Role:** Recently lost a loved one
- **Motivation:** Honor and remember the deceased
- **Pain Points:** Processing grief, wanting to preserve memories, creating tributes
- **Values:** Remembrance, healing, tribute, respect
- **Tech Comfort:** Varies widely
- **Sensitivity:** High - needs gentle, respectful messaging

#### The Young Family (Growth)
- **Age:** 28-40
- **Role:** New parents, young professionals
- **Motivation:** Document children's growth, preserve grandparent stories
- **Pain Points:** Time-strapped, tech-savvy but busy
- **Values:** Family connections, modern solutions, accessibility
- **Tech Comfort:** High (uses apps daily, comfortable with subscriptions)

#### The Genealogist (Niche)
- **Age:** 50-70
- **Role:** Family researcher, history enthusiast
- **Motivation:** Build comprehensive family records
- **Pain Points:** Organizing vast amounts of information, digitizing old media
- **Values:** Accuracy, detail, preservation, research
- **Tech Comfort:** Moderate to high

### Audience Insights

**Emotional Triggers:**
- Fear of losing memories or family history
- Desire to honor loved ones
- Need to feel organized and prepared
- Wanting to leave something behind for children/grandchildren

**Common Behaviors:**
- Takes lots of photos but never organizes them
- Has boxes of old family photos in the attic
- Wants to interview aging parents but procrastinates
- Feels overwhelmed by technology options
- Values simplicity and ease of use

**Decision Factors:**
- Ease of use (critical for older users)
- Privacy and security (important for personal content)
- Price point (willing to pay for quality, but price-sensitive)
- Mobile access (wants to add memories on-the-go)
- Sharing capabilities (wants family to participate)

---

## 🚫 Brand Do's and Don'ts

### Do's ✅

**Visual Design:**
- Use soft, warm lighting in imagery
- Feature real, diverse families in marketing materials
- Maintain generous spacing and breathing room
- Use the firefly glow color sparingly for maximum impact
- Show actual product UI in screenshots

**Messaging:**
- Speak to the emotional value of memories
- Use "you" and "your family" language
- Acknowledge the importance of what we're preserving
- Be clear about features and capabilities
- Show empathy in memorial-related content

**Photography:**
- Use authentic, candid family moments
- Show multiple generations together
- Include diverse family structures
- Use soft, natural lighting
- Focus on connection and emotion

### Don'ts ❌

**Visual Design:**
- Don't use harsh, clinical white backgrounds
- Don't overcrowd interfaces with too many options
- Don't use overly bright or neon colors
- Don't use stock photos that feel staged or corporate
- Don't let UI elements compete with user content

**Messaging:**
- Don't use technical jargon or database terminology
- Don't minimize the emotional weight of memory preservation
- Don't use pushy or aggressive sales language
- Don't make light of grief or loss in memorial features
- Don't overpromise features that don't exist yet

**Photography:**
- Don't use generic "happy family" stock photos
- Don't show only perfect, staged moments
- Don't exclude or stereotype any demographic
- Don't use manipulative imagery in grief-related content
- Don't show dated or unrealistic family dynamics

---

## 🎭 Brand Personality

If Firefly Grove were a person:

**Personality Traits:**
- Warm and welcoming, like a caring family friend
- Organized and reliable, like a trusted librarian
- Patient and understanding, like a good listener
- Respectful and thoughtful, like someone who values history
- Modern yet timeless, bridging generations

**Not:**
- Corporate or cold
- Overly technical or complex
- Pushy or aggressive
- Frivolous or trivial
- Trendy or fleeting

---

## 📐 Logo Guidelines

### Current State
Currently, the brand uses the "Firefly Grove" wordmark with the firefly glow color (#FFD966) for the brand name.

### Future Logo Considerations
If developing a visual logo:
- **Inspiration:** Fireflies, gentle light, trees/groves, family trees
- **Style:** Simple, timeless, works in monochrome
- **Usage:** Should work at small sizes (favicon) and large (hero)
- **Color:** Primary version uses firefly-glow, should have dark background version

### Logo Usage (When Developed)
- **Minimum size:** 120px wide for digital
- **Clear space:** Minimum padding equal to the height of one letter
- **Background:** Always use on dark backgrounds (bg-darker or bg-dark)
- **Avoid:** Stretching, rotating, adding effects, changing colors

---

## 🔧 Technical Brand Implementation

### CSS Custom Properties
```css
:root {
  --firefly-glow: #FFD966;
  --firefly-dim: #CC9933;
  --bg-dark: #0A0E14;
  --bg-darker: #050810;
  --text-soft: #E0E6ED;
  --text-muted: #8892A6;
  --border-subtle: #1A1F2E;
  --legacy-amber: #D4A574;
  --legacy-silver: #C5C9D4;
  --legacy-text: #B8B3C8;
  --legacy-glow: #E8DCC0;
}
```

### Tailwind Config Reference
See `tailwind.config.ts` for the complete configuration including:
- Extended color palette
- Typography plugin customization
- Animation definitions
- Custom utility classes

### Component Library
**Location:** `/components/`
**Key Components:**
- `Header.tsx` - Navigation header
- `StructuredData.tsx` - SEO structured data
- Brand components should be added here

### Style Consistency
- Use Tailwind utility classes consistently
- Avoid inline styles except for dynamic values
- Group related utilities logically
- Use the `transition-soft` utility for smooth transitions

---

## 📊 Brand Metrics & Success

### Brand Perception Goals
- **Trustworthy:** Users feel confident storing precious memories
- **Warm:** Users feel emotionally connected to the platform
- **Simple:** Users find the interface intuitive and approachable
- **Respectful:** Users feel their memories are treated with dignity

### Visual Consistency Checklist
- [ ] All CTAs use firefly-glow or firefly-dim
- [ ] All cards use bg-elevated with border-subtle
- [ ] All headings use text-soft with appropriate font-light
- [ ] All body text uses text-muted for secondary content
- [ ] All inputs have focus:border-firefly-dim state
- [ ] All transitions use transition-soft class
- [ ] All rounded corners use rounded-lg or rounded-xl
- [ ] All spacing follows 4px grid (Tailwind spacing scale)

### Voice Consistency Checklist
- [ ] Warm and empathetic tone throughout
- [ ] Clear, jargon-free language
- [ ] Respect for memorial and legacy features
- [ ] Benefit-focused rather than feature-focused
- [ ] "You" language that addresses the user directly

---

## 🔄 Brand Evolution

### Current Phase: Launch & Awareness
**Focus:** Establish brand identity, build trust, acquire first 100 users
**Priorities:**
- Consistent visual execution across all touchpoints
- Clear value proposition messaging
- SEO and content marketing
- Organic social media presence

### Future Considerations
- **Video brand assets** - Demonstration videos, testimonials
- **Brand illustrations** - Custom artwork for features and marketing
- **Mascot development** - Firefly character for friendly brand face
- **Print materials** - Business cards, partnerships with funeral homes
- **Merchandise** - Branded items for power users or partners

---

## 📚 Resources

### Internal Resources
- **Design System:** `tailwind.config.ts`
- **Marketing Plan:** `MARKETING_PLAN.md`
- **Blog Content:** `content/blog/*.md`
- **Component Library:** `components/`

### External Inspiration
- **Color Theory:** Warm, nostalgic palettes that evoke evening light
- **Typography:** Swiss design, generous spacing, clear hierarchy
- **Photography:** Annie Leibovitz (family portraits), Steve McCurry (authentic moments)

### Competitor Analysis
- **Legacy/Memory Apps:** Generally cold, corporate, or overly technical
- **Opportunity:** Warmer, more personal, emotionally intelligent approach
- **Differentiation:** Sound wave art, memorial videos, branch-based organization

---

## ✨ The Firefly Metaphor

The firefly is central to our brand identity:

**What Fireflies Represent:**
- **Light in darkness** - Preserving memories illuminates our past
- **Fleeting beauty** - Like memories, fireflies are precious and temporary
- **Natural wonder** - Family memories are naturally beautiful, not manufactured
- **Gentle presence** - We approach memory preservation with care and softness
- **Collective glow** - Individual memories create something beautiful together

**Visual Applications:**
- Color palette inspired by firefly glow (warm yellows/golds)
- Subtle glow effects on interactive elements
- Gentle, organic animations
- Light particles or sparkle effects (used sparingly)

**Messaging Applications:**
- "Illuminate your family's story"
- "Let your memories glow"
- "Preserve the spark of every moment"
- "Your family's light, preserved forever"

---

## 📞 Brand Contacts

**Brand Stewardship:** Core development team
**Questions:** Refer to this document first, then consult with product owner
**Updates:** This document should be updated as the brand evolves

---

**Document Version:** 1.0
**Last Updated:** 2025-10-25
**Next Review:** After first 100 users

---

*"Every memory is a spark that illuminates our shared story."*
