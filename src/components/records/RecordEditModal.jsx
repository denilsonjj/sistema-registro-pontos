import { useEffect, useState } from 'react'

const EVENTUAL_REASON_OPTIONS = [
  { value: 'hora_extra', label: 'Hora Extra' },
  { value: 'falta_sem_atestado', label: 'Falta sem atestado' },
  { value: 'falta_com_atestado', label: 'Falta com atestado' },
  { value: 'cobertura_avulsa', label: 'Cobertura avulsa' },
  { value: 'contratado_eventual', label: 'Contratado eventual' },
]

function buildInitialValues(record) {
  if (!record) {
    return {
      extraHours: 0,
      lunchDiscount: 0,
      eventualReason: 'hora_extra',
      eventualDate: '',
    }
  }

  return {
    extraHours: Number(record.extraHours || 0),
    lunchDiscount: Number(record.lunchDiscount || 0),
    eventualReason: record.eventualReason || 'hora_extra',
    eventualDate: record.eventualDate || '',
  }
}

export function RecordEditModal({
  record,
  isOpen,
  isSaving,
  onClose,
  onSave,
}) {
  const [values, setValues] = useState(() => buildInitialValues(record))

  useEffect(() => {
    setValues(buildInitialValues(record))
  }, [record])

  if (!isOpen || !record) return null

  const isEventual = record.launchType === 'eventual'

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSave({
      launchId: record.launchId,
      data: {
        hora_extra: Number(values.extraHours || 0),
        desconto_almoco: Number(values.lunchDiscount || 0),
        extraHours: Number(values.extraHours || 0),
        lunchDiscount: Number(values.lunchDiscount || 0),
        motivo_eventual: isEventual ? values.eventualReason : '',
        eventualReason: isEventual ? values.eventualReason : '',
        data_eventual: isEventual ? values.eventualDate : '',
        eventualDate: isEventual ? values.eventualDate : '',
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/60 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Editar Registro</h3>
            <p className="text-xs text-slate-500">{record.employeeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            x
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Hora Extra</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={values.extraHours}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    extraHours: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Almoco (desconto)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={values.lunchDiscount}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    lunchDiscount: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
              />
            </div>
          </div>

          {isEventual ? (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Motivo eventual</label>
                <select
                  value={values.eventualReason}
                  onChange={(event) =>
                    setValues((previous) => ({
                      ...previous,
                      eventualReason: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
                >
                  {EVENTUAL_REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Data eventual</label>
                <input
                  type="date"
                  value={values.eventualDate}
                  onChange={(event) =>
                    setValues((previous) => ({
                      ...previous,
                      eventualDate: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
                />
              </div>
            </>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
