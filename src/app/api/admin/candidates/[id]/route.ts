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
    const { name, isActive } = body

    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('PUT /api/admin/candidates/[id] error:', error)
    return NextResponse.json({ error: 'Error al actualizar candidato.' }, { status: 500 })
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
    await prisma.candidate.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/candidates/[id] error:', error)
    return NextResponse.json({ error: 'Error al eliminar candidato.' }, { status: 500 })
  }
}
