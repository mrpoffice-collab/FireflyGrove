# Welcome Modals & Onboarding Strategy

Based on the complete user journey map, here's our strategic plan for welcome modals and tooltips.

---

## 🎯 User Journey: Critical Decision Points

### **Moment 1: Empty Grove (First Login)**
**What user sees:** Empty tree slots, no guidance
**Confusion risk:** HIGH - "What do I do first?"
**Solution needed:** Welcome modal explaining trees vs branches concept

### **Moment 2: Creating First Tree**
**What user sees:** "Living Family Tree" vs "Legacy Tree" choice
**Confusion risk:** HIGH - "Which one should I choose?"
**Solution needed:** Clear explanation of the difference

### **Moment 3: First Branch Page**
**What user sees:** Story Sparks, settings icons, empty timeline
**Confusion risk:** MEDIUM - "What are story sparks?" "What's that gear icon?"
**Solution needed:** Tooltips already added ✅, consider brief spark explanation

### **Moment 4: Never Invited Anyone**
**What user sees:** Branch settings icon
**Confusion risk:** MEDIUM - May not discover collaboration feature
**Solution needed:** Modal prompting to invite family members

### **Moment 5: Never Set Up Heirs**
**What user sees:** Settings gear icon
**Confusion risk:** HIGH - Core value prop not discovered
**Solution needed:** Modal explaining legacy/heir system

### **Moment 6: The Nest (Photo Upload)**
**What user sees:** Upload area, grid of photos
**Confusion risk:** LOW - Pretty clear
**Solution needed:** Maybe tooltip on "Hatch from Nest" button (optional)

### **Moment 7: Treasure Chest**
**What user sees:** 📜 badge in header
**Confusion risk:** MEDIUM - Already has welcome modal ✅
**Solution needed:** Complete ✅

---

## 🔥 High-Priority Welcome Modals (Build These First)

### 1. **TreesVsBranchesWelcomeModal** - CRITICAL
**Trigger:** First time landing on empty grove (0 trees)
**Preview:** `?preview=treesWelcome`
**Purpose:** Explain the foundational concept

**Content:**
- **Title:** "Welcome to Your Grove"
- **Icon:** 🌳
- **Explanation:**
  - **Trees** organize by person (Grandma, Dad, childhood friend)
  - **Branches** are themes for that person (wisdom, recipes, stories)
  - **Memories** are the fireflies that glow within branches
- **Visual:** Simple tree diagram
- **CTA:** "Plant My First Tree"
- **Dismiss:** "I'll explore on my own"

**localStorage key:** `treesWelcomeDismissed`

---

### 2. **HeirsWelcomeModal** - CRITICAL
**Trigger:** User has created 3+ memories but 0 heirs
**Preview:** `?preview=heirsWelcome`
**Purpose:** Introduce core legacy value proposition

**Content:**
- **Title:** "Pass the Light"
- **Icon:** 🕯️
- **Explanation:**
  - Choose who receives your memories when you're gone
  - They'll become keepers of your stories
  - Set conditions: immediately, after date, or after passing
  - Your memories stay safe and private until the right time
- **Key Points:**
  - 💫 "Your stories deserve keepers"
  - 🔒 "Private until you choose to share"
  - 🌱 "Plan today, protect forever"
- **CTA:** "Choose My Keepers"
- **Dismiss:** "Maybe later"

**localStorage key:** `heirsWelcomeDismissed`

---

### 3. **SharingWelcomeModal** - HIGH
**Trigger:** User has 5+ memories but hasn't invited anyone
**Preview:** `?preview=sharingWelcome`
**Purpose:** Encourage collaborative memory-keeping

**Content:**
- **Title:** "Tend Your Grove Together"
- **Icon:** 🤝
- **Explanation:**
  - Invite family to add their memories
  - Each person brings their unique perspective
  - Richer, fuller family story
  - Share the work of preservation
- **Key Points:**
  - 👥 "Every perspective matters"
  - 📖 "Stories are better together"
  - 💚 "Share the tending"
- **CTA:** "Invite Someone to Garden"
- **Dismiss:** "I'll do this later"

**localStorage key:** `sharingWelcomeDismissed`

---

## 🟡 Medium-Priority Welcome Modals

### 4. **VoiceMemoriesWelcomeModal**
**Trigger:** User has 10+ text memories but 0 audio
**Preview:** `?preview=voiceWelcome`
**Purpose:** Encourage richest format

**Content:**
- **Title:** "Capture Your Voice"
- **Icon:** 🎙️
- **Explanation:**
  - Future generations will hear you
  - Voice carries emotion text can't
  - Easier than typing (especially on mobile)
  - Tell stories in your own words
- **CTA:** "Record a Memory"
- **Dismiss:** "Not right now"

**localStorage key:** `voiceWelcomeDismissed`

---

### 5. **PhotoMemoriesWelcomeModal**
**Trigger:** User has 10+ text memories but 0 photos
**Preview:** `?preview=photoWelcome`
**Purpose:** Encourage visual memories

**Content:**
- **Title:** "A Picture Holds a Thousand Stories"
- **Icon:** 📸
- **Explanation:**
  - Photos spark deeper memories
  - Visual context brings stories alive
  - Safe storage for precious images
  - Upload from The Nest or directly
- **CTA:** "Add a Photo"
- **Dismiss:** "Maybe later"

**localStorage key:** `photoWelcomeDismissed`

---

## 🟢 Low-Priority (Nice-to-Have)

### 6. **AudioSparksWelcomeModal**
**Trigger:** First time clicking Audio Sparks button
**Purpose:** Explain quick voice capture feature

### 7. **FireflyBurstWelcomeModal**
**Trigger:** First burst generation
**Purpose:** Explain random memory surfacing

### 8. **NestWelcomeModal**
**Trigger:** First visit to /nest with 0 items
**Purpose:** Explain bulk photo organization

---

## 📐 Implementation Pattern

### Standard Modal Structure
```tsx
interface WelcomeModalProps {
  onClose: () => void
}

export default function FeatureWelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🌳</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Modal Title
          </h2>
          <p className="text-text-muted text-sm">Feature Context</p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">Main explanation paragraph.</p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            {/* 3-4 Key Points */}
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Privacy/reassurance message
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePrimaryAction}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Primary Action
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Trigger Logic Pattern
```tsx
// In page component
const [showFeatureWelcome, setShowFeatureWelcome] = useState(false)

useEffect(() => {
  // Check trigger conditions
  const shouldShow = checkConditions() && !localStorage.getItem('featureWelcomeDismissed')

  // Check for preview parameter
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('preview') === 'featureName') {
    setShowFeatureWelcome(true)
    window.history.replaceState({}, '', window.location.pathname)
  } else if (shouldShow) {
    setShowFeatureWelcome(true)
  }
}, [dependencies])

const handleClose = () => {
  localStorage.setItem('featureWelcomeDismissed', 'true')
  setShowFeatureWelcome(false)
}
```

---

## 🎯 Implementation Priority

### Sprint 1 (This Session - ~2 hours)
1. TreesVsBranchesWelcomeModal
2. HeirsWelcomeModal

### Sprint 2 (Next Session - ~1 hour)
3. SharingWelcomeModal

### Sprint 3 (Future - ~2 hours)
4. VoiceMemoriesWelcomeModal
5. PhotoMemoriesWelcomeModal

---

## 📊 Success Metrics

**How to measure if modals are helpful:**
- Track dismissal rate (% who click "Maybe later" vs primary CTA)
- Track feature adoption after seeing modal
- A/B test: Users who saw modal vs didn't
- User feedback: "Was this helpful?"

**Analytics Events to Add:**
- `welcome_modal_shown` (modalName)
- `welcome_modal_dismissed` (modalName)
- `welcome_modal_action_taken` (modalName, action)

---

## 🎨 Voice & Tone Guidelines

**For all modals:**
- ✅ Warm, intimate, poetic
- ✅ Use Firefly Grove metaphors (light, glow, tend, plant, keepers)
- ✅ Focus on "why" not "how"
- ✅ Reassure about privacy/safety
- ❌ No technical jargon
- ❌ No urgency/pressure ("Act now!")
- ❌ No marketing speak

**Example transformations:**
- ❌ "Set up heir permissions" → ✅ "Choose your keepers"
- ❌ "Collaborate with team members" → ✅ "Tend your grove together"
- ❌ "Upload audio files" → ✅ "Capture your voice"

---

**Last Updated:** 2025-11-07
**Status:** Ready for implementation
