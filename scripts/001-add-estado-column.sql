-- Script para agregar la columna 'estado' a la tabla 'casos'
-- Esta columna permitirá rastrear el estado actual del caso

ALTER TABLE casos ADD COLUMN IF NOT EXISTS estado text DEFAULT 'En investigación';

-- Añadir un comentario a la columna para documentación
COMMENT ON COLUMN casos.estado IS 'Estado actual del caso: En investigación, Elevado a Juicio, Sentencia, Cerrado/Archivado';
