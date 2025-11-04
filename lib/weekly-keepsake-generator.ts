import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { prisma } from './prisma'
import { format, startOfWeek, endOfWeek } from 'date-fns'

/**
 * Weekly Keepsake PDF Generator
 * Creates a beautiful weekly summary of treasure entries
 */

// Page dimensions (8.5" x 11" letter size)
const PAGE_WIDTH = 612 // 8.5 * 72
const PAGE_HEIGHT = 792 // 11 * 72
const MARGIN = 54 // 0.75 * 72
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)

// Colors - Firefly Grove theme (converted to RGB 0-1 scale)
// Using darker colors for better readability on white paper
const COLORS = {
  primary: rgb(0.420, 0.451, 0.275), // #6B7346 firefly-dim (darker green)
  secondary: rgb(0.3, 0.3, 0.3), // Dark grey for lines
  text: rgb(0.1, 0.1, 0.1), // Nearly black for main text
  muted: rgb(0.4, 0.4, 0.4), // Medium grey for secondary text
  background: rgb(1, 1, 1), // White background
}

interface WeeklyKeepsakeOptions {
  userId: string
  weekStart?: Date // Defaults to start of current week
}

interface GeneratedKeepsake {
  pdf: Uint8Array
  entryCount: number
  weekLabel: string
}

/**
 * Main function: Generate weekly keepsake PDF
 */
export async function generateWeeklyKeepsake(
  options: WeeklyKeepsakeOptions
): Promise<GeneratedKeepsake> {
  const { userId, weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }) } = options

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })

  // Fetch entries for the week
  const entries = await prisma.treasureEntry.findMany({
    where: {
      userId,
      entryUTC: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    include: {
      branch: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      entryUTC: 'asc',
    },
  })

  // Generate PDF
  const pdf = await generateKeepsakePDF(entries, weekStart, weekEnd)

  const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`

  return {
    pdf,
    entryCount: entries.length,
    weekLabel,
  }
}

/**
 * Generate the PDF document
 */
async function generateKeepsakePDF(
  entries: any[],
  weekStart: Date,
  weekEnd: Date
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Single beautiful keepsake page
  await createKeepsakePage(pdfDoc, font, fontBold, entries, weekStart, weekEnd)

  return await pdfDoc.save()
}

/**
 * Create a single beautiful keepsake page
 */
async function createKeepsakePage(
  pdfDoc: PDFDocument,
  font: any,
  fontBold: any,
  entries: any[],
  weekStart: Date,
  weekEnd: Date
) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const centerX = PAGE_WIDTH / 2
  const centerY = PAGE_HEIGHT / 2
  let yPosition = PAGE_HEIGHT - MARGIN - 10 // Start a bit lower

  // Title
  const title = 'My Glow Trail'
  const titleSize = 28
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize)
  page.drawText(title, {
    x: centerX - titleWidth / 2,
    y: yPosition,
    size: titleSize,
    font: fontBold,
    color: COLORS.primary,
  })
  yPosition -= 8

  // Subtitle: "Treasures"
  const subtitle = 'treasures'
  const subtitleSize = 12
  const subtitleWidth = font.widthOfTextAtSize(subtitle, subtitleSize)
  page.drawText(subtitle, {
    x: centerX - subtitleWidth / 2,
    y: yPosition,
    size: subtitleSize,
    font: font,
    color: COLORS.muted,
  })
  yPosition -= 5

  // Decorative line under title (not overlapping)
  page.drawLine({
    start: { x: centerX - 80, y: yPosition },
    end: { x: centerX + 80, y: yPosition },
    color: COLORS.primary,
    thickness: 2,
  })
  yPosition -= 25

  // Week dates
  const dateText = `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`
  const dateSize = 14
  const dateWidth = font.widthOfTextAtSize(dateText, dateSize)
  page.drawText(dateText, {
    x: centerX - dateWidth / 2,
    y: yPosition,
    size: dateSize,
    font: font,
    color: COLORS.muted,
  })
  yPosition -= 20

  // Decorative stars
  const starsText = '* * *'
  const starsSize = 12
  const starsWidth = font.widthOfTextAtSize(starsText, starsSize)
  page.drawText(starsText, {
    x: centerX - starsWidth / 2,
    y: yPosition,
    size: starsSize,
    font: font,
    color: COLORS.primary,
  })
  yPosition -= 35

  // Calculate dynamic layout based on number of entries
  const availableHeight = yPosition - (MARGIN + 120) // Space for entries
  const numEntries = entries.length

  if (numEntries === 0) {
    // Empty state
    const emptyMsg = 'No treasures captured this week'
    const emptySize = 12
    const emptyWidth = font.widthOfTextAtSize(emptyMsg, emptySize)
    page.drawText(emptyMsg, {
      x: centerX - emptyWidth / 2,
      y: centerY,
      size: emptySize,
      font: font,
      color: COLORS.muted,
    })
  } else {
    // Determine layout: 1 column for 1-7 entries, 2 columns for 8+
    const useTwoColumns = numEntries > 7
    const entriesPerColumn = useTwoColumns ? Math.ceil(numEntries / 2) : numEntries

    // Calculate dynamic spacing to fit all entries
    const entrySpacing = Math.min(
      120, // Max spacing for few entries (spacious)
      Math.floor(availableHeight / entriesPerColumn) // Fit to page
    )

    const columnWidth = useTwoColumns ? (CONTENT_WIDTH / 2) - 15 : CONTENT_WIDTH

    for (let i = 0; i < numEntries; i++) {
      const entry = entries[i]
      const column = useTwoColumns ? Math.floor(i / entriesPerColumn) : 0
      const row = useTwoColumns ? i % entriesPerColumn : i

      const xPos = column === 0 ? MARGIN : MARGIN + (CONTENT_WIDTH / 2) + 30
      const yPos = yPosition - (row * entrySpacing)

      // Check if we have space
      if (yPos < MARGIN + 120) break

      // Day label (e.g., "Monday, Nov 4")
      const dayLabel = format(new Date(entry.entryUTC), 'EEEE, MMM d')
      const daySize = numEntries <= 3 ? 11 : 9
      page.drawText(dayLabel, {
        x: xPos,
        y: yPos,
        size: daySize,
        font: fontBold,
        color: COLORS.primary,
      })

      let contentY = yPos - (numEntries <= 3 ? 14 : 12)

      // Prompt - show complete text, no truncation
      const promptSize = numEntries <= 3 ? 9 : 8
      const promptLines = wrapText(`"${entry.promptText}"`, font, promptSize, columnWidth - 10)
      // Show all lines needed for complete prompt
      const maxPromptLines = numEntries <= 3 ? 4 : (numEntries <= 7 ? 3 : 2)

      for (let j = 0; j < Math.min(promptLines.length, maxPromptLines); j++) {
        page.drawText(promptLines[j], {
          x: xPos,
          y: contentY,
          size: promptSize,
          font: font,
          color: COLORS.muted,
        })
        contentY -= (promptSize + 2)
      }

      contentY -= 3

      // Response preview
      if (entry.text) {
        const responseMaxChars = numEntries <= 3 ? 150 : (numEntries <= 7 ? 100 : 70)
        const responsePreview = entry.text.length > responseMaxChars
          ? entry.text.substring(0, responseMaxChars) + '...'
          : entry.text
        const responseSize = numEntries <= 3 ? 10 : 9
        const responseLines = wrapText(responsePreview, font, responseSize, columnWidth - 10)
        const maxResponseLines = numEntries <= 3 ? 4 : (numEntries <= 7 ? 3 : 2)

        for (let j = 0; j < Math.min(responseLines.length, maxResponseLines); j++) {
          if (contentY < MARGIN + 120) break
          page.drawText(responseLines[j], {
            x: xPos,
            y: contentY,
            size: responseSize,
            font: font,
            color: COLORS.text,
          })
          contentY -= (responseSize + 2)
        }
      }

      // Audio indicator
      if (entry.audioUrl && contentY > MARGIN + 120) {
        contentY -= 5
        page.drawText('♪ Voice recording', {
          x: xPos,
          y: contentY,
          size: 7,
          font: font,
          color: COLORS.primary,
        })
      }
    }
  }

  // Bottom decorative element
  page.drawLine({
    start: { x: MARGIN, y: MARGIN + 70 },
    end: { x: PAGE_WIDTH - MARGIN, y: MARGIN + 70 },
    color: COLORS.primary,
    thickness: 1,
  })

  // Count and footer
  const countText = `${entries.length} ${entries.length === 1 ? 'night' : 'nights'} of wisdom & gratitude`
  const countSize = 11
  const countWidth = font.widthOfTextAtSize(countText, countSize)
  page.drawText(countText, {
    x: centerX - countWidth / 2,
    y: MARGIN + 45,
    size: countSize,
    font: fontBold,
    color: COLORS.text,
  })

  // "Keep glowing" message
  const keepText = 'Keep glowing'
  const keepSize = 9
  const keepWidth = font.widthOfTextAtSize(keepText, keepSize)
  page.drawText(keepText, {
    x: centerX - keepWidth / 2,
    y: MARGIN + 25,
    size: keepSize,
    font: font,
    color: COLORS.primary,
  })

  // Firefly Grove branding (small)
  const brandText = 'FireflyGrove.app'
  const brandSize = 8
  const brandWidth = font.widthOfTextAtSize(brandText, brandSize)
  page.drawText(brandText, {
    x: centerX - brandWidth / 2,
    y: MARGIN + 10,
    size: brandSize,
    font: font,
    color: COLORS.muted,
  })
}


/**
 * Helper: Wrap text to fit within width
 */
function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = font.widthOfTextAtSize(testLine, size)

    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) lines.push(currentLine)
  return lines
}

