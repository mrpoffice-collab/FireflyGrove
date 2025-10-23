'use client'

import { useState, useEffect } from 'react'

interface Heir {
  id: string
  heirEmail: string
  releaseCondition: string
  releaseDate: string | null
  notified: boolean
}

interface Member {
  id: string
  role: string
  approved: boolean
  user: {
    name: string
    email: string
  }
}

interface PendingInvite {
  id: string
  email: string
  status: string
  expiresAt: string
  createdAt: string
  inviter: {
    name: string
  }
}

interface BranchSettingsModalProps {
  branchId: string
  onClose: () => void
  onBranchUpdate?: () => void
}

export default function BranchSettingsModal({
  branchId,
  onClose,
  onBranchUpdate,
}: BranchSettingsModalProps) {
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [branch, setBranch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addingHeir, setAddingHeir] = useState(false)
  const [invitingMember, setInvitingMember] = useState(false)
  const [newHeirEmail, setNewHeirEmail] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [releaseCondition, setReleaseCondition] = useState('AFTER_DEATH')
  const [releaseDate, setReleaseDate] = useState('')
  const [error, setError] = useState('')
  const [memberError, setMemberError] = useState('')

  // Legacy fields
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [settingLegacy, setSettingLegacy] = useState(false)
  const [legacyError, setLegacyError] = useState('')

  // Discovery toggle
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true)
  const [togglingDiscovery, setTogglingDiscovery] = useState(false)

  // Transfer ownership
  const [transferEmail, setTransferEmail] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [transferError, setTransferError] = useState('')

  useEffect(() => {
    fetchBranchInfo()
    fetchHeirs()
    fetchMembers()
    fetchPendingInvites()
  }, [])

  const fetchBranchInfo = async () => {
    try {
      const res = await fetch(`/api/branches/${branchId}`)
      if (res.ok) {
        const data = await res.json()
        setBranch(data)

        // Set discovery toggle state if this is a Person-based legacy tree
        if (data.person?.isLegacy) {
          setDiscoveryEnabled(data.person.discoveryEnabled)
        }
      }
    } catch (error) {
      console.error('Failed to fetch branch info:', error)
    }
  }

  const fetchHeirs = async () => {
    try {
      const res = await fetch(`/api/branches/${branchId}/heirs`)
      if (res.ok) {
        const data = await res.json()
        setHeirs(data)
      }
    } catch (error) {
      console.error('Failed to fetch heirs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/branches/${branchId}`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const fetchPendingInvites = async () => {
    try {
      const res = await fetch(`/api/branches/${branchId}/invites`)
      if (res.ok) {
        const data = await res.json()
        setPendingInvites(data.filter((inv: PendingInvite) => inv.status === 'PENDING'))
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error)
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/invites/${inviteId}/resend`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('Invitation resent successfully!')
        fetchPendingInvites()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to resend invitation')
      }
    } catch (error) {
      alert('Failed to resend invitation')
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return
    }

    try {
      const res = await fetch(`/api/invites/${inviteId}/cancel`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('Invitation cancelled')
        fetchPendingInvites()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to cancel invitation')
      }
    } catch (error) {
      alert('Failed to cancel invitation')
    }
  }

  const handleAddHeir = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAddingHeir(true)

    try {
      const body: any = {
        heirEmail: newHeirEmail,
        releaseCondition,
      }

      if (releaseCondition === 'AFTER_DATE' && releaseDate) {
        body.releaseDate = releaseDate
      }

      const res = await fetch(`/api/branches/${branchId}/heirs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const newHeir = await res.json()
        setHeirs([...heirs, newHeir])
        setNewHeirEmail('')
        setReleaseDate('')
        setReleaseCondition('AFTER_DEATH')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add heir')
      }
    } catch (error) {
      setError('Failed to add heir')
    } finally {
      setAddingHeir(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setMemberError('')
    setInvitingMember(true)

    try {
      const res = await fetch(`/api/branches/${branchId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newMemberEmail }),
      })

      if (res.ok) {
        const data = await res.json()

        // Handle different response types
        if (data.type === 'member') {
          // Existing user was added directly
          setMembers([...members, data.member])
          setNewMemberEmail('')
          alert('Member added successfully!')
        } else if (data.type === 'invite') {
          // New user - invitation sent
          setNewMemberEmail('')
          alert(`Invitation sent to ${data.invite.email}! They'll receive an email to create an account and join this branch.`)
        }
      } else {
        const data = await res.json()
        setMemberError(data.error || 'Failed to invite member')
      }
    } catch (error) {
      setMemberError('Failed to invite member')
    } finally {
      setInvitingMember(false)
    }
  }

  const handleSetLegacy = async (e: React.FormEvent) => {
    e.preventDefault()
    setLegacyError('')
    setSettingLegacy(true)

    if (!deathDate) {
      setLegacyError('Death date is required to set legacy status')
      setSettingLegacy(false)
      return
    }

    try {
      const res = await fetch(`/api/branches/${branchId}/legacy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: birthDate || null,
          deathDate,
        }),
      })

      if (res.ok) {
        alert('Branch entered legacy mode')
        await fetchBranchInfo()
        onBranchUpdate?.()
      } else {
        const data = await res.json()
        setLegacyError(data.error || 'Failed to set legacy status')
      }
    } catch (error) {
      setLegacyError('Failed to set legacy status')
    } finally {
      setSettingLegacy(false)
    }
  }

  const handleToggleDiscovery = async () => {
    if (!branch?.person?.id) return

    setTogglingDiscovery(true)
    const newValue = !discoveryEnabled

    try {
      const res = await fetch(`/api/legacy-tree/${branch.person.id}/discovery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discoveryEnabled: newValue }),
      })

      if (res.ok) {
        setDiscoveryEnabled(newValue)
        alert(
          newValue
            ? 'Discovery enabled - this memorial can now be found through public search'
            : 'Discovery disabled - this memorial is hidden from public search'
        )
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update discovery setting')
      }
    } catch (error) {
      alert('Failed to update discovery setting')
    } finally {
      setTogglingDiscovery(false)
    }
  }

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branch?.person?.id) return

    setTransferError('')
    setTransferring(true)

    const confirmed = confirm(
      `Transfer ownership to ${transferEmail}?\n\nThis will give them full control of this legacy tree. You can still access it if you're added as a member.\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      setTransferring(false)
      return
    }

    try {
      const res = await fetch(`/api/legacy-tree/${branch.person.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newOwnerEmail: transferEmail }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message || 'Ownership transferred successfully!')
        setTransferEmail('')
        await fetchBranchInfo()
        onBranchUpdate?.()
      } else {
        setTransferError(data.error || 'Failed to transfer ownership')
      }
    } catch (error) {
      setTransferError('Failed to transfer ownership')
    } finally {
      setTransferring(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-2xl font-light text-text-soft">
            Branch Settings
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Members Section */}
          <div className="mb-8">
            <h3 className="text-lg text-text-soft mb-4">Branch Members</h3>
            <p className="text-text-muted text-sm mb-4">
              Members can view shared memories and add their own contributions to this branch.
            </p>

            {loading ? (
              <div className="text-text-muted text-sm">Loading...</div>
            ) : members.length > 0 ? (
              <div className="space-y-3 mb-6">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-bg-darker border border-border-subtle rounded p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-text-soft font-medium">
                          {member.user.name}
                        </div>
                        <div className="text-text-muted text-sm">
                          {member.user.email}
                        </div>
                        <div className="text-text-muted text-xs mt-1">
                          Role: {member.role}
                          {member.approved && ' • Active'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-muted text-sm mb-6">
                No members yet. Invite someone to collaborate!
              </div>
            )}

            {/* Invite Member Form */}
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Invite Member by Email
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="member@example.com"
                  required
                  disabled={invitingMember}
                />
                <p className="text-text-muted text-xs mt-1">
                  Note: They must have an account to be invited
                </p>
              </div>

              {memberError && (
                <div className="text-red-400 text-sm">{memberError}</div>
              )}

              <button
                type="submit"
                disabled={invitingMember}
                className="w-full py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
              >
                {invitingMember ? 'Inviting...' : 'Invite Member'}
              </button>
            </form>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border-subtle">
                <h4 className="text-md text-text-soft mb-3">Pending Invitations</h4>
                <div className="space-y-2">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="bg-bg-darker border border-border-subtle rounded p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-text-soft text-sm">
                          {invite.email}
                        </div>
                        <div className="text-text-muted text-xs">
                          Sent {new Date(invite.createdAt).toLocaleDateString()} •
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResendInvite(invite.id)}
                          className="px-3 py-1 text-xs bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft"
                          title="Resend invitation with new link"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-soft"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Heirs Section */}
          <div className="mb-8">
            <h3 className="text-lg text-text-soft mb-4">Legacy Heirs</h3>
            <p className="text-text-muted text-sm mb-4">
              Heirs will receive access to legacy memories when release conditions are met.
            </p>

            {loading ? (
              <div className="text-text-muted text-sm">Loading...</div>
            ) : heirs.length > 0 ? (
              <div className="space-y-3 mb-6">
                {heirs.map((heir) => (
                  <div
                    key={heir.id}
                    className="bg-bg-darker border border-border-subtle rounded p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-text-soft font-medium">
                          {heir.heirEmail}
                        </div>
                        <div className="text-text-muted text-sm mt-1">
                          Release: {heir.releaseCondition.replace('_', ' ').toLowerCase()}
                          {heir.releaseDate && ` on ${new Date(heir.releaseDate).toLocaleDateString()}`}
                        </div>
                        {heir.notified && (
                          <div className="text-firefly-dim text-xs mt-1">
                            ✓ Notified
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-muted text-sm mb-6">
                No heirs added yet.
              </div>
            )}

            {/* Add Heir Form */}
            <form onSubmit={handleAddHeir} className="space-y-4">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Heir Email
                </label>
                <input
                  type="email"
                  value={newHeirEmail}
                  onChange={(e) => setNewHeirEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="heir@example.com"
                  required
                  disabled={addingHeir}
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Release Condition
                </label>
                <select
                  value={releaseCondition}
                  onChange={(e) => setReleaseCondition(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  disabled={addingHeir}
                >
                  <option value="AFTER_DEATH">After Death (requires verification)</option>
                  <option value="AFTER_DATE">After Specific Date</option>
                  <option value="MANUAL">Manual Release</option>
                </select>
              </div>

              {releaseCondition === 'AFTER_DATE' && (
                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                    required
                    disabled={addingHeir}
                  />
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={addingHeir}
                className="w-full py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
              >
                {addingHeir ? 'Adding...' : 'Add Heir'}
              </button>
            </form>
          </div>

          {/* Legacy Section */}
          <div className="mb-8">
            <h3 className="text-lg text-text-soft mb-4">Legacy Mode</h3>
            <p className="text-text-muted text-sm mb-4">
              Mark this branch as a legacy to honor a loved one's memory. Legacy branches have calmer visuals and special badges.
            </p>

            {branch?.personStatus === 'legacy' ? (
              <div className="bg-[var(--legacy-amber)]/10 border border-[var(--legacy-amber)]/30 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">🕯️</span>
                  <div className="flex-1">
                    <div className="text-[var(--legacy-text)] font-medium mb-2">
                      This is a Legacy Branch
                    </div>
                    {branch.birthDate && branch.deathDate && (
                      <div className="text-[var(--legacy-silver)] text-sm">
                        {new Date(branch.birthDate).getFullYear()} – {new Date(branch.deathDate).getFullYear()}
                      </div>
                    )}
                    {branch.legacyEnteredAt && (
                      <div className="text-text-muted text-xs mt-1">
                        Entered legacy on {new Date(branch.legacyEnteredAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-text-muted text-sm">
                  Legacy status is permanent and cannot be changed.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSetLegacy} className="space-y-4">
                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    Birth Date (optional)
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                    disabled={settingLegacy}
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    Death Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                    required
                    disabled={settingLegacy}
                  />
                  <p className="text-text-muted text-xs mt-1">
                    Setting a death date will permanently mark this branch as legacy.
                  </p>
                </div>

                {legacyError && (
                  <div className="text-red-400 text-sm">{legacyError}</div>
                )}

                <button
                  type="submit"
                  disabled={settingLegacy}
                  className="w-full py-2 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                >
                  {settingLegacy ? 'Setting Legacy...' : 'Enter Legacy Mode'}
                </button>
              </form>
            )}
          </div>

          {/* Discovery Toggle - Only for Person-based legacy trees */}
          {branch?.person?.isLegacy && (
            <div className="mb-8">
              <h3 className="text-lg text-text-soft mb-4">Public Discovery</h3>
              <p className="text-text-muted text-sm mb-4">
                Control whether this memorial can be found through public search. Family members can always access it through direct links.
              </p>

              <div className="bg-bg-darker border border-border-subtle rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex-1">
                    <div className="text-text-soft font-medium mb-1">
                      {discoveryEnabled ? '🔍 Discoverable' : '🔒 Private'}
                    </div>
                    <div className="text-text-muted text-sm">
                      {discoveryEnabled
                        ? 'This memorial can be found through public search'
                        : 'This memorial is hidden from public search'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleDiscovery}
                    disabled={togglingDiscovery}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-firefly-dim focus:ring-offset-2 disabled:opacity-50 ${
                      discoveryEnabled ? 'bg-firefly-dim' : 'bg-border-subtle'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        discoveryEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </label>

                {branch.person.memoryLimit && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <div className="text-text-muted text-xs">
                      📊 Memory Usage: {branch.person.memoryCount || 0} / {branch.person.memoryLimit}
                    </div>
                    {branch.person.memoryCount >= 50 && branch.person.memoryCount < branch.person.memoryLimit && (
                      <div className="text-[var(--legacy-amber)] text-xs mt-1">
                        ⚠️ Approaching limit - consider adopting this tree for unlimited memories
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transfer Ownership - Only for Person-based legacy trees (trustee/owner only) */}
          {branch?.person?.isLegacy && (
            <div className="mb-8">
              <h3 className="text-lg text-text-soft mb-4">Transfer Ownership</h3>
              <p className="text-text-muted text-sm mb-4">
                Transfer this legacy tree to a family member. The new owner will have full control and become the moderator.
              </p>

              <div className="bg-[var(--legacy-amber)]/5 border border-[var(--legacy-amber)]/30 rounded-lg p-4">
                {branch.person.trusteeId && branch.person.trusteeExpiresAt && (() => {
                  const expiresAt = new Date(branch.person.trusteeExpiresAt)
                  const now = new Date()
                  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0
                  const hasExpired = daysRemaining <= 0

                  return (
                    <div className="mb-4 pb-4 border-b border-[var(--legacy-amber)]/30">
                      <div className={`text-sm font-medium mb-1 ${hasExpired ? 'text-red-400' : isExpiringSoon ? 'text-orange-400' : 'text-[var(--legacy-text)]'}`}>
                        {hasExpired ? '⚠️ Trustee Period Expired' : isExpiringSoon ? '⚠️ Trustee Period Expiring Soon' : '🕒 Trustee Period Active'}
                      </div>
                      <div className="text-text-muted text-xs">
                        {hasExpired ? (
                          <>
                            Trustee access has expired. Only the owner can now manage this memorial.
                          </>
                        ) : (
                          <>
                            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining (expires {expiresAt.toLocaleDateString()})
                          </>
                        )}
                      </div>
                      {!hasExpired && (
                        <div className="text-text-muted text-xs mt-1">
                          Transfer ownership to a family member before this date to ensure continuity.
                        </div>
                      )}
                    </div>
                  )
                })()}

                <form onSubmit={handleTransferOwnership} className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-soft mb-2">
                      New Owner's Email
                    </label>
                    <input
                      type="email"
                      value={transferEmail}
                      onChange={(e) => setTransferEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-[var(--legacy-amber)] transition-soft"
                      placeholder="family@example.com"
                      required
                      disabled={transferring}
                    />
                    <p className="text-text-muted text-xs mt-1">
                      They must have a Firefly Grove account to receive ownership
                    </p>
                  </div>

                  {transferError && (
                    <div className="text-red-400 text-sm">{transferError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={transferring}
                    className="w-full py-2 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                  >
                    {transferring ? 'Transferring...' : 'Transfer Ownership'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-border-subtle">
            <button
              onClick={onClose}
              className="w-full py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
