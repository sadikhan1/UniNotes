// Final exam schedules per department slug
// SE data source: se.yasar.edu.tr — May 2026 final exam timetable

export const EXAM_SCHEDULES = {
  'yazilim-muhendisligi': [
    { course: 'MATH 2230',   date: '2026-05-11', start: '09:40', end: '10:30' },
    { course: 'MATH 2255',   date: '2026-05-11', start: '10:40', end: '11:30' },
    { course: 'SOFL 1102',   date: '2026-05-11', start: '15:40', end: '16:30' },
    { course: 'SE 3332',     date: '2026-05-12', start: '09:40', end: '10:30' },
    { course: 'SOFL 1101',   date: '2026-05-12', start: '11:40', end: '12:30' },
    { course: 'PHYS 1122',   date: '2026-05-13', start: '09:40', end: '10:30' },
    { course: 'PHYS 1121',   date: '2026-05-13', start: '12:40', end: '13:30' },
    { course: 'SE 2230',     date: '2026-05-13', start: '17:40', end: '18:30' },
    { course: 'MATH 2261',   date: '2026-05-14', start: '10:40', end: '11:30' },
    { course: 'MATH 2263',   date: '2026-05-14', start: '10:40', end: '11:30' },
    { course: 'SE 1105',     date: '2026-05-14', start: '13:40', end: '14:30' },
    { course: 'SE 1108',     date: '2026-05-14', start: '16:40', end: '17:30' },
    { course: 'MATH 1131',   date: '2026-05-15', start: '08:40', end: '09:30' },
    { course: 'MATH 1132',   date: '2026-05-15', start: '10:40', end: '11:30' },
    { course: 'UMFD 1720',   date: '2026-05-15', start: '15:40', end: '16:30' },
    { course: 'SE 2228',     date: '2026-05-16', start: '10:40', end: '11:30' },
    { course: 'COMP 3330',   date: '2026-05-16', start: '13:40', end: '14:30' },
    { course: 'SE 2226',     date: '2026-05-18', start: '11:40', end: '12:30' },
    { course: 'MATH 2260',   date: '2026-05-18', start: '13:40', end: '14:30' },
    // May 19 = 19 Mayıs national holiday, no exams
    { course: 'ENGR 3450',   date: '2026-05-20', start: '09:40', end: '10:30' },
    { course: 'COMP 1202',   date: '2026-05-20', start: '12:40', end: '13:30' },
    { course: 'EEE 2110',    date: '2026-05-21', start: '09:40', end: '10:30' },
    { course: 'MATH 1100',   date: '2026-05-21', start: '12:40', end: '13:30' },
    { course: 'ENGR 4400',   date: '2026-05-22', start: '14:40', end: '15:30', note: 'Online' },
  ],

  'bilgisayar-muhendisligi': [
    { course: 'MATH 2230',  date: '2026-05-11', start: '09:40', end: '10:30' },
    { course: 'MATH 2255',  date: '2026-05-11', start: '10:40', end: '11:30' },
    { course: 'COMP 4350',  date: '2026-05-11', start: '12:40', end: '13:30' },
    { course: 'SOFL 1102',  date: '2026-05-11', start: '15:40', end: '16:30' },
    { course: 'COMP 4480',  date: '2026-05-12', start: '09:40', end: '10:30' },
    { course: 'SOFL 1101',  date: '2026-05-12', start: '11:40', end: '12:30' },
    { course: 'COMP 2215',  date: '2026-05-12', start: '14:40', end: '15:30' },
    { course: 'PHYS 1122',  date: '2026-05-13', start: '09:40', end: '10:30' },
    { course: 'PHYS 1121',  date: '2026-05-13', start: '12:40', end: '13:30' },
    { course: 'MATH 2261',  date: '2026-05-14', start: '10:40', end: '11:30' },
    { course: 'MATH 2263',  date: '2026-05-14', start: '10:40', end: '11:30' },
    { course: 'COMP 3328',  date: '2026-05-14', start: '13:40', end: '14:30' },
    { course: 'SE 1105',    date: '2026-05-14', start: '13:40', end: '14:30' },
    { course: 'COMP 4318',  date: '2026-05-14', start: '16:40', end: '17:30' },
    { course: 'MATH 1131',  date: '2026-05-15', start: '08:40', end: '09:30' },
    { course: 'MATH 1132',  date: '2026-05-15', start: '10:40', end: '11:30' },
    { course: 'UMFD 1720',  date: '2026-05-15', start: '15:40', end: '16:30' },
    { course: 'SE 2228',    date: '2026-05-16', start: '10:40', end: '11:30' },
    { course: 'COMP 3330',  date: '2026-05-16', start: '13:40', end: '14:30' },
    { course: 'COMP 3323',  date: '2026-05-18', start: '10:40', end: '11:30' },
    { course: 'MATH 2260',  date: '2026-05-18', start: '13:40', end: '14:30' },
    { course: 'COMP 4440',  date: '2026-05-18', start: '15:40', end: '16:30' },
    // May 19 = 19 Mayıs national holiday
    { course: 'ENGR 3450',  date: '2026-05-20', start: '09:40', end: '10:30' },
    { course: 'COMP 1202',  date: '2026-05-20', start: '12:40', end: '13:30' },
    { course: 'EEE 2110',   date: '2026-05-21', start: '09:40', end: '10:30' },
    { course: 'MATH 1100',  date: '2026-05-21', start: '12:40', end: '13:30' },
    { course: 'ENGR 4400',  date: '2026-05-22', start: '14:40', end: '15:30', note: 'Online' },
  ],

  'elektrik-elektronik-muhendisligi': [
    { course: 'MATH 2230',  date: '2026-05-11', start: '09:40', end: '10:30' },
    { course: 'MATH 2255',  date: '2026-05-11', start: '10:40', end: '11:30' },
    { course: 'EEE 3134',   date: '2026-05-11', start: '12:40', end: '13:30' },
    { course: 'SOFL 1102',  date: '2026-05-11', start: '15:40', end: '16:30' },
    { course: 'MATH 2259',  date: '2026-05-12', start: '09:40', end: '10:30' },
    { course: 'SOFL 1101',  date: '2026-05-12', start: '11:40', end: '12:30' },
    { course: 'PHYS 1122',  date: '2026-05-13', start: '09:40', end: '10:30' },
    { course: 'PHYS 1121',  date: '2026-05-13', start: '12:40', end: '13:30' },
    { course: 'EEE 2426',   date: '2026-05-13', start: '14:40', end: '15:30' },
    { course: 'EEE 4231',   date: '2026-05-13', start: '17:40', end: '18:30' },
    { course: 'MATH 2261',  date: '2026-05-14', start: '10:40', end: '11:30' },
    { course: 'MATH 2263',  date: '2026-05-14', start: '10:40', end: '11:30' },
    { course: 'EEE 3718',   date: '2026-05-14', start: '10:40', end: '11:30' },
    { course: 'EEE 4515',   date: '2026-05-14', start: '14:40', end: '15:30' },
    { course: 'MATH 1131',  date: '2026-05-15', start: '08:40', end: '09:30' },
    { course: 'MATH 1132',  date: '2026-05-15', start: '10:40', end: '11:30' },
    { course: 'UMFD 1720',  date: '2026-05-15', start: '15:40', end: '16:30' },
    { course: 'EEE 3638',   date: '2026-05-16', start: '10:40', end: '11:30' },
    { course: 'ENGR 1115',  date: '2026-05-18', start: '09:40', end: '10:30' },
    { course: 'EEE 3524',   date: '2026-05-18', start: '13:40', end: '14:30' },
    { course: 'EEE 2011',   date: '2026-05-18', start: '16:40', end: '17:30' },
    { course: 'EEE 2022',   date: '2026-05-18', start: '17:40', end: '18:30' },
    // May 19 = 19 Mayıs national holiday
    { course: 'ENGR 3450',  date: '2026-05-20', start: '09:40', end: '10:30' },
    { course: 'EEE 2214',   date: '2026-05-20', start: '12:40', end: '13:30' },
    { course: 'CHEM 1130',  date: '2026-05-20', start: '16:40', end: '17:30' },
    { course: 'EEE 2110',   date: '2026-05-21', start: '09:40', end: '10:30' },
    { course: 'MATH 1100',  date: '2026-05-21', start: '13:40', end: '14:30' },
    { course: 'EEE 3513',   date: '2026-05-21', start: '16:40', end: '17:30' },
    { course: 'ENGR 4400',  date: '2026-05-22', start: '14:40', end: '15:30', note: 'Online' },
  ],
}

export function getExamForCourse(deptSlug, courseCode) {
  const schedule = EXAM_SCHEDULES[deptSlug] ?? []
  return schedule.find(e => e.course === courseCode) ?? null
}

export function getExamsByDept(deptSlug) {
  return EXAM_SCHEDULES[deptSlug] ?? []
}
