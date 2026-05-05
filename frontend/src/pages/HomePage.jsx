import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getNotes, getCourses } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { DEPT_NAME_TO_SLUG } from '../data/curriculum'
import StudentLoungeHero from '../components/StudentLoungeHero'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const DEPARTMENTS = [
  'Computer Engineering',
  'Cartoon and Animation',
  'Economics',
  'Electrical-Electronics Engineering',
  'Industrial Engineering',
  'Industrial Design',
  'Energy Systems Engineering',
  'Gastronomy and Culinary Arts',
  'Visual Communication Design',
  'Public Relations and Advertising',
  'Law',
  'Interior Architecture and Environmental Design',
  'English Language and Literature',
  'English Translation and Interpretation',
  'Civil Engineering',
  'Business Administration',
  'Logistics Management',
  'Mechanical Engineering',
  'Architecture',
  'Psychology',
  'Radio, Television and Cinema',
  'Agricultural Economics',
  'Agricultural Machinery and Technologies Engineering',
  'Tourism Guidance',
  'International Relations',
  'International Trade and Finance',
  'Software Engineering',
  'New Media and Communication',
  'Management Information Systems',
]

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
  const [searchParams] = useSearchParams()

  const [notes, setNotes] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loading, setLoading] = useState(true)

  const [courses, setCourses] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [course, setCourse] = useState(() => searchParams.get('course') ?? '')
  const [tag, setTag] = useState('')
  const [department, setDepartment] = useState('')

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {})
  }, [])

  const debouncedSearch = useDebounce(searchInput, 300)

  const fetchNotes = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 12 }
    if (debouncedSearch) params.search = debouncedSearch
    if (course) params.course = course
    if (department) params.course = department
    if (tag) params.tag = tag

    getNotes(params)
      .then(data => { setNotes(data.notes); setTotal(data.total); setHasNextPage(data.hasNextPage) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, course, department, tag])

  useEffect(() => { setPage(1) }, [debouncedSearch, course, department, tag])
  useEffect(() => { fetchNotes() }, [fetchNotes])

  const clearFilters = () => { setSearchInput(''); setCourse(''); setTag(''); setDepartment('') }
  const hasFilters = searchInput || course || tag || department

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <StudentLoungeHero
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        isLoggedIn={Boolean(user)}
      />

      <div id="notes-list" className="scroll-mt-24" />

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

      <div className="flex gap-6 items-start">
        {/* Departments sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Yaşar University Departments</h2>
            <ul className="space-y-0.5">
              {DEPARTMENTS.map(dept => {
                const slug = DEPT_NAME_TO_SLUG[dept]
                return (
                  <li key={dept}>
                    {slug ? (
                      <Link
                        to={`/departments/${slug}`}
                        className="block w-full text-left text-xs px-2 py-1.5 rounded transition text-gray-600 hover:bg-gray-100"
                      >
                        {dept}
                        <span className="ml-1 text-blue-400 text-[10px]">→</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => { setDepartment(dept === department ? '' : dept); setCourse('') }}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded transition ${
                          department === dept
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {dept}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile departments (horizontal scroll) */}
          <div className="lg:hidden mb-4 -mx-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Departments</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DEPARTMENTS.map(dept => {
                const slug = DEPT_NAME_TO_SLUG[dept]
                return slug ? (
                  <Link
                    key={dept}
                    to={`/departments/${slug}`}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-50 transition"
                  >
                    {dept}
                  </Link>
                ) : (
                  <button
                    key={dept}
                    onClick={() => { setDepartment(dept === department ? '' : dept); setCourse('') }}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
                      department === dept
                        ? 'bg-blue-600 border-blue-600 text-white font-medium'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {dept}
                  </button>
                )
              })}
            </div>
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
                onChange={e => { setCourse(e.target.value); setDepartment('') }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All courses</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
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

          {department && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                {department}
              </span>
              <button onClick={() => setDepartment('')} className="text-xs text-gray-400 hover:text-gray-600">
                ✕ remove
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {hasFilters ? 'No notes match your filters.' : 'No notes found. Be the first to share one!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
      </div>
    </div>
  )
}

export default HomePage
