import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useConversion() {
  const [conversion, setConversion] = useState<number>(3.75) // Valor por defecto
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversion()
  }, [])

  const fetchConversion = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('configuracion')
        .select('conversion')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.warn('Error al obtener tasa de conversión, usando valor por defecto:', error)
        return
      }

      if (data?.conversion) {
        setConversion(data.conversion)
      }
    } catch (error) {
      console.warn('Error al cargar tasa de conversión:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: 'USD' | 'PEN' = 'USD') => {
    if (currency === 'PEN') {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(amount * conversion)
    }
    
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return {
    conversion,
    loading,
    formatCurrency,
    refreshConversion: fetchConversion
  }
}
