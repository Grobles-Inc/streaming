import { LinkProps } from '@tanstack/react-router'

// Define the available roles
type UserRole = 'vendedor' | 'proveedor' | 'admin'

interface User {
  name: string
  email: string
  avatar: string
  role: UserRole
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
  roles?: UserRole[] // Optional roles that can access this item
}

type NavLink = BaseNavItem & {
  url: LinkProps['to']
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  title: string
  items: NavItem[]
  roles?: UserRole[] // Optional roles that can see this group
}

interface SidebarData {
  user: User
  navGroups: NavGroup[]
}

interface Categoria {
  name: string
  subtitle: string
  icon: string
  tab: string
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink, Categoria , UserRole }
