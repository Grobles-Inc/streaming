import {
  IconCircleCheck,
  IconExclamationCircle,
  IconFlag,
  IconHelpOctagon,
  IconStopwatch
} from '@tabler/icons-react'
import { CompraEstado } from './schema'


export const estadosMap = new Map<CompraEstado, string>([
  ['resuelto', 'bg-green-500 text-white dark:text-white border-green-500'],
  ['soporte', 'bg-yellow-400 text-white dark:text-white border-yellow-500'],
  ['vencido', 'bg-red-500 text-white dark:text-white border-red-500'],
  ['pedido', 'bg-blue-500 text-white dark:text-white border-blue-500'],
  ['entregado', 'bg-gray-100/30 text-gray-900 dark:text-gray-200 border-gray-200'],
])




export const diasRestantesMap = new Map<number, string>([
  [5, 'bg-red-500 text-white dark:text-white border-red-500'],
  [10, 'bg-orange-400 text-white dark:text-white border-orange-500'],
  [30, 'bg-green-500 text-white dark:text-white border-green-500'],
])

export const productoOpciones = [
  {
    value: 'ver_condiciones',
    label: 'Ver Condiciones',
  },
  {
    value: 'ver_producto',
    label: 'Ver Producto',
  },
  {
    value: 'solicitud',
    label: 'Solicitud',
  },

]

export const clienteOpciones = [
  {
    value: 'editar_telefono',
    label: 'Editar Teléfono',
  },
  {
    value: 'editar_email',
    label: 'Editar Email',
  },
  {
    value: 'editar_clave',
    label: 'Editar Clave',
  },

]

export const estados = [
  {
    value: 'resuelto',
    label: 'Resuelto',
    icon: IconCircleCheck,
    color: 'bg-green-500 text-white dark:text-white border-green-500',

  },
  {
    value: 'soporte',
    label: 'Soporte',
    icon: IconHelpOctagon,
    color: 'bg-yellow-400 text-white dark:text-white border-yellow-500',
  },
  {
    value: 'vencido',
    label: 'Vencido',
    icon: IconStopwatch,
    color: 'bg-red-500 text-white dark:text-white border-red-500',
  },
  {
    value: 'pedido',
    label: 'Pedido',
    icon: IconExclamationCircle,
    color: 'bg-blue-500 text-white dark:text-white border-blue-500',
  },
  {
    value: 'entregado',
    label: 'Entregado',
    icon: IconFlag,
    color: 'bg-gray-100/30 text-gray-900 dark:text-gray-200 border-gray-200',
  },
]


