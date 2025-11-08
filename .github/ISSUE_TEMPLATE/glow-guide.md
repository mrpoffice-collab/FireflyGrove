---
name: Glow Guide Needed
about: Create a new Glow Guide for a feature or product
title: '[Glow Guide] '
labels: glow-guide-needed, enhancement
assignees: ''
---

## Feature/Product

**Name:**
**Location:** (e.g., /cards, /soundart, AudioSparks component)
**Type:** [ ] New Feature [ ] New Product [ ] Changed Feature

## Glow Guide Details

**Suggested Title:**
**Icon:** (emoji, e.g., 🎙️, 🎨, 📸)
**Category:** (e.g., Core Feature, Product, Collaboration, Legacy)
**Priority:** [ ] Critical [ ] High [ ] Medium [ ] Low

## User Journey

**When should this Glow Guide appear?**
- [ ] First time visiting page
- [ ] After X actions
- [ ] Never used feature after Y days
- [ ] Other: ___________

**What confusion does it prevent?**


**What should the CTA (Call-to-Action) button say?**


**Where should the CTA take the user?**


## Content Outline

**Subtitle:** (e.g., "Pass the Light", "Capture Your Voice")

**Main Message:** (1-2 sentences explaining why this matters)


**Key Points:** (3-4 bullet points)
-
-
-

**Privacy/Reassurance Note:** (optional - if users might be concerned)


**Example/Use Case:** (optional - concrete example)


## Related Features

**Related Glow Guides:**
-

**Related Knowledge Bank Articles:**
-

---

## Implementation Checklist

Once approved:
- [ ] Create component in `components/glow-guides/[Name]GlowGuide.tsx`
- [ ] Add `glowGuideMetadata` export
- [ ] Implement trigger logic in parent component
- [ ] Add preview URL support (`?preview=guideName`)
- [ ] Run `npm run extract-glow-guides`
- [ ] Run `npm run seed-knowledge-bank`
- [ ] Test trigger condition
- [ ] Test CTA routing
- [ ] Update GLOW_GUIDES_AUDIT.md

---

**Files Changed:** (Auto-populated from git hook detection)
<!-- The pre-commit hook will suggest adding this information -->
