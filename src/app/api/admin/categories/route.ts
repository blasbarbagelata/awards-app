import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('GET /api/admin/categories error:', error)
    return NextResponse.json({ error: 'Error al obtener categorías.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, type = 'normal', order = 0 } = body

    if (!name || !description) {
      return NextResponse.json({ error: 'Nombre y descripción son requeridos.' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name, description, type, order },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/categories error:', error)
    return NextResponse.json({ error: 'Error al crear categoría.' }, { status: 500 })
  }
}
