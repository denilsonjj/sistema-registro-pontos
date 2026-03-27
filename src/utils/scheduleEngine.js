const SHIFT_DEFINITIONS = [
  {
    id: '12x36_dia_par',
    label: '12x36 Dia Par',
    family: '12x36',
    parity: 'even',
    start: '07:00',
    end: '19:00',
  },
  {
    id: '12x36_dia_impar',
    label: '12x36 Dia Impar',
    family: '12x36',
    parity: 'odd',
    start: '07:00',
    end: '19:00',
  },
  {
    id: '12x36_noite_par',
    label: '12x36 Noite Par',
    family: '12x36',
    parity: 'even',
    start: '19:00',
    end: '07:00',
  },
  {
    id: '12x36_noite_impar',
    label: '12x36 Noite Impar',
    family: '12x36',
    parity: 'odd',
    start: '19:00',
    end: '07:00',
  },
  {
    id: '5x2_padrao',
    label: '5x2 (Seg-Sex 08:00-17:00)',
    family: '5x2',
    weekdayStart: '08:00',
    weekdayEnd: '17:00',
  },
  {
    id: '6x1_10_19_sab_07_13',
    label: '6x1 10:00-19:00 (Sab 07:00-13:00)',
    family: '6x1',
    weekdayStart: '10:00',
    weekdayEnd: '19:00',
    saturdayStart: '07:00',
    saturdayEnd: '13:00',
  },
  {
    id: '6x1_06_15_sab_07_13',
    label: '6x1 06:00-15:00 (Sab 07:00-13:00)',
    family: '6x1',
    weekdayStart: '06:00',
    weekdayEnd: '15:00',
    saturdayStart: '07:00',
    saturdayEnd: '13:00',
  },
  {
    id: '6x1_07_16_sab_07_13',
    label: '6x1 07:00-16:00 (Sab 07:00-13:00)',
    family: '6x1',
    weekdayStart: '07:00',
    weekdayEnd: '16:00',
    saturdayStart: '07:00',
    saturdayEnd: '13:00',
  },
  {
    id: '6x1_08_17_sab_07_13',
    label: '6x1 08:00-17:00 (Sab 07:00-13:00)',
    family: '6x1',
    weekdayStart: '08:00',
    weekdayEnd: '17:00',
    saturdayStart: '07:00',
    saturdayEnd: '13:00',
  },
  {
    id: '6x1_06_15_sab_04_13',
    label: '6x1 06:00-15:00 (Sab 04:00-13:00)',
    family: '6x1',
    weekdayStart: '06:00',
    weekdayEnd: '15:00',
    saturdayStart: '04:00',
    saturdayEnd: '13:00',
  },
  {
    id: '6x1_07_16_sab_08_14',
    label: '6x1 07:00-16:00 (Sab 08:00-14:00)',
    family: '6x1',
    weekdayStart: '07:00',
    weekdayEnd: '16:00',
    saturdayStart: '08:00',
    saturdayEnd: '14:00',
  },
  {
    id: '6x1_08_17_sab_08_14',
    label: '6x1 08:00-17:00 (Sab 08:00-14:00)',
    family: '6x1',
    weekdayStart: '08:00',
    weekdayEnd: '17:00',
    saturdayStart: '08:00',
    saturdayEnd: '14:00',
  },
  {
    id: '6x1_10_19_sab_08_14',
    label: '6x1 10:00-19:00 (Sab 08:00-14:00)',
    family: '6x1',
    weekdayStart: '10:00',
    weekdayEnd: '19:00',
    saturdayStart: '08:00',
    saturdayEnd: '14:00',
  },
]

const SHIFT_MAP = SHIFT_DEFINITIONS.reduce((accumulator, shift) => {
  accumulator[shift.id] = shift
  return accumulator
}, {})

function normalizeFamily(value) {
  const family = String(value || '').toLowerCase().trim()

  if (family === '12x36') return '12x36'
  if (family === '5x2') return '5x2'
  if (family === '6x1') return '6x1'

  return ''
}

function normalizeParity(value) {
  const parity = String(value || '').toLowerCase().trim()

  if (parity === 'par' || parity === 'even') return 'even'
  if (parity === 'impar' || parity === 'odd') return 'odd'

  return ''
}

export function normalizeShiftForEngine(shift) {
  if (!shift) return null

  const family = normalizeFamily(shift.family || shift.familia)
  const start = String(shift.start || shift.weekdayStart || shift.entrada || '').trim()
  const end = String(shift.end || shift.weekdayEnd || shift.saida || '').trim()
  const saturdayStart = String(
    shift.saturdayStart || shift.sabStart || shift.sabEntrada || shift.entrada_sabado || '',
  ).trim()
  const saturdayEnd = String(
    shift.saturdayEnd || shift.sabEnd || shift.sabSaida || shift.saida_sabado || '',
  ).trim()
  const parity = normalizeParity(shift.parity || shift.paridade)

  if (!family) return null

  if (family === '12x36' && (!start || !end || !parity)) {
    return null
  }

  if (family === '5x2' && (!start || !end)) {
    return null
  }

  if (family === '6x1' && (!start || !end || !saturdayStart || !saturdayEnd)) {
    return null
  }

  return {
    id: String(shift.id || shift.id_turno || shift.shiftId || ''),
    family,
    parity,
    weekdayStart: start,
    weekdayEnd: end,
    saturdayStart,
    saturdayEnd,
    start,
    end,
  }
}

function toIsoDate(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function createOffEntry(date) {
  return {
    date: toIsoDate(date),
    status: 'FOLGA',
    start: null,
    end: null,
  }
}

function createWorkingEntry(date, start, end) {
  return {
    date: toIsoDate(date),
    status: 'TRABALHO',
    start,
    end,
  }
}

function resolve12x36(date, shift) {
  const dayIsEven = date.getDate() % 2 === 0
  const shouldWork =
    (shift.parity === 'even' && dayIsEven) ||
    (shift.parity === 'odd' && !dayIsEven)

  if (!shouldWork) {
    return createOffEntry(date)
  }

  return createWorkingEntry(date, shift.start, shift.end)
}

function resolve5x2(date, shift) {
  const dayOfWeek = date.getDay()
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5

  if (!isWeekday) {
    return createOffEntry(date)
  }

  return createWorkingEntry(date, shift.weekdayStart, shift.weekdayEnd)
}

function resolve6x1(date, shift) {
  const dayOfWeek = date.getDay()

  if (dayOfWeek === 0) {
    return createOffEntry(date)
  }

  if (dayOfWeek === 6) {
    return createWorkingEntry(date, shift.saturdayStart, shift.saturdayEnd)
  }

  return createWorkingEntry(date, shift.weekdayStart, shift.weekdayEnd)
}

function resolveShiftEntry(date, shift) {
  if (shift.family === '12x36') {
    return resolve12x36(date, shift)
  }

  if (shift.family === '5x2') {
    return resolve5x2(date, shift)
  }

  if (shift.family === '6x1') {
    return resolve6x1(date, shift)
  }

  return createOffEntry(date)
}

export function generateBatchSchedule({ shiftId, startDate, days, shiftData }) {
  const normalizedDays = Number(days)
  const normalizedShift = normalizeShiftForEngine(shiftData)
  const knownShift = shiftId ? SHIFT_MAP[shiftId] : null

  if (!normalizedShift && (!shiftId || !knownShift)) {
    return []
  }

  if (!Number.isFinite(normalizedDays)) {
    return []
  }

  const totalDays = Math.max(0, Math.floor(normalizedDays))
  const firstDay = startDate ? new Date(`${startDate}T00:00:00`) : new Date()

  if (Number.isNaN(firstDay.getTime())) {
    return []
  }

  return Array.from({ length: totalDays }, (_, index) => {
    const targetDate = addDays(firstDay, index)
    const shift = normalizedShift || knownShift
    return resolveShiftEntry(targetDate, shift)
  })
}

export const SHIFT_TEMPLATES = SHIFT_DEFINITIONS.reduce((accumulator, shift) => {
  accumulator[shift.id] = {
    name: shift.label,
    family: shift.family,
    parity:
      shift.parity === 'even' ? 'par' : shift.parity === 'odd' ? 'impar' : '',
    start: shift.start || shift.weekdayStart || '',
    end: shift.end || shift.weekdayEnd || '',
    sabStart: shift.saturdayStart || '',
    sabEnd: shift.saturdayEnd || '',
  }
  return accumulator
}, {})

export const SHIFT_OPTIONS = SHIFT_DEFINITIONS.map((shift) => ({ ...shift }))
