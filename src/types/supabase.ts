export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Global switch for how new accounts may be created.
 *
 * - `open`   anyone can self register from /sign-up
 * - `invite` /sign-up is off; only /register with a valid token works
 * - `closed` nobody can register at all
 *
 * Mirrors the configuracion_signup_mode_check constraint on the table.
 */
export const SIGNUP_MODES = ['open', 'invite', 'closed'] as const
export type SignupMode = (typeof SIGNUP_MODES)[number]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nombres: string
          usuario: string
          password: string
          billetera_id: string | null
          codigo_referido: string
          referido_id: string | null
          apellidos: string
          telefono: string | null
          rol: 'provider' | 'admin' | 'seller' | 'registered'
          created_at: string
          updated_at: string
          estado_habilitado: boolean
          ip_registro: string | null
        }
        Insert: {
          id?: string
          email: string
          nombres: string
          usuario: string
          password?: string
          billetera_id?: string | null
          codigo_referido?: string
          referido_id?: string | null
          apellidos: string
          telefono?: string | null
          rol?: 'provider' | 'admin' | 'seller' | 'registered'
          created_at?: string
          updated_at?: string
          estado_habilitado?: boolean
          ip_registro?: string | null
        }
        Update: {
          id?: string
          email?: string
          nombres?: string
          usuario?: string
          password?: string
          billetera_id?: string | null
          codigo_referido?: string
          referido_id?: string | null
          apellidos?: string
          telefono?: string | null
          rol?: 'provider' | 'admin' | 'seller' | 'registered'
          created_at?: string
          updated_at?: string
          estado_habilitado?: boolean
          ip_registro?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'usuarios_referido_id_fkey'
            columns: ['referido_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      billeteras: {
        Row: {
          id: string
          usuario_id: string
          saldo: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          saldo: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          saldo?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'billeteras_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      productos: {
        Row: {
          id: number
          usuarios: {
            nombres: string
            apellidos: string
            billetera_id: string
            usuario: string
          }
          nombre: string
          descripcion: string | null
          informacion: string | null
          condiciones: string | null
          precio_publico: number
          categoria_id: string
          proveedor_id: string
          imagen_url: string | null
          created_at: string
          updated_at: string
          tiempo_uso: number
          nuevo: boolean
          descripcion_completa: string | null
          disponibilidad: 'en_stock' | 'a_pedido' | 'activacion'
          renovable: boolean
          solicitud: string | null
          muestra_disponibilidad_stock: boolean
          deshabilitar_boton_comprar: boolean
          precio_vendedor: number
          precio_renovacion: number | null
          estado: 'borrador' | 'publicado'
          fecha_expiracion: string | null
          stock_de_productos: {
            id: number
          }[]
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string | null
          informacion?: string | null
          condiciones?: string | null
          precio_publico: number
          categoria_id: string
          proveedor_id: string
          imagen_url?: string | null
          tiempo_uso?: number
          nuevo?: boolean
          descripcion_completa?: string | null
          disponibilidad: 'en_stock' | 'a_pedido' | 'activacion'
          renovable?: boolean
          solicitud?: string | null
          muestra_disponibilidad_stock?: boolean
          deshabilitar_boton_comprar?: boolean
          precio_vendedor: number
          precio_renovacion?: number | null
          estado?: 'borrador' | 'publicado'
          fecha_expiracion?: string | null
          stock_de_productos?: {
            id: number
          }[]
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string | null
          informacion?: string | null
          condiciones?: string | null
          precio_publico?: number
          categoria_id?: string
          proveedor_id?: string
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
          tiempo_uso?: number
          nuevo?: boolean
          descripcion_completa?: string | null
          disponibilidad?: 'en_stock' | 'a_pedido' | 'activacion'
          renovable?: boolean
          solicitud?: string | null
          muestra_disponibilidad_stock?: boolean
          deshabilitar_boton_comprar?: boolean
          precio_vendedor?: number
          precio_renovacion?: number | null
          estado?: 'borrador' | 'publicado'
          fecha_expiracion?: string | null
          stock_de_productos?: {
            id: number
          }[]
        }
        Relationships: [
          {
            foreignKeyName: 'productos_categoria_id_fkey'
            columns: ['categoria_id']
            isOneToOne: false
            referencedRelation: 'categorias'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'productos_proveedor_id_fkey'
            columns: ['proveedor_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      stock_productos: {
        Row: {
          id: number
          proveedor_id: string
          email: string | null
          clave: string | null
          pin: string | null
          perfil: string | null
          producto_id: number
          tipo: 'cuenta' | 'perfiles' | 'combo'
          url: string | null
          created_at: string
          estado: 'disponible' | 'vendido'
          publicado: boolean
          soporte_stock_producto: 'activo' | 'vencido' | 'soporte'
        }
        Insert: {
          id?: number
          proveedor_id?: string
          email?: string | null
          clave?: string | null
          pin?: string | null
          perfil?: string | null
          producto_id: number
          tipo: 'cuenta' | 'perfiles' | 'combo'
          url?: string | null
          created_at?: string
          estado?: 'disponible' | 'vendido'
          publicado?: boolean
          soporte_stock_producto?: 'activo' | 'vencido' | 'soporte'
        }
        Update: {
          id?: number
          proveedor_id?: string
          email?: string | null
          clave?: string | null
          pin?: string | null
          perfil?: string | null
          producto_id?: number
          tipo?: 'cuenta' | 'perfiles' | 'combo'
          url?: string | null
          created_at?: string
          estado?: 'disponible' | 'vendido'
          publicado?: boolean
          soporte_stock_producto?: 'activo' | 'vencido' | 'soporte'
        }
        Relationships: [
          {
            foreignKeyName: 'stock_productos_producto_id_fkey'
            columns: ['producto_id']
            isOneToOne: false
            referencedRelation: 'productos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stock_productos_proveedor_id_fkey'
            columns: ['proveedor_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          imagen_url: string | null
          created_at: string
          updated_at: string
          orden: number
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
          orden?: number
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
          orden?: number
        }
        Relationships: []
      }
      compras: {
        Row: {
          id: number
          proveedor_id: string
          producto_id: number
          vendedor_id: string | null
          stock_producto_id: number | null
          fecha_expiracion: string | null
          nombre_cliente: string
          telefono_cliente: string
          precio: number
          estado: string
          soporte_mensaje: string | null
          soporte_asunto: string | null
          soporte_respuesta: string | null
          monto_reembolso: number
          created_at: string
          updated_at: string
          renovado: boolean
        }
        Insert: {
          id?: number
          proveedor_id: string
          producto_id: number
          vendedor_id?: string | null
          stock_producto_id?: number | null
          fecha_expiracion?: string | null
          fecha_inicio?: string | null
          nombre_cliente: string
          telefono_cliente: string
          precio: number
          estado?: string
          soporte_mensaje?: string | null
          soporte_asunto?: string | null
          soporte_respuesta?: string | null
          monto_reembolso?: number
          created_at?: string
          updated_at?: string
          renovado?: boolean
        }
        Update: {
          id?: number
          proveedor_id?: string
          producto_id?: number
          vendedor_id?: string | null
          stock_producto_id?: number | null
          fecha_expiracion?: string | null
          fecha_inicio?: string | null
          nombre_cliente?: string
          telefono_cliente?: string
          precio?: number
          estado?: string
          soporte_mensaje?: string | null
          soporte_asunto?: string | null
          soporte_respuesta?: string | null
          monto_reembolso?: number
          created_at?: string
          updated_at?: string
          renovado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'compras_proveedor_id_fkey'
            columns: ['proveedor_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'compras_producto_id_fkey'
            columns: ['producto_id']
            isOneToOne: false
            referencedRelation: 'productos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'compras_stock_producto_id_fkey'
            columns: ['stock_producto_id']
            isOneToOne: false
            referencedRelation: 'stock_productos'
            referencedColumns: ['id']
          },
        ]
      }
      recargas: {
        Row: {
          id: number
          usuario_id: string
          monto: number
          estado: 'aprobado' | 'pendiente' | 'rechazado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          usuario_id: string
          monto: number
          estado?: 'aprobado' | 'pendiente' | 'rechazado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          usuario_id?: string
          monto?: number
          estado?: 'aprobado' | 'pendiente' | 'rechazado'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recargas_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      retiros: {
        Row: {
          id: number
          usuario_id: string
          monto: number
          estado: 'aprobado' | 'pendiente' | 'rechazado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          usuario_id: string
          monto: number
          estado?: 'aprobado' | 'pendiente' | 'rechazado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          usuario_id?: string
          monto?: number
          estado?: 'aprobado' | 'pendiente' | 'rechazado'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'retiros_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      configuracion: {
        Row: {
          id: string
          mantenimiento: boolean
          updated_at: string
          comision: number
          email_soporte: string | null
          conversion: number
          comision_publicacion_producto: number
          comision_retiro: number
          register_link: string
          signup_mode: SignupMode
          registro_requiere_aprobacion: boolean
        }
        Insert: {
          id?: string
          mantenimiento?: boolean
          updated_at?: string
          comision?: number
          email_soporte?: string | null
          conversion?: number
          comision_publicacion_producto?: number
          comision_retiro?: number
          register_link: string
          signup_mode?: SignupMode
          registro_requiere_aprobacion?: boolean
        }
        Update: {
          id?: string
          mantenimiento?: boolean
          updated_at?: string
          comision?: number
          email_soporte?: string | null
          conversion?: number
          comision_publicacion_producto?: number
          comision_retiro?: number
          register_link: string
          signup_mode?: SignupMode
          registro_requiere_aprobacion?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_user_balance: {
        Args: {
          user_id: string
          amount: number
        }
        Returns: Json
      }
      get_recargas_admin: {
        Args: {
          p_search?: string | null
          p_estado?: string | null
          p_page?: number | null
          p_page_size?: number | null
        }
        Returns: Json
      }
      get_retiros_admin: {
        Args: {
          p_search?: string | null
          p_estado?: string | null
          p_page?: number | null
          p_page_size?: number | null
        }
        Returns: Json
      }
      get_compras_admin: {
        Args: {
          p_search?: string | null
          p_estado?: string | null
          p_page?: number | null
          p_page_size?: number | null
        }
        Returns: Json
      }
      get_pedidos_proveedor: {
        Args: {
          p_proveedor_id: string
          p_page?: number | null
          p_page_size?: number | null
          p_search?: string | null
          p_estados?: string[] | null
          p_fecha_desde?: string | null
          p_fecha_hasta?: string | null
          p_sort_by?: string | null
          p_sort_dir?: string | null
        }
        Returns: {
          id: number
          proveedor_id: string
          producto_id: number
          vendedor_id: string | null
          stock_producto_id: number | null
          precio: number
          fecha_inicio: string | null
          fecha_expiracion: string | null
          estado: string
          nombre_cliente: string
          telefono_cliente: string
          soporte_mensaje: string | null
          soporte_asunto: string | null
          soporte_respuesta: string | null
          monto_reembolso: number | null
          created_at: string
          renovado: boolean
          producto_nombre: string | null
          producto_precio_publico: number | null
          producto_precio_renovacion: number | null
          producto_tiempo_uso: number | null
          vendedor_usuario: string | null
          vendedor_nombres: string | null
          vendedor_apellidos: string | null
          vendedor_telefono: string | null
          cuenta_id: number | null
          cuenta_email: string | null
          cuenta_clave: string | null
          cuenta_pin: string | null
          cuenta_perfil: string | null
          cuenta_url: string | null
          soporte_stock_producto: string | null
          estado_calculado: string
          dias_restantes: number | null
          total_count: number
        }[]
      }
      get_stock_proveedor: {
        Args: {
          p_proveedor_id: string
          p_page?: number | null
          p_page_size?: number | null
          p_search?: string | null
          p_tipo?: string | null
          p_estado?: string | null
          p_publicado?: boolean | null
          p_soporte?: string | null
          p_sort_by?: string | null
          p_sort_dir?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
