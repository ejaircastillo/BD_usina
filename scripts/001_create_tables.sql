-- Create victims table
CREATE TABLE IF NOT EXISTS public.victimas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  edad INTEGER,
  fecha_nacimiento DATE,
  profesion TEXT,
  redes_sociales TEXT,
  telefono_contacto_familiar TEXT,
  direccion_completa TEXT,
  nacionalidad TEXT,
  notas_adicionales TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incidents table (hechos)
CREATE TABLE IF NOT EXISTS public.hechos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victima_id UUID REFERENCES public.victimas(id) ON DELETE CASCADE,
  fecha_hecho DATE,
  fecha_fallecimiento DATE,
  provincia TEXT,
  municipio TEXT,
  lugar_especifico TEXT,
  resumen_hecho TEXT,
  numero_causa TEXT,
  caratula TEXT,
  email_fiscalia TEXT,
  telefono_fiscalia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accused persons table (imputados)
CREATE TABLE IF NOT EXISTS public.imputados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hecho_id UUID REFERENCES public.hechos(id) ON DELETE CASCADE,
  apellido_nombre TEXT,
  menor_edad BOOLEAN DEFAULT FALSE,
  nacionalidad TEXT,
  juzgado_ufi TEXT,
  estado_procesal TEXT,
  fecha_veredicto DATE,
  pena TEXT,
  juicio_abreviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trial dates table for multiple hearing dates
CREATE TABLE IF NOT EXISTS public.fechas_juicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imputado_id UUID REFERENCES public.imputados(id) ON DELETE CASCADE,
  fecha_audiencia DATE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follow-up table (seguimiento)
CREATE TABLE IF NOT EXISTS public.seguimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hecho_id UUID REFERENCES public.hechos(id) ON DELETE CASCADE,
  miembro_asignado TEXT,
  contacto_familia TEXT,
  notas_seguimiento TEXT,
  tipo_acompanamiento TEXT[], -- Array for multiple support types
  abogado_querellante TEXT,
  amicus_curiae BOOLEAN DEFAULT FALSE,
  como_llego_caso TEXT,
  primer_contacto BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table (recursos)
CREATE TABLE IF NOT EXISTS public.recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hecho_id UUID REFERENCES public.hechos(id) ON DELETE CASCADE,
  imputado_id UUID REFERENCES public.imputados(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  url TEXT,
  fuente TEXT,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases summary table for easier querying
CREATE TABLE IF NOT EXISTS public.casos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victima_id UUID REFERENCES public.victimas(id) ON DELETE CASCADE,
  hecho_id UUID REFERENCES public.hechos(id) ON DELETE CASCADE,
  numero_involucrados INTEGER DEFAULT 1,
  estado_general TEXT DEFAULT 'En Proceso',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.victimas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hechos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imputados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fechas_juicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since this is an internal NGO system)
-- Note: In a production environment, you might want more restrictive policies

-- Policies for victimas
CREATE POLICY "Allow all operations on victimas" ON public.victimas FOR ALL USING (true);

-- Policies for hechos
CREATE POLICY "Allow all operations on hechos" ON public.hechos FOR ALL USING (true);

-- Policies for imputados
CREATE POLICY "Allow all operations on imputados" ON public.imputados FOR ALL USING (true);

-- Policies for fechas_juicio
CREATE POLICY "Allow all operations on fechas_juicio" ON public.fechas_juicio FOR ALL USING (true);

-- Policies for seguimiento
CREATE POLICY "Allow all operations on seguimiento" ON public.seguimiento FOR ALL USING (true);

-- Policies for recursos
CREATE POLICY "Allow all operations on recursos" ON public.recursos FOR ALL USING (true);

-- Policies for casos
CREATE POLICY "Allow all operations on casos" ON public.casos FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hechos_victima_id ON public.hechos(victima_id);
CREATE INDEX IF NOT EXISTS idx_imputados_hecho_id ON public.imputados(hecho_id);
CREATE INDEX IF NOT EXISTS idx_fechas_juicio_imputado_id ON public.fechas_juicio(imputado_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_hecho_id ON public.seguimiento(hecho_id);
CREATE INDEX IF NOT EXISTS idx_recursos_hecho_id ON public.recursos(hecho_id);
CREATE INDEX IF NOT EXISTS idx_recursos_imputado_id ON public.recursos(imputado_id);
CREATE INDEX IF NOT EXISTS idx_casos_victima_id ON public.casos(victima_id);
CREATE INDEX IF NOT EXISTS idx_casos_hecho_id ON public.casos(hecho_id);
