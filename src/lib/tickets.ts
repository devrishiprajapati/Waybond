export const downloadTicket = async (bookingId: string, ticketId: string, userId: string, fileName: string) => {
  const params = new URLSearchParams({ userId })
  const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/tickets/${encodeURIComponent(ticketId)}?${params}`)
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'Unable to download ticket.')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || 'WayBond-Ticket'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
