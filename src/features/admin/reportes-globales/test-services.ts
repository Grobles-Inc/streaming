// Test file to verify services work correctly
import { ReportesGlobalesService } from './services/reportes-globales.service'

export async function testReportesGlobalesServices() {
  try {
    console.log('Testing ReportesGlobalesService...')
    
    // Test usuarios
    console.log('Fetching usuarios...')
    const usuarios = await ReportesGlobalesService.getUsuarios()
    console.log(`Found ${usuarios.length} usuarios`)
    
    // Test productos
    console.log('Fetching productos...')
    const productos = await ReportesGlobalesService.getProductos()
    console.log(`Found ${productos.length} productos`)
    
    // Test recargas
    console.log('Fetching recargas...')
    const recargas = await ReportesGlobalesService.getRecargas()
    console.log(`Found ${recargas.length} recargas`)
    
    // Test métricas
    console.log('Fetching métricas...')
    const metricas = await ReportesGlobalesService.getMetricasGlobales()
    console.log('Métricas:', metricas)
    
    console.log('All tests passed!')
    return true
  } catch (error) {
    console.error('Test failed:', error)
    return false
  }
}

// Uncomment to run tests
// testReportesGlobalesServices()
