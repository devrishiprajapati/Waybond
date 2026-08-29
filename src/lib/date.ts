export const parseDateOnly = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim())
  if (!match) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export const formatDateOnly = (
  value: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
) => {
  const parsed = parseDateOnly(value)
  return parsed ? parsed.toLocaleDateString('en-IN', options) : value
}

export const addDaysToDateInput = (value: string, dayOffset: number) => {
  const parsed = parseDateOnly(value)
  if (!parsed) return ''
  parsed.setDate(parsed.getDate() + dayOffset)
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
