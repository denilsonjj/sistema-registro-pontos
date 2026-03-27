import { SHIFT_OPTIONS } from '../utils/scheduleEngine'

export const EMPLOYEE_CATEGORY_OPTIONS = [
  { value: 'vigilante', label: 'Vigilante' },
  { value: 'limpeza', label: 'Limpeza' },
]

export const INITIAL_EMPLOYEES = [
  { id: 'joao-silva', label: 'Joao Silva', role: 'Vigilante', category: 'vigilante' },
  { id: 'maria-oliveira', label: 'Maria Oliveira', role: 'Limpeza', category: 'limpeza' },
  { id: 'carlos-santos', label: 'Carlos Santos', role: 'Vigilante', category: 'vigilante' },
]

export const INITIAL_POSTS = [
  { id: 'condominio-alpha', label: 'Condominio Alpha' },
  { id: 'empresa-beta', label: 'Empresa Beta' },
  { id: 'shopping-central', label: 'Shopping Central' },
]

export const INITIAL_SHIFTS = SHIFT_OPTIONS

export const LAUNCH_TYPE_OPTIONS = [
  {
    value: 'fixo',
    label: 'Turno Fixo',
    description: 'Lanca uma vez e gera automaticamente por 30, 60 ou 120 dias.',
  },
  {
    value: 'eventual',
    label: 'Turno Eventual',
    description: 'Para extra, falta, cobertura ou contratacao pontual.',
  },
]

export const EVENTUAL_REASON_OPTIONS = [
  { value: 'hora_extra', label: 'Hora Extra' },
  { value: 'falta_sem_atestado', label: 'Falta sem atestado' },
  { value: 'falta_com_atestado', label: 'Falta com atestado' },
  { value: 'cobertura_avulsa', label: 'Cobertura avulsa' },
  { value: 'contratado_eventual', label: 'Contratado eventual' },
]

export const BATCH_DAYS_OPTIONS = [
  { value: 30, label: '30 dias' },
  { value: 60, label: '60 dias' },
  { value: 120, label: '120 dias' },
]
