/**
 * Migration Script: Tree/Branch Model → Person/Membership Model
 *
 * This script migrates the existing data structure to the new Person-based model:
 * 1. Creates Person records for each unique Tree
 * 2. Creates GroveTreeMembership records linking Groves and Persons
 * 3. Updates Branch records to reference personId instead of treeId
 * 4. Updates Grove records with new fields (userId, treeCount)
 * 5. Preserves all existing data and relationships
 *
 * Run with: npx ts-node prisma/migrations/migrate-to-person-model.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  console.log('🌳 Starting migration to Person model...\n')

  try {
    // Step 1: Update Grove model - rename ownerId to userId
    console.log('Step 1: Updating Grove records...')
    const groves = await prisma.$queryRaw`
      SELECT id, "ownerId" FROM "Grove"
    ` as any[]

    for (const grove of groves) {
      await prisma.$queryRaw`
        UPDATE "Grove"
        SET "userId" = ${grove.ownerId},
            "treeCount" = (
              SELECT COUNT(*)
              FROM "Tree"
              WHERE "groveId" = ${grove.id}
            )
        WHERE id = ${grove.id}
      `
    }
    console.log(`✓ Updated ${groves.length} Groves\n`)

    // Step 2: Create Person records from Trees
    console.log('Step 2: Creating Person records from Trees...')
    const trees = await prisma.$queryRaw`
      SELECT id, "ownerId", name FROM "Tree"
    ` as any[]

    const personMap = new Map<string, string>() // treeId -> personId

    for (const tree of trees) {
      // Create Person record
      const person = await prisma.$queryRaw`
        INSERT INTO "Person" (id, "userId", name, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${tree.ownerId},
          ${tree.name},
          NOW(),
          NOW()
        )
        RETURNING id
      ` as any[]

      const personId = person[0].id
      personMap.set(tree.id, personId)
    }
    console.log(`✓ Created ${personMap.size} Person records\n`)

    // Step 3: Create GroveTreeMembership records
    console.log('Step 3: Creating GroveTreeMembership records...')
    for (const tree of trees) {
      const personId = personMap.get(tree.id)

      const treeData = await prisma.$queryRaw`
        SELECT "groveId", "ownerId" FROM "Tree" WHERE id = ${tree.id}
      ` as any[]

      if (treeData.length > 0) {
        await prisma.$queryRaw`
          INSERT INTO "GroveTreeMembership"
          (id, "groveId", "personId", "isOriginal", status, "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid(),
            ${treeData[0].groveId},
            ${personId},
            true,
            'active',
            NOW(),
            NOW()
          )
        `
      }
    }
    console.log(`✓ Created ${personMap.size} GroveTreeMembership records\n`)

    // Step 4: Update Branch records to use personId
    console.log('Step 4: Updating Branch records...')
    const branches = await prisma.$queryRaw`
      SELECT id, "treeId" FROM "Branch" WHERE "treeId" IS NOT NULL
    ` as any[]

    for (const branch of branches) {
      const personId = personMap.get(branch.treeId)
      if (personId) {
        await prisma.$queryRaw`
          UPDATE "Branch"
          SET "personId" = ${personId}
          WHERE id = ${branch.id}
        `
      }
    }
    console.log(`✓ Updated ${branches.length} Branch records\n`)

    // Step 5: Clean up - we can now safely remove the old Tree table references
    console.log('Step 5: Migration complete!')
    console.log('\n📊 Summary:')
    console.log(`   Groves updated: ${groves.length}`)
    console.log(`   Persons created: ${personMap.size}`)
    console.log(`   Memberships created: ${personMap.size}`)
    console.log(`   Branches updated: ${branches.length}`)
    console.log('\n✓ Migration successful!\n')

    console.log('⚠️  Next steps:')
    console.log('   1. Run: npx prisma db push (to apply schema changes)')
    console.log('   2. Test the application thoroughly')
    console.log('   3. Verify all Trees and Branches display correctly')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
