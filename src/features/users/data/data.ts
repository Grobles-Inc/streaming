import {
  IconCash,
  IconUsersGroup,
  IconUserShield,
} from '@tabler/icons-react'

export const callTypes = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const userTypes = [
  {
    label: 'Admin',
    value: 'admin',
    icon: IconUserShield,
  },
  {
    label: 'Provider',
    value: 'provider',
    icon: IconUsersGroup,
  },
  {
    label: 'Seller',
    value: 'seller',
    icon: IconCash,
  },
] as const
