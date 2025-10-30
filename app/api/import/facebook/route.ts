import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import AdmZip from 'adm-zip'
import { parseFacebookExport, facebookTimestampToDate, extractCaption } from '@/lib/facebook-parser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max execution time

// Note: Next.js App Router handles large file uploads automatically
// The bodyParser config is not needed in App Router

/**
 * Upload a photo buffer to Vercel Blob storage
 */
async function uploadPhotoToBlob(
  photoBuffer: Buffer,
  filename: string,
  userId: string
): Promise<string> {
  const blob = await put(`imports/${userId}/${Date.now()}-${filename}`, photoBuffer, {
    access: 'public',
    addRandomSuffix: true,
  })
  return blob.url
}

/**
 * POST /api/import/facebook
 * Upload and parse Facebook data export (ZIP or JSON)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['application/zip', 'application/x-zip-compressed', 'application/json']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(zip|json)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a ZIP or JSON file.' },
        { status: 400 }
      )
    }

    // Create import job
    const importJob = await prisma.importJob.create({
      data: {
        userId,
        source: 'facebook',
        status: 'importing',
        startedAt: new Date(),
        settings: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
        }),
      },
    })

    try {
      // Read file content
      const buffer = Buffer.from(await file.arrayBuffer())
      const files: { name: string; content: string }[] = []
      let zip: AdmZip | null = null

      if (file.name.endsWith('.zip')) {
        // Parse ZIP file
        zip = new AdmZip(buffer)
        const zipEntries = zip.getEntries()

        for (const entry of zipEntries) {
          if (entry.name.endsWith('.json') && !entry.isDirectory) {
            const content = entry.getData().toString('utf8')
            files.push({
              name: entry.name,
              content,
            })
          }
        }

        if (files.length === 0) {
          throw new Error('No JSON files found in ZIP archive')
        }
      } else {
        // Single JSON file
        files.push({
          name: file.name,
          content: buffer.toString('utf8'),
        })
      }

      // Parse Facebook data
      const parsed = await parseFacebookExport(files)

      if (parsed.totalItems === 0) {
        throw new Error('No photos or posts found in the uploaded file')
      }

      // Process photos and posts
      let processedCount = 0
      let skippedCount = 0

      // Helper function to find and upload photo from ZIP
      const findAndUploadPhoto = async (photoPath: string): Promise<string | null> => {
        if (!zip) return null

        try {
          // Facebook uses forward slashes in JSON but paths might vary
          const normalizedPath = photoPath.replace(/\\/g, '/')
          const entry = zip.getEntry(normalizedPath)

          if (!entry) {
            // Try alternative path formats
            const pathVariations = [
              photoPath,
              photoPath.replace(/^\//, ''), // Remove leading slash
              `your_facebook_activity/${photoPath}`,
              `your_activity_across_facebook/${photoPath}`,
            ]

            for (const variation of pathVariations) {
              const altEntry = zip.getEntry(variation)
              if (altEntry) {
                const photoBuffer = altEntry.getData()
                const filename = altEntry.name.split('/').pop() || 'photo.jpg'
                return await uploadPhotoToBlob(photoBuffer, filename, userId)
              }
            }

            console.log(`Photo not found in ZIP: ${photoPath}`)
            return null
          }

          const photoBuffer = entry.getData()
          const filename = entry.name.split('/').pop() || 'photo.jpg'
          return await uploadPhotoToBlob(photoBuffer, filename, userId)
        } catch (error) {
          console.error(`Error extracting photo ${photoPath}:`, error)
          return null
        }
      }

      // Process photos (limit to 200 for large imports)
      const photosToProcess = parsed.photos.slice(0, 200)
      console.log(`Processing ${photosToProcess.length} photos from ${parsed.photos.length} total`)

      for (const photo of photosToProcess) {
        try {
          // Extract and upload photo
          const photoUrl = await findAndUploadPhoto(photo.uri)

          if (!photoUrl) {
            skippedCount++
            continue // Skip photos we can't find
          }

          const caption = extractCaption(photo)
          const date = photo.creation_timestamp
            ? facebookTimestampToDate(photo.creation_timestamp)
            : new Date()

          // Create NestItem with uploaded photo
          await prisma.nestItem.create({
            data: {
              userId,
              source: 'facebook',
              sourceId: photo.uri,
              contentType: 'photo',
              photoUrl, // Vercel Blob URL
              filename: photo.uri.split('/').pop() || 'photo.jpg',
              caption: caption,
              takenAt: date,
              uploadedAt: new Date(),
              importMeta: JSON.stringify({
                originalPath: photo.uri,
                place: photo.place,
                tags: photo.tags,
              }),
              mediaUrls: [photoUrl],
              status: 'pending',
              importedAt: date,
              importJobId: importJob.id,
            },
          })

          processedCount++
        } catch (error) {
          console.error('Error processing photo:', error)
          skippedCount++
        }
      }

      // Process posts with photos (limit to 50)
      const postsToProcess = parsed.posts.slice(0, 50)
      console.log(`Processing ${postsToProcess.length} posts from ${parsed.posts.length} total`)

      for (const post of postsToProcess) {
        try {
          const caption = extractCaption(post)
          const date = post.timestamp ? facebookTimestampToDate(post.timestamp) : new Date()

          // Extract and upload photos from attachments
          const uploadedPhotoUrls: string[] = []
          if (post.attachments) {
            for (const attachment of post.attachments) {
              if (attachment.data) {
                for (const item of attachment.data) {
                  if (item.media?.uri) {
                    const photoUrl = await findAndUploadPhoto(item.media.uri)
                    if (photoUrl) {
                      uploadedPhotoUrls.push(photoUrl)
                    }
                  }
                }
              }
            }
          }

          if (uploadedPhotoUrls.length > 0) {
            await prisma.nestItem.create({
              data: {
                userId,
                source: 'facebook',
                sourceId: post.timestamp?.toString() || '',
                contentType: uploadedPhotoUrls.length > 1 ? 'mixed' : 'photo',
                photoUrl: uploadedPhotoUrls[0], // First photo as primary
                filename: `post-${post.timestamp}.jpg`,
                caption: caption,
                takenAt: date,
                uploadedAt: new Date(),
                importMeta: JSON.stringify({
                  place: post.place,
                  tags: post.tags,
                }),
                mediaUrls: uploadedPhotoUrls,
                status: 'pending',
                importedAt: date,
                importJobId: importJob.id,
              },
            })

            processedCount++
          } else {
            skippedCount++
          }
        } catch (error) {
          console.error('Error processing post:', error)
          skippedCount++
        }
      }

      // Update import job
      await prisma.importJob.update({
        where: { id: importJob.id },
        data: {
          status: 'completed',
          totalItems: parsed.totalItems,
          processedItems: processedCount,
          completedAt: new Date(),
        },
      })

      // Create audit log
      await prisma.audit.create({
        data: {
          actorId: userId,
          action: 'FACEBOOK_IMPORT',
          targetType: 'IMPORT_JOB',
          targetId: importJob.id,
          metadata: {
            fileName: file.name,
            totalItems: parsed.totalItems,
            processedItems: processedCount,
            skippedItems: skippedCount,
          },
        },
      })

      console.log(`Import completed: ${processedCount} photos uploaded, ${skippedCount} skipped`)

      return NextResponse.json({
        success: true,
        importJobId: importJob.id,
        photosCount: processedCount,
        totalFound: parsed.totalItems,
        skipped: skippedCount,
        message: skippedCount > 0
          ? `Successfully imported ${processedCount} photos. ${skippedCount} photos were skipped (not found in ZIP or errors).`
          : `Successfully imported ${processedCount} photos!`,
      })
    } catch (error: any) {
      // Update import job status to failed
      await prisma.importJob.update({
        where: { id: importJob.id },
        data: {
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
        },
      })

      throw error
    }
  } catch (error: any) {
    console.error('Error importing Facebook data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import data' },
      { status: 500 }
    )
  }
}
