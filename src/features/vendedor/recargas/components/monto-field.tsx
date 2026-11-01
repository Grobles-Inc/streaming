import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { UseFormReturn } from 'react-hook-form'
import {
  convertMonto,
  formatMonto,
  type Divisa,
  type RecargaFormValues,
} from '../data/schema'
import { CurrencySelect } from './currency-select'

interface MontoFieldProps {
  form: UseFormReturn<RecargaFormValues>
  tasa: number | null
}

export function MontoField({ form, tasa }: MontoFieldProps) {
  const divisa = form.watch('divisa')
  const contraparte: Divisa = divisa === 'PEN' ? 'USD' : 'PEN'
  const amount = Number(form.watch('amount')) || 0
  const convertido =
    tasa === null ? null : convertMonto(amount, divisa, contraparte, tasa)

  return (
    <FormField
      control={form.control}
      name='amount'
      rules={{
        required: 'El monto es requerido',
        validate: (value) => {
          const amount = Number(value)
          if (!Number.isFinite(amount) || amount < 1) {
            return 'Debe ser mayor a 0'
          }
          return true
        },
      }}
      render={({ field }) => (
        <FormItem>
          <div className='flex gap-2'>
            <FormControl>
              <Input
                type='text'
                inputMode='decimal'
                placeholder='0.00'
                name={field.name}
                ref={field.ref}
                value={field.value ?? ''}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <CurrencySelect
              value={divisa}
              onChange={(value) => form.setValue('divisa', value)}
            />
          </div>
          {convertido !== null && (
            <FormDescription>
              ≈ {formatMonto(convertido, contraparte)}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
