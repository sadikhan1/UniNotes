import { useState } from 'react'

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
  return (
    <button
      onClick={() => triggerDownload(file.file_url, file.file_name)}
      className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
    >
      ↓ Download
    </button>
  )
}

function FilePreview({ files = [] }) {
  const [lightbox, setLightbox] = useState(null)

  if (!files.length) return null

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Attachments</h3>
      <div className="space-y-4">
        {files.map(f => (
          <div key={f.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {isImage(f) ? (
              <>
                <div
                  className="cursor-pointer"
                  onClick={() => setLightbox(f.file_url)}
                  title="Click to view full size"
                >
                  <img
                    src={f.file_url}
                    alt={f.file_name}
                    className="w-full max-h-48 object-cover hover:opacity-90 transition"
                  />
                </div>
                <div className="px-3 py-2 flex items-center justify-between bg-gray-50 border-t border-gray-200">
                  <span className="text-sm text-gray-700 truncate">{f.file_name}</span>
                  <DownloadBtn file={f} />
                </div>
              </>
            ) : isPDF(f) ? (
              <>
                <iframe
                  src={f.file_url}
                  title={f.file_name}
                  className="w-full h-96 border-0"
                />
                <div className="px-3 py-2 flex items-center justify-between bg-gray-50 border-t border-gray-200">
                  <span className="text-sm text-gray-700 truncate">{f.file_name}</span>
                  <DownloadBtn file={f} />
                </div>
              </>
            ) : (
              <div className="px-3 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate">{f.file_name}</span>
                <DownloadBtn file={f} />
              </div>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl leading-none hover:text-gray-300"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <img
            src={lightbox}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default FilePreview
