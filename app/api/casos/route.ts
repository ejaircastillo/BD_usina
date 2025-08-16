import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extraer parámetros de búsqueda
    const status = searchParams.get('status')
    const province = searchParams.get('province')
    const location = searchParams.get('location')
    const assignedMember = searchParams.get('assignedMember')
    const searchTerm = searchParams.get('searchTerm')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Construir consulta base con JOINs
    let query = supabase
      .from('casos')
      .select(`
        *,
        victimas (*),
        hechos (*)
      `)
      .order('created_at', { ascending: false })

    // Aplicar filtros dinámicamente
    if (status) {
      query = query.eq('estado', status)
    }

    if (searchTerm) {
      // Buscar en id_interno y numero_expediente
      query = query.or(`id_interno.ilike.%${searchTerm}%,numero_expediente.ilike.%${searchTerm}%`)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data: casos, error } = await query

    if (error) {
      console.error('Error fetching casos:', error)
      return NextResponse.json(
        { error: 'Error al obtener los casos', details: error.message },
        { status: 500 }
      )
    }

    // Transformar los datos para que coincidan con la estructura esperada por los componentes
    const casosTransformados = casos?.map(caso => ({
      id: caso.id,
      // Datos del caso
      id_interno: caso.id_interno,
      numero_expediente: caso.numero_expediente,
      estado: caso.estado,
      status: caso.estado, // Alias para compatibilidad
      created_at: caso.created_at,
      updated_at: caso.updated_at,
      
      // Datos de la víctima
      victim_name: caso.victimas?.nombre,
      victimName: caso.victimas?.nombre, // Alias para compatibilidad
      victim_birth_date: caso.victimas?.fecha_nacimiento,
      victim_profession: caso.victimas?.profesion,
      
      // Datos del hecho
      incident_date: caso.hechos?.fecha_hecho,
      incidentDate: caso.hechos?.fecha_hecho, // Alias para compatibilidad
      incident_location: caso.hechos?.lugar_hecho,
      location: caso.hechos?.lugar_hecho, // Alias para compatibilidad
      incident_summary: caso.hechos?.descripcion,
      
      // Datos completos para acceso directo
      victimas: caso.victimas,
      hechos: caso.hechos
    })) || []

    return NextResponse.json({ casos: casosTransformados })
  } catch (error) {
    console.error('Error in GET /api/casos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating caso with data:', body)

    // Validaciones
    if (!body.id_victima || !body.id_hecho) {
      return NextResponse.json(
        { error: 'ID de víctima y hecho son requeridos' },
        { status: 400 }
      )
    }

    // Crear caso vinculando víctima y hecho
    const { data: caso, error } = await supabase
      .from('casos')
      .insert({
        id_victima: body.id_victima,
        id_hecho: body.id_hecho,
        estado: body.estado || 'Iniciado',
        id_interno: body.id_interno || null,
        numero_expediente: body.numero_expediente || null
      })
      .select(`
        *,
        victimas (*),
        hechos (*)
      `)
      .single()

    if (error) {
      console.error('Error creating caso:', error)
      return NextResponse.json(
        { error: 'Error al crear el caso', details: error.message },
        { status: 500 }
      )
    }

    console.log('Caso created successfully:', caso.id)

    // Transformar para compatibilidad
    const casoTransformado = {
      id: caso.id,
      id_interno: caso.id_interno,
      numero_expediente: caso.numero_expediente,
      estado: caso.estado,
      status: caso.estado,
      created_at: caso.created_at,
      updated_at: caso.updated_at,
      
      // Datos de la víctima
      victim_name: caso.victimas?.nombre,
      victimName: caso.victimas?.nombre,
      victim_birth_date: caso.victimas?.fecha_nacimiento,
      victim_profession: caso.victimas?.ocupacion,
      
      // Datos del hecho
      incident_date: caso.hechos?.fecha_hecho,
      incidentDate: caso.hechos?.fecha_hecho,
      incident_location: caso.hechos?.lugar_hecho,
      location: caso.hechos?.lugar_hecho,
      incident_summary: caso.hechos?.descripcion,
      
      // Datos completos
      victimas: caso.victimas,
      hechos: caso.hechos
    }

    return NextResponse.json({ 
      caso: casoTransformado,
      message: 'Caso creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/casos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
