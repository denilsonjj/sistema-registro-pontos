import { useState } from 'react'
import { SHIFT_OPTIONS, SHIFT_TEMPLATES } from '../../utils/scheduleEngine'

const SHIFT_TEMPLATE_OPTIONS = [
  { value: '', label: 'Personalizado' },
  ...SHIFT_OPTIONS.map((shift) => ({
    value: shift.id,
    label: shift.label,
  })),
]

const MODAL_META = {
  employee: {
    title: 'Novo Funcion\u00e1rio',
    fields: [
      { name: 'cpf', label: 'CPF', type: 'text', required: true },
      { name: 'startDate', label: 'Data de in\u00edcio', type: 'date', required: true },
      { name: 'name', label: 'Nome', type: 'text', required: true },
      {
        name: 'category',
        label: 'Fun\u00e7\u00e3o',
        type: 'select',
        required: true,
        options: [
          { value: 'vigilante', label: 'Vigilante' },
          { value: 'limpeza', label: 'Limpeza' },
        ],
      },
      { name: 'role', label: 'Cargo', type: 'text', required: true },
    ],
  },
  post: {
    title: 'Novo Posto',
    fields: [{ name: 'name', label: 'Nome do Posto', type: 'text', required: true }],
  },
  shift: {
    title: 'Novo Turno',
    fields: [
      {
        name: 'template',
        label: 'Modelo r\u00e1pido',
        type: 'select',
        required: false,
        options: SHIFT_TEMPLATE_OPTIONS,
      },
      { name: 'name', label: 'Nome do Turno', type: 'text', required: true },
      {
        name: 'family',
        label: 'Fam\u00edlia do turno',
        type: 'select',
        required: true,
        options: [
          { value: '12x36', label: '12x36' },
          { value: '5x2', label: '5x2' },
          { value: '6x1', label: '6x1' },
        ],
      },
      {
        name: 'parity',
        label: 'Paridade 12x36',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Sem paridade' },
          { value: 'par', label: 'Dia par' },
          { value: 'impar', label: 'Dia impar' },
        ],
      },
      { name: 'start', label: 'Entrada (Seg-Sex)', type: 'time', required: true },
      { name: 'end', label: 'Saida (Seg-Sex)', type: 'time', required: true },
      { name: 'sabStart', label: 'Entrada s\u00e1bado', type: 'time', required: true },
      { name: 'sabEnd', label: 'Sa\u00edda s\u00e1bado', type: 'time', required: true },
    ],
  },
}

function buildInitialValues(fields) {
  return fields.reduce((accumulator, field) => {
    if (field.type === 'select') {
      accumulator[field.name] = field.options?.[0]?.value || ''
      return accumulator
    }

    if (field.name === 'role') {
      accumulator[field.name] = 'Vigilante'
      return accumulator
    }

    if (field.name === 'family') {
      accumulator[field.name] = '12x36'
      return accumulator
    }

    accumulator[field.name] = ''
    return accumulator
  }, {})
}

function shouldRenderField(type, fieldName, values) {
  if (type !== 'shift') return true

  if (fieldName === 'parity') {
    return values.family === '12x36'
  }

  if (fieldName === 'sabStart' || fieldName === 'sabEnd') {
    return values.family === '6x1'
  }

  return true
}

export function QuickAddModal({ isOpen, type, onClose, onSave }) {
  const modalConfig = MODAL_META[type] || MODAL_META.employee
  const [values, setValues] = useState(() =>
    buildInitialValues(modalConfig.fields),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(type, values)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (name, value) => {
    setValues((previous) => {
      if (name !== 'category') {
        if (type === 'shift' && name === 'template') {
          const template = SHIFT_TEMPLATES[value]
          if (!template) {
            return { ...previous, template: '' }
          }

          return {
            ...previous,
            template: value,
            ...template,
          }
        }

        return {
          ...previous,
          [name]: value,
        }
      }

      return {
        ...previous,
        category: value,
        role: value === 'limpeza' ? 'Limpeza' : 'Vigilante',
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/60 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{modalConfig.title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            x
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3">
          {modalConfig.fields
            .filter((field) => shouldRenderField(type, field.name, values))
            .map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-sm font-medium text-slate-700">{field.label}</label>

              {field.type === 'select' ? (
                <select
                  value={values[field.name]}
                  onChange={(event) =>
                    handleFieldChange(field.name, event.target.value)
                  }
                  required={field.required && shouldRenderField(type, field.name, values)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={values[field.name]}
                  onChange={(event) =>
                    handleFieldChange(field.name, event.target.value)
                  }
                  required={field.required && shouldRenderField(type, field.name, values)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
                />
              )}
            </div>
          ))}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
