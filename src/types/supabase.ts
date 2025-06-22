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
          avatar: string
          apellidos: string
          telefono: string | null
          rol: 'provider' | 'admin' | 'seller'
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nombres: string
          avatar: string
          apellidos: string
          telefono?: string | null
          rol?: 'provider' | 'admin' | 'seller'
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombres?: string
          avatar?: string
          apellidos?: string
          telefono?: string | null
          rol?: 'provider' | 'admin' | 'seller'
          balance?: number
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
          nombre: string
          descripcion: string | null
          informacion: string | null
          condiciones: string | null
          usuarios: {
            nombres: string
          }
          categorias: {
            nombre: string
          }
          mas_vendido: boolean
          destacado: boolean
          a_pedido: boolean
          nuevo: boolean
          url_cuenta: string | null
          tiempo_uso: number
          precio: number
          stock: number
          categoria_id: string
          proveedor_id: string

          imagen_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          informacion?: string | null
          condiciones?: string | null
          mas_vendido: boolean
          destacado: boolean
          a_pedido: boolean
          nuevo: boolean
          url_cuenta?: string | null
          tiempo_uso: number
          precio: number
          stock: number
          categoria_id: string
          proveedor_id: string
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          informacion?: string | null
          condiciones?: string | null
          mas_vendido: boolean
          destacado: boolean
          a_pedido: boolean
          nuevo: boolean
          url_cuenta?: string | null
          tiempo_uso: number
          precio?: number
          stock?: number
          categoria_id?: string
          proveedor_id?: string
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
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
          id?: string
          proveedor_id: string
          producto_id: string
          vendedor_id: string
          email_cuenta: string,          
          clave_cuenta: string
          perfil_cuenta: string
          pin_cuenta?: string
          perfil_usuario?: string
          nombre_cliente: string         
          telefono_cliente: string
          precio: number          
          estado: string
          fecha_inicio: string
          fecha_termino: string
          monto_reembolso: number
        }
        Insert: {
          id?: string
          proveedor_id: string
          producto_id: string
          vendedor_id: string
          email_cuenta: string
          clave_cuenta: string
          perfil_cuenta: string
          pin_cuenta?: string
          nombre_cliente: string
          telefono_cliente: string
          precio: number
          estado?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          proveedor_id?: string
          producto_id?: string
          vendedor_id?: string
          email_cuenta?: string
          clave_cuenta?: string
          pin_cuenta?: string
          perfil_cuenta?: string
          nombre_cliente?: string
          telefono_cliente?: string
          precio: number
          estado?: string
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
          }
        ]
      }
      recargas: {
        Row: {
          id: string
          usuario_id: string
          monto: number
          comision: number
          metodo_pago: "transferencia" | "yape"
          estado: "aprobado" | "pendiente" | "rechazado"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          monto: number
          comision: number
          metodo_pago: "transferencia" | "yape"
          estado?: "aprobado" | "pendiente" | "rechazado"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          monto?: number
          comision?: number
          metodo_pago?: "transferencia" | "yape"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
