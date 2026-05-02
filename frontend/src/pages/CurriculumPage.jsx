import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDepartmentBySlug } from '../data/curriculum'

function CurriculumPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dept = getDepartmentBySlug(slug)

  if (!dept) {
    return (
      <div className="text-center py-20 text-gray-500">
        Department not found.{' '}
        <Link to="/notes" className="text-blue-600 hover:underline">Go back to home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{dept.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Yaşar University · Curriculum</p>
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
  const totalEcts = semester.courses.reduce((sum, c) => sum + c.ects, 0)

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-base font-semibold text-gray-800">
          Semester {semester.semester}
        </h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {totalEcts} ECTS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-3 py-2 border border-gray-200 font-medium w-28">Course Code</th>
              <th className="text-left px-3 py-2 border border-gray-200 font-medium">Course Name</th>
              <th className="text-center px-3 py-2 border border-gray-200 font-medium w-20">T+P+L</th>
              <th className="text-center px-3 py-2 border border-gray-200 font-medium w-24">Type</th>
              <th className="text-center px-3 py-2 border border-gray-200 font-medium w-16">ECTS</th>
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
  const isElective = course.type === 'Elective'

  return (
    <tr className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${isElective ? 'bg-gray-50/50' : 'bg-white'}`}>
      <td className="px-3 py-2.5 border border-gray-200">
        {isElective ? (
          <span className="text-xs text-gray-400 font-mono">{course.code}</span>
        ) : (
          <Link
            to={`/notes?course=${encodeURIComponent(course.code)}`}
            className="text-xs font-mono text-blue-700 hover:text-blue-900 hover:underline font-medium"
          >
            {course.code}
          </Link>
        )}
      </td>
      <td className="px-3 py-2.5 border border-gray-200">
        {isElective ? (
          <span className="text-gray-500 italic">{course.name}</span>
        ) : (
          <Link
            to={`/notes?course=${encodeURIComponent(course.code)}`}
            className="text-gray-800 hover:text-blue-700 font-medium"
          >
            {course.name}
          </Link>
        )}
      </td>
      <td className="px-3 py-2.5 border border-gray-200 text-center text-gray-600 font-mono text-xs">
        {course.tul}
      </td>
      <td className="px-3 py-2.5 border border-gray-200 text-center">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isElective
            ? 'bg-orange-50 text-orange-600'
            : 'bg-blue-50 text-blue-700'
        }`}>
          {course.type}
        </span>
      </td>
      <td className="px-3 py-2.5 border border-gray-200 text-center font-semibold text-gray-700">
        {course.ects}
      </td>
    </tr>
  )
}

export default CurriculumPage
