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

const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})

const NUMBER_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

const COMPANY_LABELS = {
  l4_servicos: 'L4 Serviços',
  l4_pro_service: 'L4 Pró Service',
}

const CATEGORY_LABELS = {
  vigilante: 'Controle de Acesso',
  controle_de_acesso: 'Controle de Acesso',
  controledeacesso: 'Controle de Acesso',
  limpeza: 'Limpeza',
  manutencao: 'Manutenção',
}

const LAUNCH_TYPE_LABELS = {
  fixo: 'Turno Fixo',
  eventual: 'Lançamento Eventual',
}

const EVENTUAL_REASON_LABELS = {
  hora_extra: 'Hora extra',
  falta_sem_atestado: 'Falta sem atestado',
  falta_com_atestado: 'Falta com atestado',
  cobertura_avulsa: 'Cobertura avulsa',
  contratado_eventual: 'Contratado eventual',
}

function toValidDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const text = String(value || '').trim()
  if (!text) return null

  if (/^\d{4}-\d{2}$/.test(text)) {
    const [year, month] = text.split('-').map(Number)
    return new Date(year, month - 1, 1)
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeWords(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatDateTime(value, { short = false } = {}) {
  const date = toValidDate(value)
  if (!date) return '-'

  return short ? SHORT_DATE_TIME_FORMATTER.format(date) : DATE_TIME_FORMATTER.format(date)
}

export function formatDate(value) {
  const date = toValidDate(value)
  if (!date) return '-'
  return DATE_FORMATTER.format(date)
}

export function formatMonth(value) {
  const date = toValidDate(value)
  if (!date) return '-'
  return MONTH_FORMATTER.format(date)
}

export function formatHours(value) {
  const amount = Number(value || 0)
  return `${NUMBER_FORMATTER.format(amount)} h`
}

export function formatNumber(value) {
  return NUMBER_FORMATTER.format(Number(value || 0))
}

export function formatCompany(value) {
  return COMPANY_LABELS[String(value || '').trim()] || 'Não informada'
}

export function formatCategory(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

  return CATEGORY_LABELS[normalized] || normalizeWords(value) || 'Não informada'
}

export function formatLaunchType(value, fallback = '') {
  const normalized = String(value || '').trim().toLowerCase()
  return LAUNCH_TYPE_LABELS[normalized] || fallback || 'Lançamento'
}

export function formatEventualReason(value, fallback = '') {
  const normalized = String(value || '').trim().toLowerCase()
  return EVENTUAL_REASON_LABELS[normalized] || fallback || ''
}

export function formatText(value, fallback = 'Não informado') {
  const normalized = String(value || '').trim()
  return normalized || fallback
}
