import { useEffect, useMemo, useState } from 'react'
import {
  formatDate,
  formatHours,
  formatLaunchType,
  formatText,
} from '../../utils/formatters'

const EVENTUAL_REASON_OPTIONS = [
  { value: 'hora_extra', label: 'Hora extra' },
  { value: 'falta_sem_atestado', label: 'Falta sem atestado' },
  { value: 'falta_com_atestado', label: 'Falta com atestado' },
  { value: 'cobertura_avulsa', label: 'Cobertura avulsa' },
  { value: 'contratado_eventual', label: 'Contratado eventual' },
]

const COMPANY_OPTIONS = [
  { value: 'l4_servicos', label: 'L4 Serviços' },
  { value: 'l4_pro_service', label: 'L4 Pró Service' },
]

const SCALE_STATUS_OPTIONS = [
  { value: 'TRABALHO', label: 'Trabalho' },
  { value: 'FOLGA', label: 'Folga' },
  { value: 'FALTA', label: 'Falta' },
]

function findIdByLabel(options = [], label = '') {
  const normalizedLabel = String(label || '').trim().toLowerCase()
  const match = options.find((item) => String(item.label || '').trim().toLowerCase() === normalizedLabel)
  return match?.id || ''
}

function buildInitialValues(record, directoryOptions) {
  if (!record) {
    return {
      company: 'l4_servicos',
      employeeId: '',
      postId: '',
      shiftId: '',
      extraHours: 0,
      lunchDiscount: 0,
      mealAllowance: 0,
      discountReason: '',
      eventualReason: 'hora_extra',
      eventualDate: '',
      referenceDate: '',
      scaleDate: '',
      scaleStatus: 'TRABALHO',
      start: '',
      end: '',
    }
  }

  return {
    company: record.company || 'l4_servicos',
    employeeId:
      record.employeeId ||
      findIdByLabel(directoryOptions?.employees, record.employeeName),
    postId:
      record.postId ||
      findIdByLabel(directoryOptions?.posts, record.postName),
    shiftId:
      record.shiftId ||
      findIdByLabel(directoryOptions?.shifts, record.shiftName),
    extraHours: Number(record.extraHours || 0),
    lunchDiscount: Number(record.lunchDiscount || 0),
    mealAllowance: Number(record.mealAllowance || 0),
    discountReason: record.discountReason || '',
    eventualReason: record.eventualReason || 'hora_extra',
    eventualDate: record.eventualDate || '',
    referenceDate: record.startDate || '',
    scaleDate: record.date || '',
    scaleStatus: record.status || 'TRABALHO',
    start: record.start || '',
    end: record.end || '',
  }
}

export function RecordEditModal({
  record,
  directoryOptions,
  isOpen,
  isSaving,
  onClose,
  onSave,
}) {
  const [values, setValues] = useState(() => buildInitialValues(record, directoryOptions))

  useEffect(() => {
    setValues(buildInitialValues(record, directoryOptions))
  }, [directoryOptions, record])

  const employees = useMemo(() => directoryOptions?.employees || [], [directoryOptions?.employees])
  const posts = useMemo(() => directoryOptions?.posts || [], [directoryOptions?.posts])
  const shifts = useMemo(() => directoryOptions?.shifts || [], [directoryOptions?.shifts])

  if (!isOpen || !record) return null

  const isEventual = record.launchType === 'eventual'

  const handleSubmit = async (event) => {
    event.preventDefault()

    await onSave({
      launchId: record.launchId,
      scaleId: record.scaleId,
      launchData: record.launchId
        ? {
            company: values.company,
            empresa: values.company,
            employeeId: values.employeeId,
            id_funcionario: values.employeeId,
            postId: values.postId,
            id_posto: values.postId,
            shiftId: values.shiftId,
            id_turno: values.shiftId,
            hora_extra: Number(values.extraHours || 0),
            desconto_almoco: Number(values.lunchDiscount || 0),
            vale: Number(values.mealAllowance || 0),
            motivo_desconto: values.discountReason,
            extraHours: Number(values.extraHours || 0),
            lunchDiscount: Number(values.lunchDiscount || 0),
            mealAllowance: Number(values.mealAllowance || 0),
            discountReason: values.discountReason,
            motivo_eventual: isEventual ? values.eventualReason : '',
            eventualReason: isEventual ? values.eventualReason : '',
            data_eventual: isEventual ? values.eventualDate : '',
            eventualDate: isEventual ? values.eventualDate : '',
            data_inicio: !isEventual ? values.referenceDate : '',
            startDate: !isEventual ? values.referenceDate : '',
          }
        : null,
      scaleData: record.scaleId
        ? {
            empresa: values.company,
            id_funcionario: values.employeeId,
            id_posto: values.postId,
            id_turno: values.shiftId,
            data: values.scaleDate,
            status: values.scaleStatus,
            inicio: values.scaleStatus === 'TRABALHO' ? values.start : '',
            fim: values.scaleStatus === 'TRABALHO' ? values.end : '',
          }
        : null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl sm:p-5">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Editar registro</h3>
            <p className="text-xs text-zinc-500">
              {formatText(record.employeeName)} • {formatLaunchType(record.launchType)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Fechar modal"
          >
            x
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-950">Ajuste do dia da escala</h4>
                <p className="mt-1 text-xs text-zinc-600">
                  Use esta área para corrigir um dia específico sem refazer o lote inteiro.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700">
                {record.origin === 'ajuste_manual' ? 'Já ajustado manualmente' : 'Será marcado como ajuste manual'}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Data do dia</label>
                <input
                  type="date"
                  value={values.scaleDate}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, scaleDate: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Status do dia</label>
                <select
                  value={values.scaleStatus}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, scaleStatus: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                >
                  {SCALE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Início</label>
                <input
                  type="time"
                  value={values.start}
                  disabled={values.scaleStatus !== 'TRABALHO'}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, start: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition disabled:cursor-not-allowed disabled:bg-zinc-100 focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Fim</label>
                <input
                  type="time"
                  value={values.end}
                  disabled={values.scaleStatus !== 'TRABALHO'}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, end: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition disabled:cursor-not-allowed disabled:bg-zinc-100 focus:ring-2"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Empresa</label>
                <select
                  value={values.company}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, company: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                >
                  {COMPANY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">
                  {isEventual ? 'Data do eventual' : 'Início do lote'}
                </label>
                <input
                  type="date"
                  value={isEventual ? values.eventualDate : values.referenceDate}
                  onChange={(event) =>
                    setValues((previous) => ({
                      ...previous,
                      [isEventual ? 'eventualDate' : 'referenceDate']: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Colaborador</label>
                <select
                  value={values.employeeId}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, employeeId: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                >
                  <option value="">Selecione...</option>
                  {employees.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Posto</label>
                <select
                  value={values.postId}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, postId: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                >
                  <option value="">Selecione...</option>
                  {posts.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Turno</label>
                <select
                  value={values.shiftId}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, shiftId: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                >
                  <option value="">Selecione...</option>
                  {shifts.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Hora extra</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={values.extraHours}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, extraHours: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Almoço / janta</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={values.lunchDiscount}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, lunchDiscount: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Vale / refeição</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={values.mealAllowance}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, mealAllowance: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-800">Motivo do desconto</label>
              <input
                type="text"
                value={values.discountReason}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, discountReason: event.target.value }))
                }
                placeholder="Ex.: ajuste manual, refeição não utilizada"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
              />
            </div>

            {isEventual ? (
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Motivo do eventual</label>
                <select
                  value={values.eventualReason}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, eventualReason: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                >
                  {EVENTUAL_REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </section>

          <div className="rounded-2xl bg-zinc-50 px-3 py-3 text-xs text-zinc-600">
            <p>
              Hora extra: {formatHours(values.extraHours)} • Almoço / janta: {formatHours(values.lunchDiscount)}
            </p>
            <p className="mt-1">
              Dia em foco: {formatDate(values.scaleDate)} • Status: {formatText(values.scaleStatus)}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
