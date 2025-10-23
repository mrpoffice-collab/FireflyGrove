/**
 * Migration Script: Update Grove schema and add new tables
 *
 * This script:
 * 1. Renames Grove.ownerId to Grove.userId
 * 2. Adds new columns to Grove and Branch
 * 3. Creates new tables (Person, GroveTreeMembership, TreeSubscription, etc.)
 * 4. Backfills MemoryBranchLink and BranchPreferences
 *
 * Run with: npx ts-node scripts/run-grove-migration.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function migrate() {
  console.log('🔄 Starting database schema migration...\n')

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'migrate-grove-schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📝 Executing SQL migration...')

    // Execute the entire SQL script
    await prisma.$executeRawUnsafe(sql)

    console.log('✅ Migration completed successfully!\n')
    console.log('Summary of changes:')
    console.log('  ✓ Renamed Grove.ownerId → Grove.userId')
    console.log('  ✓ Added treeCount and renewalDate to Grove')
    console.log('  ✓ Added personId, type, legacyMarkedBy, legacyProofUrl to Branch')
    console.log('  ✓ Created Person table')
    console.log('  ✓ Created GroveTreeMembership table')
    console.log('  ✓ Created TreeSubscription table')
    console.log('  ✓ Created MemoryBranchLink table')
    console.log('  ✓ Created MemoryLocalMeta table')
    console.log('  ✓ Created BranchPreferences table')
    console.log('  ✓ Created LegacyHeir table')
    console.log('  ✓ Backfilled MemoryBranchLink for existing entries')
    console.log('  ✓ Created default BranchPreferences for all branches')

    console.log('\n✨ Next step: Run `npx prisma generate` to update Prisma Client')

  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
