const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const SHORT_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const NUMBER_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

const COMPANY_LABELS = {
  l4_servicos: 'L4 Servi\u00e7os',
  l4_pro_service: 'L4 Pr\u00f3 Service',
}

const CATEGORY_LABELS = {
  vigilante: 'Vigilante',
  limpeza: 'Limpeza',
}

const LAUNCH_TYPE_LABELS = {
  fixo: 'Turno Fixo',
  eventual: 'Turno Eventual',
}

const EVENTUAL_REASON_LABELS = {
  hora_extra: 'Hora extra',
  falta_sem_atestado: 'Falta sem atestado',
  falta_com_atestado: 'Falta com atestado',
  cobertura_avulsa: 'Cobertura avulsa',
  contratado_eventual: 'Contratado eventual',
}

function toValidDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(value, { short = false } = {}) {
  const date = toValidDate(value)
  if (!date) return '-'

  return short
    ? SHORT_DATE_TIME_FORMATTER.format(date)
    : DATE_TIME_FORMATTER.format(date)
}

export function formatDate(value) {
  const date = toValidDate(value)
  if (!date) return '-'
  return DATE_FORMATTER.format(date)
}

export function formatHours(value) {
  const amount = Number(value || 0)
  return `${NUMBER_FORMATTER.format(amount)} h`
}

export function formatCompany(value) {
  return COMPANY_LABELS[String(value || '').trim()] || 'N\u00e3o informada'
}

export function formatCategory(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return CATEGORY_LABELS[normalized] || 'N\u00e3o informada'
}

export function formatLaunchType(value, fallback = '') {
  const normalized = String(value || '').trim().toLowerCase()
  return LAUNCH_TYPE_LABELS[normalized] || fallback || 'Lan\u00e7amento'
}

export function formatEventualReason(value, fallback = '') {
  const normalized = String(value || '').trim().toLowerCase()
  return EVENTUAL_REASON_LABELS[normalized] || fallback || ''
}

export function formatText(value, fallback = 'N\u00e3o informado') {
  const normalized = String(value || '').trim()
  return normalized || fallback
}
