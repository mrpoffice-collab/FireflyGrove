import archiver from 'archiver'
import { prisma } from './prisma'

export async function createForeverKit(branchId: string, userId: string) {
  // Verify user has access to branch
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      ownerId: userId,
    },
    include: {
      entries: {
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!branch) {
    throw new Error('Branch not found or access denied')
  }

  // Create HTML archive
  const html = generateHTML(branch)

  // For MVP, return HTML as string
  // In production, would create ZIP with HTML, images, and audio files
  return {
    filename: `${sanitizeFilename(branch.title)}-forever-kit.html`,
    html,
    branch,
  }
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateHTML(branch: any): string {
  const entries = branch.entries.map((entry: any) => {
    const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    let mediaHTML = ''
    if (entry.mediaUrl) {
      mediaHTML = `<div class="memory-image"><img src="${entry.mediaUrl}" alt="Memory photo" /></div>`
    }
    if (entry.audioUrl) {
      mediaHTML += `<div class="memory-audio"><audio controls src="${entry.audioUrl}"></audio></div>`
    }

    return `
      <div class="memory">
        <div class="memory-header">
          <span class="author">${entry.author.name}</span>
          <span class="date">${date}</span>
        </div>
        <div class="memory-text">${entry.text.replace(/\n/g, '<br>')}</div>
        ${mediaHTML}
      </div>
    `
  }).join('\n')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branch.title} - Forever Kit</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0e14;
      color: #e0e6ed;
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 60px;
      padding-bottom: 30px;
      border-bottom: 1px solid #1a1f2e;
    }
    .title {
      font-size: 2.5rem;
      font-weight: 300;
      color: #ffd966;
      margin-bottom: 10px;
    }
    .description {
      color: #8892a6;
      font-size: 1.1rem;
    }
    .firefly {
      font-size: 3rem;
      margin-bottom: 20px;
    }
    .memory {
      background: #050810;
      border: 1px solid #1a1f2e;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
    }
    .memory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #1a1f2e;
    }
    .author {
      color: #ffd966;
      font-weight: 500;
    }
    .date {
      color: #8892a6;
      font-size: 0.9rem;
    }
    .memory-text {
      color: #e0e6ed;
      line-height: 1.8;
      margin-bottom: 20px;
      white-space: pre-wrap;
    }
    .memory-image {
      margin: 20px 0;
    }
    .memory-image img {
      max-width: 100%;
      border-radius: 8px;
    }
    .memory-audio {
      margin: 20px 0;
    }
    .memory-audio audio {
      width: 100%;
    }
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #1a1f2e;
      color: #8892a6;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="firefly">✦</div>
      <h1 class="title">${branch.title}</h1>
      ${branch.description ? `<p class="description">${branch.description}</p>` : ''}
    </div>

    <div class="memories">
      ${entries}
    </div>

    <div class="footer">
      <p>Created with Firefly Grove</p>
      <p>Preserved on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export async function createLegacyArchive(branchId: string, includePrivate = false) {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      entries: {
        where: includePrivate
          ? { legacyFlag: true }
          : {
              OR: [
                { legacyFlag: true },
                { visibility: 'LEGACY' },
              ],
            },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!branch) {
    throw new Error('Branch not found')
  }

  const html = generateHTML(branch)

  return {
    filename: `${sanitizeFilename(branch.title)}-legacy-kit.html`,
    html,
  }
}
