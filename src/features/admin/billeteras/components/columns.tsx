import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { ColumnDef } from '@tanstack/react-table'
import { Billetera } from '../data/types'
import { useBilleterasContext } from '../context/billeteras-context'
import { formatCurrency } from '../utils/currency'

const getRolBadge = (rol: string) => {
  const variants = {
    provider: 'bg-blue-500 text-white',
    seller: 'bg-green-500 text-white',
    admin: 'bg-gray-500 text-white',
    registered: 'bg-purple-500 text-white',
  } as const

  const labels = {
    admin: 'Administrador',
    provider: 'Proveedor',
    seller: 'Vendedor',
    registered: 'Registrado',
  }

  return (
    <Badge className={`${variants[rol as keyof typeof variants] || 'bg-gray-500 text-white'} px-2 py-1 text-xs`}>
      {labels[rol as keyof typeof labels] || rol}
    </Badge>
  )
}

const NombreCompletoCell = ({ row }: { row: Billetera }) => {
  const { nombres, apellidos, usuario } = row.usuario || {}
  return (
    <div className='flex flex-col'>
      <span className='font-medium'>{nombres} {apellidos}</span>
      <span className='text-xs text-muted-foreground font-mono'>@{usuario}</span>
    </div>
  )
}

const EmailCell = ({ row }: { row: Billetera }) => {
  const { email } = row.usuario || {}
  return <span className='w-48 break-all whitespace-normal' title={email}>{email}</span>
}

const TelefonoCell = ({ row }: { row: Billetera }) => {
  const { telefono } = row.usuario || {}
  return telefono ? (
    <span className='text-xs text-muted-foreground'>{telefono}</span>
  ) : (
    <span className='text-xs text-muted-foreground'>Sin teléfono</span>
  )
}

const SaldoCell = ({ row }: { row: Billetera }) => {
  const saldo = row.saldo
  return (
    <span className={`font-semibold ${saldo === 0 ? 'text-destructive' : 'text-green-600'}`}>
      {formatCurrency(saldo)}
    </span>
  )
}

const AccionesCell = ({ row }: { row: Billetera }) => {
  const { openMovimientos } = useBilleterasContext()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='icon' variant='outline'>
          <DotsVerticalIcon className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => openMovimientos(row)}
          className='flex items-center gap-2'
        >
          Ver movimientos
        </DropdownMenuItem>
        <DropdownMenuItem className='flex items-center gap-2'>
          Ver detalles
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<Billetera>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className='font-mono text-xs'>{row.original.id.slice(0, 8)}...</span>
    ),
    enableHiding: false,
  },
  {
    id: 'nombre_completo',
    header: 'Usuario',
    cell: ({ row }) => <NombreCompletoCell row={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <EmailCell row={row.original} />,
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono',
    cell: ({ row }) => <TelefonoCell row={row.original} />,
  },
  {
    accessorKey: 'rol',
    header: 'Rol',
    cell: ({ row }) => {
      const { rol } = row.original.usuario || {}
      return <div className='flex justify-center'>{rol && getRolBadge(rol)}</div>
    },
    filterFn: (row, _id, value) => {
      const rol = row.original.usuario?.rol || ''
      return value.includes(rol)
    },
  },
  {
    accessorKey: 'saldo',
    header: 'Saldo',
    cell: ({ row }) => <SaldoCell row={row.original} />,
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <AccionesCell row={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
]