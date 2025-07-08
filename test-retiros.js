// Script de prueba rápida para verificar la tabla retiros
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testRetiros() {
  console.log('🔍 Testing retiros table...')
  
  // Test 1: Verificar si la tabla retiros existe y tiene datos
  try {
    const { data, error, count } = await supabase
      .from('retiros')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log('📊 Retiros table test:')
    console.log('- Count:', count)
    console.log('- Error:', error)
    console.log('- Sample data:', data)
  } catch (err) {
    console.error('❌ Error testing retiros table:', err)
  }

  // Test 2: Verificar la tabla usuarios
  try {
    const { data, error, count } = await supabase
      .from('usuarios')
      .select('id, nombres, apellidos, telefono, billetera_id', { count: 'exact' })
      .limit(5)
    
    console.log('📊 Usuarios table test:')
    console.log('- Count:', count)
    console.log('- Error:', error)
    console.log('- Sample data:', data)
  } catch (err) {
    console.error('❌ Error testing usuarios table:', err)
  }
}

testRetiros()
