import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'
export const alt = 'Firefly Grove Memory Branch'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { branchId: string } }) {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: params.branchId },
      include: {
        entries: {
          where: {
            mediaUrl: { not: null },
          },
          select: {
            mediaUrl: true,
            text: true,
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!branch) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 48,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            Branch not found
          </div>
        ),
        {
          ...size,
        }
      )
    }

    const firstImage = branch.entries[0]?.mediaUrl

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          {firstImage && (
            <img
              src={firstImage}
              alt="Memory"
              style={{
                width: '100%',
                height: '450px',
                objectFit: 'cover',
                borderRadius: '20px',
                marginBottom: '20px',
              }}
            />
          )}
          <div
            style={{
              fontSize: 52,
              fontWeight: 'bold',
              color: '#FFD700',
              textAlign: 'center',
              marginTop: firstImage ? '0' : '20px',
            }}
          >
            {branch.title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#ffffff',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            Firefly Grove - Preserve Your Family Legacy Forever
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Firefly Grove
        </div>
      ),
      {
        ...size,
      }
    )
  }
}
