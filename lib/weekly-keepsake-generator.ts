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

  // Decorative border - inset from page edges for printer margins
  const borderInset = 36 // 0.5 inch from edge
  page.drawRectangle({
    x: borderInset,
    y: borderInset,
    width: PAGE_WIDTH - (borderInset * 2),
    height: PAGE_HEIGHT - (borderInset * 2),
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  })

  // Inner decorative border for elegance
  const innerBorderInset = borderInset + 6
  page.drawRectangle({
    x: innerBorderInset,
    y: innerBorderInset,
    width: PAGE_WIDTH - (innerBorderInset * 2),
    height: PAGE_HEIGHT - (innerBorderInset * 2),
    borderColor: COLORS.primary,
    borderWidth: 0.5,
  })

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
  yPosition -= 35

  // Subtitle: "Treasures" - bigger and capitalized
  const subtitle = 'Treasures'
  const subtitleSize = 18
  const subtitleWidth = fontBold.widthOfTextAtSize(subtitle, subtitleSize)
  page.drawText(subtitle, {
    x: centerX - subtitleWidth / 2,
    y: yPosition,
    size: subtitleSize,
    font: fontBold,
    color: COLORS.primary,
  })
  yPosition -= 8

  // Decorative line under title (not overlapping)
  page.drawLine({
    start: { x: centerX - 100, y: yPosition },
    end: { x: centerX + 100, y: yPosition },
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
  const availableHeight = yPosition - (MARGIN + 100) // Space for entries
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
    // Determine layout: 1 column centered for 1-4, 2 columns for 5+
    const useTwoColumns = numEntries > 4
    const entriesPerColumn = useTwoColumns ? Math.ceil(numEntries / 2) : numEntries

    // Calculate dynamic spacing to USE ALL available space
    const entrySpacing = Math.floor(availableHeight / entriesPerColumn)

    // Column setup - for two column layout, define column centers
    const columnWidth = useTwoColumns ? (CONTENT_WIDTH / 2) - 20 : CONTENT_WIDTH
    const leftColumnCenter = useTwoColumns ? MARGIN + (CONTENT_WIDTH / 4) : centerX
    const rightColumnCenter = useTwoColumns ? MARGIN + (CONTENT_WIDTH * 3 / 4) : centerX

    // Calculate total content height for vertical centering
    const totalContentHeight = entriesPerColumn * entrySpacing
    const verticalOffset = (availableHeight - totalContentHeight) / 2
    const startY = yPosition - verticalOffset

    for (let i = 0; i < numEntries; i++) {
      const entry = entries[i]
      const column = useTwoColumns ? Math.floor(i / entriesPerColumn) : 0
      const row = useTwoColumns ? i % entriesPerColumn : i

      // Center point for this entry's column
      const columnCenterX = column === 0 ? leftColumnCenter : rightColumnCenter
      const yPos = startY - (row * entrySpacing)

      // Day label (e.g., "Monday, Nov 4") - CENTERED - smaller, subtle
      const dayLabel = format(new Date(entry.entryUTC), 'EEEE, MMM d')
      const daySize = numEntries <= 2 ? 8 : (numEntries <= 4 ? 7.5 : 7)
      const dayWidth = font.widthOfTextAtSize(dayLabel, daySize)
      page.drawText(dayLabel, {
        x: columnCenterX - (dayWidth / 2),
        y: yPos,
        size: daySize,
        font: font, // Regular font, not bold
        color: COLORS.muted,
      })

      let contentY = yPos - (daySize + 3)

      // Prompt - show complete text, no truncation - CENTERED - smaller, subtle
      const promptSize = numEntries <= 2 ? 7.5 : (numEntries <= 4 ? 7 : 6.5)
      const promptLines = wrapText(`"${entry.promptText}"`, font, promptSize, columnWidth)
      // Calculate max lines based on available space per entry
      const linesAvailableForPrompt = Math.floor((entrySpacing * 0.25) / (promptSize + 2))
      const maxPromptLines = Math.max(2, Math.min(linesAvailableForPrompt, promptLines.length))

      for (let j = 0; j < Math.min(promptLines.length, maxPromptLines); j++) {
        const lineWidth = font.widthOfTextAtSize(promptLines[j], promptSize)
        page.drawText(promptLines[j], {
          x: columnCenterX - (lineWidth / 2),
          y: contentY,
          size: promptSize,
          font: font,
          color: COLORS.muted,
        })
        contentY -= (promptSize + 2)
      }

      contentY -= 6

      // TREASURE (Response) - THE STAR! - CENTERED - LARGE
      if (entry.text) {
        const responseSize = numEntries <= 2 ? 13 : (numEntries <= 4 ? 11.5 : 10.5)
        const responseLines = wrapText(entry.text, font, responseSize, columnWidth)
        // Use remaining space for response - give it most of the space!
        const linesAvailableForResponse = Math.floor((yPos - contentY - 15) / (responseSize + 3))
        const maxResponseLines = Math.max(2, Math.min(linesAvailableForResponse, responseLines.length))

        for (let j = 0; j < Math.min(responseLines.length, maxResponseLines); j++) {
          if (contentY < MARGIN + 100) break
          const line = j === maxResponseLines - 1 && responseLines.length > maxResponseLines
            ? responseLines[j].substring(0, Math.max(0, responseLines[j].length - 3)) + '...'
            : responseLines[j]
          const lineWidth = font.widthOfTextAtSize(line, responseSize)
          page.drawText(line, {
            x: columnCenterX - (lineWidth / 2),
            y: contentY,
            size: responseSize,
            font: font,
            color: COLORS.text, // Darkest color for maximum visibility
          })
          contentY -= (responseSize + 3)
        }
      }

      // Audio indicator - CENTERED
      if (entry.audioUrl && contentY > MARGIN + 100) {
        contentY -= 5
        const voiceText = '♪ Voice'
        const voiceWidth = font.widthOfTextAtSize(voiceText, 7)
        page.drawText(voiceText, {
          x: columnCenterX - (voiceWidth / 2),
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

