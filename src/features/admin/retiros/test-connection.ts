// Test simple para verificar la conexión con Supabase
import { supabase } from '@/lib/supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Verificar conexión básica
    console.log('1. Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('usuarios')
      .select('id, nombres, apellidos')
      .limit(1)
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError)
      return false
    }
    
    console.log('✅ Basic connection successful, user found:', testData)
    
    // Test 2: Verificar tabla retiros
    console.log('2. Testing retiros table...')
    const { data: retirosData, error: retirosError } = await supabase
      .from('retiros')
      .select('*')
      .limit(5)
    
    if (retirosError) {
      console.error('❌ Retiros table access failed:', retirosError)
      return false
    }
    
    console.log('✅ Retiros table accessible, records found:', retirosData?.length || 0)
    console.log('📋 Sample retiros data:', retirosData)
    
    // Test 3: Verificar join con usuarios
    console.log('3. Testing retiros with usuarios join...')
    const { data: joinData, error: joinError } = await supabase
      .from('retiros')
      .select(`
        *,
        usuario:usuarios!retiros_usuario_id_fkey (
          id,
          nombres,
          apellidos,
          telefono
        )
      `)
      .limit(3)
    
    if (joinError) {
      console.error('❌ Join query failed:', joinError)
      return false
    }
    
    console.log('✅ Join query successful, records:', joinData?.length || 0)
    console.log('🔗 Join data sample:', joinData)
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error during connection test:', error)
    return false
  }
}

// Función para llamar desde la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection
}
