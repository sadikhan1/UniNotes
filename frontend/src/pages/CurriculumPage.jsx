import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { getDepartmentBySlug } from '../data/curriculum'
import AcademicCalendar from '../components/AcademicCalendar'

function CurriculumPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t } = useLocale()
  const dept = getDepartmentBySlug(slug)

  useEffect(() => {
    // ensure the curriculum page always starts at the top when navigated to
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [slug])

  if (!dept) {
    return (
      <div className="min-h-[60vh] bg-[#0b1117] text-slate-200 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="text-lg font-semibold text-cyan-300 mb-2">Department not found</div>
          <p className="text-sm text-slate-400 mb-4">The curriculum page you tried to open does not exist.</p>
          <Link to="/notes" className="text-cyan-300 hover:text-cyan-200 hover:underline">Go back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1117] text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-cyan-300 hover:text-cyan-200 flex items-center gap-1 mb-4 transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-cyan-300 tracking-tight">{dept.name}</h1>
          <p className="text-sm text-slate-400 mt-1">Yaşar University · Curriculum</p>
        </div>

        <div className="mb-6">
          <AcademicCalendar slug={dept.slug} />
        </div>

        <div className="space-y-8">
          {dept.semesters.map(sem => (
            <SemesterTable key={sem.semester} semester={sem} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SemesterTable({ semester }) {
  const { t } = useLocale()
  const totalEcts = semester.courses.reduce((sum, c) => sum + c.ects, 0)

  return (
    <div className="rounded-2xl border border-cyan-900/60 bg-gradient-to-b from-[#10141a] to-[#0d1218] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-base font-semibold text-slate-100">
          Semester {semester.semester}
        </h2>
        <span className="text-xs text-cyan-200 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
          {totalEcts} ECTS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse overflow-hidden rounded-xl">
          <thead>
            <tr className="bg-[#151c25] text-xs text-cyan-300 uppercase tracking-wide">
              <th className="text-left px-3 py-2 border border-cyan-900/50 font-medium w-28">Course Code</th>
              <th className="text-left px-3 py-2 border border-cyan-900/50 font-medium">Course Name</th>
              <th className="text-center px-3 py-2 border border-cyan-900/50 font-medium w-20">T+P+L</th>
              <th className="text-center px-3 py-2 border border-cyan-900/50 font-medium w-24">Type</th>
              <th className="text-center px-3 py-2 border border-cyan-900/50 font-medium w-16">ECTS</th>
            </tr>
          </thead>
          <tbody>
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
    <tr className={`border-b border-cyan-950/40 transition-colors ${isElective ? 'bg-[#101722]' : 'bg-[#0e141c]'} hover:bg-cyan-950/25`}>
      <td className="px-3 py-2.5 border border-cyan-900/50">
        {isElective ? (
          <span className="text-xs text-slate-400 font-mono">{course.code}</span>
        ) : (
          <Link
            to={`/notes?course=${encodeURIComponent(course.code)}`}
            className="text-xs font-mono text-cyan-300 hover:text-cyan-200 hover:underline font-medium"
          >
            {course.code}
          </Link>
        )}
      </td>
      <td className="px-3 py-2.5 border border-cyan-900/50">
        {isElective ? (
          <span className="text-slate-400 italic">{course.name}</span>
        ) : (
          <Link
            to={`/notes?course=${encodeURIComponent(course.code)}`}
            className="text-slate-100 hover:text-cyan-300 font-medium"
          >
            {course.name}
          </Link>
        )}
      </td>
      <td className="px-3 py-2.5 border border-cyan-900/50 text-center text-slate-400 font-mono text-xs">
        {course.tul}
      </td>
      <td className="px-3 py-2.5 border border-cyan-900/50 text-center">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isElective
            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
            : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
        }`}>
          {typeLabel}
        </span>
      </td>
      <td className="px-3 py-2.5 border border-cyan-900/50 text-center font-semibold text-slate-100">
        {course.ects}
      </td>
    </tr>
  )
}

export default CurriculumPage
