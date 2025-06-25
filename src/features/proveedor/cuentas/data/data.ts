import {
  IconUser,
  IconUsers,
  IconPackage,
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { Cuenta, Tipo, Estado } from './schema'

export const tipos = [
  {
    value: 'cuenta' as Tipo,
    label: 'Cuenta',
    icon: IconUser,
    color: 'text-blue-500',
  },
  {
    value: 'perfiles' as Tipo,
    label: 'Perfiles',
    icon: IconUsers,
    color: 'text-green-500',
  },
  {
    value: 'combo' as Tipo,
    label: 'Combo',
    icon: IconPackage,
    color: 'text-purple-500',
  },
]

export const estados = [
  {
    value: 'disponible' as Estado,
    label: 'Disponible',
    icon: IconCheck,
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    value: 'vendido' as Estado,
    label: 'Vendido',
    icon: IconX,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
]

export const estadosBool = new Map([
  [true, 'text-green-600 bg-green-50 border-green-200'],
  [false, 'text-red-600 bg-red-50 border-red-200'],
])

// Datos estáticos de ejemplo
export const cuentasData: Cuenta[] = [
  {
    id: 1,
    producto_id: '1',
    tipo: 'cuenta',
    email: 'netflix1@ejemplo.com',
    clave: 'ClaveSegura123',
    url: 'https://netflix.com',
    perfil: 'Perfil Principal',
    pin: '1234',
    created_at: '2024-01-15T00:00:00Z',
    estado: 'disponible',
    publicado: true,
    productos: {
      id: '1',
      nombre: 'Netflix Premium 4K',
      precio_publico: 15000,
      proveedor_id: 'prov-1'
    }
  },
  {
    id: 2,
    producto_id: '2',
    tipo: 'cuenta',
    email: 'spotify1@ejemplo.com',
    clave: 'MusicPass456',
    url: 'https://spotify.com',
    perfil: null,
    pin: null,
    created_at: '2024-01-20T00:00:00Z',
    estado: 'disponible',
    publicado: true,
    productos: {
      id: '2',
      nombre: 'Spotify Premium Individual',
      precio_publico: 8000,
      proveedor_id: 'prov-1'
    }
  },
  {
    id: 3,
    producto_id: '3',
    tipo: 'perfiles',
    email: 'disney1@ejemplo.com',
    clave: 'DisneyMagic789',
    url: 'https://disneyplus.com',
    perfil: 'Perfil Familiar',
    pin: '5678',
    created_at: '2024-02-01T00:00:00Z',
    estado: 'vendido',
    publicado: true,
    productos: {
      id: '3',
      nombre: 'Disney+ Bundle',
      precio_publico: 12000,
      proveedor_id: 'prov-1'
    }
  },
  {
    id: 4,
    producto_id: '4',
    tipo: 'combo',
    email: 'combo1@ejemplo.com',
    clave: 'ComboAccess321',
    url: null,
    perfil: 'Múltiples Perfiles',
    pin: '9999',
    created_at: '2024-01-10T00:00:00Z',
    estado: 'disponible',
    publicado: false,
    productos: {
      id: '4',
      nombre: 'Combo Streaming',
      precio_publico: 25000,
      proveedor_id: 'prov-1'
    }
  },
  {
    id: 5,
    producto_id: '5',
    tipo: 'perfiles',
    email: 'youtube1@ejemplo.com',
    clave: 'YouTubeFamily654',
    url: 'https://youtube.com/premium',
    perfil: 'Familiar',
    pin: '1111',
    created_at: '2024-02-15T00:00:00Z',
    estado: 'disponible',
    publicado: true,
    productos: {
      id: '5',
      nombre: 'YouTube Premium Familiar',
      precio_publico: 10000,
      proveedor_id: 'prov-1'
    }
  },
  {
    id: 6,
    producto_id: '6',
    tipo: 'cuenta',
    email: 'hbo1@ejemplo.com',
    clave: 'HBOMax987',
    url: 'https://hbomax.com',
    perfil: 'Principal',
    pin: '2222',
    created_at: '2024-01-05T00:00:00Z',
    estado: 'vendido',
    publicado: true,
    productos: {
      id: '6',
      nombre: 'HBO Max Anual',
      precio_publico: 18000,
      proveedor_id: 'prov-1'
    }
  },
  {
    id: 7,
    producto_id: '7',
    tipo: 'cuenta',
    email: 'crunchyroll1@ejemplo.com',
    clave: 'AnimePass111',
    url: 'https://crunchyroll.com',
    perfil: null,
    pin: null,
    created_at: '2024-02-20T00:00:00Z',
    estado: 'disponible',
    publicado: true,
    productos: {
      id: '7',
      nombre: 'Crunchyroll Premium',
      precio_publico: 7000,
      proveedor_id: 'prov-1'
    }
  },
  {
    id: 8,
    producto_id: '8',
    tipo: 'cuenta',
    email: 'paramount1@ejemplo.com',
    clave: 'ParamountPlus222',
    url: 'https://paramountplus.com',
    perfil: 'Usuario Principal',
    pin: '3333',
    created_at: '2024-01-25T00:00:00Z',
    estado: 'disponible',
    publicado: false,
    productos: {
      id: '8',
      nombre: 'Paramount+ Premium',
      precio_publico: 9000,
      proveedor_id: 'prov-1'
    }
  },
] 