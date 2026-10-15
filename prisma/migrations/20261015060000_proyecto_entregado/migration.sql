-- Proyectos cuya entrega ya fue confirmada en obra pasan al estado final "entregado"
UPDATE "proyecto" p
SET "estado_pipeline" = 'entregado'
FROM "despacho_proyecto" d
WHERE d."proyecto_id" = p."proyecto_id"
  AND d."fecha_entrega" IS NOT NULL
  AND p."estado_pipeline" = 'despachado';
