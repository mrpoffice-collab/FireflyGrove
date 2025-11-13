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
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  // Create cover page
  await createCoverPage(pdfDoc, font, fontBold, entries, weekStart, weekEnd)

  // Create entry pages - one entry per page for full text display
  for (let i = 0; i < entries.length; i++) {
    await createEntryPage(pdfDoc, font, fontBold, fontItalic, entries[i], i + 1, entries.length)
  }

  return await pdfDoc.save()
}

/**
 * Create beautiful cover page
 */
async function createCoverPage(
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

  // Background accent - soft color block at top
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 200,
    width: PAGE_WIDTH,
    height: 200,
    color: rgb(0.95, 0.96, 0.94), // Very light green
  })

  // Decorative border - inset from page edges for printer margins
  const borderInset = 36 // 0.5 inch from edge
  page.drawRectangle({
    x: borderInset,
    y: borderInset,
    width: PAGE_WIDTH - (borderInset * 2),
    height: PAGE_HEIGHT - (borderInset * 2),
    borderColor: COLORS.primary,
    borderWidth: 2,
  })

  // Inner decorative border for elegance
  const innerBorderInset = borderInset + 8
  page.drawRectangle({
    x: innerBorderInset,
    y: innerBorderInset,
    width: PAGE_WIDTH - (innerBorderInset * 2),
    height: PAGE_HEIGHT - (innerBorderInset * 2),
    borderColor: COLORS.primary,
    borderWidth: 0.5,
  })

  let yPosition = PAGE_HEIGHT - 80

  // Title
  const title = 'My Glow Trail'
  const titleSize = 36
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize)
  page.drawText(title, {
    x: centerX - titleWidth / 2,
    y: yPosition,
    size: titleSize,
    font: fontBold,
    color: COLORS.primary,
  })
  yPosition -= 45

  // Subtitle: "Treasures" - bigger and capitalized
  const subtitle = 'Weekly Treasures'
  const subtitleSize = 20
  const subtitleWidth = fontBold.widthOfTextAtSize(subtitle, subtitleSize)
  page.drawText(subtitle, {
    x: centerX - subtitleWidth / 2,
    y: yPosition,
    size: subtitleSize,
    font: fontBold,
    color: COLORS.primary,
  })
  yPosition -= 15

  // Decorative line under title
  page.drawLine({
    start: { x: centerX - 120, y: yPosition },
    end: { x: centerX + 120, y: yPosition },
    color: COLORS.primary,
    thickness: 2,
  })
  yPosition -= 35

  // Week dates
  const dateText = `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`
  const dateSize = 16
  const dateWidth = font.widthOfTextAtSize(dateText, dateSize)
  page.drawText(dateText, {
    x: centerX - dateWidth / 2,
    y: yPosition,
    size: dateSize,
    font: font,
    color: COLORS.text,
  })
  yPosition -= 30

  // Decorative firefly symbols
  const fireflyText = '✨ 🌙 ✨'
  const fireflySize = 16
  const fireflyWidth = font.widthOfTextAtSize(fireflyText, fireflySize)
  page.drawText(fireflyText, {
    x: centerX - fireflyWidth / 2,
    y: yPosition,
    size: fireflySize,
    font: font,
    color: COLORS.primary,
  })
  yPosition -= 60

  const numEntries = entries.length

  // Summary box in center
  if (numEntries === 0) {
    // Empty state
    const emptyMsg = 'No treasures captured this week'
    const emptySize = 14
    const emptyWidth = font.widthOfTextAtSize(emptyMsg, emptySize)
    page.drawText(emptyMsg, {
      x: centerX - emptyWidth / 2,
      y: centerY,
      size: emptySize,
      font: font,
      color: COLORS.muted,
    })
  } else {
    // Draw summary box
    const boxWidth = 300
    const boxHeight = 180
    const boxX = centerX - boxWidth / 2
    const boxYPos = centerY - boxHeight / 2

    // Box background
    page.drawRectangle({
      x: boxX,
      y: boxYPos,
      width: boxWidth,
      height: boxHeight,
      color: rgb(0.98, 0.98, 0.97),
      borderColor: COLORS.primary,
      borderWidth: 1.5,
    })

    let boxY = centerY + 60

    // Summary title
    const summaryTitle = 'This Week\'s Treasures'
    const summaryTitleSize = 16
    const summaryTitleWidth = fontBold.widthOfTextAtSize(summaryTitle, summaryTitleSize)
    page.drawText(summaryTitle, {
      x: centerX - summaryTitleWidth / 2,
      y: boxY,
      size: summaryTitleSize,
      font: fontBold,
      color: COLORS.primary,
    })
    boxY -= 35

    // Count
    const countText = `${numEntries} ${numEntries === 1 ? 'Night' : 'Nights'} of Reflection`
    const countSize = 14
    const countWidth = font.widthOfTextAtSize(countText, countSize)
    page.drawText(countText, {
      x: centerX - countWidth / 2,
      y: boxY,
      size: countSize,
      font: font,
      color: COLORS.text,
    })
    boxY -= 30

    // Category breakdown
    const categories = entries.reduce((acc: any, entry: any) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1
      return acc
    }, {})

    Object.entries(categories).forEach(([category, count]) => {
      const catText = `${category}: ${count}`
      const catSize = 11
      const catWidth = font.widthOfTextAtSize(catText, catSize)
      page.drawText(catText, {
        x: centerX - catWidth / 2,
        y: boxY,
        size: catSize,
        font: font,
        color: COLORS.muted,
      })
      boxY -= 18
    })
  }

  // Bottom decorative element
  page.drawLine({
    start: { x: MARGIN, y: MARGIN + 70 },
    end: { x: PAGE_WIDTH - MARGIN, y: MARGIN + 70 },
    color: COLORS.primary,
    thickness: 1,
  })

  // "Keep glowing" message
  const keepText = 'Keep glowing ✨'
  const keepSize = 12
  const keepWidth = font.widthOfTextAtSize(keepText, keepSize)
  page.drawText(keepText, {
    x: centerX - keepWidth / 2,
    y: MARGIN + 35,
    size: keepSize,
    font: fontBold,
    color: COLORS.primary,
  })

  // Firefly Grove branding (small)
  const brandText = 'FireflyGrove.app'
  const brandSize = 9
  const brandWidth = font.widthOfTextAtSize(brandText, brandSize)
  page.drawText(brandText, {
    x: centerX - brandWidth / 2,
    y: MARGIN + 15,
    size: brandSize,
    font: font,
    color: COLORS.muted,
  })
}

/**
 * Create a beautiful page for each treasure entry
 */
async function createEntryPage(
  pdfDoc: PDFDocument,
  font: any,
  fontBold: any,
  fontItalic: any,
  entry: any,
  entryNumber: number,
  totalEntries: number
) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const centerX = PAGE_WIDTH / 2

  // Decorative header background
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 120,
    width: PAGE_WIDTH,
    height: 120,
    color: rgb(0.95, 0.96, 0.94), // Very light green
  })

  // Decorative border
  const borderInset = 36
  page.drawRectangle({
    x: borderInset,
    y: borderInset,
    width: PAGE_WIDTH - (borderInset * 2),
    height: PAGE_HEIGHT - (borderInset * 2),
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  })

  let yPosition = PAGE_HEIGHT - 50

  // Page number
  const pageNum = `${entryNumber} of ${totalEntries}`
  const pageNumSize = 10
  const pageNumWidth = font.widthOfTextAtSize(pageNum, pageNumSize)
  page.drawText(pageNum, {
    x: PAGE_WIDTH - MARGIN - pageNumWidth,
    y: yPosition,
    size: pageNumSize,
    font: font,
    color: COLORS.muted,
  })

  // Date header
  const dayLabel = format(new Date(entry.entryUTC), 'EEEE, MMMM d, yyyy')
  const daySize = 14
  const dayWidth = fontBold.widthOfTextAtSize(dayLabel, daySize)
  page.drawText(dayLabel, {
    x: centerX - dayWidth / 2,
    y: yPosition,
    size: daySize,
    font: fontBold,
    color: COLORS.primary,
  })
  yPosition -= 30

  // Decorative line
  page.drawLine({
    start: { x: centerX - 80, y: yPosition },
    end: { x: centerX + 80, y: yPosition },
    color: COLORS.primary,
    thickness: 1,
  })
  yPosition -= 40

  // Category badge
  const categoryText = entry.category.toUpperCase()
  const categorySize = 10
  const categoryWidth = font.widthOfTextAtSize(categoryText, categorySize)
  const badgePadding = 8

  page.drawRectangle({
    x: centerX - categoryWidth / 2 - badgePadding,
    y: yPosition - 3,
    width: categoryWidth + (badgePadding * 2),
    height: 18,
    color: COLORS.primary,
  })

  page.drawText(categoryText, {
    x: centerX - categoryWidth / 2,
    y: yPosition,
    size: categorySize,
    font: fontBold,
    color: rgb(1, 1, 1), // White text
  })
  yPosition -= 40

  // Prompt (in italic, centered)
  const promptText = `"${entry.promptText}"`
  const promptSize = 11
  const promptLines = wrapText(promptText, fontItalic, promptSize, CONTENT_WIDTH - 80)

  for (const line of promptLines) {
    const lineWidth = fontItalic.widthOfTextAtSize(line, promptSize)
    page.drawText(line, {
      x: centerX - lineWidth / 2,
      y: yPosition,
      size: promptSize,
      font: fontItalic,
      color: COLORS.muted,
    })
    yPosition -= (promptSize + 4)
  }
  yPosition -= 20

  // Decorative separator
  const separatorText = '* * *'
  const separatorSize = 10
  const separatorWidth = font.widthOfTextAtSize(separatorText, separatorSize)
  page.drawText(separatorText, {
    x: centerX - separatorWidth / 2,
    y: yPosition,
    size: separatorSize,
    font: font,
    color: COLORS.primary,
  })
  yPosition -= 30

  // Treasure response - FULL TEXT, NO TRUNCATION!
  const responseSize = 12
  const responseLineHeight = responseSize + 5
  const responseLines = wrapText(entry.text, font, responseSize, CONTENT_WIDTH - 40)

  let currentPage = page
  for (const line of responseLines) {
    // Check if we need a new page
    if (yPosition < MARGIN + 60) {
      // Continue on next page
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

      // Add border to continuation page
      currentPage.drawRectangle({
        x: borderInset,
        y: borderInset,
        width: PAGE_WIDTH - (borderInset * 2),
        height: PAGE_HEIGHT - (borderInset * 2),
        borderColor: COLORS.primary,
        borderWidth: 1.5,
      })

      // Reset yPosition for new page
      yPosition = PAGE_HEIGHT - MARGIN - 20

      // Add "continued" marker
      const contText = `(continued from ${format(new Date(entry.entryUTC), 'MMMM d')})`
      const contSize = 9
      const contWidth = font.widthOfTextAtSize(contText, contSize)
      currentPage.drawText(contText, {
        x: centerX - contWidth / 2,
        y: yPosition,
        size: contSize,
        font: fontItalic,
        color: COLORS.muted,
      })
      yPosition -= 30
    }

    const lineWidth = font.widthOfTextAtSize(line, responseSize)
    currentPage.drawText(line, {
      x: centerX - lineWidth / 2,
      y: yPosition,
      size: responseSize,
      font: font,
      color: COLORS.text,
    })
    yPosition -= responseLineHeight
  }

  // Audio indicator if present
  if (entry.audioUrl && yPosition > MARGIN + 40) {
    yPosition -= 15
    const voiceText = '♪ Voice Recording Included'
    const voiceSize = 10
    const voiceWidth = font.widthOfTextAtSize(voiceText, voiceSize)
    page.drawText(voiceText, {
      x: centerX - voiceWidth / 2,
      y: yPosition,
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
  // First, sanitize the text:
  // 1. Replace newlines with spaces
  // 2. Remove other control characters that WinAnsi can't encode
  // 3. Replace any other problematic characters
  const sanitized = text
    .replace(/[\n\r\t]/g, ' ') // Replace newlines, carriage returns, tabs with spaces
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

