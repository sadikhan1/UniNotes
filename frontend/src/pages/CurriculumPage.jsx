import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDepartmentBySlug } from '../data/curriculum'
import { useLocale } from '../context/LocaleContext'

function CurriculumPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t } = useLocale()
  const dept = getDepartmentBySlug(slug)

  if (!dept) {
    return (
      <div className="text-center py-20 text-slate-500">
        {t('departmentNotFound')}{' '}
        <Link to="/notes" className="text-cyan-400 hover:text-cyan-300">{t('goBackHome')}</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-cyan-400 flex items-center gap-1 mb-4 transition"
        >
          ← {t('back')}
        </button>
        <h1 className="text-2xl font-bold text-slate-100">{dept.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Yaşar University · {t('curriculum')}</p>
      </div>

      <div className="space-y-8">
        {dept.semesters.map(sem => (
          <SemesterTable key={sem.semester} semester={sem} />
        ))}
      </div>
    </div>
  )
}

function SemesterTable({ semester }) {
  const { t } = useLocale()
  const totalEcts = semester.courses.reduce((sum, c) => sum + c.ects, 0)

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-base font-semibold text-slate-200">
          {t('semester')} {semester.semester}
        </h2>
        <span className="text-xs text-slate-500 bg-[var(--color-surface)] border border-cyan-900/40 px-2 py-0.5 rounded-full">
          {totalEcts} {t('ects')}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-cyan-900/40">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--color-muted)] text-xs text-slate-500 uppercase tracking-wide">
              <th className="text-left px-3 py-2 border-b border-cyan-900/30 font-medium w-28">{t('courseCode')}</th>
              <th className="text-left px-3 py-2 border-b border-cyan-900/30 font-medium">{t('courseName')}</th>
              <th className="text-center px-3 py-2 border-b border-cyan-900/30 font-medium w-20">T+P+L</th>
              <th className="text-center px-3 py-2 border-b border-cyan-900/30 font-medium w-24">{t('courseType')}</th>
              <th className="text-center px-3 py-2 border-b border-cyan-900/30 font-medium w-16">{t('ects')}</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-surface)]">
            {semester.courses.map(course => (
              <CourseRow key={course.code} course={course} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CourseRow({ course }) {
  const { t } = useLocale()
  const isElective = course.type === 'Elective'
  const typeLabel = isElective ? t('elective') : t('required')

  return (
    <tr className={`border-b border-cyan-900/20 hover:bg-cyan-900/10 transition-colors`}>
      <td className="px-3 py-2.5">
        {isElective ? (
          <span className="text-xs text-slate-600 font-mono">{course.code}</span>
        ) : (
          <Link
            to={`/notes?course=${encodeURIComponent(course.code)}`}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
          >
            {course.code}
          </Link>
        )}
      </td>
      <td className="px-3 py-2.5">
        {isElective ? (
          <span className="text-slate-500 italic">{course.name}</span>
        ) : (
          <Link
            to={`/notes?course=${encodeURIComponent(course.code)}`}
            className="text-slate-300 hover:text-cyan-400 font-medium"
          >
            {course.name}
          </Link>
        )}
      </td>
      <td className="px-3 py-2.5 text-center text-slate-500 font-mono text-xs">
        {course.tul}
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isElective
            ? 'bg-amber-900/30 text-amber-400'
            : 'bg-cyan-900/30 text-cyan-400'
        }`}>
          {typeLabel}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center font-semibold text-slate-300">
        {course.ects}
      </td>
    </tr>
  )
}

export default CurriculumPage
