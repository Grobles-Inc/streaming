import React, { useState } from 'react'
import { Billetera } from '../data/types'

export type BilleterasDialogType = 'movimientos'

interface BilleterasContextType {
  open: BilleterasDialogType | null
  setOpen: (str: BilleterasDialogType | null) => void
  currentRow: Billetera | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Billetera | null>>
  openMovimientos: (billetera: Billetera) => void
}

const BilleterasContext = React.createContext<BilleterasContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function BilleterasProvider({ children }: Props) {
  const [open, setOpen] = useState<BilleterasDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Billetera | null>(null)

  const openMovimientos = (billetera: Billetera) => {
    setCurrentRow(billetera)
    setOpen('movimientos')
  }

  return (
    <BilleterasContext value={{ open, setOpen, currentRow, setCurrentRow, openMovimientos }}>
      {children}
    </BilleterasContext>
  )
}

export const useBilleterasContext = () => {
  const context = React.useContext(BilleterasContext)

  if (!context) {
    throw new Error('useBilleterasContext has to be used within <BilleterasProvider>')
  }

  return context
}