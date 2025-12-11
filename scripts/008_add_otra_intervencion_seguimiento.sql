-- Script para agregar campos de "Otra intervención" a la tabla seguimiento
-- Ejecutar este script en Supabase SQL Editor

-- Agregar columna para el checkbox de "Otra intervención"
ALTER TABLE seguimiento
ADD COLUMN IF NOT EXISTS otra_intervencion BOOLEAN DEFAULT FALSE;

-- Agregar columna para la descripción de la intervención
ALTER TABLE seguimiento
ADD COLUMN IF NOT EXISTS otra_intervencion_descripcion TEXT;

-- Comentarios descriptivos para las columnas
COMMENT ON COLUMN seguimiento.otra_intervencion IS 'Indica si hubo otra intervención adicional por parte de UJ';
COMMENT ON COLUMN seguimiento.otra_intervencion_descripcion IS 'Descripción detallada de la otra intervención realizada';
