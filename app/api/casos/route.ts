import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

console.log('Environment variables check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extraer parámetros de búsqueda
    const status = searchParams.get('status')
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
        { error: 'Error al obtener los casos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ casos })
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

    const { data: caso, error } = await supabase
      .from('casos')
      .insert([{
        id_interno: body.id_interno || null,
        numero_expediente: body.numero_expediente || null,
        estado: body.estado || 'Iniciado',
        id_victima: body.id_victima || null,
        id_hecho: body.id_hecho || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating caso:', error)
      return NextResponse.json(
        { error: 'Error al crear el caso' },
        { status: 500 }
      )
    }

    return NextResponse.json({ caso }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/casos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
