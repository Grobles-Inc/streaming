import { useState, useEffect } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

// Países de Sudamérica y México con códigos
const countries = [
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+594', name: 'Guayana Francesa', flag: '🇬🇫' },
  { code: '+592', name: 'Guyana', flag: '🇬🇾' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+597', name: 'Surinam', flag: '🇸🇷' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
]

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function PhoneInput({ value = '', onChange, placeholder = 'Número de teléfono', className }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(countries[10]) // Perú por defecto
  const [phoneNumber, setPhoneNumber] = useState('')
  const [open, setOpen] = useState(false)

  // Separar el código del país del número al cargar
  useEffect(() => {
    if (value) {
      const matchedCountry = countries.find(country => value.startsWith(country.code))
      if (matchedCountry) {
        setSelectedCountry(matchedCountry)
        setPhoneNumber(value.substring(matchedCountry.code.length))
      } else {
        setPhoneNumber(value)
      }
    }
  }, [value])

  // Actualizar el valor completo cuando cambie el país o número
  useEffect(() => {
    const fullNumber = phoneNumber ? `${selectedCountry.code}${phoneNumber}` : ''
    onChange?.(fullNumber)
  }, [selectedCountry, phoneNumber, onChange])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, '') // Solo números
    setPhoneNumber(inputValue)
  }

  return (
    <div className={cn('flex', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[120px] justify-between rounded-r-none border-r-0"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.code}</span>
            </span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar país..." />
            <CommandEmpty>No se encontró ningún país.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code}`}
                    onSelect={() => {
                      setSelectedCountry(country)
                      setOpen(false)
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                      <span className="text-muted-foreground text-sm">{country.code}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneChange}
        className="rounded-l-none"
      />
    </div>
  )
}
