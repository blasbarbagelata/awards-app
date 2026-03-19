import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, type, order } = body

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('PUT /api/admin/categories/[id] error:', error)
    return NextResponse.json({ error: 'Error al actualizar categoría.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/categories/[id] error:', error)
    return NextResponse.json({ error: 'Error al eliminar categoría.' }, { status: 500 })
  }
}
