import { useMemo, useState } from 'react'
import { RecordEditModal } from './RecordEditModal'
import {
  formatCategory,
  formatCompany,
  formatDate,
  formatDateTime,
  formatHours,
  formatLaunchType,
  formatMonth,
  formatText,
} from '../../utils/formatters'

const SHEET_URL =
  import.meta.env.VITE_SHEETS_URL ||
  'https://docs.google.com/spreadsheets/d/PLANILHA_EXEMPLO/edit'

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
]

const COMPANY_OPTIONS = [
  { value: 'all', label: 'Todas as empresas' },
  { value: 'l4_servicos', label: 'L4 Servicos' },
  { value: 'l4_pro_service', label: 'L4 Pro Service' },
]

function buildSelectOptions(items = []) {
  const map = new Map([['all', { value: 'all', label: 'Todos' }]])

  items.forEach((item) => {
    if (!item?.id) return
    map.set(item.id, { value: item.id, label: item.label })
  })

  return Array.from(map.values())
}

function SummaryCard({ label, value, emphasis = false }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${emphasis ? 'text-red-700' : 'text-zinc-950'}`}>
        {value}
      </p>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-800">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function RecordCard({ record, onEdit, onDelete, isSaving }) {
  const isManualAdjustment = record.origin === 'ajuste_manual'
  const isAbsence = record.status === 'FALTA'

  return (
    <article
      className={`print-card rounded-3xl border p-4 shadow-sm ${
        isAbsence
          ? 'border-red-200 bg-red-50/50'
          : isManualAdjustment
            ? 'border-amber-200 bg-amber-50/50'
            : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-950">
              {formatText(record.employeeName)}
            </h3>
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              {formatLaunchType(record.launchType, record.launchTypeLabel)}
            </span>
            {record.status ? (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isAbsence
                    ? 'bg-red-100 text-red-700'
                    : record.status === 'FOLGA'
                      ? 'bg-zinc-200 text-zinc-700'
                      : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {formatText(record.status)}
              </span>
            ) : null}
            {isManualAdjustment ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Ajuste manual
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            {formatCategory(record.employeeCategory)} - {formatText(record.postName)}
          </p>
        </div>

        <div className="print:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(record)}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-2xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(record)}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl bg-zinc-50 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Turno</p>
          <p className="mt-1 text-sm text-zinc-900">{formatText(record.shiftName)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Empresa</p>
          <p className="mt-1 text-sm text-zinc-900">{formatCompany(record.company)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Data da escala</p>
          <p className="mt-1 text-sm text-zinc-900">{formatDate(record.date)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lancado em</p>
          <p className="mt-1 text-sm text-zinc-900">{formatDateTime(record.createdAt)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Hora extra</p>
          <p className="mt-1 text-sm text-zinc-900">{formatHours(record.extraHours)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Almoco / janta</p>
          <p className="mt-1 text-sm text-zinc-900">{formatHours(record.lunchDiscount)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600">
        {record.eventualReasonLabel ? <p>Motivo: {record.eventualReasonLabel}</p> : null}
        <p>Vale / refeicao: {formatText(record.mealAllowance, '0')}</p>
        {record.start || record.end ? (
          <p>
            Horario do dia: {formatText(record.start, '--:--')} - {formatText(record.end, '--:--')}
          </p>
        ) : null}
        {record.discountReason ? (
          <p>Motivo do desconto: {formatText(record.discountReason)}</p>
        ) : null}
        <p>
          {record.batchDays
            ? `${record.generatedEntries} registros gerados no lote`
            : 'Lancamento avulso'}
        </p>
      </div>
    </article>
  )
}

export function RecordsPage({
  userName,
  recordsState,
  directoryOptions,
  onLogout,
  onNavigate,
  currentPage,
}) {
  const [editingRecord, setEditingRecord] = useState(null)
  const {
    records,
    filters,
    appliedFilters,
    hasLoaded,
    isLoading,
    isSaving,
    error,
    message,
    source,
    actions,
  } = recordsState

  const employeeOptions = useMemo(
    () => buildSelectOptions(directoryOptions?.employees),
    [directoryOptions?.employees],
  )
  const postOptions = useMemo(
    () => buildSelectOptions(directoryOptions?.posts),
    [directoryOptions?.posts],
  )

  const summary = useMemo(() => {
    const total = records.length
    const extraHours = records.reduce((acc, record) => acc + Number(record.extraHours || 0), 0)
    const workEntries = records.filter((record) => record.status === 'TRABALHO').length

    return { total, extraHours, workEntries }
  }, [records])

  const employeeLabelById = useMemo(() => {
    const map = new Map()
    ;(directoryOptions?.employees || []).forEach((item) => map.set(item.id, item.label))
    return map
  }, [directoryOptions?.employees])

  const postLabelById = useMemo(() => {
    const map = new Map()
    ;(directoryOptions?.posts || []).forEach((item) => map.set(item.id, item.label))
    return map
  }, [directoryOptions?.posts])

  const monthInFocus = useMemo(() => {
    if (!hasLoaded) return '-'

    if (appliedFilters.month) return formatMonth(appliedFilters.month)

    if (appliedFilters.period === 'month') {
      const fallbackMonth = String(appliedFilters.date || '').slice(0, 7)
      return fallbackMonth ? formatMonth(fallbackMonth) : '-'
    }

    return '-'
  }, [appliedFilters.date, appliedFilters.month, appliedFilters.period, hasLoaded])

  const printContext = useMemo(() => {
    const companyLabel =
      COMPANY_OPTIONS.find((option) => option.value === appliedFilters.company)?.label ||
      'Todas as empresas'
    const employeeLabel =
      appliedFilters.employeeId === 'all'
        ? 'Todos'
        : employeeLabelById.get(appliedFilters.employeeId) || appliedFilters.employeeId
    const postLabel =
      appliedFilters.postId === 'all'
        ? 'Todos'
        : postLabelById.get(appliedFilters.postId) || appliedFilters.postId

    return { companyLabel, employeeLabel, postLabel }
  }, [appliedFilters.company, appliedFilters.employeeId, appliedFilters.postId, employeeLabelById, postLabelById])

  const handleDeleteRecord = async (record) => {
    const confirmed = window.confirm(
      'Deseja excluir este dia da escala? Para excluir o lote inteiro, use o modal de edicao.',
    )
    if (!confirmed) return
    await actions.deleteRecord({
      scope: 'scale',
      scaleId: record.scaleId,
      launchId: record.launchId,
    })
  }

  const handlePrint = async () => {
    if (!hasLoaded || isLoading || isSaving) return
    const ok = await actions.loadRecords()
    if (!ok) return
    window.print()
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 pb-6 lg:px-6 lg:py-6">
        <header className="print:hidden rounded-[2rem] bg-zinc-950 px-4 py-5 text-white shadow-xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold sm:text-3xl">Registros</h1>
              <p className="mt-1 text-sm text-zinc-300 sm:text-base">
                {userName} - acompanhe mes, posto, colaborador e ajuste o que for necessario.
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:items-start">
              <a
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-100"
              >
                Abrir planilha
              </a>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center rounded-2xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Sair
              </button>
            </div>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2">
            {[
              { value: 'launch', label: 'Lancamentos' },
              { value: 'records', label: 'Registros' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onNavigate(item.value)}
                className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  currentPage === item.value
                    ? 'bg-white text-red-700'
                    : 'bg-white/5 text-zinc-200 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="mt-4 flex-1">
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="print:hidden space-y-4 xl:sticky xl:top-6 xl:self-start">
              <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-950">Filtros e consulta</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Ajuste os filtros e clique em filtrar. Dia, semana e mes usam a data de referencia.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={actions.loadRecords}
                      disabled={isLoading}
                      className="rounded-2xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      {isLoading ? 'Filtrando...' : 'Filtrar'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      disabled={!hasLoaded || isLoading || isSaving}
                      className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Imprimir / PDF
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-800">Periodo</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PERIOD_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => actions.setPeriodFilter(option.value)}
                          className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                            filters.period === option.value
                              ? 'border-red-700 bg-red-50 text-red-700'
                              : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-800">Data de referencia</label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(event) => actions.setDateFilter(event.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-800">Mes de referencia</label>
                    <input
                      type="month"
                      value={filters.month}
                      onChange={(event) => actions.setMonthFilter(event.target.value)}
                      disabled={filters.period !== 'month'}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                    />
                    <p className="text-xs text-zinc-500">
                      Esse campo e usado apenas quando o periodo selecionado for Mes.
                    </p>
                  </div>

                  <FilterSelect
                    label="Empresa"
                    value={filters.company}
                    onChange={(event) => actions.setCompanyFilter(event.target.value)}
                    options={COMPANY_OPTIONS}
                  />

                  <FilterSelect
                    label="Colaborador"
                    value={filters.employeeId}
                    onChange={(event) => actions.setEmployeeFilter(event.target.value)}
                    options={employeeOptions}
                  />

                  <FilterSelect
                    label="Posto"
                    value={filters.postId}
                    onChange={(event) => actions.setPostFilter(event.target.value)}
                    options={postOptions}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="space-y-3">
                  <SummaryCard label="Registros filtrados" value={summary.total} />
                  <SummaryCard
                    label="Hora extra total"
                    value={formatHours(summary.extraHours)}
                    emphasis
                  />
                  <SummaryCard label="Mes em foco" value={monthInFocus} />
                  <SummaryCard label="Dias de trabalho" value={summary.workEntries} />
                </div>

                <div className="mt-4 rounded-2xl bg-red-50 px-3 py-3 text-sm text-red-900">
                  <p>
                    Fonte atual:{' '}
                    <strong>
                      {source === 'recordsreport' ? 'relatorio detalhado' : 'lancamentos recentes'}
                    </strong>
                  </p>
                  <button
                    type="button"
                    onClick={actions.loadRecords}
                    disabled={isLoading}
                    className="mt-3 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? 'Atualizando...' : 'Atualizar'}
                  </button>
                </div>
              </section>
            </aside>

            <section className="min-w-0 space-y-4">
              <section className="hidden print:block rounded-none border-0 bg-white p-0 shadow-none">
                <h1 className="text-2xl font-bold text-zinc-950">Relatorio de Registros</h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Periodo: {monthInFocus} | Registros: {summary.total}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Empresa: {printContext.companyLabel} | Colaborador: {printContext.employeeLabel} | Posto: {printContext.postLabel}
                </p>
              </section>

              {isLoading ? (
                <div className="print:hidden rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                  Carregando registros...
                </div>
              ) : null}

              {message ? (
                <div className="print:hidden rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {message}
                </div>
              ) : null}

              {error ? (
                <div className="print:hidden rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </div>
              ) : null}

              {!hasLoaded && !isLoading ? (
                <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-6 text-sm text-zinc-600 shadow-sm">
                  Defina os filtros desejados e clique em <strong>Filtrar</strong> para carregar os registros.
                </div>
              ) : null}

              <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="print:hidden flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-950">Registros filtrados</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {!hasLoaded
                        ? 'Nenhum filtro aplicado ainda.'
                        : summary.total
                          ? `${summary.total} registro(s) encontrados`
                          : 'Nenhum registro encontrado para esse filtro.'}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400">Mes em foco: {monthInFocus}</p>
                </div>

                {!hasLoaded ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
                    Aguardando aplicacao dos filtros.
                  </div>
                ) : !records.length ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
                    Nenhum registro encontrado para esse filtro.
                  </div>
                ) : (
                  <>
                    <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-1 print:hidden">
                      {records.map((record) => (
                        <RecordCard
                          key={record.id}
                          record={record}
                          onEdit={setEditingRecord}
                          onDelete={handleDeleteRecord}
                          isSaving={isSaving}
                        />
                      ))}
                    </div>

                    <div className="hidden print:block">
                      <table className="print-report-table mt-4 w-full border-collapse text-xs">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Colaborador</th>
                            <th>Posto</th>
                            <th>Turno</th>
                            <th>Status</th>
                            <th>Hora extra</th>
                            <th>Almoco/Janta</th>
                            <th>Vale</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((record) => (
                            <tr key={`print-${record.id}`}>
                              <td>{formatDate(record.date)}</td>
                              <td>{formatText(record.employeeName)}</td>
                              <td>{formatText(record.postName)}</td>
                              <td>{formatText(record.shiftName)}</td>
                              <td>{formatText(record.status || '--')}</td>
                              <td>{formatHours(record.extraHours)}</td>
                              <td>{formatHours(record.lunchDiscount)}</td>
                              <td>{formatText(record.mealAllowance, '0')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            </section>
          </div>
        </main>
      </div>

      <RecordEditModal
        record={editingRecord}
        directoryOptions={directoryOptions}
        isOpen={Boolean(editingRecord)}
        isSaving={isSaving}
        onClose={() => {
          if (isSaving) return
          setEditingRecord(null)
        }}
        onSave={async (payload) => {
          const success = await actions.saveRecordChanges(payload)
          if (success) setEditingRecord(null)
        }}
        onDelete={async (payload) => {
          const success = await actions.deleteRecord(payload)
          if (success) setEditingRecord(null)
        }}
      />
    </div>
  )
}
