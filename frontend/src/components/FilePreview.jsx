import { useState } from 'react'
import { useLocale } from '../context/LocaleContext'

function isImage(f) {
  return f.file_type?.startsWith('image/') || /\.(png|jpe?g)$/i.test(f.file_name)
}

function isPDF(f) {
  return f.file_type === 'application/pdf' || /\.pdf$/i.test(f.file_name)
}

async function triggerDownload(url, name) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    window.open(url, '_blank')
  }
}

function DownloadBtn({ file }) {
  const { t } = useLocale()
  return (
    <button
      onClick={() => triggerDownload(file.file_url, file.file_name)}
      className="text-xs text-cyan-400 hover:text-cyan-300 shrink-0 transition"
    >
      ↓ {t('download')}
    </button>
  )
}

function FilePreview({ files = [] }) {
  const { t } = useLocale()
  const [lightbox, setLightbox] = useState(null)

  if (!files.length) return null

  return (
    <div className="mt-6 border-t border-cyan-900/30 pt-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">{t('attachments')}</h3>
      <div className="space-y-4">
        {files.map(f => (
          <div key={f.id} className="border border-cyan-900/40 rounded-xl overflow-hidden">
            {isImage(f) ? (
              <>
                <div className="cursor-pointer" onClick={() => setLightbox(f.file_url)} title={t('viewFullSize')}>
                  <img src={f.file_url} alt={f.file_name} className="w-full max-h-48 object-cover hover:opacity-80 transition" />
                </div>
                <div className="px-3 py-2 flex items-center justify-between bg-[var(--color-muted)] border-t border-cyan-900/30">
                  <span className="text-sm text-slate-400 truncate">{f.file_name}</span>
                  <DownloadBtn file={f} />
                </div>
              </>
            ) : isPDF(f) ? (
              <>
                <iframe src={f.file_url} title={f.file_name} className="w-full h-96 border-0" />
                <div className="px-3 py-2 flex items-center justify-between bg-[var(--color-muted)] border-t border-cyan-900/30">
                  <span className="text-sm text-slate-400 truncate">{f.file_name}</span>
                  <DownloadBtn file={f} />
                </div>
              </>
            ) : (
              <div className="px-3 py-3 flex items-center justify-between bg-[var(--color-surface)]">
                <span className="text-sm text-slate-400 truncate">{f.file_name}</span>
                <DownloadBtn file={f} />
              </div>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl leading-none" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox} alt={t('fullSizeImageAlt')} className="max-w-full max-h-full object-contain rounded" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default FilePreview
