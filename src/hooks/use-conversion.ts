import { useQuery } from '@tanstack/react-query'
import { DEFAULT_CONVERSION, getLatestConversion } from '@/lib/conversion'

const conversionQueryKey = ['configuracion', 'conversion'] as const

function useConversionQuery() {
  return useQuery({
    queryKey: conversionQueryKey,
    queryFn: getLatestConversion,
    staleTime: 1000 * 60 * 5,
  })
}

export function useConversionRate() {
  const { data, isLoading } = useConversionQuery()

  return {
    conversion: data ?? DEFAULT_CONVERSION,
    isLoading,
  }
}

export function useConversion() {
  const { data, isLoading, refetch } = useConversionQuery()
  const conversion = data ?? DEFAULT_CONVERSION

  const formatCurrency = (amount: number, currency: 'USD' | 'PEN' = 'USD') => {
    if (currency === 'PEN') {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
      }).format(amount * conversion)
    }

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return {
    conversion,
    loading: isLoading,
    formatCurrency,
    refreshConversion: refetch,
  }
}
