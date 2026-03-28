import {
  formatCategory,
  formatDateTime,
  formatHours,
  formatText,
} from '../../utils/formatters'

export function RecentRecordsList({ records }) {
  if (!records.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Registros recentes</h2>
        <p className="mt-2 text-sm text-slate-500">
          Ainda não há lançamentos nesta sessão.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800">Registros recentes</h2>
      <div className="mt-3 space-y-2">
        {records.map((record) => (
          <article
            key={record.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {formatText(record.employeeName)}
                </p>
                <p className="text-xs text-slate-500">
                  {formatCategory(record.employeeCategory)} • {formatText(record.postName)}
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                {record.launchTypeLabel}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600">Turno: {formatText(record.shiftName)}</p>

            {record.eventualReasonLabel ? (
              <p className="mt-1 text-xs text-slate-600">
                Motivo do eventual: {record.eventualReasonLabel}
              </p>
            ) : null}

            <p className="mt-1 text-xs text-slate-600">
              Hora extra: {formatHours(record.extraHours)} • Almoço: {formatHours(record.lunchDiscount)}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              {record.batchDays
                ? `Escala gerada para ${record.batchDays} dias (${record.generatedEntries} registros).`
                : 'Lançamento eventual registrado.'}
            </p>

            <p className="mt-2 text-[11px] text-slate-400">
              {formatDateTime(record.createdAt, { short: true })}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
