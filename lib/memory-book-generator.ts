import PDFDocument from 'pdfkit'
import { prisma } from './prisma'
import { generateAudioQRCode, createPermanentAudioUrl } from './qr-generator'

/**
 * Memory Book PDF Generator
 * Creates professional 6"x9" print-ready books for Lulu Direct
 */

// Page dimensions (6" x 9" in points - 1 inch = 72 points)
const PAGE_WIDTH = 6 * 72 // 432 pts
const PAGE_HEIGHT = 9 * 72 // 648 pts
const MARGIN = 0.5 * 72 // 36 pts (0.5" margins)
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2) // 360 pts
const CONTENT_HEIGHT = PAGE_HEIGHT - (MARGIN * 2) // 576 pts

// Typography
const FONTS = {
  title: 'Helvetica-Bold',
  heading: 'Helvetica-Bold',
  body: 'Helvetica',
  italic: 'Helvetica-Oblique',
}

interface MemoryBookOptions {
  branchId: string
  userId: string
  includeAudioQR?: boolean // Default true
  coverType?: 'hardcover' | 'softcover' // Default hardcover
}

interface GeneratedBook {
  interiorPdf: Buffer
  coverPdf: Buffer
  pageCount: number
  memoryCount: number
  audioCount: number
}

/**
 * Main function: Generate complete memory book
 */
export async function generateMemoryBook(
  options: MemoryBookOptions
): Promise<GeneratedBook> {
  const { branchId, userId, includeAudioQR = true } = options

  // Fetch branch data with all memories
  const branch = await fetchBranchForBook(branchId, userId)

  if (!branch) {
    throw new Error('Branch not found or access denied')
  }

  // Generate interior PDF
  const interiorPdf = await generateInteriorPDF(branch, includeAudioQR)

  // Generate cover PDF
  const coverPdf = await generateCoverPDF(branch)

  // Count stats
  const audioCount = branch.entries.filter(e => e.audioUrl).length

  return {
    interiorPdf,
    coverPdf,
    pageCount: calculatePageCount(branch),
    memoryCount: branch.entries.length,
    audioCount,
  }
}

/**
 * Fetch branch with all necessary data
 */
async function fetchBranchForBook(branchId: string, userId: string) {
  return await prisma.branch.findFirst({
    where: {
      id: branchId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, approved: true } } },
      ],
    },
    include: {
      person: true,
      entries: {
        where: {
          status: 'ACTIVE',
          approved: true,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc', // Chronological order
        },
      },
    },
  })
}

/**
 * Calculate total page count (for pricing)
 */
function calculatePageCount(branch: any): number {
  // Title page: 1
  // Obituary page: 1
  // Blank page (right-hand start): 1
  // Memory pages: ~1 page per 2-3 memories (estimate)
  // Always round up to even number (books need even pages)

  const basePages = 3
  const memoryPages = Math.ceil(branch.entries.length / 2.5)
  const total = basePages + memoryPages

  // Round up to nearest even number
  return Math.ceil(total / 2) * 2
}

/**
 * Generate interior PDF (all content pages)
 */
async function generateInteriorPDF(branch: any, includeAudioQR: boolean): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [PAGE_WIDTH, PAGE_HEIGHT],
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        bufferPages: true,
        autoFirstPage: false,
      })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // Page 1: Title Page
      await addTitlePage(doc, branch)

      // Page 2: Obituary/Life Summary
      await addObituaryPage(doc, branch)

      // Page 3+: Memory Pages
      await addMemoryPages(doc, branch, includeAudioQR)

      // Final page: Firefly Grove attribution
      await addAttributionPage(doc)

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Page 1: Title Page
 */
async function addTitlePage(doc: any, branch: any) {
  doc.addPage()

  const centerX = PAGE_WIDTH / 2
  let y = MARGIN + 100

  // Firefly Grove logo/text
  doc
    .font(FONTS.heading)
    .fontSize(16)
    .fillColor('#FFD966') // Firefly glow
    .text('FIREFLY GROVE', centerX, y, { align: 'center' })

  y += 80

  // Person's photo (if available) - use first entry with photo since Person model doesn't have photoUrl
  let photoUrl = null
  if (branch.entries?.length > 0) {
    const photoEntry = branch.entries.find((e: any) => e.mediaUrl)
    if (photoEntry) photoUrl = photoEntry.mediaUrl
  }

  if (photoUrl) {
    try {
      const photoBuffer = await downloadImage(photoUrl)
      doc.image(photoBuffer, centerX - 72, y, {
        width: 144, // 2" @ 72 DPI
        height: 144,
        align: 'center',
      })
      y += 164
    } catch (error) {
      console.error('Failed to load photo for title page:', error)
      y += 20
    }
  } else {
    y += 20
  }

  // "In Loving Memory of" or "Memories of"
  const isLegacy = branch.type === 'legacy' || branch.personStatus === 'legacy' || branch.person?.isLegacy
  doc
    .font(FONTS.italic)
    .fontSize(14)
    .fillColor('#666666')
    .text(isLegacy ? 'In Loving Memory of' : 'Memories of', centerX, y, { align: 'center' })

  y += 40

  // Person's full name
  const personName = branch.person?.name || branch.title
  doc
    .font(FONTS.title)
    .fontSize(28)
    .fillColor('#000000')
    .text(personName.toUpperCase(), MARGIN, y, {
      width: CONTENT_WIDTH,
      align: 'center',
    })

  y += 60

  // Dates (if legacy) - check branch fields first, then person
  if (isLegacy) {
    const birthYear = branch.birthDate
      ? new Date(branch.birthDate).getFullYear()
      : branch.person?.birthDate
      ? new Date(branch.person.birthDate).getFullYear()
      : null
    const endYear = branch.deathDate
      ? new Date(branch.deathDate).getFullYear()
      : branch.person?.deathDate
      ? new Date(branch.person.deathDate).getFullYear()
      : null

    if (birthYear || endYear) {
      const dateText = `${birthYear || '?'} – ${endYear || '?'}`
      doc
        .font(FONTS.body)
        .fontSize(18)
        .fillColor('#333333')
        .text(dateText, centerX, y, { align: 'center' })
      y += 40
    }
  }

  // Optional subtitle/quote (from branch description)
  if (branch.description) {
    doc
      .font(FONTS.italic)
      .fontSize(12)
      .fillColor('#666666')
      .text(`"${branch.description}"`, MARGIN + 20, y, {
        width: CONTENT_WIDTH - 40,
        align: 'center',
        lineGap: 4,
      })
  }
}

/**
 * Page 2: Obituary/Life Summary
 */
async function addObituaryPage(doc: any, branch: any) {
  doc.addPage()

  let y = MARGIN + 40

  const person = branch.person
  if (!person) {
    // If no person data, show collection description
    doc
      .font(FONTS.heading)
      .fontSize(18)
      .fillColor('#000000')
      .text('About This Collection', MARGIN, y)

    y += 40

    doc
      .font(FONTS.body)
      .fontSize(11)
      .fillColor('#333333')
      .text(
        branch.description || 'A collection of precious memories and moments.',
        MARGIN,
        y,
        { width: CONTENT_WIDTH, lineGap: 4 }
      )
    return
  }

  // Full name as heading
  doc
    .font(FONTS.heading)
    .fontSize(20)
    .fillColor('#000000')
    .text(person.name || branch.title, MARGIN, y, {
      width: CONTENT_WIDTH,
      align: 'center',
    })

  y += 40

  // Dates - check both Branch and Person
  const birthDate = branch.birthDate || person.birthDate
  const deathDate = branch.deathDate || person.deathDate

  const birthStr = birthDate
    ? new Date(birthDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const endStr = deathDate
    ? new Date(deathDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  if (birthStr || endStr) {
    const dateText = `${birthStr || 'Unknown'} – ${endStr || 'Present'}`
    doc
      .font(FONTS.body)
      .fontSize(12)
      .fillColor('#666666')
      .text(dateText, MARGIN, y, {
        width: CONTENT_WIDTH,
        align: 'center',
      })
    y += 30
  }

  // Note: Birth/End locations removed - these fields don't exist on Person model
  // If needed in future, add to Branch model

  // Divider line
  doc
    .moveTo(MARGIN + 80, y)
    .lineTo(PAGE_WIDTH - MARGIN - 80, y)
    .strokeColor('#CCCCCC')
    .lineWidth(0.5)
    .stroke()

  y += 30

  // Life summary (if available - could be from first text-only memory)
  const summaryMemory = branch.entries.find(
    (e: any) => e.text && e.text.length > 100 && !e.mediaUrl && !e.audioUrl
  )

  if (summaryMemory) {
    doc
      .font(FONTS.body)
      .fontSize(11)
      .fillColor('#333333')
      .text(summaryMemory.text, MARGIN, y, {
        width: CONTENT_WIDTH,
        align: 'left',
        lineGap: 4,
      })
  } else {
    // Default text if no summary memory
    doc
      .font(FONTS.body)
      .fontSize(11)
      .fillColor('#333333')
      .text(
        `Their memory lives on through ${branch.entries.length} cherished moments preserved in this book.`,
        MARGIN,
        y,
        { width: CONTENT_WIDTH, lineGap: 4 }
      )
  }
}

/**
 * Memory Pages: All entries with photos, text, QR codes
 */
async function addMemoryPages(doc: any, branch: any, includeAudioQR: boolean) {
  for (let i = 0; i < branch.entries.length; i++) {
    const entry = branch.entries[i]

    // Start new page for each memory (or every 2-3 memories - adjust as needed)
    if (i === 0 || i % 2 === 0) {
      doc.addPage()
    }

    const isSecondOnPage = i % 2 === 1
    const yStart = isSecondOnPage ? PAGE_HEIGHT / 2 + 20 : MARGIN + 20

    await addMemoryEntry(doc, entry, yStart, includeAudioQR)

    // Add separator line between memories on same page
    if (isSecondOnPage && i < branch.entries.length - 1) {
      doc
        .moveTo(MARGIN, PAGE_HEIGHT / 2)
        .lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT / 2)
        .strokeColor('#EEEEEE')
        .lineWidth(0.5)
        .stroke()
    }
  }
}

/**
 * Single memory entry layout
 */
async function addMemoryEntry(
  doc: any,
  entry: any,
  yStart: number,
  includeAudioQR: boolean
) {
  let y = yStart
  const maxHeight = (PAGE_HEIGHT / 2) - 40 // Half page minus padding

  // Memory date/title
  const dateStr = entry.memoryCard || new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  doc
    .font(FONTS.heading)
    .fontSize(10)
    .fillColor('#FFD966') // Firefly glow for dates
    .text(dateStr, MARGIN, y)

  y += 18

  // Photo (if exists)
  if (entry.mediaUrl) {
    try {
      const photoBuffer = await downloadImage(entry.mediaUrl)
      const photoHeight = 120
      doc.image(photoBuffer, MARGIN, y, {
        fit: [CONTENT_WIDTH * 0.4, photoHeight],
        align: 'left',
      })

      // Text wraps around photo
      const textX = MARGIN + (CONTENT_WIDTH * 0.4) + 10
      const textWidth = CONTENT_WIDTH * 0.6 - 10

      doc
        .font(FONTS.body)
        .fontSize(9)
        .fillColor('#333333')
        .text(entry.text, textX, y, {
          width: textWidth,
          lineGap: 3,
        })

      y += Math.max(photoHeight, doc.y - y) + 10
    } catch (error) {
      console.error('Failed to load photo:', error)
      // Fall back to text-only layout
    }
  } else {
    // Text-only layout
    doc
      .font(FONTS.body)
      .fontSize(9)
      .fillColor('#333333')
      .text(entry.text, MARGIN, y, {
        width: CONTENT_WIDTH,
        lineGap: 3,
      })

    y = doc.y + 10
  }

  // Author name
  doc
    .font(FONTS.italic)
    .fontSize(8)
    .fillColor('#888888')
    .text(`— ${entry.author.name}`, MARGIN, y)

  y += 15

  // QR code for audio (if exists and enabled)
  if (includeAudioQR && entry.audioUrl) {
    const audioUrl = createPermanentAudioUrl(entry.id)

    try {
      const qrBuffer = await generateAudioQRCode(audioUrl)
      const qrSize = 60

      doc.image(qrBuffer, MARGIN, y, {
        width: qrSize,
        height: qrSize,
      })

      doc
        .font(FONTS.italic)
        .fontSize(7)
        .fillColor('#666666')
        .text(`Scan to hear\n${entry.author.name}'s voice`, MARGIN + qrSize + 8, y + 15, {
          width: 100,
          lineGap: 2,
        })

      y += qrSize + 5
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }
}

/**
 * Final attribution page
 */
async function addAttributionPage(doc: any) {
  doc.addPage()

  const centerX = PAGE_WIDTH / 2
  const centerY = PAGE_HEIGHT / 2

  doc
    .font(FONTS.italic)
    .fontSize(10)
    .fillColor('#999999')
    .text('This memory book was lovingly created with', centerX, centerY - 30, {
      align: 'center',
    })

  doc
    .font(FONTS.heading)
    .fontSize(16)
    .fillColor('#FFD966')
    .text('FIREFLY GROVE', centerX, centerY, { align: 'center' })

  doc
    .font(FONTS.body)
    .fontSize(9)
    .fillColor('#999999')
    .text('fireflygrove.app', centerX, centerY + 30, { align: 'center' })

  doc
    .font(FONTS.italic)
    .fontSize(8)
    .fillColor('#AAAAAA')
    .text('"Every memory deserves a light"', centerX, centerY + 60, { align: 'center' })
}

/**
 * Generate cover PDF (front, spine, back)
 */
async function generateCoverPDF(branch: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const pageCount = calculatePageCount(branch)
      const spineWidth = calculateSpineWidth(pageCount)

      // Cover dimensions (including bleed)
      const BLEED = 0.125 * 72 // 0.125" bleed
      const frontWidth = PAGE_WIDTH + (BLEED * 2)
      const frontHeight = PAGE_HEIGHT + (BLEED * 2)
      const coverWidth = (frontWidth * 2) + spineWidth
      const coverHeight = frontHeight

      const doc = new PDFDocument({
        size: [coverWidth, coverHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        autoFirstPage: true,
      })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // Background color (dark elegant)
      doc
        .rect(0, 0, coverWidth, coverHeight)
        .fill('#1a1a1a')

      // Front cover (right side)
      const frontX = frontWidth + spineWidth
      await addFrontCover(doc, branch, frontX, BLEED, frontWidth, frontHeight)

      // Spine
      await addSpine(doc, branch, frontWidth, 0, spineWidth, coverHeight)

      // Back cover (left side)
      await addBackCover(doc, branch, BLEED, BLEED, frontWidth, frontHeight)

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Calculate spine width based on page count
 * Formula from Lulu: (page count / 444) × 0.002252 inches
 */
function calculateSpineWidth(pageCount: number): number {
  const spineInches = (pageCount / 444) * 0.002252
  return spineInches * 72 // Convert to points
}

/**
 * Front cover design
 */
async function addFrontCover(
  doc: any,
  branch: any,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const centerX = x + width / 2
  let currentY = y + height * 0.25

  // Firefly Grove logo
  doc
    .font(FONTS.heading)
    .fontSize(18)
    .fillColor('#FFD966')
    .text('FIREFLY GROVE', centerX, currentY, { align: 'center' })

  currentY += 60

  // Person's photo (if available) - use first entry photo since Person doesn't have photoUrl
  let photoUrl = null
  if (branch.entries?.length > 0) {
    const photoEntry = branch.entries.find((e: any) => e.mediaUrl)
    if (photoEntry) photoUrl = photoEntry.mediaUrl
  }

  if (photoUrl) {
    try {
      const photoBuffer = await downloadImage(photoUrl)
      const photoSize = 120
      doc.image(photoBuffer, centerX - photoSize / 2, currentY, {
        width: photoSize,
        height: photoSize,
        align: 'center',
      })
      currentY += photoSize + 40
    } catch (error) {
      console.error('Failed to load cover photo:', error)
      currentY += 20
    }
  } else {
    currentY += 20
  }

  // "In Loving Memory of"
  const isLegacy = branch.type === 'legacy' || branch.personStatus === 'legacy' || branch.person?.isLegacy
  if (isLegacy) {
    doc
      .font(FONTS.italic)
      .fontSize(12)
      .fillColor('#CCCCCC')
      .text('In Loving Memory of', centerX, currentY, { align: 'center' })
    currentY += 30
  }

  // Person's name
  const personName = branch.person?.name || branch.title
  doc
    .font(FONTS.title)
    .fontSize(24)
    .fillColor('#FFFFFF')
    .text(personName.toUpperCase(), x + 20, currentY, {
      width: width - 40,
      align: 'center',
    })

  currentY += 50

  // Dates - check both Branch and Person
  if (isLegacy) {
    const birthYear = branch.birthDate
      ? new Date(branch.birthDate).getFullYear()
      : branch.person?.birthDate
      ? new Date(branch.person.birthDate).getFullYear()
      : null
    const endYear = branch.deathDate
      ? new Date(branch.deathDate).getFullYear()
      : branch.person?.deathDate
      ? new Date(branch.person.deathDate).getFullYear()
      : null

    if (birthYear || endYear) {
      const dateText = `${birthYear || '?'} – ${endYear || '?'}`
      doc
        .font(FONTS.body)
        .fontSize(16)
        .fillColor('#CCCCCC')
        .text(dateText, centerX, currentY, { align: 'center' })
    }
  }
}

/**
 * Spine design
 */
async function addSpine(
  doc: any,
  branch: any,
  x: number,
  y: number,
  width: number,
  height: number
) {
  if (width < 20) return // Too narrow for text

  doc.save()
  doc.rotate(-90, { origin: [x + width / 2, height / 2] })

  const personName = branch.person?.fullName || branch.title
  const spineText = personName.length > 30 ? personName.substring(0, 27) + '...' : personName

  doc
    .font(FONTS.heading)
    .fontSize(10)
    .fillColor('#FFD966')
    .text(spineText, x + width / 2, height / 2 - 50, { align: 'center' })

  doc.restore()
}

/**
 * Back cover design
 */
async function addBackCover(
  doc: any,
  branch: any,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const centerX = x + width / 2
  const centerY = y + height / 2

  doc
    .font(FONTS.heading)
    .fontSize(14)
    .fillColor('#FFD966')
    .text('FIREFLY GROVE', centerX, centerY - 40, { align: 'center' })

  doc
    .font(FONTS.italic)
    .fontSize(10)
    .fillColor('#CCCCCC')
    .text('"Every memory deserves a light"', centerX, centerY, { align: 'center' })

  doc
    .font(FONTS.body)
    .fontSize(8)
    .fillColor('#999999')
    .text('fireflygrove.app', centerX, centerY + 40, { align: 'center' })

  // Memory count
  doc
    .font(FONTS.italic)
    .fontSize(9)
    .fillColor('#888888')
    .text(`${branch.entries.length} memories preserved`, centerX, height - 60, { align: 'center' })
}

/**
 * Helper: Download image from URL as buffer
 */
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
