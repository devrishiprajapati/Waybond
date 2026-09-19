import { AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

type ConfirmationToastProps = {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  tone?: 'danger' | 'success'
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
}

export default function ConfirmationToast({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  onCancel,
  onConfirm,
  busy = false
}: ConfirmationToastProps) {
  if (!open) return null

  const isDanger = tone === 'danger'
  const panelClass = isDanger
    ? 'rounded-[1.75rem] border border-red-200 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-900/15'
    : 'rounded-[1.75rem] border border-secondary/20 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-900/15'
  const iconClass = isDanger
    ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600'
    : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10 text-secondary'
  const confirmClass = isDanger
    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
    : 'bg-secondary hover:bg-secondary/90 shadow-secondary/25'

  return (
    <div className="fixed bottom-6 left-1/2 z-[240] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={panelClass}
      >
        <div className="flex items-start gap-4">
          <div className={iconClass}>
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase tracking-[0.08em] text-slate-900">{title}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex h-11 flex-1 items-center justify-center rounded-2xl text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg transition-all disabled:opacity-50 ${confirmClass}`}
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
