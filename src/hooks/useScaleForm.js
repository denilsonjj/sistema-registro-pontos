import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BATCH_DAYS_OPTIONS,
  EVENTUAL_REASON_OPTIONS,
  INITIAL_EMPLOYEES,
  INITIAL_POSTS,
  INITIAL_SHIFTS,
  LAUNCH_TYPE_OPTIONS,
  RECURRENCE_MODE_OPTIONS,
} from '../data/seedData'
import {
  createCategory,
  createLookupItem,
  createScaleLaunch,
  deleteCategory as deleteCategoryRequest,
  getBootstrapData,
  getRecentRecords,
  updateEmployeeCategory as updateEmployeeCategoryRequest,
} from '../services/appsScriptApi'
import { fileToBase64 } from '../utils/fileToBase64'
import {
  describeShiftRule,
  generateBatchSchedule,
  summarizeGeneratedSchedule,
} from '../utils/scheduleEngine'

const DEFAULT_FORM = {
  company: 'l4_servicos',
  employeeCategory: '',
  employeeId: '',
  postId: '',
  shiftId: '',
  launchType: 'fixo',
  eventualReason: 'hora_extra',
  eventualDate: new Date().toISOString().slice(0, 10),
  batchDays: 30,
  startDate: new Date().toISOString().slice(0, 10),
  recurrenceMode: 'shift_default',
  customWeekDays: [1, 2, 3, 4, 5],
  extraHours: '',
  lunchDiscount: '',
  mealAllowance: '',
  autoMealAllowance: true,
  discountReason: '',
  excludedDates: [],
  attachment: null,
}

const DEFAULT_SEARCH = {
  employee: '',
}

const CATEGORY_STORAGE_KEY = 'scale_categories_v1'

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function normalizeCategoryValue(value) {
  const normalized = slugify(value)
  if (!normalized) return ''
  if (
    normalized === 'vigilante' ||
    normalized === 'controle_de_acesso' ||
    normalized === 'controledeacesso'
  ) {
    return 'controle_de_acesso'
  }
  return normalized
}

function loadStoredCategories() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => {
        const label = String(item?.label || '').trim()
        const value = normalizeCategoryValue(item?.value || label)
        if (!label || !value) return null
        return { value, label: humanizeCategory(label) }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

function saveStoredCategories(categories) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    CATEGORY_STORAGE_KEY,
    JSON.stringify(categories.map((category) => ({
      value: category.value,
      label: category.label,
    }))),
  )
}

function humanizeCategory(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return ''

  const map = {
    vigilante: 'Controle de Acesso',
    controle_de_acesso: 'Controle de Acesso',
    controledeacesso: 'Controle de Acesso',
    limpeza: 'Limpeza',
    manutencao: 'Manutenção',
  }

  const normalizedSlug = slugify(normalized)
  if (map[normalizedSlug]) return map[normalizedSlug]

  return normalized
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
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

      const rawCategory = String(
        row.categoria || row.category || row.cargo || row.role || '',
      ).trim()

      return {
        id,
        label: String(row.nome || row.name || 'Sem nome'),
        category: normalizeCategoryValue(rawCategory),
        categoryLabel: humanizeCategory(rawCategory),
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

function mapCategories(rows) {
  return rows
    .map((row) => {
      const label = String(row.nome || row.name || row.categoria || '').trim()
      const value = normalizeCategoryValue(row.id_categoria || row.categoryId || label)
      if (!label || !value) return null

      return {
        value,
        label: humanizeCategory(label),
      }
    })
    .filter(Boolean)
}

function normalizeRecentRecord(record, lookups = {}) {
  const employeeId = String(record.id_funcionario || record.employeeId || '')
  const postId = String(record.id_posto || record.postId || '')
  const shiftId = String(record.id_turno || record.shiftId || '')
  const employee = employeeId ? lookups.employees?.get(employeeId) : null
  const post = postId ? lookups.posts?.get(postId) : null
  const shift = shiftId ? lookups.shifts?.get(shiftId) : null

  return {
    id: String(record.id || record.id_lancamento || record.launchId || crypto.randomUUID()),
    launchId: String(record.launchId || record.id_lancamento || ''),
    createdAt: String(record.criado_em || record.createdAt || new Date().toISOString()),
    startDate: String(record.data_inicio || record.startDate || ''),
    company: String(record.empresa || record.company || ''),
    employeeId,
    employeeName: String(
      record.nome_funcionario || record.employeeName || employee?.label || employeeId || 'N?o informado',
    ),
    employeeCategory: String(
      record.categoria_funcionario ||
        record.employeeCategory ||
        employee?.categoryLabel ||
        'N?o informado',
    ),
    postId,
    postName: String(record.nome_posto || record.postName || post?.label || postId || 'N?o informado'),
    shiftId,
    shiftName: String(record.nome_turno || record.shiftName || shift?.label || shiftId || 'N?o informado'),
    launchType: String(record.tipo_lancamento || record.launchType || ''),
    launchTypeLabel: String(
      record.tipo_lancamento_label ||
        record.launchTypeLabel ||
        record.tipo_lancamento ||
        record.launchType ||
        'Lan?amento',
    ),
    eventualReason: String(record.motivo_eventual || record.eventualReason || ''),
    eventualReasonLabel: record.motivo_eventual_label || record.eventualReasonLabel
      ? String(record.motivo_eventual_label || record.eventualReasonLabel)
      : null,
    eventualDate: String(record.data_eventual || record.eventualDate || ''),
    generatedEntries: Number(record.registros_gerados || record.generatedEntries || 0),
    batchDays: record.dias_lote || record.batchDays ? Number(record.dias_lote || record.batchDays) : null,
    extraHours: Number(record.hora_extra || record.extraHours || 0),
    lunchDiscount: Number(record.desconto_almoco || record.lunchDiscount || 0),
    mealAllowance: Number(record.vale || record.mealAllowance || 0),
    discountReason: String(record.motivo_desconto || record.discountReason || ''),
  }
}

function mapLookupItem(type, data, fallback) {
  if (!data) return fallback

  if (type === 'employee') {
    const rawCategory = String(
      data.categoria ||
        data.category ||
        data.cargo ||
        data.role ||
        fallback.categoryLabel ||
        fallback.category ||
        '',
    )

    return {
      id: String(data.id_funcionario || data.employeeId || fallback.id),
      label: String(data.nome || data.name || fallback.label),
      category: normalizeCategoryValue(rawCategory) || fallback.category,
      categoryLabel: humanizeCategory(rawCategory),
      company: String(data.empresa || data.company || fallback.company || ''),
      cpf: String(data.cpf || fallback.cpf || ''),
      startDate: String(
        data.data_inicio || data.dataInicio || data.startDate || fallback.startDate || '',
      ),
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
  const [managedCategories, setManagedCategories] = useState(() => loadStoredCategories())
  const [modal, setModal] = useState({ isOpen: false, type: 'employee' })
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [fileError, setFileError] = useState('')
  const [recentRecords, setRecentRecords] = useState([])
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingLookup, setIsSavingLookup] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [syncError, setSyncError] = useState('')
  const hasBootstrappedRef = useRef(false)

  const isBatchLaunch = form.launchType === 'fixo'
  const isEventualLaunch = form.launchType === 'eventual'
  const shouldShowUploadField =
    isEventualLaunch && form.eventualReason === 'falta_com_atestado'

  const employeeCategoryOptions = useMemo(() => {
    const optionMap = new Map()

    managedCategories.forEach((category) => {
      optionMap.set(category.value, category)
    })

    employees.forEach((employee) => {
      if (!employee.category) return
      optionMap.set(employee.category, {
        value: employee.category,
        label: employee.categoryLabel || humanizeCategory(employee.category),
      })
    })

    return Array.from(optionMap.values())
  }, [employees, managedCategories])

  useEffect(() => {
    saveStoredCategories(managedCategories)
  }, [managedCategories])

  useEffect(() => {
    if (!employeeCategoryOptions.length) {
      if (form.employeeCategory) {
        setForm((previous) => ({
          ...previous,
          employeeCategory: '',
          employeeId: '',
        }))
      }
      return
    }

    const selectedExists = employeeCategoryOptions.some(
      (category) => category.value === form.employeeCategory,
    )

    if (!selectedExists) {
      setForm((previous) => ({
        ...previous,
        employeeCategory: employeeCategoryOptions[0].value,
        employeeId: '',
      }))
    }
  }, [employeeCategoryOptions, form.employeeCategory])

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

  const selectedShift = useMemo(
    () => shifts.find((shift) => shift.id === form.shiftId) || null,
    [form.shiftId, shifts],
  )

  const recurrenceConfig = useMemo(() => {
    if (!isBatchLaunch) return null
    if (form.recurrenceMode !== 'weekly_custom') return { mode: 'shift_default', workDays: [] }
    return {
      mode: 'weekly_custom',
      workDays: form.customWeekDays,
    }
  }, [form.customWeekDays, form.recurrenceMode, isBatchLaunch])

  const rawSchedulePreviewEntries = useMemo(() => {
    if (!isBatchLaunch || !form.shiftId) return []

    return generateBatchSchedule({
      shiftId: form.shiftId,
      startDate: form.startDate,
      days: form.batchDays,
      shiftData: selectedShift,
      recurrence: recurrenceConfig,
    })
  }, [form.batchDays, form.shiftId, form.startDate, isBatchLaunch, recurrenceConfig, selectedShift])

  const excludedDateSet = useMemo(() => {
    return new Set(Array.isArray(form.excludedDates) ? form.excludedDates : [])
  }, [form.excludedDates])

  const schedulePreviewEntries = useMemo(() => {
    if (!rawSchedulePreviewEntries.length) return []

    return rawSchedulePreviewEntries.filter((entry) => !excludedDateSet.has(entry.date))
  }, [excludedDateSet, rawSchedulePreviewEntries])

  const previewEntries = useMemo(() => {
    if (!rawSchedulePreviewEntries.length) return []

    return rawSchedulePreviewEntries.map((entry) => ({
      ...entry,
      excluded: excludedDateSet.has(entry.date),
    }))
  }, [excludedDateSet, rawSchedulePreviewEntries])

  const schedulePreview = useMemo(() => {
    const summary = summarizeGeneratedSchedule(schedulePreviewEntries)
    return {
      ...summary,
      ruleText: describeShiftRule(selectedShift, recurrenceConfig),
      excludedCount: Array.isArray(form.excludedDates) ? form.excludedDates.length : 0,
    }
  }, [form.excludedDates, recurrenceConfig, schedulePreviewEntries, selectedShift])

  useEffect(() => {
    const validDates = new Set(rawSchedulePreviewEntries.map((entry) => entry.date))

    setForm((previous) => {
      const currentExcluded = Array.isArray(previous.excludedDates) ? previous.excludedDates : []
      const nextExcluded = currentExcluded.filter((date) => validDates.has(date))

      if (nextExcluded.length === currentExcluded.length) {
        return previous
      }

      return {
        ...previous,
        excludedDates: nextExcluded,
      }
    })
  }, [rawSchedulePreviewEntries])

  useEffect(() => {
    if (!isBatchLaunch) return
    if (!form.autoMealAllowance) return

    const nextAllowance = String(schedulePreview.workDays || 0)

    setForm((previous) => {
      if (!previous.autoMealAllowance) return previous
      if (String(previous.mealAllowance || '') === nextAllowance) return previous

      return {
        ...previous,
        mealAllowance: nextAllowance,
      }
    })
  }, [form.autoMealAllowance, isBatchLaunch, schedulePreview.workDays])

  const recentRecordLookups = useMemo(
    () => ({
      employees: new Map(employees.map((employee) => [employee.id, employee])),
      posts: new Map(posts.map((post) => [post.id, post])),
      shifts: new Map(shifts.map((shift) => [shift.id, shift])),
    }),
    [employees, posts, shifts],
  )

  const loadRecent = useCallback(async (companyValue) => {
    try {
      const response = await getRecentRecords({
        company: companyValue || '',
        limit: 5,
      })
      const rows = Array.isArray(response?.data?.records) ? response.data.records : []
      setRecentRecords(rows.map((row) => normalizeRecentRecord(row, recentRecordLookups)))
    } catch {
      // Mantem sem bloquear fluxo.
    }
  }, [recentRecordLookups])

  useEffect(() => {
    if (!enabled) {
      setIsBootstrapping(false)
      hasBootstrappedRef.current = false
      return undefined
    }

    if (hasBootstrappedRef.current) {
      return undefined
    }

    let isMounted = true

    async function bootstrap() {
      hasBootstrappedRef.current = true
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
        const remoteCategories = mapCategories(data.categorias || [])

        if (remoteEmployees.length) setEmployees(remoteEmployees)
        if (remotePosts.length) setPosts(remotePosts)
        if (remoteShifts.length) setShifts(remoteShifts)
        if (Array.isArray(data.categorias)) setManagedCategories(remoteCategories)

        setSyncMessage('Conectado ao Google Sheets.')
        if (isMounted) setIsBootstrapping(false)
        void loadRecent(DEFAULT_FORM.company)
      } catch (error) {
        if (!isMounted) return
        hasBootstrappedRef.current = false
        const reason = error instanceof Error ? ` Motivo: ${error.message}` : ''
        setSyncError(`Não foi possível carregar dados da planilha. Usando dados locais.${reason}`)
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

      if (field === 'employeeCategory') {
        const selectedEmployeeStillValid = employees.some(
          (employee) => employee.id === previous.employeeId && employee.category === value,
        )

        return {
          ...previous,
          employeeCategory: value,
          employeeId: selectedEmployeeStillValid ? previous.employeeId : '',
        }
      }

      if (field === 'recurrenceMode' && value !== 'weekly_custom') {
        return {
          ...previous,
          recurrenceMode: value,
          customWeekDays: DEFAULT_FORM.customWeekDays,
          excludedDates: [],
        }
      }

      if (field === 'mealAllowance') {
        return {
          ...previous,
          mealAllowance: value,
          autoMealAllowance: false,
        }
      }

      if (field === 'shiftId' || field === 'startDate' || field === 'batchDays') {
        return {
          ...previous,
          [field]: value,
          excludedDates: [],
        }
      }

      return { ...previous, [field]: value }
    })
  }

  const toggleCustomWeekDay = (weekDay) => {
    setForm((previous) => {
      const currentDays = Array.isArray(previous.customWeekDays) ? previous.customWeekDays : []
      const exists = currentDays.includes(weekDay)
      const nextDays = exists
        ? currentDays.filter((day) => day !== weekDay)
        : [...currentDays, weekDay]

      return {
        ...previous,
        customWeekDays: nextDays.sort((left, right) => {
          const leftIndex = left === 0 ? 7 : left
          const rightIndex = right === 0 ? 7 : right
          return leftIndex - rightIndex
        }),
        excludedDates: [],
      }
    })
  }

  const toggleExcludedDate = (date) => {
    setForm((previous) => {
      const current = Array.isArray(previous.excludedDates) ? previous.excludedDates : []
      const exists = current.includes(date)
      const nextExcluded = exists
        ? current.filter((item) => item !== date)
        : [...current, date]

      return {
        ...previous,
        excludedDates: nextExcluded,
      }
    })
  }

  const clearExcludedDates = () => {
    setForm((previous) => {
      const current = Array.isArray(previous.excludedDates) ? previous.excludedDates : []
      if (!current.length) return previous

      return {
        ...previous,
        excludedDates: [],
      }
    })
  }

  const setAutoMealAllowance = (enabledValue) => {
    setForm((previous) => {
      const isEnabled = Boolean(enabledValue)

      if (!isEnabled) {
        if (!previous.autoMealAllowance) return previous
        return {
          ...previous,
          autoMealAllowance: false,
        }
      }

      return {
        ...previous,
        autoMealAllowance: true,
        mealAllowance: String(schedulePreview.workDays || 0),
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
          autoMealAllowance: true,
        }
      }

      return {
        ...previous,
        launchType,
        eventualReason: previous.eventualReason || 'hora_extra',
        autoMealAllowance: false,
        excludedDates: [],
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

  const openCategoryManager = () => {
    setIsCategoryManagerOpen(true)
    setSyncError('')
    setSyncMessage('')
  }

  const closeCategoryManager = () => {
    if (isSavingLookup) return
    setIsCategoryManagerOpen(false)
  }

  const closeQuickAddModal = () => {
    if (isSavingLookup) return
    setModal((previous) => ({ ...previous, isOpen: false }))
  }

  const saveQuickAdd = async (type, values) => {
    if (!enabled) {
      setSyncError('Sessão inválida. Faça login novamente.')
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
        const categoryLabel = humanizeCategory(values.category)
        const category = normalizeCategoryValue(values.category || categoryLabel)
        const fallback = {
          id: ensureUniqueId(slugify(name).replace(/_/g, '-'), employees),
          label: name,
          category,
          categoryLabel,
          company: form.company,
          cpf: values.cpf || '',
          startDate: values.startDate || '',
        }

        const response = await createLookupItem(type, {
          name,
          category: categoryLabel,
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
          id: ensureUniqueId(slugify(name).replace(/_/g, '-'), posts),
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
          throw new Error('Preencha família e horários base do turno.')
        }

        if (family === '12x36' && !parity) {
          throw new Error('Selecione paridade para turno 12x36.')
        }

        if (family === '6x1' && (!saturdayStart || !saturdayEnd)) {
          throw new Error('Preencha os horários de sábado para o turno 6x1.')
        }

        const fallback = {
          id: ensureUniqueId(slugify(name).replace(/_/g, '-'), shifts),
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

      setSyncMessage('Cadastro rápido salvo na planilha.')
      setModal((previous) => ({ ...previous, isOpen: false }))
      return true
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : 'Falha ao salvar cadastro rápido.',
      )
      return false
    } finally {
      setIsSavingLookup(false)
    }
  }

  const addCategory = async (categoryName) => {
    const label = humanizeCategory(categoryName)
    const value = normalizeCategoryValue(categoryName)

    if (!label || !value) {
      setSyncError('Informe uma categoria válida.')
      return false
    }

    const exists = employeeCategoryOptions.some((category) => category.value === value)
    if (exists) {
      setSyncError('Essa categoria já existe.')
      return false
    }

    try {
      setIsSavingLookup(true)

      if (enabled) {
        const response = await createCategory({
          name: label,
          value,
        })

        const saved = mapCategories([response?.data?.item]).at(0) || { value, label }
        setManagedCategories((previous) => [...previous, saved])
        setSyncMessage('Categoria adicionada na planilha.')
      } else {
        setManagedCategories((previous) => [...previous, { value, label }])
        setSyncMessage('Categoria adicionada no app.')
      }

      setSyncError('')
      return true
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : 'Falha ao adicionar categoria.',
      )
      return false
    } finally {
      setIsSavingLookup(false)
    }
  }

  const assignEmployeeCategory = async (employeeId, categoryValue) => {
    const selectedCategory = employeeCategoryOptions.find(
      (category) => category.value === categoryValue,
    )
    const nextLabel = selectedCategory?.label || humanizeCategory(categoryValue)

    try {
      setIsSavingLookup(true)

      if (enabled) {
        await updateEmployeeCategoryRequest({
          employeeId,
          category: nextLabel,
        })
      }

      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === employeeId
            ? {
                ...employee,
                category: categoryValue,
                categoryLabel: nextLabel,
              }
            : employee,
        ),
      )

      setSyncMessage(enabled ? 'Categoria atualizada na planilha.' : 'Categoria atualizada no app.')
      setSyncError('')
      return true
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : 'Falha ao atualizar categoria do colaborador.',
      )
      return false
    } finally {
      setIsSavingLookup(false)
    }
  }

  const deleteCategory = async (categoryValue, { replacementCategory = '' } = {}) => {
    const linkedEmployees = employees.filter((employee) => employee.category === categoryValue)

    if (linkedEmployees.length && !replacementCategory) {
      setSyncError('Escolha uma categoria de destino antes de excluir.')
      return false
    }

    try {
      setIsSavingLookup(true)

      if (enabled) {
        await deleteCategoryRequest({
          categoryValue,
          replacementCategory,
        })
      }

      if (linkedEmployees.length) {
      const replacement = employeeCategoryOptions.find(
        (category) => category.value === replacementCategory,
      )

      setEmployees((previous) =>
        previous.map((employee) =>
          employee.category === categoryValue
            ? {
                ...employee,
                category: replacementCategory,
                categoryLabel: replacement?.label || humanizeCategory(replacementCategory),
              }
            : employee,
        ),
      )
      }

      const nextCategories = managedCategories.filter(
        (category) => category.value !== categoryValue,
      )
      setManagedCategories(nextCategories)

      if (form.employeeCategory === categoryValue) {
        setForm((previous) => ({
          ...previous,
          employeeCategory: linkedEmployees.length ? replacementCategory : '',
          employeeId: '',
        }))
      }

      setSyncMessage(enabled ? 'Categoria removida da planilha.' : 'Categoria removida do app.')
      setSyncError('')
      return true
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : 'Falha ao remover categoria.',
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
      setSyncError('Sessão inválida. Faça login novamente.')
      return
    }

    setSyncError('')
    setSyncMessage('')

    if (!form.employeeId || !form.postId || !form.shiftId) {
      setSyncError('Preencha colaborador, posto e turno antes de salvar.')
      return
    }

    if (isBatchLaunch && form.recurrenceMode === 'weekly_custom' && !form.customWeekDays.length) {
      setSyncError('Selecione pelo menos um dia da semana na repetição personalizada.')
      return
    }

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
      mealAllowance: Number(form.mealAllowance || 0),
      discountReason: String(form.discountReason || ''),
      startDate: isBatchLaunch ? form.startDate : null,
      batchDays: isBatchLaunch ? Number(form.batchDays) : null,
      recurrenceMode: isBatchLaunch ? form.recurrenceMode : null,
      customWeekDays: isBatchLaunch ? form.customWeekDays : [],
      scheduleEntries: isBatchLaunch ? schedulePreviewEntries : [],
      attachment: form.attachment,
    }

    try {
      setIsSubmitting(true)
      await createScaleLaunch(payload)
      setSyncMessage('Lançamento salvo com sucesso na planilha.')
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
    isCategoryManagerOpen,
    fileError,
    recentRecords,
    previewEntries,
    schedulePreview,
    excludedDates: Array.isArray(form.excludedDates) ? form.excludedDates : [],
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
      allEmployees: employees,
      employeeCategories: employeeCategoryOptions,
      posts: filteredPosts,
      allPosts: posts,
      shifts,
      launchTypes: LAUNCH_TYPE_OPTIONS,
      eventualReasons: EVENTUAL_REASON_OPTIONS,
      batchDays: BATCH_DAYS_OPTIONS,
      recurrenceModes: RECURRENCE_MODE_OPTIONS,
    },
    actions: {
      updateField,
      setCompany,
      setLaunchType,
      setEventualReason,
      setSearchValue,
      toggleCustomWeekDay,
      toggleExcludedDate,
      clearExcludedDates,
      setAutoMealAllowance,
      openQuickAddModal,
      closeQuickAddModal,
      openCategoryManager,
      closeCategoryManager,
      addCategory,
      assignEmployeeCategory,
      deleteCategory,
      saveQuickAdd,
      handleFileSelection,
      handleSubmit,
    },
  }
}
