import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNotes, getMyNotes } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import { DEPARTMENTS } from '../data/curriculum'
import { getExamForCourse } from '../data/examSchedule'

function findCourse(courseCode) {
  for (const dept of DEPARTMENTS) {
    for (const sem of dept.semesters) {
      const course = sem.courses.find(c => c.code === courseCode)
      if (course) return { course, dept, semester: sem.semester }
    }
  }
  return null
}

function FileIcon({ type }) {
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('image')) return '🖼️'
  if (type?.includes('word') || type?.includes('document')) return '📝'
  if (type?.includes('sheet') || type?.includes('excel')) return '📊'
  if (type?.includes('presentation') || type?.includes('powerpoint')) return '📑'
  return '📎'
}

function NoteCard({ note, isOwn }) {
  const { t } = useLocale()
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
        <div className="flex items-center gap-1 shrink-0">
          {isOwn && !note.is_public && (
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t('private')}</span>
          )}
          {note.files?.length > 0 && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
              {note.files.length} file{note.files.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-1">by {note.author}</p>

      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {note.files?.length > 0 && (
        <div className="mt-3 space-y-1">
          {note.files.map(file => (
            <div key={file.id} className="flex items-center gap-2 text-xs text-gray-500">
              <span><FileIcon type={file.file_type} /></span>
              <span className="truncate">{file.file_name}</span>
            </div>
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

function CoursePage() {
  const { courseCode } = useParams()
  const { user } = useAuth()
  const { t } = useLocale()

  const decoded = decodeURIComponent(courseCode)
  const found = findCourse(decoded)

  const [publicNotes, setPublicNotes] = useState([])
  const [myPrivateNotes, setMyPrivateNotes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

  useEffect(() => {
    setLoading(true)

    const fetches = [
      getNotes({ course: decoded, page, limit: 12 }),
    ]
    if (user) {
      fetches.push(getMyNotes({ course: decoded, limit: 50 }))
    }

    Promise.all(fetches)
      .then(([pubData, myData]) => {
        setPublicNotes(pubData.notes)
        setTotal(pubData.total)
        setHasNextPage(pubData.hasNextPage)

        if (myData) {
          const pubIds = new Set(pubData.notes.map(n => n.id))
          setMyPrivateNotes(myData.notes.filter(n => !n.is_public && !pubIds.has(n.id)))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [decoded, page, user])

  if (!found) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        {t('courseNotFound')}{' '}
        <Link to="/notes" className="text-blue-600 hover:underline">{t('goBack')}</Link>
      </div>
    )
  }

  const { course, dept, semester } = found
  const courseTypeLabel = course.type === 'Required' ? t('required') : t('elective')
  const exam = getExamForCourse(dept.slug, course.code)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link to="/notes" className="hover:text-gray-600">{t('home')}</Link>
        <span>›</span>
        <Link to={`/departments/${dept.slug}`} className="hover:text-gray-600">{dept.name}</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">{course.code}</span>
      </nav>

      {/* Course info card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {course.code}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-3">{course.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{dept.name} · {t('semester')} {semester}</p>
          </div>
          <div className="text-right shrink-0">
            <div className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
              course.type === 'Required' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {courseTypeLabel}
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{course.ects}</div>
            <div className="text-xs text-gray-400">{t('ects')}</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-6 text-sm text-gray-500">
          <span>T+U+L: <span className="font-medium text-gray-700">{course.tul}</span></span>
          {exam ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-lg">📅</span>
              <div>
                <div className="text-xs text-red-500 font-semibold uppercase tracking-wide">Final Exam</div>
                <div className="font-semibold text-red-700">
                  {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', weekday: 'long' })}
                </div>
                <div className="text-xs text-red-600">{exam.start} – {exam.end}{exam.note ? ` · ${exam.note}` : ''}</div>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">No exam date available</span>
          )}
        </div>
      </div>

      {/* My private notes section */}
      {myPrivateNotes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('myNotes')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myPrivateNotes.map(note => (
              <NoteCard key={note.id} note={note} isOwn />
            ))}
          </div>
        </div>
      )}

      {/* Public notes section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {myPrivateNotes.length > 0 ? t('publicNotes') : t('notes')}
          {total > 0 && <span className="text-gray-400 font-normal text-base ml-1">({total})</span>}
        </h2>
        {user ? (
          <Link
            to={`/notes/new?course=${encodeURIComponent(decoded)}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            + {t('createNote')}
          </Link>
        ) : (
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            {t('loginToCreateNote')}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : publicNotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">{t('noPublicNotes')}</p>
          {user && (
            <Link
              to={`/notes/new?course=${encodeURIComponent(decoded)}`}
              className="text-blue-600 hover:underline text-sm"
            >
              {t('beFirstToShare')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {publicNotes.map(note => <NoteCard key={note.id} note={note} isOwn={note.author === user?.username} />)}
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

export default CoursePage
