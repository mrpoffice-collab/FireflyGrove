# Card Sentiments Configuration

This file controls all the front and inside messages for Firefly Grove greeting cards.

## How to Edit Sentiments

1. Open `config/card-sentiments.json`
2. Edit any sentiment's `cover` (front message) or `inside` (inside message)
3. Save the file
4. Run the update command (see below)
5. Deploy to Vercel

## Updating Sentiments

### Locally
```bash
npm run update-sentiments
```

### After Deploying to Vercel
The sentiments are stored in the database, so you'll need to:
1. Edit `config/card-sentiments.json`
2. Commit and push to GitHub
3. SSH into your Vercel deployment or use a database client
4. Run the update script against your production database

Or better yet:
1. Edit locally
2. Run `npm run update-sentiments` locally (connected to prod DB)
3. Commit the config file changes
4. Push to deploy

## Formatting Tips

- Use `\n` for line breaks in poetry/verse formatting
- Keep front messages short and impactful (1-2 lines)
- Inside messages can be longer and more poetic
- Maintain Firefly Grove's warm, metaphorical voice
- Use firefly/light/warmth imagery when appropriate

## Available Sentiments

Current templates that need sentiments:
- **In Loving Memory** - Sympathy/memorial cards
- **Thinking of You** - General connection
- **Happy Birthday** - Birthday celebrations
- **Thank You** - Gratitude cards
- **Season's Greetings** - Holiday cards
- **Congratulations** - Achievement celebrations
- **Get Well Soon** - Encouragement & healing
- **Welcome, Little One** - New baby
- **With Sympathy** - Condolence
- **Happy Anniversary** - Love milestones
- **Just Because** - Random kindness
- **In Memory of a Pet** - Pet remembrance
- **Friendship** - Friendship celebration
- **Default** - Fallback for any unmatched templates

## Adding New Sentiments

To add a new sentiment:
1. Add a new entry to the `sentiments` object in the JSON file
2. The key should match the template name exactly
3. Include both `cover` and `inside` messages
4. Run `npm run update-sentiments`

Example:
```json
"New Template Name": {
  "cover": "Your front message here.",
  "inside": "Your inside message here.\nWith line breaks as needed."
}
```

## Firefly Grove Voice Guide

When writing sentiments, remember:
- ✨ Use light/firefly metaphors naturally
- 🌿 Keep it warm but not overly sentimental
- 💛 Focus on connection and presence
- 🌙 Embrace quiet, contemplative moments
- ✦ "You're seen" over "You're special"

Good examples:
- "Like fireflies dancing through dusk"
- "The light always returns — even after the longest night"
- "You're one of the steady lights I look for in the dark"
- "Their joy was simple, their love was pure — and it still glows"
