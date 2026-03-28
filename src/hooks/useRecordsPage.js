import { useCallback, useEffect, useMemo, useState } from 'react'
import { getRecentRecords, updateScaleLaunch } from '../services/appsScriptApi'

const DEFAULT_COMPANY_FILTER = 'all'
const DEFAULT_PERIOD_FILTER = 'day'

function normalizeRecentRecord(record) {
  const launchId = String(
    record.id_lancamento || record.launchId || record.id || '',
  ).trim()
  const launchType = String(
    record.tipo_lancamento || record.launchType || '',
  ).trim()

  return {
    id: launchId || crypto.randomUUID(),
    launchId,
    createdAt: String(record.criado_em || record.createdAt || new Date().toISOString()),
    company: String(record.empresa || record.company || ''),
    employeeName: String(record.nome_funcionario || record.employeeName || 'N\u00e3o informado'),
    employeeCategory: String(record.categoria_funcionario || record.employeeCategory || 'N\u00e3o informado'),
    postName: String(record.nome_posto || record.postName || 'N\u00e3o informado'),
    shiftName: String(record.nome_turno || record.shiftName || 'N\u00e3o informado'),
    launchType,
    launchTypeLabel: String(
      record.tipo_lancamento_label ||
        record.launchTypeLabel ||
        (launchType === 'fixo' ? 'Turno Fixo' : 'Turno Eventual'),
    ),
    eventualReason: String(record.motivo_eventual || record.eventualReason || ''),
    eventualReasonLabel: String(
      record.motivo_eventual_label || record.eventualReasonLabel || '',
    ),
    eventualDate: String(record.data_eventual || record.eventualDate || ''),
    generatedEntries: Number(record.registros_gerados || record.generatedEntries || 0),
    batchDays: record.dias_lote || record.batchDays ? Number(record.dias_lote || record.batchDays) : null,
    extraHours: Number(record.hora_extra || record.extraHours || 0),
    lunchDiscount: Number(record.desconto_almoco || record.lunchDiscount || 0),
  }
}

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function resolveRangeStart(period) {
  const now = new Date()
  const base = startOfDay(now)

  if (period === 'week') {
    const day = base.getDay()
    const diff = day === 0 ? 6 : day - 1
    base.setDate(base.getDate() - diff)
    return base
  }

  if (period === 'month') {
    return new Date(base.getFullYear(), base.getMonth(), 1)
  }

  return base
}

function withinPeriod(recordDate, period) {
  const date = new Date(recordDate)
  if (Number.isNaN(date.getTime())) return false

  const start = resolveRangeStart(period)
  return date.getTime() >= start.getTime()
}

export function useRecordsPage({ enabled = true }) {
  const [records, setRecords] = useState([])
  const [periodFilter, setPeriodFilter] = useState(DEFAULT_PERIOD_FILTER)
  const [companyFilter, setCompanyFilter] = useState(DEFAULT_COMPANY_FILTER)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadRecords = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await getRecentRecords({
        company: companyFilter === 'all' ? '' : companyFilter,
        limit: 300,
      })
      const rows = Array.isArray(response?.data?.records)
        ? response.data.records
        : []

      setRecords(rows.map(normalizeRecentRecord))
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Falha ao carregar registros.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [companyFilter, enabled])

  useEffect(() => {
    if (!enabled) return
    loadRecords()
  }, [enabled, loadRecords])

  const filteredRecords = useMemo(
    () => records.filter((record) => withinPeriod(record.createdAt, periodFilter)),
    [periodFilter, records],
  )

  const saveRecordChanges = async ({ launchId, data }) => {
    if (!launchId) {
      setError('Registro inv\u00e1lido para edi\u00e7\u00e3o.')
      return false
    }

    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      await updateScaleLaunch({ launchId, data })
      setMessage('Registro atualizado na planilha.')
      await loadRecords()
      return true
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Falha ao atualizar registro.',
      )
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    records: filteredRecords,
    isLoading,
    isSaving,
    error,
    message,
    filters: {
      period: periodFilter,
      company: companyFilter,
    },
    actions: {
      setPeriodFilter,
      setCompanyFilter,
      loadRecords,
      saveRecordChanges,
    },
  }
}
