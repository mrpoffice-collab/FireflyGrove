/**
 * 🏥 Blob Storage Health Check Script
 *
 * Run this periodically (daily/weekly) to ensure all memorial images are accessible.
 *
 * Usage:
 *   npx tsx scripts/check-blob-health.ts
 *   npx tsx scripts/check-blob-health.ts --limit 200
 *   npx tsx scripts/check-blob-health.ts --full  (checks everything)
 */

import { runComprehensiveHealthCheck } from '../lib/blob-monitoring'
import { prisma } from '../lib/prisma'

async function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  const limitArg = args.find(arg => arg.startsWith('--limit'))
  const isFull = args.includes('--full')

  const limit = isFull
    ? 10000 // Check everything
    : limitArg
    ? parseInt(limitArg.split('=')[1])
    : 50 // Default: check 50 most recent

  console.log('🏥 ═══════════════════════════════════════')
  console.log('🏥 BLOB STORAGE HEALTH CHECK')
  console.log('🏥 ═══════════════════════════════════════')
  console.log(`📊 Check limit: ${isFull ? 'ALL' : limit}`)
  console.log('')

  // Run health check
  const report = await runComprehensiveHealthCheck(limit)

  console.log('')
  console.log('📋 ═══════════════════════════════════════')
  console.log('📋 HEALTH CHECK REPORT')
  console.log('📋 ═══════════════════════════════════════')
  console.log(`✅ Healthy: ${report.healthy}`)
  console.log(`🚨 Broken: ${report.broken}`)
  console.log(`📊 Total Checked: ${report.totalChecked}`)
  console.log(`📅 Checked At: ${report.checkedAt.toISOString()}`)
  console.log('')

  if (report.issues.length > 0) {
    console.log('🚨 ═══════════════════════════════════════')
    console.log('🚨 ISSUES FOUND')
    console.log('🚨 ═══════════════════════════════════════')

    // Group by type
    const byType = report.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = []
      acc[issue.type].push(issue)
      return acc
    }, {} as Record<string, typeof report.issues>)

    for (const [type, issues] of Object.entries(byType)) {
      console.log(`\n📦 ${type.toUpperCase()} (${issues.length} issues):`)

      issues.forEach((issue, i) => {
        console.log(`\n  ${i + 1}. ${issue.severity.toUpperCase()}`)
        console.log(`     ID: ${issue.id}`)
        console.log(`     User: ${issue.userId}`)
        console.log(`     Field: ${issue.field}`)
        console.log(`     URL: ${issue.url}`)
        console.log(`     Error: ${issue.error}`)
        if (issue.createdAt) {
          console.log(`     Created: ${issue.createdAt.toISOString()}`)
        }
      })
    }

    console.log('')
    console.log('🔧 ═══════════════════════════════════════')
    console.log('🔧 RECOMMENDED ACTIONS')
    console.log('🔧 ═══════════════════════════════════════')
    console.log('1. Review the issues above')
    console.log('2. Check if blobs exist in Vercel Blob Storage dashboard')
    console.log('3. Contact affected users to re-upload if needed')
    console.log('4. Check recent backups for recovery')
    console.log('5. Investigate root cause (network issue? storage issue?)')
    console.log('')

    // Save report to database
    await saveHealthReport(report)

    process.exit(1) // Exit with error code to trigger alerts
  } else {
    console.log('🎉 ═══════════════════════════════════════')
    console.log('🎉 ALL SYSTEMS HEALTHY!')
    console.log('🎉 ═══════════════════════════════════════')
    console.log('All checked blobs are accessible.')
    console.log('')

    process.exit(0)
  }
}

/**
 * Save health report to database for historical tracking
 */
async function saveHealthReport(report: any) {
  try {
    // Create an audit log entry
    await prisma.audit.create({
      data: {
        actorId: 'system',
        action: 'BLOB_HEALTH_CHECK',
        targetType: 'SYSTEM',
        targetId: 'blob-storage',
        metadata: JSON.stringify({
          totalChecked: report.totalChecked,
          healthy: report.healthy,
          broken: report.broken,
          issueCount: report.issues.length,
          criticalCount: report.issues.filter((i: any) => i.severity === 'critical').length,
          checkedAt: report.checkedAt.toISOString(),
          issues: report.issues.map((i: any) => ({
            type: i.type,
            id: i.id,
            userId: i.userId,
            field: i.field,
            severity: i.severity
          }))
        })
      }
    })

    console.log('💾 Health report saved to database')
  } catch (error) {
    console.error('⚠️  Failed to save health report:', error)
  }
}

main()
  .catch(error => {
    console.error('💥 Fatal error during health check:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
