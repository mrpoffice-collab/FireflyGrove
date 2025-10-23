/**
 * Migration Script: Update Grove schema and add new tables
 *
 * This script:
 * 1. Renames Grove.ownerId to Grove.userId
 * 2. Adds new columns to Grove and Branch
 * 3. Creates new tables (Person, GroveTreeMembership, TreeSubscription, etc.)
 * 4. Backfills MemoryBranchLink and BranchPreferences
 *
 * Run with: npx ts-node scripts/run-grove-migration-v2.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  console.log('🔄 Starting database schema migration...\n')

  try {
    // Step 1: Rename ownerId to userId
    console.log('Step 1: Renaming Grove.ownerId → Grove.userId...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "Grove" RENAME COLUMN "ownerId" TO "userId"`)
    console.log('✓ Column renamed')

    // Step 2: Add new Grove columns
    console.log('\nStep 2: Adding new Grove columns...')
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Grove' AND column_name='treeCount') THEN
          ALTER TABLE "Grove" ADD COLUMN "treeCount" INTEGER NOT NULL DEFAULT 0;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Grove' AND column_name='renewalDate') THEN
          ALTER TABLE "Grove" ADD COLUMN "renewalDate" TIMESTAMP(3);
        END IF;
      END $$;
    `)
    console.log('✓ Grove columns added')

    // Step 3: Update Grove constraints and indexes
    console.log('\nStep 3: Updating Grove constraints...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "Grove" DROP CONSTRAINT IF EXISTS "Grove_ownerId_key"`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Grove" ADD CONSTRAINT "Grove_userId_key" UNIQUE ("userId")`)
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Grove_ownerId_idx"`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Grove_userId_idx" ON "Grove"("userId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Grove_renewalDate_idx" ON "Grove"("renewalDate")`)
    console.log('✓ Grove constraints updated')

    // Step 4: Add new Branch columns
    console.log('\nStep 4: Adding new Branch columns...')
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Branch' AND column_name='personId') THEN
          ALTER TABLE "Branch" ADD COLUMN "personId" TEXT;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Branch' AND column_name='type') THEN
          ALTER TABLE "Branch" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'living';
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Branch' AND column_name='legacyMarkedBy') THEN
          ALTER TABLE "Branch" ADD COLUMN "legacyMarkedBy" TEXT;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Branch' AND column_name='legacyProofUrl') THEN
          ALTER TABLE "Branch" ADD COLUMN "legacyProofUrl" TEXT;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Branch_personId_idx" ON "Branch"("personId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Branch_type_idx" ON "Branch"("type")`)
    console.log('✓ Branch columns added')

    // Step 5: Create Person table
    console.log('\nStep 5: Creating Person table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Person" (
        "id" TEXT NOT NULL,
        "userId" TEXT,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Person_userId_idx" ON "Person"("userId")`)
    console.log('✓ Person table created')

    // Step 6: Create GroveTreeMembership table
    console.log('\nStep 6: Creating GroveTreeMembership table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GroveTreeMembership" (
        "id" TEXT NOT NULL,
        "groveId" TEXT NOT NULL,
        "personId" TEXT NOT NULL,
        "isOriginal" BOOLEAN NOT NULL DEFAULT false,
        "subscriptionOwnerId" TEXT,
        "status" TEXT NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "GroveTreeMembership_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GroveTreeMembership_groveId_personId_key" ON "GroveTreeMembership"("groveId", "personId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GroveTreeMembership_groveId_idx" ON "GroveTreeMembership"("groveId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GroveTreeMembership_personId_idx" ON "GroveTreeMembership"("personId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GroveTreeMembership_isOriginal_idx" ON "GroveTreeMembership"("isOriginal")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GroveTreeMembership_status_idx" ON "GroveTreeMembership"("status")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GroveTreeMembership_subscriptionOwnerId_idx" ON "GroveTreeMembership"("subscriptionOwnerId")`)
    console.log('✓ GroveTreeMembership table created')

    // Step 7: Create TreeSubscription table
    console.log('\nStep 7: Creating TreeSubscription table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TreeSubscription" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "membershipId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "stripeSubscriptionId" TEXT,
        "stripePriceId" TEXT,
        "renewalDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TreeSubscription_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TreeSubscription_membershipId_key" ON "TreeSubscription"("membershipId")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TreeSubscription_stripeSubscriptionId_key" ON "TreeSubscription"("stripeSubscriptionId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TreeSubscription_userId_idx" ON "TreeSubscription"("userId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TreeSubscription_status_idx" ON "TreeSubscription"("status")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TreeSubscription_renewalDate_idx" ON "TreeSubscription"("renewalDate")`)
    console.log('✓ TreeSubscription table created')

    // Step 8: Create MemoryBranchLink table
    console.log('\nStep 8: Creating MemoryBranchLink table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MemoryBranchLink" (
        "id" TEXT NOT NULL,
        "memoryId" TEXT NOT NULL,
        "branchId" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "visibilityStatus" TEXT NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MemoryBranchLink_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "MemoryBranchLink_memoryId_branchId_key" ON "MemoryBranchLink"("memoryId", "branchId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemoryBranchLink_memoryId_idx" ON "MemoryBranchLink"("memoryId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemoryBranchLink_branchId_idx" ON "MemoryBranchLink"("branchId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemoryBranchLink_role_idx" ON "MemoryBranchLink"("role")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemoryBranchLink_visibilityStatus_idx" ON "MemoryBranchLink"("visibilityStatus")`)
    console.log('✓ MemoryBranchLink table created')

    // Step 9: Create MemoryLocalMeta table
    console.log('\nStep 9: Creating MemoryLocalMeta table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MemoryLocalMeta" (
        "id" TEXT NOT NULL,
        "memoryId" TEXT NOT NULL,
        "branchId" TEXT NOT NULL,
        "localReactionsCount" INTEGER NOT NULL DEFAULT 0,
        "localCommentsCount" INTEGER NOT NULL DEFAULT 0,
        "pinned" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MemoryLocalMeta_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "MemoryLocalMeta_memoryId_branchId_key" ON "MemoryLocalMeta"("memoryId", "branchId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemoryLocalMeta_memoryId_idx" ON "MemoryLocalMeta"("memoryId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemoryLocalMeta_branchId_idx" ON "MemoryLocalMeta"("branchId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemoryLocalMeta_pinned_idx" ON "MemoryLocalMeta"("pinned")`)
    console.log('✓ MemoryLocalMeta table created')

    // Step 10: Create BranchPreferences table
    console.log('\nStep 10: Creating BranchPreferences table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BranchPreferences" (
        "id" TEXT NOT NULL,
        "branchId" TEXT NOT NULL,
        "canBeTagged" BOOLEAN NOT NULL DEFAULT true,
        "requiresTagApproval" BOOLEAN NOT NULL DEFAULT false,
        "visibleInCrossShares" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BranchPreferences_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "BranchPreferences_branchId_key" ON "BranchPreferences"("branchId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BranchPreferences_canBeTagged_idx" ON "BranchPreferences"("canBeTagged")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BranchPreferences_requiresTagApproval_idx" ON "BranchPreferences"("requiresTagApproval")`)
    console.log('✓ BranchPreferences table created')

    // Step 11: Create LegacyHeir table
    console.log('\nStep 11: Creating LegacyHeir table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LegacyHeir" (
        "id" TEXT NOT NULL,
        "branchId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LegacyHeir_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "LegacyHeir_branchId_userId_key" ON "LegacyHeir"("branchId", "userId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "LegacyHeir_branchId_idx" ON "LegacyHeir"("branchId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "LegacyHeir_userId_idx" ON "LegacyHeir"("userId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "LegacyHeir_role_idx" ON "LegacyHeir"("role")`)
    console.log('✓ LegacyHeir table created')

    // Step 12: Add foreign key constraints
    console.log('\nStep 12: Adding foreign key constraints...')
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Person_userId_fkey') THEN
          ALTER TABLE "Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Branch_personId_fkey') THEN
          ALTER TABLE "Branch" ADD CONSTRAINT "Branch_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GroveTreeMembership_groveId_fkey') THEN
          ALTER TABLE "GroveTreeMembership" ADD CONSTRAINT "GroveTreeMembership_groveId_fkey" FOREIGN KEY ("groveId") REFERENCES "Grove"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GroveTreeMembership_personId_fkey') THEN
          ALTER TABLE "GroveTreeMembership" ADD CONSTRAINT "GroveTreeMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TreeSubscription_userId_fkey') THEN
          ALTER TABLE "TreeSubscription" ADD CONSTRAINT "TreeSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TreeSubscription_membershipId_fkey') THEN
          ALTER TABLE "TreeSubscription" ADD CONSTRAINT "TreeSubscription_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "GroveTreeMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MemoryBranchLink_memoryId_fkey') THEN
          ALTER TABLE "MemoryBranchLink" ADD CONSTRAINT "MemoryBranchLink_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MemoryBranchLink_branchId_fkey') THEN
          ALTER TABLE "MemoryBranchLink" ADD CONSTRAINT "MemoryBranchLink_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MemoryLocalMeta_memoryId_fkey') THEN
          ALTER TABLE "MemoryLocalMeta" ADD CONSTRAINT "MemoryLocalMeta_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MemoryLocalMeta_branchId_fkey') THEN
          ALTER TABLE "MemoryLocalMeta" ADD CONSTRAINT "MemoryLocalMeta_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BranchPreferences_branchId_fkey') THEN
          ALTER TABLE "BranchPreferences" ADD CONSTRAINT "BranchPreferences_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LegacyHeir_branchId_fkey') THEN
          ALTER TABLE "LegacyHeir" ADD CONSTRAINT "LegacyHeir_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)
    console.log('✓ Foreign key constraints added')

    // Step 13: Backfill MemoryBranchLink
    console.log('\nStep 13: Backfilling MemoryBranchLink...')
    const result = await prisma.$executeRawUnsafe(`
      INSERT INTO "MemoryBranchLink" ("id", "memoryId", "branchId", "role", "visibilityStatus", "createdAt", "updatedAt")
      SELECT
        'mbl_' || "id",
        "id",
        "branchId",
        'origin',
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM "Entry"
      WHERE NOT EXISTS (
        SELECT 1 FROM "MemoryBranchLink"
        WHERE "MemoryBranchLink"."memoryId" = "Entry"."id"
        AND "MemoryBranchLink"."branchId" = "Entry"."branchId"
      )
    `)
    console.log(`✓ Backfilled ${result} memory links`)

    // Step 14: Backfill BranchPreferences
    console.log('\nStep 14: Creating default BranchPreferences...')
    const result2 = await prisma.$executeRawUnsafe(`
      INSERT INTO "BranchPreferences" ("id", "branchId", "canBeTagged", "requiresTagApproval", "visibleInCrossShares", "createdAt", "updatedAt")
      SELECT
        'bp_' || "id",
        "id",
        true,
        false,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM "Branch"
      WHERE NOT EXISTS (
        SELECT 1 FROM "BranchPreferences"
        WHERE "BranchPreferences"."branchId" = "Branch"."id"
      )
    `)
    console.log(`✓ Created ${result2} default branch preferences`)

    console.log('\n✅ Migration completed successfully!')
    console.log('\n✨ Next step: Run `npx prisma generate` to update Prisma Client')

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
