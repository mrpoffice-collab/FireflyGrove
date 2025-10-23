-- Migration: Rename Grove.ownerId to Grove.userId and add new tables
-- This migration preserves existing data

BEGIN;

-- Step 1: Rename ownerId to userId in Grove table
ALTER TABLE "Grove" RENAME COLUMN "ownerId" TO "userId";

-- Step 2: Add new columns to Grove table (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Grove' AND column_name='treeCount') THEN
    ALTER TABLE "Grove" ADD COLUMN "treeCount" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Grove' AND column_name='renewalDate') THEN
    ALTER TABLE "Grove" ADD COLUMN "renewalDate" TIMESTAMP(3);
  END IF;
END $$;

-- Step 3: Add unique constraint to userId (one Grove per user)
ALTER TABLE "Grove" DROP CONSTRAINT IF EXISTS "Grove_ownerId_key";
ALTER TABLE "Grove" ADD CONSTRAINT "Grove_userId_key" UNIQUE ("userId");

-- Step 4: Update indexes
DROP INDEX IF EXISTS "Grove_ownerId_idx";
CREATE INDEX IF NOT EXISTS "Grove_userId_idx" ON "Grove"("userId");
CREATE INDEX IF NOT EXISTS "Grove_renewalDate_idx" ON "Grove"("renewalDate");

-- Step 5: Add new columns to Branch table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Branch' AND column_name='personId') THEN
    ALTER TABLE "Branch" ADD COLUMN "personId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Branch' AND column_name='type') THEN
    ALTER TABLE "Branch" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'living';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Branch' AND column_name='legacyMarkedBy') THEN
    ALTER TABLE "Branch" ADD COLUMN "legacyMarkedBy" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Branch' AND column_name='legacyProofUrl') THEN
    ALTER TABLE "Branch" ADD COLUMN "legacyProofUrl" TEXT;
  END IF;
END $$;

-- Step 6: Add indexes to Branch
CREATE INDEX IF NOT EXISTS "Branch_personId_idx" ON "Branch"("personId");
CREATE INDEX IF NOT EXISTS "Branch_type_idx" ON "Branch"("type");

-- Step 7: Create Person table
CREATE TABLE IF NOT EXISTS "Person" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Person_userId_idx" ON "Person"("userId");

-- Step 8: Create GroveTreeMembership table
CREATE TABLE IF NOT EXISTS "GroveTreeMembership" (
    "id" TEXT NOT NULL,
    "groveId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "isOriginal" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionOwnerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroveTreeMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GroveTreeMembership_groveId_personId_key" ON "GroveTreeMembership"("groveId", "personId");
CREATE INDEX IF NOT EXISTS "GroveTreeMembership_groveId_idx" ON "GroveTreeMembership"("groveId");
CREATE INDEX IF NOT EXISTS "GroveTreeMembership_personId_idx" ON "GroveTreeMembership"("personId");
CREATE INDEX IF NOT EXISTS "GroveTreeMembership_isOriginal_idx" ON "GroveTreeMembership"("isOriginal");
CREATE INDEX IF NOT EXISTS "GroveTreeMembership_status_idx" ON "GroveTreeMembership"("status");
CREATE INDEX IF NOT EXISTS "GroveTreeMembership_subscriptionOwnerId_idx" ON "GroveTreeMembership"("subscriptionOwnerId");

-- Step 9: Create TreeSubscription table
CREATE TABLE IF NOT EXISTS "TreeSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "renewalDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreeSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TreeSubscription_membershipId_key" ON "TreeSubscription"("membershipId");
CREATE UNIQUE INDEX IF NOT EXISTS "TreeSubscription_stripeSubscriptionId_key" ON "TreeSubscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "TreeSubscription_userId_idx" ON "TreeSubscription"("userId");
CREATE INDEX IF NOT EXISTS "TreeSubscription_status_idx" ON "TreeSubscription"("status");
CREATE INDEX IF NOT EXISTS "TreeSubscription_renewalDate_idx" ON "TreeSubscription"("renewalDate");

-- Step 10: Create MemoryBranchLink table
CREATE TABLE IF NOT EXISTS "MemoryBranchLink" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "visibilityStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryBranchLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MemoryBranchLink_memoryId_branchId_key" ON "MemoryBranchLink"("memoryId", "branchId");
CREATE INDEX IF NOT EXISTS "MemoryBranchLink_memoryId_idx" ON "MemoryBranchLink"("memoryId");
CREATE INDEX IF NOT EXISTS "MemoryBranchLink_branchId_idx" ON "MemoryBranchLink"("branchId");
CREATE INDEX IF NOT EXISTS "MemoryBranchLink_role_idx" ON "MemoryBranchLink"("role");
CREATE INDEX IF NOT EXISTS "MemoryBranchLink_visibilityStatus_idx" ON "MemoryBranchLink"("visibilityStatus");

-- Step 11: Create MemoryLocalMeta table
CREATE TABLE IF NOT EXISTS "MemoryLocalMeta" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "localReactionsCount" INTEGER NOT NULL DEFAULT 0,
    "localCommentsCount" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryLocalMeta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MemoryLocalMeta_memoryId_branchId_key" ON "MemoryLocalMeta"("memoryId", "branchId");
CREATE INDEX IF NOT EXISTS "MemoryLocalMeta_memoryId_idx" ON "MemoryLocalMeta"("memoryId");
CREATE INDEX IF NOT EXISTS "MemoryLocalMeta_branchId_idx" ON "MemoryLocalMeta"("branchId");
CREATE INDEX IF NOT EXISTS "MemoryLocalMeta_pinned_idx" ON "MemoryLocalMeta"("pinned");

-- Step 12: Create BranchPreferences table
CREATE TABLE IF NOT EXISTS "BranchPreferences" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "canBeTagged" BOOLEAN NOT NULL DEFAULT true,
    "requiresTagApproval" BOOLEAN NOT NULL DEFAULT false,
    "visibleInCrossShares" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchPreferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BranchPreferences_branchId_key" ON "BranchPreferences"("branchId");
CREATE INDEX IF NOT EXISTS "BranchPreferences_canBeTagged_idx" ON "BranchPreferences"("canBeTagged");
CREATE INDEX IF NOT EXISTS "BranchPreferences_requiresTagApproval_idx" ON "BranchPreferences"("requiresTagApproval");

-- Step 13: Create LegacyHeir table
CREATE TABLE IF NOT EXISTS "LegacyHeir" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacyHeir_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LegacyHeir_branchId_userId_key" ON "LegacyHeir"("branchId", "userId");
CREATE INDEX IF NOT EXISTS "LegacyHeir_branchId_idx" ON "LegacyHeir"("branchId");
CREATE INDEX IF NOT EXISTS "LegacyHeir_userId_idx" ON "LegacyHeir"("userId");
CREATE INDEX IF NOT EXISTS "LegacyHeir_role_idx" ON "LegacyHeir"("role");

-- Step 14: Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Person_userId_fkey') THEN
    ALTER TABLE "Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Branch_personId_fkey') THEN
    ALTER TABLE "Branch" ADD CONSTRAINT "Branch_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GroveTreeMembership_groveId_fkey') THEN
    ALTER TABLE "GroveTreeMembership" ADD CONSTRAINT "GroveTreeMembership_groveId_fkey" FOREIGN KEY ("groveId") REFERENCES "Grove"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GroveTreeMembership_personId_fkey') THEN
    ALTER TABLE "GroveTreeMembership" ADD CONSTRAINT "GroveTreeMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TreeSubscription_userId_fkey') THEN
    ALTER TABLE "TreeSubscription" ADD CONSTRAINT "TreeSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TreeSubscription_membershipId_fkey') THEN
    ALTER TABLE "TreeSubscription" ADD CONSTRAINT "TreeSubscription_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "GroveTreeMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MemoryBranchLink_memoryId_fkey') THEN
    ALTER TABLE "MemoryBranchLink" ADD CONSTRAINT "MemoryBranchLink_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MemoryBranchLink_branchId_fkey') THEN
    ALTER TABLE "MemoryBranchLink" ADD CONSTRAINT "MemoryBranchLink_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MemoryLocalMeta_memoryId_fkey') THEN
    ALTER TABLE "MemoryLocalMeta" ADD CONSTRAINT "MemoryLocalMeta_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MemoryLocalMeta_branchId_fkey') THEN
    ALTER TABLE "MemoryLocalMeta" ADD CONSTRAINT "MemoryLocalMeta_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BranchPreferences_branchId_fkey') THEN
    ALTER TABLE "BranchPreferences" ADD CONSTRAINT "BranchPreferences_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LegacyHeir_branchId_fkey') THEN
    ALTER TABLE "LegacyHeir" ADD CONSTRAINT "LegacyHeir_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Step 15: Backfill MemoryBranchLink for existing entries (create origin links)
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
);

-- Step 16: Create default BranchPreferences for all existing branches
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
);

COMMIT;
