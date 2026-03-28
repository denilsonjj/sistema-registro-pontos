import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BATCH_DAYS_OPTIONS,
  EMPLOYEE_CATEGORY_OPTIONS,
  EVENTUAL_REASON_OPTIONS,
  INITIAL_EMPLOYEES,
  INITIAL_POSTS,
  INITIAL_SHIFTS,
  LAUNCH_TYPE_OPTIONS,
} from '../data/seedData'
import {
  createLookupItem,
  createScaleLaunch,
  getBootstrapData,
  getRecentRecords,
} from '../services/appsScriptApi'
import { fileToBase64 } from '../utils/fileToBase64'
import { generateBatchSchedule } from '../utils/scheduleEngine'

const DEFAULT_FORM = {
  company: 'l4_servicos',
  employeeCategory: 'vigilante',
  employeeId: '',
  postId: '',
  shiftId: '',
  launchType: 'fixo',
  eventualReason: 'hora_extra',
  eventualDate: new Date().toISOString().slice(0, 10),
  batchDays: 30,
  startDate: new Date().toISOString().slice(0, 10),
  extraHours: '',
  lunchDiscount: '',
  attachment: null,
}

const DEFAULT_SEARCH = {
  employee: '',
}

function normalizeId(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function ensureUniqueId(baseId, items) {
  const ids = new Set(items.map((item) => item.id))

  if (!ids.has(baseId)) {
    return baseId
  }

  let suffix = 2
  let candidate = `${baseId}-${suffix}`

  while (ids.has(candidate)) {
    suffix += 1
    candidate = `${baseId}-${suffix}`
  }

  return candidate
}

function normalizeCategory(category) {
  const raw = String(category || '').toLowerCase().trim()
  if (raw === 'limpeza') return 'limpeza'
  return 'vigilante'
}

function normalizeShiftFamily(value) {
  const family = String(value || '').toLowerCase().trim()
  if (family === '12x36') return '12x36'
  if (family === '5x2') return '5x2'
  if (family === '6x1') return '6x1'
  return ''
}

function normalizeShiftParity(value) {
  const parity = String(value || '').toLowerCase().trim()
  if (parity === 'par' || parity === 'even') return 'par'
  if (parity === 'impar' || parity === 'odd') return 'impar'
  return ''
}

function mapEmployees(rows) {
  return rows
    .map((row) => {
      const id = String(row.id_funcionario || row.employeeId || '').trim()
      if (!id) return null

      const category = normalizeCategory(row.categoria || row.category)
      return {
        id,
        label: String(row.nome || row.name || 'Sem nome'),
        role:
          String(row.cargo || row.role || '').trim() ||
          (category === 'limpeza' ? 'Limpeza' : 'Vigilante'),
        category,
        company: String(row.empresa || row.company || '').trim(),
        cpf: String(row.cpf || ''),
        startDate: String(row.data_inicio || row.dataInicio || row.startDate || ''),
      }
    })
    .filter(Boolean)
}

function mapPosts(rows) {
  return rows
    .map((row) => {
      const id = String(row.id_posto || row.postId || '').trim()
      if (!id) return null

      return {
        id,
        label: String(row.nome || row.name || 'Sem nome'),
        company: String(row.empresa || row.company || '').trim(),
      }
    })
    .filter(Boolean)
}

function mapShifts(rows) {
  return rows
    .map((row) => {
      const id = String(row.id_turno || row.shiftId || '').trim()
      if (!id) return null

      const family = normalizeShiftFamily(row.familia || row.family)
      return {
        id,
        label: String(row.nome || row.name || id),
        family,
        parity: normalizeShiftParity(row.paridade || row.parity),
        start: String(row.entrada || row.start || row.weekdayStart || ''),
        end: String(row.saida || row.end || row.weekdayEnd || ''),
        saturdayStart: String(
          row.entrada_sabado || row.sabEntrada || row.sabStart || row.saturdayStart || '',
        ),
        saturdayEnd: String(
          row.saida_sabado || row.sabSaida || row.sabEnd || row.saturdayEnd || '',
        ),
      }
    })
    .filter(Boolean)
}

function normalizeRecentRecord(record) {
  return {
    id: String(record.id || record.id_lancamento || record.launchId || crypto.randomUUID()),
    createdAt: String(record.criado_em || record.createdAt || new Date().toISOString()),
    employeeName: String(record.nome_funcionario || record.employeeName || 'N\u00e3o informado'),
    employeeCategory: String(record.categoria_funcionario || record.employeeCategory || 'N\u00e3o informado'),
    postName: String(record.nome_posto || record.postName || 'N\u00e3o informado'),
    shiftName: String(record.nome_turno || record.shiftName || 'N\u00e3o informado'),
    launchTypeLabel: String(
      record.tipo_lancamento_label ||
        record.launchTypeLabel ||
        record.tipo_lancamento ||
        record.launchType ||
        'Lan\u00e7amento',
    ),
    eventualReasonLabel: record.motivo_eventual_label || record.eventualReasonLabel
      ? String(record.motivo_eventual_label || record.eventualReasonLabel)
      : null,
    generatedEntries: Number(record.registros_gerados || record.generatedEntries || 0),
    batchDays: record.dias_lote || record.batchDays ? Number(record.dias_lote || record.batchDays) : null,
    extraHours: Number(record.hora_extra || record.extraHours || 0),
    lunchDiscount: Number(record.desconto_almoco || record.lunchDiscount || 0),
  }
}

function mapLookupItem(type, data, fallback) {
  if (!data) return fallback

  if (type === 'employee') {
    return {
      id: String(data.id_funcionario || data.employeeId || fallback.id),
      label: String(data.nome || data.name || fallback.label),
      role: String(data.cargo || data.role || fallback.role),
      category: normalizeCategory(data.categoria || data.category || fallback.category),
      company: String(data.empresa || data.company || fallback.company || ''),
      cpf: String(data.cpf || fallback.cpf || ''),
      startDate: String(data.data_inicio || data.dataInicio || data.startDate || fallback.startDate || ''),
    }
  }

  if (type === 'post') {
    return {
      id: String(data.id_posto || data.postId || fallback.id),
      label: String(data.nome || data.name || fallback.label),
      company: String(data.empresa || data.company || fallback.company || ''),
    }
  }

  if (type === 'shift') {
    return {
      id: String(data.id_turno || data.shiftId || fallback.id),
      label: String(data.nome || data.name || fallback.label),
      family: normalizeShiftFamily(data.familia || data.family || fallback.family),
      parity: normalizeShiftParity(data.paridade || data.parity || fallback.parity),
      start: String(data.entrada || data.start || data.weekdayStart || fallback.start || ''),
      end: String(data.saida || data.end || data.weekdayEnd || fallback.end || ''),
      saturdayStart: String(
        data.entrada_sabado ||
          data.sabEntrada ||
          data.sabStart ||
          data.saturdayStart ||
          fallback.saturdayStart ||
          '',
      ),
      saturdayEnd: String(
        data.saida_sabado ||
          data.sabSaida ||
          data.sabEnd ||
          data.saturdayEnd ||
          fallback.saturdayEnd ||
          '',
      ),
    }
  }

  return fallback
}

export function useScaleForm({ enabled = true } = {}) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [search, setSearch] = useState(DEFAULT_SEARCH)
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES)
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [shifts, setShifts] = useState(INITIAL_SHIFTS)
  const [modal, setModal] = useState({ isOpen: false, type: 'employee' })
  const [fileError, setFileError] = useState('')
  const [recentRecords, setRecentRecords] = useState([])
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingLookup, setIsSavingLookup] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [syncError, setSyncError] = useState('')

  const isBatchLaunch = form.launchType === 'fixo'
  const isEventualLaunch = form.launchType === 'eventual'
  const shouldShowUploadField =
    isEventualLaunch && form.eventualReason === 'falta_com_atestado'

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const categoryMatches = !form.employeeCategory || employee.category === form.employeeCategory
      const companyMatches = !employee.company || employee.company === form.company
      return categoryMatches && companyMatches
    })
  }, [employees, form.employeeCategory, form.company])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => !post.company || post.company === form.company)
  }, [posts, form.company])

  const loadRecent = useCallback(async (companyValue) => {
    try {
      const response = await getRecentRecords({
        company: companyValue || '',
        limit: 10,
      })
      const rows = Array.isArray(response?.data?.records)
        ? response.data.records
        : []
      setRecentRecords(rows.map(normalizeRecentRecord))
    } catch {
      // Mantem sem bloquear fluxo.
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setIsBootstrapping(false)
      return undefined
    }

    let isMounted = true

    async function bootstrap() {
      setIsBootstrapping(true)
      setSyncError('')
      setSyncMessage('')

      try {
        const response = await getBootstrapData()
        if (!isMounted) return

        const data = response.data || {}
        const remoteEmployees = mapEmployees(data.funcionarios || [])
        const remotePosts = mapPosts(data.postos || [])
        const remoteShifts = mapShifts(data.turnos || [])

        if (remoteEmployees.length) setEmployees(remoteEmployees)
        if (remotePosts.length) setPosts(remotePosts)
        if (remoteShifts.length) setShifts(remoteShifts)

        setSyncMessage('Conectado ao Google Sheets.')
        await loadRecent(DEFAULT_FORM.company)
      } catch (error) {
        if (!isMounted) return
        const reason =
          error instanceof Error ? ` Motivo: ${error.message}` : ''
        setSyncError(
          `N\u00e3o foi poss\u00edvel carregar dados da planilha. Usando dados locais.${reason}`,
        )
      } finally {
        if (isMounted) setIsBootstrapping(false)
      }
    }

    bootstrap()
    return () => {
      isMounted = false
    }
  }, [enabled, loadRecent])

  const updateField = (field, value) => {
    setForm((previous) => {
      if (field === 'company') {
        return {
          ...previous,
          company: value,
          employeeId: '',
          postId: '',
        }
      }

      if (field !== 'employeeCategory') {
        return { ...previous, [field]: value }
      }

      const selectedEmployeeStillValid = employees.some(
        (employee) =>
          employee.id === previous.employeeId && employee.category === value,
      )

      return {
        ...previous,
        employeeCategory: value,
        employeeId: selectedEmployeeStillValid ? previous.employeeId : '',
      }
    })
  }

  const setCompany = async (company) => {
    updateField('company', company)
    if (!enabled) return
    await loadRecent(company)
  }

  const setLaunchType = (launchType) => {
    setForm((previous) => {
      if (launchType !== 'eventual') {
        return {
          ...previous,
          launchType,
          attachment: null,
        }
      }

      return {
        ...previous,
        launchType,
        eventualReason: previous.eventualReason || 'hora_extra',
      }
    })

    if (launchType !== 'eventual') {
      setFileError('')
    }
  }

  const setEventualReason = (eventualReason) => {
    setForm((previous) => {
      const clearsAttachment = eventualReason !== 'falta_com_atestado'
      return {
        ...previous,
        eventualReason,
        attachment: clearsAttachment ? null : previous.attachment,
      }
    })

    if (eventualReason !== 'falta_com_atestado') {
      setFileError('')
    }
  }

  const setSearchValue = (scope, value) => {
    if (scope !== 'employee') {
      return
    }

    setSearch((previous) => ({ ...previous, [scope]: value }))
  }

  const openQuickAddModal = (type) => {
    setModal({ isOpen: true, type })
    setSyncError('')
    setSyncMessage('')
  }

  const closeQuickAddModal = () => {
    if (isSavingLookup) return
    setModal((previous) => ({ ...previous, isOpen: false }))
  }

  const saveQuickAdd = async (type, values) => {
    if (!enabled) {
      setSyncError('Sess\u00e3o inv\u00e1lida. Fa\u00e7a login novamente.')
      return false
    }

    const name = String(values.name || '').trim()

    if (!name) {
      setSyncError('Preencha o nome antes de salvar.')
      return false
    }

    setSyncError('')
    setSyncMessage('')
    setIsSavingLookup(true)

    try {
      if (type === 'employee') {
        const fallback = {
          id: ensureUniqueId(normalizeId(name), employees),
          label: name,
          role: values.role || 'Vigilante',
          category: values.category || 'vigilante',
          company: form.company,
          cpf: values.cpf || '',
          startDate: values.startDate || '',
        }

        const response = await createLookupItem(type, {
          name,
          role: fallback.role,
          category: fallback.category,
          cpf: fallback.cpf,
          startDate: fallback.startDate,
          company: form.company,
        })

        const saved = mapLookupItem(type, response?.data?.item, fallback)
        setEmployees((previous) => [...previous, saved])
        setForm((previous) => ({
          ...previous,
          employeeId: saved.id,
          employeeCategory: saved.category,
        }))
      }

      if (type === 'post') {
        const fallback = {
          id: ensureUniqueId(normalizeId(name), posts),
          label: name,
          company: form.company,
        }

        const response = await createLookupItem(type, {
          name,
          company: form.company,
        })
        const saved = mapLookupItem(type, response?.data?.item, fallback)

        setPosts((previous) => [...previous, saved])
        setForm((previous) => ({ ...previous, postId: saved.id }))
      }

      if (type === 'shift') {
        const family = normalizeShiftFamily(values.family)
        const parity = normalizeShiftParity(values.parity)
        const start = String(values.start || '').trim()
        const end = String(values.end || '').trim()
        const saturdayStart = String(values.sabStart || '').trim()
        const saturdayEnd = String(values.sabEnd || '').trim()

        if (!family || !start || !end) {
          throw new Error('Preencha fam\u00edlia e hor\u00e1rios base do turno.')
        }

        if (family === '12x36' && !parity) {
          throw new Error('Selecione paridade para turno 12x36.')
        }

        if (family === '6x1' && (!saturdayStart || !saturdayEnd)) {
          throw new Error('Preencha os hor\u00e1rios de s\u00e1bado para o turno 6x1.')
        }

        const fallback = {
          id: ensureUniqueId(normalizeId(name), shifts),
          label: name,
          family,
          parity,
          start,
          end,
          saturdayStart,
          saturdayEnd,
        }

        const response = await createLookupItem(type, {
          name,
          family: fallback.family,
          parity: fallback.parity,
          start: fallback.start,
          end: fallback.end,
          sabStart: fallback.saturdayStart,
          sabEnd: fallback.saturdayEnd,
        })
        const saved = mapLookupItem(type, response?.data?.item, fallback)

        setShifts((previous) => [...previous, saved])
        setForm((previous) => ({ ...previous, shiftId: saved.id }))
      }

      setSyncMessage('Cadastro r\u00e1pido salvo na planilha.')
      setModal((previous) => ({ ...previous, isOpen: false }))
      return true
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : 'Falha ao salvar cadastro r\u00e1pido.',
      )
      return false
    } finally {
      setIsSavingLookup(false)
    }
  }

  const handleFileSelection = async (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      setForm((previous) => ({ ...previous, attachment: null }))
      setFileError('')
      return
    }

    try {
      const encoded = await fileToBase64(selectedFile)
      setForm((previous) => ({ ...previous, attachment: encoded }))
      setFileError('')
    } catch {
      setForm((previous) => ({ ...previous, attachment: null }))
      setFileError('Falha ao converter o arquivo. Tente outro formato.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!enabled) {
      setSyncError('Sess\u00e3o inv\u00e1lida. Fa\u00e7a login novamente.')
      return
    }

    setSyncError('')
    setSyncMessage('')

    if (!form.employeeId || !form.postId || !form.shiftId) {
      setSyncError('Preencha funcion\u00e1rio, posto e turno antes de salvar.')
      return
    }

    const selectedShift = shifts.find((shift) => shift.id === form.shiftId)
    const scheduleEntries = isBatchLaunch
      ? generateBatchSchedule({
          shiftId: form.shiftId,
          startDate: form.startDate,
          days: form.batchDays,
          shiftData: selectedShift,
        })
      : []

    const payload = {
      company: form.company,
      employeeCategory: form.employeeCategory,
      employeeId: form.employeeId,
      postId: form.postId,
      shiftId: form.shiftId,
      launchType: form.launchType,
      eventualReason: isEventualLaunch ? form.eventualReason : null,
      eventualDate: isEventualLaunch ? form.eventualDate : null,
      extraHours: Number(form.extraHours || 0),
      lunchDiscount: Number(form.lunchDiscount || 0),
      startDate: isBatchLaunch ? form.startDate : null,
      batchDays: isBatchLaunch ? Number(form.batchDays) : null,
      scheduleEntries,
      attachment: form.attachment,
    }

    try {
      setIsSubmitting(true)
      await createScaleLaunch(payload)
      setSyncMessage('Lan\u00e7amento salvo com sucesso na planilha.')
      await loadRecent(form.company)
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Falha ao salvar na planilha.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    search,
    modal,
    fileError,
    recentRecords,
    isBatchLaunch,
    isEventualLaunch,
    shouldShowUploadField,
    isBootstrapping,
    isSubmitting,
    isSavingLookup,
    syncMessage,
    syncError,
    options: {
      employees: filteredEmployees,
      employeeCategories: EMPLOYEE_CATEGORY_OPTIONS,
      posts: filteredPosts,
      shifts,
      launchTypes: LAUNCH_TYPE_OPTIONS,
      eventualReasons: EVENTUAL_REASON_OPTIONS,
      batchDays: BATCH_DAYS_OPTIONS,
    },
    actions: {
      updateField,
      setCompany,
      setLaunchType,
      setEventualReason,
      setSearchValue,
      openQuickAddModal,
      closeQuickAddModal,
      saveQuickAdd,
      handleFileSelection,
      handleSubmit,
    },
  }
}
