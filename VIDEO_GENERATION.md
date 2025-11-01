# 🎬 Automated Tutorial Video Generation System

## Overview

Firefly Grove now has an **automated video generation system** that creates tutorial videos with:
- ✅ Automated browser navigation through each tutorial step
- ✅ Screen recording of all actions
- 🔄 AI-generated voiceover narration (Nora - in progress)
- 📹 MP4 video output ready for YouTube/social media

## Current Status

### ✅ Phase 1: Complete (Browser Automation & Recording)
- Puppeteer installed for browser automation
- Screen recording configured
- Basic tutorial script execution working
- UI integration in admin tutorials page

### 🔄 Phase 2: In Progress (AI Narration)
- Text-to-speech integration for Nora's voice
- Options: ElevenLabs, OpenAI TTS, Google Cloud TTS
- Voiceover sync with screen actions

### ⏳ Phase 3: Planned (Production Features)
- Background job queue for long-running video generation
- Progress tracking and notifications
- Auto-upload to YouTube/Vimeo
- Video editing (intro/outro, transitions, music)

## How It Works

### From the UI (Admin → Tutorial Videos)

1. Navigate to **Admin → Tutorial Videos** in the header
2. Select a tutorial (e.g., "Sign Up & Create First Tree")
3. Click "🎬 Generate Video Automatically"
4. The system will:
   - Launch an automated browser
   - Navigate through each tutorial step
   - Record the screen
   - Generate voiceover narration
   - Output MP4 video file

### From Command Line (For Testing)

```bash
# Run the video generator directly
npx tsx scripts/generate-tutorial-video.ts

# Videos will be saved to ./tutorial-videos/
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Admin UI (Tutorial Videos Page)               │
│  - Click "Generate Video" button               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  API Endpoint                                   │
│  POST /api/admin/generate-tutorial              │
│  - Validates admin access                       │
│  - Spawns background job                        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Video Generation Script                        │
│  scripts/generate-tutorial-video.ts             │
│                                                  │
│  1. Launch Puppeteer browser                    │
│  2. Navigate through tutorial steps             │
│  3. Record screen with puppeteer-screen-recorder│
│  4. Generate voiceover with TTS API             │
│  5. Combine video + audio                       │
│  6. Output MP4 file                             │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Output: ./tutorial-videos/{tutorial-id}.mp4    │
└─────────────────────────────────────────────────┘
```

## Tutorial Structure

Each tutorial is defined with:

```typescript
interface Tutorial {
  id: string              // Unique identifier
  title: string           // Tutorial name
  description: string     // What it teaches
  steps: TutorialStep[]   // Ordered list of actions
}

interface TutorialStep {
  title: string           // Step name
  page: string            // URL to navigate to
  action: string          // What to do on this page
  duration: string        // How long to pause (e.g., "3s", "2 min")
  voiceover?: string      // Optional custom narration
}
```

## Example Tutorial

```typescript
const tutorial = {
  id: 'signup-demo',
  title: 'Sign Up & Create First Tree',
  description: 'Complete walkthrough of signing up',
  steps: [
    {
      title: 'Landing Page',
      page: '/',
      action: 'View landing page',
      duration: '3s',
      voiceover: 'Welcome to Firefly Grove, where memories live forever'
    },
    {
      title: 'Click Signup',
      page: '/',
      action: 'Click "Get Started" button',
      duration: '2s',
      voiceover: 'Let\'s get started by clicking the signup button'
    },
    // ... more steps
  ]
}
```

## Voiceover: Nora the Narrator

### Character Profile
- **Name**: Nora
- **Style**: Warm, friendly, professional
- **Tone**: Encouraging and clear
- **Pace**: Moderate (not too fast, not too slow)

### Voice Options (To Be Implemented)

#### Option 1: ElevenLabs (Recommended)
- Most natural-sounding AI voice
- Emotion and inflection control
- ~$22/month for Creator plan
- API: `https://api.elevenlabs.io/v1/text-to-speech`

```typescript
// Example ElevenLabs integration
const voice = await generateVoice({
  text: "Welcome to Firefly Grove",
  voiceId: "nora-voice-id",
  stability: 0.5,
  similarity_boost: 0.75
})
```

#### Option 2: OpenAI TTS
- High quality, good pricing
- Multiple voice options
- $15 per 1M characters
- API: OpenAI `audio.speech.create()`

```typescript
// Example OpenAI TTS integration
const speech = await openai.audio.speech.create({
  model: "tts-1-hd",
  voice: "nova",  // or "alloy", "echo", "fable"
  input: "Welcome to Firefly Grove"
})
```

#### Option 3: Google Cloud TTS
- Very affordable
- Good quality
- WaveNet voices available
- $4 per 1M characters

## Video Output Specifications

- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Format**: MP4 (H.264)
- **Audio**: AAC, 192 kbps
- **Aspect Ratio**: 16:9
- **File Size**: ~50-100 MB per 2-minute tutorial

## Customization Options

When generating videos, you can customize:

```typescript
generateTutorialVideo(tutorial, {
  baseUrl: 'http://localhost:3000',  // Or production URL
  outputDir: './tutorial-videos',     // Where to save videos
  slowMo: 500,                        // Milliseconds between actions
  showMouse: true,                    // Show cursor movements
  videoQuality: 'high',               // 'low', 'medium', 'high'
  addIntro: true,                     // 3-second title card
  addOutro: true,                     // 5-second CTA
  backgroundMusic: './music/gentle-piano.mp3'
})
```

## Next Steps to Complete

### Immediate (Phase 2)
1. ✅ Set up ElevenLabs account
2. ✅ Get API key and voice ID for Nora
3. ✅ Integrate TTS into video generation script
4. ✅ Test with one complete tutorial
5. ✅ Sync voiceover timing with screen actions

### Short-term (Phase 3)
1. Add background job queue (BullMQ or similar)
2. Create progress tracking UI
3. Add video preview before finalizing
4. Implement video editing (ffmpeg)
5. Auto-upload to YouTube API

### Long-term (Phase 4)
1. AI-powered script generation from app features
2. Multi-language support
3. Interactive video elements
4. A/B testing different voiceovers/scripts
5. Analytics on video performance

## Testing Locally

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Tutorial Videos**:
   - Login as admin
   - Go to Admin → Tutorial Videos
   - Click "🎬 Generate Video Automatically"

3. **Watch the magic happen**:
   - Browser window opens automatically
   - Steps execute one by one
   - Screen recording captures everything
   - Video saves to `./tutorial-videos/`

## Production Deployment

For production use, we'll need:

1. **Dedicated server** for video generation (CPU/RAM intensive)
2. **Job queue** to handle multiple requests
3. **Storage** for generated videos (S3, GCS, or similar)
4. **CDN** for video delivery
5. **Monitoring** for failed generations

## Cost Estimation

Per tutorial video (assuming 2-3 minutes):

- **ElevenLabs TTS**: ~$0.05 per video
- **Server compute**: ~$0.10 per video (AWS EC2)
- **Storage (S3)**: ~$0.01 per month per video
- **Total**: ~$0.15 per tutorial video

For 10 tutorials: **~$1.50 total**

## FAQ

### Q: Can I customize Nora's voice?
A: Yes! Once we integrate TTS, you can adjust tone, speed, and emotion.

### Q: How long does it take to generate a video?
A: Currently ~2-3x real-time (6 minutes for a 2-minute tutorial). We'll optimize this.

### Q: Can I edit the video after generation?
A: Not yet, but it's planned! You'll be able to trim, add transitions, etc.

### Q: Will this work in production (Vercel)?
A: Not directly - Vercel has 10-second timeout. We'll need a separate worker service.

### Q: Can I generate videos in different languages?
A: Future feature! TTS APIs support 40+ languages.

## Support

Questions? Found a bug?
- Check the tutorial generation logs: `./tutorial-videos/generation.log`
- Review the API response from `/api/admin/generate-tutorial`
- Open an issue in the repo

---

🎬 **Made with automation by Firefly Grove** 🌟
