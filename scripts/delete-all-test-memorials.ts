/**
 * DELETE ALL TEST MEMORIAL PERSON RECORDS
 * Keep only: Zakery Paul Peterson (real person)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllTestMemorials() {
  try {
    console.log('🗑️  Deleting ALL test memorial Person records...\n')

    // IDs to DELETE (all the test ones)
    const testPersonIds = [
      'cmh9wn5bd00bsa4w6fgge3za4', // Adopted Tree - Alice Cooper
      'cmh9wn27b008ua4w6moxnbbv6', // James Brown (Public Tree)
      'cmh9wn1ow008ea4w6q1ylovy0', // Mary Williams (Fresh Tree)
      'cmh9wn0my007ea4w6g0ovm20u', // Robert Johnson (Trustee Expired)
      'cmh9wmuo4001oa4w69pzh4pha', // Jane Smith (At Memory Limit)
      'cmh9wmspq0004a4w6r416o8b3', // John Doe (Ready for Adoption)
      'cmh9wcozs001qelllzui0rpos', // Uncle Bob (Completed Transfer)
      'cmh9wcoba0014ellliud0t9ts', // Aunt Martha (Pending Transfer)
      'cmh9wcn0l0004elllv5lkgvqy', // Grandpa William (Transplant Ready)
      'cmh9wbl69001qiry7bd0os6ma', // Uncle Bob (Completed Transfer) - duplicate
      'cmh9wbkiq0014iry7lupr7y0i', // Aunt Martha (Pending Transfer) - duplicate
      'cmh9wbj960004iry75irz1cav', // Grandpa William (Transplant Ready) - duplicate
    ]

    // KEEP this one - it's real:
    // cmh3wc8m700017jnrr2p7uc0o - Zakery Paul Peterson

    console.log(`Deleting ${testPersonIds.length} test Person records:\n`)

    let deletedCount = 0
    for (const personId of testPersonIds) {
      try {
        const person = await prisma.person.findUnique({
          where: { id: personId },
          select: { name: true },
        })

        if (person) {
          await prisma.person.delete({
            where: { id: personId },
          })
          console.log(`  ✓ Deleted: "${person.name}"`)
          deletedCount++
        } else {
          console.log(`  ⚠️  Already gone: ${personId}`)
        }
      } catch (error: any) {
        console.error(`  ✗ Error deleting ${personId}:`, error.message)
      }
    }

    console.log(`\n✅ Cleanup complete!`)
    console.log(`   - Deleted ${deletedCount} test memorial persons`)
    console.log(`   - Zakery Paul Peterson preserved (real person)`)
    console.log(`   - Open Grove should now only show real memorials`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllTestMemorials()
