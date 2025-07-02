export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          rol: 'provider' | 'admin' | 'seller'
          created_at: string
          updated_at: string
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
          rol?: 'provider' | 'admin' | 'seller'
          created_at?: string
          updated_at?: string
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
          rol?: 'provider' | 'admin' | 'seller'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "billeteras_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      productos: {
        Row: {
          id: string
          usuarios: {
            nombres: string
            apellidos: string
          }
          nombre: string
          descripcion: string | null
          informacion: string | null
          condiciones: string | null
          precio_publico: number
          stock: number
          categoria_id: string
          proveedor_id: string
          imagen_url: string | null
          created_at: string
          updated_at: string
          tiempo_uso: number
          a_pedido: boolean
          nuevo: boolean
          destacado: boolean
          mas_vendido: boolean
          descripcion_completa: string | null
          disponibilidad: 'en_stock' | 'a_pedido' | 'activacion'
          renovable: boolean
          solicitud: string | null
          muestra_disponibilidad_stock: boolean
          deshabilitar_boton_comprar: boolean
          precio_vendedor: number
          precio_renovacion: number | null
          estado: 'borrador' | 'publicado'
          stock_de_productos: {
            id: number
          }[]
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          informacion?: string | null
          condiciones?: string | null
          precio_publico: number
          stock?: number
          categoria_id: string
          proveedor_id: string
          imagen_url?: string | null
          tiempo_uso?: number
          a_pedido?: boolean
          nuevo?: boolean
          destacado?: boolean
          mas_vendido?: boolean
          descripcion_completa?: string | null
          disponibilidad: 'en_stock' | 'a_pedido' | 'activacion'
          renovable?: boolean
          solicitud?: string | null
          muestra_disponibilidad_stock?: boolean
          deshabilitar_boton_comprar?: boolean
          precio_vendedor: number
          precio_renovacion?: number | null
          estado?: 'borrador' | 'publicado'
          stock_de_productos?: {
            id: number
          }[]
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          informacion?: string | null
          condiciones?: string | null
          precio_publico?: number
          stock?: number
          categoria_id?: string
          proveedor_id?: string
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
          tiempo_uso?: number
          a_pedido?: boolean
          nuevo?: boolean
          destacado?: boolean
          mas_vendido?: boolean
          descripcion_completa?: string | null
          disponibilidad?: 'en_stock' | 'a_pedido' | 'activacion'
          renovable?: boolean
          solicitud?: string | null
          muestra_disponibilidad_stock?: boolean
          deshabilitar_boton_comprar?: boolean
          precio_vendedor?: number
          precio_renovacion?: number | null
          estado?: 'borrador' | 'publicado'
          stock_de_productos?: {
            id: number
          }[]
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
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
          producto_id: string
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
          producto_id: string
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
          producto_id?: string
          tipo?: 'cuenta' | 'perfiles' | 'combo'
          url?: string | null
          created_at?: string
          estado?: 'disponible' | 'vendido'
          publicado?: boolean
          soporte_stock_producto?: 'activo' | 'vencido' | 'soporte'
        }
        Relationships: [
          {
            foreignKeyName: "stock_productos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_productos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      },
      categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          imagen_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      compras: {
        Row: {
          id: string
          proveedor_id: string
          producto_id: string
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
        }
        Insert: {
          id?: string
          proveedor_id: string
          producto_id: string
          vendedor_id?: string | null
          stock_producto_id?: number | null
          fecha_expiracion?: string | null
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
        }
        Update: {
          id?: string
          proveedor_id?: string
          producto_id?: string
          vendedor_id?: string | null
          stock_producto_id?: number | null
          fecha_expiracion?: string | null
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
        }
        Relationships: [
          {
            foreignKeyName: "compras_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_stock_producto_id_fkey"
            columns: ["stock_producto_id"]
            isOneToOne: false
            referencedRelation: "stock_productos"
            referencedColumns: ["id"]
          }
        ]
      }
      recargas: {
        Row: {
          id: string
          usuario_id: string
          monto: number
          estado: "aprobado" | "pendiente" | "rechazado"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          monto: number
          estado?: "aprobado" | "pendiente" | "rechazado"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          monto?: number
          estado?: "aprobado" | "pendiente" | "rechazado"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recargas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      retiros: {
        Row: {
          id: string
          usuario_id: string
          monto: number
          estado: "aprobado" | "pendiente" | "rechazado"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          monto: number
          estado?: "aprobado" | "pendiente" | "rechazado"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          monto?: number
          estado?: "aprobado" | "pendiente" | "rechazado"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retiros_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      configuracion:{
        Row:{
          id: string
          mantenimiento: boolean
          updated_at: string
          comision: number 
          email_soporte: string | null
          conversion: number
          comision_publicacion_producto: number
        }
        Insert: {
          id?: string
          mantenimiento?: boolean
          updated_at?: string
          comision?: number 
          email_soporte?: string | null
          conversion?: number
          comision_publicacion_producto?: number
        }
        Update: {
          id?: string
          mantenimiento?: boolean
          updated_at?: string
          comision?: number 
          email_soporte?: string | null
          conversion?: number
          comision_publicacion_producto?: number
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
