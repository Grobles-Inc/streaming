-- =============================================================================
-- Pedidos del proveedor — días restantes y filtros por fecha en hora de Lima
--
-- Problema: `fecha_expiracion::date` y `CURRENT_DATE` se evalúan en la zona
-- horaria de la sesión (UTC en Supabase). Para compras hechas después de las
-- 19:00 (Lima) el instante de expiración cae en el día UTC siguiente, así que
-- `dias_restantes` quedaba +1 (o -1 según la hora actual) y el frontend podía
-- marcar el pedido como vencido horas antes.
--
-- Solución: las fechas siguen guardándose como instantes UTC (trigger
-- `set_fechas_compra` con `now()`), pero los días calendario y los filtros
-- `p_fecha_desde` / `p_fecha_hasta` se calculan en `America/Lima`.
--
-- Ejecutar en Supabase → SQL Editor. Idempotente (`CREATE OR REPLACE`).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_pedidos_proveedor(
    p_proveedor_id uuid DEFAULT auth.uid(),
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 50,
    p_search text DEFAULT NULL::text,
    p_estados text[] DEFAULT NULL::text[],
    p_fecha_desde date DEFAULT NULL::date,
    p_fecha_hasta date DEFAULT NULL::date,
    p_sort_by text DEFAULT 'created_at'::text,
    p_sort_dir text DEFAULT 'desc'::text,
    p_producto_id integer DEFAULT NULL::integer
)
RETURNS TABLE(
    id bigint,
    proveedor_id uuid,
    producto_id bigint,
    vendedor_id uuid,
    stock_producto_id bigint,
    precio numeric,
    fecha_inicio timestamp with time zone,
    fecha_expiracion timestamp with time zone,
    estado text,
    nombre_cliente text,
    telefono_cliente text,
    soporte_mensaje text,
    soporte_asunto text,
    soporte_respuesta text,
    monto_reembolso numeric,
    created_at timestamp with time zone,
    renovado boolean,
    producto_nombre text,
    producto_precio_publico numeric,
    producto_precio_renovacion numeric,
    producto_tiempo_uso smallint,
    vendedor_usuario text,
    vendedor_nombres text,
    vendedor_apellidos text,
    vendedor_telefono text,
    cuenta_id bigint,
    cuenta_email text,
    cuenta_clave text,
    cuenta_pin text,
    cuenta_perfil text,
    cuenta_url text,
    soporte_stock_producto text,
    estado_calculado text,
    dias_restantes integer,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_offset int;
    v_limit int;
BEGIN
    v_limit := LEAST(GREATEST(1, p_page_size), 400);
    v_offset := (GREATEST(1, p_page) - 1) * v_limit;

    RETURN QUERY
    WITH base_query AS (
        SELECT 
            c.id,
            c.proveedor_id,
            c.producto_id,
            c.vendedor_id,
            c.stock_producto_id,
            c.precio,
            c.fecha_inicio,
            c.fecha_expiracion,
            c.estado::text AS estado,
            c.nombre_cliente,
            c.telefono_cliente,
            c.soporte_mensaje,
            c.soporte_asunto,
            c.soporte_respuesta,
            c.monto_reembolso,
            c.created_at,
            c.renovado,
            p.nombre AS producto_nombre,
            p.precio_publico AS producto_precio_publico,
            p.precio_renovacion AS producto_precio_renovacion,
            p.tiempo_uso AS producto_tiempo_uso,
            u.usuario AS vendedor_usuario,
            u.nombres AS vendedor_nombres,
            u.apellidos AS vendedor_apellidos,
            u.telefono AS vendedor_telefono,
            sp.id AS cuenta_id,
            sp.email AS cuenta_email,
            sp.clave AS cuenta_clave,
            sp.pin AS cuenta_pin,
            sp.perfil AS cuenta_perfil,
            sp.url AS cuenta_url,
            sp.soporte_stock_producto::text AS soporte_stock_producto,
            CASE 
                WHEN c.fecha_expiracion IS NULL THEN c.estado::text
                WHEN c.fecha_expiracion <= NOW() THEN 'vencido'
                ELSE 'resuelto'
            END AS estado_calculado,
            CASE 
                WHEN c.fecha_expiracion IS NULL THEN NULL::int
                -- Días calendario en Lima: la expiración y "hoy" se comparan
                -- como fechas locales, no como fechas UTC.
                ELSE (
                    (c.fecha_expiracion AT TIME ZONE 'America/Lima')::date
                    - (NOW() AT TIME ZONE 'America/Lima')::date
                )::int
            END AS dias_restantes
        FROM compras c
        LEFT JOIN productos p ON p.id = c.producto_id
        LEFT JOIN usuarios u ON u.id = c.vendedor_id
        LEFT JOIN stock_productos sp ON sp.id = c.stock_producto_id
        WHERE c.proveedor_id = COALESCE(p_proveedor_id, auth.uid())
          AND (p_producto_id IS NULL OR c.producto_id = p_producto_id)
          AND (
              p_search IS NULL OR (
                  c.id::text ILIKE '%' || p_search || '%' OR
                  p.nombre ILIKE '%' || p_search || '%' OR
                  u.usuario ILIKE '%' || p_search || '%' OR
                  u.telefono ILIKE '%' || p_search || '%' OR
                  sp.email ILIKE '%' || p_search || '%'
              )
          )
          AND (
              p_fecha_desde IS NULL
              OR (COALESCE(c.fecha_inicio, c.created_at) AT TIME ZONE 'America/Lima')::date >= p_fecha_desde
          )
          AND (
              p_fecha_hasta IS NULL
              OR (COALESCE(c.fecha_inicio, c.created_at) AT TIME ZONE 'America/Lima')::date <= p_fecha_hasta
          )
    ),
    filtered_query AS (
        SELECT 
            bq.*,
            COUNT(*) OVER() AS total_count
        FROM base_query bq
        WHERE (
            p_estados IS NULL OR bq.estado_calculado = ANY(p_estados)
        )
    )
    SELECT 
        fq.id,
        fq.proveedor_id,
        fq.producto_id,
        fq.vendedor_id,
        fq.stock_producto_id,
        fq.precio,
        fq.fecha_inicio,
        fq.fecha_expiracion,
        fq.estado,
        fq.nombre_cliente,
        fq.telefono_cliente,
        fq.soporte_mensaje,
        fq.soporte_asunto,
        fq.soporte_respuesta,
        fq.monto_reembolso,
        fq.created_at,
        fq.renovado,
        fq.producto_nombre,
        fq.producto_precio_publico,
        fq.producto_precio_renovacion,
        fq.producto_tiempo_uso,
        fq.vendedor_usuario,
        fq.vendedor_nombres,
        fq.vendedor_apellidos,
        fq.vendedor_telefono,
        fq.cuenta_id,
        fq.cuenta_email,
        fq.cuenta_clave,
        fq.cuenta_pin,
        fq.cuenta_perfil,
        fq.cuenta_url,
        fq.soporte_stock_producto,
        fq.estado_calculado,
        fq.dias_restantes,
        fq.total_count
    FROM filtered_query fq
    ORDER BY
        CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'asc' THEN fq.created_at END ASC,
        CASE WHEN p_sort_by = 'created_at' AND (p_sort_dir = 'desc' OR p_sort_dir IS NULL) THEN fq.created_at END DESC,
        CASE WHEN p_sort_by = 'fecha_inicio' AND p_sort_dir = 'asc' THEN fq.fecha_inicio END ASC,
        CASE WHEN p_sort_by = 'fecha_inicio' AND p_sort_dir = 'desc' THEN fq.fecha_inicio END DESC,
        CASE WHEN p_sort_by = 'fecha_expiracion' AND p_sort_dir = 'asc' THEN fq.fecha_expiracion END ASC,
        CASE WHEN p_sort_by = 'fecha_expiracion' AND p_sort_dir = 'desc' THEN fq.fecha_expiracion END DESC,
        CASE WHEN p_sort_by = 'precio' AND p_sort_dir = 'asc' THEN fq.precio END ASC,
        CASE WHEN p_sort_by = 'precio' AND p_sort_dir = 'desc' THEN fq.precio END DESC,
        CASE WHEN p_sort_by = 'producto_precio_renovacion' AND p_sort_dir = 'asc' THEN fq.producto_precio_renovacion END ASC,
        CASE WHEN p_sort_by = 'producto_precio_renovacion' AND p_sort_dir = 'desc' THEN fq.producto_precio_renovacion END DESC,
        CASE WHEN p_sort_by = 'id' AND p_sort_dir = 'asc' THEN fq.id END ASC,
        CASE WHEN p_sort_by = 'id' AND p_sort_dir = 'desc' THEN fq.id END DESC,
        CASE WHEN p_sort_by = 'producto_nombre' AND p_sort_dir = 'asc' THEN fq.producto_nombre END ASC,
        CASE WHEN p_sort_by = 'producto_nombre' AND p_sort_dir = 'desc' THEN fq.producto_nombre END DESC,
        CASE WHEN p_sort_by = 'vendedor_usuario' AND p_sort_dir = 'asc' THEN fq.vendedor_usuario END ASC,
        CASE WHEN p_sort_by = 'vendedor_usuario' AND p_sort_dir = 'desc' THEN fq.vendedor_usuario END DESC,
        CASE WHEN p_sort_by = 'dias_restantes' AND p_sort_dir = 'asc' THEN fq.dias_restantes END ASC,
        CASE WHEN p_sort_by = 'dias_restantes' AND p_sort_dir = 'desc' THEN fq.dias_restantes END DESC,
        CASE WHEN p_sort_by = 'estado_calculado' AND p_sort_dir = 'asc' THEN fq.estado_calculado END ASC,
        CASE WHEN p_sort_by = 'estado_calculado' AND p_sort_dir = 'desc' THEN fq.estado_calculado END DESC,
        fq.created_at DESC
    LIMIT v_limit OFFSET v_offset;
END;
$function$;
