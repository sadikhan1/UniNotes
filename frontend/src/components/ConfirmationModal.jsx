import { useLocale } from '../context/LocaleContext'

function ConfirmationModal({ open, title, message, onConfirm, onCancel, confirmLabel, cancelLabel }) {
  const { t } = useLocale()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white text-xl">!</div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title || t('confirm')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            {cancelLabel || t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-700 transition"
          >
            {confirmLabel || t('yes')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
