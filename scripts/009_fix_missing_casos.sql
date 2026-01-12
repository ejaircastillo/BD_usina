-- Fix missing casos for victims that have hechos but no casos
-- This script creates the missing relationship between victims and hechos in the casos table

-- Insert casos for victims that have hechos but don't have casos yet
INSERT INTO casos (victima_id, hecho_id, estado, estado_general, created_at)
SELECT 
  h.victima_id,
  h.id as hecho_id,
  'En investigación' as estado,
  'En investigación' as estado_general,
  NOW() as created_at
FROM hechos h
WHERE NOT EXISTS (
  SELECT 1 
  FROM casos c 
  WHERE c.victima_id = h.victima_id 
  AND c.hecho_id = h.id
)
AND h.victima_id IS NOT NULL;

-- Show the newly created casos
SELECT 
  c.id as caso_id,
  v.nombre_completo,
  c.estado,
  c.created_at
FROM casos c
INNER JOIN victimas v ON v.id = c.victima_id
INNER JOIN hechos h ON h.id = c.hecho_id
WHERE c.created_at > NOW() - INTERVAL '1 minute'
ORDER BY c.created_at DESC;
