import { useEffect, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { formatDateOnly, parseDateOnly } from '../lib/date'

type DepartureDatePickerProps = {
  dates?: string[]
  value?: string
  onChange: (date: string) => void
}

const toDate = (date: string) => parseDateOnly(date)
const monthKey = (date: string) => formatDateOnly(date, { month: 'short', year: 'numeric' })

export default function DepartureDatePicker({ dates = [], value, onChange }: DepartureDatePickerProps) {
  const validDates = useMemo(() => dates.filter(date => toDate(date)), [dates])
  const months = useMemo(() => Array.from(new Set(validDates.map(monthKey))), [validDates])
  const initialMonth = value && validDates.includes(value) ? monthKey(value) : months[0]
  const [activeMonth, setActiveMonth] = useState(initialMonth)

  useEffect(() => {
    if (value && validDates.includes(value)) setActiveMonth(monthKey(value))
  }, [value, validDates])

  if (!validDates.length) return <p className="text-[10px] font-bold text-slate-400">Departure dates will be announced soon.</p>

  const selectedDate = value && validDates.includes(value) ? value : validDates[0]
  const visibleDates = validDates.filter(date => monthKey(date) === activeMonth)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500"><CalendarDays size={14} className="text-secondary" /> Select departure</div>
      <div className="flex flex-wrap gap-2">
        {months.map(month => <button key={month} type="button" onClick={() => { setActiveMonth(month); const firstDate = validDates.find(date => monthKey(date) === month); if (firstDate) onChange(firstDate) }} className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors ${activeMonth === month ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{month}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {visibleDates.map(date => {
          const parsed = toDate(date)
          const isSelected = selectedDate === date
          return <button key={date} type="button" onClick={() => onChange(date)} className={`rounded-xl border px-3 py-2 text-left transition-all ${isSelected ? 'border-secondary bg-secondary/10 text-secondary' : 'border-slate-200 bg-white text-slate-600 hover:border-secondary/50'}`}>
            <span className="block text-base font-black leading-none">{parsed?.getDate()}</span>
            <span className="block mt-1 text-[8px] font-black uppercase tracking-wider">{formatDateOnly(date, { weekday: 'short' })}</span>
          </button>
        })}
      </div>
    </div>
  )
}
