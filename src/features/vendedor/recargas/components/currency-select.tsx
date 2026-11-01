import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Divisa } from '../data/schema'

interface CurrencySelectProps {
  value: Divisa
  onChange: (value: Divisa) => void
  disabled?: boolean
}

const divisas: Divisa[] = ['PEN', 'USD']

export function CurrencySelect({
  value,
  onChange,
  disabled,
}: CurrencySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as Divisa)}
      disabled={disabled}
    >
      <SelectTrigger className='w-20' aria-label='Divisa'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {divisas.map((divisa) => (
          <SelectItem key={divisa} value={divisa}>
            {divisa}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
