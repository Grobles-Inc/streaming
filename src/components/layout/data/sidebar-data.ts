import {
  IconCash,
  IconChartBar,
  IconClipboardList,
  IconCoins,
  IconCreditCard,
  IconFlag,
  IconHome,
  IconLayoutDashboard,
  IconPackage,
  IconSettings,
  IconShoppingCart,
  IconUserCog,
  IconUsers,
  IconWallet
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
    title: 'Tienda',
    roles: ['admin', 'registrado', 'seller', 'provider'],
    items: [
      {
        title: 'Ir a la Tienda',
        url: '/',
        icon: IconHome,
        roles: ['admin', 'registrado', 'seller', 'provider'],
      }
    ]
  },
  {
    title: 'Usuario Registrado',
    roles: ['registrado'],
    items: [
      {
        title: 'Mi Perfil',
        url: '/profile',
        icon: IconLayoutDashboard,
        roles: ['registrado'],
      },
    ]
  },
  {
    title: 'Vendedor',
    roles: ['seller'],
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: IconLayoutDashboard,
        roles: ['seller'],
      },        
      {
        title: 'Compras',
        url: '/compras',
        icon: IconShoppingCart,
        roles: ['seller'],
      },        
        {
          title: 'Recargas',
          url: '/recargas',
          icon: IconCreditCard,
          roles: ['seller'],
        },
        {
          title: 'Referidos',
          url: '/referidos',
          icon: IconUsers,
          roles: ['seller'],
        },
    ],
  },
  {
    title: 'Proveedor',
    roles: ['provider'],
    items: [
      {
        title: 'Productos',
        url: '/proveedor/productos',
        icon: IconPackage,
        roles: ['provider'],
      },
      {
        title: 'Cuentas',
        url: '/proveedor/cuentas',
        icon: IconUserCog,
        roles: ['provider'],
      },
      {
        title: 'Pedidos',
        url: '/proveedor/pedidos',
        icon: IconClipboardList,
        roles: ['provider'],
      },
      {
        title: 'Reportes y Finanzas',
        url: '/proveedor/reportes',
        icon: IconChartBar,
        roles: ['provider'],
      },
      {
        title: 'Billetera',
        url: '/proveedor/billetera',
        icon: IconWallet,
        roles: ['provider'],
      }
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
        title: 'Categorías y Productos',
        url: '/admin/categories',
        icon: IconFlag,
        roles: ['admin'],
      },
      {
        title: 'Gestión de Compras',
        url: '/admin/compras',
        icon: IconShoppingCart,
        roles: ['admin'],
      },
      {
        title: 'Gestión de Billeteras',
        url: '/admin/billeteras',
        icon: IconWallet,
        roles: ['admin'],
      },
      {
        title: 'Gestión de Recargas',
        url: '/admin/recargas',
        icon: IconCash,
        roles: ['admin'],
      },
      {
        title: 'Gestión de Retiros',
        url: '/admin/retiros',
        icon: IconCoins,
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
        url: '/admin/reportes-globales',
        icon: IconChartBar,
        roles: ['admin'],
      },
    ],
  },
  // {
  //   title: 'Pages',
  //   roles: ['admin', 'seller', 'provider'],
  //   items: [
  //     {
  //       title: 'Auth',
  //       icon: IconLockAccess,
  //       roles: ['admin', 'seller', 'provider'],
  //       items: [
  //         {
  //           title: 'Sign In',
  //           url: '/sign-in',
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Sign In (2 Col)',
  //           url: '/sign-in-2',
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Sign Up',
  //           url: '/sign-up',
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Forgot Password',
  //           url: '/forgot-password',
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'OTP',
  //           url: '/otp',
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Errors',
  //       icon: IconBug,
  //       roles: ['admin', 'seller', 'provider'],
  //       items: [
  //         {
  //           title: 'Unauthorized',
  //           url: '/401',
  //           icon: IconLock,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Forbidden',
  //           url: '/403',
  //           icon: IconUserOff,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Not Found',
  //           url: '/404',
  //           icon: IconError404,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Internal Server Error',
  //           url: '/500',
  //           icon: IconServerOff,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Maintenance Error',
  //           url: '/503',
  //           icon: IconBarrierBlock,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   title: 'Otros',
  //   roles: ['admin', 'seller', 'provider'],
  //   items: [
  //     {
  //       title: 'Configuración',
  //       icon: IconSettings,
  //       roles: ['admin', 'seller', 'provider'],
  //       items: [
  //         {
  //           title: 'Perfil',
  //           url: '/settings',
  //           icon: IconUserCog,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Cuenta',
  //           url: '/settings/account',
  //           icon: IconTool,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Apariencia',
  //           url: '/settings/appearance',
  //           icon: IconPalette,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Notificaciones',
  //           url: '/settings/notifications',
  //           icon: IconNotification,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //         {
  //           title: 'Pantalla',
  //           url: '/settings/display',
  //           icon: IconBrowserCheck,
  //           roles: ['admin', 'seller', 'provider'],
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Centro de Ayuda',
  //       url: '/help-center',
  //       icon: IconHelp,
  //       roles: ['admin', 'seller', 'provider'],
  //     },
  //   ],
  // },
]

// Function to get sidebar data based on user role and user data
export const getSidebarData = (userRole: UserRole = 'registrado', user?: any): SidebarData => {
  const filteredGroups = filterNavGroupsByRole(baseNavGroups, userRole)
  
  return {
    user: {
      id: user?.id || '',
      nombre: user?.nombre || '',
      avatar: user?.avatar || '',
      rol: user?.rol as UserRole || userRole,
      apellido: user?.apellido || '',
      telefono: user?.telefono || '',
      balance: user?.balance || 0,
      created_at: user?.created_at || '',
      updated_at: user?.updated_at || '',
    },
    navGroups: filteredGroups,
  }
}

// Function to get navigation groups only (without user data)
export const getNavGroups = (userRole: UserRole = 'registrado') => {
  return filterNavGroupsByRole(baseNavGroups, userRole)
}

// Default export for backward compatibility - only navigation groups
export const sidebarData = getNavGroups('registrado')
