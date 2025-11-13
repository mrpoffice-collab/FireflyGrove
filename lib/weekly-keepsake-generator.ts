import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { prisma } from './prisma'
import { format, startOfWeek, endOfWeek } from 'date-fns'

/**
 * Weekly Keepsake PDF Generator
 * Creates cut-apart treasure cards for refrigerator display!
 */

// Page dimensions (8.5" x 11" letter size)
const PAGE_WIDTH = 612 // 8.5 * 72
const PAGE_HEIGHT = 792 // 11 * 72
const MARGIN = 36 // 0.5 inch margin for printing

// Card dimensions - 4 cards per page (2x2 grid)
const CARDS_PER_PAGE = 4
const CARD_WIDTH = (PAGE_WIDTH - (MARGIN * 2)) / 2 - 8 // Small gap between cards
const CARD_HEIGHT = (PAGE_HEIGHT - (MARGIN * 2)) / 2 - 8

// Colors - Firefly Grove theme (converted to RGB 0-1 scale)
const COLORS = {
  primary: rgb(0.420, 0.451, 0.275), // #6B7346 firefly-dim
  text: rgb(0.1, 0.1, 0.1), // Nearly black
  muted: rgb(0.4, 0.4, 0.4), // Medium grey
}

interface WeeklyKeepsakeOptions {
  userId: string
  weekStart?: Date
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
 * Generate the PDF document - Cut-apart treasure cards!
 */
async function generateKeepsakePDF(
  entries: any[],
  weekStart: Date,
  weekEnd: Date
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  // Create treasure cards - 4 per page in a 2x2 grid
  let currentPage = null
  let cardIndex = 0

  for (let i = 0; i < entries.length; i++) {
    // Create new page every 4 cards
    if (cardIndex % CARDS_PER_PAGE === 0) {
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      // Add cut lines to show where to cut
      drawCutLines(currentPage, font)
    }

    // Calculate card position (2x2 grid)
    const row = Math.floor((cardIndex % CARDS_PER_PAGE) / 2) // 0 or 1
    const col = (cardIndex % CARDS_PER_PAGE) % 2 // 0 or 1

    const cardX = MARGIN + (col * (CARD_WIDTH + 8))
    const cardY = PAGE_HEIGHT - MARGIN - ((row + 1) * (CARD_HEIGHT + 8))

    // Draw the treasure card
    await drawTreasureCard(
      currentPage!,
      font,
      fontBold,
      fontItalic,
      entries[i],
      cardX,
      cardY
    )

    cardIndex++
  }

  return await pdfDoc.save()
}

/**
 * Draw cut lines showing where to cut apart cards
 */
function drawCutLines(page: any, font: any) {
  const centerX = PAGE_WIDTH / 2
  const centerY = PAGE_HEIGHT / 2

  // Vertical center line
  page.drawLine({
    start: { x: centerX, y: MARGIN },
    end: { x: centerX, y: PAGE_HEIGHT - MARGIN },
    color: rgb(0.8, 0.8, 0.8),
    thickness: 0.5,
    dashArray: [3, 3],
  })

  // Horizontal center line
  page.drawLine({
    start: { x: MARGIN, y: centerY },
    end: { x: PAGE_WIDTH - MARGIN, y: centerY },
    color: rgb(0.8, 0.8, 0.8),
    thickness: 0.5,
    dashArray: [3, 3],
  })

  // "Cut here" text
  const scissorText = '- - cut here - -'
  const scissorSize = 7
  const scissorWidth = font.widthOfTextAtSize(scissorText, scissorSize)

  // Top center
  page.drawText(scissorText, {
    x: centerX - scissorWidth / 2,
    y: PAGE_HEIGHT - MARGIN + 10,
    size: scissorSize,
    font: font,
    color: rgb(0.7, 0.7, 0.7),
  })
}

/**
 * Draw a single treasure card
 */
async function drawTreasureCard(
  page: any,
  font: any,
  fontBold: any,
  fontItalic: any,
  entry: any,
  x: number,
  y: number
) {
  const cardPadding = 10
  const innerWidth = CARD_WIDTH - (cardPadding * 2)
  const cardCenterX = x + CARD_WIDTH / 2

  // Card background with soft color
  page.drawRectangle({
    x,
    y,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    color: rgb(0.98, 0.98, 0.96), // Very light cream
  })

  // Card border
  page.drawRectangle({
    x: x + 3,
    y: y + 3,
    width: CARD_WIDTH - 6,
    height: CARD_HEIGHT - 6,
    borderColor: COLORS.primary,
    borderWidth: 2,
  })

  // Inner decorative border
  page.drawRectangle({
    x: x + 6,
    y: y + 6,
    width: CARD_WIDTH - 12,
    height: CARD_HEIGHT - 12,
    borderColor: COLORS.primary,
    borderWidth: 0.5,
  })

  let yPos = y + CARD_HEIGHT - 18

  // Date (small, at top)
  const dayLabel = format(new Date(entry.entryUTC), 'EEE, MMM d')
  const daySize = 8
  const dayWidth = fontBold.widthOfTextAtSize(dayLabel, daySize)
  page.drawText(dayLabel, {
    x: cardCenterX - dayWidth / 2,
    y: yPos,
    size: daySize,
    font: fontBold,
    color: COLORS.primary,
  })
  yPos -= 18

  // Category badge
  const categoryText = entry.category.toUpperCase()
  const categorySize = 8
  const categoryWidth = fontBold.widthOfTextAtSize(categoryText, categorySize)
  const badgePadding = 6

  page.drawRectangle({
    x: cardCenterX - categoryWidth / 2 - badgePadding,
    y: yPos - 2,
    width: categoryWidth + (badgePadding * 2),
    height: 14,
    color: COLORS.primary,
  })

  page.drawText(categoryText, {
    x: cardCenterX - categoryWidth / 2,
    y: yPos,
    size: categorySize,
    font: fontBold,
    color: rgb(1, 1, 1), // White text
  })
  yPos -= 22

  // Prompt (small, italic)
  const promptText = `"${entry.promptText}"`
  const promptSize = 7.5
  const promptLines = wrapText(promptText, fontItalic, promptSize, innerWidth)

  // Limit prompt to 2 lines max
  const displayPromptLines = promptLines.slice(0, 2)
  for (const line of displayPromptLines) {
    const lineWidth = fontItalic.widthOfTextAtSize(line, promptSize)
    page.drawText(line, {
      x: cardCenterX - lineWidth / 2,
      y: yPos,
      size: promptSize,
      font: fontItalic,
      color: COLORS.muted,
    })
    yPos -= (promptSize + 3)
  }
  yPos -= 8

  // Separator
  const sepText = '* * *'
  const sepSize = 8
  const sepWidth = font.widthOfTextAtSize(sepText, sepSize)
  page.drawText(sepText, {
    x: cardCenterX - sepWidth / 2,
    y: yPos,
    size: sepSize,
    font: font,
    color: COLORS.primary,
  })
  yPos -= 15

  // Treasure text (THE MAIN CONTENT!)
  const treasureSize = 9
  const treasureLines = wrapText(entry.text, font, treasureSize, innerWidth)

  // Calculate available space and fit as much as possible
  const bottomMargin = y + 20 // Leave space at bottom
  const availableHeight = yPos - bottomMargin
  const lineHeight = treasureSize + 3
  const maxLines = Math.floor(availableHeight / lineHeight)

  const displayLines = treasureLines.slice(0, maxLines)

  for (let i = 0; i < displayLines.length; i++) {
    let line = displayLines[i]

    // If this is the last line and there's more text, add ellipsis
    if (i === displayLines.length - 1 && treasureLines.length > maxLines) {
      // Truncate to fit "..."
      while (font.widthOfTextAtSize(line + '...', treasureSize) > innerWidth && line.length > 0) {
        line = line.slice(0, -1).trim()
      }
      line = line + '...'
    }

    const lineWidth = font.widthOfTextAtSize(line, treasureSize)
    page.drawText(line, {
      x: cardCenterX - lineWidth / 2,
      y: yPos,
      size: treasureSize,
      font: font,
      color: COLORS.text,
    })
    yPos -= lineHeight
  }

  // Audio indicator at bottom if present
  if (entry.audioUrl) {
    const voiceText = '~ voice ~'
    const voiceSize = 7
    const voiceWidth = fontItalic.widthOfTextAtSize(voiceText, voiceSize)
    page.drawText(voiceText, {
      x: cardCenterX - voiceWidth / 2,
      y: y + 8,
      size: voiceSize,
      font: fontItalic,
      color: COLORS.primary,
    })
  }
}

/**
 * Helper: Wrap text to fit within width
 * Sanitizes text to remove characters that PDFLib cannot encode
 */
function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  // Sanitize the text
  const sanitized = text
    .replace(/[\n\r\t]/g, ' ') // Replace newlines, tabs with spaces
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()

  const words = sanitized.split(' ')
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
