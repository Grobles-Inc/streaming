// Página principal
export { default as ConfiguracionSistemaPage } from './configuracion-sistema-page'

// Componentes
export { MantenimientoConfirmDialog } from './components/mantenimiento-confirm-dialog'
export { HistorialConfiguracionCard } from './components/historial-configuracion'

// Hooks
export { useConfiguracion } from './hooks/use-configuracion'

// Servicios
export { ConfiguracionService } from './services/configuracion.service'

// Tipos
export type {
  ConfiguracionRow,
  MappedConfiguracion,
  HistorialConfiguracion,
  CreateConfiguracionData,
  UpdateConfiguracionData
} from './data/types'
