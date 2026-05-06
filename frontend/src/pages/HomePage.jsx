import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { getNotes, getCourses } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import { DEPARTMENTS as CURRICULUM_DEPARTMENTS } from '../data/curriculum'
import StudentLoungeHero from '../components/StudentLoungeHero'
import AcademicCalendar from '../components/AcademicCalendar'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function FacultyGrid({ selectedFaculty, onSelect }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Browse by Faculty</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {FACULTIES.map(faculty => {
          const isSelected = selectedFaculty?.slug === faculty.slug
          return (
            <button
              key={faculty.slug}
              onClick={() => onSelect(isSelected ? null : faculty)}
              className={`text-left p-4 rounded-xl border-2 transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">{faculty.icon}</div>
              <div className={`text-sm font-semibold leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                {faculty.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">{faculty.departments.length} departments</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const DEPT_NAME_TO_SLUG = Object.fromEntries(
  CURRICULUM_DEPARTMENTS.map(department => [department.name, department.slug])
)

function NoteCard({ note }) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block rounded-xl border border-cyan-900/60 bg-[#151c25] p-4 hover:border-cyan-500/60 hover:shadow-[0_0_24px_rgba(0,192,216,0.18)] transition"
    >
      <h3 className="font-semibold text-slate-100 truncate">{note.title}</h3>
      {note.course && <p className="text-xs text-cyan-400 mt-1 font-medium">{note.course}</p>}
      <p className="text-sm text-slate-400 mt-1">by {note.author}</p>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs bg-cyan-950/50 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800/60">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <span>{new Date(note.created_at).toLocaleDateString()}</span>
        <span>♥ {note.like_count ?? 0}</span>
      </div>
    </Link>
  )
}

function HomePage() {
  const { user } = useAuth()
  const { t, locale } = useLocale()
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
  const [department, setDepartment] = useState(() => searchParams.get('department') ?? '')

  useEffect(() => {
    const dep = searchParams.get('department') ?? ''
    setDepartment(dep)
    if (dep) setCourse('')
  }, [searchParams])

  const location = useLocation()

  useEffect(() => {
    // If navigation included department query or anchor to notes-list, scroll the notes list into view
    const hasDept = searchParams.get('department')
    const wantsAnchor = location.hash === '#notes-list'
    if ((hasDept || wantsAnchor) && location.pathname === '/notes') {
      // Small delay to allow content to render
      setTimeout(() => {
        const el = document.getElementById('notes-list')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    }
  }, [location, searchParams])

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {})
  }, [])

  const debouncedSearch = useDebounce(searchInput, 300)

  // If the user searches a department name, show a curriculum preview
  const matchedDept = debouncedSearch
    ? CURRICULUM_DEPARTMENTS.find(d => d.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : null

  const fetchNotes = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 12 }
    if (debouncedSearch) {
      const trimmed = debouncedSearch.trim()
      params.search = trimmed
      // if user typed a course code like 'COMP 4102' or 'COMP4102', treat it as course filter too
      const courseLike = /^\s*[A-Za-z]{2,6}\s*\d{3,4}\s*$/.test(trimmed)
      if (courseLike) params.course = trimmed
    }
    if (course) params.course = course
    if (tag) params.tag = tag

    getNotes(params)
      .then(data => { setNotes(data.notes); setTotal(data.total); setHasNextPage(data.hasNextPage) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, course, tag])

  useEffect(() => { setPage(1) }, [debouncedSearch, course, tag])
  useEffect(() => { fetchNotes() }, [fetchNotes])

  const clearFilters = () => { setSearchInput(''); setCourse(''); setTag(''); setDepartment('') }
  // Do not treat `department` as a strict API filter; users clicking departments should land on notes area
  // but not be considered a "filter" for the empty-state message.
  const hasFilters = searchInput || course || tag

  return (
    <div className="w-full pb-10">
      <StudentLoungeHero
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        isLoggedIn={Boolean(user)}
      />

      <div className="max-w-7xl mx-auto px-4">
      <div id="notes-list" className="scroll-mt-24 bg-gradient-to-b from-[#10141a] to-[#0d1218] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cyan-300 tracking-wide uppercase">
          Tum Notlar {total > 0 && <span className="text-slate-400 font-normal text-lg">({total})</span>}
        </h1>
        {user && (
          <Link to="/notes/new" className="bg-cyan-400 text-[#10141a] px-4 py-2 rounded-md text-sm font-bold tracking-wide hover:bg-cyan-300 transition uppercase">
            + Not Paylas
          </Link>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Departments sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-[#151c25] border border-cyan-900/60 rounded-lg p-4 sticky top-4">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-3">Yasar University Departments</h2>
            <ul className="space-y-0.5">
              {CURRICULUM_DEPARTMENTS.map(dept => {
                const linkTo = `/departments/${dept.slug}`
                return (
                  <li key={dept.slug}>
                    <Link
                      to={linkTo}
                      className="block w-full text-left text-xs px-2 py-1.5 rounded transition text-slate-300 hover:bg-cyan-900/25"
                    >
                      {dept.name}
                      <span className="ml-1 text-cyan-400 text-[10px]">→</span>
                    </Link>
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
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2 px-1">Departments</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CURRICULUM_DEPARTMENTS.map(dept => {
                const linkTo = `/departments/${dept.slug}`
                return (
                  <Link
                    key={dept.slug}
                    to={linkTo}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-cyan-700 text-cyan-300 hover:bg-cyan-900/25 transition"
                  >
                    {dept.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#151c25] border border-cyan-900/60 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-cyan-400 mb-1">Search</label>
              <input
                type="text"
                placeholder={t('searchNotes')}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full px-3 py-2 border border-cyan-800/80 bg-[#0f141c] text-slate-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="min-w-36">
              <label className="block text-xs font-medium text-cyan-400 mb-1">Course</label>
              <select
                value={course}
                onChange={e => { setCourse(e.target.value); setDepartment('') }}
                className="w-full px-3 py-2 border border-cyan-800/80 bg-[#0f141c] text-slate-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">{t('allCourses')}</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="min-w-36">
              <label className="block text-xs font-medium text-cyan-400 mb-1">Tag</label>
              <input
                type="text"
                placeholder="e.g. exam"
                value={tag}
                onChange={e => setTag(e.target.value)}
                className="w-full px-3 py-2 border border-cyan-800/80 bg-[#0f141c] text-slate-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="px-4 py-2 text-sm text-slate-300 hover:text-red-400 border border-cyan-800/80 rounded-md hover:border-red-500/70 transition">
                Clear filters
              </button>
            )}
          </div>

          {department && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-medium text-cyan-300 bg-cyan-950/50 border border-cyan-700 px-3 py-1 rounded-full">
                {department}
              </span>
              <button onClick={() => setDepartment('')} className="text-xs text-slate-500 hover:text-slate-300">
                ✕ remove
              </button>
            </div>
          )}

          {matchedDept && (
            <div className="mb-6 rounded-2xl border border-cyan-900/60 bg-gradient-to-b from-[#10141a] to-[#0d1218] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300">{matchedDept.name} (Curriculum preview)</h3>
                  <p className="text-xs text-slate-400">Matched from your search — showing quick curriculum preview.</p>
                </div>
                <Link to={`/departments/${matchedDept.slug}`} className="text-sm text-cyan-300 hover:underline">Open full curriculum →</Link>
              </div>
              <div className="mb-3">
                <AcademicCalendar slug={matchedDept.slug} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchedDept.semesters.slice(0, 2).map(sem => (
                  <div key={sem.semester} className="p-3 bg-[#0f1720] rounded-lg border border-cyan-900/40">
                    <div className="text-sm font-medium text-slate-100 mb-2">Semester {sem.semester}</div>
                    <ul className="text-xs text-slate-400 leading-relaxed space-y-1 max-h-28 overflow-auto">
                      {sem.courses.slice(0,6).map(c => (
                        <li key={c.code}>{c.code} — <span className="text-slate-300">{c.name}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
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
                className="px-4 py-2 text-sm border border-cyan-700 text-cyan-300 rounded-md disabled:opacity-40 hover:bg-cyan-900/25 transition">
                Previous
              </button>
              <span className="text-sm text-slate-400">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={!hasNextPage}
                className="px-4 py-2 text-sm border border-cyan-700 text-cyan-300 rounded-md disabled:opacity-40 hover:bg-cyan-900/25 transition">
                Next
              </button>
            </div>
          )}
        </div>
        <div className="min-w-36">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('course')}</label>
          <select
            value={course}
            onChange={e => setCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('allCourses')}</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="min-w-36">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('tags')}</label>
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
            {t('clearFilters')}
          </button>
        )}
      </div>
      </div>
      </div>
    </div>
  )
}

export default HomePage
