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
  let yPosition = PAGE_HEIGHT - MARGIN

  // Decorative top border
  page.drawLine({
    start: { x: MARGIN, y: yPosition },
    end: { x: PAGE_WIDTH - MARGIN, y: yPosition },
    color: COLORS.primary,
    thickness: 2,
  })
  yPosition -= 20

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
  yPosition -= 30

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
  yPosition -= 15

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
  yPosition -= 30

  // If no entries, show encouraging message
  if (entries.length === 0) {
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
    // Display entries in a grid/list format
    const entrySpacing = 95 // Space between entries
    const maxEntriesPerColumn = 5
    const columnWidth = CONTENT_WIDTH / 2

    for (let i = 0; i < Math.min(entries.length, 10); i++) {
      const entry = entries[i]
      const column = Math.floor(i / maxEntriesPerColumn)
      const row = i % maxEntriesPerColumn

      const xPos = column === 0 ? MARGIN : MARGIN + columnWidth + 30
      const yPos = yPosition - (row * entrySpacing)

      // Check if we have space
      if (yPos < MARGIN + 80) break

      // Day label (e.g., "Monday, Nov 4")
      const dayLabel = format(new Date(entry.entryUTC), 'EEEE, MMM d')
      page.drawText(dayLabel, {
        x: xPos,
        y: yPos,
        size: 9,
        font: fontBold,
        color: COLORS.primary,
      })

      // Prompt (truncated)
      const promptText = entry.promptText.length > 50
        ? entry.promptText.substring(0, 50) + '...'
        : entry.promptText
      const promptLines = wrapText(`"${promptText}"`, font, 8, columnWidth - 20)
      let promptY = yPos - 12
      for (let j = 0; j < Math.min(promptLines.length, 2); j++) {
        page.drawText(promptLines[j], {
          x: xPos,
          y: promptY,
          size: 8,
          font: font,
          color: COLORS.muted,
        })
        promptY -= 10
      }

      // Response preview (first 80 chars)
      if (entry.text) {
        const responsePreview = entry.text.length > 80
          ? entry.text.substring(0, 80) + '...'
          : entry.text
        const responseLines = wrapText(responsePreview, font, 9, columnWidth - 20)
        let responseY = promptY - 5
        for (let j = 0; j < Math.min(responseLines.length, 3); j++) {
          if (responseY < MARGIN + 80) break
          page.drawText(responseLines[j], {
            x: xPos,
            y: responseY,
            size: 9,
            font: font,
            color: COLORS.text,
          })
          responseY -= 11
        }
      }

      // Audio indicator
      if (entry.audioUrl) {
        page.drawText('♪ Voice', {
          x: xPos,
          y: yPos - 80,
          size: 7,
          font: font,
          color: COLORS.primary,
        })
      }
    }

    // If more than 10 entries, add note
    if (entries.length > 10) {
      const moreText = `+ ${entries.length - 10} more treasures this week`
      const moreSize = 9
      const moreWidth = font.widthOfTextAtSize(moreText, moreSize)
      page.drawText(moreText, {
        x: centerX - moreWidth / 2,
        y: MARGIN + 90,
        size: moreSize,
        font: font,
        color: COLORS.muted,
      })
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

