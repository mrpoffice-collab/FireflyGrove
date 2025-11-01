/**
 * Production Database Migration Script
 * Adds isSharedWithGrove field to SparkCollection table
 *
 * Usage:
 *   1. Ensure DATABASE_URL environment variable points to production
 *   2. Run: npx tsx scripts/migrate-production.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting production database migration...')
  console.log('📊 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))

  // Confirm we're not running on local dev accidentally
  if (process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')) {
    console.error('⚠️  WARNING: DATABASE_URL appears to be localhost!')
    console.error('⚠️  This script is for production Neon database only.')
    console.error('⚠️  Exiting to prevent accidental local changes.')
    process.exit(1)
  }

  try {
    console.log('\n📝 Step 1: Adding isSharedWithGrove column...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SparkCollection"
      ADD COLUMN IF NOT EXISTS "isSharedWithGrove" BOOLEAN NOT NULL DEFAULT false
    `)
    console.log('✅ Column added successfully')

    console.log('\n📝 Step 2: Creating index for performance...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SparkCollection_isSharedWithGrove_idx"
      ON "SparkCollection"("isSharedWithGrove")
    `)
    console.log('✅ Index created successfully')

    console.log('\n📝 Step 3: Verifying migration...')
    const result: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'SparkCollection'
        AND column_name = 'isSharedWithGrove'
    `)

    if (result.length === 0) {
      throw new Error('Migration verification failed: Column not found after creation')
    }

    console.log('✅ Migration verified:')
    console.log('   Column:', result[0].column_name)
    console.log('   Type:', result[0].data_type)
    console.log('   Default:', result[0].column_default)

    console.log('\n📝 Step 4: Checking existing data...')
    const collectionCount: any = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "SparkCollection"
    `)
    console.log(`   Found ${collectionCount[0].count} existing collections`)
    console.log('   All will have isSharedWithGrove = false (default)')

    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   ✅ isSharedWithGrove column added')
    console.log('   ✅ Performance index created')
    console.log('   ✅ Existing collections unaffected (default false)')
    console.log('   ✅ Feature is now ready to use')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('\n✨ All done! You can now deploy the application.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
