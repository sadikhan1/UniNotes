import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getNotes } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import { DEPARTMENTS, FACULTIES, getLocalizedFacultyName, getLocalizedDeptName } from '../data/curriculum'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function FacultyGrid({ selectedFaculty, onSelect }) {
  const { t, locale } = useLocale()
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('browseByFaculty')}</h2>
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
                {getLocalizedFacultyName(faculty, locale)}
              </div>
              <div className="text-xs text-gray-400 mt-1">{faculty.departments.length} {t('departments')}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DepartmentGrid({ faculty, selectedDept, onSelect }) {
  const { t, locale } = useLocale()
  const depts = faculty.departments
    .map(slug => DEPARTMENTS.find(d => d.slug === slug))
    .filter(Boolean)

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{faculty.icon}</span>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {getLocalizedFacultyName(faculty, locale)} — {t('departments')}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {depts.map(dept => {
          const isSelected = selectedDept?.slug === dept.slug
          const totalCourses = dept.semesters.reduce((acc, s) => acc + s.courses.length, 0)
          return (
            <button
              key={dept.slug}
              onClick={() => onSelect(isSelected ? null : dept)}
              className={`text-left p-4 rounded-xl border-2 transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className={`text-sm font-semibold leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                {getLocalizedDeptName(dept, locale)}
              </div>
              <div className="text-xs text-gray-400 mt-1">{totalCourses} {t('coursesLabel')} · {dept.semesters.length} {t('semesters')}</div>
              <div className="flex items-center gap-3 mt-2" onClick={e => e.stopPropagation()}>
                <Link
                  to={`/departments/${dept.slug}`}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  {t('viewNotes')}
                </Link>
                <Link
                  to={`/departments/${dept.slug}/exams`}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  📅 Exams
                </Link>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CourseList({ dept }) {
  const { t, locale } = useLocale()
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {getLocalizedDeptName(dept, locale)} — {t('courses')}
        </h2>
        <Link to={`/departments/${dept.slug}`} className="text-xs text-blue-600 hover:underline">
          {t('viewAllNotes')}
        </Link>
      </div>
      <div className="space-y-4">
        {dept.semesters.map(sem => (
          <div key={sem.semester} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {t('semester')} {sem.semester}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {sem.courses.map(course => (
                <Link
                  key={course.code}
                  to={`/courses/${encodeURIComponent(course.code)}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-semibold text-blue-600 shrink-0">{course.code}</span>
                    <span className="text-sm text-gray-800 truncate group-hover:text-blue-700">{course.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-gray-400">{course.tul}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      course.type === 'Required'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {course.ects} {t('ects')}
                    </span>
                    <span className="text-xs text-gray-300 group-hover:text-blue-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NoteCard({ note, locale }) {
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
        <span>{new Date(note.created_at).toLocaleDateString(locale)}</span>
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

  const [searchInput, setSearchInput] = useState('')
  const [course, setCourse] = useState(() => searchParams.get('course') ?? '')
  const [tag, setTag] = useState('')

  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedDept, setSelectedDept] = useState(null)

  const debouncedSearch = useDebounce(searchInput, 300)
  const hasFilters = searchInput || course || tag

  const fetchNotes = useCallback(() => {
    if (!hasFilters) {
      setNotes([])
      setTotal(0)
      setHasNextPage(false)
      setLoading(false)
      return
    }

    setLoading(true)
    const params = { page, limit: 12 }
    if (debouncedSearch) params.search = debouncedSearch
    if (course) params.course = course
    if (tag) params.tag = tag

    getNotes(params)
      .then(data => { setNotes(data.notes); setTotal(data.total); setHasNextPage(data.hasNextPage) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, course, tag, hasFilters])

  useEffect(() => { setPage(1) }, [debouncedSearch, course, tag])
  useEffect(() => { fetchNotes() }, [fetchNotes])

  const clearFilters = () => { setSearchInput(''); setCourse(''); setTag('') }

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty)
    setSelectedDept(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      <FacultyGrid selectedFaculty={selectedFaculty} onSelect={handleFacultySelect} />

      {selectedFaculty && (
        <DepartmentGrid
          faculty={selectedFaculty}
          selectedDept={selectedDept}
          onSelect={setSelectedDept}
        />
      )}

      {selectedDept && <CourseList dept={selectedDept} />}

      <div id="notes-list" className="scroll-mt-24" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('recentNotes')} {total > 0 && <span className="text-gray-400 font-normal text-lg">({total})</span>}
        </h1>
        {user && (
          <Link to="/notes/new" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
            + {t('createNote')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('searchNotes')}</label>
          <input
            type="text"
            placeholder={t('searchNotes')}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="min-w-36 flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('courseCode')}</label>
          <input
            type="text"
            placeholder={t('courseCodePlaceholder')}
            value={course}
            onChange={e => setCourse(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('tags')}</label>
          <input
            type="text"
            placeholder={t('tagExample')}
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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasFilters ? (
        <div className="text-center py-20 text-gray-500">
          {t('enterCourseCodePrompt')}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {t('noNotesMatchFilters')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.map(note => <NoteCard key={note.id} note={note} locale={locale} />)}
        </div>
      )}

      {(page > 1 || hasNextPage) && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 transition">
            {t('previous')}
          </button>
          <span className="text-sm text-gray-600">{t('page')} {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasNextPage}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 transition">
            {t('next')}
          </button>
        </div>
      )}
    </div>
  )
}

export default HomePage
