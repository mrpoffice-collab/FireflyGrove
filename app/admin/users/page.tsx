'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'
import { generateCSV, downloadCSV } from '@/lib/csv-export'

interface User {
  id: string
  email: string
  name: string
  status: string
  isBetaTester: boolean
  isAdmin: boolean
  subscriptionStatus: string | null
  createdAt: string
  _count: {
    entries: number
    ownedBranches: number
  }
  grove: {
    planType: string
    status: string
  } | null
}

interface UserActivity {
  id: string
  eventType: string
  action: string
  category: string
  createdAt: string
}

export default function UserManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'beta' | 'subscriber' | 'trial' | 'admin'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [supportActionLoading, setSupportActionLoading] = useState(false)

  const isAdmin = (session?.user as any)?.isAdmin

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.push('/grove')
    } else if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin, status, router, filterType])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users?filter=${filterType}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const fetchUserActivity = async (userId: string) => {
    setActivityLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/activity`)
      if (response.ok) {
        const data = await response.json()
        setUserActivity(data.activity)
      }
    } catch (error) {
      console.error('Failed to fetch user activity:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    fetchUserActivity(user.id)
  }

  const handleResetPassword = async (userId: string, userEmail: string) => {
    if (!confirm(`Reset password for ${userEmail}?\n\nA temporary password will be generated.`)) {
      return
    }

    setSupportActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ Password reset successful!\n\nTemporary password: ${data.tempPassword}\n\nPlease share this with the user securely.`)
      } else {
        const error = await response.json()
        alert(`❌ Failed to reset password: ${error.error}`)
      }
    } catch (error) {
      console.error('Password reset error:', error)
      alert('Failed to reset password')
    } finally {
      setSupportActionLoading(false)
    }
  }

  const handleUnlockAccount = async (userId: string, userEmail: string, userStatus: string) => {
    if (userStatus !== 'LOCKED') {
      alert('This account is not locked.')
      return
    }

    if (!confirm(`Unlock account for ${userEmail}?`)) {
      return
    }

    setSupportActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/unlock`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('✅ Account unlocked successfully!')
        fetchUsers() // Refresh user list
        setSelectedUser(null)
      } else {
        const error = await response.json()
        alert(`❌ Failed to unlock account: ${error.error}`)
      }
    } catch (error) {
      console.error('Account unlock error:', error)
      alert('Failed to unlock account')
    } finally {
      setSupportActionLoading(false)
    }
  }

  const handleExportUsers = () => {
    const exportData = filteredUsers.map(user => ({
      email: user.email,
      name: user.name,
      status: user.status,
      isBetaTester: user.isBetaTester ? 'Yes' : 'No',
      isAdmin: user.isAdmin ? 'Yes' : 'No',
      subscriptionStatus: user.subscriptionStatus || 'None',
      planType: user.grove?.planType || 'None',
      branches: user._count.ownedBranches,
      memories: user._count.entries,
      createdAt: new Date(user.createdAt).toISOString()
    }))

    const csv = generateCSV(exportData, [
      'email',
      'name',
      'status',
      'isBetaTester',
      'isAdmin',
      'subscriptionStatus',
      'planType',
      'branches',
      'memories',
      'createdAt'
    ])

    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(csv, `firefly-grove-users-${filterType}-${timestamp}.csv`)
  }

  const getUserStatusBadge = (user: User) => {
    if (user.isAdmin) return <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">Admin</span>
    if (user.isBetaTester) return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Beta</span>
    if (user.subscriptionStatus === 'active') return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Subscribed</span>
    if (user.grove?.planType === 'trial') return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">Trial</span>
    return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs">Free</span>
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
          <span className="text-text-soft">User Management</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-firefly-glow mb-2">
            User Management
          </h1>
          <p className="text-text-muted">
            Search, view, and support users across Firefly Grove
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-elevated border border-border-subtle rounded-lg text-text-soft placeholder:text-placeholder focus:outline-none focus:border-firefly-glow transition-soft"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'beta', 'subscriber', 'trial', 'admin'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-soft ${
                  filterType === filter
                    ? 'bg-firefly-dim text-bg-dark'
                    : 'bg-bg-elevated text-text-muted hover:bg-border-subtle'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
            <button
              onClick={handleExportUsers}
              disabled={filteredUsers.length === 0}
              className="px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg text-sm font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* User Count */}
        <div className="mb-4 text-sm text-text-muted">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Users Table */}
        <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-dark border-b border-border-subtle">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-dark/50 transition-soft">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-text-soft">{user.name}</div>
                        <div className="text-xs text-text-muted">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getUserStatusBadge(user)}
                        {user.grove && (
                          <span className="text-xs text-text-muted">
                            {user.grove.planType} • {user.grove.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-muted">
                        <div>{user._count.ownedBranches} branches</div>
                        <div>{user._count.entries} memories</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="text-sm text-firefly-glow hover:text-firefly-dim transition-soft"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <p>No users found</p>
                {searchQuery && (
                  <p className="text-sm mt-2">Try adjusting your search or filters</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedUser(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-bg-dark border border-border-subtle rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-light text-text-soft mb-1">{selectedUser.name}</h3>
                  <p className="text-text-muted">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-text-muted hover:text-text-soft transition-soft"
                >
                  ✕
                </button>
              </div>

              {/* Details */}
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-2">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {getUserStatusBadge(selectedUser)}
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedUser.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      Account: {selectedUser.status}
                    </span>
                  </div>
                </div>

                {/* Grove Info */}
                {selectedUser.grove && (
                  <div>
                    <h4 className="text-sm font-medium text-text-soft mb-2">Grove Details</h4>
                    <div className="bg-bg-elevated rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Plan Type:</span>
                        <span className="text-text-soft capitalize">{selectedUser.grove.planType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Status:</span>
                        <span className="text-text-soft capitalize">{selectedUser.grove.status}</span>
                      </div>
                      {selectedUser.subscriptionStatus && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">Subscription:</span>
                          <span className="text-text-soft capitalize">{selectedUser.subscriptionStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Content Stats */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-2">Content</h4>
                  <div className="bg-bg-elevated rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Branches Created:</span>
                      <span className="text-firefly-glow font-medium">{selectedUser._count.ownedBranches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Memories Added:</span>
                      <span className="text-firefly-glow font-medium">{selectedUser._count.entries}</span>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-2">Account Info</h4>
                  <div className="bg-bg-elevated rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">User ID:</span>
                      <span className="text-text-soft font-mono text-xs">{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Joined:</span>
                      <span className="text-text-soft">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-3">Recent Activity</h4>
                  {activityLoading ? (
                    <div className="bg-bg-elevated rounded-lg p-8 text-center text-text-muted text-sm">
                      Loading activity...
                    </div>
                  ) : userActivity.length > 0 ? (
                    <div className="bg-bg-elevated rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-3">
                        {userActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-text-soft font-medium">{activity.eventType}</span>
                                <span className="px-2 py-0.5 bg-bg-dark text-text-muted rounded text-xs capitalize">
                                  {activity.category}
                                </span>
                              </div>
                              <div className="text-xs text-text-muted">
                                {activity.action} • {new Date(activity.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-bg-elevated rounded-lg p-8 text-center text-text-muted text-sm">
                      No recent activity found
                    </div>
                  )}
                </div>

                {/* Support Actions */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-3">Support Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleResetPassword(selectedUser.id, selectedUser.email)}
                      disabled={supportActionLoading}
                      className="px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded text-sm transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🔑 Reset Password
                    </button>
                    <button
                      onClick={() => handleUnlockAccount(selectedUser.id, selectedUser.email, selectedUser.status)}
                      disabled={supportActionLoading || selectedUser.status !== 'LOCKED'}
                      className="px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded text-sm transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🔓 Unlock Account
                    </button>
                    <button
                      disabled
                      className="px-4 py-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-sm opacity-50 cursor-not-allowed"
                    >
                      📧 Send Email (Soon)
                    </button>
                    <button
                      onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}
                      className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-sm transition-soft"
                    >
                      📊 View Activity ↑
                    </button>
                  </div>
                  {selectedUser.status === 'LOCKED' && (
                    <p className="text-xs text-yellow-400 mt-3 text-center">
                      ⚠️ This account is locked
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
