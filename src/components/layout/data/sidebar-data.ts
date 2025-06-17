import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChartBar,
  IconClipboardList,
  IconCreditCard,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconNotification,
  IconPackage,
  IconPalette,
  IconReportMoney,
  IconServerOff,
  IconSettings,
  IconShoppingCart,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers
} from '@tabler/icons-react'
import { type SidebarData, type UserRole } from '../types'

// Utility function to check if user has access to a navigation item
export const hasRoleAccess = (userRole: UserRole, allowedRoles?: UserRole[]): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true // If no roles specified, everyone has access
  }
  return allowedRoles.includes(userRole)
}

// Filter navigation items based on user role
export const filterNavItemsByRole = (items: any[], userRole: UserRole) => {
  return items.filter(item => {
    // Check if the item itself has role restrictions
    if (!hasRoleAccess(userRole, item.roles)) {
      return false
    }
    
    // If it's a collapsible item with sub-items, filter those too
    if (item.items) {
      const filteredSubItems = item.items.filter((subItem: any) => 
        hasRoleAccess(userRole, subItem.roles)
      )
      return filteredSubItems.length > 0
    }
    
    return true
  }).map(item => {
    // If it's a collapsible item, filter its sub-items
    if (item.items) {
      return {
        ...item,
        items: item.items.filter((subItem: any) => 
          hasRoleAccess(userRole, subItem.roles)
        )
      }
    }
    return item
  })
}

// Filter navigation groups based on user role
export const filterNavGroupsByRole = (groups: any[], userRole: UserRole) => {
  return groups.filter(group => {
    // Check if the group itself has role restrictions
    if (!hasRoleAccess(userRole, group.roles)) {
      return false
    }
    
    // Filter items within the group
    const filteredItems = filterNavItemsByRole(group.items, userRole)
    return filteredItems.length > 0
  }).map(group => ({
    ...group,
    items: filterNavItemsByRole(group.items, userRole)
  }))
}

// Base navigation configuration
const baseNavGroups = [  
  {
    title: 'Vendedor',
    roles: ['vendedor'],
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: IconLayoutDashboard,
        roles: ['vendedor'],
      },        
      {
        title: 'Compras',
        url: '/compras',
        icon: IconShoppingCart,
        roles: ['vendedor'],
      },        
      {
        title: 'Recargas',
        url: '/recargas',
        badge: '3',
        icon: IconCreditCard,
        roles: ['vendedor'],
      },
    ],
  },
  {
    title: 'Proveedor',
    roles: ['proveedor'],
    items: [
      {
        title: 'Productos',
        url: '/proveedor/productos',
        icon: IconPackage,
        roles: ['proveedor'],
      },
      {
        title: 'Pedidos',
        url: '/proveedor/pedidos',
        icon: IconClipboardList,
        roles: ['proveedor'],
      },
      {
        title: 'Reportes y Finanzas',
        url: '/proveedor/reportes',
        icon: IconChartBar,
        roles: ['proveedor'],
      },
    ],
  },
  {
    title: 'Administración',
    roles: ['admin'],
    items: [
      {
        title: 'Gestión de Usuarios',
        url: '/admin/users',
        icon: IconUsers,
        roles: ['admin'],
      },
      {
        title: 'Configuración del Sistema',
        url: '/admin/settings',
        icon: IconSettings,
        roles: ['admin'],
      },
      {
        title: 'Reportes Globales',
        url: '/admin/reports',
        icon: IconChartBar,
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Pages',
    roles: ['admin', 'vendedor', 'proveedor'],
    items: [
      {
        title: 'Auth',
        icon: IconLockAccess,
        roles: ['admin', 'vendedor', 'proveedor'],
        items: [
          {
            title: 'Sign In',
            url: '/sign-in',
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Sign In (2 Col)',
            url: '/sign-in-2',
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Sign Up',
            url: '/sign-up',
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Forgot Password',
            url: '/forgot-password',
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'OTP',
            url: '/otp',
            roles: ['admin', 'vendedor', 'proveedor'],
          },
        ],
      },
      {
        title: 'Errors',
        icon: IconBug,
        roles: ['admin', 'vendedor', 'proveedor'],
        items: [
          {
            title: 'Unauthorized',
            url: '/401',
            icon: IconLock,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Forbidden',
            url: '/403',
            icon: IconUserOff,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Not Found',
            url: '/404',
            icon: IconError404,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Internal Server Error',
            url: '/500',
            icon: IconServerOff,
            roles: ['admin', 'vendedor', 'proveedor'    ],
          },
          {
            title: 'Maintenance Error',
            url: '/503',
            icon: IconBarrierBlock,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
        ],
      },
    ],
  },
  {
    title: 'Otros',
    roles: ['admin', 'vendedor', 'proveedor'],
    items: [
      {
        title: 'Configuración',
        icon: IconSettings,
        roles: ['admin', 'vendedor', 'proveedor'],
        items: [
          {
            title: 'Perfil',
            url: '/settings',
            icon: IconUserCog,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Cuenta',
            url: '/settings/account',
            icon: IconTool,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Apariencia',
            url: '/settings/appearance',
            icon: IconPalette,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Notificaciones',
            url: '/settings/notifications',
            icon: IconNotification,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
          {
            title: 'Pantalla',
            url: '/settings/display',
            icon: IconBrowserCheck,
            roles: ['admin', 'vendedor', 'proveedor'],
          },
        ],
      },
      {
        title: 'Centro de Ayuda',
        url: '/help-center',
        icon: IconHelp,
        roles: ['admin', 'vendedor', 'proveedor'],
      },
    ],
  },
]

// Function to get sidebar data based on user role
export const getSidebarData = (userRole: UserRole = 'vendedor'): SidebarData => {
  const filteredGroups = filterNavGroupsByRole(baseNavGroups, userRole)
  
  return {
    user: {
      name: 'Juan Perez',
      email: 'juanperez@gmail.com',
      avatar: '/avatars/shadcn.jpg',
      role: userRole,
    },
    navGroups: filteredGroups,
  }
}

// Default export for backward compatibility
export const sidebarData = getSidebarData('vendedor')
