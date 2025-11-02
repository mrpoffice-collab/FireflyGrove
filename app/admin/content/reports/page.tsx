'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'
import { generateCSV, downloadCSV } from '@/lib/csv-export'

interface Report {
  id: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  entry: {
    id: string
    content: string
    branch: {
      title: string
      isPublic: boolean
    }
  }
  reportedBy: {
    name: string
    email: string
  }
}

export default function ContentReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'pending' | 'reviewed' | 'dismissed' | 'all'>('pending')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const isAdmin = (session?.user as any)?.isAdmin

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.push('/grove')
    } else if (isAdmin) {
      fetchReports()
    }
  }, [isAdmin, status, router, filterStatus])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports?status=${filterStatus}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportAction = async (reportId: string, action: 'approve' | 'dismiss' | 'hide') => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        // Refresh reports
        fetchReports()
        setSelectedReport(null)
        alert(`Report ${action}ed successfully`)
      } else {
        const error = await response.json()
        alert(`Failed to ${action} report: ${error.error}`)
      }
    } catch (error) {
      console.error(`Failed to ${action} report:`, error)
      alert(`Failed to ${action} report`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleExportReports = () => {
    const exportData = reports.map(report => ({
      reason: report.reason,
      description: report.description || '',
      status: report.status,
      branchTitle: report.entry.branch.title,
      isPublic: report.entry.branch.isPublic ? 'Yes' : 'No',
      reporterName: report.reportedBy.name,
      reporterEmail: report.reportedBy.email,
      createdAt: new Date(report.createdAt).toISOString()
    }))

    const csv = generateCSV(exportData, [
      'reason',
      'description',
      'status',
      'branchTitle',
      'isPublic',
      'reporterName',
      'reporterEmail',
      'createdAt'
    ])

    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(csv, `firefly-grove-reports-${filterStatus}-${timestamp}.csv`)
  }

  const getReasonEmoji = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'spam': return '🚫'
      case 'inappropriate': return '⚠️'
      case 'harassment': return '😠'
      case 'misinformation': return '❌'
      case 'copyright': return '©️'
      default: return '🚩'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header
        userName={session?.user?.name || ''}
        isAdmin={isAdmin}
        isBetaTester={(session?.user as any)?.isBetaTester || false}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-text-muted">
          <Link href="/admin" className="hover:text-firefly-glow transition-soft">Admin</Link>
          <span className="mx-2">/</span>
          <span>Content & Moderation</span>
          <span className="mx-2">/</span>
          <span className="text-text-soft">Reports</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-firefly-glow mb-2">
            Content Reports
          </h1>
          <p className="text-text-muted">
            Review and moderate reported content from the community
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(['pending', 'reviewed', 'dismissed', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-soft ${
                filterStatus === filter
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-elevated text-text-muted hover:bg-border-subtle'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
          <button
            onClick={handleExportReports}
            disabled={reports.length === 0}
            className="ml-auto px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg text-sm font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Reports Count */}
        <div className="mb-4 text-sm text-text-muted">
          {reports.length} report{reports.length !== 1 ? 's' : ''} found
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-firefly-dim/40 transition-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Report Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getReasonEmoji(report.reason)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-text-soft capitalize">{report.reason}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          report.status === 'reviewed' ? 'bg-green-500/20 text-green-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {report.status}
                        </span>
                        {report.entry.branch.isPublic && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            Public Memorial
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-muted">
                        Reported by {report.reportedBy.name} • {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Report Description */}
                  {report.description && (
                    <div className="mb-3 p-3 bg-bg-dark rounded-lg">
                      <p className="text-sm text-text-muted italic">"{report.description}"</p>
                    </div>
                  )}

                  {/* Memory Preview */}
                  <div className="mb-3">
                    <div className="text-xs text-text-muted mb-1">Memory in: {report.entry.branch.title}</div>
                    <div className="p-3 bg-bg-dark rounded-lg">
                      <p className="text-sm text-text-soft line-clamp-3">{report.entry.content}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded text-sm transition-soft"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-16 bg-bg-elevated border border-border-subtle rounded-lg">
              <div className="text-5xl mb-4">✨</div>
              <p className="text-text-muted mb-2">No {filterStatus !== 'all' ? filterStatus : ''} reports</p>
              <p className="text-sm text-text-muted">
                {filterStatus === 'pending' ? 'All content reports have been reviewed!' : 'Try changing the filter'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedReport(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-bg-dark border border-border-subtle rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getReasonEmoji(selectedReport.reason)}</span>
                  <div>
                    <h3 className="text-2xl font-light text-text-soft capitalize">{selectedReport.reason} Report</h3>
                    <p className="text-text-muted text-sm">ID: {selectedReport.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-text-muted hover:text-text-soft transition-soft"
                >
                  ✕
                </button>
              </div>

              {/* Report Details */}
              <div className="space-y-6">
                {/* Reporter Info */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-2">Reported By</h4>
                  <div className="bg-bg-elevated rounded-lg p-4">
                    <div className="text-sm text-text-soft">{selectedReport.reportedBy.name}</div>
                    <div className="text-xs text-text-muted">{selectedReport.reportedBy.email}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedReport.description && (
                  <div>
                    <h4 className="text-sm font-medium text-text-soft mb-2">Reporter's Comments</h4>
                    <div className="bg-bg-elevated rounded-lg p-4">
                      <p className="text-sm text-text-muted italic">"{selectedReport.description}"</p>
                    </div>
                  </div>
                )}

                {/* Reported Memory */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-2">Reported Memory</h4>
                  <div className="bg-bg-elevated rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-xs text-text-muted mb-1">Branch:</div>
                      <div className="text-sm text-text-soft">{selectedReport.entry.branch.title}</div>
                      {selectedReport.entry.branch.isPublic && (
                        <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                          Public Memorial in Open Grove
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1">Memory Content:</div>
                      <div className="p-3 bg-bg-dark rounded text-sm text-text-soft">
                        {selectedReport.entry.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-3">Moderation Actions</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                      disabled={actionLoading}
                      className="px-4 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded transition-soft disabled:opacity-50"
                    >
                      <div className="text-2xl mb-1">✓</div>
                      <div className="text-xs">Dismiss Report</div>
                      <div className="text-xs opacity-70">Keep memory visible</div>
                    </button>
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'hide')}
                      disabled={actionLoading}
                      className="px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded transition-soft disabled:opacity-50"
                    >
                      <div className="text-2xl mb-1">👁️</div>
                      <div className="text-xs">Hide Memory</div>
                      <div className="text-xs opacity-70">Remove from public</div>
                    </button>
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'approve')}
                      disabled={actionLoading}
                      className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded transition-soft disabled:opacity-50"
                    >
                      <div className="text-2xl mb-1">🗑️</div>
                      <div className="text-xs">Delete Memory</div>
                      <div className="text-xs opacity-70">Permanently remove</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
