import { Link, useParams } from 'react-router-dom'
import { getDepartmentBySlug } from '../data/curriculum'
import { getExamsByDept } from '../data/examSchedule'

const TIME_SLOTS = [
  '08:40', '09:40', '10:40', '11:40', '12:40',
  '13:40', '14:40', '15:40', '16:40', '17:40', '18:40',
]

const SLOT_ENDS = {
  '08:40': '09:30', '09:40': '10:30', '10:40': '11:30',
  '11:40': '12:30', '12:40': '13:30', '13:40': '14:30',
  '14:40': '15:30', '15:40': '16:30', '16:40': '17:30',
  '17:40': '18:30', '18:40': '19:30',
}

function getDatesInRange(exams) {
  if (!exams.length) return []
  const dates = [...new Set(exams.map(e => e.date))].sort()
  const start = new Date(dates[0])
  const end = new Date(dates[dates.length - 1])
  const all = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    all.push(d.toISOString().slice(0, 10))
  }
  return all
}

function groupByWeek(dates) {
  const weeks = []
  let week = []
  dates.forEach(date => {
    const day = new Date(date).getDay()
    if (week.length > 0 && day === 0) {
      weeks.push(week)
      week = []
    }
    week.push(date)
  })
  if (week.length) weeks.push(week)
  return weeks
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOLIDAY = '2026-05-19'

function ExamCalendarPage() {
  const { slug } = useParams()
  const dept = getDepartmentBySlug(slug)
  const exams = getExamsByDept(slug)

  if (!dept) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
        Department not found.{' '}
        <Link to="/notes" className="text-cyan-400 hover:text-cyan-300">Go back</Link>
      </div>
    )
  }

  if (!exams.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
        <p className="text-lg mb-2">No exam schedule available for {dept.name}.</p>
        <Link to="/notes" className="text-cyan-400 hover:text-cyan-300 text-sm">Go back</Link>
      </div>
    )
  }

  const examMap = {}
  exams.forEach(e => {
    const key = `${e.date}__${e.start}`
    if (!examMap[key]) examMap[key] = []
    examMap[key].push(e)
  })

  const allDates = getDatesInRange(exams)
  const weeks = groupByWeek(allDates)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/notes" className="text-sm text-slate-500 hover:text-cyan-400 transition">← Home</Link>
        <h1 className="text-2xl font-bold text-slate-100 mt-2">{dept.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Final Exam Schedule · May 2026</p>
      </div>

      <div className="space-y-8">
        {weeks.map((weekDates, wi) => (
          <div key={wi} className="overflow-x-auto rounded-xl border border-cyan-900/40">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-24 px-2 py-2 text-xs text-slate-600 font-normal border-b border-r border-cyan-900/30 bg-[var(--color-muted)]" />
                  {weekDates.map(date => {
                    const d = new Date(date)
                    const isHoliday = date === HOLIDAY
                    return (
                      <th key={date} className={`px-2 py-2 border-b border-r border-cyan-900/30 text-center font-medium ${
                        isHoliday ? 'bg-amber-950/40' : 'bg-[var(--color-muted)]'
                      }`}>
                        <div className="text-xs text-slate-600">{DAY_NAMES[d.getDay()]}</div>
                        <div className={`font-bold ${isHoliday ? 'text-amber-400' : 'text-slate-300'}`}>
                          {d.getDate()} {d.toLocaleString('en', { month: 'short' })}
                        </div>
                        {isHoliday && <div className="text-[10px] text-amber-500 font-normal">19 Mayıs</div>}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="bg-[var(--color-surface)]">
                {TIME_SLOTS.map(slot => (
                  <tr key={slot} className="border-b border-cyan-900/20">
                    <td className="px-2 py-2 text-xs text-slate-600 text-right border-r border-cyan-900/20 bg-[var(--color-muted)] whitespace-nowrap">
                      {slot}<br /><span className="text-slate-700">{SLOT_ENDS[slot]}</span>
                    </td>
                    {weekDates.map(date => {
                      const key = `${date}__${slot}`
                      const cellExams = examMap[key] || []
                      const isHoliday = date === HOLIDAY
                      return (
                        <td key={date} className={`border-r border-cyan-900/20 px-1 py-1 align-top min-w-[110px] ${
                          isHoliday ? 'bg-amber-950/10' : ''
                        }`}>
                          {cellExams.map(exam => (
                            <Link
                              key={exam.course}
                              to={`/courses/${encodeURIComponent(exam.course)}`}
                              className="block mb-1 px-2 py-1.5 rounded text-xs font-semibold bg-cyan-900/40 text-cyan-400 hover:bg-cyan-900/60 hover:text-cyan-300 transition truncate"
                              title={exam.course + (exam.note ? ` (${exam.note})` : '')}
                            >
                              {exam.course}
                              {exam.note && <span className="ml-1 font-normal text-cyan-600">({exam.note})</span>}
                            </Link>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExamCalendarPage
