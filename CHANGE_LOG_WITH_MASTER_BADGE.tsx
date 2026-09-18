/* Add this to the change log display section in BookingsView.tsx */

{/* Change Log Section - Updated with Master Admin Badge */}
{expandedChangeLogs.has(booking.bookingId) && booking.changeLog && booking.changeLog.length > 0 && (
  <div className="mt-4 pt-4 border-t-2 border-purple-200">
    <div className="flex items-center gap-2 mb-4">
      <History size={18} className="text-purple-600" />
      <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">
        Change History
      </h4>
    </div>
    <div className="space-y-3">
      {booking.changeLog.slice().reverse().map((log, idx) => {
        const isMasterAdmin = log.changedByRole === 'MASTER_ADMIN'
        
        return (
          <div
            key={idx}
            className={`border-l-4 p-4 rounded-lg ${
              isMasterAdmin 
                ? 'bg-gradient-to-r from-amber-50 to-white border-amber-500' 
                : 'bg-gradient-to-r from-purple-50 to-white border-purple-400'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {/* User Badge with Role-based styling */}
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs ${
                  isMasterAdmin ? 'bg-amber-600' : 'bg-purple-600'
                }`}>
                  {log.changedBy.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-gray-900">{log.changedBy}</p>
                    
                    {/* Master Admin Badge */}
                    {isMasterAdmin && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-[10px] font-black text-amber-800 uppercase tracking-wider">
                        <svg 
                          className="w-3 h-3" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Master
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-semibold">{log.changeType}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-600 font-semibold">
                  {formatDateTime(log.timestamp)}
                </p>
              </div>
            </div>
            
            {log.field && (
              <div className="text-xs bg-white px-3 py-2 rounded border mt-2" 
                style={{ borderColor: isMasterAdmin ? '#f59e0b' : '#a855f7' }}>
                <span className="font-bold" style={{ color: isMasterAdmin ? '#b45309' : '#7c3aed' }}>
                  Field: 
                </span>
                <span className="text-gray-700 ml-1">{log.field}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  </div>
)}
