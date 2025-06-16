import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Recarga } from '../data/schema'

type RecargasDialogType = 'create' | 'update' | 'delete' | 'import'

interface RecargasContextType {
  open: RecargasDialogType | null
  setOpen: (str: RecargasDialogType | null) => void
  currentRow: Recarga | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Recarga | null>>
}

const RecargasContext = React.createContext<RecargasContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function RecargasProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<RecargasDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Recarga | null>(null)
  return (
    <RecargasContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RecargasContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRecargas = () => {
  const recargasContext = React.useContext(RecargasContext)

  if (!recargasContext) {
    throw new Error('useRecargas has to be used within <RecargasContext>')
  }

  return recargasContext
}
