export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3"
  }
  public: {
    Tables: {
      billeteras: {
        Row: {
          created_at: string | null
          id: string
          saldo: number
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          saldo?: number
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          saldo?: number
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billeteras_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          imagen_url: string | null
          nombre: string
          orden: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          orden?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          orden?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      codigo_solicitudes: {
        Row: {
          compra_id: number
          created_at: string | null
          created_by: string
          error: string | null
          estado: string
          id: string
          stock_producto_id: number
        }
        Insert: {
          compra_id: number
          created_at?: string | null
          created_by: string
          error?: string | null
          estado?: string
          id?: string
          stock_producto_id: number
        }
        Update: {
          compra_id?: number
          created_at?: string | null
          created_by?: string
          error?: string | null
          estado?: string
          id?: string
          stock_producto_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "codigo_solicitudes_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codigo_solicitudes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      codigos_verificacion: {
        Row: {
          asunto: string | null
          codigo: string
          created_at: string | null
          expira_at: string | null
          id: string
          remitente: string | null
          solicitud_id: string
        }
        Insert: {
          asunto?: string | null
          codigo: string
          created_at?: string | null
          expira_at?: string | null
          id?: string
          remitente?: string | null
          solicitud_id: string
        }
        Update: {
          asunto?: string | null
          codigo?: string
          created_at?: string | null
          expira_at?: string | null
          id?: string
          remitente?: string | null
          solicitud_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "codigos_verificacion_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: false
            referencedRelation: "codigo_solicitudes"
            referencedColumns: ["id"]
          },
        ]
      }
      compras: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["compra_estado"] | null
          fecha_expiracion: string | null
          fecha_inicio: string | null
          id: number
          monto_reembolso: number | null
          nombre_cliente: string | null
          precio: number | null
          producto_id: number | null
          proveedor_id: string | null
          renovado: boolean
          revisado_id: string | null
          soporte_asunto: string | null
          soporte_mensaje: string | null
          soporte_respuesta: string | null
          stock_producto_id: number
          telefono_cliente: string | null
          updated_at: string | null
          vendedor_id: string | null
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["compra_estado"] | null
          fecha_expiracion?: string | null
          fecha_inicio?: string | null
          id?: number
          monto_reembolso?: number | null
          nombre_cliente?: string | null
          precio?: number | null
          producto_id?: number | null
          proveedor_id?: string | null
          renovado?: boolean
          revisado_id?: string | null
          soporte_asunto?: string | null
          soporte_mensaje?: string | null
          soporte_respuesta?: string | null
          stock_producto_id: number
          telefono_cliente?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["compra_estado"] | null
          fecha_expiracion?: string | null
          fecha_inicio?: string | null
          id?: number
          monto_reembolso?: number | null
          nombre_cliente?: string | null
          precio?: number | null
          producto_id?: number | null
          proveedor_id?: string | null
          renovado?: boolean
          revisado_id?: string | null
          soporte_asunto?: string | null
          soporte_mensaje?: string | null
          soporte_respuesta?: string | null
          stock_producto_id?: number
          telefono_cliente?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_revisado_id_fkey"
            columns: ["revisado_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras2_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras2_stock_producto_id_fkey"
            columns: ["stock_producto_id"]
            isOneToOne: false
            referencedRelation: "stock_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras2_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion: {
        Row: {
          comision: number | null
          comision_publicacion_producto: number
          conversion: number | null
          email_soporte: string | null
          id: number
          mantenimiento: boolean | null
          register_link: string | null
          registro_requiere_aprobacion: boolean
          signup_mode: string
          updated_at: string | null
        }
        Insert: {
          comision?: number | null
          comision_publicacion_producto?: number
          conversion?: number | null
          email_soporte?: string | null
          id?: number
          mantenimiento?: boolean | null
          register_link?: string | null
          registro_requiere_aprobacion?: boolean
          signup_mode?: string
          updated_at?: string | null
        }
        Update: {
          comision?: number | null
          comision_publicacion_producto?: number
          conversion?: number | null
          email_soporte?: string | null
          id?: number
          mantenimiento?: boolean | null
          register_link?: string | null
          registro_requiere_aprobacion?: boolean
          signup_mode?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      imap_configs: {
        Row: {
          carpeta: string
          created_at: string | null
          created_by: string
          email: string
          host: string
          id: string
          password_vault_id: string
          port: number
          ssl: boolean
          stock_producto_id: number
          updated_at: string | null
          usuario: string
        }
        Insert: {
          carpeta?: string
          created_at?: string | null
          created_by: string
          email: string
          host: string
          id?: string
          password_vault_id: string
          port?: number
          ssl?: boolean
          stock_producto_id: number
          updated_at?: string | null
          usuario: string
        }
        Update: {
          carpeta?: string
          created_at?: string | null
          created_by?: string
          email?: string
          host?: string
          id?: string
          password_vault_id?: string
          port?: number
          ssl?: boolean
          stock_producto_id?: number
          updated_at?: string | null
          usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "imap_configs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imap_configs_stock_producto_id_fkey"
            columns: ["stock_producto_id"]
            isOneToOne: true
            referencedRelation: "stock_productos"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          categoria_id: string
          condiciones: string | null
          created_at: string | null
          descripcion: string | null
          descripcion_completa: string | null
          deshabilitar_boton_comprar: boolean | null
          disponibilidad: Database["public"]["Enums"]["disponibilidad"]
          estado: Database["public"]["Enums"]["estado_publicacion_producto"]
          fecha_expiracion: string | null
          id: number
          imagen_url: string | null
          informacion: string | null
          muestra_disponibilidad_stock: boolean | null
          nombre: string
          nuevo: boolean
          precio_publico: number
          precio_renovacion: number
          precio_vendedor: number
          proveedor_id: string | null
          renovable: boolean
          revisado_id: string | null
          solicitud: string | null
          stock_de_productos: Json | null
          tiempo_uso: number
          updated_at: string | null
        }
        Insert: {
          categoria_id: string
          condiciones?: string | null
          created_at?: string | null
          descripcion?: string | null
          descripcion_completa?: string | null
          deshabilitar_boton_comprar?: boolean | null
          disponibilidad?: Database["public"]["Enums"]["disponibilidad"]
          estado?: Database["public"]["Enums"]["estado_publicacion_producto"]
          fecha_expiracion?: string | null
          id?: number
          imagen_url?: string | null
          informacion?: string | null
          muestra_disponibilidad_stock?: boolean | null
          nombre: string
          nuevo?: boolean
          precio_publico: number
          precio_renovacion: number
          precio_vendedor: number
          proveedor_id?: string | null
          renovable?: boolean
          revisado_id?: string | null
          solicitud?: string | null
          stock_de_productos?: Json | null
          tiempo_uso: number
          updated_at?: string | null
        }
        Update: {
          categoria_id?: string
          condiciones?: string | null
          created_at?: string | null
          descripcion?: string | null
          descripcion_completa?: string | null
          deshabilitar_boton_comprar?: boolean | null
          disponibilidad?: Database["public"]["Enums"]["disponibilidad"]
          estado?: Database["public"]["Enums"]["estado_publicacion_producto"]
          fecha_expiracion?: string | null
          id?: number
          imagen_url?: string | null
          informacion?: string | null
          muestra_disponibilidad_stock?: boolean | null
          nombre?: string
          nuevo?: boolean
          precio_publico?: number
          precio_renovacion?: number
          precio_vendedor?: number
          proveedor_id?: string | null
          renovable?: boolean
          revisado_id?: string | null
          solicitud?: string | null
          stock_de_productos?: Json | null
          tiempo_uso?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_nueva_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_nueva_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_revisado_id_fkey"
            columns: ["revisado_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      recargas: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["recarga_estado"] | null
          id: number
          monto: number
          revisado_id: string | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["recarga_estado"] | null
          id?: number
          monto: number
          revisado_id?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["recarga_estado"] | null
          id?: number
          monto?: number
          revisado_id?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recargas_revisado_id_fkey"
            columns: ["revisado_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recargas2_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      retiros: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["recarga_estado"]
          id: number
          monto: number
          revisado_id: string | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["recarga_estado"]
          id?: number
          monto: number
          revisado_id?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["recarga_estado"]
          id?: number
          monto?: number
          revisado_id?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retiros_nueva_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retiros_revisado_id_fkey"
            columns: ["revisado_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_productos: {
        Row: {
          clave: string | null
          created_at: string
          email: string | null
          estado: Database["public"]["Enums"]["estado"]
          id: number
          perfil: string | null
          pin: string | null
          producto_id: number | null
          proveedor_id: string
          publicado: boolean | null
          soporte_stock_producto: Database["public"]["Enums"]["soporte_stock_producto"]
          tipo: Database["public"]["Enums"]["tipo"]
          url: string | null
        }
        Insert: {
          clave?: string | null
          created_at?: string
          email?: string | null
          estado?: Database["public"]["Enums"]["estado"]
          id?: number
          perfil?: string | null
          pin?: string | null
          producto_id?: number | null
          proveedor_id: string
          publicado?: boolean | null
          soporte_stock_producto?: Database["public"]["Enums"]["soporte_stock_producto"]
          tipo?: Database["public"]["Enums"]["tipo"]
          url?: string | null
        }
        Update: {
          clave?: string | null
          created_at?: string
          email?: string | null
          estado?: Database["public"]["Enums"]["estado"]
          id?: number
          perfil?: string | null
          pin?: string | null
          producto_id?: number | null
          proveedor_id?: string
          publicado?: boolean | null
          soporte_stock_producto?: Database["public"]["Enums"]["soporte_stock_producto"]
          tipo?: Database["public"]["Enums"]["tipo"]
          url?: string | null
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
          },
        ]
      }
      usuarios: {
        Row: {
          apellidos: string
          billetera_id: string | null
          codigo_referido: string | null
          created_at: string | null
          email: string
          estado_habilitado: boolean | null
          id: string
          ip_registro: string | null
          nombres: string
          password: string
          referido_id: string | null
          rol: string
          telefono: string | null
          updated_at: string | null
          usuario: string
        }
        Insert: {
          apellidos: string
          billetera_id?: string | null
          codigo_referido?: string | null
          created_at?: string | null
          email?: string
          estado_habilitado?: boolean | null
          id?: string
          ip_registro?: string | null
          nombres: string
          password?: string
          referido_id?: string | null
          rol?: string
          telefono?: string | null
          updated_at?: string | null
          usuario?: string
        }
        Update: {
          apellidos?: string
          billetera_id?: string | null
          codigo_referido?: string | null
          created_at?: string | null
          email?: string
          estado_habilitado?: boolean | null
          id?: string
          ip_registro?: string | null
          nombres?: string
          password?: string
          referido_id?: string | null
          rol?: string
          telefono?: string | null
          updated_at?: string | null
          usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_billetera_id_fkey"
            columns: ["billetera_id"]
            isOneToOne: false
            referencedRelation: "billeteras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_referido_id_fkey"
            columns: ["referido_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_smart: { Args: { p_user_id: string }; Returns: Json }
      get_compras_admin: {
        Args: {
          p_estado?: string
          p_page?: number
          p_page_size?: number
          p_search?: string
        }
        Returns: Json
      }
      get_pedidos_proveedor: {
        Args: {
          p_estados?: string[]
          p_fecha_desde?: string
          p_fecha_hasta?: string
          p_page?: number
          p_page_size?: number
          p_proveedor_id?: string
          p_search?: string
          p_sort_by?: string
          p_sort_dir?: string
        }
        Returns: {
          created_at: string
          cuenta_clave: string
          cuenta_email: string
          cuenta_id: number
          cuenta_perfil: string
          cuenta_pin: string
          cuenta_url: string
          dias_restantes: number
          estado: string
          estado_calculado: string
          fecha_expiracion: string
          fecha_inicio: string
          id: number
          monto_reembolso: number
          nombre_cliente: string
          precio: number
          producto_id: number
          producto_nombre: string
          producto_precio_publico: number
          producto_precio_renovacion: number
          producto_tiempo_uso: number
          proveedor_id: string
          renovado: boolean
          soporte_asunto: string
          soporte_mensaje: string
          soporte_respuesta: string
          soporte_stock_producto: string
          stock_producto_id: number
          telefono_cliente: string
          total_count: number
          vendedor_apellidos: string
          vendedor_id: string
          vendedor_nombres: string
          vendedor_telefono: string
          vendedor_usuario: string
        }[]
      }
      get_recargas_admin: {
        Args: {
          p_estado?: string
          p_page?: number
          p_page_size?: number
          p_search?: string
        }
        Returns: Json
      }
      get_retiros_admin: {
        Args: {
          p_estado?: string
          p_page?: number
          p_page_size?: number
          p_search?: string
        }
        Returns: Json
      }
      get_stock_proveedor: {
        Args: {
          p_estado?: string
          p_page?: number
          p_page_size?: number
          p_proveedor_id?: string
          p_publicado?: boolean
          p_search?: string
          p_soporte?: string
          p_sort_by?: string
          p_sort_dir?: string
          p_tipo?: string
        }
        Returns: Json
      }
      get_users_admin: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_roles?: string[]
          p_search?: string
          p_sort_by?: string
          p_sort_dir?: string
        }
        Returns: Json
      }
      increment_billetera_saldo: {
        Args: { amount: number; billetera_id: string }
        Returns: {
          created_at: string
          id: string
          saldo: number
          updated_at: string
          usuario_id: string
        }[]
      }
    }
    Enums: {
      compra_estado:
        | "resuelto"
        | "soporte"
        | "vencido"
        | "pedido"
        | "entregado"
        | "reembolsado"
        | "renovado"
      disponibilidad: "en_stock" | "a_pedido" | "activacion"
      estado: "disponible" | "vendido"
      estado_publicacion_producto: "borrador" | "publicado" | "pendiente"
      recarga_estado: "aprobado" | "rechazado" | "pendiente"
      rol: "admin" | "seller" | "provider" | "registrado"
      roles: "admin" | "provider" | "seller" | "registrado"
      soporte_stock_producto: "vencido" | "soporte" | "activo"
      tipo: "cuenta" | "perfiles" | "combo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      compra_estado: [
        "resuelto",
        "soporte",
        "vencido",
        "pedido",
        "entregado",
        "reembolsado",
        "renovado",
      ],
      disponibilidad: ["en_stock", "a_pedido", "activacion"],
      estado: ["disponible", "vendido"],
      estado_publicacion_producto: ["borrador", "publicado", "pendiente"],
      recarga_estado: ["aprobado", "rechazado", "pendiente"],
      rol: ["admin", "seller", "provider", "registrado"],
      roles: ["admin", "provider", "seller", "registrado"],
      soporte_stock_producto: ["vencido", "soporte", "activo"],
      tipo: ["cuenta", "perfiles", "combo"],
    },
  },
} as const
