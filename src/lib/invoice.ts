export const downloadInvoice = async (bookingId: string) => {
  const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/invoice`)
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'Unable to download invoice.')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `WayBond-Invoice-${bookingId}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
