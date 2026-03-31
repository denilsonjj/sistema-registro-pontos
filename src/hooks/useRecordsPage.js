import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getRecordsReport,
  updateScaleEntry,
  updateScaleLaunch,
} from '../services/appsScriptApi'

const DEFAULT_COMPANY_FILTER = 'all'
const DEFAULT_PERIOD_FILTER = 'all'

function currentDateValue() {
  return new Date().toISOString().slice(0, 10)
}

function buildDefaultFilters() {
  return {
    period: DEFAULT_PERIOD_FILTER,
    company: DEFAULT_COMPANY_FILTER,
    date: currentDateValue(),
    month: '',
    employeeId: 'all',
    postId: 'all',
  }
}

function safeId(...values) {
  const value = values.find((item) => String(item || '').trim())
  return String(value || '').trim()
}

function parseLocalDate(value) {
  const text = String(value || '').trim()
  if (!text) return null

  if (/^\d{5}(?:\.\d+)?$/.test(text)) {
    // Numero serial do Google Sheets (dias desde 1899-12-30)
    const serial = Number(text)
    const utcDays = Math.floor(serial - 25569)
    const date = new Date(utcDays * 86400 * 1000)
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  }

  const yearFirstMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/)
  if (yearFirstMatch) {
    const [, yearText, monthText, dayText] = yearFirstMatch
    return new Date(Number(yearText), Number(monthText) - 1, Number(dayText))
  }

  const dayFirstMatch = text.match(/^(\d{2})[/-](\d{2})[/-](\d{4})(?:\s.*)?$/)
  if (dayFirstMatch) {
    const [, dayText, monthText, yearText] = dayFirstMatch
    return new Date(Number(yearText), Number(monthText) - 1, Number(dayText))
  }

  if (/^\d{4}-\d{2}$/.test(text)) {
    const [year, month] = text.split('-').map(Number)
    return new Date(year, month - 1, 1)
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeRecord(record) {
  const launchId = safeId(record.id_lancamento, record.launchId, record.id)
  const scaleId = safeId(record.id_escala, record.scaleId)
  const launchType = String(record.tipo_lancamento || record.launchType || '').trim()
  const scaleDate = String(record.data || record.date || '').trim()

  return {
    id: scaleId || launchId || crypto.randomUUID(),
    scaleId,
    launchId,
    createdAt: String(record.criado_em || record.createdAt || new Date().toISOString()),
    date: scaleDate,
    startDate: String(record.data_inicio || record.startDate || ''),
    eventualDate: String(record.data_eventual || record.eventualDate || ''),
    company: String(record.empresa || record.company || ''),
    employeeId: safeId(record.id_funcionario, record.employeeId),
    employeeName: String(record.nome_funcionario || record.employeeName || 'Nao informado'),
    employeeCategory: String(
      record.categoria_funcionario || record.employeeCategory || 'Nao informado',
    ),
    postId: safeId(record.id_posto, record.postId),
    postName: String(record.nome_posto || record.postName || 'Nao informado'),
    shiftId: safeId(record.id_turno, record.shiftId),
    shiftName: String(record.nome_turno || record.shiftName || 'Nao informado'),
    launchType,
    launchTypeLabel: String(
      record.tipo_lancamento_label ||
        record.launchTypeLabel ||
        (launchType === 'fixo' ? 'Turno Fixo' : 'Lancamento Eventual'),
    ),
    status: String(record.status || ''),
    origin: String(record.origem || record.origin || ''),
    start: String(record.inicio || record.start || ''),
    end: String(record.fim || record.end || ''),
    eventualReason: String(record.motivo_eventual || record.eventualReason || ''),
    eventualReasonLabel: String(
      record.motivo_eventual_label || record.eventualReasonLabel || '',
    ),
    generatedEntries: Number(record.registros_gerados || record.generatedEntries || 0),
    batchDays:
      record.dias_lote || record.batchDays
        ? Number(record.dias_lote || record.batchDays)
        : null,
    extraHours: Number(record.hora_extra || record.extraHours || 0),
    lunchDiscount: Number(record.desconto_almoco || record.lunchDiscount || 0),
    mealAllowance: Number(record.vale || record.mealAllowance || 0),
    discountReason: String(record.motivo_desconto || record.discountReason || ''),
  }
}

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function resolveRange(period, referenceDate) {
  const anchor = startOfDay(referenceDate || new Date())

  if (period === 'day') {
    return {
      start: anchor,
      end: new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 1),
    }
  }

  if (period === 'week') {
    const start = new Date(anchor)
    const day = start.getDay()
    const diff = day === 0 ? 6 : day - 1
    start.setDate(start.getDate() - diff)
    return {
      start,
      end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7),
    }
  }

  if (period === 'month') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    return {
      start,
      end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1),
    }
  }

  return null
}

function monthMatches(recordDate, month) {
  if (!month) return true
  const date = parseLocalDate(recordDate)
  if (!date) return false
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === month
}

function withinPeriod(recordDate, period, referenceDateText) {
  if (period === 'all') return true

  const date = parseLocalDate(recordDate)
  if (!date) return false

  const anchorDate = parseLocalDate(referenceDateText) || new Date()
  const range = resolveRange(period, anchorDate)
  if (!range) return true

  const normalized = startOfDay(date).getTime()
  return normalized >= range.start.getTime() && normalized < range.end.getTime()
}

function resolveMonthFilter(filters) {
  if (filters.period !== 'month') return ''
  if (filters.month) return filters.month
  return String(filters.date || currentDateValue()).slice(0, 7)
}

export function useRecordsPage({ enabled = true, directoryOptions = {} }) {
  const [records, setRecords] = useState([])
  const [draftFilters, setDraftFilters] = useState(buildDefaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(buildDefaultFilters)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [source, setSource] = useState('recordsreport')

  const employeeLookup = useMemo(() => {
    const map = new Map()
    ;(directoryOptions.employees || []).forEach((employee) => {
      map.set(employee.id, employee.label)
    })
    return map
  }, [directoryOptions.employees])

  const postLookup = useMemo(() => {
    const map = new Map()
    ;(directoryOptions.posts || []).forEach((post) => {
      map.set(post.id, post.label)
    })
    return map
  }, [directoryOptions.posts])

  const updateFilter = useCallback((field, value) => {
    setDraftFilters((previous) => ({ ...previous, [field]: value }))
  }, [])

  const loadRecords = useCallback(
    async (nextFilters = draftFilters) => {
      if (!enabled) return false

      setIsLoading(true)
      setError('')
      setMessage('')

      try {
        const monthParam = resolveMonthFilter(nextFilters)

        const baseParams = {
          company: nextFilters.company === 'all' ? '' : nextFilters.company,
          employeeId: nextFilters.employeeId === 'all' ? '' : nextFilters.employeeId,
          postId: nextFilters.postId === 'all' ? '' : nextFilters.postId,
          limit: 800,
        }

        const response = await getRecordsReport({
          ...baseParams,
          month: monthParam,
        })

        let rows = Array.isArray(response?.data?.records) ? response.data.records : []

        // Alguns Apps Script retornam vazio quando o filtro de mes vem direto no backend
        // por causa de formato inconsistente em `data`. Recarrega sem mes e filtra no front.
        if (monthParam && rows.length === 0) {
          const fallbackResponse = await getRecordsReport({
            ...baseParams,
            month: '',
          })
          rows = Array.isArray(fallbackResponse?.data?.records)
            ? fallbackResponse.data.records
            : []
        }

        setSource('recordsreport')

        setAppliedFilters(nextFilters)
        setRecords(rows.map(normalizeRecord))
        setHasLoaded(true)
        return true
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Falha ao carregar registros.',
        )
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [draftFilters, enabled],
  )

  useEffect(() => {
    if (!enabled || hasLoaded || isLoading) return
    void loadRecords(buildDefaultFilters())
  }, [enabled, hasLoaded, isLoading, loadRecords])

  const filteredRecords = useMemo(() => {
    if (!hasLoaded) return []

    return records.filter((record) => {
      const dateValue = record.date
      const selectedEmployeeLabel = employeeLookup.get(appliedFilters.employeeId)
      const selectedPostLabel = postLookup.get(appliedFilters.postId)
      const companyMatches =
        appliedFilters.company === 'all' || record.company === appliedFilters.company
      const employeeMatches =
        appliedFilters.employeeId === 'all' ||
        record.employeeId === appliedFilters.employeeId ||
        String(record.employeeName || '').trim().toLowerCase() ===
          String(selectedEmployeeLabel || '').trim().toLowerCase()
      const postMatches =
        appliedFilters.postId === 'all' ||
        record.postId === appliedFilters.postId ||
        String(record.postName || '').trim().toLowerCase() ===
          String(selectedPostLabel || '').trim().toLowerCase()
      const monthParam = resolveMonthFilter(appliedFilters)
      const monthOk = monthMatches(dateValue, monthParam)
      const periodOk = withinPeriod(dateValue, appliedFilters.period, appliedFilters.date)

      return companyMatches && employeeMatches && postMatches && monthOk && periodOk
    })
  }, [appliedFilters, employeeLookup, hasLoaded, postLookup, records])

  const saveRecordChanges = async ({ launchId, scaleId, launchData, scaleData }) => {
    if (!launchId && !scaleId) {
      setError('Registro invalido para edicao.')
      return false
    }

    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      if (launchId && launchData) {
        await updateScaleLaunch({ launchId, data: launchData })
      }

      if (scaleId && scaleData) {
        await updateScaleEntry({ scaleId, data: scaleData })
      }

      setMessage('Registro atualizado na planilha.')
      await loadRecords(appliedFilters)
      return true
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Falha ao atualizar registro.',
      )
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    records: filteredRecords,
    allRecords: records,
    isLoading,
    isSaving,
    hasLoaded,
    error,
    message,
    source,
    filters: draftFilters,
    appliedFilters,
    actions: {
      setPeriodFilter: (value) => updateFilter('period', value),
      setCompanyFilter: (value) => updateFilter('company', value),
      setDateFilter: (value) => updateFilter('date', value),
      setMonthFilter: (value) => updateFilter('month', value),
      setEmployeeFilter: (value) => updateFilter('employeeId', value),
      setPostFilter: (value) => updateFilter('postId', value),
      loadRecords: () => loadRecords(draftFilters),
      saveRecordChanges,
    },
  }
}
