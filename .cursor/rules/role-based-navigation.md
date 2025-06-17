# Role-Based Navigation System

This application implements a comprehensive role-based access control (RBAC) system for navigation with three user roles: `vendedor`, `proveedor`, and `admin`.

## Roles Overview

### 1. Vendedor (Salesperson)
- **Access**: General dashboard, chats, vendedor-specific features, settings
- **Features**: 
  - Dashboard
  - Compras (Purchases)
  - Recargas (Recharges)
  - Chats
  - Settings

### 2. Proveedor (Supplier)
- **Access**: General dashboard, chats, proveedor-specific features, settings
- **Features**:
  - Dashboard
  - Productos (Products)
  - Pedidos (Orders)
  - Reportes (Reports)
  - Finanzas (Finances)
  - Chats
  - Settings

### 3. Admin (Administrator)
- **Access**: All features across all roles
- **Features**:
  - All vendedor features
  - All proveedor features
  - User management
  - System configuration
  - Global reports
  - Tasks
  - Apps
  - Auth pages
  - Error pages

## Implementation Details

### Type Definitions
```typescript
export type UserRole = 'vendedor' | 'proveedor' | 'admin'
```

### Navigation Structure
Each navigation item can have a `roles` property that specifies which roles can access it:

```typescript
{
  title: 'Dashboard',
  url: '/apps',
  icon: IconLayoutDashboard,
  roles: ['admin', 'vendedor', 'proveedor'], // All roles can access
}
```

### Key Components

#### 1. `getSidebarData(userRole: UserRole)`
Returns filtered navigation data based on the user's role.

#### 2. `hasRoleAccess(userRole: UserRole, allowedRoles?: UserRole[])`
Utility function to check if a user has access to a specific feature.

#### 3. `useRoleNavigation()`
Hook that provides role-based navigation data and access control utilities.

#### 4. `RoleGuard`
Component for protecting routes and components based on user roles.

### Usage Examples

#### Using the Role Navigation Hook
```typescript
import { useRoleNavigation } from '@/hooks/use-role-navigation'

function MyComponent() {
  const { userRole, hasAccess, navGroups } = useRoleNavigation()
  
  if (!hasAccess(['admin'])) {
    return <div>Access denied</div>
  }
  
  return <div>Admin content</div>
}
```

#### Using the Role Guard Component
```typescript
import { RoleGuard } from '@/components/role-guard'

function ProtectedComponent() {
  return (
    <RoleGuard allowedRoles={['admin', 'vendedor']}>
      <div>Protected content</div>
    </RoleGuard>
  )
}
```

#### Protecting Routes
```typescript
// In your route component
function AdminRoute() {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={<Navigate to="/unauthorized" />}>
      <AdminDashboard />
    </RoleGuard>
  )
}
```

## Navigation Groups

### General
- Available to all roles
- Contains shared features like dashboard and chats

### Vendedor
- Available to vendedor and admin roles
- Contains sales-specific features

### Proveedor
- Available to proveedor and admin roles
- Contains supplier-specific features

### Administración
- Available only to admin role
- Contains system administration features

### Pages
- Available only to admin role
- Contains auth and error pages for development/testing

### Other
- Available to all roles
- Contains settings and help center

## Demo Features

The application includes a role switcher component for demonstration purposes. Users can switch between roles to see how the navigation changes dynamically.

## Integration with Auth Store

The role-based navigation integrates with the existing auth store:

```typescript
interface AuthUser {
  accountNo: string
  email: string
  role: UserRole  // Single role instead of array
  exp: number
}
```

## Best Practices

1. **Always check roles**: Use the `hasAccess` function or `RoleGuard` component to protect sensitive features
2. **Default to restrictive**: If no roles are specified for a navigation item, it's available to all roles
3. **Use TypeScript**: Leverage the `UserRole` type for type safety
4. **Test all roles**: Ensure your application works correctly for all three roles
5. **Graceful degradation**: Provide appropriate fallbacks when users don't have access

## Future Enhancements

- Role hierarchy system
- Dynamic role assignment
- Role-based permissions for specific actions
- Audit logging for role changes
- Multi-role support per user 