# Background Music for Story Modal

This folder contains the ambient background music that plays during the "Discover Our Story" experience.

## Required Files

Place your music file here with either name:
- `story-background.mp3` (primary)
- `story-background.ogg` (fallback for older browsers)

## Recommended Music Style

The music should be:
- **Ambient and atmospheric** - soft, ethereal, gentle
- **Emotionally resonant** - warm, contemplative, hopeful
- **Non-intrusive** - background presence, not foreground
- **Loopable** - seamless when repeated
- **2-4 minutes long** - gives variety during the story
- **Volume**: Set to 30% in code, so mix accordingly

## Music Suggestions

### Royalty-Free Options:

**Epidemic Sound** (subscription required):
- Search: "ambient emotional", "piano contemplative", "soft atmospheric"

**Artlist** (subscription required):
- Search: "cinematic ambient", "emotional piano", "memory theme"

**Free Options:**

1. **Pixabay Music** (https://pixabay.com/music/)
   - Search: "ambient", "emotional", "piano"
   - 100% free, no attribution required
   - Recommended: Look for gentle piano or ambient tracks

2. **Incompetech** (https://incompetech.com/music/)
   - By Kevin MacLeod
   - Free with attribution
   - Search: "ambient", "emotional"
   - Try: "Organic Meditations" series

3. **Free Music Archive** (https://freemusicarchive.org/)
   - Search: "ambient", "contemplative"
   - Various licenses (check each track)

4. **YouTube Audio Library** (https://youtube.com/audiolibrary)
   - Free for use
   - Filter by: Ambient, Calm, Emotional

### Specific Track Recommendations:

**If using Pixabay:**
- "Emotional Piano" by Keys of Moon
- "Sentimental Piano" by WinnieTheMoog
- "Tender Memories" by DreamHeaven

**If using Incompetech:**
- "Organic Meditations 1"
- "Willow and the Light"
- "Evening Melodrama"

## How to Add Music

1. Download your chosen track (MP3 format)
2. Rename it to `story-background.mp3`
3. Place it in this folder (`public/audio/`)
4. Optional: Convert to OGG for better browser compatibility
5. Test by opening the story modal on the homepage

## Technical Notes

- Music starts at 30% volume automatically
- Loops seamlessly
- Fades out when modal closes
- User can mute/unmute with speaker icon (top-left of modal)
- Respects browser autoplay policies (may require user interaction)

## Copyright

Make sure you have the rights to use any music you add. All suggestions above are either:
- Royalty-free with proper attribution
- Creative Commons licensed
- Public domain

Always check the specific license for your chosen track.
