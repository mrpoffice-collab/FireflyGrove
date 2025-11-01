/**
 * Pinterest Board ID Fetcher
 * Run this script to get your Pinterest board ID for .env configuration
 *
 * Usage:
 * npx tsx scripts/get-pinterest-board-id.ts
 * or
 * npx tsx scripts/get-pinterest-board-id.ts <your_access_token>
 */

import fs from 'fs'
import path from 'path'

// Try to load from .env.local file
function loadEnvFile(): Record<string, string> {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const content = fs.readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}

    content.split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        env[key] = value
      }
    })

    return env
  } catch (error) {
    return {}
  }
}

const env = loadEnvFile()
const PINTEREST_ACCESS_TOKEN = process.argv[2] || env.PINTEREST_ACCESS_TOKEN || process.env.PINTEREST_ACCESS_TOKEN

if (!PINTEREST_ACCESS_TOKEN) {
  console.error('❌ PINTEREST_ACCESS_TOKEN not found in .env.local')
  console.log('\nPlease add your Pinterest access token to .env.local:')
  console.log('PINTEREST_ACCESS_TOKEN=your_token_here\n')
  process.exit(1)
}

async function getPinterestBoards() {
  try {
    console.log('🔍 Fetching your Pinterest boards...\n')

    const response = await fetch('https://api.pinterest.com/v5/boards', {
      headers: {
        Authorization: `Bearer ${PINTEREST_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Pinterest API Error: ${error.message || response.statusText}`)
    }

    const data = await response.json()
    const boards = data.items || []

    if (boards.length === 0) {
      console.log('⚠️ No boards found in your Pinterest account')
      console.log('\nYou can create a board at: https://pinterest.com/pin-builder/')
      return
    }

    console.log(`✅ Found ${boards.length} board(s):\n`)

    boards.forEach((board: any, index: number) => {
      console.log(`${index + 1}. ${board.name}`)
      console.log(`   ID: ${board.id}`)
      console.log(`   Privacy: ${board.privacy}`)
      console.log(`   Pins: ${board.pin_count || 0}`)
      console.log(`   Created: ${new Date(board.created_at).toLocaleDateString()}`)
      console.log('')
    })

    console.log('\n📝 To use a board for Firefly Grove marketing:')
    console.log('\n1. Copy the ID of your desired board from above')
    console.log('2. Add to your .env.local file:')
    console.log('   PINTEREST_BOARD_ID=<paste_board_id_here>\n')

    if (boards.length > 0) {
      console.log(`💡 Recommended board: "${boards[0].name}" (${boards[0].id})`)
      console.log(`\nPINTEREST_BOARD_ID=${boards[0].id}\n`)
    }
  } catch (error) {
    console.error('❌ Error fetching Pinterest boards:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your access token is valid')
    console.log('2. Ensure your Pinterest app has the correct permissions')
    console.log('3. Verify your Pinterest account has boards created')
    console.log(
      '\n📚 Pinterest API Docs: https://developers.pinterest.com/docs/getting-started/authentication/'
    )
  }
}

// Run the script
getPinterestBoards()
