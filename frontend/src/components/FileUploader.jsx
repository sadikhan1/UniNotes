import { useState, useRef } from 'react'
import { uploadFile, deleteFile } from '../services/api'
import { useLocale } from '../context/LocaleContext'
import ConfirmationModal from './ConfirmationModal'

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_SIZE = 10 * 1024 * 1024

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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

function FileUploader({ noteId, initialFiles = [] }) {
  const { t } = useLocale()
  const [files, setFiles] = useState(initialFiles)
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState(null)
  const inputRef = useRef()

  function validate(file) {
    if (!ALLOWED_TYPES.includes(file.type)) return t('fileTypeError')
    if (file.size > MAX_SIZE) return t('fileSizeError')
    return null
  }

  function handleSelect(file) {
    const err = validate(file)
    if (err) { setError(err); setSelected(null); setSuccess(''); return }
    setError('')
    setSuccess('')
    setSelected(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleSelect(file)
  }

  async function handleUpload() {
    if (!selected || uploading) return
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const uploaded = await uploadFile(noteId, selected)
      setFiles(prev => [...prev, uploaded])
      setSelected(null)
      setSuccess(t('fileUploaded'))
    } catch (err) {
      setError(err.message || t('fileUploadFailed'))
      setSuccess('')
    } finally {
      setUploading(false)
    }
  }

  async function handleConfirmDeleteFile() {
    if (!confirmDeleteFileId) return
    try {
      await deleteFile(confirmDeleteFileId)
      setFiles(prev => prev.filter(f => f.id !== confirmDeleteFileId))
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirmDeleteFileId(null)
    }
  }

  return (
    <div className="mt-6 border-t border-cyan-900/30 pt-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">{t('attachments')}</h3>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          dragOver
            ? 'border-cyan-500 bg-cyan-900/20'
            : 'border-cyan-900/50 hover:border-cyan-700/60 hover:bg-cyan-900/10'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={e => { if (e.target.files[0]) handleSelect(e.target.files[0]); e.target.value = '' }}
        />
        <p className="text-sm text-slate-500">
          {t('dragDropText')} <span className="text-cyan-400">{t('clickToBrowse')}</span>
        </p>
        <p className="text-xs text-slate-600 mt-1">{t('fileTypes')}</p>
      </div>

      {/* Selected file + upload button */}
      {selected && (
        <div className="mt-3 flex items-center justify-between bg-[#0b1117] border border-cyan-900/50 rounded-lg px-3 py-2">
          <div>
            <p className="text-sm font-medium text-slate-300 truncate max-w-xs">{selected.name}</p>
            <p className="text-xs text-slate-600">{formatSize(selected.size)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:text-slate-300">
              {t('cancel')}
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-3 py-1.5 text-xs bg-cyan-400 text-[#0b1117] rounded-lg hover:bg-cyan-300 disabled:opacity-60 flex items-center gap-1.5 transition font-medium"
            >
              {uploading ? (
                <>
                  <span className="w-3 h-3 border-2 border-[#0b1117] border-t-transparent rounded-full animate-spin" />
                  {t('uploading')}
                </>
              ) : t('uploadFile')}
            </button>
          </div>
        </div>
      )}

      {success && <p className="text-sm text-emerald-400 mt-2">{success}</p>}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      {/* Uploaded files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-4">
          {files.map(f => (
            <div key={f.id} className="border border-cyan-900/40 rounded-xl overflow-hidden">
              {isImage(f) ? (
                <>
                  <div className="cursor-pointer" onClick={() => setLightbox(f.file_url)} title={t('viewFullSize')}>
                    <img src={f.file_url} alt={f.file_name} className="w-full max-h-48 object-cover hover:opacity-80 transition" />
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between bg-[#0d1218] border-t border-cyan-900/30">
                    <span className="text-sm text-slate-400 truncate">{f.file_name}</span>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <button onClick={() => triggerDownload(f.file_url, f.file_name)} className="text-xs text-cyan-400 hover:text-cyan-300">
                        ↓ {t('download')}
                      </button>
                      <button onClick={() => setConfirmDeleteFileId(f.id)} className="text-slate-600 hover:text-red-400 transition text-sm" title={t('removeFileTitle')}>✕</button>
                    </div>
                  </div>
                </>
              ) : isPDF(f) ? (
                <>
                  <iframe src={f.file_url} title={f.file_name} className="w-full h-96 border-0" />
                  <div className="px-3 py-2 flex items-center justify-between bg-[#0d1218] border-t border-cyan-900/30">
                    <span className="text-sm text-slate-400 truncate">{f.file_name}</span>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <button onClick={() => triggerDownload(f.file_url, f.file_name)} className="text-xs text-cyan-400 hover:text-cyan-300">
                        ↓ {t('download')}
                      </button>
                      <button onClick={() => setConfirmDeleteFileId(f.id)} className="text-slate-600 hover:text-red-400 transition text-sm" title={t('removeFileTitle')}>✕</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-3 py-3 flex items-center justify-between bg-[#10141a]">
                  <span className="text-sm text-slate-400 truncate">{f.file_name}</span>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <button onClick={() => triggerDownload(f.file_url, f.file_name)} className="text-xs text-cyan-400 hover:text-cyan-300">
                      ↓ {t('download')}
                    </button>
                    <button onClick={() => setConfirmDeleteFileId(f.id)} className="text-slate-600 hover:text-red-400 transition text-sm" title={t('removeFileTitle')}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        open={!!confirmDeleteFileId}
        message={t('confirmDeleteFile')}
        onConfirm={handleConfirmDeleteFile}
        onCancel={() => setConfirmDeleteFileId(null)}
        confirmLabel={t('yes')}
        cancelLabel={t('no')}
      />

      {lightbox && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl leading-none" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox} alt={t('fullSizeImageAlt')} className="max-w-full max-h-full object-contain rounded" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default FileUploader
