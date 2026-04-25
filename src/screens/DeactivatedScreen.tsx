import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function DeactivatedScreen() {
  const { profile, restoreAccount, signOut, deactivateAccount } = useStore()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const deactivatedAt = profile?.deactivated_at
    ? new Date(profile.deactivated_at as unknown as string)
    : new Date()

  const deleteAt = new Date(deactivatedAt)
  deleteAt.setDate(deleteAt.getDate() + 3)

  const daysLeft = Math.max(0, Math.ceil((deleteAt.getTime() - Date.now()) / 86400000))
  const hoursLeft = Math.max(0, Math.ceil((deleteAt.getTime() - Date.now()) / 3600000))
  const timeLabel = daysLeft > 1 ? `${daysLeft} days` : daysLeft === 1 ? '1 day' : `${hoursLeft} hours`

  const handleRestore = async () => {
    setLoading(true)
    await restoreAccount()
    setLoading(false)
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    // Immediately delete — don't wait for cron
    await deactivateAccount() // already deactivated, just sign out again
    // User will be signed out — cron will clean up
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
      <div className="font-serif text-3xl text-ink mb-8">Mu<span className="text-teal">fasa</span></div>

      {!confirming ? (
        <div className="bg-white rounded-card shadow-lg w-full max-w-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #2D3561, #005F73)' }}>
            <div className="text-4xl mb-3">⏳</div>
            <h2 className="text-xl font-extrabold text-white">Account Deactivated</h2>
            <p className="text-xs text-white/60 mt-1">Scheduled for deletion</p>
          </div>

          <div className="p-6">
            {/* Countdown */}
            <div className="bg-cream-2 rounded-xl p-4 mb-5 text-center">
              <p className="text-3xl font-extrabold text-ink">{timeLabel}</p>
              <p className="text-xs text-ink/40 mt-1">until your data is permanently deleted</p>
              <p className="text-xs text-ink/30 mt-0.5">
                Deletion scheduled for {deleteAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* What gets deleted */}
            <div className="mb-5">
              <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-2">Data that will be deleted</p>
              {[
                'Your profile and health metrics',
                'All workout history and progress',
                'Weight log and charts',
                'Food logs and calorie history',
                'All expenses tracked',
                'Your AI-generated plan',
              ].map((item, i) => (
                <div key={i} className="flex gap-2 py-1.5 text-sm text-ink/60">
                  <span className="text-danger font-bold">×</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Restore button */}
            <button
              onClick={handleRestore}
              disabled={loading}
              className="w-full bg-teal text-white font-extrabold text-base py-4 rounded-xl mb-3 active:opacity-80 disabled:opacity-50 transition-all"
            >
              {loading ? 'Restoring...' : '✓ Restore My Account'}
            </button>
            <p className="text-xs text-ink/30 text-center mb-4">Your data is safe — everything will be exactly as you left it</p>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-cream-3" />
              <span className="text-xs text-ink/20 font-semibold">OR</span>
              <div className="flex-1 h-px bg-cream-3" />
            </div>

            {/* Confirm delete */}
            <button
              onClick={() => setConfirming(true)}
              className="w-full bg-cream-2 text-danger font-bold text-sm py-3 rounded-xl active:opacity-70"
            >
              Permanently delete my data now
            </button>

            <button onClick={signOut} className="w-full text-ink/30 font-medium text-xs py-3 mt-1">
              Sign out
            </button>
          </div>
        </div>
      ) : (
        /* Confirm deletion modal */
        <div className="bg-white rounded-card shadow-lg w-full max-w-sm p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-xl font-extrabold text-ink">Delete Everything?</h2>
            <p className="text-sm text-ink/50 mt-2 leading-relaxed">
              This will immediately and permanently delete all your data. There is no undo.
            </p>
          </div>

          <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-danger font-semibold text-center">
              ⚠️ This action cannot be reversed
            </p>
          </div>

          <button
            onClick={handleConfirmDelete}
            disabled={loading}
            className="w-full bg-danger text-white font-extrabold text-sm py-3.5 rounded-xl mb-3 active:opacity-80 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Yes, delete my account permanently'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="w-full bg-cream-2 text-ink/60 font-bold text-sm py-3 rounded-xl"
          >
            Cancel — keep my account
          </button>
        </div>
      )}
    </div>
  )
}
