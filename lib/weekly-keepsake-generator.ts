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

  // Cover page
  await addCoverPage(pdfDoc, font, fontBold, weekStart, weekEnd, entries.length)

  // Entry pages
  for (let i = 0; i < entries.length; i++) {
    await addEntryPage(pdfDoc, font, fontBold, entries[i], i + 1, entries.length)
  }

  // Closing page
  if (entries.length > 0) {
    await addClosingPage(pdfDoc, font, fontBold, entries.length)
  }

  return await pdfDoc.save()
}

/**
 * Cover page
 */
async function addCoverPage(
  pdfDoc: PDFDocument,
  font: any,
  fontBold: any,
  weekStart: Date,
  weekEnd: Date,
  entryCount: number
) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const centerX = PAGE_WIDTH / 2
  const centerY = PAGE_HEIGHT / 2

  // Title
  const title = 'Weekly Keepsake'
  const titleSize = 36
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize)
  page.drawText(title, {
    x: centerX - titleWidth / 2,
    y: centerY + 100,
    size: titleSize,
    font: fontBold,
    color: COLORS.primary,
  })

  // Note: Emojis don't render in pdf-lib, so we'll use text decoration instead
  const scrollText = '~~ Scroll ~~'
  const scrollSize = 20
  const scrollWidth = font.widthOfTextAtSize(scrollText, scrollSize)
  page.drawText(scrollText, {
    x: centerX - scrollWidth / 2,
    y: centerY + 40,
    size: scrollSize,
    font: font,
    color: COLORS.primary,
  })

  // Week dates
  const dateText = `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`
  const dateSize = 18
  const dateWidth = font.widthOfTextAtSize(dateText, dateSize)
  page.drawText(dateText, {
    x: centerX - dateWidth / 2,
    y: centerY - 30,
    size: dateSize,
    font: font,
    color: COLORS.text,
  })

  // Entry count
  const countText = `${entryCount} ${entryCount === 1 ? 'treasure' : 'treasures'} this week`
  const countSize = 14
  const countWidth = font.widthOfTextAtSize(countText, countSize)
  page.drawText(countText, {
    x: centerX - countWidth / 2,
    y: centerY - 60,
    size: countSize,
    font: font,
    color: COLORS.muted,
  })

  // Footer
  const footerText = 'From your Firefly Grove Treasure Chest'
  const footerSize = 10
  const footerWidth = font.widthOfTextAtSize(footerText, footerSize)
  page.drawText(footerText, {
    x: centerX - footerWidth / 2,
    y: MARGIN + 30,
    size: footerSize,
    font: font,
    color: COLORS.muted,
  })
}

/**
 * Entry page
 */
async function addEntryPage(
  pdfDoc: PDFDocument,
  font: any,
  fontBold: any,
  entry: any,
  index: number,
  total: number
) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let yPosition = PAGE_HEIGHT - MARGIN

  // Date header
  const dateText = format(new Date(entry.entryUTC), 'EEEE, MMMM d, yyyy')
  page.drawText(dateText, {
    x: MARGIN,
    y: yPosition,
    size: 10,
    font: font,
    color: COLORS.muted,
  })

  // Entry number (right-aligned)
  const entryNumText = `Entry ${index} of ${total}`
  const entryNumWidth = font.widthOfTextAtSize(entryNumText, 8)
  page.drawText(entryNumText, {
    x: PAGE_WIDTH - MARGIN - entryNumWidth,
    y: yPosition,
    size: 8,
    font: font,
    color: COLORS.muted,
  })

  yPosition -= 25

  // Divider line
  page.drawLine({
    start: { x: MARGIN, y: yPosition },
    end: { x: PAGE_WIDTH - MARGIN, y: yPosition },
    color: COLORS.secondary,
    thickness: 1,
  })

  yPosition -= 30

  // Prompt (we'll use regular font since pdf-lib doesn't have italic built-in)
  const promptText = `"${entry.promptText}"`
  const promptLines = wrapText(promptText, font, 12, CONTENT_WIDTH)
  for (const line of promptLines) {
    page.drawText(line, {
      x: MARGIN,
      y: yPosition,
      size: 12,
      font: font,
      color: COLORS.muted,
    })
    yPosition -= 16
  }

  yPosition -= 10

  // Response text
  if (entry.text) {
    const responseLines = wrapText(entry.text, font, 13, CONTENT_WIDTH)
    for (const line of responseLines) {
      if (yPosition < MARGIN + 50) break // Avoid overflow
      page.drawText(line, {
        x: MARGIN,
        y: yPosition,
        size: 13,
        font: font,
        color: COLORS.text,
      })
      yPosition -= 18
    }
    yPosition -= 10
  }

  // Audio indicator
  if (entry.audioUrl) {
    if (yPosition > MARGIN + 50) {
      page.drawText('Voice recording included', {
        x: MARGIN,
        y: yPosition,
        size: 10,
        font: font,
        color: COLORS.primary,
      })
      yPosition -= 25
    }
  }

  // Branch assignment
  if (entry.branch) {
    if (yPosition > MARGIN + 50) {
      page.drawText(`Branch: ${entry.branch.title}`, {
        x: MARGIN,
        y: yPosition,
        size: 9,
        font: font,
        color: COLORS.muted,
      })
      yPosition -= 20
    }
  }

  // Category badge (at bottom)
  const categoryLabel = entry.category.replace('_', ' ')
  page.drawText(categoryLabel, {
    x: MARGIN,
    y: MARGIN + 20,
    size: 8,
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

/**
 * Closing page
 */
async function addClosingPage(
  pdfDoc: PDFDocument,
  font: any,
  fontBold: any,
  entryCount: number
) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const centerX = PAGE_WIDTH / 2
  const centerY = PAGE_HEIGHT / 2

  // Sparkle decoration (since emojis don't work, use text)
  const sparkleText = '* * *'
  const sparkleSize = 24
  const sparkleWidth = font.widthOfTextAtSize(sparkleText, sparkleSize)
  page.drawText(sparkleText, {
    x: centerX - sparkleWidth / 2,
    y: centerY + 60,
    size: sparkleSize,
    font: font,
    color: COLORS.primary,
  })

  // Message
  const mainText = 'Your Glow Trail This Week'
  const mainSize = 16
  const mainWidth = font.widthOfTextAtSize(mainText, mainSize)
  page.drawText(mainText, {
    x: centerX - mainWidth / 2,
    y: centerY,
    size: mainSize,
    font: font,
    color: COLORS.text,
  })

  // Count message
  const countMsg = `${entryCount} ${entryCount === 1 ? 'night' : 'nights'} of wisdom, gratitude, and treasured thoughts`
  const countSize = 12
  const countWidth = font.widthOfTextAtSize(countMsg, countSize)
  page.drawText(countMsg, {
    x: centerX - countWidth / 2,
    y: centerY - 40,
    size: countSize,
    font: font,
    color: COLORS.muted,
  })

  // Footer message
  const footerMsg = 'Keep glowing'
  const footerSize = 10
  const footerWidth = font.widthOfTextAtSize(footerMsg, footerSize)
  page.drawText(footerMsg, {
    x: centerX - footerWidth / 2,
    y: MARGIN + 30,
    size: footerSize,
    font: font,
    color: COLORS.muted,
  })
}
