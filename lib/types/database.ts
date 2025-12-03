// Tipos TypeScript para las tablas de la base de datos
// Estos tipos reflejan la estructura de Supabase (snake_case)

export interface Victima {
  id: string
  nombre_completo: string
  edad: number | null
  fecha_nacimiento: string | null
  profesion: string | null
  nacionalidad: string | null
  direccion_completa: string | null
  telefono_contacto_familiar: string | null
  redes_sociales: string | null
  notas_adicionales: string | null
  provincia_residencia: string | null
  municipio_residencia: string | null
  created_at: string
  updated_at: string
}

export interface Hecho {
  id: string
  victima_id: string
  fecha_hecho: string | null
  fecha_fallecimiento: string | null
  municipio: string | null
  provincia: string | null
  lugar_especifico: string | null
  resumen_hecho: string | null
  caratula: string | null
  numero_causa: string | null
  telefono_fiscalia: string | null
  email_fiscalia: string | null
  tipo_crimen: string | null
  tipo_arma: string | null
  tipo_lugar: string | null
  lugar_otro: string | null
  localidad_barrio: string | null
  created_at: string
  updated_at: string
}

export interface Caso {
  id: string
  victima_id: string
  hecho_id: string
  estado_general: string | null
  numero_involucrados: number | null
  created_at: string
  updated_at: string
}

export interface Imputado {
  id: string
  hecho_id: string
  apellido_nombre: string
  nacionalidad: string | null
  menor_edad: boolean | null
  estado_procesal: string | null
  juzgado_ufi: string | null
  juicio_abreviado: boolean | null
  pena: string | null
  prision_perpetua: boolean | null
  fecha_veredicto: string | null
  documento_identidad: string | null
  tribunal_fallo: string | null
  es_extranjero: boolean | null
  detenido_previo: boolean | null
  fallecido: boolean | null
  es_reincidente: boolean | null
  alias: string | null
  edad: string | null
  cargos: string | null
  created_at: string
  updated_at: string
}

export interface FechaJuicio {
  id: string
  imputado_id: string
  fecha_audiencia: string | null
  descripcion: string | null
  created_at: string
  updated_at: string
}

export interface Seguimiento {
  id: string
  hecho_id: string
  primer_contacto: string | null
  como_llego_caso: string | null
  miembro_asignado: string | null
  contacto_familia: string | null
  tipo_acompanamiento: string | null
  abogado_querellante: string | null
  amicus_curiae: boolean | null
  notas_seguimiento: string | null
  telefono_contacto: string | null
  email_contacto: string | null
  direccion_contacto: string | null
  telefono_miembro: string | null
  email_miembro: string | null
  fecha_asignacion: string | null
  proximas_acciones: string | null
  created_at: string
  updated_at: string
}

export interface Recurso {
  id: string
  hecho_id: string
  imputado_id: string | null
  tipo: string | null
  titulo: string | null
  descripcion: string | null
  url: string | null
  fuente: string | null
  archivo_path: string | null
  archivo_nombre: string | null
  archivo_tipo: string | null
  archivo_size: number | null
  created_at: string
  updated_at: string
}

// Tipos para INSERT (sin id ni timestamps automáticos)
export type VictimaInsert = Omit<Victima, "id" | "created_at" | "updated_at">
export type HechoInsert = Omit<Hecho, "id" | "created_at" | "updated_at">
export type CasoInsert = Omit<Caso, "id" | "created_at" | "updated_at">
export type ImputadoInsert = Omit<Imputado, "id" | "created_at" | "updated_at">
export type FechaJuicioInsert = Omit<FechaJuicio, "id" | "created_at" | "updated_at">
export type SeguimientoInsert = Omit<Seguimiento, "id" | "created_at" | "updated_at">
export type RecursoInsert = Omit<Recurso, "id" | "created_at" | "updated_at">

// Tipos para UPDATE (todos los campos opcionales excepto id)
export type VictimaUpdate = Partial<VictimaInsert>
export type HechoUpdate = Partial<HechoInsert>
export type CasoUpdate = Partial<CasoInsert>
export type ImputadoUpdate = Partial<ImputadoInsert>
export type FechaJuicioUpdate = Partial<FechaJuicioInsert>
export type SeguimientoUpdate = Partial<SeguimientoInsert>
export type RecursoUpdate = Partial<RecursoInsert>

// Tipos con relaciones (para queries con joins)
export interface HechoConVictima extends Hecho {
  victimas: Victima
}

export interface CasoCompleto extends Caso {
  victimas: Victima
  hechos: HechoConVictima
}

export interface ImputadoConFechas extends Imputado {
  fechas_juicio: FechaJuicio[]
}

export interface InstanciaJudicial {
  id: string
  hecho_id: string
  numero_causa: string | null
  fiscal_fiscalia: string | null
  caratula: string | null
  orden_nivel: string | null
  created_at: string
  updated_at: string
}

export type InstanciaJudicialInsert = Omit<InstanciaJudicial, "id" | "created_at" | "updated_at">
export type InstanciaJudicialUpdate = Partial<InstanciaJudicialInsert>
