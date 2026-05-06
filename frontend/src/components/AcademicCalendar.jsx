import React from 'react'
import { getDepartmentBySlug } from '../data/curriculum'

function AcademicCalendar({ slug }) {
  const department = getDepartmentBySlug(slug)
  const events = department?.academicCalendar || []

  if (!events.length) return null

  return (
    <aside className="rounded-2xl border border-cyan-900/60 bg-gradient-to-b from-[#10141a] to-[#0d1218] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <h3 className="text-lg font-bold text-cyan-300 mb-1">Academic Calendar</h3>
      <p className="text-sm text-slate-400 mb-4">
        {department?.name ?? 'Department'} schedule and academic milestones
      </p>
      <ul className="space-y-3">
        {events.map(e => (
          <li key={e.date} className="flex items-start gap-3">
            <div className="w-20 text-xs text-cyan-300 font-semibold shrink-0">{formatDate(e.date)}</div>
            <div>
              <div className="text-sm font-semibold text-slate-100">{e.title}</div>
              <div className="text-xs text-slate-400">{e.desc}</div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function formatDate(d) {
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch (err) {
    return d
  }
}

export default AcademicCalendar
