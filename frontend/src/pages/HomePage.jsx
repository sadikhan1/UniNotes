import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getNotes } from '../services/api'
import { useAuth } from '../context/AuthContext'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const COURSES = ['', 'CS101', 'CS201', 'MATH101', 'MATH201', 'ENG101', 'PHYS101', 'BIO101']

function NoteCard({ note }) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
    >
      <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
      {note.course && <p className="text-xs text-blue-600 mt-1 font-medium">{note.course}</p>}
      <p className="text-sm text-gray-500 mt-1">by {note.author}</p>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
        <span>{new Date(note.created_at).toLocaleDateString()}</span>
        <span>♥ {note.like_count ?? 0}</span>
      </div>
    </Link>
  )
}

function HomePage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [course, setCourse] = useState('')
  const [tag, setTag] = useState('')

  const debouncedSearch = useDebounce(searchInput, 300)

  const fetchNotes = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 12 }
    if (debouncedSearch) params.search = debouncedSearch
    if (course) params.course = course
    if (tag) params.tag = tag

    getNotes(params)
      .then(data => { setNotes(data.notes); setTotal(data.total); setHasNextPage(data.hasNextPage) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, course, tag])

  useEffect(() => { setPage(1) }, [debouncedSearch, course, tag])
  useEffect(() => { fetchNotes() }, [fetchNotes])

  const clearFilters = () => { setSearchInput(''); setCourse(''); setTag('') }
  const hasFilters = searchInput || course || tag

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Public Notes {total > 0 && <span className="text-gray-400 font-normal text-lg">({total})</span>}
        </h1>
        {user && (
          <Link to="/notes/new" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
            + New Note
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search title or content..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
          <select
            value={course}
            onChange={e => setCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COURSES.map(c => <option key={c} value={c}>{c || 'All courses'}</option>)}
          </select>
        </div>
        <div className="min-w-36">
          <label className="block text-xs font-medium text-gray-600 mb-1">Tag</label>
          <input
            type="text"
            placeholder="e.g. exam"
            value={tag}
            onChange={e => setTag(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-300 rounded-md hover:border-red-300 transition">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {hasFilters ? 'No notes match your filters.' : 'No notes found. Be the first to share one!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map(note => <NoteCard key={note.id} note={note} />)}
        </div>
      )}

      {(page > 1 || hasNextPage) && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 transition">
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasNextPage}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 transition">
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default HomePage
