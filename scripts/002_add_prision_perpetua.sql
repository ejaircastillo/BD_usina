-- Add prision_perpetua column to imputados table
ALTER TABLE public.imputados 
ADD COLUMN IF NOT EXISTS prision_perpetua BOOLEAN DEFAULT FALSE;
