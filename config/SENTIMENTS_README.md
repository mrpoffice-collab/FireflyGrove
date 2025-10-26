# Card Sentiments Library

This system manages a **library of card messages** for Firefly Grove greeting cards. Each category can have dozens of different sentiments that users can choose from when creating cards.

## Quick Start

### 1. Edit the Spreadsheet
Open `config/card-sentiments.csv` in:
- Excel
- Google Sheets (File → Import)
- LibreOffice Calc
- Any text editor

### 2. Add or Edit Sentiments

The CSV has 4 columns:

| Column | Description | Example |
|--------|-------------|---------|
| **Category** | Must match exact category name | "In the Quiet of Loss" |
| **Front** | Short message for card cover (1-2 lines) | "Some people aren't just part of our story..." |
| **Inside** | Longer poetic message (can use line breaks) | "In quiet moments, their memory glows softly..." |
| **Tags** | Optional keywords for filtering | "poetic,firefly,memorial" |

**Tips:**
- Category name must match exactly (see Available Categories below)
- Use actual line breaks in the Inside column for formatting
- If using Excel/Google Sheets, the multi-line text will be preserved
- Tags are optional but helpful for organization

### 3. Import to Database

```bash
npm run import-sentiments
```

This will:
- Read the CSV file
- Match categories
- Create new sentiment records
- Skip duplicates
- Show you a summary

### 4. Deploy

```bash
git add config/card-sentiments.csv
git commit -m "Update card sentiments"
git push
```

Vercel will automatically deploy your changes.

---

## Available Categories

Your CSV must use these **exact** category names:

- **In the Quiet of Loss** 🌿 - Sympathy & memorial cards
- **Another Year of Light** 🌸 - Birthday celebrations
- **Season of Warmth** 🌲 - Holiday greetings
- **Gratitude in Bloom** 🌼 - Thank you cards
- **Under the Same Sky** 🌙 - Thinking of you
- **Love, Still Growing** 💞 - Anniversary cards
- **New Light in the Grove** 🌱 - New baby
- **Stepping Into the Light** 🎓 - Graduation & achievements
- **Encouragement & Healing** 🌅 - Recovery & support
- **Friendship & Connection** ✨ - Friendship celebration
- **Pet Remembrance** 🐾 - Pet remembrance
- **Just Because** 💛 - Just because

---

## Workflow Examples

### Adding a New Sentiment

1. Open `card-sentiments.csv`
2. Add a new row:
   ```csv
   "In the Quiet of Loss","Their light still shines in the lives they touched.","Some presences are so bright...","grief,legacy"
   ```
3. Save the file
4. Run: `npm run import-sentiments`
5. Commit and push

### Editing Existing Sentiments

**Option A: Edit in Database**
- Use Prisma Studio: `npm run db:studio`
- Navigate to CardSentiment table
- Edit directly

**Option B: CSV Re-import**
- Edit the CSV file
- Delete old sentiments in database
- Re-import with `npm run import-sentiments`

### Bulk Adding Sentiments

1. Create multiple rows in the CSV for the same category:
   ```csv
   "Gratitude in Bloom","Thank you for...","Your kindness meant...","formal"
   "Gratitude in Bloom","Words can't express...","I'm deeply grateful...","heartfelt"
   "Gratitude in Bloom","You showed up when...","That's the kind of...","sincere"
   ```
2. Import: `npm run import-sentiments`
3. All will be added to the library for that category

---

## Firefly Grove Voice Guidelines

When writing sentiments, remember the brand voice:

- ✨ **Use light/firefly metaphors naturally** - "your light," "glow," "warmth"
- 🌿 **Keep it warm but not overly sentimental** - Authentic, not syrupy
- 💛 **Focus on connection and presence** - "I see you," "you're not alone"
- 🌙 **Embrace quiet, contemplative moments** - Gentle and reflective
- ✦ **"You're seen" over "You're special"** - Presence over praise

**Good examples:**
- "Like fireflies dancing through dusk"
- "The light always returns — even after the longest night"
- "You're one of the steady lights I look for in the dark"
- "Their joy was simple, their love was pure — and it still glows"

**Avoid:**
- Generic Hallmark phrases
- Overly religious language (keep universal)
- Clichés without fresh perspective
- Excessive exclamation points

---

## CSV Formatting Tips

### Multi-line Messages
In Excel or Google Sheets:
- Press `Alt + Enter` (Windows) or `Option + Enter` (Mac) to add line breaks
- The cell will expand vertically
- When exported to CSV, line breaks are preserved

In a text editor:
- Wrap the entire field in quotes
- Use actual line breaks within the quotes:
  ```csv
  "Category","Front","Inside message line 1
  Inside message line 2
  Inside message line 3","tags"
  ```

### Special Characters
- **Quotes inside text**: Use double quotes: `"She said ""hello"" to me"`
- **Commas inside text**: Wrap the field in quotes: `"Hello, friend"`
- **Apostrophes**: No escaping needed: `"You're loved"`

### Common Issues
- ❌ **Wrong category name**: Must match exactly (check spelling/capitalization)
- ❌ **Unbalanced quotes**: Every opening `"` needs a closing `"`
- ❌ **Mixed line endings**: Use consistent line endings (LF or CRLF)

---

## Database Schema

The sentiments are stored in the `CardSentiment` table:

```typescript
model CardSentiment {
  id              String   // Unique ID
  categoryId      String   // Links to CardCategory
  coverMessage    String   // Front of card
  insideMessage   String   // Inside of card
  tags            String?  // Optional tags
  displayOrder    Int      // Sort order
  isActive        Boolean  // Can be toggled off
}
```

When a user creates a card:
1. They select a category
2. They see all active sentiments for that category
3. They pick one
4. The selected `sentimentId` is stored with the CardOrder

---

## Advanced: Tags & Filtering

Tags help organize and filter sentiments:

**Example tags:**
- `formal` - Professional tone
- `casual` - Friendly, relaxed tone
- `poetic` - Metaphorical, lyrical
- `short` - Brief messages
- `long` - More detailed
- `firefly` - Uses firefly imagery
- `grief` - Focused on loss
- `joy` - Celebratory

**Future feature:** Users could filter sentiments by tag when selecting.

---

## Troubleshooting

### Import fails with "Category not found"
- Check spelling and capitalization of category name
- View all categories: `npm run db:studio` → CardCategory table
- Use exact name from Available Categories list above

### Import shows "already exists"
- The sentiment is already in the database
- Either edit it directly in Prisma Studio
- Or delete the old one and re-import

### Multi-line formatting not working
- Make sure the entire field is wrapped in quotes
- Use actual line breaks (Enter key), not `\n` in the CSV
- Test by importing one row first

### Dev server won't restart after schema changes
- Kill all running processes
- Run: `npx prisma generate`
- Restart: `npm run dev`

---

## Next Steps

- **Browse sentiments**: `npm run db:studio` → CardSentiment table
- **Test card creation**: Create a card and see sentiment picker in action
- **Add more sentiments**: Each category can have unlimited options
- **Share the CSV**: Send `card-sentiments.csv` to writers for bulk additions

🌟 Happy sentiment writing!
