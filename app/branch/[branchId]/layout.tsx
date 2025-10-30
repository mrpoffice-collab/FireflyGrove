import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({
  params,
}: {
  params: { branchId: string }
}): Promise<Metadata> {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: params.branchId },
      select: {
        title: true,
        description: true,
        entries: {
          where: {
            mediaUrl: { not: null },
          },
          select: {
            mediaUrl: true,
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!branch) {
      return {
        title: 'Branch Not Found',
      }
    }

    const imageUrl = branch.entries[0]?.mediaUrl || 'https://firefly-grove.vercel.app/og-default.jpg'
    const description = branch.description || `Memories and stories about ${branch.title}`

    return {
      title: `${branch.title} - Firefly Grove`,
      description,
      openGraph: {
        title: `${branch.title} - Firefly Grove`,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: branch.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${branch.title} - Firefly Grove`,
        description,
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Firefly Grove',
    }
  }
}

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  return children
}
