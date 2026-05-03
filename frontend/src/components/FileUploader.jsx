import { useState, useRef } from 'react'
import { uploadFile, deleteFile } from '../services/api'

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_SIZE = 10 * 1024 * 1024

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileUploader({ noteId, initialFiles = [] }) {
  const [files, setFiles] = useState(initialFiles)
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  function validate(file) {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only PDF, PNG, JPG files are allowed.'
    if (file.size > MAX_SIZE) return 'File must be under 10 MB.'
    return null
  }

  function handleSelect(file) {
    const err = validate(file)
    if (err) { setError(err); setSelected(null); return }
    setError('')
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
    try {
      const uploaded = await uploadFile(noteId, selected)
      setFiles(prev => [...prev, uploaded])
      setSelected(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(fileId) {
    try {
      await deleteFile(fileId)
      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Attachments</h3>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={e => { if (e.target.files[0]) handleSelect(e.target.files[0]); e.target.value = '' }}
        />
        <p className="text-sm text-gray-500">Drag & drop or <span className="text-blue-600">click to browse</span></p>
        <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG — max 10 MB</p>
      </div>

      {/* Selected file preview + upload button */}
      {selected && (
        <div className="mt-3 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          <div>
            <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{selected.name}</p>
            <p className="text-xs text-gray-400">{formatSize(selected.size)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5 transition"
            >
              {uploading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {/* Uploaded files list */}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map(f => (
            <li key={f.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2">
              <a
                href={f.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate"
              >
                {f.file_name}
              </a>
              <button
                onClick={() => handleDelete(f.id)}
                className="ml-3 text-gray-400 hover:text-red-500 transition shrink-0 text-sm"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileUploader
