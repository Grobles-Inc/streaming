// Página principal
export { default as ConfiguracionSistemaPage } from './configuracion-sistema-page'

// Componentes
export { MantenimientoConfirmDialog } from './components/mantenimiento-confirm-dialog'
export { HistorialConfiguracionCard } from './components/historial-configuracion'
export { PurgaContableCard } from './components/purga-contable-card'

// Hooks
export { useConfiguracion } from './hooks/use-configuracion'
export { usePurgaContable } from './hooks/use-purga-contable'

// Servicios
export { ConfiguracionService } from './services/configuracion.service'
export { ContabilidadService } from './services/contabilidad.service'

// Tipos
export type {
  ConfiguracionRow,
  MappedConfiguracion,
  HistorialConfiguracion,
  CreateConfiguracionData,
  UpdateConfiguracionData,
  ArchivoContableRow,
  PurgaContableResult
} from './data/types'
