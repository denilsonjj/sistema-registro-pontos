import {
  formatCategory,
  formatDateTime,
  formatHours,
  formatText,
} from '../../utils/formatters'

export function RecentRecordsList({ records }) {
  if (!records.length) {
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-950">Últimos lançamentos</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Ainda não há lançamentos recentes para exibir.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">Últimos lançamentos</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Exibindo 5 registros. A área mostra 3 por vez com rolagem.
          </p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
          {records.length} itens
        </span>
      </div>

      <div className="mt-3 max-h-[24rem] space-y-2 overflow-y-auto pr-1">
        {records.map((record) => (
          <article
            key={record.id}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  {formatText(record.employeeName)}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatCategory(record.employeeCategory)} • {formatText(record.postName)}
                </p>
              </div>
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                {record.launchTypeLabel}
              </span>
            </div>

            <p className="mt-2 text-xs text-zinc-600">Turno: {formatText(record.shiftName)}</p>

            {record.eventualReasonLabel ? (
              <p className="mt-1 text-xs text-zinc-600">
                Motivo do eventual: {record.eventualReasonLabel}
              </p>
            ) : null}

            <p className="mt-1 text-xs text-zinc-600">
              Hora extra: {formatHours(record.extraHours)} • Almoço: {formatHours(record.lunchDiscount)}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              {record.batchDays
                ? `Escala gerada para ${record.batchDays} dias (${record.generatedEntries} registros).`
                : 'Lançamento eventual registrado.'}
            </p>

            <p className="mt-2 text-[11px] text-zinc-400">
              {formatDateTime(record.createdAt, { short: true })}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
