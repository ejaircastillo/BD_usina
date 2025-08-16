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
    console.log('Received data:', JSON.stringify(body, null, 2))

    // Extraer datos por sección del formulario
    const { victim, incident, accused = [], followUp = {}, resources = [] } = body

    // Validar datos requeridos
    if (!victim?.name) {
      return NextResponse.json(
        { error: 'El nombre de la víctima es requerido' },
        { status: 400 }
      )
    }

    if (!incident?.date) {
      return NextResponse.json(
        { error: 'La fecha del hecho es requerida' },
        { status: 400 }
      )
    }

    // Iniciar transacción usando Supabase
    let victimId = null
    let hechoId = null
    let casoId = null

    // Paso 1: Crear víctima
    console.log('Creating victim with data:', victim)
    const { data: victimData, error: victimError } = await supabase
      .from('victimas')
      .insert({
        nombre: victim.name,
        apellido: victim.surname || '',
        fecha_nacimiento: victim.birthDate || null,
        telefono: victim.phone || null,
        email: victim.email || null,
        direccion: victim.address || null,
        profesion: victim.profession || null,
        observaciones: victim.notes || null
      })
      .select('id')
      .single()

    if (victimError) {
      console.error('Error creating victim:', victimError)
      return NextResponse.json(
        { error: 'Error al crear la víctima', details: victimError.message },
        { status: 500 }
      )
    }

    victimId = victimData.id
    console.log('Created victim with ID:', victimId)

    // Paso 2: Crear hecho
    console.log('Creating hecho with data:', incident)
    const { data: hechoData, error: hechoError } = await supabase
      .from('hechos')
      .insert({
        fecha_hecho: incident.date,
        hora_hecho: incident.time || null,
        lugar_hecho: incident.location || null,
        descripcion: incident.summary || null,
        tipo_delito: incident.type || null,
        observaciones: incident.notes || null
      })
      .select('id')
      .single()

    if (hechoError) {
      console.error('Error creating hecho:', hechoError)
      
      // Rollback: eliminar víctima creada
      await supabase
        .from('victimas')
        .delete()
        .eq('id', victimId)

      return NextResponse.json(
        { error: 'Error al crear el hecho', details: hechoError.message },
        { status: 500 }
      )
    }

    hechoId = hechoData.id
    console.log('Created hecho with ID:', hechoId)

    // Paso 3: Crear caso principal
    console.log('Creating caso with victim ID:', victimId, 'and hecho ID:', hechoId)
    const { data: casoData, error: casoError } = await supabase
      .from('casos')
      .insert({
        estado: incident.status || 'Iniciado',
        id_victima: victimId,
        id_hecho: hechoId,
        id_interno: body.id_interno || null,
        numero_expediente: body.numero_expediente || null
      })
      .select(`
        *,
        victimas (*),
        hechos (*)
      `)
      .single()

    if (casoError) {
      console.error('Error creating caso:', casoError)
      
      // Rollback: eliminar registros creados
      await supabase.from('hechos').delete().eq('id', hechoId)
      await supabase.from('victimas').delete().eq('id', victimId)

      return NextResponse.json(
        { error: 'Error al crear el caso', details: casoError.message },
        { status: 500 }
      )
    }

    casoId = casoData.id
    console.log('Created caso with ID:', casoId)

    // Transformar el caso para la respuesta
    const casoTransformado = {
      id: casoData.id,
      id_interno: casoData.id_interno,
      numero_expediente: casoData.numero_expediente,
      estado: casoData.estado,
      status: casoData.estado,
      created_at: casoData.created_at,
      updated_at: casoData.updated_at,
      
      // Datos de la víctima
      victim_name: casoData.victimas?.nombre,
      victimName: casoData.victimas?.nombre,
      victim_birth_date: casoData.victimas?.fecha_nacimiento,
      victim_profession: casoData.victimas?.profesion,
      
      // Datos del hecho
      incident_date: casoData.hechos?.fecha_hecho,
      incidentDate: casoData.hechos?.fecha_hecho,
      incident_location: casoData.hechos?.lugar_hecho,
      location: casoData.hechos?.lugar_hecho,
      incident_summary: casoData.hechos?.descripcion,
      
      // Datos completos para acceso directo
      victimas: casoData.victimas,
      hechos: casoData.hechos
    }

    console.log('Successfully created caso:', casoTransformado.id)

    return NextResponse.json({ 
      caso: casoTransformado,
      message: 'Caso creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/casos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
