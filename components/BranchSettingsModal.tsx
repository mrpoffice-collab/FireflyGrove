'use client'

import { useState, useEffect } from 'react'
import Tooltip from './Tooltip'
import { useToast } from '@/lib/toast'

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
  const toast = useToast()
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [branch, setBranch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addingHeir, setAddingHeir] = useState(false)
  const [invitingMember, setInvitingMember] = useState(false)
  const [newHeirEmail, setNewHeirEmail] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [releaseCondition, setReleaseCondition] = useState('AFTER_DEATH')
  const [releaseDate, setReleaseDate] = useState('')
  const [error, setError] = useState('')
  const [memberError, setMemberError] = useState('')

  // Legacy fields
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [settingLegacy, setSettingLegacy] = useState(false)
  const [legacyError, setLegacyError] = useState('')
  const [editingDates, setEditingDates] = useState(false)
  const [updatingDates, setUpdatingDates] = useState(false)

  // Discovery toggle
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true)
  const [togglingDiscovery, setTogglingDiscovery] = useState(false)

  // Transfer ownership
  const [transferEmail, setTransferEmail] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [transferError, setTransferError] = useState('')

  // Adopt tree
  const [adopting, setAdopting] = useState(false)
  const [adoptError, setAdoptError] = useState('')

  // Root (link) tree
  const [rooting, setRooting] = useState(false)
  const [rootError, setRootError] = useState('')

  // Shareable link state
  const [shareableLink, setShareableLink] = useState<{
    url: string
    expiresAt: string
  } | null>(null)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Sharing preferences
  const [sharingPrefs, setSharingPrefs] = useState({
    canBeTagged: true,
    requiresTagApproval: false,
    visibleInCrossShares: true,
  })
  const [loadingPrefs, setLoadingPrefs] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  useEffect(() => {
    fetchBranchInfo()
    fetchHeirs()
    fetchMembers()
    fetchPendingInvites()
    fetchSharingPreferences()
    fetchShareableLink()
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

        // Populate date fields if branch is already legacy
        if (data.personStatus === 'legacy') {
          if (data.birthDate) {
            setBirthDate(new Date(data.birthDate).toISOString().split('T')[0])
          }
          if (data.deathDate) {
            setDeathDate(new Date(data.deathDate).toISOString().split('T')[0])
          }
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

  const fetchShareableLink = async () => {
    // Check if a shareable link already exists
    try {
      const res = await fetch(`/api/branches/${branchId}/invites`)
      if (res.ok) {
        const invites = await res.json()
        const shareable = invites.find((inv: any) => inv.email === 'shareable@link' && inv.status === 'PENDING')
        if (shareable) {
          setShareableLink({
            url: `${window.location.origin}/invite/${shareable.token}`,
            expiresAt: shareable.expiresAt
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch shareable link:', error)
    }
  }

  const handleGenerateShareableLink = async () => {
    setGeneratingLink(true)
    try {
      const res = await fetch(`/api/branches/${branchId}/shareable-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inviteMessage || undefined
        })
      })

      if (res.ok) {
        const data = await res.json()
        setShareableLink({
          url: data.invite.url,
          expiresAt: data.invite.expiresAt
        })
      } else {
        alert('Failed to generate shareable link')
      }
    } catch (error) {
      console.error('Failed to generate shareable link:', error)
      alert('Failed to generate shareable link')
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleDeleteShareableLink = async () => {
    if (!confirm('Are you sure you want to delete this shareable link? Anyone with the link will no longer be able to use it.')) {
      return
    }

    try {
      const res = await fetch(`/api/branches/${branchId}/shareable-link`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setShareableLink(null)
      } else {
        alert('Failed to delete shareable link')
      }
    } catch (error) {
      console.error('Failed to delete shareable link:', error)
      alert('Failed to delete shareable link')
    }
  }

  const handleCopyLink = async () => {
    if (!shareableLink) return

    try {
      await navigator.clipboard.writeText(shareableLink.url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link to clipboard')
    }
  }

  const handleShareVia = (platform: string) => {
    if (!shareableLink) return

    const text = `You're invited to collaborate on "${branch?.title}" in Firefly Grove`
    const url = shareableLink.url

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank')
        break
      case 'messenger':
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin)}`, '_blank')
        break
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: 'Firefly Grove Invitation',
            text: text,
            url: url
          }).catch(err => console.log('Share cancelled or failed', err))
        }
        break
    }
  }

  const fetchSharingPreferences = async () => {
    setLoadingPrefs(true)
    try {
      const res = await fetch(`/api/branches/${branchId}/preferences`)
      if (res.ok) {
        const data = await res.json()
        setSharingPrefs({
          canBeTagged: data.canBeTagged,
          requiresTagApproval: data.requiresTagApproval,
          visibleInCrossShares: data.visibleInCrossShares,
        })
      }
    } catch (error) {
      console.error('Failed to fetch sharing preferences:', error)
    } finally {
      setLoadingPrefs(false)
    }
  }

  const updateSharingPreference = async (key: string, value: boolean) => {
    setSavingPrefs(true)
    try {
      const res = await fetch(`/api/branches/${branchId}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })

      if (res.ok) {
        setSharingPrefs((prev) => ({ ...prev, [key]: value }))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update preference')
      }
    } catch (error) {
      alert('Failed to update preference')
    } finally {
      setSavingPrefs(false)
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
        body: JSON.stringify({
          email: newMemberEmail,
          message: inviteMessage || undefined
        }),
      })

      if (res.ok) {
        const data = await res.json()

        // Handle different response types
        if (data.type === 'member') {
          // Existing user was added directly
          setMembers([...members, data.member])
          setNewMemberEmail('')
          setInviteMessage('')
          alert('Member added successfully!')
        } else if (data.type === 'invite') {
          // New user - invitation sent
          setNewMemberEmail('')
          setInviteMessage('')
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

  const handleUpdateDates = async (e: React.FormEvent) => {
    e.preventDefault()
    setLegacyError('')
    setUpdatingDates(true)

    if (!deathDate) {
      setLegacyError('Death date is required')
      setUpdatingDates(false)
      return
    }

    try {
      const res = await fetch(`/api/branches/${branchId}/legacy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: birthDate || null,
          deathDate,
          updateDatesOnly: true,
        }),
      })

      if (res.ok) {
        alert('Dates updated successfully')
        await fetchBranchInfo()
        setEditingDates(false)
        onBranchUpdate?.()
      } else {
        const data = await res.json()
        setLegacyError(data.error || 'Failed to update dates')
      }
    } catch (error) {
      setLegacyError('Failed to update dates')
    } finally {
      setUpdatingDates(false)
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

  const handleAdoptTree = async () => {
    if (!branch?.person?.id) return

    setAdoptError('')
    setAdopting(true)

    const confirmed = confirm(
      'Adopt this tree into your private grove?\n\n✓ Unlimited memories (removes 100-memory limit)\n✓ Enhanced privacy controls\n✓ Uses one tree slot in your grove\n\nThis action cannot be undone.'
    )

    if (!confirmed) {
      setAdopting(false)
      return
    }

    try {
      // Get user's grove ID (assuming first grove for now)
      const groveRes = await fetch('/api/grove')
      if (!groveRes.ok) {
        setAdoptError('Failed to fetch your grove')
        setAdopting(false)
        return
      }
      const groveData = await groveRes.json()

      const res = await fetch(`/api/legacy-tree/${branch.person.id}/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groveId: groveData.id }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Tree adopted successfully! You now have unlimited memories.')
        await fetchBranchInfo()
        onBranchUpdate?.()
        onClose()
      } else {
        setAdoptError(data.error || 'Failed to adopt tree')
      }
    } catch (error) {
      setAdoptError('Failed to adopt tree')
    } finally {
      setAdopting(false)
    }
  }

  const handleRootTree = async () => {
    if (!branch?.person?.id) return

    setRootError('')
    setRooting(true)

    const confirmed = confirm(
      'Root (link) this tree to your private grove?\n\n✓ Keep it in Open Grove AND link to your grove\n✓ Access from both locations\n✓ Still subject to 100-memory limit (until adopted)\n✓ Uses one tree slot in your grove\n\nYou can adopt it later for unlimited memories.'
    )

    if (!confirmed) {
      setRooting(false)
      return
    }

    try {
      // Get user's grove ID
      const groveRes = await fetch('/api/grove')
      if (!groveRes.ok) {
        setRootError('Failed to fetch your grove')
        setRooting(false)
        return
      }
      const groveData = await groveRes.json()

      const res = await fetch(`/api/legacy-tree/${branch.person.id}/root`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groveId: groveData.id }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Tree rooted successfully!')
        await fetchBranchInfo()
        onBranchUpdate?.()
        onClose()
      } else {
        setRootError(data.error || 'Failed to root tree')
      }
    } catch (error) {
      setRootError('Failed to root tree')
    } finally {
      setRooting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
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

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
                  placeholder="Add a personal note to your invitation..."
                  rows={3}
                  maxLength={500}
                  disabled={invitingMember}
                />
                <p className="text-text-muted text-xs mt-1">
                  Share why this branch is special or what memories you hope to preserve together
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

            {/* Shareable Link Section */}
            <div className="mt-6 pt-6 border-t border-border-subtle">
              <h4 className="text-md text-text-soft mb-3 flex items-center gap-2">
                <span>🔗</span>
                <span>Shareable Invitation Link</span>
              </h4>
              <p className="text-text-muted text-sm mb-4">
                Create a link that can be shared via SMS, WhatsApp, Messenger, or any platform
              </p>

              {!shareableLink ? (
                <button
                  onClick={handleGenerateShareableLink}
                  disabled={generatingLink}
                  className="w-full py-2 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded font-medium transition-soft disabled:opacity-50"
                >
                  {generatingLink ? 'Generating Link...' : '+ Create Shareable Link'}
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Link display with copy button */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareableLink.url}
                      readOnly
                      className="flex-1 px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
                    >
                      {linkCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Expiration info */}
                  <p className="text-text-muted text-xs">
                    Expires {new Date(shareableLink.expiresAt).toLocaleDateString()}
                  </p>

                  {/* Social share buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShareVia('whatsapp')}
                      className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded text-sm font-medium transition-soft flex items-center justify-center gap-2"
                    >
                      <span>📱</span>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShareVia('messenger')}
                      className="flex-1 py-2 px-3 bg-[#0084FF] hover:bg-[#0073E6] text-white rounded text-sm font-medium transition-soft flex items-center justify-center gap-2"
                    >
                      <span>💬</span>
                      <span>Messenger</span>
                    </button>
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                      <button
                        onClick={() => handleShareVia('native')}
                        className="flex-1 py-2 px-3 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded text-sm font-medium transition-soft flex items-center justify-center gap-2"
                      >
                        <span>📤</span>
                        <span>Share</span>
                      </button>
                    )}
                  </div>

                  {/* Delete link button */}
                  <button
                    onClick={handleDeleteShareableLink}
                    className="w-full py-2 text-red-400 hover:text-red-300 text-sm transition-soft"
                  >
                    Delete Link
                  </button>
                </div>
              )}
            </div>

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
                        <Tooltip content="Resend invitation with new link">
                          <button
                            onClick={() => handleResendInvite(invite.id)}
                            className="px-3 py-1 text-xs bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft"
                          >
                            Resend
                          </button>
                        </Tooltip>
                        <Tooltip content="Cancel invitation">
                          <button
                            onClick={() => handleCancelInvite(invite.id)}
                            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-soft"
                          >
                            Cancel
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sharing & Tagging Controls Section */}
          <div className="mb-8">
            <h3 className="text-lg text-text-soft mb-4">Tagging & Sharing Controls</h3>
            <p className="text-text-muted text-sm mb-4">
              Control whether others can share memories to this branch and whether you need to approve them first.
            </p>

            {loadingPrefs ? (
              <div className="text-text-muted text-sm">Loading preferences...</div>
            ) : (
              <div className="space-y-4">
                {/* Allow Shared Memories */}
                <div className="bg-bg-darker border border-border-subtle rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex-1 pr-4">
                      <div className="text-text-soft font-medium mb-1">
                        Allow shared memories that include me
                      </div>
                      <div className="text-text-muted text-sm">
                        Let others share memories to this branch. Turn off to opt out completely.
                      </div>
                    </div>
                    <Tooltip content={sharingPrefs.canBeTagged ? 'Click to disable shared memories' : 'Click to allow shared memories'}>
                      <button
                        type="button"
                        onClick={() => updateSharingPreference('canBeTagged', !sharingPrefs.canBeTagged)}
                        disabled={savingPrefs}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-firefly-dim focus:ring-offset-2 disabled:opacity-50 ${
                          sharingPrefs.canBeTagged ? 'bg-firefly-dim' : 'bg-border-subtle'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            sharingPrefs.canBeTagged ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </Tooltip>
                  </label>
                </div>

                {/* Require Approval */}
                <div className="bg-bg-darker border border-border-subtle rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex-1 pr-4">
                      <div className="text-text-soft font-medium mb-1">
                        Require my approval before shared memories appear
                      </div>
                      <div className="text-text-muted text-sm">
                        Shared memories will be pending until you approve them.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSharingPreference('requiresTagApproval', !sharingPrefs.requiresTagApproval)}
                      disabled={savingPrefs || !sharingPrefs.canBeTagged}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-firefly-dim focus:ring-offset-2 disabled:opacity-50 ${
                        sharingPrefs.requiresTagApproval ? 'bg-firefly-dim' : 'bg-border-subtle'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          sharingPrefs.requiresTagApproval ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Visible in Cross-Shares */}
                <div className="bg-bg-darker border border-border-subtle rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex-1 pr-4">
                      <div className="text-text-soft font-medium mb-1">
                        Visible in cross-branch contexts
                      </div>
                      <div className="text-text-muted text-sm">
                        Show this branch name when memories are shared across branches.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSharingPreference('visibleInCrossShares', !sharingPrefs.visibleInCrossShares)}
                      disabled={savingPrefs || !sharingPrefs.canBeTagged}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-firefly-dim focus:ring-offset-2 disabled:opacity-50 ${
                        sharingPrefs.visibleInCrossShares ? 'bg-firefly-dim' : 'bg-border-subtle'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          sharingPrefs.visibleInCrossShares ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[var(--legacy-text)] font-medium">
                        This is a Legacy Branch
                      </div>
                      {!editingDates && (
                        <Tooltip content="Edit birth and death dates">
                          <button
                            onClick={() => setEditingDates(true)}
                            className="text-text-muted hover:text-[var(--legacy-amber)] transition-soft text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    {!editingDates ? (
                      <>
                        {branch.birthDate && branch.deathDate && (
                          <div className="text-[var(--legacy-silver)] text-sm">
                            {new Date(branch.birthDate).toLocaleDateString()} – {new Date(branch.deathDate).toLocaleDateString()}
                          </div>
                        )}
                        {!branch.birthDate && branch.deathDate && (
                          <div className="text-[var(--legacy-silver)] text-sm">
                            Passed: {new Date(branch.deathDate).toLocaleDateString()}
                          </div>
                        )}
                        {branch.legacyEnteredAt && (
                          <div className="text-text-muted text-xs mt-1">
                            Entered legacy on {new Date(branch.legacyEnteredAt).toLocaleDateString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <form onSubmit={handleUpdateDates} className="space-y-3 mt-2">
                        <div>
                          <label className="block text-xs text-text-soft mb-1">
                            Birth Date (optional)
                          </label>
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft text-sm focus:outline-none focus:border-[var(--legacy-amber)] transition-soft"
                            disabled={updatingDates}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-soft mb-1">
                            Death Date <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="date"
                            value={deathDate}
                            onChange={(e) => setDeathDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft text-sm focus:outline-none focus:border-[var(--legacy-amber)] transition-soft"
                            required
                            disabled={updatingDates}
                          />
                        </div>
                        {legacyError && (
                          <div className="text-red-400 text-xs">{legacyError}</div>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={updatingDates}
                            className="flex-1 py-2 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded text-sm font-medium transition-soft disabled:opacity-50"
                          >
                            {updatingDates ? 'Updating...' : 'Save Dates'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDates(false)
                              setLegacyError('')
                              // Reset to original values
                              if (branch.birthDate) {
                                setBirthDate(new Date(branch.birthDate).toISOString().split('T')[0])
                              } else {
                                setBirthDate('')
                              }
                              if (branch.deathDate) {
                                setDeathDate(new Date(branch.deathDate).toISOString().split('T')[0])
                              }
                            }}
                            disabled={updatingDates}
                            className="px-4 py-2 bg-bg-darker hover:bg-border-subtle text-text-muted rounded text-sm transition-soft disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
                {!editingDates && (
                  <div className="text-text-muted text-sm">
                    Legacy status is permanent and cannot be changed.
                  </div>
                )}
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
                  <Tooltip content={discoveryEnabled ? 'Click to hide from public search' : 'Click to make searchable'}>
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
                  </Tooltip>
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

                  <Tooltip content="Transfer full control and ownership to a family member">
                    <button
                      type="submit"
                      disabled={transferring}
                      className="w-full py-2 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                    >
                      {transferring ? 'Transferring...' : 'Transfer Ownership'}
                    </button>
                  </Tooltip>
                </form>
              </div>
            </div>
          )}

          {/* Adopt Tree - Only for Person-based legacy trees in Open Grove with memory limit */}
          {branch?.person?.isLegacy && branch.person.memoryLimit !== null && (
            <div className="mb-8">
              <h3 className="text-lg text-text-soft mb-4">Adopt This Tree</h3>
              <p className="text-text-muted text-sm mb-4">
                Move this memorial from the Open Grove into your private grove for unlimited memories and enhanced privacy.
              </p>

              <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-4">
                <div className="mb-4">
                  <div className="text-firefly-glow text-sm font-medium mb-3">
                    ✨ Benefits of Adoption
                  </div>
                  <div className="space-y-2 text-text-muted text-sm">
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Unlimited memories (removes {branch.person.memoryLimit}-memory limit)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Enhanced privacy controls</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Full ownership and control</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Uses one tree slot in your grove</span>
                    </div>
                  </div>
                </div>

                {branch.person.memoryCount >= 50 && (
                  <div className="mb-4 p-3 bg-[var(--legacy-amber)]/10 border border-[var(--legacy-amber)]/30 rounded">
                    <div className="text-[var(--legacy-text)] text-xs font-medium mb-1">
                      📊 Current Usage
                    </div>
                    <div className="text-text-muted text-xs">
                      {branch.person.memoryCount} / {branch.person.memoryLimit} memories used
                      {branch.person.memoryCount >= branch.person.memoryLimit && (
                        <span className="text-red-400 ml-1">(Limit reached)</span>
                      )}
                    </div>
                  </div>
                )}

                {adoptError && (
                  <div className="text-red-400 text-sm mb-4">{adoptError}</div>
                )}

                <Tooltip content="Move to your private grove for unlimited memories and enhanced privacy">
                  <button
                    onClick={handleAdoptTree}
                    disabled={adopting}
                    className="w-full py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                  >
                    {adopting ? 'Adopting Tree...' : 'Adopt Into Your Grove'}
                  </button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Root (Link) Tree - Only for Person-based legacy trees in Open Grove with memory limit */}
          {branch?.person?.isLegacy && branch.person.memoryLimit !== null && (
            <div className="mb-8">
              <h3 className="text-lg text-text-soft mb-4">Root (Link) This Tree</h3>
              <p className="text-text-muted text-sm mb-4">
                Keep this memorial in the Open Grove AND create a link to your private grove. Access from both places.
              </p>

              <div className="bg-border-subtle/30 border border-border-subtle rounded-lg p-4">
                <div className="mb-4">
                  <div className="text-text-soft text-sm font-medium mb-3">
                    🔗 Benefits of Rooting
                  </div>
                  <div className="space-y-2 text-text-muted text-sm">
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Stay in Open Grove (public memorial)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>ALSO appears in your private grove</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Access from both locations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Still has {branch.person.memoryLimit}-memory limit (adopt later for unlimited)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Uses one tree slot in your grove</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                  <div className="text-blue-400 text-xs font-medium mb-1">
                    💡 When to Root vs Adopt
                  </div>
                  <div className="text-text-muted text-xs">
                    <strong>Root:</strong> Keep memorial public while organizing it in your grove<br />
                    <strong>Adopt:</strong> Move to your grove for unlimited memories and privacy
                  </div>
                </div>

                {rootError && (
                  <div className="text-red-400 text-sm mb-4">{rootError}</div>
                )}

                <Tooltip content="Link to your grove while keeping memorial public">
                  <button
                    onClick={handleRootTree}
                    disabled={rooting}
                    className="w-full py-2 bg-border-subtle hover:bg-text-muted text-text-soft rounded font-medium transition-soft disabled:opacity-50"
                  >
                    {rooting ? 'Rooting Tree...' : 'Root (Link) to Your Grove'}
                  </button>
                </Tooltip>
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
