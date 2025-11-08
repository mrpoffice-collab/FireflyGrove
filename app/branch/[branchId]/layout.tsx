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
      },
    })

    if (!branch) {
      return {
        title: 'Branch Not Found',
      }
    }

    const description = branch.description || `Memories and stories about ${branch.title}`
    const branchUrl = `https://fireflygrove.app/branch/${params.branchId}`

    console.log(`[OG Meta] Branch: ${branch.title}, URL: ${branchUrl}`)

    return {
      title: `${branch.title} - Firefly Grove`,
      description,
      openGraph: {
        title: `${branch.title} - Firefly Grove`,
        description,
        url: branchUrl,
        siteName: 'Firefly Grove',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: 'https://fireflygrove.app/firefly-logo.png',
            width: 1024,
            height: 1024,
            alt: branch.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${branch.title} - Firefly Grove`,
        description,
      },
      facebook: {
        appId: '1485185606045442',
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
