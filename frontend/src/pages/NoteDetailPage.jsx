import { useParams } from 'react-router-dom'

function NoteDetailPage() {
  const { id } = useParams()
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900">Note #{id} (coming soon)</h1>
    </div>
  )
}

export default NoteDetailPage
