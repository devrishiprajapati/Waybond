import { useState } from 'react'
import { ArrowRightLeft, Info } from 'lucide-react'
import ParticipantTransferModal from '../ParticipantTransferModal'

type Props = {
  booking: {
    bookingId: string
    tripTitle: string
    price: number
    departure?: string
    travellerDetails: Array<{
      name: string
      email?: string
      isBooker?: boolean
      bookedBy?: string
    }>
  }
  currentUserEmail: string
  currentUserName: string
  onTransferComplete?: () => void
}

export default function MyBookingTransferOption({ 
  booking, 
  currentUserEmail,
  currentUserName,
  onTransferComplete 
}: Props) {
  const [showModal, setShowModal] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  // Find if current user is a participant (not booker) in this booking
  const userTravellerData = booking.travellerDetails.find(
    t => t.email === currentUserEmail || t.name === currentUserName
  )

  // Only show transfer option if user is a participant (not the booker)
  if (!userTravellerData || userTravellerData.isBooker) {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">
            Want to change your booking?
          </span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Info size={14} />
          </button>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <ArrowRightLeft size={14} />
          Transfer to Another Package
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900 leading-relaxed">
            <strong>Participant Transfer:</strong> You can transfer your booking to any other available package. 
            This will remove you from the current group booking and either add you to a new group or create 
            an individual booking for you. Any price difference will need to be settled separately.
          </p>
        </div>
      )}

      {/* Transfer Modal */}
      {showModal && (
        <ParticipantTransferModal
          bookingId={booking.bookingId}
          participantName={userTravellerData.name}
          participantEmail={userTravellerData.email}
          currentTrip={{
            title: booking.tripTitle,
            price: booking.price,
            departure: booking.departure
          }}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            if (onTransferComplete) {
              onTransferComplete()
            }
          }}
        />
      )}
    </div>
  )
}
