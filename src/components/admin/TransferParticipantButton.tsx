import { useState } from 'react'
import { ArrowRightLeft, X, Check, AlertCircle } from 'lucide-react'

type Props = {
  bookingId: string
  participantIndex: number
  participantName: string
  onRemoved?: () => void
}

export default function TransferParticipantButton({
  bookingId,
  participantIndex,
  participantName,
  onRemoved
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRemove = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/bookings/${bookingId}/remove-participant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIndex,
          participantName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove participant')
      }

      setShowConfirm(false)
      if (onRemoved) {
        onRemoved()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant')
    } finally {
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        <div className="flex flex-col">
          <p className="text-xs font-bold text-red-700">Remove {participantName}?</p>
          {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRemove}
            disabled={loading}
            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            title="Confirm removal"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setShowConfirm(false)
              setError('')
            }}
            disabled={loading}
            className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
      title="Remove this participant (for package transfer)"
    >
      <ArrowRightLeft size={14} />
      <span>Transfer & Remove</span>
    </button>
  )
}
