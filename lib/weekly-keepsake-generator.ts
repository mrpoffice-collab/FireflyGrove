import PDFDocument from 'pdfkit'
import { prisma } from './prisma'
import { format, startOfWeek, endOfWeek } from 'date-fns'

/**
 * Weekly Keepsake PDF Generator
 * Creates a beautiful weekly summary of treasure entries
 */

// Page dimensions (8.5" x 11" letter size)
const PAGE_WIDTH = 8.5 * 72 // 612 pts
const PAGE_HEIGHT = 11 * 72 // 792 pts
const MARGIN = 0.75 * 72 // 54 pts
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)

// Colors - Firefly Grove theme
const COLORS = {
  primary: '#8B9556', // firefly-glow
  secondary: '#6B7346', // firefly-dim
  text: '#E8E6E3', // text-soft
  muted: '#9B9892', // text-muted
  background: '#1A1A1A', // bg-dark
}

interface WeeklyKeepsakeOptions {
  userId: string
  weekStart?: Date // Defaults to start of current week
}

interface GeneratedKeepsake {
  pdf: Buffer
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
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [PAGE_WIDTH, PAGE_HEIGHT],
        margins: {
          top: MARGIN,
          bottom: MARGIN,
          left: MARGIN,
          right: MARGIN,
        },
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Cover page
      addCoverPage(doc, weekStart, weekEnd, entries.length)

      // Entry pages
      entries.forEach((entry, index) => {
        doc.addPage()
        addEntryPage(doc, entry, index + 1, entries.length)
      })

      // Closing page
      if (entries.length > 0) {
        doc.addPage()
        addClosingPage(doc, entries.length)
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Cover page
 */
function addCoverPage(
  doc: PDFKit.PDFDocument,
  weekStart: Date,
  weekEnd: Date,
  entryCount: number
) {
  const centerX = PAGE_WIDTH / 2
  const centerY = PAGE_HEIGHT / 2

  // Title
  doc
    .font('Helvetica-Bold')
    .fontSize(36)
    .fillColor(COLORS.primary)
    .text('Weekly Keepsake', 0, centerY - 100, {
      width: PAGE_WIDTH,
      align: 'center',
    })

  // Scroll emoji
  doc.fontSize(48).text('📜', 0, centerY - 40, {
    width: PAGE_WIDTH,
    align: 'center',
  })

  // Week dates
  doc
    .font('Helvetica')
    .fontSize(18)
    .fillColor(COLORS.text)
    .text(`${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`, 0, centerY + 30, {
      width: PAGE_WIDTH,
      align: 'center',
    })

  // Entry count
  doc
    .fontSize(14)
    .fillColor(COLORS.muted)
    .text(`${entryCount} ${entryCount === 1 ? 'treasure' : 'treasures'} this week`, 0, centerY + 60, {
      width: PAGE_WIDTH,
      align: 'center',
    })

  // Footer
  doc
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text('From your Firefly Grove Treasure Chest', 0, PAGE_HEIGHT - MARGIN - 30, {
      width: PAGE_WIDTH,
      align: 'center',
    })
}

/**
 * Entry page
 */
function addEntryPage(
  doc: PDFKit.PDFDocument,
  entry: any,
  index: number,
  total: number
) {
  let yPosition = MARGIN

  // Date header
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(format(new Date(entry.entryUTC), 'EEEE, MMMM d, yyyy'), MARGIN, yPosition)

  yPosition += 25

  // Entry number
  doc
    .fontSize(8)
    .text(`Entry ${index} of ${total}`, PAGE_WIDTH - MARGIN - 80, MARGIN, {
      width: 80,
      align: 'right',
    })

  // Divider
  doc
    .moveTo(MARGIN, yPosition)
    .lineTo(PAGE_WIDTH - MARGIN, yPosition)
    .strokeColor(COLORS.secondary)
    .lineWidth(1)
    .stroke()

  yPosition += 30

  // Prompt (italic)
  doc
    .font('Helvetica-Oblique')
    .fontSize(12)
    .fillColor(COLORS.muted)
    .text(`"${entry.promptText}"`, MARGIN, yPosition, {
      width: CONTENT_WIDTH,
      align: 'left',
    })

  yPosition += doc.heightOfString(`"${entry.promptText}"`, { width: CONTENT_WIDTH }) + 20

  // Response text
  if (entry.text) {
    doc
      .font('Helvetica')
      .fontSize(13)
      .fillColor(COLORS.text)
      .text(entry.text, MARGIN, yPosition, {
        width: CONTENT_WIDTH,
        align: 'left',
        lineGap: 4,
      })

    yPosition += doc.heightOfString(entry.text, { width: CONTENT_WIDTH }) + 20
  }

  // Audio indicator
  if (entry.audioUrl) {
    doc
      .fontSize(10)
      .fillColor(COLORS.primary)
      .text('🎙️ Voice recording included', MARGIN, yPosition)

    yPosition += 25
  }

  // Branch assignment
  if (entry.branch) {
    doc
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(`🌿 ${entry.branch.title}`, MARGIN, yPosition)

    yPosition += 20
  }

  // Category badge
  const categoryLabel = entry.category.replace('_', ' ')
  doc
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(categoryLabel, MARGIN, PAGE_HEIGHT - MARGIN - 20)
}

/**
 * Closing page
 */
function addClosingPage(doc: PDFKit.PDFDocument, entryCount: number) {
  const centerX = PAGE_WIDTH / 2
  const centerY = PAGE_HEIGHT / 2

  // Sparkle emoji
  doc.fontSize(48).fillColor(COLORS.primary).text('✨', 0, centerY - 60, {
    width: PAGE_WIDTH,
    align: 'center',
  })

  // Message
  doc
    .font('Helvetica')
    .fontSize(16)
    .fillColor(COLORS.text)
    .text('Your Glow Trail This Week', 0, centerY, {
      width: PAGE_WIDTH,
      align: 'center',
    })

  doc
    .fontSize(12)
    .fillColor(COLORS.muted)
    .text(
      `${entryCount} ${entryCount === 1 ? 'night' : 'nights'} of wisdom, gratitude, and treasured thoughts`,
      0,
      centerY + 40,
      {
        width: PAGE_WIDTH,
        align: 'center',
      }
    )

  // Footer message
  doc
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text('Keep glowing ✨', 0, PAGE_HEIGHT - MARGIN - 30, {
      width: PAGE_WIDTH,
      align: 'center',
    })
}
