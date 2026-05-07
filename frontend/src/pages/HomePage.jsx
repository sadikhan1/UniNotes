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
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{t('browseByFaculty')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {FACULTIES.map(faculty => {
          const isSelected = selectedFaculty?.slug === faculty.slug
          return (
            <button
              key={faculty.slug}
              onClick={() => onSelect(isSelected ? null : faculty)}
              className={`text-left p-4 rounded-xl border-2 transition ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-900/20'
                  : 'border-cyan-900/40 bg-[var(--color-surface)] hover:border-cyan-700/60 hover:bg-cyan-900/10'
              }`}
            >
              <div className="text-2xl mb-2">{faculty.icon}</div>
              <div className={`text-sm font-semibold leading-tight ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                {getLocalizedFacultyName(faculty, locale)}
              </div>
              <div className="text-xs text-slate-600 mt-1">{faculty.departments.length} {t('departments')}</div>
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
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
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
                  ? 'border-cyan-500 bg-cyan-900/20'
                  : 'border-cyan-900/40 bg-[var(--color-surface)] hover:border-cyan-700/60 hover:bg-cyan-900/10'
              }`}
            >
              <div className={`text-sm font-semibold leading-tight ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                {getLocalizedDeptName(dept, locale)}
              </div>
              <div className="text-xs text-slate-600 mt-1">{totalCourses} {t('coursesLabel')} · {dept.semesters.length} {t('semesters')}</div>
              <div className="flex items-center gap-3 mt-2" onClick={e => e.stopPropagation()}>
                <Link
                  to={`/departments/${dept.slug}`}
                  className="text-xs text-cyan-500 hover:text-cyan-400"
                >
                  {t('viewNotes')}
                </Link>
                <Link
                  to={`/departments/${dept.slug}/exams`}
                  className="text-xs text-red-400 hover:text-red-300"
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
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {getLocalizedDeptName(dept, locale)} — {t('courses')}
        </h2>
        <Link to={`/departments/${dept.slug}`} className="text-xs text-cyan-400 hover:text-cyan-300">
          {t('viewAllNotes')}
        </Link>
      </div>
      <div className="space-y-4">
        {dept.semesters.map(sem => (
          <div key={sem.semester} className="bg-[var(--color-surface)] border border-cyan-900/40 rounded-xl overflow-hidden">
            <div className="bg-[var(--color-muted)] border-b border-cyan-900/30 px-4 py-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {t('semester')} {sem.semester}
              </span>
            </div>
            <div className="divide-y divide-cyan-900/20">
              {sem.courses.map(course => (
                <Link
                  key={course.code}
                  to={`/courses/${encodeURIComponent(course.code)}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-cyan-900/10 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-semibold text-cyan-400 shrink-0">{course.code}</span>
                    <span className="text-sm text-slate-300 truncate group-hover:text-cyan-300">{course.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-slate-600">{course.tul}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      course.type === 'Required'
                        ? 'bg-cyan-900/30 text-cyan-400'
                        : 'bg-amber-900/30 text-amber-400'
                    }`}>
                      {course.ects} {t('ects')}
                    </span>
                    <span className="text-xs text-slate-700 group-hover:text-cyan-500">→</span>
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
      className="block bg-[var(--color-surface)] rounded-xl border border-cyan-900/40 p-4 hover:border-cyan-700/60 hover:bg-cyan-900/10 transition"
    >
      <h3 className="font-semibold text-slate-100 truncate">{note.title}</h3>
      {note.course && <p className="text-xs text-cyan-400 mt-1 font-medium">{note.course}</p>}
      <p className="text-sm text-slate-500 mt-1">by {note.author}</p>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs bg-[var(--color-base)] border border-cyan-900/30 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-600">
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

  const inputClass = `w-full px-3 py-2 bg-[var(--color-base)] border border-cyan-900/50 rounded-lg text-slate-100
    placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-600 transition`

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
        <h1 className="text-2xl font-bold text-slate-100">
          {t('recentNotes')} {total > 0 && <span className="text-slate-500 font-normal text-lg">({total})</span>}
        </h1>
        {user && (
          <Link to="/notes/new" className="bg-cyan-400 text-[#0b1117] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-300 transition">
            + {t('createNote')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] border border-cyan-900/40 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('searchNotes')}</label>
          <input
            type="text"
            placeholder={t('searchNotes')}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="min-w-36 flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('courseCode')}</label>
          <input
            type="text"
            placeholder={t('courseCodePlaceholder')}
            value={course}
            onChange={e => setCourse(e.target.value.toUpperCase())}
            className={inputClass}
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('tags')}</label>
          <input
            type="text"
            placeholder={t('tagExample')}
            value={tag}
            onChange={e => setTag(e.target.value)}
            className={inputClass}
          />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-slate-400 hover:text-red-400 border border-cyan-900/50 rounded-lg hover:border-red-800/50 transition">
            {t('clearFilters')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasFilters ? (
        <div className="text-center py-20 text-slate-600">
          {t('enterCourseCodePrompt')}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
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
            className="px-4 py-2 text-sm border border-cyan-900/50 rounded-lg text-slate-400 disabled:opacity-40 hover:bg-cyan-900/20 transition">
            {t('previous')}
          </button>
          <span className="text-sm text-slate-500">{t('page')} {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasNextPage}
            className="px-4 py-2 text-sm border border-cyan-900/50 rounded-lg text-slate-400 disabled:opacity-40 hover:bg-cyan-900/20 transition">
            {t('next')}
          </button>
        </div>
      )}
    </div>
  )
}

export default HomePage
