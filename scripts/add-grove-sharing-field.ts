/**
 * Migration script to add isSharedWithGrove field to SparkCollection table
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding isSharedWithGrove field to SparkCollection table...')

  try {
    // Execute raw SQL to add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SparkCollection"
      ADD COLUMN IF NOT EXISTS "isSharedWithGrove" BOOLEAN NOT NULL DEFAULT false
    `)

    console.log('✅ Successfully added isSharedWithGrove field')

    // Create index for better query performance
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SparkCollection_isSharedWithGrove_idx"
      ON "SparkCollection"("isSharedWithGrove")
    `)

    console.log('✅ Successfully created index on isSharedWithGrove')

  } catch (error) {
    console.error('❌ Error running migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
