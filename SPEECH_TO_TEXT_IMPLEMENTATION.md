# Speech-to-Text Implementation Guide

## Summary of Changes

### Fixed Issues
1. **Android Scrolling Bug** - Fixed modal scrolling issue on Android devices
2. **Speech-to-Text Feature** - Added voice input capability across text fields

### Files Modified
- `components/MemoryModal.tsx` - Added speech-to-text buttons and fixed scrolling
- `components/SpeechToTextInput.tsx` - NEW reusable component for any text input

---

## Android Scrolling Fix

### What was wrong?
The MemoryModal on Android couldn't scroll properly when the keyboard appeared, preventing users from adding text to branches.

### What was fixed?
1. Added `touch-auto` and `touchAction: 'manipulation'` to textarea
2. Removed `text-center` alignment (makes mobile editing difficult)
3. Added `max-h-[90vh] overflow-y-auto` to modal dialog
4. Added proper touch scrolling to modal overlay

### Location
- File: `components/MemoryModal.tsx`
- Lines: ~324, ~327, ~465-466, ~373-374

---

## Speech-to-Text Feature

### Browser Support
- ✅ **Chrome for Android** - Partial support (primary target)
- ✅ **Chrome Desktop** - Full support
- ✅ **Edge Desktop** - Full support
- ❌ **Firefox Android** - Not supported
- ❌ **Android Browser** - Not supported
- ❌ **Safari iOS** - Limited support

### Features Implemented
1. **Web Speech API Integration** - Uses browser's native speech recognition
2. **Android Chrome Bug Fix** - Deduplicates words (known Android Chrome bug)
3. **Visual Feedback** - Pulsing red button when listening
4. **Graceful Degradation** - Button only appears if browser supports it
5. **Two Modes**:
   - **Continuous** (textarea) - Keeps listening until stopped
   - **Single** (input) - Stops after one phrase

### How It Works
```javascript
// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

// Start recognition
recognition.continuous = true  // Keep listening
recognition.interimResults = true  // Show results as you speak
recognition.lang = 'en-US'  // Language

// Handle results
recognition.onresult = (event) => {
  // Get transcript and append to text
}
```

---

## Using the Reusable Component

### Basic Usage

```tsx
import SpeechToTextInput from '@/components/SpeechToTextInput'

function MyComponent() {
  const [text, setText] = useState('')

  return (
    <SpeechToTextInput
      value={text}
      onChange={setText}
      label="Your Memory"
      placeholder="Write or speak..."
      type="textarea"
      rows={6}
      required
    />
  )
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | required | Current input value |
| `onChange` | (value: string) => void | required | Change handler |
| `label` | string | undefined | Label text (shows speech button) |
| `placeholder` | string | '' | Placeholder text |
| `type` | 'textarea' \| 'input' | 'textarea' | Input type |
| `rows` | number | 4 | Textarea rows |
| `maxLength` | number | undefined | Max character length |
| `required` | boolean | false | Required field |
| `className` | string | '' | Additional CSS classes |
| `id` | string | undefined | Input ID |

### Examples

**Textarea with speech-to-text:**
```tsx
<SpeechToTextInput
  value={memoryText}
  onChange={setMemoryText}
  label="Your Memory"
  placeholder="Write what comes to mind..."
  type="textarea"
  rows={6}
  required
/>
```

**Input field with speech-to-text:**
```tsx
<SpeechToTextInput
  value={memoryCard}
  onChange={setMemoryCard}
  label="When was this?"
  placeholder="Before college, summer 2020..."
  type="input"
  maxLength={100}
/>
```

---

## Where to Add Speech-to-Text Next

### High Priority (User-facing text inputs)
1. ✅ Memory text (MemoryModal) - DONE
2. ✅ Memory card "When was this?" (MemoryModal) - DONE
3. Branch description (when creating/editing branches)
4. Tree name and description (new tree form)
5. Grove name (rename grove)

### Medium Priority
6. Personal message when inviting heirs
7. Branch settings descriptions
8. Bio/profile fields (if applicable)

### To Add Anywhere
Simply replace existing `<textarea>` or `<input type="text">` with:

```tsx
// Old way:
<textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="..."
/>

// New way with speech-to-text:
<SpeechToTextInput
  value={text}
  onChange={setText}
  label="Label Name"
  placeholder="..."
  type="textarea"
/>
```

---

## Testing Checklist

### Desktop Testing (Chrome/Edge)
- [ ] Open MemoryModal
- [ ] Click "Speak" button
- [ ] Allow microphone access
- [ ] Speak into microphone
- [ ] Verify text appears in textarea
- [ ] Click "Stop" to stop listening
- [ ] Verify button disappears if browser doesn't support it

### Android Chrome Testing
- [ ] Open site on Android phone in Chrome
- [ ] Navigate to a branch
- [ ] Click "Light a Memory"
- [ ] Click "Speak" button
- [ ] Allow microphone permissions
- [ ] Speak clearly into phone
- [ ] Verify text appears correctly
- [ ] Check for duplicate words (should be deduped)
- [ ] Test keyboard scrolling works properly
- [ ] Test "When was this?" field with speech

### Known Issues to Watch For
1. **Duplicate Words** - Fixed with deduplication function
2. **Scrolling on Android** - Fixed with touch-action properties
3. **Permission Denied** - User must allow microphone access
4. **Network Required** - Speech recognition requires internet connection

---

## Technical Details

### Android Chrome Bug Workaround
```javascript
// Dedupe consecutive duplicate words
const dedupe = (text: string) => {
  const words = text.split(' ')
  return words.filter((word, i) => i === 0 || word !== words[i - 1]).join(' ')
}
```

### Mobile Scroll Fix
```javascript
// Applied to textarea and modal
className="touch-auto"
style={{ touchAction: 'manipulation' }}

// Modal content
className="max-h-[90vh] overflow-y-auto"
```

### Browser Detection
```javascript
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

setSpeechSupported(!!SpeechRecognition)
```

---

## Future Enhancements

### Possible Improvements
1. **Language Selection** - Allow users to select language
2. **Better Error Handling** - Show user-friendly error messages
3. **Offline Fallback** - Alternative input methods when offline
4. **Voice Commands** - "New paragraph", "Delete that", etc.
5. **Confidence Scoring** - Show low-confidence words for review
6. **Voice Profile** - Train on user's voice for better accuracy

### Performance Considerations
- Speech recognition uses Google's cloud API
- Requires active internet connection
- May use mobile data (warn users on cellular)
- Battery impact when continuously listening

---

## Deployment Notes

### Before Going Live
1. Test on real Android devices (not just emulator)
2. Test with different accents/languages
3. Add user tutorial/onboarding for speech feature
4. Consider adding a "Try Speech Input" tutorial
5. Add analytics to track usage and errors

### Support
- If users report issues, check browser compatibility
- Remind users to allow microphone permissions
- Provide fallback instructions for manual typing

---

## Questions?

If you encounter issues or need to add speech-to-text to other components, reference this guide or the `SpeechToTextInput.tsx` component source code.
