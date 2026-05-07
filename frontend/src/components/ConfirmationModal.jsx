import { useLocale } from '../context/LocaleContext'

function ConfirmationModal({ open, title, message, onConfirm, onCancel, confirmLabel, cancelLabel }) {
  const { t } = useLocale()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-cyan-900/50 p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-950/60 border border-red-800/50 text-red-400 text-xl shrink-0">!</div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">{title || t('confirm')}</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-cyan-900/50 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-cyan-900/20 transition"
          >
            {cancelLabel || t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition"
          >
            {confirmLabel || t('yes')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
