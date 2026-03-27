import { useMemo, useState } from 'react'
import { RecordEditModal } from './RecordEditModal'

const SHEET_URL =
  import.meta.env.VITE_SHEETS_URL ||
  'https://docs.google.com/spreadsheets/d/PLANILHA_EXEMPLO/edit'

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
]

const COMPANY_OPTIONS = [
  { value: 'all', label: 'Todas empresas' },
  { value: 'l4_servicos', label: 'L4 Servicos' },
  { value: 'l4_pro_service', label: 'L4 Pro Service' },
]

function formatDateTime(isoString) {
  const date = new Date(isoString)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RecordsPage({
  userName,
  recordsState,
  onLogout,
  onNavigate,
  currentPage,
}) {
  const [editingRecord, setEditingRecord] = useState(null)
  const { records, filters, isLoading, isSaving, error, message, actions } = recordsState

  const summary = useMemo(() => {
    const total = records.length
    const extraHours = records.reduce((acc, record) => acc + Number(record.extraHours || 0), 0)
    return { total, extraHours: extraHours.toFixed(1) }
  }, [records])

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:py-6">
        <header className="rounded-b-3xl bg-blue-600 px-4 py-5 text-white shadow-md sm:px-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="max-w-md">
              <h1 className="text-2xl font-bold sm:text-3xl">Registros</h1>
              <p className="text-sm text-blue-100 sm:text-base">
                {userName} - edite registros do dia, semana ou mes.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={SHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  Abrir planilha
                </a>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center rounded-xl bg-blue-700/80 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Sair
                </button>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-lg font-semibold backdrop-blur-sm">
                GS
              </div>
            </div>
          </div>

          <nav className="mt-2 grid grid-cols-2 gap-2">
            {[
              { value: 'launch', label: 'Lancamentos' },
              { value: 'records', label: 'Registros' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onNavigate(item.value)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  currentPage === item.value
                    ? 'bg-white text-blue-700'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="-mt-2 flex-1 p-4 pt-6 sm:p-6">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">Filtros</h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Periodo</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PERIOD_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => actions.setPeriodFilter(option.value)}
                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          filters.period === option.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Empresa</label>
                  <select
                    value={filters.company}
                    onChange={(event) => actions.setCompanyFilter(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
                  >
                    {COMPANY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <p>
                  Registros: <strong>{summary.total}</strong>
                </p>
                <p>
                  Total HE: <strong>{summary.extraHours}h</strong>
                </p>
                <button
                  type="button"
                  onClick={actions.loadRecords}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Atualizar
                </button>
              </div>
            </section>

            {isLoading ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                Carregando registros...
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">Registros filtrados</h2>

              {!records.length ? (
                <p className="mt-3 text-sm text-slate-500">
                  Nenhum registro encontrado para esse filtro.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {records.map((record) => (
                    <article
                      key={record.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {record.employeeName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {record.employeeCategory} - {record.postName}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          {record.launchTypeLabel}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-600">Turno: {record.shiftName}</p>

                      {record.eventualReasonLabel ? (
                        <p className="mt-1 text-xs text-slate-600">
                          Motivo eventual: {record.eventualReasonLabel}
                        </p>
                      ) : null}

                      <p className="mt-1 text-xs text-slate-600">
                        HE: {record.extraHours}h - Almoco: {record.lunchDiscount}h
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-400">
                          {formatDateTime(record.createdAt)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditingRecord(record)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Editar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <RecordEditModal
        record={editingRecord}
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
      />
    </div>
  )
}
