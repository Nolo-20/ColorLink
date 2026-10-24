-- Vistas para el dashboard (Metabase / Looker Studio). Solo lectura: no cambian datos.

-- 1. Proyectos con su captura, validación, IA, calidad y cotización (una fila por proyecto)
CREATE OR REPLACE VIEW vw_proyectos AS
SELECT
  p.proyecto_id,
  p.nombre_proyecto,
  p.created_at                                   AS fecha_creacion,
  date_trunc('month', p.created_at)::date        AS mes,
  COALESCE(e.razon_social, u.nombre || ' ' || u.apellido) AS cliente,
  COALESCE(c.ciudad, ce.ciudad)                  AS ciudad,
  p.tipo_proyecto,
  p.area                                         AS area_m2,
  p.tipo_superficie,
  p.ambiente,
  array_to_string(p.condiciones, ', ')           AS condiciones,
  p.fecha_requerida,
  p.canal_origen,
  p.estado_pipeline,
  p.consentimiento_datos,
  (p.validacion_captura->>'completitudPct')::numeric        AS completitud_pct,
  COALESCE(jsonb_array_length(p.validacion_captura->'advertencias'), 0) AS advertencias,
  COALESCE(jsonb_array_length(p.validacion_captura->'duplicados'), 0)   AS posibles_duplicados,
  d.categoria                                    AS categoria_ia,
  d.severidad,
  d.complejidad,
  d.confianza_ia_pct,
  CASE WHEN d.modelo_ia IS NULL THEN 'sin_clasificar'
       WHEN d.modelo_ia = 'colorlink-expert-engine' THEN 'reglas'
       ELSE 'gemini' END                         AS motor_ia,
  d.humedad_relativa,
  d.aprobado_calidad,
  (SELECT ct.total FROM cotizacion ct WHERE ct.proyecto_id = p.proyecto_id ORDER BY ct.created_at DESC LIMIT 1) AS total_cotizado,
  a.nombre || ' ' || a.apellido                  AS asesor,
  (SELECT count(*) FROM evidencia_foto ev WHERE ev.proyecto_id = p.proyecto_id) AS evidencias
FROM proyecto p
JOIN usuario u          ON u.usuario_id = p.usuario_id
LEFT JOIN empresa_cliente e ON e.empresa_id = p.empresa_id
LEFT JOIN ciudad c      ON c.ciudad_id = p.ciudad_id
LEFT JOIN ciudad ce     ON ce.ciudad_id = e.ciudad_id
LEFT JOIN diagnostico_ia d ON d.proyecto_id = p.proyecto_id
LEFT JOIN usuario a     ON a.usuario_id = p.asesor_asignado_id;

-- 2. Tiempos del flujo: horas desde que se creó el proyecto hasta cada etapa
CREATE OR REPLACE VIEW vw_tiempos_proyecto AS
SELECT
  p.proyecto_id,
  p.nombre_proyecto,
  p.estado_pipeline,
  p.created_at AS fecha_creacion,
  round((EXTRACT(EPOCH FROM (min(h.fecha) FILTER (WHERE h.estado_nuevo = 'cotizado')         - p.created_at)) / 3600)::numeric, 1) AS horas_a_cotizado,
  round((EXTRACT(EPOCH FROM (min(h.fecha) FILTER (WHERE h.estado_nuevo = 'aprobado_calidad') - p.created_at)) / 3600)::numeric, 1) AS horas_a_aprobado,
  round((EXTRACT(EPOCH FROM (min(h.fecha) FILTER (WHERE h.estado_nuevo = 'despachado')       - p.created_at)) / 3600)::numeric, 1) AS horas_a_despachado,
  round((EXTRACT(EPOCH FROM (min(h.fecha) FILTER (WHERE h.estado_nuevo = 'entregado')        - p.created_at)) / 3600)::numeric, 1) AS horas_a_entregado,
  count(h.id) AS movimientos
FROM proyecto p
LEFT JOIN estado_proyecto_historial h ON h.proyecto_id = p.proyecto_id
GROUP BY p.proyecto_id, p.nombre_proyecto, p.estado_pipeline, p.created_at;

-- 3. Calidad del dato por mes (captura y validación automática)
CREATE OR REPLACE VIEW vw_calidad_dato AS
SELECT
  mes,
  count(*)                                                        AS proyectos,
  round(avg(completitud_pct), 1)                                  AS completitud_promedio_pct,
  round(100.0 * count(*) FILTER (WHERE advertencias > 0) / count(*), 1)        AS pct_con_advertencias,
  round(100.0 * count(*) FILTER (WHERE posibles_duplicados > 0) / count(*), 1) AS pct_posibles_duplicados,
  round(100.0 * count(*) FILTER (WHERE evidencias > 0) / count(*), 1)          AS pct_con_evidencias,
  round(100.0 * count(*) FILTER (WHERE motor_ia = 'gemini') / count(*), 1)     AS pct_clasificados_ia,
  round(avg(confianza_ia_pct) FILTER (WHERE motor_ia = 'gemini')::numeric, 1)           AS confianza_ia_promedio
FROM vw_proyectos
GROUP BY mes;

-- 4. Ventas de la tienda por día
CREATE OR REPLACE VIEW vw_ventas_diarias AS
SELECT
  o.created_at::date            AS dia,
  o.metodo_entrega,
  count(*)                      AS pedidos,
  sum(o.total)                  AS ventas_cop,
  round(avg(o.total)::numeric)           AS ticket_promedio_cop
FROM orden o
WHERE o.estado <> 'cancelado'
GROUP BY o.created_at::date, o.metodo_entrega;

-- 5. Productos más vendidos
CREATE OR REPLACE VIEW vw_ventas_producto AS
SELECT
  oi.nombre_producto,
  COALESCE(oi.presentacion, '—') AS presentacion,
  sum(oi.cantidad)               AS unidades,
  sum(oi.subtotal)               AS ventas_cop,
  count(DISTINCT oi.orden_id)    AS pedidos
FROM orden_item oi
JOIN orden o ON o.orden_id = oi.orden_id
WHERE o.estado <> 'cancelado'
GROUP BY oi.nombre_producto, COALESCE(oi.presentacion, '—');

-- 6. Inventario por presentación y bodega, con alerta de stock bajo (menos de 10 unidades)
CREATE OR REPLACE VIEW vw_inventario AS
SELECT
  pr.nombre                       AS producto,
  COALESCE(pr.tamano_nombre, pr.presentacion) AS presentacion,
  COALESCE(s.nombre, i.nombre_bodega, 'Sin bodega') AS bodega,
  ci.ciudad,
  sum(COALESCE(i.cantidad_disponible, 0))     AS unidades,
  sum(COALESCE(i.cantidad_disponible, 0)) < 10 AS stock_bajo
FROM inventario_producto i
JOIN producto pr   ON pr.producto_id = i.producto_id AND pr.activo
LEFT JOIN sucursal s ON s.sucursal_id = i.sucursal_id
LEFT JOIN ciudad ci  ON ci.ciudad_id = i.ciudad_id
GROUP BY pr.nombre, COALESCE(pr.tamano_nombre, pr.presentacion), COALESCE(s.nombre, i.nombre_bodega, 'Sin bodega'), ci.ciudad;

-- 7. Embudo de proyectos por estado
CREATE OR REPLACE VIEW vw_pipeline AS
SELECT estado_pipeline, count(*) AS proyectos, sum(area_m2) AS area_m2, sum(total_cotizado) AS total_cotizado
FROM vw_proyectos
GROUP BY estado_pipeline;
