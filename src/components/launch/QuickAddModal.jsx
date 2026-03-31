import { useEffect, useMemo, useState } from 'react'
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
    title: 'Novo Colaborador',
    fields: [
      { name: 'cpf', label: 'CPF', type: 'text', required: true },
      { name: 'startDate', label: 'Data de início', type: 'date', required: true },
      { name: 'name', label: 'Nome completo', type: 'text', required: true },
      {
        name: 'category',
        label: 'Categoria',
        type: 'text',
        required: true,
        placeholder: 'Controle de Acesso, Limpeza, Manutenção...',
      },
    ],
  },
  post: {
    title: 'Novo Posto',
    fields: [{ name: 'name', label: 'Nome do posto', type: 'text', required: true }],
  },
  shift: {
    title: 'Novo Turno',
    fields: [
      {
        name: 'template',
        label: 'Modelo rápido',
        type: 'select',
        required: false,
        options: SHIFT_TEMPLATE_OPTIONS,
      },
      { name: 'name', label: 'Nome do turno', type: 'text', required: true },
      {
        name: 'family',
        label: 'Família do turno',
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
        label: 'Paridade do 12x36',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Sem paridade' },
          { value: 'par', label: 'Dia par' },
          { value: 'impar', label: 'Dia ímpar' },
        ],
      },
      { name: 'start', label: 'Entrada padrão', type: 'time', required: true },
      { name: 'end', label: 'Saída padrão', type: 'time', required: true },
      { name: 'sabStart', label: 'Entrada sábado', type: 'time', required: true },
      { name: 'sabEnd', label: 'Saída sábado', type: 'time', required: true },
    ],
  },
}

function buildInitialValues(fields) {
  return fields.reduce((accumulator, field) => {
    if (field.type === 'select') {
      accumulator[field.name] = field.options?.[0]?.value || ''
      return accumulator
    }

    if (field.name === 'category') {
      accumulator[field.name] = 'Controle de Acesso'
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
  const modalConfig = useMemo(() => MODAL_META[type] || MODAL_META.employee, [type])
  const [values, setValues] = useState(() => buildInitialValues(modalConfig.fields))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(buildInitialValues(modalConfig.fields))
    setIsSubmitting(false)
  }, [modalConfig])

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
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-white p-4 shadow-2xl sm:p-5">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-950">{modalConfig.title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
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
                <label className="text-sm font-medium text-zinc-800">{field.label}</label>

                {field.type === 'select' ? (
                  <select
                    value={values[field.name]}
                    onChange={(event) => handleFieldChange(field.name, event.target.value)}
                    required={field.required && shouldRenderField(type, field.name, values)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
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
                    onChange={(event) => handleFieldChange(field.name, event.target.value)}
                    required={field.required && shouldRenderField(type, field.name, values)}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                  />
                )}
              </div>
            ))}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
