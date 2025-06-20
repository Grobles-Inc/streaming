import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Compra } from '../data/schema'

type ComprasDialogType = 'create' | 'update' | 'delete' | 'import' | 'renovar' | 'ver_producto'

interface ComprasContextType {
  open: ComprasDialogType | null
  setOpen: (str: ComprasDialogType | null) => void
  currentRow: Compra | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Compra | null>>
}

const ComprasContext = React.createContext<ComprasContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ComprasProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ComprasDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Compra | null>(null)
  return (
    <ComprasContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ComprasContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCompras = () => {
  const comprasContext = React.useContext(ComprasContext)

  if (!comprasContext) {
    throw new Error('useCompras has to be used within <ComprasContext>')
  }

  return comprasContext
}
