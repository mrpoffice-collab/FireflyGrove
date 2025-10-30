/**
 * DELETE TEST PERSON RECORDS (Open Grove memorials)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTestPersons() {
  try {
    console.log('🗑️  Deleting test Person records (Open Grove memorials)...\n')

    const testPersonIds = [
      'cmh9wcoba0014ellliud0t9ts', // Aunt Martha (Pending Transfer)
      'cmh9wcn0l0004elllv5lkgvqy', // Grandpa William (Transplant Ready)
      'cmh9wbkiq0014iry7lupr7y0i', // Aunt Martha (Pending Transfer) - duplicate
      'cmh9wbj960004iry75irz1cav', // Grandpa William (Transplant Ready) - duplicate
    ]

    console.log(`Deleting ${testPersonIds.length} test Person records:\n`)

    for (const personId of testPersonIds) {
      const person = await prisma.person.findUnique({
        where: { id: personId },
        select: { name: true },
      })

      if (person) {
        await prisma.person.delete({
          where: { id: personId },
        })
        console.log(`  ✓ Deleted: "${person.name}"`)
      } else {
        console.log(`  ⚠️  Not found: ${personId}`)
      }
    }

    console.log(`\n✅ Test memorial persons deleted!`)
    console.log(`   - These will no longer appear in Open Grove`)
    console.log(`   - All real memorial data preserved`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestPersons()
