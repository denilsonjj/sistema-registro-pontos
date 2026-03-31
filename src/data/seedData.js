import { SHIFT_OPTIONS } from '../utils/scheduleEngine'

export const DEFAULT_EMPLOYEE_CATEGORIES = []

export const INITIAL_EMPLOYEES = [
  {
    id: 'joao-silva',
    label: 'João Silva',
    category: 'controle_de_acesso',
    categoryLabel: 'Controle de Acesso',
  },
  {
    id: 'maria-oliveira',
    label: 'Maria Oliveira',
    category: 'limpeza',
    categoryLabel: 'Limpeza',
  },
  {
    id: 'carlos-santos',
    label: 'Carlos Santos',
    category: 'controle_de_acesso',
    categoryLabel: 'Controle de Acesso',
  },
]

export const INITIAL_POSTS = [
  { id: 'condominio-alpha', label: 'Condomínio Alpha' },
  { id: 'empresa-beta', label: 'Empresa Beta' },
  { id: 'shopping-central', label: 'Shopping Central' },
]

export const INITIAL_SHIFTS = SHIFT_OPTIONS

export const LAUNCH_TYPE_OPTIONS = [
  {
    value: 'fixo',
    label: 'Turno Fixo',
    description: 'Lança uma vez e gera automaticamente o período escolhido.',
  },
  {
    value: 'eventual',
    label: 'Lançamento Eventual',
    description: 'Use para falta, cobertura, plantão extra ou contratação pontual.',
  },
]

export const EVENTUAL_REASON_OPTIONS = [
  { value: 'hora_extra', label: 'Hora extra' },
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

export const RECURRENCE_MODE_OPTIONS = [
  {
    value: 'shift_default',
    label: 'Seguir a regra do turno',
    description: 'Usa 12x36, 5x2 ou 6x1 conforme o turno escolhido.',
  },
  {
    value: 'weekly_custom',
    label: 'Semanal personalizada',
    description: 'Define os dias fixos da semana, como terça e quinta.',
  },
]
