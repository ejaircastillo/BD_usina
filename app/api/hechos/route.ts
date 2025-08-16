import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating hecho with data:', body)

    // Validaciones
    if (!body.date) {
      return NextResponse.json(
        { error: 'La fecha del hecho es requerida' },
        { status: 400 }
      )
    }

    // Insertar hecho en la base de datos
    const { data: hecho, error } = await supabase
      .from('hechos')
      .insert({
        fecha_hecho: body.date,
        hora_hecho: body.time || null,
        lugar_hecho: body.location || null,
        descripcion: body.summary || null,
        tipo_delito: body.type || null,
        modalidad: body.modality || null,
        circunstancias: body.circumstances || null,
        testigos: body.witnesses || null,
        evidencias: body.evidence || null,
        denuncia_previa: body.previousComplaint || false,
        observaciones: body.notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating hecho:', error)
      return NextResponse.json(
        { error: 'Error al crear el hecho', details: error.message },
        { status: 500 }
      )
    }

    console.log('Hecho created successfully:', hecho.id)
    return NextResponse.json({ 
      hecho,
      message: 'Hecho creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/hechos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'ID de hecho requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('hechos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting hecho:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el hecho', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Hecho eliminado exitosamente' })

  } catch (error) {
    console.error('Error in DELETE /api/hechos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
