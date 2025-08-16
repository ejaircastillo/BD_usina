import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating victim with data:', body)

    // Validaciones
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre de la víctima es requerido' },
        { status: 400 }
      )
    }

    // Insertar víctima en la base de datos
    const { data: victima, error } = await supabase
      .from('victimas')
      .insert({
        nombre: body.name,
        apellido: body.surname || '',
        fecha_nacimiento: body.birthDate || null,
        telefono: body.phone || null,
        email: body.email || null,
        direccion: body.address || null,
        genero: body.gender || null,
        estado_civil: body.maritalStatus || null,
        ocupacion: body.profession || null,
        observaciones: body.notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating victim:', error)
      return NextResponse.json(
        { error: 'Error al crear la víctima', details: error.message },
        { status: 500 }
      )
    }

    console.log('Victim created successfully:', victima.id)
    return NextResponse.json({ 
      victima,
      message: 'Víctima creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/victimas:', error)
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
        { error: 'ID de víctima requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('victimas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting victim:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la víctima', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Víctima eliminada exitosamente' })

  } catch (error) {
    console.error('Error in DELETE /api/victimas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
